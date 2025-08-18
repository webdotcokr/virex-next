import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { FilterState, Product } from '@/domains/product/types'
import { urlParamToFilterValue } from '@/domains/product/utils/url-params'

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
          (state) => ({
            filters: {
              ...initialFilters,
              categories: state.filters.categories  // 현재 카테고리 유지
            }
          }),
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
        
        // Group all parameter values by key (for multi-value parameters)
        const paramGroups: Record<string, string[]> = {}
        searchParams.forEach((value, key) => {
          if (!['categories', 'partnumber', 'series', 'search', 'sort', 'order', 'page', 'limit'].includes(key)) {
            if (!paramGroups[key]) {
              paramGroups[key] = []
            }
            paramGroups[key].push(value)
          }
        })
        
        // Process each parameter group
        Object.entries(paramGroups).forEach(([key, values]) => {
          
          if (values.length === 1) {
            // 단일값 처리 - 변환 없이 원본 사용
            const urlValue = values[0]
            
            // 슬라이더 범위 토큰 형식 체크 (숫자-숫자 형태)
            const isRangeToken = /^\d+(\.\d+)?-\d+(\.\d+)?$/.test(urlValue)
            
            if (isRangeToken) {
              // 슬라이더 범위 토큰을 [min, max] 배열로 변환
              const [minStr, maxStr] = urlValue.split('-')
              const sliderValue = [parseFloat(minStr), parseFloat(maxStr)]
              parameters[key] = sliderValue
            } else {
              // 체크박스나 기타 값들은 배열로 감싸기 (단일값도 배열로 유지)
              parameters[key] = [urlValue]
            }
          } else {
            // 다중값 - 원본 그대로 사용
            parameters[key] = values
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