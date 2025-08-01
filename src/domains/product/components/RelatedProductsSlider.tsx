'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Product } from '../types'
import styles from './RelatedProductsSlider.module.css'

interface RelatedProductsSliderProps {
  products: Product[]
}

export default function RelatedProductsSlider({ products }: RelatedProductsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const visibleItems = 4 // 한 번에 보여질 아이템 수
  
  // 슬라이더에 표시할 수 있는 최대 인덱스
  const maxIndex = Math.max(0, products.length - visibleItems)

  // 자동 슬라이드
  useEffect(() => {
    if (!isAutoPlaying || products.length <= visibleItems) return
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1))
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isAutoPlaying, maxIndex, products.length, visibleItems])
  
  const handlePrev = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1))
  }
  
  const handleNext = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1))
  }
  
  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
  }
  
  // 페이지 수 계산
  const totalPages = Math.ceil(products.length / visibleItems)
  const currentPage = Math.floor(currentIndex / visibleItems)

  if (products.length === 0) {
    return null
  }
  
  return (
    <div 
      className={styles.relatedProductsWrapper}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className={styles.relatedProductsItemsContainer}>
        <div 
          className={styles.relatedProductsItems}
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
            width: `${(products.length / visibleItems) * 100}%`
          }}
        >
          {products.map((product, index) => (
            <Link
              key={product.id || index}
              href={`/products/${product.part_number || product.partnumber}`}
              className={styles.relatedProductItemLink}
            >
              <div className={styles.relatedProductItem}>
                <img
                  src={product.image_url || '/img/no-image.png'}
                  alt={product.part_number || product.partnumber}
                  className={styles.productImage}
                />
                <div className={styles.relatedProductContent}>
                  <div className={styles.relatedProductSeries}>
                    {product.series || ''}
                  </div>
                  <div className={styles.relatedProductPartNumber}>
                    {product.part_number || product.partnumber}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Navigation Arrows */}
      {products.length > visibleItems && (
        <>
          <button
            className={`${styles.btnRelated} ${styles.btnRelatedPrev}`}
            onClick={handlePrev}
            aria-label="이전 제품"
          >
            <img src="/img/btn-slide-prev-gray.svg" alt="이전" />
          </button>
          
          <button
            className={`${styles.btnRelated} ${styles.btnRelatedNext}`}
            onClick={handleNext}
            aria-label="다음 제품"
          >
            <img src="/img/btn-slide-next-gray.svg" alt="다음" />
          </button>
        </>
      )}
      
      {/* Dot Controller */}
      {totalPages > 1 && (
        <div className={styles.sliderDotController}>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${currentPage === index ? styles.active : ''}`}
              onClick={() => handleDotClick(index * visibleItems)}
              aria-label={`페이지 ${index + 1}로 이동`}
            />
          ))}
        </div>
      )}
    </div>
  )
}