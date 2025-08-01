import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { FilterState, Product } from '@/domains/product/types'

interface FilterStore {
  filters: FilterState
  updateFilter: (key: keyof FilterState, value: FilterState[keyof FilterState]) => void
  resetFilters: () => void
  setFiltersFromUrl: (searchParams: URLSearchParams) => void
}

interface ComparisonStore {
  comparisonProducts: Product[]
  isComparisonModalOpen: boolean
  addToComparison: (product: Product) => void
  removeFromComparison: (productId: string) => void
  clearComparison: () => void
  toggleComparisonModal: () => void
  setComparisonModalOpen: (isOpen: boolean) => void
}

const initialFilters: FilterState = {
  categories: [],
  partnumber: '',
  series: '',
  search: '',
  parameters: {},
  sort: 'name',
  order: 'asc',
  page: 1,
  limit: 20
}

export const useFilterStore = create<FilterStore>()(
  devtools(
    (set) => ({
      filters: initialFilters,
      
      updateFilter: (key, value) => {
        set(
          (state) => ({
            filters: {
              ...state.filters,
              [key]: value,
              // Reset page when filters change (except for page updates)
              page: key === 'page' ? (value as number) : 1
            }
          }),
          false,
          `updateFilter/${key}`
        )
      },
      
      resetFilters: () => {
        set(
          { filters: initialFilters },
          false,
          'resetFilters'
        )
      },
      
      setFiltersFromUrl: (searchParams) => {
        const filters = { ...initialFilters }
        
        // Helper function to ensure array type safety
        const ensureArray = (value: unknown): string[] => {
          if (Array.isArray(value)) return value.map(String)
          if (value !== null && value !== undefined) return [String(value)]
          return []
        }
        
        // Parse categories
        const categories = searchParams.get('categories')
        if (categories) {
          filters.categories = categories.split(',')
        }
        
        // Parse text filters
        const partnumber = searchParams.get('partnumber')
        if (partnumber) {
          filters.partnumber = partnumber
        }
        
        const series = searchParams.get('series')
        if (series) {
          filters.series = series
        }
        
        const search = searchParams.get('search')
        if (search) {
          filters.search = search
        }
        
        // Parse sort and order
        const sort = searchParams.get('sort')
        if (sort && ['name', 'partnumber', 'created_at', 'updated_at'].includes(sort)) {
          filters.sort = sort as FilterState['sort']
        }
        
        const order = searchParams.get('order')
        if (order && ['asc', 'desc'].includes(order)) {
          filters.order = order as FilterState['order']
        }
        
        // Parse pagination
        const page = searchParams.get('page')
        if (page && !isNaN(parseInt(page))) {
          filters.page = parseInt(page)
        }
        
        const limit = searchParams.get('limit')
        if (limit && !isNaN(parseInt(limit))) {
          filters.limit = parseInt(limit)
        }
        
        // Parse dynamic parameters with type safety
        const parameters: Record<string, string | number | boolean | string[]> = {}
        searchParams.forEach((value, key) => {
          if (!['categories', 'partnumber', 'series', 'search', 'sort', 'order', 'page', 'limit'].includes(key)) {
            // Try to parse as array first (comma-separated)
            if (value.includes(',')) {
              parameters[key] = value.split(',').map(v => v.trim()).filter(v => v.length > 0)
            } else {
              // Try to parse as number
              const numValue = parseFloat(value)
              if (!isNaN(numValue)) {
                parameters[key] = numValue
              } else if (value === 'true' || value === 'false') {
                parameters[key] = value === 'true'
              } else {
                parameters[key] = value
              }
            }
          }
        })
        
        if (Object.keys(parameters).length > 0) {
          filters.parameters = parameters
        }
        
        set(
          { filters },
          false,
          'setFiltersFromUrl'
        )
      }
    }),
    {
      name: 'filter-store'
    }
  )
)

export const useComparisonStore = create<ComparisonStore>()(
  devtools(
    (set, get) => ({
      comparisonProducts: [],
      isComparisonModalOpen: false,
      
      addToComparison: (product) => {
        const currentProducts = get().comparisonProducts
        
        // 이미 추가된 제품인지 확인
        if (currentProducts.some(p => p.part_number === product.part_number)) {
          return
        }
        
        // 최대 3개까지만 추가 가능
        if (currentProducts.length >= 3) {
          alert('최대 3개의 제품만 비교할 수 있습니다.')
          return
        }
        
        set(
          (state) => ({
            comparisonProducts: [...state.comparisonProducts, product]
          }),
          false,
          'addToComparison'
        )
      },
      
      removeFromComparison: (productId) => {
        set(
          (state) => ({
            comparisonProducts: state.comparisonProducts.filter(p => p.part_number !== productId)
          }),
          false,
          'removeFromComparison'
        )
      },
      
      clearComparison: () => {
        set(
          { comparisonProducts: [] },
          false,
          'clearComparison'
        )
      },
      
      toggleComparisonModal: () => {
        set(
          (state) => ({
            isComparisonModalOpen: !state.isComparisonModalOpen
          }),
          false,
          'toggleComparisonModal'
        )
      },
      
      setComparisonModalOpen: (isOpen) => {
        set(
          { isComparisonModalOpen: isOpen },
          false,
          'setComparisonModalOpen'
        )
      }
    }),
    {
      name: 'comparison-store'
    }
  )
)