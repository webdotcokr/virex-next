'use client'

import { ReactNode } from 'react'
import styles from '../product-index.module.css'

interface ProductIndexLayoutProps {
  children: ReactNode
}

export default function ProductIndexLayout({ children }: ProductIndexLayoutProps) {
  return (
    <div className={styles.productIndexLayout}>
      {/* Hero Section */}
      <div className={styles.productHeroSection}>
        <div className={styles.productHeroContent}>
          <div className={styles.breadcrumb}>
            <a href="/">Home</a>
            <span className={styles.arrow}>
              <img src="/img/icon-breadcrumb-arrow.svg" alt=">" />
            </span>
            <span className={styles.active}>제품</span>
          </div>
          <div className={styles.leftAligned}>
            <div className={styles.pageTitleEn}>Leading your vision to success</div>
            <div className={styles.pageTitleKo}>
              <h1>제품</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.productIndexContent}>
        {children}
      </div>
    </div>
  )
}