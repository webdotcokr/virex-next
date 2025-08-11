'use client'

import { Suspense, useEffect, useState, useCallback, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFilterStore } from '@/lib/store'
import { httpQueries } from '@/lib/http-supabase'
import { CategoryService } from '@/domains/product/services/category-service'
import ProductsPageLayout from '@/domains/product/components/ProductsPageLayout'
import CategoryTabs from '@/domains/product/components/CategoryTabs'
import ProductTable from '@/domains/product/components/ProductTable'
import ProductSortBar from '@/domains/product/components/ProductSortBar'
import FilterSidebar from '@/domains/product/components/FilterSidebar'
import FloatingActionButtons from '@/domains/product/components/FloatingActionButtons'
import ComparisonLimitModal from '@/domains/product/components/ComparisonLimitModal'
import ProductComparisonModal from '@/components/ProductComparisonModal'
import ProductGridSkeleton from '@/domains/product/components/ProductGridSkeleton'
import styles from './products.module.css'
import type { Product, Category } from '@/domains/product/types'

// 카테고리 ID와 테이블 매핑
const CATEGORY_TABLE_MAP: Record<string, string> = {
  '9': 'products_cis',      // CIS Camera
  '10': 'products_tdi',     // TDI Camera  
  '11': 'products_line',    // Line Camera
  '12': 'products_area',    // Area Camera
  '13': 'products_invisible', // Invisible Camera
  '14': 'products_scientific', // Scientific Camera
  '15': 'products_large_format_lens', // Large Format Lens
  '16': 'products_telecentric', // Telecentric Lens
  '17': 'products_fa_lens', // FA Lens
  '18': 'products_3d_laser_profiler', // 3D Laser Profiler
  '19': 'products_3d_stereo_camera', // 3D Stereo Camera
  '20': 'products_light', // Light
  '21': 'products_controller', // Light sources → Controller로 매핑
  '22': 'products_controller', // Controller
  '23': 'products_frame_grabber', // Frame Grabber
  '24': 'products_gige_lan_card', // GigE Lan Card
  '25': 'products_usb_card', // USB Card
  '26': 'products_cable', // Cable
  '27': 'products_accessory', // Accessory
  '4': 'products_af_module', // AF Module
  '7': 'products_software' // Software
}

// 카테고리 ID → 이름 매핑
const CATEGORY_NAME_MAP: Record<string, string> = {
  '9': 'CIS',     // CIS Camera
  '10': 'TDI',    // TDI Camera  
  '11': 'Line',   // Line Camera
  '12': 'Area',   // Area Camera
  '13': 'Invisible', // Invisible Camera
  '14': 'Scientific', // Scientific Camera
  '15': 'Large Format', // Large Format Lens
  '16': 'Telecentric', // Telecentric Lens
  '17': 'FA Lens', // FA Lens
  '18': '3D Laser Profiler', // 3D Laser Profiler
  '19': '3D Stereo Camera', // 3D Stereo Camera
  '20': 'Light', // Light
  '21': 'Controller', // Light sources → Controller로 매핑
  '22': 'Controller', // Controller
  '23': 'Frame Grabber', // Frame Grabber
  '24': 'GigE Lan Card', // GigE Lan Card
  '25': 'USB Card', // USB Card
  '26': 'Cable', // Cable
  '27': 'Accessory', // Accessory
  '4': 'Auto Focus Module', // AF Module
  '7': 'Software' // Software
}

// Mock 카테고리 정보 (백업에서 가져온 구조 유지)
const getCategoryInfo = (categoryId: string) => {
  return {
    id: categoryId,
    name: CATEGORY_NAME_MAP[categoryId] || 'CIS',
    enName: CATEGORY_NAME_MAP[categoryId] || 'CIS',
    description: `${CATEGORY_NAME_MAP[categoryId] || 'CIS'} 제품 목록`,
    backgroundImage: '/img/backgrounds/camera-cis-bg.png'
  }
}

// 카테고리 그룹 정의 (parent_id 기반)
const CATEGORY_GROUPS: Record<string, Category[]> = {
  // 카메라 그룹 (parent_id: 2)
  cameras: [
    { id: '9', name: 'CIS', enName: 'CIS', slug: 'cis' },
    { id: '10', name: 'TDI', enName: 'TDI', slug: 'tdi' },
    { id: '11', name: 'Line', enName: 'Line', slug: 'line' },
    { id: '12', name: 'Area', enName: 'Area', slug: 'area' },
    { id: '13', name: 'Invisible', enName: 'Invisible', slug: 'invisible' },
    { id: '14', name: 'Scientific', enName: 'Scientific', slug: 'scientific' }
  ],
  // 렌즈 그룹 (parent_id: 3)
  lenses: [
    { id: '15', name: 'Large Format', enName: 'Large Format', slug: 'large-format' },
    { id: '16', name: 'Telecentric', enName: 'Telecentric', slug: 'telecentric' },
    { id: '17', name: 'FA Lens', enName: 'FA Lens', slug: 'fa-lens' }
  ],
  // 3D 그룹
  '3d': [
    { id: '18', name: '3D Laser Profiler', enName: '3D Laser Profiler', slug: '3d-laser-profiler' },
    { id: '19', name: '3D Stereo Camera', enName: '3D Stereo Camera', slug: '3d-stereo-camera' }
  ],
  // 조명 및 컨트롤러 그룹
  lighting: [
    { id: '20', name: 'Light', enName: 'Light', slug: 'light' },
    { id: '21', name: 'Controller', enName: 'Controller', slug: 'controller' },
    { id: '22', name: 'Controller', enName: 'Controller', slug: 'controller' }
  ],
  // 인터페이스 카드 그룹
  interface: [
    { id: '23', name: 'Frame Grabber', enName: 'Frame Grabber', slug: 'frame-grabber' },
    { id: '24', name: 'GigE Lan Card', enName: 'GigE Lan Card', slug: 'gige-lan-card' },
    { id: '25', name: 'USB Card', enName: 'USB Card', slug: 'usb-card' }
  ],
  // 액세서리 그룹
  accessories: [
    { id: '26', name: 'Cable', enName: 'Cable', slug: 'cable' },
    { id: '27', name: 'Accessory', enName: 'Accessory', slug: 'accessory' }
  ],
  // 기타
  others: [
    { id: '4', name: 'Auto Focus Module', enName: 'Auto Focus Module', slug: 'af-module' },
    { id: '7', name: 'Software', enName: 'Software', slug: 'software' }
  ]
}

// 카테고리 ID로 그룹 찾기
const getCategoryGroup = (categoryId: string): string => {
  for (const [groupName, categories] of Object.entries(CATEGORY_GROUPS)) {
    if (categories.some(cat => cat.id === categoryId)) {
      return groupName
    }
  }
  return 'cameras' // 기본값
}

// 카테고리 ID로 형제 카테고리 가져오기
const getSiblingCategories = (categoryId: string): Category[] => {
  const groupName = getCategoryGroup(categoryId)
  return CATEGORY_GROUPS[groupName] || CATEGORY_GROUPS.cameras
}

// Mock 브레드크럼 생성
const getBreadcrumbs = (categoryId: string) => {
  const categoryName = CATEGORY_NAME_MAP[categoryId] || 'CIS'
  return [
    { label: 'Home', href: '/' },
    { label: '제품', href: '/products' },
    { label: categoryName, active: true }
  ]
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const { filters, setFiltersFromUrl } = useFilterStore()
  const [products, setProducts] = useState<Product[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [sortBy, setSortBy] = useState<string>('part_number')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [showComparisonLimitModal, setShowComparisonLimitModal] = useState(false)
  const [showComparisonModal, setShowComparisonModal] = useState(false)
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([])
  const [seriesMap, setSeriesMap] = useState<Map<number, string>>(new Map())

  // Initialize filters from URL on component mount
  useEffect(() => {
    setFiltersFromUrl(searchParams)
    
    // Initialize sort parameters from URL
    const sortParam = searchParams.get('sort')
    const orderParam = searchParams.get('order')
    
    if (sortParam) {
      setSortBy(sortParam)
    }
    if (orderParam && (orderParam === 'asc' || orderParam === 'desc')) {
      setSortDirection(orderParam)
    }
  }, [searchParams, setFiltersFromUrl])

  // 현재 선택된 카테고리 정보
  const currentCategoryId = filters.categories.length > 0 ? filters.categories[0] : '9'
  const fallbackCategoryInfo = getCategoryInfo(currentCategoryId) // Mock 데이터 (fallback)
  const breadcrumbs = getBreadcrumbs(currentCategoryId)
  const siblingCategories = getSiblingCategories(currentCategoryId)
  
  // 카테고리 정보 state (초기값으로 fallback 사용)
  const [categoryInfo, setCategoryInfo] = useState(fallbackCategoryInfo)
  const [isPending, startTransition] = useTransition()
  
  // DB에서 카테고리 정보 로드
  useEffect(() => {
    let mounted = true // cleanup을 위한 플래그
    
    const loadCategoryInfo = async () => {
      // 먼저 fallback 데이터로 즉시 업데이트 (텍스트는 즉시 변경)
      const fallback = getCategoryInfo(currentCategoryId)
      
      // 즉시 텍스트 업데이트 (배경은 유지)
      setCategoryInfo(prev => ({
        ...fallback,
        backgroundImage: prev.backgroundImage // 이전 배경 유지
      }))
      
      try {
        const dbCategory: any = await CategoryService.getCategoryById(currentCategoryId)
        
        // 컴포넌트가 언마운트되었거나 카테고리가 변경된 경우 무시
        if (!mounted) return
        
        if (dbCategory) {
          // DB 데이터를 Hero Section 형식에 맞게 변환
          const newInfo = {
            id: dbCategory.id,
            name: dbCategory.title_ko || dbCategory.name,
            enName: dbCategory.title_en || dbCategory.name,
            description: dbCategory.description || `${dbCategory.name} 제품 목록`,
            backgroundImage: dbCategory.background_image || fallback.backgroundImage
          }
          
          // 부드러운 전환을 위해 startTransition 사용
          startTransition(() => {
            if (mounted) {
              setCategoryInfo(newInfo)
            }
          })
        }
      } catch (err) {
        console.error('Failed to load category info:', err)
        // 에러 발생 시에도 fallback 데이터는 이미 설정됨
        if (mounted) {
          startTransition(() => {
            setCategoryInfo(fallback)
          })
        }
      }
    }
    
    loadCategoryInfo()
    
    // Cleanup 함수
    return () => {
      mounted = false
    }
  }, [currentCategoryId])

  // Series 데이터 로딩 및 매핑 함수
  const loadSeriesData = useCallback(async () => {
    try {
      console.log('🔄 Loading series data for mapping...')
      
      const { data, error } = await httpQueries.getAllSeries()
      
      if (error) {
        console.warn('⚠️ Failed to load series data:', error.message || error)
        // 에러가 있어도 빈 Map으로 초기화하여 앱이 계속 동작하도록 함
        setSeriesMap(new Map())
        return
      }
      
      if (!data || data.length === 0) {
        console.warn('⚠️ No series data found, using empty mapping')
        setSeriesMap(new Map())
        return
      }

      // Map 생성: series ID -> series_name
      const newSeriesMap = new Map<number, string>()
      data.forEach((series: any) => {
        if (series.id && series.series_name) {
          newSeriesMap.set(series.id, series.series_name)
        }
      })
      
      setSeriesMap(newSeriesMap)
      console.log(`✅ Series data loaded: ${newSeriesMap.size} series mapped`)
      
    } catch (err) {
      console.error('❌ Failed to load series data:', err)
      // 예외가 발생해도 빈 Map으로 초기화
      setSeriesMap(new Map())
    }
  }, [])

  // 앱 시작 시 한 번만 series 데이터 로드
  useEffect(() => {
    loadSeriesData()
  }, [loadSeriesData])

  // HTTP 기반 제품 로딩 함수
  const loadProducts = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🌐 HTTP VERSION: Loading products...', { 
        categoryId: currentCategoryId, 
        page, 
        itemsPerPage, 
        sortBy, 
        sortDirection,
        search: filters.search 
      })
      
      // 카테고리에 해당하는 테이블 가져오기
      const tableName = CATEGORY_TABLE_MAP[currentCategoryId] || 'products_cis'
      
      // 슬라이더 배열을 문자열로 변환하는 전처리 함수
      const preprocessFilters = (parameters: Record<string, any>) => {
        const processed: Record<string, any> = {}
        
        Object.entries(parameters).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length === 2 && 
              value.every(v => typeof v === 'number')) {
            // 슬라이더 범위 → "[min,max]" 문자열로 변환
            processed[key] = `[${value[0]},${value[1]}]`
            console.log(`🔄 Slider preprocessing: ${key} [${value[0]}, ${value[1]}] → "${processed[key]}"`)
          } else {
            // 다른 값들은 그대로 유지
            processed[key] = value
          }
        })
        
        return processed
      }

      // HTTP 방식으로 제품 데이터 로드
      const { data, error: httpError } = await httpQueries.getProducts(tableName, {
        page,
        limit: itemsPerPage,
        orderBy: sortBy,
        orderDirection: sortDirection,
        search: filters.search || '',
        filters: preprocessFilters(filters.parameters || {})
      })
      
      // 실제 제품 개수 조회
      const { count, error: countError } = await httpQueries.getProductCount(tableName, {
        search: filters.search || '',
        filters: preprocessFilters(filters.parameters || {})
      })
      
      if (httpError) {
        console.error('❌ HTTP query failed:', httpError)
        throw httpError
      }
      
      if (countError) {
        console.warn('⚠️ Count query failed, using fallback count:', countError)
      }
      
      // 실제 카운트 사용, 에러 시 기본값 사용
      const actualCount = count || 0
      
      if (!data || data.length === 0) {
        setProducts([])
        setTotalProducts(actualCount)
        setCurrentPage(page)
        return
      }
      
      // HTTP 데이터를 Product 인터페이스에 맞게 변환 (실제 컬럼 직접 매핑)
      const transformedProducts: Product[] = data.map((item: any) => {
        // 기본 제품 객체 생성
        const product: any = {
          id: item.id || Math.random().toString(),
          part_number: item.part_number || 'N/A',
          series: item.series_id ? (seriesMap.get(item.series_id) || `Series-${item.series_id}`) : 'Unknown',
          is_new: item.is_new || false,
          is_active: item.is_active !== false,
        }
        
        // 모든 실제 컬럼들을 직접 Product 객체에 포함 (specifications 사용 안함)
        const skipFields = ['id', 'created_at', 'updated_at']
        Object.keys(item).forEach(key => {
          if (!skipFields.includes(key) && !(key in product)) {
            product[key] = item[key]
          }
        })
        
        return product as Product
      })
      
      setProducts(transformedProducts)
      setTotalProducts(actualCount) // 실제 카운트 사용
      setCurrentPage(page)
      
      // Products loaded successfully
      
    } catch (err) {
      console.error('❌ HTTP loading failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to load products via HTTP')
      
      // Fallback data
      const fallbackProducts: Product[] = [{
        id: 'fallback-1',
        part_number: 'FALLBACK-001',
        series: 'Fallback Series',
        is_new: true,
        is_active: true,
        maker_name: 'Vieworks',
        category_name: CATEGORY_NAME_MAP[currentCategoryId] || 'CIS',
        image_url: '',
        // 카테고리별 샘플 컬럼들
        scan_width: 400,
        dpi: 600,
        speed: 100,
        note: 'HTTP failed, showing fallback data'
      } as Product]
      
      setProducts(fallbackProducts)
      setTotalProducts(1)
      setCurrentPage(1)
      
    } finally {
      setLoading(false)
    }
  }, [currentCategoryId, itemsPerPage, sortBy, sortDirection, seriesMap, filters.search, filters.parameters])

  // 카테고리 변경 또는 페이지 로드 시 제품 데이터 로드
  useEffect(() => {
    loadProducts(currentPage)
  }, [loadProducts, currentPage])

  // 카테고리 변경, 검색, 필터 변경 시 첫 페이지로 리셋
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [currentCategoryId, filters.search, filters.parameters])

  // 카테고리 변경 시 필터 파라미터 완전 초기화
  useEffect(() => {
    const { updateFilter } = useFilterStore.getState()
    // 카테고리가 변경되면 기존 필터 파라미터를 모두 초기화
    updateFilter('parameters', {})
  }, [currentCategoryId])

  const handleSort = useCallback((field: string) => {
    const newDirection = sortBy === field ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc'
    
    setSortBy(field)
    setSortDirection(newDirection)
    
    // URL 파라미터에 정렬 상태 반영
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', field)
    params.set('order', newDirection)
    
    const newUrl = `/products?${params.toString()}`
    window.history.pushState({}, '', newUrl)
  }, [sortBy, sortDirection, searchParams])

  const handleSearch = useCallback((searchTerm: string) => {
    console.log('Search:', searchTerm)
    
    // Update filter store with search term
    const { updateFilter } = useFilterStore.getState()
    updateFilter('search', searchTerm)
    
    // Update URL parameters
    const params = new URLSearchParams(searchParams.toString())
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim())
    } else {
      params.delete('search')
    }
    
    // Reset page to 1 when searching
    params.set('page', '1')
    setCurrentPage(1)
    
    const newUrl = `/products?${params.toString()}`
    window.history.pushState({}, '', newUrl)
    
    // Note: loadProducts는 useEffect의 dependency에 filters.search가 포함되어 있어 자동으로 호출됨
  }, [searchParams])

  const handleItemsPerPageChange = useCallback((count: number) => {
    setItemsPerPage(count)
    setCurrentPage(1) // 페이지를 1로 리셋
  }, [])

  const handleCompareChange = useCallback((productIds: string[]) => {
    setSelectedProducts(productIds)
  }, [])

  const handleProductQuestion = () => {
    // 선택된 제품들의 part_number를 콤마로 연결
    if (selectedProducts.length > 0) {
      const productsParam = selectedProducts.join(',')
      // 새 창으로 문의 페이지 열기
      window.open(`/support/inquiry?products=${encodeURIComponent(productsParam)}`, '_blank')
    } else {
      // 선택된 제품이 없을 경우 일반 문의 페이지로 이동
      window.open('/support/inquiry', '_blank')
    }
  }

  const handleProductComparison = () => {
    // 선택된 제품들의 정보를 찾아서 비교 모달에 전달
    const selectedProductsData = products.filter(p => selectedProducts.includes(p.part_number))
    setComparisonProducts(selectedProductsData)
    setShowComparisonModal(true)
  }

  const handleComparisonLimitWarning = () => {
    setShowComparisonLimitModal(true)
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <ProductsPageLayout
      categoryInfo={categoryInfo}
      breadcrumbs={breadcrumbs}
      categoryNavigation={
        <CategoryTabs 
          categories={siblingCategories} 
          selectedCategories={filters.categories}
        />
      }
    >
      {/* Mobile Filter Toggle */}
      <div className={styles.mobileFilterToggle} onClick={() => setIsMobileFilterOpen(true)}>
        <span>필터</span>
        <img src="/img/icon-filter.svg" alt="필터" />
      </div>

      {/* Filter Overlay */}
      <div className={`${styles.filterOverlay} ${isMobileFilterOpen ? styles.active : ''}`} />

      <div className={styles.productsContainer}>
        {/* Filter Sidebar */}
        <FilterSidebar 
          categories={siblingCategories}
          categoryName={fallbackCategoryInfo.name}
          selectedCategory={CATEGORY_NAME_MAP[currentCategoryId] || 'CIS'}
          isMobile={false}
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
        />

        {/* Main Contents */}
        <div className={styles.mainContents}>
          {/* Sort Bar */}
          <ProductSortBar
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            onSearch={handleSearch}
            initialSearchTerm={filters.search || ''}
          />

          {/* Products Table */}
          <ProductTable
            products={products}
            total={totalProducts}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
            onPageChange={setCurrentPage}
            onCompareChange={handleCompareChange}
            isLoading={loading}
          />
        </div>
      </div>

      {/* Floating Action Buttons */}
      <FloatingActionButtons
        selectedProductsCount={selectedProducts.length}
        selectedProducts={selectedProducts}
        onProductQuestion={handleProductQuestion}
        onProductComparison={handleProductComparison}
        onShowComparisonLimitWarning={handleComparisonLimitWarning}
      />

      {/* Comparison Limit Modal */}
      <ComparisonLimitModal
        isOpen={showComparisonLimitModal}
        onClose={() => setShowComparisonLimitModal(false)}
        maxProducts={4}
      />

      {/* Product Comparison Modal */}
      <ProductComparisonModal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        products={comparisonProducts}
        onRemoveProduct={(productId) => {
          // 제품 제거 시 선택 목록에서도 제거
          setSelectedProducts(prev => prev.filter(id => id !== productId))
          setComparisonProducts(prev => prev.filter(p => p.part_number !== productId))
        }}
      />
    </ProductsPageLayout>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <ProductsContent />
    </Suspense>
  )
}