export interface Product {
  id: number
  part_number: string
  maker_id: number
  category_id: number
  series_id: number
  specifications: Record<string, string | number | boolean>
  is_active: boolean
  is_new: boolean
  created_at: string
  updated_at: string
  category?: Category
  // Legacy fields for compatibility
  partnumber?: string
  series?: string
  name?: string
  description?: string
  image_url?: string
  datasheet_url?: string
  parameters?: ProductParameter[]
}

export interface Category {
  id: number
  name: string
  parent_id?: number
  description?: string
  created_at: string
  updated_at: string
}

export interface ProductParameter {
  id: string
  product_id: string
  parameter_name: string
  parameter_value: string
  parameter_type: 'text' | 'number' | 'boolean' | 'select'
  display_order: number
  is_filterable: boolean
  created_at: string
}

export interface FilterState {
  categories: string[]
  partnumber: string
  series: string
  search?: string // 통합 검색어 추가
  parameters: Record<string, string | number | boolean | string[]>
  // ASP 호환 필터 상태 추가
  advancedFilters?: Record<string, {
    type: 'checkbox' | 'slider' | 'select'
    values: string[] | [number, number] | string
    conditions: string[] // SQL 조건들
  }>
  sort: 'name' | 'partnumber' | 'part_number' | 'created_at' | 'updated_at' | 'maker_name' | 'series' | string
  order: 'asc' | 'desc'
  page: number
  limit: number
}

export interface FilterOption {
  label: string
  value: string | number | boolean
  count?: number
}

// ASP 호환 필터 옵션 (복합 SQL 조건 지원)
export interface AdvancedFilterOption extends FilterOption {
  display: string // ASP 원본에서 사용하는 디스플레이 텍스트
  sqlCondition?: string // 복합 SQL 조건 (예: ">=1000", "BETWEEN 500 AND 999", "NOT IN ('A','B')")
}

export interface FilterDefinition {
  name: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'range' | 'checkbox' | 'slider'
  param?: string // ASP 원본 파라미터 이름
  unit?: string // 단위 표시 (mm, dpi, kHz 등)
  defaultExpanded?: boolean // 기본 확장 상태
  options?: FilterOption[] | AdvancedFilterOption[] // 기본 옵션 또는 고급 옵션
  min?: number
  max?: number
  step?: number
  tick?: number // 슬라이더 눈금 간격
  range?: [number, number] // 슬라이더 범위
}

// SQL 조건 처리를 위한 인터페이스
export interface FilterCondition {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in' | 'not_in' | 'like' | 'custom'
  value: string | number | boolean | (string | number)[] | null
  customSql?: string // 복합 조건용 커스텀 SQL
}

// 필터링 쿼리 빌더 결과
export interface FilterQuery {
  conditions: FilterCondition[]
  parameters: Record<string, any>
  sql: string
}

export interface ProductSearchResult {
  products: Product[]
  total: number
  filters: Record<string, FilterDefinition>
  page: number
  limit: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}