'use client'

import { useState, useEffect } from 'react'
import { Grid, List } from 'lucide-react'
import ProductTable from './ProductTable'
import ProductCard from './ProductCard'
import styles from '../../../app/(portal)/products/products.module.css'
import type { Product } from '../types'

interface ProductGridViewProps {
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

type ViewMode = 'table' | 'card'

export default function ProductGridView({
  products,
  currentPage = 1,
  itemsPerPage = 20,
  sortBy,
  sortDirection = 'asc',
  onSort,
  onPageChange,
  onCompareChange,
  isLoading = false
}: ProductGridViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  // Auto-switch to card view on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setViewMode('card')
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleCompareChange = (productIds: string[]) => {
    setSelectedProducts(productIds)
    onCompareChange?.(productIds)
  }

  const handleSingleCompareChange = (productId: string, checked: boolean) => {
    const newSelected = checked 
      ? [...selectedProducts, productId]
      : selectedProducts.filter(id => id !== productId)
    
    if (newSelected.length <= 3) {
      handleCompareChange(newSelected)
    }
  }

  // Calculate pagination for card view
  const totalPages = Math.ceil(products.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducts = products.slice(startIndex, endIndex)

  if (isLoading) {
    return (
      <div className={styles.productListWrapper}>
        <div className={styles.productListContainer}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <div className={styles.loadingMessage}>데이터를 불러오는 중입니다...</div>
          </div>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className={styles.productListWrapper}>
        <div className={styles.productListContainer}>
          <div style={{textAlign: 'center', padding: '50px'}}>
            검색 결과가 없습니다.
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* View Toggle - Hidden on mobile via CSS */}
      <div className={styles.viewToggle}>
        <button
          className={`${styles.viewToggleButton} ${viewMode === 'table' ? styles.active : ''}`}
          onClick={() => setViewMode('table')}
          title="테이블 보기"
        >
          <List size={16} />
        </button>
        <button
          className={`${styles.viewToggleButton} ${viewMode === 'card' ? styles.active : ''}`}
          onClick={() => setViewMode('card')}
          title="카드 보기"
        >
          <Grid size={16} />
        </button>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'table' ? (
        <ProductTable
          products={products}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={onSort}
          onPageChange={onPageChange}
          onCompareChange={handleCompareChange}
          isLoading={isLoading}
        />
      ) : (
        <>
          {/* Card Grid */}
          <div className={styles.productCardsGrid}>
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onCompareChange={handleSingleCompareChange}
                isSelected={selectedProducts.includes(product.part_number)}
                compareDisabled={!selectedProducts.includes(product.part_number) && selectedProducts.length >= 3}
              />
            ))}
          </div>

          {/* Pagination for Card View */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              {currentPage > 1 && (
                <button onClick={() => onPageChange?.(currentPage - 1)}>
                  이전
                </button>
              )}
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange?.(page)}
                  className={page === currentPage ? styles.current : ''}
                >
                  {page}
                </button>
              ))}
              
              {currentPage < totalPages && (
                <button onClick={() => onPageChange?.(currentPage + 1)}>
                  다음
                </button>
              )}
            </div>
          )}
        </>
      )}
    </>
  )
}