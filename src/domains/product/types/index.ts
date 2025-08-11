export interface Product {
  // 공통 기본 필드
  id: string | number
  part_number: string
  series: string
  maker_name?: string
  category_name?: string
  is_active: boolean
  is_new: boolean
  created_at?: string
  updated_at?: string
  image_url?: string
  
  // Legacy compatibility
  maker_id?: number
  category_id?: number
  series_id?: number
  partnumber?: string
  name?: string
  description?: string
  datasheet_url?: string
  parameters?: ProductParameter[]
  category?: Category

  // CIS 전용 필드들
  scan_width?: number
  dpi?: number
  speed?: number
  resolution?: number
  line_rate?: number
  
  // TDI 전용 필드들
  pixel_size?: number
  tdi_stages?: number
  
  // Area 전용 필드들
  frame_rate?: number
  sensor_type?: string
  interface?: string
  
  // Line 전용 필드들
  pixel_resolution?: number
  line_speed?: number
  
  // 공통 기술 스펙
  working_distance?: number
  spectrum?: string
  lens_mount?: string
  dimensions?: string
  weight?: number
  operating_temperature?: string
  power_consumption?: number
  
  // 기타 동적 필드들 (각 제품 카테고리마다 다를 수 있음)
  note?: string
  [key: string]: any  // 동적 필드를 위한 인덱스 시그니처

  // series_data는 제품 상세 페이지용 (옵셔널)
  series_data?: {
    series_name: string
    intro_text?: string
    short_text?: string
    youtube_url?: string
    feature_image_url?: string
    features: Array<{title: string, desc: string}>
    strengths: string[]
    apps: Array<{title: string, image: string}>
    textItems: Array<{title: string, desc: string, image: string}>
  }
  related_products?: Product[]
}

export interface Category {
  id: string | number
  name: string
  enName?: string
  slug?: string
  parent_id?: number
  description?: string
  created_at?: string
  updated_at?: string
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
  parameters: Record<string, unknown>
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