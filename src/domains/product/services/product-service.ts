import { supabase } from '@/lib/supabase'
import type { Product, Category, FilterState, ProductSearchResult } from '../types'

// 카테고리 ID to 테이블명 매핑
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

// spectrum 컬럼이 있는 카테고리 IDs
const CATEGORIES_WITH_SPECTRUM = [9, 10, 11, 12, 13, 14, 19] // CIS, TDI, Line, Area, Invisible, Scientific, 3D Stereo Camera

export class ProductService {
  static async getProducts(filters: Partial<FilterState> = {}): Promise<ProductSearchResult> {
    
    const {
      categories = [],
      partnumber = '',
      series = '',
      search = '', // 통합 검색어 추가
      parameters = {},
      sort = 'part_number',
      order = 'asc',
      page = 1,
      limit = 20
    } = filters

    // 카테고리가 지정되지 않았거나 지원하지 않는 카테고리인 경우 빈 결과 반환
    if (categories.length === 0) {
      return {
        products: [],
        total: 0,
        filters: {},
        page,
        limit,
        hasNextPage: false,
        hasPreviousPage: false
      }
    }

    const categoryId = categories[0] as number
    const tableName = CATEGORY_TABLE_MAPPING[categoryId]
    
    if (!tableName) {
      console.warn(`No table mapping found for category ID: ${categoryId}`)
      return {
        products: [],
        total: 0,
        filters: {},
        page,
        limit,
        hasNextPage: false,
        hasPreviousPage: false
      }
    }

    try {
      // Get products from category-specific table with related data
      // Check if category has spectrum column
      const hasSpectrum = CATEGORIES_WITH_SPECTRUM.includes(categoryId)
      
      let query = supabase
        .from(tableName)
        .select(`
          *,
          series(id, series_name)
        `)
        .eq('is_active', true) // Only active products

      // Category filter is already applied by table selection

      // Apply unified search across multiple fields
      if (search && search.trim()) {
        const searchTerm = search.trim()
        // Search across part_number field (main searchable field)
        query = query.ilike('part_number', `%${searchTerm}%`)
      } else {
        // Apply part number search (backward compatibility)
        if (partnumber && partnumber.trim()) {
          query = query.ilike('part_number', `%${partnumber.trim()}%`)
        }
      }

      // Apply series search (only if not using unified search)
      if (!search && series && series.trim()) {
        // Note: series search would need to be implemented with joins if needed
        // For now, skip series search in category-specific tables
        console.warn('Series search not implemented for category-specific tables')
      }

      // Apply sorting with proper column mapping
      const sortColumn = this.mapSortColumn(sort)
      query = query.order(sortColumn, { ascending: order === 'asc' })

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data: products, error } = await query

      if (error) {
        console.error('Products fetch error:', error)
        console.error('Query details:', { categories, partnumber, series, search, parameters, sort, order, page, limit })
        
        // Check for common errors and provide fallback
        if (error.code === '42P01') {
          console.error(`Table ${tableName} does not exist for category ${categoryId}`)
          return {
            products: [],
            total: 0,
            filters: {},
            page,
            limit,
            hasNextPage: false,
            hasPreviousPage: false
          }
        }
        
        if (error.code === '42703') {
          console.error(`Column error in table ${tableName}: ${error.message}`)
          // Try to continue with available data
        } else {
          throw new Error(`Failed to fetch products: ${error.message || JSON.stringify(error)}`)
        }
      }

      
      // Transform products data for frontend compatibility
      // 모든 컬럼을 그대로 유지하여 반환
      let transformedProducts = (products || []).map(product => {
        return {
          ...product, // 모든 원본 필드 유지
          // Add legacy fields for compatibility
          partnumber: product.part_number,
          name: product.part_number,
          category: { id: categoryId, name: this.getCategoryName(categoryId) },
          maker_name: product.maker || 'Unknown',
          series_name: product.series?.series_name || product.series || '',
        }
      })

      // Store total count BEFORE applying parameter filters for accurate pagination
      // Get total count for pagination (with same filters EXCEPT parameters)
      let totalQuery = supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
      
      // Apply same search logic to total count
      if (search && search.trim()) {
        const searchTerm = search.trim()
        totalQuery = totalQuery.ilike('part_number', `%${searchTerm}%`)
      } else if (partnumber && partnumber.trim()) {
        totalQuery = totalQuery.ilike('part_number', `%${partnumber.trim()}%`)
      }

      const { count: totalBeforeParamFilter } = await totalQuery

      // Apply parameter filters directly on product fields
      if (Object.keys(parameters).length > 0) {
        transformedProducts = transformedProducts.filter(product => {
          return Object.entries(parameters).every(([paramName, paramValues]) => {
            const fieldValue = product[paramName]
            if (fieldValue === undefined || fieldValue === null) return false
            
            // Parse array format "[min,max]" from filter values
            if (typeof paramValues === 'string' && paramValues.startsWith('[') && paramValues.endsWith(']')) {
              try {
                // 동일한 검증 로직 적용
                if (paramValues.length < 5) { // 최소한 [1,2] 형태
                  console.warn('Range too short:', paramValues)
                  return false
                }
                
                const rangeStr = paramValues.substring(1, paramValues.length - 1)
                
                // 쉼표 확인
                if (!rangeStr.includes(',') || rangeStr.split(',').length !== 2) {
                  console.warn('Invalid range format:', paramValues)
                  return false
                }
                
                const [minStr, maxStr] = rangeStr.split(',')
                const minTrimmed = minStr.trim()
                const maxTrimmed = maxStr.trim()
                
                if (minTrimmed === '' || maxTrimmed === '') {
                  console.warn('Empty range parts:', paramValues)
                  return false
                }
                
                const min = parseFloat(minTrimmed)
                const max = parseFloat(maxTrimmed)
                
                if (isNaN(min) || isNaN(max) || min > max) {
                  console.warn('Invalid range values:', { min, max, paramValues })
                  return false
                }
                
                const numValue = parseFloat(String(fieldValue))
                const result = !isNaN(numValue) && numValue >= min && numValue <= max
                
                return result
              } catch (e) {
                console.warn('Failed to parse range filter:', paramValues, e)
                return false
              }
            }
            
            // Handle NOT IN pattern "!value1,value2,value3"
            if (typeof paramValues === 'string' && paramValues.startsWith('!')) {
              const excludeValues = paramValues.substring(1).split(',').map(v => v.trim())
              return !excludeValues.includes(String(fieldValue))
            }
            
            // Handle range filters for numeric values (legacy support)
            if (typeof fieldValue === 'number') {
              if (Array.isArray(paramValues) && paramValues.length === 2) {
                const [min, max] = paramValues as [number, number]
                return fieldValue >= min && fieldValue <= max
              }
            }
            
            // Handle checkbox filters (string matching)
            if (Array.isArray(paramValues)) {
              return paramValues.some(value => 
                String(fieldValue).toLowerCase().includes(String(value).toLowerCase())
              )
            } else {
              return String(fieldValue).toLowerCase().includes(String(paramValues).toLowerCase())
            }
            
            return false
          })
        })
      }

      // Use the total count from before parameter filtering for accurate pagination
      const total = totalBeforeParamFilter || 0
      const hasNextPage = (page * limit) < total
      const hasPreviousPage = page > 1


      return {
        products: transformedProducts,
        total,
        filters: this.generateAvailableFilters(transformedProducts),
        page,
        limit,
        hasNextPage,
        hasPreviousPage
      }
    } catch (error) {
      console.error('ProductService.getProducts error:', error)
      console.error('Error type:', typeof error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // Return empty result instead of throwing error
      return {
        products: [],
        total: 0,
        filters: {},
        page,
        limit,
        hasNextPage: false,
        hasPreviousPage: false
      }
    }
  }

  /**
   * Map sort column names to actual database columns
   */
  private static mapSortColumn(sort: string): string {
    const columnMap: Record<string, string> = {
      'name': 'part_number',
      'partnumber': 'part_number',
      'part_number': 'part_number',
      'maker_name': 'maker_id', // Will need to handle joins properly
      'series': 'series_id',
      'series_name': 'series_id', // Map series_name to series_id
      'created_at': 'created_at',
      'updated_at': 'updated_at'
    }
    
    // If not in columnMap, return the original column name
    // This allows sorting by specification fields like scan_width, dpi, resolution etc.
    return columnMap[sort] || sort
  }

  /**
   * Get category name by ID
   */
  private static getCategoryName(categoryId: number): string {
    const categoryNames: Record<number, string> = {
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
      22: 'Controller',
      23: 'Frame Grabber',
      24: 'GigE LAN Card',
      25: 'USB Card',
      7: 'Software',
      26: 'Cable',
      27: 'Accessory'
    }
    return categoryNames[categoryId] || 'Unknown'
  }

  /**
   * Generate available filters based on current products
   */
  private static generateAvailableFilters(products: Product[]): Record<string, unknown> {
    const filters: Record<string, Set<unknown>> = {}
    
    // Skip certain fields that shouldn't be filters
    const skipFields = ['id', 'created_at', 'updated_at', 'series', 'category', 'partnumber', 'name']
    
    products.forEach(product => {
      Object.entries(product).forEach(([key, value]) => {
        if (!skipFields.includes(key) && value !== null && value !== undefined && value !== '') {
          if (!filters[key]) {
            filters[key] = new Set()
          }
          filters[key].add(value)
        }
      })
    })
    
    // Convert Sets to Arrays for JSON serialization
    const result: Record<string, unknown> = {}
    Object.entries(filters).forEach(([key, valueSet]) => {
      result[key] = Array.from(valueSet).sort()
    })
    
    return result
  }

  static async getProductById(id: string): Promise<Product | null> {
    // Need to determine which table to query from
    // For now, search across all category tables
    const categoryIds = Object.keys(CATEGORY_TABLE_MAPPING).map(Number)
    
    for (const categoryId of categoryIds) {
      const tableName = CATEGORY_TABLE_MAPPING[categoryId]
      try {
        const { data: product, error } = await supabase
          .from(tableName)
          .select(`
            *,
            series(id, series_name)
          `)
          .eq('id', parseInt(id))
          .single()

        if (!error && product) {
          const { id: productId, part_number, series_id, is_active, is_new, image_url, created_at, updated_at, series, ...specifications } = product
          
          return {
            id: productId,
            part_number,
            category_id: categoryId,
            series_id,
            is_active,
            is_new,
            image_url,
            created_at,
            updated_at,
            partnumber: part_number,
            name: part_number,
            category: { id: categoryId, name: this.getCategoryName(categoryId) },
            series_name: series?.series_name || '',
            specifications
          }
        }
      } catch (err) {
        // Continue searching in other tables
        continue
      }
    }

    return null // Product not found in any table
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    // Search across all category tables for the part_number
    const categoryIds = Object.keys(CATEGORY_TABLE_MAPPING).map(Number)
    
    for (const categoryId of categoryIds) {
      const tableName = CATEGORY_TABLE_MAPPING[categoryId]
      try {
        const { data: product, error } = await supabase
          .from(tableName)
          .select(`
            *,
            series(id, series_name)
          `)
          .eq('part_number', slug)
          .single()

        if (!error && product) {
          const { id, part_number, series_id, is_active, is_new, image_url, created_at, updated_at, series, ...specifications } = product
          
          return {
            id,
            part_number,
            series_id,
            is_active,
            is_new,
            image_url,
            created_at,
            updated_at,
            partnumber: part_number,
            name: part_number,
            category: { id: categoryId, name: this.getCategoryName(categoryId) },
            series_name: series?.series_name || '',
            specifications
          }
        }
      } catch (err) {
        // Continue searching in other tables
        continue
      }
    }

    return null // Product not found in any table
  }

  static async getCategories(): Promise<Category[]> {
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('Categories fetch error:', error)
      throw new Error(`Failed to fetch categories: ${error.message}`)
    }

    return data || []
  }

  static async searchProducts(query: string): Promise<Product[]> {
    const results: Product[] = []
    const categoryIds = Object.keys(CATEGORY_TABLE_MAPPING).map(Number)
    
    // Search across all category tables
    for (const categoryId of categoryIds) {
      const tableName = CATEGORY_TABLE_MAPPING[categoryId]
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select(`
            *,
            series(id, series_name)
          `)
          .ilike('part_number', `%${query}%`)
          .limit(3) // Limit per category to avoid too many results

        if (!error && data) {
          const transformedProducts = data.map(product => {
            const { id, part_number, series_id, is_active, is_new, image_url, created_at, updated_at, series, ...specifications } = product
            
            return {
              id,
              part_number,
              category_id: categoryId,
              series_id,
              is_active,
              is_new,
              image_url,
              created_at,
              updated_at,
              partnumber: part_number,
              name: part_number,
              category: { id: categoryId, name: this.getCategoryName(categoryId) },
              series_name: series?.series_name || '',
              specifications
            }
          })
          
          results.push(...transformedProducts)
        }
      } catch (err) {
        // Continue searching in other tables
        continue
      }
    }

    return results.slice(0, 10) // Return max 10 results total
  }

  /**
   * Get product by part number with full series data and related products
   */
  static async getProductByPartNumber(partNumber: string): Promise<Product | null> {
    try {
      // Ensure part number is properly decoded (handle URL encoding)
      const decodedPartNumber = decodeURIComponent(partNumber)
      
      // Search across all category tables for the part_number
      const categoryIds = Object.keys(CATEGORY_TABLE_MAPPING).map(Number)
      let product: any = null
      let categoryId: number = 0
      
      for (const catId of categoryIds) {
        const tableName = CATEGORY_TABLE_MAPPING[catId]
        
        const { data, error } = await supabase
          .from(tableName)
          .select(`
            *,
            series(id, series_name)
          `)
          .eq('part_number', decodedPartNumber)
          .eq('is_active', true)
          .single()

        if (error) {
        } else if (data) {
          product = data
          categoryId = catId
          break
        } else {
        }
      }

      if (!product) {
        return null // Product not found in any table
      }

      // Separately fetch series data if series_id exists
      let seriesData = undefined
      
      if (product.series_id) {
        const { data: series, error: seriesError } = await supabase
          .from('series')
          .select(`
            id, series_name, intro_text, short_text, youtube_url,
            feature_image_url, feature_title_1, feature_desc_1, feature_title_2, feature_desc_2,
            feature_title_3, feature_desc_3, feature_title_4, feature_desc_4,
            strength_1, strength_2, strength_3, strength_4, strength_5, strength_6,
            app_title_1, app_image_1, app_title_2, app_image_2, app_title_3, app_image_3,
            app_title_4, app_image_4, text_title_1, text_desc_1, text_image_url_1,
            text_title_2, text_desc_2, text_image_url_2, text_title_3, text_desc_3,
            text_image_url_3, text_title_4, text_desc_4, text_image_url_4,
            text_title_5, text_desc_5, text_image_url_5
          `)
          .eq('id', product.series_id)
          .single()

        if (seriesError) {
          console.error('❌ Series fetch error:', seriesError)
        } else if (!series) {
        } else if (series) {
          seriesData = {
            series_name: series.series_name || '',
            intro_text: series.intro_text || '',
            short_text: series.short_text || '',
            youtube_url: series.youtube_url || '',
            feature_image_url: series.feature_image_url || '',
            features: [
              { title: series.feature_title_1 || '', desc: series.feature_desc_1 || '' },
              { title: series.feature_title_2 || '', desc: series.feature_desc_2 || '' },
              { title: series.feature_title_3 || '', desc: series.feature_desc_3 || '' },
              { title: series.feature_title_4 || '', desc: series.feature_desc_4 || '' }
            ],
            strengths: [
              series.strength_1 || '',
              series.strength_2 || '',
              series.strength_3 || '',
              series.strength_4 || '',
              series.strength_5 || '',
              series.strength_6 || ''
            ].filter(Boolean),
            apps: [
              { title: series.app_title_1 || '', image: series.app_image_1 || '' },
              { title: series.app_title_2 || '', image: series.app_image_2 || '' },
              { title: series.app_title_3 || '', image: series.app_image_3 || '' },
              { title: series.app_title_4 || '', image: series.app_image_4 || '' }
            ],
            textItems: [
              { title: series.text_title_1 || '', desc: series.text_desc_1 || '', image: series.text_image_url_1 || '' },
              { title: series.text_title_2 || '', desc: series.text_desc_2 || '', image: series.text_image_url_2 || '' },
              { title: series.text_title_3 || '', desc: series.text_desc_3 || '', image: series.text_image_url_3 || '' },
              { title: series.text_title_4 || '', desc: series.text_desc_4 || '', image: series.text_image_url_4 || '' },
              { title: series.text_title_5 || '', desc: series.text_desc_5 || '', image: series.text_image_url_5 || '' }
            ]
          }
        }
      }

      // Get related products (same series_id) from the same category table
      let relatedProducts: Product[] = []
      if (product.series_id) {
        const tableName = CATEGORY_TABLE_MAPPING[categoryId]
        const { data: related, error: relatedError } = await supabase
          .from(tableName)
          .select(`
            id, part_number, series_id, image_url,
            series(id, series_name)
          `)
          .eq('series_id', product.series_id)
          .eq('is_active', true)
          .neq('id', product.id)
          .order('part_number')
          .limit(10)

        if (!relatedError && related) {
          relatedProducts = related.map(p => {
            const { id, part_number, series_id, image_url, series, ...specifications } = p
            
            return {
              id,
              part_number,
              series_id,
              image_url,
              partnumber: part_number,
              name: part_number,
              series: series?.series_name || seriesData?.series_name || '',
              category: { id: categoryId, name: this.getCategoryName(categoryId) },
              specifications
            }
          })
        }
      }

      // Get product download files if file references exist
      let downloadFiles: any[] = []
      
      // Assuming we'll have file reference columns in the product data
      // For now, we'll just pass empty array as the schema hasn't been migrated yet
      const fileTypes = [
        { type: 'catalog', id: product.catalog_file_id },
        { type: 'datasheet', id: product.datasheet_file_id },
        { type: 'manual', id: product.manual_file_id },
        { type: 'drawing', id: product.drawing_file_id }
      ]

      for (const fileType of fileTypes) {
        if (fileType.id) {
          const { data: downloadFile, error: downloadError } = await supabase
            .from('downloads')
            .select(`
              id, title, file_name, file_url, hit_count,
              download_categories(is_member_only)
            `)
            .eq('id', fileType.id)
            .single()

          if (!downloadError && downloadFile) {
            downloadFiles.push({
              ...downloadFile,
              file_type: fileType.type,
              is_member_only: downloadFile.download_categories?.is_member_only || (fileType.type === 'drawing')
            })
          }
        }
      }

      // Separate common fields from specifications
      const { id, part_number, series_id, is_active, is_new, image_url, created_at, updated_at, series, catalog_file_id, datasheet_file_id, manual_file_id, drawing_file_id, ...specifications } = product

      const result = {
        id,
        part_number,
        category_id: categoryId,
        series_id,
        is_active,
        is_new,
        image_url: image_url || '',
        catalog_file_id,
        datasheet_file_id,
        manual_file_id,
        drawing_file_id,
        created_at,
        updated_at,
        partnumber: part_number,
        name: part_number,
        category: { id: categoryId, name: this.getCategoryName(categoryId) },
        series: seriesData?.series_name || series?.series_name || '',
        maker_name: 'Unknown', // No maker in new structure
        category_name: this.getCategoryName(categoryId),
        series_data: seriesData,
        related_products: relatedProducts,
        download_files: downloadFiles,
        specifications
      }
      
      
      return result
    } catch (error) {
      console.error('ProductService.getProductByPartNumber error:', error)
      return null
    }
  }

  /**
   * Get display configuration for a category
   */
  static async getCategoryDisplayConfig(categoryName: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('category_display_config')
      .select(`
        *,
        parameter_labels(label_ko, label_en, unit)
      `)
      .eq('category_name', categoryName)
      .eq('is_visible', true)
      .order('display_order')

    if (error) {
      console.error('Failed to fetch display config:', error)
      return []
    }

    return data || []
  }

  /**
   * Get filter configuration for a category
   */
  static async getCategoryFilterConfig(categoryName: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('filter_config')
      .select('*')
      .eq('category_name', categoryName)
      .eq('is_enabled', true)
      .order('filter_order')

    if (error) {
      console.error('Failed to fetch filter config:', error)
      return []
    }

    return data || []
  }

  /**
   * Get parameter labels for a category
   */
  static async getCategoryParameterLabels(categoryName: string): Promise<Record<string, any>> {
    const { data, error } = await supabase
      .from('parameter_labels')
      .select('*')
      .eq('category_name', categoryName)

    if (error) {
      console.error('Failed to fetch parameter labels:', error)
      return {}
    }

    const labels: Record<string, any> = {}
    data?.forEach(label => {
      labels[label.parameter_name] = {
        ko: label.label_ko,
        en: label.label_en,
        unit: label.unit
      }
    })

    return labels
  }

  /**
   * Get category name from category ID
   */
  static getCategoryNameFromId(categoryId: number): string {
    const categoryNames: Record<number, string> = {
      9: 'cis',
      10: 'tdi', 
      11: 'line',
      12: 'area',
      13: 'invisible',
      14: 'scientific',
      15: 'large_format_lens',
      16: 'telecentric', 
      17: 'fa_lens',
      18: '3d_laser_profiler',
      19: '3d_stereo_camera',
      20: 'light',
      22: 'controller',
      23: 'frame_grabber',
      24: 'gige_lan_card',
      25: 'usb_card',
      7: 'software',
      26: 'cable',
      27: 'accessory'
    }
    return categoryNames[categoryId] || 'unknown'
  }
}