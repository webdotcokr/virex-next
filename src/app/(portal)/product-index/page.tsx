'use client'

import { useRef } from 'react'
import ProductIndexLayout from './components/ProductIndexLayout'
import ProductCategoryGrid from './components/ProductCategoryGrid'
import HorizontalCategoryMenu from './components/HorizontalCategoryMenu'
import { productCategories } from './data/categories'
import styles from './product-index.module.css'

export default function ProductIndexPage() {
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const scrollToCategory = (categoryId: string) => {
    const element = categoryRefs.current[categoryId]
    if (element) {
      const offset = 80 // Header offset
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <ProductIndexLayout>
      <HorizontalCategoryMenu 
        categories={productCategories}
        onCategoryClick={scrollToCategory}
      />
      
      <div className={`page-container ${styles.productIndexContainer}`}>
        {productCategories.map((category) => (
          <div 
            key={category.id}
            id={category.id}
            ref={(el) => { categoryRefs.current[category.id] = el }}
            className={styles.categorySection}
          >
            <div className={styles.categoryTitle}>
              <h2>{category.title}</h2>
            </div>
            <ProductCategoryGrid items={category.items} />
          </div>
        ))}
      </div>
    </ProductIndexLayout>
  )
}