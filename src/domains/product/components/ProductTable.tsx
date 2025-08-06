'use client'

import { useState, useMemo, useCallback } from 'react'
import { useFilterStore } from '@/lib/store'
import { useTableMetadata, getVisibleColumns, getParameterLabel, getParameterUnit } from '@/lib/hooks/useTableMetadata'
import styles from '../../../app/(portal)/products/products.module.css'
import type { Product } from '../types'

// 컬럼 설정 인터페이스 (간소화)
interface ColumnConfig {
  parameter_name: string;
  label: string;
  display_order: number;
  unit?: string;
  is_sortable: boolean;
}

interface ProductTableProps {
  products: Product[]
  currentPage?: number
  itemsPerPage?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (field: string) => void
  onPageChange?: (page: number) => void
  onCompareChange?: (productIds: string[]) => void
  isLoading?: boolean
}

export default function ProductTable({ 
  products,
  currentPage = 1,
  itemsPerPage = 20,
  sortBy,
  sortDirection = 'asc',
  onSort,
  onPageChange,
  onCompareChange,
  isLoading = false
}: ProductTableProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const { filters } = useFilterStore()

  // 현재 카테고리 ID 계산
  const currentCategoryId = filters.categories.length > 0 ? filters.categories[0] : '9'
  
  // 공유 메타데이터 훅 사용
  const { metadata, loading } = useTableMetadata(currentCategoryId)

  // 메타데이터에서 컬럼 설정 생성 (메모이제이션)
  const columnConfigs = useMemo(() => {
    if (!metadata) return []
    
    const visibleColumns = getVisibleColumns(metadata)
    
    return visibleColumns.map(config => ({
      parameter_name: config.parameter_name,
      label: getParameterLabel(config.parameter_name, metadata),
      display_order: config.display_order,
      unit: getParameterUnit(config.parameter_name, metadata),
      is_sortable: true // 모든 컬럼이 정렬 가능하다고 가정
    }))
  }, [metadata])

  const handleCompareChange = useCallback((productId: string, checked: boolean) => {
    if (checked && selectedProducts.length >= 4) {
      // 최대 4개 제한
      alert('최대 4개의 제품만 비교할 수 있습니다.')
      return
    }
    
    const newSelected = checked 
      ? [...selectedProducts, productId]
      : selectedProducts.filter(id => id !== productId)
    
    setSelectedProducts(newSelected)
    onCompareChange?.(newSelected)
  }, [selectedProducts, onCompareChange])

  const handleSort = useCallback((field: string) => {
    onSort?.(field)
  }, [onSort])

  const handleRowClick = useCallback((product: Product, e: React.MouseEvent) => {
    // 체크박스 클릭은 제외
    if ((e.target as HTMLElement).type === 'checkbox') {
      return
    }
    window.location.href = `/products/${product.part_number}`
  }, [])

  // Calculate pagination with memoization
  const { totalPages, displayData } = useMemo(() => {
    const totalPages = Math.ceil(products.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedProducts = products.slice(startIndex, endIndex)
    
    return { totalPages, displayData: paginatedProducts }
  }, [products, currentPage, itemsPerPage])

  if (isLoading || loading) {
    return (
      <div className={styles.productListWrapper}>
        <div className={styles.productListContainer}>
          <table className={styles.productList}>
            <tbody>
              <tr>
                <td colSpan={11} className={styles.loadingCell}>
                  <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <div className={styles.loadingMessage}>데이터를 불러오는 중입니다...</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // displayData는 위의 useMemo에서 계산됨

  return (
    <>
      <div className={styles.productListWrapper}>
        <div className={styles.productListContainer}>
          <table className={styles.productList}>
            <thead>
              <tr>
                <th className={styles.colCompare}>비교</th>
                {columnConfigs.map((column) => (
                  <th 
                    key={column.parameter_name} 
                    style={{ width: 'auto' }}
                  >
                    {column.label}
                    {column.is_sortable && (
                      <img 
                        src="/img/icon-sort.svg" 
                        className={styles.sortIcon}
                        onClick={() => handleSort(column.parameter_name)}
                        alt="정렬"
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayData.length === 0 ? (
                <tr>
                  <td colSpan={columnConfigs.length + 1} className={styles.noDataCell}>
                    <div className={styles.noDataMessage}>
                      조건에 맞는 제품이 없습니다.
                    </div>
                  </td>
                </tr>
              ) : (
                // Sort products: is_new first
                [...displayData].sort((a, b) => {
                  if (a.is_new && !b.is_new) return -1
                  if (!a.is_new && b.is_new) return 1
                  return 0
                }).map((product) => (
                    <tr 
                      key={product.id}
                      onClick={(e) => handleRowClick(product, e)}
                      className={styles.productRow}
                    >
                      <td className={styles.colCompare}>
                        <input 
                          type="checkbox"
                          checked={selectedProducts.includes(product.part_number)}
                          onChange={(e) => handleCompareChange(product.part_number, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      {columnConfigs.map((column) => {
                        // Get the value based on parameter type
                        let value = '-'
                        let displayValue: React.ReactNode = '-'
                        
                        // 기본 필드들 처리
                        if (['part_number', 'maker_name', 'series'].includes(column.parameter_name)) {
                          switch (column.parameter_name) {
                            case 'maker_name':
                              value = product.maker_name || '-'
                              displayValue = value
                              break
                            case 'series':
                              value = product.series || '-'
                              displayValue = value
                              break
                            case 'part_number':
                              value = product.part_number
                              displayValue = (
                                <>
                                  {product.is_new && <span className={styles.newBadge}>NEW</span>}
                                  <span className={styles.modelName}>{value}</span>
                                </>
                              )
                              break
                          }
                        } else {
                          // Specification 필드들 처리
                          const specValue = product.specifications?.[column.parameter_name]
                          if (specValue !== null && specValue !== undefined) {
                            value = String(specValue)
                            // Unit 추가 (parameter_labels에서 가져온 unit 사용)
                            displayValue = column.unit 
                              ? `${value} ${column.unit}`
                              : value
                          }
                        }
                        
                        return (
                          <td key={column.parameter_name}>
                            {displayValue}
                          </td>
                        )
                      })}
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          {currentPage > 1 && (
            <button 
              onClick={() => onPageChange?.(currentPage - 1)}
              className={styles.paginationButton}
            >
              이전
            </button>
          )}
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange?.(page)}
              className={`${styles.paginationButton} ${page === currentPage ? styles.current : ''}`}
            >
              {page}
            </button>
          ))}
          
          {currentPage < totalPages && (
            <button 
              onClick={() => onPageChange?.(currentPage + 1)}
              className={styles.paginationButton}
            >
              다음
            </button>
          )}
        </div>
      )}
    </>
  )
}