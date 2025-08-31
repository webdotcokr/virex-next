'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Product } from '../types'
import styles from './RelatedProductsSlider.module.css'

interface RelatedProductsSliderProps {
  products: Product[]
}

export default function RelatedProductsSlider({ products }: RelatedProductsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const sliderRef = useRef<HTMLDivElement>(null)
  
  const visibleItems = 4 // 한 번에 보여질 아이템 수
  
  // 반응형 아이템 크기 계산
  const [itemDimensions, setItemDimensions] = useState({
    width: 341,
    gap: 20,
    totalWidth: 361
  })
  
  useEffect(() => {
    const updateDimensions = () => {
      const isMobile = window.innerWidth <= 767
      if (isMobile) {
        setItemDimensions({
          width: 280,
          gap: 15,
          totalWidth: 295
        })
      } else {
        setItemDimensions({
          width: 341,
          gap: 20,
          totalWidth: 361
        })
      }
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])
  
  // 무한 슬라이더를 위한 확장된 제품 목록
  const extendedProducts = products.length > 0 ? [
    ...products.slice(-visibleItems), // 뒤쪽 아이템들을 앞에 복사
    ...products, // 원본 아이템들
    ...products.slice(0, visibleItems) // 앞쪽 아이템들을 뒤에 복사
  ] : []
  
  // 초기 위치를 원본 첫 번째 아이템으로 설정
  const initialIndex = visibleItems

  // 컴포넌트 마운트 시 초기 위치 설정
  useEffect(() => {
    if (products.length > 0) {
      setCurrentIndex(initialIndex)
    }
  }, [products.length, initialIndex])

  // 자동 슬라이드
  useEffect(() => {
    if (!isAutoPlaying || products.length <= visibleItems) return
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => prev + 1)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isAutoPlaying, products.length, visibleItems])
  
  // 무한 루프 처리
  useEffect(() => {
    if (!sliderRef.current || products.length === 0) return
    
    // 끝쪽에 도달했을 때 처리
    if (currentIndex >= products.length + initialIndex) {
      setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(initialIndex)
        setTimeout(() => setIsTransitioning(true), 50)
      }, 500)
    }
    
    // 시작쪽에 도달했을 때 처리  
    if (currentIndex < initialIndex) {
      setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(products.length + initialIndex - 1)
        setTimeout(() => setIsTransitioning(true), 50)
      }, 500)
    }
  }, [currentIndex, products.length, initialIndex])
  
  const handlePrev = () => {
    setCurrentIndex(prev => prev - 1)
  }
  
  const handleNext = () => {
    setCurrentIndex(prev => prev + 1)
  }
  
  const handleDotClick = (index: number) => {
    setCurrentIndex(initialIndex + index)
  }
  
  // 페이지 수 계산 (원본 아이템 기준)
  const totalPages = Math.ceil(products.length / visibleItems)
  const currentPageIndex = Math.max(0, currentIndex - initialIndex)
  const currentPage = Math.floor(currentPageIndex / visibleItems)

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
          ref={sliderRef}
          className={styles.relatedProductsItems}
          style={{
            transform: `translateX(-${currentIndex * itemDimensions.totalWidth}px)`,
            width: `${extendedProducts.length * itemDimensions.totalWidth}px`,
            transition: isTransitioning ? 'transform 0.5s ease' : 'none'
          }}
        >
          {extendedProducts.map((product, index) => (
            <Link
              key={`${product.id || product.part_number || product.partnumber}-${index}`}
              href={`/products/${encodeURIComponent(product.part_number || product.partnumber)}`}
              className={styles.relatedProductItemLink}
            >
              <div className={styles.relatedProductItem}>
                <img
                  src={product.image_url || '/img/no-image.png'}
                  alt={product.part_number || product.partnumber}
                  className={styles.productImage}
                  onError={(e) => {
                    const target = e.currentTarget
                    // 이미 기본 이미지로 변경된 경우 중복 실행 방지
                    if (target.src.includes('/img/no-image.png')) return
                    console.log(`Image load failed for: ${target.src}, switching to default image`)
                    target.src = '/img/no-image.png'
                  }}
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
      {products.length > 0 && (
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
              onClick={() => handleDotClick(index)}
              aria-label={`페이지 ${index + 1}로 이동`}
            />
          ))}
        </div>
      )}
    </div>
  )
}