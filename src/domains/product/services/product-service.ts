import { supabase } from '@/lib/supabase'
import type { Product, Category, FilterState, ProductSearchResult } from '../types'

export class ProductService {
  static async getProducts(filters: Partial<FilterState> = {}): Promise<ProductSearchResult> {
    console.log('Attempting to fetch products with filters:', filters)
    
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

    try {
      // Get products with related data (categories, makers)
      let query = supabase
        .from('products')
        .select(`
          *,
          categories!inner(id, name, parent_id),
          makers(id, name)
        `)
        .eq('is_active', true) // Only active products

      // Apply category filters
      if (categories.length > 0) {
        const categoryIds = categories.map(c => parseInt(String(c))).filter(id => !isNaN(id))
        if (categoryIds.length > 0) {
          query = query.in('category_id', categoryIds)
        }
      }

      // Apply unified search across multiple fields
      if (search && search.trim()) {
        const searchTerm = search.trim()
        // Search across part_number, name, and description fields
        query = query.or(`part_number.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      } else {
        // Apply part number search (backward compatibility)
        if (partnumber && partnumber.trim()) {
          query = query.ilike('part_number', `%${partnumber.trim()}%`)
        }
      }

      // Apply series search (only if not using unified search)
      if (!search && series && series.trim()) {
        // Join with series table to search by series name
        query = supabase
          .from('products')
          .select(`
            *,
            categories!inner(id, name, parent_id),
            makers(id, name),
            series!inner(id, series_name)
          `)
          .eq('is_active', true)
          .ilike('series.series_name', `%${series.trim()}%`)

        // Re-apply category filter if exists
        if (categories.length > 0) {
          const categoryIds = categories.map(c => parseInt(String(c))).filter(id => !isNaN(id))
          if (categoryIds.length > 0) {
            query = query.in('category_id', categoryIds)
          }
        }

        // Re-apply part number filter if exists
        if (partnumber && partnumber.trim()) {
          query = query.ilike('part_number', `%${partnumber.trim()}%`)
        }
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
        throw new Error(`Failed to fetch products: ${error.message || JSON.stringify(error)}`)
      }

      console.log('Products fetched successfully:', products?.length || 0, 'products')
      
      // Transform products data for frontend compatibility
      let transformedProducts = (products || []).map(product => ({
        ...product,
        // Add legacy fields for compatibility
        partnumber: product.part_number,
        name: product.part_number,
        category: product.categories,
        maker_name: product.makers?.name || 'Unknown',
        // Ensure specifications is always an object
        specifications: product.specifications || {}
      }))

      // Apply specification-based parameter filters
      if (Object.keys(parameters).length > 0) {
        transformedProducts = transformedProducts.filter(product => {
          if (!product.specifications) return false
          
          return Object.entries(parameters).every(([paramName, paramValues]) => {
            const specValue = product.specifications[paramName]
            if (specValue === undefined || specValue === null) return false
            
            if (Array.isArray(paramValues)) {
              return paramValues.some(value => String(specValue).toLowerCase().includes(String(value).toLowerCase()))
            } else {
              return String(specValue).toLowerCase().includes(String(paramValues).toLowerCase())
            }
          })
        })
      }

      // Get total count for pagination (with same filters)
      let totalQuery = supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      if (categories.length > 0) {
        const categoryIds = categories.map(c => parseInt(String(c))).filter(id => !isNaN(id))
        if (categoryIds.length > 0) {
          totalQuery = totalQuery.in('category_id', categoryIds)
        }
      }
      
      // Apply same search logic to total count
      if (search && search.trim()) {
        const searchTerm = search.trim()
        totalQuery = totalQuery.or(`part_number.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      } else if (partnumber && partnumber.trim()) {
        totalQuery = totalQuery.ilike('part_number', `%${partnumber.trim()}%`)
      }

      const { count: totalCount } = await totalQuery
      const total = totalCount || 0
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
      console.log('Returning empty result due to database error')
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
      'created_at': 'created_at',
      'updated_at': 'updated_at'
    }
    
    return columnMap[sort] || 'part_number'
  }

  /**
   * Generate available filters based on current products
   */
  private static generateAvailableFilters(products: Product[]): Record<string, unknown> {
    const filters: Record<string, Set<unknown>> = {}
    
    products.forEach(product => {
      if (product.specifications) {
        Object.entries(product.specifications).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            if (!filters[key]) {
              filters[key] = new Set()
            }
            filters[key].add(value)
          }
        })
      }
    })
    
    // Convert Sets to Arrays for JSON serialization
    const result: Record<string, unknown> = {}
    Object.entries(filters).forEach(([key, valueSet]) => {
      result[key] = Array.from(valueSet).sort()
    })
    
    return result
  }

  static async getProductById(id: string): Promise<Product | null> {
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(*)
      `)
      .eq('id', parseInt(id))
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Product not found
      }
      throw new Error(`Failed to fetch product: ${error.message}`)
    }

    return {
      ...product,
      partnumber: product.part_number,
      name: product.part_number,
      category: product.categories
    }
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    // Assuming slug is based on part_number format
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(*)
      `)
      .eq('part_number', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to fetch product: ${error.message}`)
    }

    return {
      ...product,
      partnumber: product.part_number,
      name: product.part_number,
      category: product.categories
    }
  }

  static async getCategories(): Promise<Category[]> {
    console.log('Attempting to fetch categories from Supabase...')
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('Categories fetch error:', error)
      throw new Error(`Failed to fetch categories: ${error.message}`)
    }

    console.log('Categories fetched successfully:', data?.length || 0, 'categories')
    return data || []
  }

  static async searchProducts(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(*)
      `)
      .ilike('part_number', `%${query}%`)
      .limit(10)

    if (error) {
      throw new Error(`Failed to search products: ${error.message}`)
    }

    return (data || []).map(product => ({
      ...product,
      partnumber: product.part_number,
      name: product.part_number,
      category: product.categories
    }))
  }

  /**
   * Get product by part number with full series data and related products
   */
  static async getProductByPartNumber(partNumber: string): Promise<Product | null> {
    try {
      // First, fetch the product basic data
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(id, name, parent_id),
          makers(id, name),
          product_media(url, media_type, is_primary)
        `)
        .eq('part_number', partNumber)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Product not found
        }
        throw new Error(`Failed to fetch product: ${error.message}`)
      }

      // Separately fetch series data if series_id exists
      let seriesData = undefined
      if (product.series_id) {
        const { data: series, error: seriesError } = await supabase
          .from('series')
          .select(`
            id, series_name, category_id, intro_text, short_text, youtube_url,
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

        if (!seriesError && series) {
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

      // Get related products (same series_id)
      let relatedProducts: Product[] = []
      if (product.series_id) {
        const { data: related, error: relatedError } = await supabase
          .from('products')
          .select(`
            id, part_number, series_id, 
            categories(id, name),
            product_media(url, media_type, is_primary)
          `)
          .eq('series_id', product.series_id)
          .eq('is_active', true)
          .neq('id', product.id)
          .order('part_number')
          .limit(10)

        if (!relatedError && related) {
          relatedProducts = related.map(p => ({
            ...p,
            partnumber: p.part_number,
            name: p.part_number,
            series: seriesData?.series_name || '',
            image_url: p.product_media?.find((m: any) => m.is_primary)?.url || '',
            category: p.categories
          }))
        }
      }

      // Get primary image
      const primaryImage = product.product_media?.find((m: any) => m.is_primary)
      const imageUrl = primaryImage?.url || ''

      return {
        ...product,
        partnumber: product.part_number,
        name: product.part_number,
        category: product.categories,
        series: seriesData?.series_name || '',
        image_url: imageUrl,
        maker_name: product.makers?.name || 'Unknown',
        category_name: product.categories?.name || '',
        series_data: seriesData,
        related_products: relatedProducts,
        specifications: product.specifications || {}
      }
    } catch (error) {
      console.error('ProductService.getProductByPartNumber error:', error)
      return null
    }
  }
}