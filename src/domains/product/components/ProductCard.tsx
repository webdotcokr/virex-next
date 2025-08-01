'use client'

import { useState } from 'react'
import { extractCategorySpecifications, getSpecificationLabel, formatSpecificationValue } from '../config/specification-labels'
import styles from '../../../app/(portal)/products/products.module.css'
import type { Product } from '../types'

interface ProductCardProps {
  product: Product
  onCompareChange?: (productId: string, checked: boolean) => void
  isSelected?: boolean
  compareDisabled?: boolean
}

export default function ProductCard({ 
  product, 
  onCompareChange, 
  isSelected = false,
  compareDisabled = false 
}: ProductCardProps) {
  const [showAllSpecs, setShowAllSpecs] = useState(false)

  const { specificationFields, specificationLabels } = extractCategorySpecifications([product])
  
  const getSpecificationValue = (specName: string): string => {
    if (!product.specifications) return '-'
    const value = product.specifications[specName]
    return formatSpecificationValue(value)
  }

  const displaySpecs = showAllSpecs ? specificationFields : specificationFields.slice(0, 3)

  const handleCardClick = () => {
    window.location.href = `/products/${product.part_number}`
  }

  const handleCompareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    onCompareChange?.(product.part_number, e.target.checked)
  }

  return (
    <div className={styles.productCard} onClick={handleCardClick}>
      {/* Card Header */}
      <div className={styles.productCardHeader}>
        <div className={styles.productCardInfo}>
          <h3 className={styles.productCardTitle}>{product.part_number}</h3>
          <p className={styles.productCardSeries}>{product.series || '-'}</p>
          <p className={styles.productCardMaker}>{product.maker_name || '-'}</p>
        </div>
        <div className={styles.productCardActions}>
          {product.is_new && (
            <span className={styles.productCardBadge}>NEW</span>
          )}
          <label className={styles.productCardCheckbox} onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCompareChange}
              disabled={compareDisabled}
            />
            <span>비교</span>
          </label>
        </div>
      </div>

      {/* Card Body - Specifications */}
      <div className={styles.productCardBody}>
        <div className={styles.productCardSpecs}>
          {displaySpecs.map((field) => (
            <div key={field} className={styles.productCardSpec}>
              <span className={styles.specLabel}>
                {getSpecificationLabel(field, specificationLabels)}
              </span>
              <span className={styles.specValue}>
                {getSpecificationValue(field) || '-'}
              </span>
            </div>
          ))}
          
          {specificationFields.length > 3 && (
            <button 
              className={styles.showMoreSpecs}
              onClick={(e) => {
                e.stopPropagation()
                setShowAllSpecs(!showAllSpecs)
              }}
            >
              {showAllSpecs ? '간략히 보기' : `+${specificationFields.length - 3}개 더보기`}
            </button>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className={styles.productCardFooter}>
        <div className={styles.productCardCategory}>
          {product.category?.name || '-'}
        </div>
      </div>
    </div>
  )
}