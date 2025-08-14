'use client'

import Link from 'next/link'
import styles from '../app/(portal)/products/products.module.css'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface ProductHeroSectionProps {
  backgroundImage: string
  breadcrumbs: BreadcrumbItem[]
  titleEn: string
  titleKo: string
  description: string
}

export default function ProductHeroSection({
  backgroundImage,
  breadcrumbs,
  titleEn,
  titleKo,
  description
}: ProductHeroSectionProps) {
  return (
    <div 
      className={styles.productHeroSection}
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className={styles.productHeroContent}>
        <div className={styles.breadcrumb}>
          {breadcrumbs.map((item, index) => (
            <span key={index}>
              {item.href ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span className={styles.active}>{item.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <span className={styles.arrow}>
                  <img src="/img/icon-breadcrumb-arrow.svg" alt=">" />
                </span>
              )}
            </span>
          ))}
        </div>
        
        <div className={styles.leftAligned}>
          <div className={styles.pageTitleEn}>{titleEn}</div>
          <div className={styles.pageTitleKo}>
            <h1>{titleKo}</h1>
          </div>
          <div className={styles.pageDescription}>
            {description}
          </div>
        </div>
      </div>
    </div>
  )
}