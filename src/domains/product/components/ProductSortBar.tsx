'use client'

import { useState, useEffect } from 'react'
import styles from '../../../app/(portal)/products/products.module.css'

interface ProductSortBarProps {
  itemsPerPage?: number
  onItemsPerPageChange?: (count: number) => void
  onSearch?: (searchTerm: string) => void
  searchPlaceholder?: string
  initialSearchTerm?: string // 초기 검색어 prop 추가
}

export default function ProductSortBar({
  itemsPerPage = 20,
  onItemsPerPageChange,
  onSearch,
  searchPlaceholder = "Model, 파트넘버, 키워드로 검색하세요.",
  initialSearchTerm = ''
}: ProductSortBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)

  // Update searchTerm when initialSearchTerm changes (e.g., from URL)
  useEffect(() => {
    setSearchTerm(initialSearchTerm)
  }, [initialSearchTerm])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchTerm)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSearch?.(searchTerm)
    }
  }

  return (
    <div className={styles.productListSortBar}>
      {/* 좌측: 표시 개수 선택 */}
      <div className={styles.sortBarItem}>
        <select 
          name="display_count"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange?.(parseInt(e.target.value))}
        >
          <option value="10">10개씩 보기</option>
          <option value="20">20개씩 보기</option>
          <option value="40">40개씩 보기</option>
        </select>
      </div>

      {/* 우측: 검색창 */}
      <div className={`${styles.searchBar} ${styles.sortBarItem}`}>
        <input
          id="search-input"
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleSearchKeyPress}
        />
        <span 
          className={styles.searchIcon}
          id="search-button"
          onClick={() => onSearch?.(searchTerm)}
        />
      </div>
    </div>
  )
}