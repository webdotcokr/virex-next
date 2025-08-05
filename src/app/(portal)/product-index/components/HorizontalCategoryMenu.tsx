'use client'

import { useEffect, useState, useRef } from 'react'
import { ProductCategory } from '../data/categories'
import styles from '../product-index.module.css'

interface HorizontalCategoryMenuProps {
  categories: ProductCategory[]
  onCategoryClick: (categoryId: string) => void
}

export default function HorizontalCategoryMenu({ 
  categories, 
  onCategoryClick 
}: HorizontalCategoryMenuProps) {
  const [isSticky, setIsSticky] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Calculate header height
    const calculateHeaderHeight = () => {
      const header = document.querySelector('header')
      if (header) {
        const height = header.offsetHeight
        setHeaderHeight(height)
        // Set CSS variable for sticky position
        document.documentElement.style.setProperty('--header-height', `${height}px`)
      }
    }

    // Initial calculation
    calculateHeaderHeight()

    // Handle scroll
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsSticky(scrollPosition > 300)
    }

    // Set up ResizeObserver for header height changes
    const header = document.querySelector('header')
    const resizeObserver = new ResizeObserver(() => {
      calculateHeaderHeight()
    })

    if (header) {
      resizeObserver.observe(header)
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', calculateHeaderHeight)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', calculateHeaderHeight)
      if (header) {
        resizeObserver.unobserve(header)
      }
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div 
      ref={menuRef}
      id="header-attached-menu" 
      className={`${styles.headerAttachedMenu} ${isSticky ? styles.sticky : ''}`}
      data-theme="white"
      style={{ '--sticky-top': `${headerHeight}px` } as React.CSSProperties}
    >
      <div className={styles.menuContainer}>
        <div className={styles.horizontalMenu}>
          {categories.map((category) => (
            <div 
              key={category.id}
              className={styles.menuItem}
            >
              <a 
                href={`#${category.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  onCategoryClick(category.id)
                }}
              >
                {category.title}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}