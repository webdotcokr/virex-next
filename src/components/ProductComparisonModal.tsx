'use client'

import { useEffect, useMemo } from 'react'
import { X } from 'lucide-react'
import type { Product } from '../domains/product/types'
import { getColumnConfigForCategory, formatColumnValue, type ColumnConfig } from '../config/productColumns'

interface ProductComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  onRemoveProduct: (productId: string) => void
}

export default function ProductComparisonModal({
  isOpen,
  onClose,
  products,
  onRemoveProduct
}: ProductComparisonModalProps) {
  // 카테고리별 동적 컬럼 설정 계산
  const comparisonFields = useMemo(() => {
    if (products.length === 0) return []

    // 모든 제품의 카테고리 ID 수집
    const categoryIds = new Set<number>()
    products.forEach(product => {
      if (product.category_id) {
        categoryIds.add(product.category_id)
      }
    })

    // Fallback: 카테고리 ID가 없을 경우 기본 카테고리(CIS=9) 사용
    if (categoryIds.size === 0) {
      console.warn('⚠️ No category_id found in products, using default category 9 (CIS)')
      categoryIds.add(9)
    }

    console.log('🔍 Detected category IDs:', Array.from(categoryIds))

    // 여러 카테고리가 섞여있을 경우 모든 카테고리의 컬럼을 합침
    const allColumns: ColumnConfig[] = []
    Array.from(categoryIds).forEach(categoryId => {
      const columns = getColumnConfigForCategory(categoryId)
      console.log(`📋 Category ${categoryId} columns:`, columns.map(c => c.column_name))
      
      columns.forEach(col => {
        // 모든 컬럼 추가 (기본 필드 포함)
        // 중복 제거: 이미 같은 column_name이 있는지 확인
        if (!allColumns.some(existing => existing.column_name === col.column_name)) {
          allColumns.push(col)
        }
      })
    })

    console.log('📊 Final comparison fields:', allColumns.map(c => c.column_name))
    return allColumns
  }, [products])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  // 실제 제품 필드에서 값을 직접 가져오는 함수
  const getFieldValue = (product: Product, columnConfig: ColumnConfig): string => {
    const fieldName = columnConfig.column_name
    const value = (product as any)[fieldName]
    
    if (value === null || value === undefined || value === '') {
      return '-'
    }

    return formatColumnValue(value, columnConfig)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl">
          {/* Header */}
          <div className="bg-[#1a3a52] px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">
                제품 비교
              </h3>
              <button
                type="button"
                className="rounded-md bg-transparent text-white hover:text-gray-200 focus:outline-none"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="bg-white px-6 py-4">
            {products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">비교할 제품이 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 bg-gray-100 p-3 text-left text-sm font-medium text-gray-700 w-40">
                        &nbsp;
                      </th>
                      {products.map((product) => (
                        <th key={product.id} className="border border-gray-300 bg-[#1a3a52] p-3 text-center min-w-[200px]">
                          <div className="relative">
                            {/* 제품 이미지 */}
                            <div className="mb-2 flex justify-center">
                              <img 
                                src={product.image_url || '/common/virex-logo-color.png'} 
                                alt={product.part_number}
                                className="h-24 w-auto object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/common/virex-logo-color.png'
                                }}
                              />
                            </div>
                            {/* 제품 정보 */}
                            <div className="text-white">
                              <div className="font-semibold text-sm mb-1">
                                {product.series || 'LineX CIS Max'}
                              </div>
                              <button
                                onClick={() => window.open(`/support/inquiry?products=${encodeURIComponent(product.part_number)}`, '_blank')}
                                className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded transition-colors"
                              >
                                상품 문의하기
                              </button>
                            </div>
                            {/* 제거 버튼 */}
                            <button
                              onClick={() => onRemoveProduct(product.part_number)}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                              title="제품 제거"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* 동적 스펙 비교 - productColumns.ts 기반 (모든 필드 포함) */}
                    {comparisonFields.map((columnConfig) => (
                      <tr key={columnConfig.column_name}>
                        <td className="border border-gray-300 bg-gray-100 p-3 text-sm font-medium text-gray-700">
                          {columnConfig.column_label}
                        </td>
                        {products.map((product) => (
                          <td key={product.id} className="border border-gray-300 p-3 text-sm text-gray-900 text-center">
                            {getFieldValue(product, columnConfig)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}