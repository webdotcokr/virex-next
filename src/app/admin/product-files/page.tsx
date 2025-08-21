'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

// Searchable Select 컴포넌트
interface SearchableSelectProps {
  options: { id: number; title: string; file_name?: string }[]
  value: number | null
  onChange: (value: number | null) => void
  placeholder: string
}

function SearchableSelect({ options, value, onChange, placeholder }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options
    
    const searchLower = search.toLowerCase()
    return options.filter(option => 
      option.title.toLowerCase().includes(searchLower) ||
      (option.file_name && option.file_name.toLowerCase().includes(searchLower))
    )
  }, [options, search])
  
  const selectedOption = options.find(opt => opt.id === value)
  
  return (
    <div className="relative">
      <div 
        className="w-full p-2 border rounded cursor-pointer bg-white flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'text-black' : 'text-gray-500'}>
          {selectedOption ? selectedOption.title : placeholder}
        </span>
        <span className="text-gray-400">▼</span>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-hidden">
          {/* 검색 입력 */}
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="파일 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {/* 옵션 목록 */}
          <div className="max-h-48 overflow-y-auto">
            <div 
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-500"
              onClick={() => {
                onChange(null)
                setIsOpen(false)
                setSearch('')
              }}
            >
              선택 해제
            </div>
            
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">
                검색 결과가 없습니다
              </div>
            ) : (
              filteredOptions.map(option => (
                <div
                  key={option.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    onChange(option.id)
                    setIsOpen(false)
                    setSearch('')
                  }}
                >
                  <div className="font-medium text-sm">{option.title}</div>
                  {option.file_name && (
                    <div className="text-xs text-gray-500">({option.file_name})</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface Product {
  id: number
  part_number: string
  category_id: number
  catalog_file_id?: number | null
  datasheet_file_id?: number | null
  manual_file_id?: number | null
  drawing_file_id?: number | null
}

interface Download {
  id: number
  title: string
  file_name?: string
  category_id: number
}

interface Category {
  id: number
  name: string
}

// 카테고리 ID to 테이블명 매핑 (ProductService에서 가져옴)
const CATEGORY_TABLE_MAPPING: Record<number, string> = {
  9: 'products_cis',        // CIS
  10: 'products_tdi',       // TDI
  11: 'products_line',      // Line
  12: 'products_area',      // Area
  13: 'products_invisible', // Invisible
  14: 'products_scientific',// Scientific
  15: 'products_large_format_lens', // Large Format Lens
  16: 'products_telecentric',       // Telecentric
  17: 'products_fa_lens',           // FA Lens
  18: 'products_3d_laser_profiler', // 3D Laser Profiler
  19: 'products_3d_stereo_camera',  // 3D Stereo Camera
  20: 'products_light',             // Light
  21: 'products_af_module',         // AF Module
  22: 'products_controller',        // Controller
  23: 'products_frame_grabber',     // Frame Grabber
  24: 'products_gige_lan_card',     // GigE LAN Card
  25: 'products_usb_card',          // USB Card
  7: 'products_software',           // Software
  26: 'products_cable',             // Cable
  27: 'products_accessory'          // Accessory
}

const CATEGORY_NAMES: Record<number, string> = {
  9: 'CIS',
  10: 'TDI',
  11: 'Line',
  12: 'Area',
  13: 'Invisible',
  14: 'Scientific',
  15: 'Large Format Lens',
  16: 'Telecentric',
  17: 'FA Lens',
  18: '3D Laser Profiler',
  19: '3D Stereo Camera',
  20: 'Light',
  21: 'AF Module',
  22: 'Controller',
  23: 'Frame Grabber',
  24: 'GigE LAN Card',
  25: 'USB Card',
  7: 'Software',
  26: 'Cable',
  27: 'Accessory'
}

export default function ProductFilesManagementPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [totalProductCount, setTotalProductCount] = useState<number>(0)
  const [downloads, setDownloads] = useState<Download[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(9) // 기본값: CIS
  const [editData, setEditData] = useState({
    catalog_file_id: null as number | null,
    datasheet_file_id: null as number | null,
    manual_file_id: null as number | null,
    drawing_file_id: null as number | null
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [productSearch, setProductSearch] = useState('')

  // 사용 가능한 카테고리 목록
  const availableCategories = useMemo(() => {
    return Object.entries(CATEGORY_TABLE_MAPPING).map(([id, tableName]) => ({
      id: parseInt(id),
      name: CATEGORY_NAMES[parseInt(id)] || `Category ${id}`,
      tableName
    }))
  }, [])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedCategoryId) {
      loadProductsByCategory(selectedCategoryId)
    }
  }, [selectedCategoryId])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load downloads
      const { data: downloadsData, error: downloadsError } = await supabase
        .from('downloads')
        .select('id, title, file_name, category_id')
        .order('title')

      if (downloadsError) throw downloadsError
      setDownloads(downloadsData || [])

      // Load products for the selected category
      await loadProductsByCategory(selectedCategoryId)

    } catch (error) {
      console.error('Error loading data:', error)
      setMessage('데이터 로딩 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const loadProductsByCategory = async (categoryId: number) => {
    try {
      const tableName = CATEGORY_TABLE_MAPPING[categoryId]
      if (!tableName) {
        setMessage(`카테고리 ID ${categoryId}에 해당하는 테이블을 찾을 수 없습니다.`)
        return
      }

      // 제품 데이터 조회 (모든 제품)
      const { data: categoryProducts, error } = await supabase
        .from(tableName)
        .select('id, part_number, catalog_file_id, datasheet_file_id, manual_file_id, drawing_file_id')
        .eq('is_active', true)
        .order('part_number')

      if (error) {
        console.error(`Error loading ${tableName}:`, error)
        setMessage(`${CATEGORY_NAMES[categoryId]} 제품 로딩 중 오류가 발생했습니다.`)
        return
      }

      // Add category_id to products
      const productsWithCategory = categoryProducts?.map(p => ({
        ...p,
        category_id: categoryId
      })) || []

      setProducts(productsWithCategory)
      setTotalProductCount(productsWithCategory.length)
      setSelectedProduct(null) // 카테고리 변경 시 선택 해제

    } catch (error) {
      console.error('Error loading products by category:', error)
      setMessage('제품 로딩 중 오류가 발생했습니다.')
    }
  }

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setEditData({
      catalog_file_id: product.catalog_file_id || null,
      datasheet_file_id: product.datasheet_file_id || null,
      manual_file_id: product.manual_file_id || null,
      drawing_file_id: product.drawing_file_id || null
    })
  }

  const handleSave = async () => {
    if (!selectedProduct) return

    try {
      setSaving(true)
      
      const tableName = CATEGORY_TABLE_MAPPING[selectedProduct.category_id]
      if (!tableName) {
        setMessage('해당 카테고리의 테이블을 찾을 수 없습니다.')
        return
      }

      // Update product with file references
      const { error } = await supabase
        .from(tableName)
        .update(editData)
        .eq('id', selectedProduct.id)

      if (error) {
        console.error('Save error:', error)
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          setMessage('파일 연결 저장 중 오류가 발생했습니다. DB 스키마 마이그레이션이 먼저 필요합니다.')
        } else {
          setMessage('파일 연결 저장 중 오류가 발생했습니다: ' + error.message)
        }
      } else {
        setMessage('파일 연결이 성공적으로 저장되었습니다.')
        // Refresh product data
        setSelectedProduct({ ...selectedProduct, ...editData })
        // Refresh the products list to show updated data
        await loadProductsByCategory(selectedProduct.category_id)
      }
    } catch (error) {
      console.error('Error saving:', error)
      setMessage('저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const filterDownloadsByType = (type: string) => {
    // You can implement category-based filtering here if needed
    return downloads
  }

  // 제품 검색 필터링
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products
    
    const searchLower = productSearch.toLowerCase()
    return products.filter(product => 
      product.part_number.toLowerCase().includes(searchLower)
    )
  }, [products, productSearch])

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">제품-파일 연결 관리</h1>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">제품-파일 연결 관리</h1>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('오류') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* 카테고리 탭 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 overflow-x-auto">
            {availableCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedCategoryId === category.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 제품 목록 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              제품 목록 ({CATEGORY_NAMES[selectedCategoryId]})
            </h2>
            <span className="text-sm text-gray-500">
              {productSearch ? (
                `검색 결과: ${filteredProducts.length}개`
              ) : (
                `총 ${totalProductCount.toLocaleString()}개`
              )}
            </span>
          </div>
          
          {/* 제품 검색 */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="제품 번호로 검색..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {productSearch ? '검색 결과가 없습니다.' : '제품이 없습니다.'}
              </div>
            ) : (
              filteredProducts.map(product => (
                <div
                  key={product.id}
                  className={`p-3 border rounded mb-2 cursor-pointer transition-colors ${
                    selectedProduct?.id === product.id 
                      ? 'bg-blue-50 border-blue-300' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="font-medium">{product.part_number}</div>
                  <div className="text-sm text-gray-600">ID: {product.id}</div>
                  {/* 연결된 파일 수 표시 */}
                  <div className="text-xs text-gray-500 mt-1">
                    연결된 파일: {[
                      product.catalog_file_id,
                      product.datasheet_file_id,
                      product.manual_file_id,
                      product.drawing_file_id
                    ].filter(Boolean).length}/4
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 파일 연결 편집 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">파일 연결 편집</h2>
          
          {selectedProduct ? (
            <div>
              <div className="mb-4 p-3 bg-blue-50 rounded">
                <div className="font-medium">선택된 제품: {selectedProduct.part_number}</div>
              </div>

              <div className="space-y-6">
                {/* 카달로그 */}
                <div>
                  <label className="block text-sm font-medium mb-2">📋 카달로그</label>
                  <SearchableSelect
                    options={filterDownloadsByType('catalog')}
                    value={editData.catalog_file_id}
                    onChange={(value) => setEditData(prev => ({ ...prev, catalog_file_id: value }))}
                    placeholder="카달로그 파일을 선택하세요"
                  />
                </div>

                {/* 제안서 */}
                <div>
                  <label className="block text-sm font-medium mb-2">📄 제안서</label>
                  <SearchableSelect
                    options={filterDownloadsByType('datasheet')}
                    value={editData.datasheet_file_id}
                    onChange={(value) => setEditData(prev => ({ ...prev, datasheet_file_id: value }))}
                    placeholder="제안서 파일을 선택하세요"
                  />
                </div>

                {/* 메뉴얼 */}
                <div>
                  <label className="block text-sm font-medium mb-2">📖 메뉴얼</label>
                  <SearchableSelect
                    options={filterDownloadsByType('manual')}
                    value={editData.manual_file_id}
                    onChange={(value) => setEditData(prev => ({ ...prev, manual_file_id: value }))}
                    placeholder="메뉴얼 파일을 선택하세요"
                  />
                </div>

                {/* 도면 (회원전용) */}
                <div>
                  <label className="block text-sm font-medium mb-2">🔒 도면 (회원전용)</label>
                  <SearchableSelect
                    options={filterDownloadsByType('drawing')}
                    value={editData.drawing_file_id}
                    onChange={(value) => setEditData(prev => ({ ...prev, drawing_file_id: value }))}
                    placeholder="도면 파일을 선택하세요"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    도면 파일은 회원 전용으로 설정됩니다.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium transition-colors"
                >
                  {saving ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      저장 중...
                    </span>
                  ) : (
                    '파일 연결 저장'
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setSelectedProduct(null)
                    setEditData({
                      catalog_file_id: null,
                      datasheet_file_id: null,
                      manual_file_id: null,
                      drawing_file_id: null
                    })
                  }}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📁</div>
              <p className="text-lg font-medium">제품을 선택하세요</p>
              <p className="text-sm">좌측 제품 목록에서 파일을 연결할 제품을 선택해주세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}