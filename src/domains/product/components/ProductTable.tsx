'use client'

import { useState, useMemo, useCallback, memo, useRef, useEffect } from 'react'
import styles from '../../../app/(portal)/products/products.module.css'
import type { Product } from '../types'
import Pagination from '@/components/ui/Pagination'
import { getColumnConfigForCategory, formatColumnValue, type ColumnConfig } from '@/config/productColumns'

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
  columnConfigs?: ColumnConfig[]  // 동적 컬럼 설정
  categoryId?: number  // 카테고리 ID 추가
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
  columnConfigs = [],
  categoryId
}: ProductTableProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  
  // 상단과 하단 스크롤 컨테이너 참조
  const topScrollRef = useRef<HTMLDivElement>(null)
  const bottomScrollRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const [tableWidth, setTableWidth] = useState('1000px')
  const isSyncing = useRef(false)


  // displayColumns를 먼저 정의
  const displayColumns = useMemo(() => {
    // 1. 전달받은 columnConfigs 사용 (최우선)
    if (columnConfigs && columnConfigs.length > 0) {
      return columnConfigs
    }
    
    // 2. 카테고리 기반 설정 파일 사용
    if (categoryId) {
      return getColumnConfigForCategory(categoryId)
    }
    
    // 3. Fallback: 제품 데이터에서 자동으로 컬럼 생성
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
  }, [columnConfigs, categoryId, products])

  // 스크롤 이벤트 리스너 등록 - DOM 요소가 렌더링된 후에 실행
  useEffect(() => {
    // DOM 요소가 존재할 때까지 기다리는 함수
    const setupScrollListeners = () => {
      const topScroll = topScrollRef.current
      const bottomScroll = bottomScrollRef.current
      
      // 요소가 아직 없으면 다시 시도
      if (!topScroll || !bottomScroll) {
        setTimeout(setupScrollListeners, 100)
        return
      }
      
      // syncScroll 함수 정의
      const syncScroll = (source: 'top' | 'bottom') => {
        if (isSyncing.current) return
        if (!topScrollRef.current || !bottomScrollRef.current) return
        
        isSyncing.current = true
        
        if (source === 'top') {
          bottomScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft
        } else {
          topScrollRef.current.scrollLeft = bottomScrollRef.current.scrollLeft
        }
        
        // 동기화 완료 후 플래그 리셋
        requestAnimationFrame(() => {
          isSyncing.current = false
        })
      }
      
      const handleTopScroll = () => syncScroll('top')
      const handleBottomScroll = () => syncScroll('bottom')
      
      // 이벤트 리스너 등록
      topScroll.addEventListener('scroll', handleTopScroll)
      bottomScroll.addEventListener('scroll', handleBottomScroll)
      
      // 클린업 함수 반환
      return () => {
        topScroll.removeEventListener('scroll', handleTopScroll)
        bottomScroll.removeEventListener('scroll', handleBottomScroll)
      }
    }
    
    // 초기 설정 시도
    const cleanup = setupScrollListeners()
    
    return cleanup
  }, [products, displayColumns]) // products나 displayColumns가 변경될 때마다 다시 설정

  // 테이블 너비 업데이트
  useEffect(() => {
    const updateTableWidth = () => {
      if (tableRef.current) {
        // 약간의 지연을 주어 테이블이 완전히 렌더링된 후 실행
        setTimeout(() => {
          if (tableRef.current) {
            const width = tableRef.current.scrollWidth
            setTableWidth(`${width}px`)
          }
        }, 100)
      }
    }
    
    updateTableWidth()
    window.addEventListener('resize', updateTableWidth)
    
    return () => {
      window.removeEventListener('resize', updateTableWidth)
    }
  }, [products, displayColumns])

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
    if ((e.target as HTMLInputElement).type === 'checkbox') {
      return
    }
    window.location.href = `/products/${encodeURIComponent(product.part_number)}`
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
        {/* 상단 스크롤바 컨테이너 */}
        <div className={styles.topScrollContainer} ref={topScrollRef}>
          <div className={styles.topScrollContent} style={{ width: tableWidth }} />
        </div>
        
        {/* 기존 테이블 컨테이너 */}
        <div className={styles.productListContainer} ref={bottomScrollRef}>
          <table className={styles.productList} ref={tableRef}>
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
                              {product.is_discontinued && <span className={styles.discontinuedBadge}>단종</span>}
                              <span className={styles.modelName}>{value || '-'}</span>
                            </>
                          )
                        } else if (value !== null && value !== undefined) {
                          // 일반 값 표시 (숫자, 문자열 등) - 단위 포함
                          displayValue = formatColumnValue(value, column)
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