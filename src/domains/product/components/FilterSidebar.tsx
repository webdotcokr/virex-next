'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useFilterStore } from '@/lib/store'
import { buildFilterUrl } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { X } from 'lucide-react'
import styles from '../../../app/(portal)/products/products.module.css'
import type { Category } from '../types'
import type { Database } from '@/lib/supabase'

type FilterConfig = Database['public']['Tables']['filter_configs']['Row']
type FilterOption = Database['public']['Tables']['filter_options']['Row']

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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [dynamicFilters, setDynamicFilters] = useState<FilterConfig[]>([])
  const [filterOptions, setFilterOptions] = useState<Record<number, FilterOption[]>>({})
  const [loading, setLoading] = useState(true)

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

  // Load dynamic filters based on selected category
  useEffect(() => {
    loadFilters()
  }, [filters.categories])

  const loadFilters = async () => {
    try {
      setLoading(true)
      // Get current category ID
      const currentCategoryId = filters.categories.length > 0 ? filters.categories[0] : '9'
      
      // Load filter configs for the category
      const { data: filterConfigs, error: configError } = await supabase
        .from('filter_configs')
        .select('*')
        .eq('category_id', parseInt(currentCategoryId))
        .eq('is_active', true)
        .order('sort_order')

      if (configError) {
        console.warn('Filter configs not available, using default filters:', configError)
        // 필터 설정이 없을 경우 빈 배열로 처리
        setDynamicFilters([])
        setLoading(false)
        return
      }
      setDynamicFilters(filterConfigs || [])

      // Load options for checkbox filters
      const optionsMap: Record<number, FilterOption[]> = {}
      for (const config of filterConfigs || []) {
        if (config.filter_type === 'checkbox') {
          const { data: options, error: optionsError } = await supabase
            .from('filter_options')
            .select('*')
            .eq('filter_config_id', config.id)
            .eq('is_active', true)
            .order('sort_order')

          if (!optionsError && options) {
            optionsMap[config.id] = options
          }
        }
      }
      setFilterOptions(optionsMap)

      // Set default expanded sections
      const defaultExpanded = new Set<string>()
      filterConfigs?.forEach(config => {
        if (config.default_expanded) {
          defaultExpanded.add(config.filter_name)
        }
      })
      setExpandedSections(defaultExpanded)
    } catch (error) {
      console.error('Error loading filters:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const sidebarClasses = `${styles.filterSidebar} ${
    isMobile && isOpen ? styles.active : ''
  }`

  // 슬라이더 렌더링 함수
  const renderSlider = (filter: FilterConfig, sliderConfig?: any) => {
    const currentValue = filters.parameters[filter.filter_name] as [number, number] || [0, 100]
    const [min, max] = currentValue
    
    return (
      <div className={styles.sliderContainer}>
        <div className={styles.sliderValues}>
          <span>{min}{filter.filter_unit || ''}</span>
          <span>{max}{filter.filter_unit || ''}</span>
        </div>
        <input
          type="range"
          min={sliderConfig?.min_value || 0}
          max={sliderConfig?.max_value || 100}
          step={sliderConfig?.step_value || 1}
          value={min}
          onChange={(e) => {
            const newMin = parseFloat(e.target.value)
            handleParameterChange(filter.filter_name, [newMin, max])
          }}
          className={styles.slider}
        />
        <input
          type="range"
          min={sliderConfig?.min_value || 0}
          max={sliderConfig?.max_value || 100}
          step={sliderConfig?.step_value || 1}
          value={max}
          onChange={(e) => {
            const newMax = parseFloat(e.target.value)
            handleParameterChange(filter.filter_name, [min, newMax])
          }}
          className={styles.slider}
        />
      </div>
    )
  }

  // 체크박스 렌더링 함수
  const renderCheckboxes = (filter: FilterConfig, options: FilterOption[]) => {
    const paramValue = filters.parameters[filter.filter_name]
    const currentValues = Array.isArray(paramValue) 
      ? paramValue.map(String)
      : (paramValue !== null && paramValue !== undefined) 
        ? [String(paramValue)] 
        : []
    
    return (
      <div className={styles.checkboxGroup}>
        {options.map((option) => {
          const isChecked = currentValues.includes(option.option_value)
          
          return (
            <label key={option.id} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => handleParameterChange(filter.filter_name, option.option_value, e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>
                {option.option_label}
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
          {/* 동적으로 로드된 필터 그룹들 */}
          {loading ? (
            <div className={styles.loadingMessage}>필터를 불러오는 중...</div>
          ) : (
            dynamicFilters.map((filter) => {
              const isExpanded = expandedSections.has(filter.filter_name)
              
              return (
                <div key={filter.id} className={`${styles.filterGroup} ${!isExpanded ? styles.collapsed : ''}`}>
                  <h4 
                    onClick={() => toggleSection(filter.filter_name)}
                    className={styles.filterGroupHeader}
                  >
                    <span className={styles.filterGroupTitle}>
                      {filter.filter_label}
                      {filter.filter_unit && (
                        <span className={styles.filterUnit}>({filter.filter_unit})</span>
                      )}
                    </span>
                    <span className={styles.filterExpandToggle}>
                    </span>
                  </h4>
                  
                  {isExpanded && (
                    <div className={styles.filterOptions}>
                      {filter.filter_type === 'checkbox' && filterOptions[filter.id] && 
                        renderCheckboxes(filter, filterOptions[filter.id])}
                      {filter.filter_type === 'slider' && renderSlider(filter)}
                    </div>
                  )}
                </div>
              )
            })
          )}
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