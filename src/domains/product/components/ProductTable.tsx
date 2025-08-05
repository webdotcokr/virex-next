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
                <th className={styles.colBrand}>
                  브랜드
                  <img 
                    src="/img/icon-sort.svg" 
                    className={styles.sortIcon}
                    onClick={() => handleSort('maker_name')}
                    alt="정렬"
                  />
                </th>
                <th className={styles.colSeries}>
                  Series
                  <img 
                    src="/img/icon-sort.svg" 
                    className={styles.sortIcon}
                    onClick={() => handleSort('series')}
                    alt="정렬"
                  />
                </th>
                <th className={styles.colPartNumber}>
                  Part Number
                  <img 
                    src="/img/icon-sort.svg" 
                    className={styles.sortIcon}
                    onClick={() => handleSort('part_number')}
                    alt="정렬"
                  />
                </th>
                <th className={styles.colScanWidth}>
                  Scan Width
                  <img 
                    src="/img/icon-sort.svg" 
                    className={styles.sortIcon}
                    onClick={() => handleSort('scan_width')}
                    alt="정렬"
                  />
                </th>
                <th className={styles.colDpi}>
                  DPI
                  <img 
                    src="/img/icon-sort.svg" 
                    className={styles.sortIcon}
                    onClick={() => handleSort('dpi')}
                    alt="정렬"
                  />
                </th>
                <th className={styles.colResolution}>
                  Resolution
                  <img 
                    src="/img/icon-sort.svg" 
                    className={styles.sortIcon}
                    onClick={() => handleSort('resolution')}
                    alt="정렬"
                  />
                </th>
                <th className={styles.colLineRate}>
                  Line Rate
                  <img 
                    src="/img/icon-sort.svg" 
                    className={styles.sortIcon}
                    onClick={() => handleSort('line_rate')}
                    alt="정렬"
                  />
                </th>
                <th className={styles.colSpeed}>
                  Speed
                  <img 
                    src="/img/icon-sort.svg" 
                    className={styles.sortIcon}
                    onClick={() => handleSort('speed')}
                    alt="정렬"
                  />
                </th>
                <th className={styles.colWd}>
                  WD
                  <img 
                    src="/img/icon-sort.svg" 
                    className={styles.sortIcon}
                    onClick={() => handleSort('wd')}
                    alt="정렬"
                  />
                </th>
                <th className={styles.colPixels}>
                  No. of Pixels
                  <img 
                    src="/img/icon-sort.svg" 
                    className={styles.sortIcon}
                    onClick={() => handleSort('no_of_pixels')}
                    alt="정렬"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {displayData.length === 0 ? (
                <tr>
                  <td colSpan={11} className={styles.noDataCell}>
                    <div className={styles.noDataMessage}>
                      조건에 맞는 제품이 없습니다.
                    </div>
                  </td>
                </tr>
              ) : (
                displayData.map((product) => (
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
                    <td className={styles.colBrand}>
                      {product.maker_name || '-'}
                    </td>
                    <td className={styles.colSeries}>
                      {product.series || '-'}
                    </td>
                    <td className={styles.colPartNumber}>
                      <span className={styles.modelName}>
                        {product.part_number}
                      </span>
                    </td>
                    <td className={styles.colScanWidth}>
                      {product.specifications?.scan_width ? `${product.specifications.scan_width} mm` : '-'}
                    </td>
                    <td className={styles.colDpi}>
                      {product.specifications?.dpi ? `${product.specifications.dpi} dpi` : '-'}
                    </td>
                    <td className={styles.colResolution}>
                      {product.specifications?.resolution || '-'}
                    </td>
                    <td className={styles.colLineRate}>
                      {product.specifications?.line_rate ? `${product.specifications.line_rate} kHz` : '-'}
                    </td>
                    <td className={styles.colSpeed}>
                      {product.specifications?.speed ? `${product.specifications.speed} MHz` : '-'}
                    </td>
                    <td className={styles.colWd}>
                      {product.specifications?.wd || '-'}
                    </td>
                    <td className={styles.colPixels}>
                      {product.specifications?.no_of_pixels || '-'}
                    </td>
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