import { httpQueries } from '@/lib/http-supabase'
import type { Category } from '../types'

export interface CategoryInfo {
  id: string
  name: string
  enName: string
  description: string
  backgroundImage: string
}

export class CategoryService {
  /**
   * 모든 카테고리 조회
   */
  static async getAllCategories(): Promise<Category[]> {
    console.log('Fetching all categories from Supabase...')
    
    const { data, error } = await httpQueries.getCategories()

    if (error) {
      console.error('Categories fetch error:', error)
      throw new Error(`Failed to fetch categories: ${error.message}`)
    }

    console.log('Categories fetched successfully:', data?.length || 0, 'categories')
    return data || []
  }

  /**
   * 특정 카테고리 조회 (DB에서 직접 조회)
   */
  static async getCategoryById(categoryId: string | number): Promise<any | null> {
    console.log('Fetching category by ID:', categoryId)
    
    const { data, error } = await httpQueries.getCategoryById(String(categoryId))

    if (error) {
      console.error('Category fetch error:', error)
      throw new Error(`Failed to fetch category: ${error.message}`)
    }

    return data
  }

  /**
   * 브레드크럼 생성 (간소화된 버전)
   */
  static getBreadcrumbs(categoryId: string | number, categoryName?: string): Array<{label: string, href?: string, active?: boolean}> {
    const categoryTitle = categoryName || 'Product'
    return [
      { label: 'Home', href: '/' },
      { label: '제품', href: '/products' },
      { label: categoryTitle, active: true }
    ]
  }

  /**
   * 루트 카테고리들 조회 (parent_id가 null인 카테고리들)
   * 현재는 httpQueries.getCategories() 사용하여 모든 카테고리 반환
   */
  static async getRootCategories(): Promise<Category[]> {
    console.log('Fetching root categories...')
    
    const { data, error } = await httpQueries.getCategories()

    if (error) {
      console.error('Root categories fetch error:', error)
      throw new Error(`Failed to fetch root categories: ${error.message}`)
    }

    // parent_id가 null인 카테고리들만 필터링
    const rootCategories = data.filter(cat => !cat.parent_id)

    console.log('Root categories fetched successfully:', rootCategories?.length || 0, 'categories')
    return rootCategories || []
  }
}