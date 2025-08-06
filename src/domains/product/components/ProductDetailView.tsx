'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Mail, ExternalLink, Share2 } from 'lucide-react'
import { formatParameterValue } from '@/lib/utils'
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

  // 제품 타입별 사양 렌더링
  const renderSpecifications = () => {
    if (!product.specifications) return null
    
    const specs = product.specifications as Record<string, unknown>
    const categoryName = product.category_name?.toLowerCase() || ''
    
    const specRows = []
    
    if (categoryName.includes('cis')) {
      if (specs.scan_width) specRows.push(['Scan Width', `${specs.scan_width} mm`])
      if (specs.dpi) specRows.push(['DPI', specs.dpi])
      if (specs.resolution) specRows.push(['Resolution', `${specs.resolution} μm`])
      if (specs.line_rate) specRows.push(['Line Rate', `${specs.line_rate} kHz`])
      if (specs.speed) specRows.push(['Speed', `${specs.speed} MHz`])
      if (specs.wd) specRows.push(['Working Distance', `${specs.wd} mm`])
      if (specs.no_of_pixels) specRows.push(['Number of Pixels', specs.no_of_pixels])
      if (specs.spectrum) specRows.push(['Spectrum', specs.spectrum])
      if (specs.interface) specRows.push(['Interface', specs.interface])
    } else if (categoryName.includes('tdi')) {
      if (specs.line_rate) specRows.push(['Line Rate', `${specs.line_rate} kHz`])
      if (specs.pixel_size) specRows.push(['Pixel Size', `${specs.pixel_size} μm`])
      if (specs.line_length) specRows.push(['Line Length', specs.line_length])
      if (specs.data_rate) specRows.push(['Data Rate', `${specs.data_rate} MHz`])
      if (specs.interface) specRows.push(['Interface', specs.interface])
    } else if (categoryName.includes('line')) {
      if (specs.resolution) specRows.push(['Resolution', specs.resolution])
      if (specs.line_rate) specRows.push(['Line Rate', `${specs.line_rate} kHz`])
      if (specs.pixel_size) specRows.push(['Pixel Size', `${specs.pixel_size} μm`])
      if (specs.sensor_length) specRows.push(['Sensor Length', `${specs.sensor_length} mm`])
      if (specs.interface) specRows.push(['Interface', specs.interface])
    } else if (categoryName.includes('area')) {
      if (specs.resolution_h && specs.resolution_v) {
        specRows.push(['Resolution (H x V)', `${specs.resolution_h} x ${specs.resolution_v}`])
      }
      if (specs.pixel_size) specRows.push(['Pixel Size', `${specs.pixel_size} μm`])
      if (specs.sensor_size) specRows.push(['Sensor Size', specs.sensor_size])
      if (specs.frame_rate) specRows.push(['Frame Rate', `${specs.frame_rate} fps`])
      if (specs.interface) specRows.push(['Interface', specs.interface])
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
              {product.series_data.feature_image_url && (
                <div className={styles.featureImage}>
                  <img src={product.series_data.feature_image_url} alt="Feature Image" />
                </div>
              )}
            </section>
          )}
          
          {/* Text Content */}
          {product.series_data.textItems?.some(item => item.title || item.desc || item.image) && (
            <section className={styles.textContentContainer}>
              <div className={styles.textContentGrid}>
                {product.series_data.textItems.map((item, index) => (
                  (item.title || item.desc || item.image) && (
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
                  )
                ))}
              </div>
            </section>
          )}
          
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