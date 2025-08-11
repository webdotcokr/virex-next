'use client'

import { Suspense, useEffect, useState, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductService } from '@/domains/product/services/product-service'
import { CategoryService } from '@/domains/product/services/category-service'
import { useFilterStore } from '@/lib/store'
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

function ProductsContent() {
  const searchParams = useSearchParams()
  const { filters, setFiltersFromUrl } = useFilterStore()
  const [products, setProducts] = useState<Product[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [siblingCategories, setSiblingCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true) // 초기 로딩 true로 설정
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [sortBy, setSortBy] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{label: string, href?: string, active?: boolean}>>([])
  const [showComparisonLimitModal, setShowComparisonLimitModal] = useState(false)
  const [showComparisonModal, setShowComparisonModal] = useState(false)
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([])

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

  // Stabilize dependency values to prevent infinite loops
  const categoriesString = useMemo(() => filters.categories.join(','), [filters.categories])
  const parametersString = useMemo(() => {
    const keys = Object.keys(filters.parameters).sort()
    return keys.map(key => `${key}:${JSON.stringify(filters.parameters[key])}`).join('|')
  }, [filters.parameters])
  
  // Stable data loading function with improved error handling
  const loadData = useCallback(async () => {
    // Prevent multiple concurrent loads
    if (loading) {
      console.log('⏳ Load already in progress, skipping...')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Loading products data...', { 
        categories: filters.categories, 
        currentPage, 
        itemsPerPage, 
        sortBy, 
        sortDirection,
        categoriesString,
        parametersString
      })

      // Get current category (default to CIS if none selected)
      const currentCategoryId = filters.categories.length > 0 ? filters.categories[0] : '9'
      
      // Parallel data loading for better performance
      const [siblings, breadcrumbsData, productResult] = await Promise.allSettled([
        CategoryService.getSiblingCategories(currentCategoryId),
        CategoryService.getBreadcrumbs(currentCategoryId),
        ProductService.getProducts({
          categories: filters.categories.length > 0 ? filters.categories : [currentCategoryId],
          partnumber: filters.partnumber || '',
          series: filters.series || '',
          search: filters.search || '',
          parameters: filters.parameters || {},
          sort: sortBy || 'part_number',
          order: sortDirection,
          page: currentPage,
          limit: itemsPerPage
        })
      ])

      // Handle sibling categories
      if (siblings.status === 'fulfilled') {
        setSiblingCategories(siblings.value)
      } else {
        console.warn('⚠️ Failed to load sibling categories:', siblings.reason)
        setSiblingCategories([])
      }

      // Handle breadcrumbs
      if (breadcrumbsData.status === 'fulfilled') {
        setBreadcrumbs(breadcrumbsData.value)
      } else {
        console.warn('⚠️ Failed to load breadcrumbs:', breadcrumbsData.reason)
        setBreadcrumbs([])
      }

      // Handle products - this is the critical one
      if (productResult.status === 'fulfilled') {
        setProducts(productResult.value.products)
        setTotalProducts(productResult.value.total)
        
        console.log('✅ Products data loaded successfully:', {
          productsCount: productResult.value.products.length,
          totalProducts: productResult.value.total,
          siblingsCount: siblings.status === 'fulfilled' ? siblings.value.length : 0,
          breadcrumbsCount: breadcrumbsData.status === 'fulfilled' ? breadcrumbsData.value.length : 0
        })
      } else {
        console.error('❌ Failed to load products:', productResult.reason)
        throw new Error(productResult.reason instanceof Error ? productResult.reason.message : 'Failed to load products')
      }
      
    } catch (err) {
      console.error('❌ Failed to load data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
      // Reset data on error
      setProducts([])
      setTotalProducts(0)
      setSiblingCategories([])
      setBreadcrumbs([])
    } finally {
      setLoading(false)
    }
  }, [
    // Use stable string values instead of objects/arrays
    categoriesString,
    filters.partnumber,
    filters.series, 
    filters.search,
    parametersString,
    currentPage, 
    itemsPerPage, 
    sortBy, 
    sortDirection,
    loading // Add loading to dependencies to prevent concurrent calls
  ])

  // Fetch initial data and load products when filters change
  useEffect(() => {
    loadData()
  }, [loadData])

  // 현재 선택된 카테고리 정보
  const currentCategoryId = filters.categories.length > 0 ? filters.categories[0] : '9'
  const categoryInfo = CategoryService.getCategoryInfo(currentCategoryId)

  // Helper function to map category ID to filter category name
  const getCategoryNameById = (categoryId: string): string => {
    const categoryIdToName: Record<string, string> = {
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
    return categoryIdToName[categoryId] || 'CIS' // Default to 'CIS' if not found
  }

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
          categoryName={categoryInfo.name}
          selectedCategory={getCategoryNameById(currentCategoryId)}
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