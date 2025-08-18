'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import styles from '../../../app/(portal)/products/products.module.css'

interface ProductSearchHeaderProps {
  totalCount?: number
  onSearch?: (searchTerm: string) => void
}

export default function ProductSearchHeader({ 
  totalCount = 0, 
  onSearch 
}: ProductSearchHeaderProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchTerm)
  }

  return (
    <div className={styles.productSearchHeader}>
      <div className={styles.productCount}>
        <span className={styles.countLabel}>검색결과</span>
        <span className={styles.countNumber}>{totalCount.toLocaleString()}</span>
        <span className={styles.countUnit}>개</span>
      </div>
      
      <div className={styles.searchSection}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchInputGroup}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Model, Part Number, 키워드로 검색하세요."
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              <Search size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}