'use client'

import { ReactNode } from 'react'
import styles from '../../../app/(portal)/products/products.module.css'

// Hero Section 컴포넌트
interface ProductHeroSectionProps {
  categoryInfo: {
    id: string
    name: string
    enName: string
    description: string
    backgroundImage?: string
  }
  breadcrumbs: Array<{
    label: string
    href?: string
    active?: boolean
  }>
}

function ProductHeroSection({ categoryInfo, breadcrumbs }: ProductHeroSectionProps) {
  const backgroundImage = categoryInfo.backgroundImage || '/img/backgrounds/camera-cis-bg.png'

  return (
    <div 
      className={styles.productHeroSection}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div id="page-content" className={styles.productHeroContent}>
        {/* Breadcrumb */}
        <div id="breadcrumb">
          {breadcrumbs.map((item, index) => (
            <span key={index}>
              {item.href ? (
                <a href={item.href}>{item.label}</a>
              ) : (
                <span className="active">{item.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <span className="arrow">
                  <img src="/icon/icon-breadcrumb-arrow.svg" alt="arrow" />
                </span>
              )}
            </span>
          ))}
        </div>

        {/* Category Title */}
        <div className={styles.leftAligned}>
          <div className={styles.pageTitleEn}>{categoryInfo.enName}</div>
          <div className={styles.pageTitleKo}>
            <h1>{categoryInfo.name}</h1>
          </div>
          <div className={styles.pageDescription}>
            {categoryInfo.description}
          </div>
        </div>
      </div>
    </div>
  )
}

// 메인 레이아웃 컴포넌트
interface ProductsPageLayoutProps {
  children: ReactNode
  categoryInfo: {
    id: string
    name: string
    enName: string
    description: string
    backgroundImage?: string
  }
  breadcrumbs: Array<{
    label: string
    href?: string
    active?: boolean
  }>
  categoryNavigation?: ReactNode
  heroSection?: boolean
}

export default function ProductsPageLayout({
  children,
  categoryInfo,
  breadcrumbs,
  categoryNavigation,
  heroSection = true
}: ProductsPageLayoutProps) {
  return (
    <>
      {/* Hero Section */}
      {heroSection && (
        <ProductHeroSection
          categoryInfo={categoryInfo}
          breadcrumbs={breadcrumbs}
        />
      )}

      {/* Category Navigation */}
      {categoryNavigation && (
        <div className={styles.categoryNavigation}>
          <div className={styles.menuContainer}>
            {categoryNavigation}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={styles.productsLayout}>
        {children}
      </div>
    </>
  )
}