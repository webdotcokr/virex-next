'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import styles from '../app/(portal)/products/products.module.css'

interface Category {
  id: number
  name: string
  slug?: string
}

interface CategoryNavigationProps {
  categories: Category[]
  currentCategoryId?: number
}

export default function CategoryNavigation({ 
  categories, 
  currentCategoryId 
}: CategoryNavigationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const buildCategoryUrl = (categoryId: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('category_id', categoryId.toString())
    params.delete('page') // Reset pagination when changing category
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className={styles.categoryNavigation}>
      <div className={styles.menuContainer}>
        <div className={styles.horizontalMenu}>
          {categories.map((category) => {
            const isActive = currentCategoryId === category.id
            const href = buildCategoryUrl(category.id)
            
            return (
              <Link 
                key={category.id}
                href={href}
                className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
                prefetch={true}
              >
                {category.name}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}