'use client'

import { useEffect } from 'react'
import styles from '../../../app/(portal)/products/products.module.css'

interface ComparisonLimitModalProps {
  isOpen: boolean
  onClose: () => void
  maxProducts?: number
}

export default function ComparisonLimitModal({ 
  isOpen, 
  onClose, 
  maxProducts = 4 
}: ComparisonLimitModalProps) {
  
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className={styles.modalBackdrop}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={styles.comparisonLimitModal}>
        <div className={styles.modalHeader}>
          <h3>제품 비교 제한</h3>
          <button 
            className={styles.modalCloseButton}
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>
        
        <div className={styles.modalContent}>
          <div className={styles.warningIcon}>
            ⚠️
          </div>
          <p>
            최대 <strong>{maxProducts}개</strong>의 제품까지만 비교할 수 있습니다.
          </p>
          <p>
            일부 제품을 제거한 후 다시 시도해주세요.
          </p>
        </div>
        
        <div className={styles.modalActions}>
          <button 
            className={styles.modalConfirmButton}
            onClick={onClose}
          >
            확인
          </button>
        </div>
      </div>
    </>
  )
}