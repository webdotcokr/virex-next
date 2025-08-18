'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Mail, ExternalLink, Share2 } from 'lucide-react'
import { getColumnConfigForCategory, formatColumnValue } from '@/config/productColumns'
import InquiryForm from './InquiryForm'
import RelatedProductsSlider from './RelatedProductsSlider'
import type { Product } from '../types'
import styles from './ProductDetailView.module.css'

interface ProductDetailViewProps {
  product: Product & {
    series_data?: {
      series_name: string
      intro_text?: string
      short_text?: string
      youtube_url?: string
      feature_image_url?: string
      features: Array<{title: string, desc: string}>
      strengths: string[]
      apps: Array<{title: string, image: string}>
      textItems: Array<{title: string, desc: string, image: string}>
    }
    related_products?: Product[]
    maker_name?: string
    category_name?: string
  }
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const [showInquiryForm, setShowInquiryForm] = useState(false)
  const [activeSection, setActiveSection] = useState('intro')

  // Debug logging
  useEffect(() => {
    console.log('🎨 ProductDetailView received product:', {
      part_number: product.part_number,
      has_series_data: !!product.series_data,
      series_name: product.series_data?.series_name,
      has_intro: !!product.series_data?.intro_text,
      has_features: !!product.series_data?.features?.length,
      related_products_count: product.related_products?.length || 0
    })
    
    if (product.series_data) {
      console.log('📊 Series data details:', product.series_data)
    } else {
      console.warn('⚠️ No series_data in product!')
    }
  }, [product])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(sectionId)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.part_number} - ${product.series_data?.series_name || product.series}`,
          text: product.series_data?.short_text || product.description,
          url: window.location.href,
        })
      } catch {
        console.log('Error sharing')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('제품 페이지 URL이 클립보드에 복사되었습니다.')
    }
  }

  // 스킵할 필드들 (기본 제품 정보, CSV BASIC_FIELDS와 동일)
  const SKIP_SPEC_FIELDS = [
    'category_id', 'category_name', 
    'maker_id', 'maker_name', 'series_id', 'series_name',
    'is_active', 'is_new', 'image_url', 'is_discontinued',
  ]

  // 파라미터 라벨 포맷팅 (productColumns.ts 활용)
  const formatParameterLabel = (key: string): string => {
    // productColumns.ts에서 카테고리별 컬럼 설정 가져오기
    const columnConfigs = getColumnConfigForCategory(product.category_id)
    const config = columnConfigs.find(c => c.column_name === key)
    
    if (config) {
      // 설정이 있으면 정의된 라벨 사용
      return config.column_label
    }
    
    // 설정이 없으면 fallback 라벨 매핑
    const labelMap: Record<string, string> = {
      'resolution_h': 'Resolution (H)',
      'resolution_v': 'Resolution (V)',
      'no_of_pixels': 'Number of Pixels',
      'line_length': 'Line Length',
      'data_rate': 'Data Rate',
      'sensor_size': 'Sensor Size',
      'sensor_length': 'Sensor Length',
      'working_distance': 'Working Distance',
      'mount_type': 'Mount Type',
      'relative_illumination': 'Relative Illumination'
    }

    return labelMap[key] || key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  // productColumns.ts의 설정을 사용한 값 포맷팅
  const formatSpecValue = (key: string, value: unknown): string => {
    if (value === null || value === undefined || value === '') return '-'
    
    // productColumns.ts에서 카테고리별 컬럼 설정 가져오기
    const columnConfigs = getColumnConfigForCategory(product.category_id)
    const config = columnConfigs.find(c => c.column_name === key)
    
    if (config) {
      // 설정이 있으면 formatColumnValue 사용 (단위 포함)
      return formatColumnValue(value, config)
    }
    
    // 설정이 없는 필드는 기존 fallback 방식으로 처리
    const stringValue = String(value)
    const lowerKey = key.toLowerCase()
    
    // 기본적인 단위 추론 (fallback)
    if (lowerKey.includes('width') || lowerKey.includes('length') || lowerKey.includes('distance')) {
      return `${stringValue} mm`
    }
    if (lowerKey.includes('rate') && !lowerKey.includes('frame')) {
      return `${stringValue} kHz`
    }
    if (lowerKey.includes('speed') || lowerKey.includes('data_rate')) {
      return `${stringValue} MHz`
    }
    if (lowerKey.includes('frame_rate') || lowerKey.includes('fps')) {
      return `${stringValue} fps`
    }
    if (lowerKey.includes('pixel_size') || lowerKey === 'resolution') {
      return `${stringValue} μm`
    }
    if (lowerKey.includes('focal_length')) {
      return `${stringValue} mm`
    }
    
    return stringValue
  }

  // 동적 사양 렌더링 (모든 specifications 필드 표시)
  const renderSpecifications = () => {
    if (!product.specifications) return null
    
    const specs = product.specifications as Record<string, unknown>
    const specRows: [string, string][] = []
    
    // 모든 specification 필드를 반복하되 스킵 필드 제외
    Object.entries(specs).forEach(([key, value]) => {
      if (!SKIP_SPEC_FIELDS.includes(key) && value !== null && value !== '' && value !== undefined) {
        const label = formatParameterLabel(key)
        const formattedValue = formatSpecValue(key, value)
        specRows.push([label, formattedValue])
      }
    })
    
    // 특별한 조합 필드 처리 (Resolution H x V)
    if (specs.resolution_h && specs.resolution_v) {
      // 개별 H, V 항목 제거하고 조합 항목 추가
      const filteredRows = specRows.filter(([label]) => 
        !label.includes('Resolution (H)') && !label.includes('Resolution (V)')
      )
      filteredRows.unshift(['Resolution (H x V)', `${specs.resolution_h} x ${specs.resolution_v}`])
      return filteredRows
    }
    
    return specRows
  }

  return (
    <>
      <div className={styles.productHeader}>
        <div className={`${styles.grid} ${styles.gridTwoCols} ${styles.inner}`}>
          <img 
            src={product.image_url || '/img/no-image.png'} 
            alt={product.part_number} 
            className={styles.productImage}
          />
          <div className={styles.productInfo}>
            <hr className={styles.divider} />
            <h1 className={styles.productTitle}>{product.part_number}</h1>
            {product.series_data?.series_name && (
              <p className={styles.seriesName}>{product.series_data.series_name}</p>
            )}
            <p className={styles.shortText}>
              {product.series_data?.short_text || product.description}
            </p>
          </div>
        </div>
      </div>
      
      <div className={`${styles.horizontalMenu} ${styles.inner}`}>
        <a 
          href="#intro" 
          className={styles.menuItem}
          onClick={(e) => {
            e.preventDefault()
            scrollToSection('intro')
          }}
        >
          제품소개
        </a>
        <a 
          href="#specifications" 
          className={styles.menuItem}
          onClick={(e) => {
            e.preventDefault()
            scrollToSection('specifications')
          }}
        >
          주요 사양
        </a>
        <a 
          href="#downloads" 
          className={styles.menuItem}
          onClick={(e) => {
            e.preventDefault()
            scrollToSection('downloads')
          }}
        >
          다운로드
        </a>
        <a 
          href="#related-products" 
          className={styles.menuItem}
          onClick={(e) => {
            e.preventDefault()
            scrollToSection('related-products')
          }}
        >
          관련제품
        </a>
      </div>

      {product.series_data && (
        <div className={`${styles.seriesSection} ${styles.inner}`}>
          <section id="intro" className={styles.introSection}>
            <h2 className={styles.sectionTitle}>제품 소개</h2>
            {product.series_data.intro_text && (
              <div className={styles.introText}>
                {product.series_data.intro_text}
              </div>
            )}
            
            {/* Feature Image - intro_text 다음에 표시 */}
            {product.series_data.feature_image_url && (
              <div className={styles.featureImageContainer}>
                <img src={product.series_data.feature_image_url} alt="Feature Image" />
              </div>
            )}
            
            {product.series_data.youtube_url && (
              <div className={styles.videoContainer}>
                <iframe 
                  src={product.series_data.youtube_url.replace('watch?v=', 'embed/')} 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
              </div>
            )}
          </section>
          
          {/* Features */}
          {product.series_data.features?.some(f => f.title) && (
            <section className={styles.featuresContainer}>
              <h2 className={styles.sectionTitle}>
                {product.series_data.series_name || 'Key Features'}
              </h2>
              <div className={styles.featuresGrid}>
                {product.series_data.features.map((feature, index) => (
                  feature.title && (
                    <div key={index} className={styles.featureItem}>
                      <h3 className={styles.featureTitle} data-number={index + 1}>
                        {feature.title}
                      </h3>
                      <h4 className={styles.featureDesc}>{feature.desc}</h4>
                    </div>
                  )
                ))}
              </div>
            </section>
          )}
          
          {/* Text Content */}
          {product.series_data.textItems?.some(item => item.title || item.desc || item.image) && (() => {
            // 실제 콘텐츠가 있는 아이템들만 필터링
            const validItems = product.series_data.textItems.filter(item => item.title || item.desc || item.image);
            // 실제 콘텐츠 개수에 따른 그리드 컬럼 설정
            const columnCount = Math.min(validItems.length, 3); // 최대 3개 컬럼
            const gridStyle = {
              gridTemplateColumns: `repeat(${columnCount}, 1fr)`
            };

            return (
              <section className={styles.textContentContainer}>
                <div className={styles.textContentGrid} style={gridStyle}>
                  {validItems.map((item, index) => (
                    <div key={index} className={styles.textContentItem}>
                      {item.image && (
                        <div className={styles.textImage}>
                          <img src={item.image} alt={item.title} />
                        </div>
                      )}
                      <div className={styles.textContent}>
                        {item.title && (
                          <h3 className={styles.textTitle}>{item.title}</h3>
                        )}
                        {item.desc && (
                          <div className={styles.textDescription}>{item.desc}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}
          
          {/* Strengths */}
          {product.series_data.strengths?.some(s => s) && (
            <div className={styles.strengthsContainer}>
              <h2 className={styles.sectionTitle}>특징/강점</h2>
              <ul className={styles.strengthsList}>
                {product.series_data.strengths.map((strength, index) => (
                  strength && (
                    <li key={index}>{strength}</li>
                  )
                ))}
              </ul>
            </div>
          )}
          
          {/* Specifications */}
          <section id="specifications" className={styles.specificationsSection}>
            <h2 className={styles.sectionTitle}>주요사양</h2>
            <table className={styles.specTable}>
              <tbody>
                {renderSpecifications()?.map(([label, value], index) => (
                  <tr key={index}>
                    <th>{label}</th>
                    <td>{value || '-'}</td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={2}>사양 정보가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
          
          {/* Applications */}
          {product.series_data.apps?.some(app => app.title) && (
            <div className={styles.applicationsContainer}>
              <h2 className={styles.sectionTitle}>어플리케이션</h2>
              <div className={styles.applicationsGrid}>
                {product.series_data.apps.map((app, index) => (
                  app.title && (
                    <div key={index} className={styles.applicationItem}>
                      <h3>{app.title}</h3>
                      {app.image && <img src={app.image} alt={app.title} />}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
          
          {/* Related Products */}
          {product.related_products && product.related_products.length > 0 && (
            <section id="related-products" className={styles.relatedProductsWrapper}>
              <h2 className={styles.sectionTitle}>관련 제품</h2>
              <RelatedProductsSlider products={product.related_products} />
            </section>
          )}
        </div>
      )}


      {/* Inquiry Form Modal */}
      {showInquiryForm && (
        <InquiryForm
          product={product}
          onClose={() => setShowInquiryForm(false)}
        />
      )}
    </>
  )
}