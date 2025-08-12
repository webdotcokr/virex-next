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
    // 카테고리 변경 시 유지할 기본 파라미터들 (필터 파라미터와 search는 제외)
    const allowedParams = ['sort', 'order', 'page']
    const currentFilters = Object.fromEntries(searchParams.entries())
    
    // 기본 파라미터만 필터링하여 새로운 필터 객체 생성
    const cleanFilters: Record<string, string> = {}
    allowedParams.forEach(param => {
      if (currentFilters[param]) {
        cleanFilters[param] = currentFilters[param]
      }
    })
    
    if (categoryId === null) {
      // "전체" 선택시 카테고리 필터 제거
      delete cleanFilters.categories
    } else {
      // 단일 카테고리 선택 - 필터 파라미터는 모두 초기화됨
      cleanFilters.categories = categoryId
    }
    
    // 페이지를 1로 리셋 (카테고리 변경 시 첫 페이지부터 시작)
    cleanFilters.page = '1'

    const url = `/products${buildFilterUrl(cleanFilters)}`
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