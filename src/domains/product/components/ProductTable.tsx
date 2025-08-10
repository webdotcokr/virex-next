'use client'

import { useState, useMemo, useCallback } from 'react'
import styles from '../../../app/(portal)/products/products.module.css'
import type { Product } from '../types'

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

  // 제품 데이터에서 동적으로 컬럼 생성
  const columnConfigs = useMemo(() => {
    if (!products || products.length === 0) return []
    
    // 첫 번째 제품의 키를 기반으로 컬럼 생성
    const firstProduct = products[0]
    const skipKeys = ['id', 'created_at', 'updated_at', 'category', 'partnumber', 'name', 'series']
    
    // 우선순위 컬럼 정의
    const priorityColumns = ['part_number', 'maker', 'series_name', 'is_active', 'is_new']
    const columns: string[] = []
    
    // 우선순위 컬럼 먼저 추가
    priorityColumns.forEach(col => {
      if (col in firstProduct) {
        columns.push(col)
      }
    })
    
    // 나머지 컬럼 추가
    Object.keys(firstProduct).forEach(key => {
      if (!skipKeys.includes(key) && !priorityColumns.includes(key)) {
        columns.push(key)
      }
    })
    
    return columns.map((key, index) => ({
      parameter_name: key,
      label: key.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      display_order: index,
      is_sortable: true
    }))
  }, [products])

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

  if (isLoading) {
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
                        // 제품 객체에서 직접 값 가져오기
                        const value = product[column.parameter_name]
                        let displayValue: React.ReactNode = '-'
                        
                        // 특별한 처리가 필요한 컬럼들
                        if (column.parameter_name === 'part_number') {
                          displayValue = (
                            <>
                              {product.is_new && <span className={styles.newBadge}>NEW</span>}
                              <span className={styles.modelName}>{value || '-'}</span>
                            </>
                          )
                        } else if (column.parameter_name === 'is_active' || column.parameter_name === 'is_new') {
                          displayValue = value ? '✓' : '-'
                        } else if (value !== null && value !== undefined) {
                          // 일반 값 표시
                          displayValue = String(value)
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