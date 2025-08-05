'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useFilterStore } from '@/lib/store'
import { buildFilterUrl } from '@/lib/utils'
import { getConfigByCategoryName, categoryConfigs } from '../config/category-filters'
import { buildFilterQuery } from '../services/filter-query-builder'
import { X } from 'lucide-react'
import styles from '../../../app/(portal)/products/products.module.css'
import type { Category, AdvancedFilterOption } from '../types'

interface FilterSidebarProps {
  categories: Category[]
  categoryName?: string
  selectedCategory?: string // 현재 선택된 카테고리 (CIS, TDI, Line 등)
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export default function FilterSidebar({ 
  categories, 
  categoryName = '필터',
  selectedCategory = 'cis', // 기본값으로 CIS 설정
  isMobile = false,
  isOpen = false,
  onClose
}: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { filters, updateFilter, resetFilters } = useFilterStore()
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['categories', 'search', 'parameters'])
  )

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobile && isOpen && onClose) {
        onClose()
      }
    }

    if (isMobile && isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isMobile, isOpen, onClose])

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter(id => id !== categoryId)
    
    updateFilter('categories', newCategories)
    updateUrl({ categories: newCategories })
  }

  const handleSearchChange = (field: 'partnumber' | 'series', value: string) => {
    updateFilter(field, value)
    updateUrl({ [field]: value })
  }

  const handleParameterChange = (paramName: string, value: string | string[] | number, checked?: boolean) => {
    const currentParams = { ...filters.parameters }
    
    if (typeof value === 'string' && checked !== undefined) {
      // 체크박스 형태 (multiselect)
      const paramValue = currentParams[paramName]
      const currentValues = Array.isArray(paramValue) 
        ? paramValue.map(String)
        : (paramValue !== null && paramValue !== undefined) 
          ? [String(paramValue)] 
          : []
      
      if (checked) {
        currentParams[paramName] = [...currentValues, value]
      } else {
        const filteredValues = currentValues.filter(v => v !== value)
        if (filteredValues.length === 0) {
          delete currentParams[paramName]
        } else {
          currentParams[paramName] = filteredValues
        }
      }
    } else {
      // 단일 선택, 배열 값, 또는 숫자 값
      if (Array.isArray(value) && value.length === 0) {
        delete currentParams[paramName]
      } else {
        currentParams[paramName] = value
      }
    }
    
    updateFilter('parameters', currentParams)
    updateUrl({ [paramName]: currentParams[paramName] })
  }

  const handleReset = () => {
    resetFilters()
    router.push('/products')
  }

  const updateUrl = (newFilters: Record<string, unknown>) => {
    const currentFilters = Object.fromEntries(searchParams.entries())
    const mergedFilters = { ...currentFilters, ...newFilters }
    
    // Remove empty filters
    Object.keys(mergedFilters).forEach(key => {
      const value = mergedFilters[key]
      if (value === '' || value === null || value === undefined || 
          (Array.isArray(value) && value.length === 0)) {
        delete mergedFilters[key]
      }
    })

    const url = `/products${buildFilterUrl(mergedFilters)}`
    router.push(url, { scroll: false })
  }

  const hasActiveFilters = 
    filters.categories.length > 0 || 
    filters.partnumber || 
    filters.series ||
    Object.keys(filters.parameters).length > 0

  // 선택된 카테고리에 맞는 필터 설정 가져오기
  const categoryConfig = getConfigByCategoryName(selectedCategory) || categoryConfigs['cis']
  const availableFilters = categoryConfig?.filters || []

  const sidebarClasses = `${styles.filterSidebar} ${
    isMobile && isOpen ? styles.active : ''
  }`

  // 슬라이더 렌더링 함수
  const renderSlider = (filter: any, paramKey: string) => {
    const currentValue = filters.parameters[paramKey] as [number, number] || filter.range || [0, 100]
    const [min, max] = currentValue
    
    return (
      <div className={styles.sliderContainer}>
        <div className={styles.sliderValues}>
          <span>{min}{filter.unit || ''}</span>
          <span>{max}{filter.unit || ''}</span>
        </div>
        <input
          type="range"
          min={filter.range?.[0] || 0}
          max={filter.range?.[1] || 100}
          step={filter.tick || 1}
          value={min}
          onChange={(e) => {
            const newMin = parseFloat(e.target.value)
            handleParameterChange(paramKey, [newMin, max])
          }}
          className={styles.slider}
        />
        <input
          type="range"
          min={filter.range?.[0] || 0}
          max={filter.range?.[1] || 100}
          step={filter.tick || 1}
          value={max}
          onChange={(e) => {
            const newMax = parseFloat(e.target.value)
            handleParameterChange(paramKey, [min, newMax])
          }}
          className={styles.slider}
        />
      </div>
    )
  }

  // 체크박스 렌더링 함수
  const renderCheckboxes = (filter: any, paramKey: string) => {
    const paramValue = filters.parameters[paramKey]
    const currentValues = Array.isArray(paramValue) 
      ? paramValue.map(String)
      : (paramValue !== null && paramValue !== undefined) 
        ? [String(paramValue)] 
        : []
    
    return (
      <div className={styles.checkboxGroup}>
        {filter.options?.map((option: AdvancedFilterOption) => {
          const isChecked = currentValues.includes(String(option.value))
          
          return (
            <label key={String(option.value)} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => handleParameterChange(paramKey, String(option.value), e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>
                {option.display}
                {filter.unit && !option.display.includes(filter.unit) && (
                  <span className={styles.unit}> {filter.unit}</span>
                )}
              </span>
            </label>
          )
        })}
      </div>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && (
        <div 
          className={`${styles.filterOverlay} ${isOpen ? styles.active : ''}`}
          onClick={onClose}
        />
      )}

      {/* Mobile Close Button */}
      {isMobile && isOpen && (
        <button 
          className={`${styles.mobileFilterClose} ${styles.active}`}
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className={sidebarClasses}>
        {/* Filter Title */}
        <div className={styles.filterTitle}>
          <h3 className={styles.filterTitleName}>{categoryName}</h3>
          <button 
            className={styles.filterTitleBtnRefresh}
            onClick={handleReset}
            title="필터 초기화"
          />
        </div>

        <div className={styles.filterContainer}>
          {/* ASP 원본 필터 그룹들 */}
          {availableFilters.map((filter) => {
            const paramKey = filter.param || filter.name.toLowerCase().replace(/\s+/g, '_')
            const isExpanded = expandedSections.has(paramKey) || filter.defaultExpanded
            
            return (
              <div key={paramKey} className={`${styles.filterGroup} ${!isExpanded ? styles.collapsed : ''}`}>
                <h4 
                  onClick={() => toggleSection(paramKey)}
                  className={styles.filterGroupHeader}
                >
                  <span className={styles.filterGroupTitle}>
                    {filter.name}
                    {filter.unit && (
                      <span className={styles.filterUnit}>({filter.unit})</span>
                    )}
                  </span>
                  <span className={styles.filterExpandToggle}>
                  </span>
                </h4>
                
                {isExpanded && (
                  <div className={styles.filterOptions}>
                    {filter.type === 'checkbox' && renderCheckboxes(filter, paramKey)}
                    {filter.type === 'slider' && renderSlider(filter, paramKey)}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Filter Buttons */}
        <div className={styles.filterButtons}>
          <button className={styles.btnReset} type="button" onClick={handleReset}>
            초기화
          </button>
          <button className={styles.btnApply} type="button">
            적용
          </button>
        </div>
      </div>

      {/* Mobile Filter Actions */}
      {isMobile && (
        <div className={`${styles.filterActions} ${isOpen ? styles.active : ''}`}>
          <button className={`${styles.filterActionBtn} ${styles.reset}`} onClick={handleReset}>
            초기화
          </button>
          <button className={`${styles.filterActionBtn} ${styles.apply}`} onClick={onClose}>
            적용
          </button>
        </div>
      )}
    </>
  )
}