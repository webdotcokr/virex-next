'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from '../app/(portal)/products/products.module.css'

interface FloatingActionButtonsProps {
  selectedProductsCount?: number
  onProductInquiry?: () => void
  onProductComparison?: () => void
}

export default function FloatingActionButtons({
  selectedProductsCount = 0,
  onProductInquiry,
  onProductComparison
}: FloatingActionButtonsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleProductInquiry = () => {
    if (onProductInquiry) {
      onProductInquiry()
    } else {
      // 기본 동작: 제품문의 페이지로 이동
      window.location.href = '/support/inquiry'
    }
  }

  const handleProductComparison = () => {
    if (selectedProductsCount === 0) {
      alert('비교할 제품을 선택해주세요.')
      return
    }
    
    if (onProductComparison) {
      onProductComparison()
    }
  }

  return (
    <div className={styles.floatingActionButtons}>
      {/* 제품문의 버튼 */}
      <button 
        className={styles.btnProductAction}
        onClick={handleProductInquiry}
        title="제품문의"
      >
        <img src="/img/btn-question.png" alt="제품문의" />
      </button>

      {/* 제품비교 버튼 */}
      <button 
        className={styles.btnProductAction}
        onClick={handleProductComparison}
        title="제품비교"
      >
        <img src="/img/btn-compare-product.png" alt="제품비교" />
        {selectedProductsCount > 0 && (
          <span className={styles.compareCount}>
            {selectedProductsCount}
          </span>
        )}
      </button>

      {/* 기술지식 버튼 */}
      <Link href="https://blog.virex.co.kr" target="_blank" rel="noopener noreferrer">
        <button 
          className={styles.btnProductAction}
          title="기술지식"
        >
          <img src="/img/btn-knowledge.png" alt="기술지식" />
        </button>
      </Link>
    </div>
  )
}