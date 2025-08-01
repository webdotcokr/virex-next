'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import styles from './page.module.css'

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(1)
  const [newProductsIndex, setNewProductsIndex] = useState(0)

  // Main slider auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => prev === 1 ? 2 : 1)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const mainProducts = [
    {
      title: '카메라',
      href: '/products?type=camera&category=CIS',
      image: '/img/main-products/01.png'
    },
    {
      title: '렌즈',
      href: '/products?type=lens&category=Large Format',
      image: '/img/main-products/02.png'
    },
    {
      title: '3D 카메라',
      href: '/products?type=3d-camera&category=3D Laser Profiler',
      image: '/img/main-products/03.png'
    },
    {
      title: '오토포커스모듈',
      href: '/products?type=af-module&category=Auto Focus Module',
      image: '/img/main-products/04.png'
    },
    {
      title: '조명',
      href: '/products?type=light&category=조명',
      image: '/img/main-products/05.png'
    },
    {
      title: '프레임그래버',
      href: '/products?type=frame-grabber&category=프레임그래버',
      image: '/img/main-products/06.png'
    },
    {
      title: '소프트웨어',
      href: '/products?type=software&category=소프트웨어',
      image: '/img/main-products/07.png'
    },
    {
      title: '주변기기',
      href: '/products?type=accessory&category=주변기기',
      image: '/img/main-products/08.png'
    }
  ]

  // New products data from database
  const [newProducts, setNewProducts] = useState<Array<{
    id: number;
    title: string;
    description: string;
    img_url: string;
    link_url: string;
  }>>([])

  // Fetch new products from API
  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        const response = await fetch('/api/new-products')
        if (response.ok) {
          const data = await response.json()
          setNewProducts(data)
        } else {
          console.error('Failed to fetch new products')
        }
      } catch (error) {
        console.error('Error fetching new products:', error)
      }
    }

    fetchNewProducts()
  }, [])

  // Mock tech info data (would come from WordPress API)
  const techInfoItems = [
    {
      id: 1,
      title: 'Machine Vision의 최신 기술 동향',
      image: '/img/tech/tech-01.jpg',
      date: '2024-12-15',
      href: 'https://blog.virex.co.kr/tech-trends-2024'
    },
    {
      id: 2,
      title: '산업용 카메라 선택 가이드',
      image: '/img/tech/tech-02.jpg',
      date: '2024-12-10',
      href: 'https://blog.virex.co.kr/camera-selection-guide'
    },
    {
      id: 3,
      title: '3D 비전 시스템 구축 사례',
      image: '/img/tech/tech-03.jpg',
      date: '2024-12-05',
      href: 'https://blog.virex.co.kr/3d-vision-case-study'
    },
    {
      id: 4,
      title: 'LED 조명 시스템 최적화 방법',
      image: '/img/tech/tech-04.jpg',
      date: '2024-11-28',
      href: 'https://blog.virex.co.kr/led-lighting-optimization'
    },
    {
      id: 5,
      title: '머신비전용 렌즈 성능 비교',
      image: '/img/tech/tech-05.jpg',
      date: '2024-11-20',
      href: 'https://blog.virex.co.kr/lens-performance-comparison'
    }
  ]

  const handleSlideChange = (slideNo: number) => {
    setCurrentSlide(slideNo)
  }

  const handleNewProductsNav = (direction: 'prev' | 'next') => {
    const itemsPerView = 3
    const maxIndex = Math.max(0, newProducts.length - itemsPerView)
    
    if (direction === 'next' && newProductsIndex < maxIndex) {
      setNewProductsIndex(prev => prev + 1)
    } else if (direction === 'prev' && newProductsIndex > 0) {
      setNewProductsIndex(prev => prev - 1)
    }
  }

  return (
    <>
      <h1 className="sr-only">바이렉스(VIREX) - 머신비전, 광학 솔루션 & 컨설팅 전문 기업</h1>
      
      {/* Main Hero Section with Background Image and Slider */}
      <div className={styles.pageContentContainer}>
        <div className={styles.pageContent}>
          <div className={styles.leftAligned}>
            <div className={styles.pageTitle}>
              검증된 파트너 바이렉스<br/>
              비전 솔루션의 모든 것을 제공합니다.
            </div>
            <div className={styles.pageDescription}>
              귀사 비즈니스에 가장 적합한 비전 시스템을 제공합니다.<br/>
              실시간 대응과 맞춤형 기술 지원으로 문제 없는 운영을 보장합니다.
            </div>
          </div>
          
          <div className={styles.mainSliderWrapper}>
            <div className={styles.mainSliderController}>
              <div className={styles.arrowButtons}>
                <button 
                  className={styles.leftArrow}
                  onClick={() => handleSlideChange(currentSlide === 1 ? 2 : 1)}
                >
                  <img src="/img/btn-slide-prev-white.svg" alt="Previous" />
                </button>
                <span className={styles.separator}></span>
                <button 
                  className={styles.rightArrow}
                  onClick={() => handleSlideChange(currentSlide === 1 ? 2 : 1)}
                >
                  <img src="/img/btn-slide-next-white.svg" alt="Next" />
                </button>
              </div>
              <div className={styles.slideNo}>
                <span className={`${styles.txtSlide1} ${currentSlide === 1 ? styles.active : ''}`}>01</span>
                <span className={`${styles.horizontalLine} ${currentSlide === 1 ? styles.active : ''}`}></span>
                <span className={`${styles.txtSlide2} ${currentSlide === 2 ? styles.active : ''}`}>02</span>
              </div>
            </div>
            <div className={styles.mainSliderContents}>
              <img 
                src="/img/main-carousel/01.png" 
                alt="Vision Solution 1"
                className={`${styles.sliderImage} ${currentSlide === 1 ? styles.active : ''}`}
                loading="eager"
              />
              <img 
                src="/img/main-carousel/02.png" 
                alt="Vision Solution 2"
                className={`${styles.sliderImage} ${currentSlide === 2 ? styles.active : ''}`}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.mainContents}>
          {/* Main Products Section */}
          <div className={styles.mainProductsWrapper}>
            <h2>주요제품</h2>
            <div className={styles.mainProductsItems}>
              {mainProducts.map((product, index) => (
                <Link key={index} href={product.href} className={styles.mainProductItem}>
                  <div className={styles.mainProductText}>
                    <h3 className={styles.mainProductTitle}>{product.title}</h3>
                    <span className={styles.mainProductArrow}>→</span>
                  </div>
                  <div className={styles.mainProductImage}>
                    <img src={product.image} alt={product.title} loading="lazy" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* New Products Section */}
          <div className={styles.newProductsWrapper}>
            <h2>신제품</h2>
            
            <button 
              className={styles.btnNewProductPrev}
              onClick={() => handleNewProductsNav('prev')}
              disabled={newProductsIndex === 0}
            >
              <img src="/img/btn-slide-prev-gray.svg" alt="Previous" />
            </button>
            
            <div className={styles.newProductsItemsContainer}>
              <div 
                className={styles.newProductsItems}
                style={{ transform: `translateX(-${newProductsIndex * 33.333}%)` }}
              >
                {newProducts.map((product) => (
                  <Link key={product.id} href={product.link_url} className={styles.newProductItemLink}>
                    <div className={styles.newProductItem}>
                      <img src={product.img_url} alt={product.title} loading="lazy" />
                      <div className={styles.newProductItemTitleOuterWrapper}>
                        <div className={styles.newProductItemTitleInnerWrapper}>
                          <h3 className={styles.newProductItemTitle}>{product.title}</h3>
                          <div className={styles.newProductItemArrow}></div>
                        </div>
                        <div className={styles.newProductItemDesc}>
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            <div className={styles.sliderDotController}>
              {Array.from({ length: Math.ceil(newProducts.length / 3) }).map((_, index) => (
                <button
                  key={index}
                  className={`${styles.sliderDot} ${index === newProductsIndex ? styles.active : ''}`}
                  onClick={() => setNewProductsIndex(index)}
                />
              ))}
            </div>

            <button 
              className={styles.btnNewProductNext}
              onClick={() => handleNewProductsNav('next')}
              disabled={newProductsIndex >= Math.max(0, newProducts.length - 3)}
            >
              <img src="/img/btn-slide-next-gray.svg" alt="Next" />
            </button>
          </div>
        </div>
      </div>

      {/* Tech Info Section */}
      <div className={styles.techInfoOuterWrapper}>
        <div className={styles.techInfoInnerWrapper}>
          <h2>최신 기술지식 및 정보</h2>
          <div className={styles.techInfoItems}>
            {techInfoItems.map((item) => (
              <div key={item.id} className={styles.techInfoItem} data-date={item.date}>
                <img src={item.image} alt={item.title} loading="lazy" />
                <div className={styles.techInfoItemTitle}>{item.title}</div>
                <div className={styles.techInfoReadMore}>
                  <Link href={item.href} target="_blank" rel="noopener noreferrer">
                    <span className={styles.readMoreText}>Read more</span>
                    <span className={styles.readMoreArrow}>
                      <img src="/img/btn-read-more-tech-info.svg" alt="Read more" loading="lazy" />
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
