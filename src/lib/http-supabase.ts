/**
 * HTTP-based Supabase client
 * Bypasses Supabase SDK issues by using direct REST API calls
 */

interface SupabaseConfig {
  url: string
  key: string
  timeout?: number
}

interface QueryOptions {
  select?: string
  limit?: number
  offset?: number
  order?: string
  orderDirection?: 'asc' | 'desc'
  filters?: Record<string, any>
}

class HTTPSupabaseClient {
  private baseUrl: string
  private apiKey: string
  private timeout: number

  constructor(config: SupabaseConfig) {
    this.baseUrl = `${config.url}/rest/v1`
    this.apiKey = config.key
    this.timeout = config.timeout || 10000
  }

  /**
   * 범위 문자열이 유효한 형식인지 검증하는 헬퍼 메서드
   */
  private isValidRangeString(value: string): boolean {
    // [min,max] 형태 검증
    if (value.startsWith('[') && value.endsWith(']')) {
      if (value.length < 5) { // 최소한 [1,2] 형태
        return false
      }
      
      const rangeStr = value.slice(1, -1)
      
      if (!rangeStr.includes(',') || rangeStr.split(',').length !== 2) {
        return false
      }
      
      const rangeParts = rangeStr.split(',')
      const range = rangeParts.map(rv => {
        const trimmed = rv.trim()
        if (trimmed === '') return NaN
        return parseFloat(trimmed)
      })
      
      return range.length === 2 && !isNaN(range[0]) && !isNaN(range[1]) && range[0] <= range[1]
    }
    
    // min-max 토큰 형태 검증
    const rangeTokenMatch = value.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/)
    if (rangeTokenMatch) {
      const [, minStr, maxStr] = rangeTokenMatch
      const min = parseFloat(minStr)
      const max = parseFloat(maxStr)
      return !isNaN(min) && !isNaN(max) && min <= max
    }
    
    return false
  }

  private buildQuery(options: QueryOptions = {}): string {
    const params = new URLSearchParams()
    
    if (options.select) {
      params.append('select', options.select)
    }
    
    if (options.limit) {
      params.append('limit', options.limit.toString())
    }
    
    if (options.offset) {
      params.append('offset', options.offset.toString())
    }
    
    if (options.order) {
      const orderDirection = options.orderDirection || 'asc'
      
      // 복수 정렬 필드 처리 (is_new.desc,part_number 형태)
      if (options.order.includes(',')) {
        const orderFields = options.order.split(',')
        const orderParts = []
        
        for (const field of orderFields) {
          const trimmedField = field.trim()
          if (trimmedField.includes('.')) {
            // 이미 방향이 지정된 경우 (is_new.desc)
            orderParts.push(trimmedField)
          } else {
            // 방향이 없는 경우 기본 방향 적용
            orderParts.push(`${trimmedField}.${orderDirection}`)
          }
        }
        
        params.append('order', orderParts.join(','))
      } else {
        // 단일 정렬
        params.append('order', `${options.order}.${orderDirection}`)
      }
    }
    
    // Add filters
    if (options.filters) {
      console.log(`🚀 Processing filters:`, options.filters)
      Object.entries(options.filters).forEach(([key, value]) => {
        console.log(`📋 Filter entry: ${key} = ${JSON.stringify(value)} (type: ${typeof value}, isArray: ${Array.isArray(value)})`)
        
        // 글로벌 안전장치: 잘못된 범위 형식 사전 차단
        if (typeof value === 'string' && value.includes('[') && !this.isValidRangeString(value)) {
          console.log(`🚨 BLOCKED: Invalid range format detected: "${value}"`)
          return // 이 필터를 완전히 무시
        }
        if (key === 'search' && typeof value === 'string' && value.trim()) {
          // 텍스트 검색: part_number 필드에서만 검색 (우선)
          params.append('part_number', `ilike.*${value}*`)
        } else if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
          // 범위 필터: [100,499] 형태 (강화된 검증 적용)
          console.log(`🔍 String range filter detected for ${key}: "${value}"`)
          
          // 강화된 검증 로직 적용
          if (value.length < 5) { // 최소한 [1,2] 형태여야 함
            console.log(`  ❌ Range too short, skipping: "${value}"`)
          } else {
            const rangeStr = value.slice(1, -1) // 대괄호 제거
            console.log(`  🔪 After slice: "${rangeStr}"`)
            
            // 쉼표가 정확히 하나 있는지 확인
            if (!rangeStr.includes(',') || rangeStr.split(',').length !== 2) {
              console.log(`  ❌ Invalid range format (no comma or multiple commas): "${rangeStr}"`)
            } else {
              const rangeParts = rangeStr.split(',')
              const range = rangeParts.map(rv => {
                const trimmed = rv.trim()
                if (trimmed === '') {
                  console.log(`  ❌ Empty range part detected`)
                  return NaN
                }
                return parseFloat(trimmed)
              })
              console.log(`  🔢 Parsed range:`, range)
              
              if (range.length === 2 && !isNaN(range[0]) && !isNaN(range[1]) && range[0] <= range[1]) {
                console.log(`  ✅ Valid string range, adding params: ${key}=gte.${range[0]}, ${key}=lte.${range[1]}`)
                params.append(key, `gte.${range[0]}`)
                params.append(key, `lte.${range[1]}`)
              } else {
                console.log(`  ❌ Invalid range (NaN or min > max):`, range)
                console.log(`  📋 Skipping malformed string range filter for key "${key}": "${value}"`)
              }
            }
          }
        } else if (typeof value === 'string' && value.startsWith('!')) {
          // 부정 필터: !Mono,Color 형태
          const excludeValues = value.slice(1).split(',').map(v => v.trim())
          excludeValues.forEach(excludeValue => {
            params.append(key, `neq.${excludeValue}`)
          })
        } else if (Array.isArray(value)) {
          // 배열 값: 같은 필드 내에서는 OR 조건으로 처리
          console.log(`🔍 Processing array value for ${key}:`, value)
          
          const rangeConditions: string[] = []
          const exactConditions: string[] = []
          const negativeConditions: string[] = []
          
          value.forEach(v => {
            console.log(`  📝 Processing value: "${v}" (type: ${typeof v})`)
            
            // 글로벌 안전장치 적용
            if (typeof v === 'string' && v.includes('[') && !this.isValidRangeString(v)) {
              console.log(`  🚨 BLOCKED: Invalid array range format: "${v}"`)
              return // 이 값 무시
            }
            
            if (typeof v === 'string' && v.startsWith('[') && v.endsWith(']')) {
              // 범위 필터: [301,400] 형태
              console.log(`  📏 Range filter detected: ${v}`)
              
              // 먼저 올바른 범위 형식인지 검증
              if (v.length < 5) { // 최소한 [1,2] 형태여야 함
                console.log(`  ❌ Range too short, skipping: "${v}"`)
                return
              }
              
              const rangeStr = v.slice(1, -1) // 대괄호 제거
              console.log(`  🔪 After slice: "${rangeStr}"`)
              
              // 쉼표가 정확히 하나 있는지 확인
              if (!rangeStr.includes(',') || rangeStr.split(',').length !== 2) {
                console.log(`  ❌ Invalid range format (no comma or multiple commas): "${rangeStr}"`)
                return
              }
              
              const rangeParts = rangeStr.split(',')
              const range = rangeParts.map(rv => {
                const trimmed = rv.trim()
                if (trimmed === '') {
                  console.log(`  ❌ Empty range part detected`)
                  return NaN
                }
                return parseFloat(trimmed)
              })
              console.log(`  🔢 Parsed range:`, range)
              
              if (range.length === 2 && !isNaN(range[0]) && !isNaN(range[1]) && range[0] <= range[1]) {
                // PostgreSQL 범위 조건: (field >= min AND field <= max)
                const condition = `and(${key}.gte.${range[0]},${key}.lte.${range[1]})`
                console.log(`  ✅ Generated condition: "${condition}"`)
                rangeConditions.push(condition)
              } else {
                console.log(`  ❌ Invalid range (NaN or min > max):`, range)
                console.log(`  📋 Skipping malformed range filter for key "${key}": "${v}"`)
              }
            } else if (typeof v === 'string' && v.startsWith('!')) {
              // 부정 필터: 별도로 처리 (AND 조건으로)
              const excludeValues = v.slice(1).split(',').map(ev => ev.trim())
              excludeValues.forEach(excludeValue => {
                negativeConditions.push(`${key}.neq.${excludeValue}`)
              })
            } else {
              console.log(`  🔍 Processing non-bracket value: "${v}" (type: ${typeof v})`);
              
              // 먼저 쉼표로 분리된 다중 값인지 확인 (잘못 합쳐진 경우 처리)
              if (typeof v === 'string' && v.includes(',')) {
                console.log(`  🚨 Comma-separated value detected: "${v}"`);
                const splitValues = v.split(',').map(sv => sv.trim());
                console.log(`  🔄 Split into:`, splitValues);
                
                // 각 분리된 값을 재귀적으로 처리
                splitValues.forEach(splitValue => {
                  // 범위 토큰 처리 (10-49.99 형태)
                  const rangeTokenMatch = splitValue.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
                  if (rangeTokenMatch) {
                    const [, minStr, maxStr] = rangeTokenMatch;
                    const min = parseFloat(minStr);
                    const max = parseFloat(maxStr);
                    
                    if (!isNaN(min) && !isNaN(max) && min <= max) {
                      const condition = `and(${key}.gte.${min},${key}.lte.${max})`;
                      console.log(`  🎯 Split range token: "${splitValue}" → "${condition}"`);
                      rangeConditions.push(condition);
                    } else {
                      console.log(`  ❌ Invalid split range token: "${splitValue}"`);
                      exactConditions.push(`${key}.eq.${splitValue}`);
                    }
                  } else {
                    // 비교 연산자 또는 정확한 값
                    const comparisonMatch = splitValue.match(/^(>=|<=|>|<)(\d+(?:\.\d+)?)$/);
                    if (comparisonMatch) {
                      const [, operator, numValue] = comparisonMatch;
                      const operatorMap: Record<string, string> = { 
                        '>=': 'gte', 
                        '<=': 'lte', 
                        '>': 'gt', 
                        '<': 'lt' 
                      };
                      console.log(`  🔄 Split comparison: "${splitValue}" → "${key}.${operatorMap[operator]}.${numValue}"`);
                      exactConditions.push(`${key}.${operatorMap[operator]}.${numValue}`);
                    } else {
                      console.log(`  📝 Split exact value: "${splitValue}"`);
                      exactConditions.push(`${key}.eq.${splitValue}`);
                    }
                  }
                });
              } else {
                // 범위 토큰 처리 (10-49 형태)
                const rangeTokenMatch = typeof v === 'string' ? v.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/) : null;
                if (rangeTokenMatch) {
                  const [, minStr, maxStr] = rangeTokenMatch;
                  const min = parseFloat(minStr);
                  const max = parseFloat(maxStr);
                  
                  if (!isNaN(min) && !isNaN(max) && min <= max) {
                    // 범위 조건: (field >= min AND field <= max)
                    const condition = `and(${key}.gte.${min},${key}.lte.${max})`;
                    console.log(`  🎯 Array range token: "${v}" → "${condition}"`);
                    rangeConditions.push(condition);
                  } else {
                    console.log(`  ❌ Invalid array range token: "${v}"`);
                    exactConditions.push(`${key}.eq.${v}`);
                  }
                } else {
                  // 비교 연산자 또는 정확한 값 처리
                  const comparisonMatch = typeof v === 'string' ? v.match(/^(>=|<=|>|<)(\d+(?:\.\d+)?)$/) : null;
                  if (comparisonMatch) {
                    const [, operator, numValue] = comparisonMatch;
                    const operatorMap: Record<string, string> = { 
                      '>=': 'gte', 
                      '<=': 'lte', 
                      '>': 'gt', 
                      '<': 'lt' 
                    };
                    console.log(`  🔄 Array comparison: "${v}" → "${key}.${operatorMap[operator]}.${numValue}"`);
                    exactConditions.push(`${key}.${operatorMap[operator]}.${numValue}`);
                  } else {
                    // 정확한 값
                    console.log(`  📝 Array exact value: "${v}"`);
                    exactConditions.push(`${key}.eq.${v}`);
                  }
                }
              }
            }
          })
          
          console.log(`  📊 Final conditions - ranges: ${rangeConditions.length}, exact: ${exactConditions.length}, negative: ${negativeConditions.length}`)
          
          // OR 조건 구성
          const orConditions: string[] = [...rangeConditions, ...exactConditions]
          console.log(`  🔗 OR conditions to process:`, orConditions)
          
          if (orConditions.length > 0) {
            if (orConditions.length === 1) {
              // 단일 조건인 경우: 직접 파라미터로 추가
              const condition = orConditions[0]
              console.log(`  🎯 Single condition: "${condition}"`)
              
              if (condition.includes('and(')) {
                // 범위 조건: and(field.gte.min,field.lte.max)
                const match = condition.match(/and\((.+?)\.gte\.(.+?),(.+?)\.lte\.(.+?)\)/)
                if (match && match.length >= 5) {
                  const minVal = match[2]
                  const maxVal = match[4]
                  
                  // 숫자값 유효성 검증
                  if (!isNaN(parseFloat(minVal)) && !isNaN(parseFloat(maxVal))) {
                    console.log(`  ✅ Range match found with valid numbers:`, { min: minVal, max: maxVal })
                    params.append(key, `gte.${minVal}`)
                    params.append(key, `lte.${maxVal}`)
                    console.log(`  📤 Added params: ${key}=gte.${minVal}, ${key}=lte.${maxVal}`)
                  } else {
                    console.log(`  ❌ Range values are not valid numbers: min="${minVal}", max="${maxVal}"`)
                  }
                } else {
                  console.log(`  ❌ Range match failed for: "${condition}"`)
                }
              } else if (condition.includes('.')) {
                // 정확한 값: field.eq.value
                const conditionParts = condition.split('.')
                if (conditionParts.length >= 3) {
                  const [field, op, ...valueParts] = conditionParts
                  const val = valueParts.join('.') // 값에 점이 포함될 수 있음을 고려
                  
                  // 잘못된 형태(쉼표 포함) 감지
                  if (val.includes(',')) {
                    console.log(`  🚨 Invalid condition with comma detected: "${condition}"`)
                    console.log(`  🔄 This should have been handled as multiple conditions`)
                    // 이 경우는 이미 위에서 처리되었어야 함
                  } else {
                    params.append(field, `${op}.${val}`)
                    console.log(`  📤 Added exact param: ${field}=${op}.${val}`)
                  }
                } else {
                  console.log(`  ❌ Invalid condition format: "${condition}"`)
                }
              } else {
                console.log(`  ❌ Unrecognized condition format: "${condition}"`)
              }
            } else {
              // 다중 조건: OR로 결합
              // PostgREST OR 문법: or=(condition1,condition2,condition3)
              const orQuery = `(${orConditions.join(',')})`
              console.log(`  🔄 Multi OR query: "${orQuery}"`)
              params.append('or', orQuery)
              console.log(`  📤 Added OR param: or=${orQuery}`)
            }
          }
          
          // 부정 조건들은 AND로 별도 추가
          negativeConditions.forEach(negCondition => {
            const [field, op, val] = negCondition.split('.')
            params.append(field, `${op}.${val}`)
          })
        } else if (value === true) {
          params.append(key, 'eq.true')
        } else if (value === false) {
          params.append(key, 'eq.false')
        } else if (typeof value === 'string') {
          // 범위 토큰 형태 처리 (10-49 → gte.10,lte.49)
          const rangeTokenMatch = value.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
          if (rangeTokenMatch) {
            const [, minStr, maxStr] = rangeTokenMatch;
            const min = parseFloat(minStr);
            const max = parseFloat(maxStr);
            
            if (!isNaN(min) && !isNaN(max) && min <= max) {
              console.log(`  🎯 Range token: "${value}" → ${key}=gte.${min},lte.${max}`);
              params.append(key, `gte.${min}`);
              params.append(key, `lte.${max}`);
            } else {
              console.log(`  ❌ Invalid range token: "${value}"`);
              params.append(key, `eq.${value}`);
            }
          } else {
            // 비교 연산자 파싱 (<=8, >=5000 등)
            const comparisonMatch = value.match(/^(>=|<=|>|<)(\d+(?:\.\d+)?)$/);
            if (comparisonMatch) {
              const [, operator, numValue] = comparisonMatch;
              const operatorMap: Record<string, string> = { 
                '>=': 'gte', 
                '<=': 'lte', 
                '>': 'gt', 
                '<': 'lt' 
              };
              console.log(`  🔄 Converting comparison: "${value}" → "${key}=${operatorMap[operator]}.${numValue}"`);
              params.append(key, `${operatorMap[operator]}.${numValue}`);
            } else {
              // 일반 문자열 값 (Mono, Color 등)
              params.append(key, `eq.${value}`);
            }
          }
        } else if (typeof value === 'number') {
          params.append(key, `eq.${value}`)
        }
      })
    }
    
    return params.toString()
  }

  async query(table: string, options: QueryOptions = {}) {
    const queryString = this.buildQuery(options)
    const url = `${this.baseUrl}/${table}${queryString ? '?' + queryString : ''}`
    
    // 상세한 SQL 파라미터 로깅
    console.log(`🔍 Supabase Query Debug:`)
    console.log(`   Table: ${table}`)
    console.log(`   Query String: ${queryString}`)
    console.log(`   Full URL: ${url}`)
    
    // Apply filters to query
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        // Try to get error details from response
        let errorDetails = response.statusText
        try {
          const errorBody = await response.text()
          if (errorBody) {
            errorDetails += ` - ${errorBody}`
            
            // PostgreSQL 타입 에러 특별 처리
            if (errorBody.includes('invalid input syntax for type integer')) {
              console.error('🚨 PostgreSQL Type Error detected - likely malformed range filter')
              console.error('   Error body:', errorBody)
              throw new Error(`INVALID_RANGE_FILTER: ${errorBody}`)
            }
          }
        } catch (e) {
          // Ignore error body parsing errors
        }
        throw new Error(`HTTP ${response.status}: ${errorDetails}`)
      }
      
      const data = await response.json()
      // HTTP request successful
      
      return { data, error: null }
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new Error(`Request to ${table} timed out after ${this.timeout}ms`)
        console.error('⏰ HTTP Timeout:', timeoutError.message)
        return { data: null, error: timeoutError }
      }
      
      console.error('❌ HTTP Error:', error)
      
      // 범위 필터 관련 에러인 경우 사용자 친화적 메시지
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('INVALID_RANGE_FILTER') || errorMessage.includes('invalid input syntax for type integer')) {
        const friendlyError = new Error('Invalid number format in filters. Please check your range selections.')
        friendlyError.name = 'INVALID_RANGE_FILTER'
        console.error('   📋 User-friendly message generated for range filter error')
        return { data: null, error: friendlyError }
      }
      
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error') }
    }
  }

  // Count query (separate endpoint)
  async count(table: string, filters: Record<string, any> = {}) {
    const queryString = this.buildQuery({ filters })
    const url = `${this.baseUrl}/${table}${queryString ? '?' + queryString : ''}`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'apikey': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`,
          'Prefer': 'count=exact'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      const countHeader = response.headers.get('content-range')
      const count = countHeader ? parseInt(countHeader.split('/')[1]) : 0
      
      return { count, error: null }
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('❌ Count Error:', error)
      return { count: 0, error: error instanceof Error ? error : new Error('Count failed') }
    }
  }
}

// Create the HTTP client instance
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const httpSupabase = new HTTPSupabaseClient({
  url: supabaseUrl,
  key: supabaseKey,
  timeout: 10000 // 10 second timeout
})

// Helper functions for common queries
export const httpQueries = {
  // Get products from any category table
  async getProducts(tableName: string, options: {
    page?: number
    limit?: number
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
    search?: string
    filters?: Record<string, any>
  } = {}) {
    const { page = 1, limit = 20, orderBy = 'part_number', orderDirection = 'asc', search = '', filters = {} } = options
    const offset = (page - 1) * limit
    
    // search 파라미터를 filters에 포함
    const searchFilters = { is_active: true, ...filters }
    if (search && search.trim()) {
      searchFilters.search = search.trim()
    }
    
    const { data, error } = await httpSupabase.query(tableName, {
      select: '*',
      limit,
      offset,
      // is_new=TRUE 제품을 항상 먼저 표시하고, 그 다음에 사용자 지정 정렬 적용
      order: `is_new.desc,${orderBy}`,
      orderDirection,
      filters: searchFilters
    })
    
    return { data: data || [], error }
  },

  // Get total count of products in a table
  async getProductCount(tableName: string, options: {
    search?: string
    filters?: Record<string, any>
  } = {}) {
    const { search = '', filters = {} } = options
    
    // search 파라미터를 filters에 포함
    const searchFilters = { is_active: true, ...filters }
    if (search && search.trim()) {
      searchFilters.search = search.trim()
    }
    
    const { count, error } = await httpSupabase.count(tableName, searchFilters)
    
    return { count, error }
  },

  // Get categories
  async getCategories() {
    const { data, error } = await httpSupabase.query('categories', {
      select: 'id,name,parent_id',
      order: 'name'
    })
    
    return { data: data || [], error }
  },

  // Test table existence
  async testTable(tableName: string) {
    const { data, error } = await httpSupabase.query(tableName, {
      select: 'id',
      limit: 1
    })
    
    return { exists: !error && data !== null, error }
  },

  // Get all series for mapping series ID to series_name
  async getAllSeries() {
    try {
      console.log('🔍 Loading all series data for mapping...')
      
      // Load all series data - only select id and series_name (category_id doesn't exist in actual table)
      const { data, error } = await httpSupabase.query('series', {
        select: 'id,series_name',
        order: 'series_name'
      })

      if (error) {
        console.error('❌ Series table query failed:', error)
        return { data: [], error }
      }

      console.log('✅ Series data loaded successfully:', data?.length || 0, 'records')
      return { data: data || [], error: null }
      
    } catch (err) {
      console.error('❌ getAllSeries exception:', err)
      return { data: [], error: err instanceof Error ? err : new Error('Failed to load series') }
    }
  },


  // Get single product by part_number from multiple tables
  async getProductByPartNumber(partNumber: string) {
    const tables = [
      'products_cis', 'products_tdi', 'products_line', 'products_area', 
      'products_invisible', 'products_scientific', 'products_large_format_lens',
      'products_telecentric', 'products_fa_lens', 'products_3d_laser_profiler',
      'products_3d_stereo_camera', 'products_light', 'products_controller',
      'products_frame_grabber', 'products_gige_lan_card', 'products_usb_card',
      'products_cable', 'products_accessory', 'products_af_module', 'products_software'
    ]

    // Search through all tables to find the product
    for (const tableName of tables) {
      try {
        const { data, error } = await httpSupabase.query(tableName, {
          select: '*',
          filters: { part_number: partNumber }
        })

        if (!error && data && data.length > 0) {
          const product = data[0]

          // Determine category from table name
          const categoryMap: Record<string, { id: string, name: string }> = {
            'products_cis': { id: '9', name: 'CIS' },
            'products_tdi': { id: '10', name: 'TDI' },
            'products_line': { id: '11', name: 'Line' },
            'products_area': { id: '12', name: 'Area' },
            'products_invisible': { id: '13', name: 'Invisible' },
            'products_scientific': { id: '14', name: 'Scientific' },
            'products_large_format_lens': { id: '15', name: 'Large Format Lens' },
            'products_telecentric': { id: '16', name: 'Telecentric' },
            'products_fa_lens': { id: '17', name: 'FA Lens' },
            'products_3d_laser_profiler': { id: '18', name: '3D Laser Profiler' },
            'products_3d_stereo_camera': { id: '19', name: '3D Stereo Camera' },
            'products_light': { id: '20', name: 'Light' },
            'products_controller': { id: '22', name: 'Controller' },
            'products_frame_grabber': { id: '23', name: 'Frame Grabber' },
            'products_gige_lan_card': { id: '24', name: 'GigE Lan Card' },
            'products_usb_card': { id: '25', name: 'USB Card' },
            'products_cable': { id: '26', name: 'Cable' },
            'products_accessory': { id: '27', name: 'Accessory' },
            'products_af_module': { id: '4', name: 'Auto Focus Module' },
            'products_software': { id: '7', name: 'Software' }
          }

          const categoryInfo = categoryMap[tableName] || { id: '9', name: 'Unknown' }

          // 기본 제품 정보 생성
          const productData: any = {
            id: product.id || Math.random().toString(),
            part_number: product.part_number,
            series: product.series || 'Unknown',
            is_new: product.is_new || false,
            is_active: product.is_active !== false,
            maker_name: 'Vieworks', // Default maker
            category_name: categoryInfo.name,
            image_url: `https://example.com/${product.part_number}.jpg`
          }

          // 모든 실제 컬럼들을 직접 포함 (specifications 사용 안함)
          const skipFields = ['id', 'created_at', 'updated_at']
          Object.keys(product).forEach(key => {
            if (!skipFields.includes(key) && !(key in productData)) {
              productData[key] = product[key]
            }
          })

          return {
            data: {
              ...productData,
              // Mock series data for detail page
              series_data: {
                series_name: product.series || 'Unknown Series',
                intro_text: `${product.part_number} 제품 소개`,
                short_text: `${categoryInfo.name} 카테고리의 ${product.part_number} 모델`,
                youtube_url: '',
                feature_image_url: '',
                features: [
                  { title: '고성능', desc: '뛰어난 성능을 제공합니다' },
                  { title: '안정성', desc: '안정적인 작동을 보장합니다' },
                  { title: '편의성', desc: '사용이 간편합니다' },
                  { title: '효율성', desc: '효율적인 작업이 가능합니다' }
                ],
                strengths: [
                  '우수한 품질', '경쟁력 있는 가격', '빠른 납기', 
                  '전문적인 지원', '다양한 옵션', '검증된 기술'
                ],
                apps: [
                  { title: '산업 자동화', image: '/img/app-industrial.jpg' },
                  { title: '품질 검사', image: '/img/app-quality.jpg' },
                  { title: '로봇 비전', image: '/img/app-robot.jpg' },
                  { title: '의료 영상', image: '/img/app-medical.jpg' }
                ],
                textItems: [
                  { 
                    title: '제품 개요', 
                    desc: `${product.part_number}는 ${categoryInfo.name} 분야에서 최고의 성능을 제공하는 제품입니다.`,
                    image: '/img/overview.jpg'
                  }
                ]
              },
              related_products: [] // Mock empty related products
            },
            error: null
          }
        }
      } catch (err) {
        console.warn(`Failed to search in ${tableName}:`, err)
        continue
      }
    }

    return { 
      data: null, 
      error: new Error(`Product with part_number '${partNumber}' not found in any table`) 
    }
  }
}

export default httpSupabase