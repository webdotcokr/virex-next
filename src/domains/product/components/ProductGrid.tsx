'use client'

import Link from 'next/link'
import { generateProductSlug } from '@/lib/utils'
import type { Product } from '../types'

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-4m-4 0H8m8 0v-3a2 2 0 00-2-2H8a2 2 0 00-2 2v3" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">제품이 없습니다</h3>
        <p className="text-gray-500">현재 조건에 맞는 제품이 없습니다. 필터를 조정해보세요.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-700">
          <span className="font-medium">{products.length}</span>개의 제품이 검색되었습니다
        </p>
        
        {/* Sort Options - will be implemented later */}
        <div className="flex items-center space-x-4">
          <label htmlFor="sort" className="text-sm font-medium text-gray-700">
            정렬:
          </label>
          <select
            id="sort"
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            defaultValue="name"
          >
            <option value="name">이름순</option>
            <option value="partnumber">제품번호순</option>
            <option value="created_at">등록일순</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

interface ProductCardProps {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  const slug = product.part_number
  
  return (
    <Link 
      href={`/products/${encodeURIComponent(slug)}`}
      className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {product.is_new && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
              NEW
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">
            {product.partnumber}
          </span>
          <span className="text-xs text-gray-400">
            {product.series}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
        {product.category && (
          <div className="flex items-center text-xs text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded">
              {product.category.name}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}