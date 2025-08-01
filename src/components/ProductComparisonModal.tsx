'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Product } from '../domains/product/types'

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
  const [specificationFields, setSpecificationFields] = useState<string[]>([])

  useEffect(() => {
    if (products.length > 0) {
      // 모든 제품의 스펙 필드를 수집
      const allFields = new Set<string>()
      products.forEach(product => {
        if (product.specifications) {
          Object.keys(product.specifications).forEach(field => allFields.add(field))
        }
      })
      setSpecificationFields(Array.from(allFields))
    }
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

  const getSpecValue = (product: Product, field: string): string => {
    if (!product.specifications || !product.specifications[field]) {
      return '-'
    }
    const value = product.specifications[field]
    return typeof value === 'object' ? JSON.stringify(value) : String(value)
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
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                제품 비교 ({products.length}개)
              </h3>
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">비교할 제품이 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                        항목
                      </th>
                      {products.map((product) => (
                        <th key={product.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-64">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">
                                {product.part_number}
                              </div>
                              <div className="text-xs text-gray-500">
                                {product.series}
                              </div>
                            </div>
                            <button
                              onClick={() => onRemoveProduct(product.part_number)}
                              className="ml-2 text-red-400 hover:text-red-600"
                              title="제품 제거"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* 기본 정보 */}
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        제조사
                      </td>
                      {products.map((product) => (
                        <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.maker_name || '-'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        카테고리
                      </td>
                      {products.map((product) => (
                        <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.category?.name || '-'}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        상태
                      </td>
                      {products.map((product) => (
                        <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.is_new ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              신제품
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* 동적 스펙 비교 */}
                    {specificationFields.map((field, index) => (
                      <tr key={field} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {field}
                        </td>
                        {products.map((product) => (
                          <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getSpecValue(product, field)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
              onClick={() => {
                if (products.length > 0) {
                  // 제품문의 페이지로 이동하면서 선택된 제품 정보 전달
                  const productNames = products.map(p => p.part_number).join(', ')
                  window.location.href = `/support/inquiry?product_name=${encodeURIComponent(productNames)}`
                }
              }}
            >
              제품문의하기
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              onClick={onClose}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}