import Link from 'next/link'
import { ProductService } from '@/domains/product/services/product-service'
import type { Category } from '@/domains/product/types'

export const metadata = {
  title: '제품 카테고리 - Virex',
  description: '바이렉스의 모든 제품 카테고리를 한눈에 확인하고 원하는 카테고리의 제품을 탐색하세요.',
}

async function getCategories(): Promise<Category[]> {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, returning empty categories')
      return []
    }
    return await ProductService.getCategories()
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return []
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          제품 카테고리
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          다양한 카테고리의 제품들을 살펴보고 필요한 제품을 찾아보세요.
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?categories=${category.id}`}
              className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              
              {category.description && (
                <p className="text-gray-600 text-sm">
                  {category.description}
                </p>
              )}
              
              <div className="mt-4 text-blue-600 text-sm font-medium flex items-center">
                제품 보기
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-4m-4 0H8m8 0v-3a2 2 0 00-2-2H8a2 2 0 00-2 2v3" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">카테고리 정보 없음</h3>
          <p className="text-gray-500">현재 등록된 카테고리가 없습니다.</p>
        </div>
      )}
    </div>
  )
}