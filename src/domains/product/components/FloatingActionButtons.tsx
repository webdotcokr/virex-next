'use client'

import styles from '../../../app/(portal)/products/products.module.css'

interface FloatingActionButtonsProps {
  selectedProductsCount?: number
  selectedProducts?: string[]
  onProductQuestion?: () => void
  onProductComparison?: () => void
  onKnowledgeCenter?: () => void
  onShowComparisonLimitWarning?: () => void
}

export default function FloatingActionButtons({
  selectedProductsCount = 0,
  selectedProducts = [],
  onProductQuestion,
  onProductComparison,
  onKnowledgeCenter,
  onShowComparisonLimitWarning
}: FloatingActionButtonsProps) {
  
  const handleProductQuestion = () => {
    onProductQuestion?.()
  }

  const handleProductComparison = () => {
    // 최대 4개 제품만 비교 가능
    if (selectedProductsCount > 4) {
      onShowComparisonLimitWarning?.()
      return
    }
    
    // 1개 이상 선택된 경우에만 비교 실행
    if (selectedProductsCount > 0) {
      onProductComparison?.()
    } else {
      alert('비교할 제품을 선택해주세요.')
    }
  }

  const handleKnowledgeCenter = () => {
    // 기본적으로 블로그로 이동
    window.open('https://blog.virex.co.kr', '_blank')
    onKnowledgeCenter?.()
  }

  return (
    <div className={styles.floatingActionButtons}>
      {/* 제품 문의 버튼 */}
      <button 
        className={styles.btnProductAction}
        id="btn-float-product-question"
        onClick={handleProductQuestion}
        title="제품 문의"
      >
        <img src="/img/btn-question.png" alt="제품문의" />
      </button>

      {/* 제품 비교 버튼 */}
      <button 
        className={styles.btnProductAction}
        id="btn-float-compare-product"
        onClick={handleProductComparison}
        title="제품 비교"
      >
        <img src="/img/btn-compare-product.png" alt="제품비교" />
        {selectedProductsCount > 0 && (
          <span className={styles.compareCount}>
            {selectedProductsCount}
          </span>
        )}
      </button>

      {/* 기술 지식 버튼 */}
      <button 
        className={styles.btnProductAction}
        id="btn-float-knowledge-product"
        onClick={handleKnowledgeCenter}
        title="기술 지식"
      >
        <img src="/img/btn-knowledge.png" alt="기술지식" />
      </button>
    </div>
  )
}