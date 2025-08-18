'use client'

import { useState } from 'react'
import styles from '../../../app/(portal)/products/products.module.css'

interface CategorySidebarProps {
  categoryName?: string
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export default function CategorySidebar({ 
  categoryName = 'CIS',
  isMobile = false,
  isOpen = false,
  onClose
}: CategorySidebarProps) {
  const [activeItems, setActiveItems] = useState<Set<string>>(new Set())

  const handleItemClick = (item: string) => {
    const newActive = new Set(activeItems)
    if (newActive.has(item)) {
      newActive.delete(item)
    } else {
      newActive.add(item)
    }
    setActiveItems(newActive)
  }

  const sidebarClasses = `${styles.categorySidebar} ${
    isMobile && isOpen ? styles.active : ''
  }`

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && (
        <div 
          className={`${styles.filterOverlay} ${isOpen ? styles.active : ''}`}
          onClick={onClose}
        />
      )}

      <div className={sidebarClasses}>
        {/* Category Title */}
        <div className={styles.categoryTitle}>
          <h3 className={styles.categoryTitleText}>{categoryName}</h3>
          <span className={styles.categoryArrow}>&gt;</span>
        </div>

        {/* Category List */}
        <div className={styles.categoryList}>
          {/* Scan Width Category Group */}
          <div className={styles.categoryGroup}>
            <h4 className={styles.categoryGroupTitle}>Scan Width</h4>
            <div className={styles.categorySubList}>
              {['48/50dpi', '38/40dpi', '24/30dpi', '19/20dpi', '12/20dpi', '9/20dpi', '6/8dpi', '3/6dpi'].map((item) => (
                <div 
                  key={item} 
                  className={`${styles.categoryItem} ${activeItems.has(item) ? styles.active : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <span className={styles.categoryItemText}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DPI Category Group */}
          <div className={styles.categoryGroup}>
            <h4 className={styles.categoryGroupTitle}>DPI</h4>
            <div className={styles.categorySubList}>
              {['48/50dpi', '38/40dpi', '19/20dpi', '12/20dpi', '9/20dpi', '6/8dpi', '3/6dpi'].map((item) => (
                <div 
                  key={item} 
                  className={`${styles.categoryItem} ${activeItems.has(`dpi_${item}`) ? styles.active : ''}`}
                  onClick={() => handleItemClick(`dpi_${item}`)}
                >
                  <span className={styles.categoryItemText}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Speed Category Group */}
          <div className={styles.categoryGroup}>
            <h4 className={styles.categoryGroupTitle}>Speed</h4>
            <div className={styles.categorySubList}>
              {['400MHz 이상', '301 ~ 400MHz', '201 ~ 300MHz', '101 ~ 200MHz', '100MHz 이하'].map((item) => (
                <div 
                  key={item} 
                  className={`${styles.categoryItem} ${activeItems.has(`speed_${item}`) ? styles.active : ''}`}
                  onClick={() => handleItemClick(`speed_${item}`)}
                >
                  <span className={styles.categoryItemText}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Other Category Groups - Collapsed by default */}
          <div className={styles.categoryGroup}>
            <h4 className={styles.categoryGroupTitle}>Line rate</h4>
          </div>

          <div className={styles.categoryGroup}>
            <h4 className={styles.categoryGroupTitle}>No. of Pixels</h4>
          </div>

          <div className={styles.categoryGroup}>
            <h4 className={styles.categoryGroupTitle}>WD</h4>
          </div>

          <div className={styles.categoryGroup}>
            <h4 className={styles.categoryGroupTitle}>Spectrum</h4>
          </div>

          <div className={styles.categoryGroup}>
            <h4 className={styles.categoryGroupTitle}>Interface</h4>
          </div>

          <div className={styles.categoryGroup}>
            <h4 className={styles.categoryGroupTitle}>Maker</h4>
          </div>

          <div className={styles.categoryGroup}>
            <h4 className={styles.categoryGroupTitle}>Series</h4>
          </div>
        </div>
      </div>
    </>
  )
}