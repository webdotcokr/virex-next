'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import styles from '../../../app/(portal)/products/products.module.css'
import type { Product } from '../types'
import Pagination from '@/components/ui/Pagination'
import { formatValueWithUnit } from '@/lib/units'

interface ProductTableProps {
  products: Product[]
  total?: number
  currentPage?: number
  itemsPerPage?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (field: string) => void
  onPageChange?: (page: number) => void
  onCompareChange?: (productIds: string[]) => void
  isLoading?: boolean
  columnConfigs?: any[]  // 동적 컬럼 설정
}

function ProductTable({ 
  products,
  total,
  currentPage = 1,
  itemsPerPage = 20,
  sortBy,
  sortDirection = 'asc',
  onSort,
  onPageChange,
  onCompareChange,
  isLoading = false,
  columnConfigs = []
}: ProductTableProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  // 동적 컬럼 설정 사용 (전달받은 columnConfigs 또는 fallback)
  const displayColumns = useMemo(() => {
    if (columnConfigs && columnConfigs.length > 0) {
      // DB에서 로드된 컬럼 설정 사용
      return columnConfigs.map(config => ({
        column_name: config.column_name,
        column_label: config.column_label,
        is_sortable: config.is_sortable || false,
        column_width: config.column_width || null
      }))
    }
    
    // Fallback: 제품 데이터에서 자동으로 컬럼 생성
    if (!products || products.length === 0) return []
    
    const firstProduct = products[0]
    // 관리용 필드들을 테이블에서 숨김처리
    const skipKeys = [
      // 기존 숨김 필드
      'id', 'created_at', 'updated_at', 'image_url', 'category_name', 'series_data', 'related_products',
      // 관리용 필드 추가
      'is_discontinued', 'is_active', 'series_id', 'category_id', 'maker_id', 'is_new'
    ]
    const priorityColumns = ['part_number', 'series', 'maker_name']
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
    
    return columns.map(key => ({
      column_name: key,
      column_label: key.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      is_sortable: true,
      column_width: null
    }))
  }, [columnConfigs, products])

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
    // series 컬럼 클릭 시 실제로는 series_id로 정렬
    const sortField = field === 'series' ? 'series_id' : field
    onSort?.(sortField)
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
    // Use the total prop if provided, otherwise fall back to products.length
    const actualTotal = total !== undefined ? total : products.length
    const totalPages = Math.ceil(actualTotal / itemsPerPage)
    
    // Products are already paginated from the server, so use them directly
    const displayProducts = products
    
    // Pagination calculation complete
    
    return { totalPages, displayData: displayProducts }
  }, [products, total, currentPage, itemsPerPage])

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
                {displayColumns.map((column) => (
                  <th 
                    key={column.column_name} 
                    style={{ width: column.column_width || 'auto' }}
                  >
                    {column.column_label}
                    {column.is_sortable && (
                      <img 
                        src="/img/icon-sort.svg" 
                        className={styles.sortIcon}
                        onClick={() => handleSort(column.column_name)}
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
                  <td colSpan={displayColumns.length + 1} className={styles.noDataCell}>
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
                      {displayColumns.map((column) => {
                        // 제품 객체에서 직접 값 가져오기 (specifications 대신 실제 컬럼)
                        const value = product[column.column_name as keyof Product]
                        let displayValue: React.ReactNode = '-'
                        
                        // 특별한 처리가 필요한 컬럼들
                        if (column.column_name === 'part_number') {
                          displayValue = (
                            <>
                              {product.is_new && <span className={styles.newBadge}>NEW</span>}
                              <span className={styles.modelName}>{value || '-'}</span>
                            </>
                          )
                        } else if (value !== null && value !== undefined) {
                          // 일반 값 표시 (숫자, 문자열 등) - 단위 포함
                          displayValue = formatValueWithUnit(value, column.column_name)
                        }
                        
                        return (
                          <td key={column.column_name}>
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
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => onPageChange?.(page)}
        showEllipsis={true}
      />
    </>
  )
}

export default memo(ProductTable)