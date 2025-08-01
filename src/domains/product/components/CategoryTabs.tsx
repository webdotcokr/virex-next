'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { buildFilterUrl } from '@/lib/utils'
import styles from '../../../app/(portal)/products/products.module.css'
import type { Category } from '../types'

interface CategoryTabsProps {
  categories: Category[]
  selectedCategories: string[]
}

export default function CategoryTabs({ categories, selectedCategories }: CategoryTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategorySelect = (categoryId: string | null) => {
    const currentFilters = Object.fromEntries(searchParams.entries())
    
    if (categoryId === null) {
      // "전체" 선택시 카테고리 필터 제거
      delete currentFilters.categories
    } else {
      // 단일 카테고리 선택
      currentFilters.categories = categoryId
    }

    const url = `/products${buildFilterUrl(currentFilters)}`
    router.push(url, { scroll: false })
  }

  const isAllSelected = selectedCategories.length === 0
  const selectedCategoryId = selectedCategories.length === 1 ? selectedCategories[0] : null

  // 실제 DB에서 가져온 형제 카테고리들을 사용
  const displayCategories = categories

  return (
    <div className={styles.horizontalMenu}>
      {displayCategories.map((category) => (
        <a
          key={category.id}
          onClick={(e) => {
            e.preventDefault()
            handleCategorySelect(String(category.id))
          }}
          className={`${styles.menuItem} ${
            selectedCategoryId === String(category.id) ? styles.active : ''
          }`}
          href="#"
        >
          {category.name}
        </a>
      ))}
    </div>
  )
}