'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useFilterStore } from '@/lib/store'
import styles from '../../../app/(portal)/products/products.module.css'
import type { Product } from '../types'
import type { Database } from '@/lib/supabase'

type TableColumnConfig = Database['public']['Tables']['table_column_configs']['Row']

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
  const [columnConfigs, setColumnConfigs] = useState<TableColumnConfig[]>([])
  const [loading, setLoading] = useState(true)
  const { filters } = useFilterStore()

  // Load column configurations based on current category
  useEffect(() => {
    loadColumnConfigs()
  }, [filters.categories])

  const loadColumnConfigs = async () => {
    try {
      const currentCategoryId = filters.categories.length > 0 ? filters.categories[0] : '9'
      
      const { data, error } = await supabase
        .from('table_column_configs')
        .select('*')
        .eq('category_id', parseInt(currentCategoryId))
        .eq('is_visible', true)
        .order('sort_order')

      if (error) throw error
      setColumnConfigs(data || [])
    } catch (error) {
      console.error('Error loading column configs:', error)
    } finally {
      setLoading(false)
    }
  }

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
                    key={column.id} 
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
                        // Get the value based on column type
                        let value = '-'
                        let displayValue = '-'
                        
                        if (column.column_type === 'basic') {
                          // Basic fields
                          switch (column.column_name) {
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
                          // Specification fields
                          const specValue = product.specifications?.[column.column_name]
                          if (specValue !== null && specValue !== undefined) {
                            value = String(specValue)
                            // Add unit if it's a number
                            const units: Record<string, string> = {
                              scan_width: 'mm',
                              dpi: 'dpi',
                              line_rate: 'kHz',
                              speed: 'MHz'
                            }
                            displayValue = units[column.column_name] 
                              ? `${value} ${units[column.column_name]}`
                              : value
                          }
                        }
                        
                        return (
                          <td key={column.id}>
                            {typeof displayValue === 'string' ? displayValue : displayValue}
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