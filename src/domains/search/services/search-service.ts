import { supabase } from '@/lib/supabase'

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
}

// 카테고리 ID to 이름 매핑
const CATEGORY_NAME_MAPPING: Record<number, string> = {
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
}

export interface ProductResult {
  id: number
  part_number: string
  image_url: string | null
  series_name: string | null
  series_id: number | null
  category_name: string
  category_id: number
  maker: string | null
}

export interface NewsResult {
  id: number
  title: string
  content: string
  thumbnail_url: string | null
  category_id: number | null
  created_at: string
}

export interface DownloadResult {
  id: number
  title: string
  file_name: string
  category_id: number | null
  created_at: string
}

export interface SearchResults {
  products: ProductResult[]
  news: NewsResult[]
  downloads: DownloadResult[]
  total: {
    products: number
    news: number
    downloads: number
  }
}

export interface SearchOptions {
  limit?: number
  includeProducts?: boolean
  includeNews?: boolean
  includeDownloads?: boolean
}

export class SearchService {
  /**
   * 통합 검색 기능
   */
  static async search(
    query: string, 
    options: SearchOptions = {}
  ): Promise<SearchResults> {
    const {
      limit = 20,
      includeProducts = true,
      includeNews = true,
      includeDownloads = true
    } = options

    if (!query || !query.trim()) {
      throw new Error('Search query is required')
    }

    const searchTerm = query.trim()
    const results: SearchResults = {
      products: [],
      news: [],
      downloads: [],
      total: {
        products: 0,
        news: 0,
        downloads: 0
      }
    }

    // 병렬로 검색 실행
    const promises: Promise<void>[] = []

    if (includeProducts) {
      promises.push(this.searchProducts(searchTerm, limit, results))
    }

    if (includeNews) {
      promises.push(this.searchNews(searchTerm, limit, results))
    }

    if (includeDownloads) {
      promises.push(this.searchDownloads(searchTerm, limit, results))
    }

    await Promise.all(promises)

    // 제품 결과를 part_number 기준으로 정렬
    results.products.sort((a, b) => a.part_number.localeCompare(b.part_number))

    return results
  }

  /**
   * 제품만 검색
   */
  static async searchProducts(
    searchTerm: string, 
    limit: number, 
    results: SearchResults
  ): Promise<void> {
    const categoryIds = Object.keys(CATEGORY_TABLE_MAPPING).map(Number)
    
    for (const categoryId of categoryIds) {
      const tableName = CATEGORY_TABLE_MAPPING[categoryId]
      const categoryName = CATEGORY_NAME_MAPPING[categoryId]
      
      try {
        const { data: products, error } = await supabase
          .from(tableName)
          .select(`
            id,
            part_number,
            image_url,
            series_id,
            maker,
            series(id, series_name)
          `)
          .or(`part_number.ilike.%${searchTerm}%,maker.ilike.%${searchTerm}%`)
          .eq('is_active', true)
          .limit(limit)

        if (error) {
          console.warn(`Search error in ${tableName}:`, error)
          continue
        }

        if (products && products.length > 0) {
          const formattedProducts: ProductResult[] = products.map(product => ({
            id: product.id,
            part_number: product.part_number,
            image_url: product.image_url,
            series_name: (product.series as any)?.series_name || null,
            series_id: product.series_id,
            category_name: categoryName,
            category_id: categoryId,
            maker: product.maker
          }))

          results.products.push(...formattedProducts)
          results.total.products += formattedProducts.length
        }
      } catch (err) {
        console.warn(`Error searching in ${tableName}:`, err)
        continue
      }
    }
  }

  /**
   * 뉴스만 검색
   */
  static async searchNews(
    searchTerm: string, 
    limit: number, 
    results: SearchResults
  ): Promise<void> {
    try {
      const { data: news, error } = await supabase
        .from('news')
        .select('id, title, content, thumbnail_url, category_id, created_at')
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (!error && news) {
        results.news = news
        results.total.news = news.length
      } else if (error) {
        console.warn('News search error:', error)
      }
    } catch (err) {
      console.warn('Error searching news:', err)
    }
  }

  /**
   * 다운로드만 검색
   */
  static async searchDownloads(
    searchTerm: string, 
    limit: number, 
    results: SearchResults
  ): Promise<void> {
    try {
      const { data: downloads, error } = await supabase
        .from('downloads')
        .select('id, title, file_name, category_id, created_at')
        .or(`title.ilike.%${searchTerm}%,file_name.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (!error && downloads) {
        results.downloads = downloads
        results.total.downloads = downloads.length
      } else if (error) {
        console.warn('Downloads search error:', error)
      }
    } catch (err) {
      console.warn('Error searching downloads:', err)
    }
  }

  /**
   * 검색어 제안 기능 (선택사항)
   */
  static async getSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) {
      return []
    }

    const suggestions: Set<string> = new Set()
    const searchTerm = query.trim()

    try {
      // 제품 part_number에서 제안
      const categoryIds = Object.keys(CATEGORY_TABLE_MAPPING).map(Number)
      
      for (const categoryId of categoryIds.slice(0, 3)) { // 성능을 위해 3개 카테고리만
        const tableName = CATEGORY_TABLE_MAPPING[categoryId]
        
        const { data: products } = await supabase
          .from(tableName)
          .select('part_number')
          .ilike('part_number', `%${searchTerm}%`)
          .eq('is_active', true)
          .limit(5)

        if (products) {
          products.forEach(product => {
            if (product.part_number) {
              suggestions.add(product.part_number)
            }
          })
        }
      }

      // 뉴스 제목에서 제안
      const { data: news } = await supabase
        .from('news')
        .select('title')
        .ilike('title', `%${searchTerm}%`)
        .limit(3)

      if (news) {
        news.forEach(item => {
          const words = item.title.split(' ')
          words.forEach(word => {
            if (word.length > 2 && word.toLowerCase().includes(searchTerm.toLowerCase())) {
              suggestions.add(word)
            }
          })
        })
      }

      return Array.from(suggestions).slice(0, 8)
    } catch (err) {
      console.warn('Error getting suggestions:', err)
      return []
    }
  }

  /**
   * 최근 검색어 관리 (로컬스토리지 기반)
   */
  static getRecentSearches(): string[] {
    try {
      const recent = localStorage.getItem('virex_recent_searches')
      return recent ? JSON.parse(recent) : []
    } catch {
      return []
    }
  }

  static addRecentSearch(query: string): void {
    try {
      const recent = this.getRecentSearches()
      const trimmedQuery = query.trim()
      
      if (!trimmedQuery) return

      // 중복 제거 및 맨 앞에 추가
      const filtered = recent.filter(item => item !== trimmedQuery)
      const newRecent = [trimmedQuery, ...filtered].slice(0, 10) // 최대 10개

      localStorage.setItem('virex_recent_searches', JSON.stringify(newRecent))
    } catch (err) {
      console.warn('Error saving recent search:', err)
    }
  }

  static clearRecentSearches(): void {
    try {
      localStorage.removeItem('virex_recent_searches')
    } catch (err) {
      console.warn('Error clearing recent searches:', err)
    }
  }
}