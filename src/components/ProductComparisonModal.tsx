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

// 스펙 필드 라벨 매핑
const specFieldLabels: Record<string, string> = {
  scan_width: 'Scan width',
  dpi: 'DPI',
  resolution: 'Resolution',
  line_rate: 'Line rate',
  speed: 'Speed',
  wd: 'WD',
  no_of_pixels: 'No. of Pixels',
  spectrum: 'Spectrum',
  interface: 'Interface',
  mega_pixel: 'Mega Pixel',
  frame_rate: 'Frame Rate',
  sensor_model: 'Sensor Model',
  lens_mount: 'Lens Mount'
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

  const getFieldLabel = (field: string): string => {
    return specFieldLabels[field] || field
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
                    {/* Series */}
                    <tr>
                      <td className="border border-gray-300 bg-gray-100 p-3 text-sm font-medium text-gray-700">
                        Series
                      </td>
                      {products.map((product) => (
                        <td key={product.id} className="border border-gray-300 p-3 text-sm text-gray-900 text-center">
                          {product.series || '-'}
                        </td>
                      ))}
                    </tr>
                    
                    {/* Part Number */}
                    <tr>
                      <td className="border border-gray-300 bg-gray-100 p-3 text-sm font-medium text-gray-700">
                        Part Number
                      </td>
                      {products.map((product) => (
                        <td key={product.id} className="border border-gray-300 p-3 text-sm text-gray-900 text-center">
                          {product.part_number}
                        </td>
                      ))}
                    </tr>

                    {/* 동적 스펙 비교 */}
                    {specificationFields.map((field) => (
                      <tr key={field}>
                        <td className="border border-gray-300 bg-gray-100 p-3 text-sm font-medium text-gray-700">
                          {getFieldLabel(field)}
                        </td>
                        {products.map((product) => (
                          <td key={product.id} className="border border-gray-300 p-3 text-sm text-gray-900 text-center">
                            {getSpecValue(product, field)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    
                    {/* Maker */}
                    <tr>
                      <td className="border border-gray-300 bg-gray-100 p-3 text-sm font-medium text-gray-700">
                        Maker
                      </td>
                      {products.map((product) => (
                        <td key={product.id} className="border border-gray-300 p-3 text-sm text-gray-900 text-center">
                          {product.maker_name || 'INSNEX'}
                        </td>
                      ))}
                    </tr>
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