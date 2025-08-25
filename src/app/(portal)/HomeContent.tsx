'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import styles from './page.module.css'

export default function HomeContent() {
  const [currentSlide, setCurrentSlide] = useState(1)  

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
      href: '/products?categories=9&sort=maker&order=desc',
      image:  '/img/main-products/01.png'
    },
    {
      title: '렌즈',
      href: '/products?categories=15',
      image: '/img/main-products/02.png'
    },
    {
      title: '3D 카메라',
      href: '/products?categories=18',
      image: '/img/main-products/03.png'
    },
    {
      title: '오토포커스모듈',
      href: '/products?categories=4',
      image: '/img/main-products/04.png'
    },
    {
      title: '조명',
      href: '/products?categories=20',
      image: '/img/main-products/05.png'
    },
    {
      title: '프레임그래버',
      href: '/products?categories=23',
      image: '/img/main-products/06.png'
    },
    {
      title: '소프트웨어',
      href: '/products?categories=7',
      image: '/img/main-products/07.png'
    },
    {
      title: '주변기기',
      href: '/products?categories=26',
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

  // WordPress 연동 tech info data
  const [techInfoItems, setTechInfoItems] = useState<Array<{
    id: number;
    title: string;
    image: string;
    date: string;
    href: string;
  }>>([])
  const [techInfoLoading, setTechInfoLoading] = useState(true)
  const [techInfoSource, setTechInfoSource] = useState<'wordpress' | 'fallback' | null>(null)

  // Fetch tech info from WordPress API
  useEffect(() => {
    const fetchTechInfo = async () => {
      try {
        setTechInfoLoading(true)
        const response = await fetch('/api/tech-info')
        if (response.ok) {
          const result = await response.json()
          setTechInfoItems(result.data || [])
          setTechInfoSource(result.source)
          if (result.source === 'fallback') {
            console.warn('WordPress API 실패, 폴백 데이터 사용:', result.error)
          }
        } else {
          console.error('Tech info API 호출 실패')
        }
      } catch (error) {
        console.error('Tech info 로딩 중 오류:', error)
      } finally {
        setTechInfoLoading(false)
      }
    }

    fetchTechInfo()
  }, [])

  const handleSlideChange = (slideNo: number) => {
    setCurrentSlide(slideNo)
  }


  return (
    <div className="landing-page">
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
          </div>
          
          <div className={styles.mainSliderWrapper}>
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

      <div className="page-container">
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
            
            <div className={styles.newProductsItemsContainer}>
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={16}
                loop={true}
                navigation={{
                  prevEl: `.${styles.btnNewProductPrev}`,
                  nextEl: `.${styles.btnNewProductNext}`,
                }}
                pagination={{
                  el: `.${styles.sliderDotController}`,
                  clickable: true,
                }}
                breakpoints={{
                  320: {
                    slidesPerView: 1,
                    slidesPerGroup: 1,
                  },
                  768: {
                    slidesPerView: 4,
                    slidesPerGroup: 4,
                  },
                }}
                className={styles.newProductsSwiper}
              >
                {newProducts.map((product) => (
                  <SwiperSlide key={product.id}>
                    <Link href={product.link_url} className={styles.newProductItemLink}>
                      <div className={styles.newProductItem}>
                        <div className={styles.newProductImageArea}>
                          <img src={product.img_url} alt={product.title} loading="lazy" />
                        </div>
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
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            
            <button className={styles.btnNewProductPrev}>
              <img src="/img/btn-slide-prev-gray.svg" alt="Previous" />
            </button>
            
            <div className={styles.sliderDotController}></div>

            <button className={styles.btnNewProductNext}>
              <img src="/img/btn-slide-next-gray.svg" alt="Next" />
            </button>
          </div>
        </div>
      </div>

      {/* Tech Info Section */}
      <div className={styles.techInfoOuterWrapper}>
        <div className={styles.techInfoInnerWrapper}>
          <h2>최신 기술지식 및 정보</h2>
          {techInfoLoading ? (
            <div className={styles.techInfoLoading}>
              <p>최신 기술 정보를 불러오는 중...</p>
            </div>
          ) : (
            <>
              {techInfoSource === 'fallback' && (
                <div className={styles.techInfoWarning}>
                  <small>⚠️ WordPress 연결 실패, 캐시된 데이터를 표시합니다</small>
                </div>
              )}
              <div className={styles.techInfoItems}>
                {techInfoItems.map((item) => (
                  <Link key={item.id} href={item.href} className={styles.techInfoItemLink}>
                    <div className={styles.techInfoItem} data-date={item.date} data-url={item.href}>
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/img/main/noImg.jpg';
                        }}
                      />
                      <div className={styles.techInfoItemTitle}>{item.title}</div>
                      <div className={styles.techInfoReadMore} data-url={item.href}>
                        <span className={styles.readMoreText}>Read more</span>
                        <span className={styles.readMoreArrow}>
                          <img src="/img/btn-read-more-tech-info.svg" alt="Read more" loading="lazy" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}