'use client'

import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useFilterStore } from '@/lib/store'
import { buildFilterUrl } from '@/lib/utils'
import { getConfigByCategoryName } from '../config/category-filters'
import { appendRangeFiltersToSearchParams, getRangeFiltersFromSearchParams, filterValueToUrlParam, encodeRangeToken } from '../utils/url-params'
import { X } from 'lucide-react'
import styles from '../../../app/(portal)/products/products.module.css'
import type { Category } from '../types'

// ASP 원본 필터 설정 타입
interface CategoryFilter {
  name: string
  type: 'checkbox' | 'slider'
  param: string
  unit?: string
  defaultExpanded?: boolean
  options?: Array<{ display: string; value: string }>
  range?: number[]
  tick?: number
}

interface FilterSidebarProps {
  categories: Category[]
  categoryName?: string
  selectedCategory?: string // 현재 선택된 카테고리 (CIS, TDI, Line 등)
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

function FilterSidebar({ 
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
  const [staticFilters, setStaticFilters] = useState<CategoryFilter[]>([])
  const [loading, setLoading] = useState(true)
  const [sliderValues, setSliderValues] = useState<Record<string, [number, number]>>({})
  const [applyingFilters, setApplyingFilters] = useState<Set<string>>(new Set())
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({})

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

  // Stabilize category ID to prevent infinite loops
  const currentCategoryId = useMemo(() => {
    return filters.categories.length > 0 ? filters.categories[0] : '9'
  }, [filters.categories])

  // 정적 필터 로딩 함수 (ASP 원본 기반)
  const loadFilters = useCallback(() => {
    try {
      setLoading(true)
      console.log('🔄 Loading static filter configs for category:', categoryName)
      
      // category-filters.ts에서 설정 가져오기
      const config = getConfigByCategoryName(categoryName || 'CIS')
      
      if (!config || !config.filters) {
        console.warn('⚠️ No filter config found for category:', categoryName)
        setStaticFilters([])
        setExpandedSections(new Set())
        return
      }

      console.log(`📋 Found ${config.filters.length} static filter configs`)
      setStaticFilters(config.filters)

      // 기본 확장 섹션 설정
      const defaultExpanded = new Set<string>()
      config.filters.forEach(filter => {
        if (filter.defaultExpanded) {
          defaultExpanded.add(filter.param)
        }
      })
      setExpandedSections(defaultExpanded)
      
      console.log('✅ Static filter configs loaded successfully')
    } catch (error) {
      console.error('❌ Error loading static filters:', error)
      setStaticFilters([])
      setExpandedSections(new Set())
    } finally {
      setLoading(false)
    }
  }, [categoryName])

  // URL update function - defined first as it's used by other functions
  const updateUrl = useCallback((newFilters: Record<string, unknown>) => {
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
  }, [searchParams, router])

  // Load dynamic filters based on selected category
  useEffect(() => {
    loadFilters()
  }, [loadFilters])

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => {
        if (timer) clearTimeout(timer)
      })
    }
  }, [])

  // 필터 변경 시 슬라이더 값 초기화
  useEffect(() => {
    setSliderValues({})
  }, [filters.categories])

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(section)) {
        newExpanded.delete(section)
      } else {
        newExpanded.add(section)
      }
      return newExpanded
    })
  }, [])

  const handleCategoryChange = useCallback((categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter(id => id !== categoryId)
    
    // Update store first
    updateFilter('categories', newCategories)
    
    // Then update URL with a slight delay to prevent immediate re-render
    setTimeout(() => {
      updateUrl({ categories: newCategories })
    }, 0)
  }, [filters.categories, updateFilter, updateUrl])

  const handleSearchChange = useCallback((field: 'partnumber' | 'series', value: string) => {
    // Update store first
    updateFilter(field, value)
    
    // Then update URL with a slight delay
    setTimeout(() => {
      updateUrl({ [field]: value })
    }, 0)
  }, [updateFilter, updateUrl])

  const handleParameterChange = useCallback((paramName: string, value: string | string[] | number, checked?: boolean) => {
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
        // 값 추가 (중복 방지)
        if (!currentValues.includes(value)) {
          currentParams[paramName] = [...currentValues, value]
        }
      } else {
        // 값 제거
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
    
    // Update store first
    updateFilter('parameters', currentParams)
    
    // URL 업데이트 시 파라미터 정리
    setTimeout(() => {
      const urlParams: Record<string, unknown> = {}
      
      // 현재 파라미터가 존재하는 경우에만 URL에 포함
      if (currentParams[paramName] !== undefined) {
        const paramValue = currentParams[paramName]
        
        // 슬라이더 범위인지 체크 (숫자 배열 && 길이 2)
        if (Array.isArray(paramValue) && paramValue.length === 2 && 
            paramValue.every(v => typeof v === 'number')) {
          // 슬라이더 범위 → 단일 범위 토큰으로 변환
          const rangeToken = encodeRangeToken(paramValue[0], paramValue[1])
          console.log(`  🎯 Slider range: [${paramValue[0]}, ${paramValue[1]}] → "${rangeToken}"`)
          urlParams[paramName] = rangeToken
        } else if (Array.isArray(paramValue)) {
          // 일반 배열 (체크박스 등) - 각 값을 개별적으로 변환
          const convertedValues = paramValue.map(v => filterValueToUrlParam(String(v)))
          urlParams[paramName] = convertedValues
        } else {
          // 단일 값인 경우 직접 변환
          urlParams[paramName] = filterValueToUrlParam(String(paramValue))
        }
      } else {
        // 파라미터가 삭제된 경우 URL에서도 제거
        urlParams[paramName] = ''
      }
      
      updateUrl(urlParams)
    }, 0)
  }, [filters.parameters, updateFilter, updateUrl])

  const handleReset = useCallback(() => {
    // 슬라이더 값 초기화
    setSliderValues({})
    
    // 진행 중인 디바운스 타이머 정리
    Object.values(debounceTimers.current).forEach(timer => {
      if (timer) clearTimeout(timer)
    })
    debounceTimers.current = {}
    
    resetFilters()
    // 현재 카테고리를 유지한 URL로 이동
    const currentCategories = filters.categories
    if (currentCategories.length > 0) {
      router.push(`/products?categories=${currentCategories.join(',')}`)
    } else {
      router.push('/products')
    }
  }, [resetFilters, router, filters.categories])

  const hasActiveFilters = 
    filters.categories.length > 0 || 
    filters.partnumber || 
    filters.series ||
    Object.keys(filters.parameters).length > 0

  const sidebarClasses = `${styles.filterSidebar} ${
    isMobile && isOpen ? styles.active : ''
  }`

  // 슬라이더 값 안전 파싱 함수
  const getCurrentSliderValue = (paramValue: any, defaultRange: number[]): [number, number] => {
    // 배열인 경우
    if (Array.isArray(paramValue) && paramValue.length >= 2) {
      return [Number(paramValue[0]), Number(paramValue[1])]
    }
    
    // 문자열 범위 "[min,max]" 파싱
    if (typeof paramValue === 'string' && paramValue.startsWith('[')) {
      const match = paramValue.match(/^\[(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)\]$/)
      if (match) {
        return [parseFloat(match[1]), parseFloat(match[2])]
      }
    }
    
    // 기본값 사용
    return defaultRange as [number, number] || [0, 100]
  }

  // 데바운스 적용된 필터 변경 함수
  const debouncedParameterChange = useCallback((paramName: string, value: [number, number]) => {
    // 기존 타이머 정리
    if (debounceTimers.current[paramName]) {
      clearTimeout(debounceTimers.current[paramName])
    }
    
    // 로딩 상태 표시
    setApplyingFilters(prev => new Set(prev).add(paramName))
    
    // 새 타이머 설정 (500ms 지연)
    debounceTimers.current[paramName] = setTimeout(() => {
      handleParameterChange(paramName, value)
      setApplyingFilters(prev => {
        const newSet = new Set(prev)
        newSet.delete(paramName)
        return newSet
      })
    }, 500)
  }, [handleParameterChange])

  // 슬라이더 렌더링 함수 개선
  const renderSlider = (filter: CategoryFilter) => {
    const filterRange = filter.range || [0, 100]
    const [rangeMin, rangeMax] = filterRange
    
    // 현재 필터 값 또는 슬라이더 임시 값 가져오기
    const currentFilterValue = getCurrentSliderValue(filters.parameters[filter.param], filterRange)
    const currentSliderValue = sliderValues[filter.param] || currentFilterValue
    const [min, max] = currentSliderValue
    
    // min/max 검증 함수
    const validateRange = (newMin: number, newMax: number): [number, number] => {
      const validMin = Math.max(rangeMin, Math.min(newMin, rangeMax))
      const validMax = Math.max(validMin, Math.min(newMax, rangeMax))
      return [validMin, validMax]
    }
    
    return (
      <div className={styles.sliderContainer}>
        {/* 범위 값 표시 */}
        <div className={styles.sliderValues}>
          <span>{min.toFixed(1)} - {max.toFixed(1)}{filter.unit || ''}</span>
          {applyingFilters.has(filter.param) && (
            <span className={styles.sliderLoading}>적용중...</span>
          )}
        </div>
        
        {/* 범위 입력 필드 */}
        <div className={styles.sliderInputs}>
          <input
            type="number"
            min={rangeMin}
            max={rangeMax}
            step={filter.tick || 1}
            value={min}
            onChange={(e) => {
              const newMin = parseFloat(e.target.value) || rangeMin
              const [validMin, validMax] = validateRange(newMin, max)
              setSliderValues(prev => ({ ...prev, [filter.param]: [validMin, validMax] }))
              debouncedParameterChange(filter.param, [validMin, validMax])
            }}
            className={styles.sliderInput}
            placeholder="Min"
          />
          <span className={styles.sliderSeparator}>-</span>
          <input
            type="number"
            min={rangeMin}
            max={rangeMax}
            step={filter.tick || 1}
            value={max}
            onChange={(e) => {
              const newMax = parseFloat(e.target.value) || rangeMax
              const [validMin, validMax] = validateRange(min, newMax)
              setSliderValues(prev => ({ ...prev, [filter.param]: [validMin, validMax] }))
              debouncedParameterChange(filter.param, [validMin, validMax])
            }}
            className={styles.sliderInput}
            placeholder="Max"
          />
        </div>
        
        {/* 시각적 범위 슬라이더 */}
        <div className={styles.rangeSliderContainer}>
          <input
            type="range"
            min={rangeMin}
            max={rangeMax}
            step={filter.tick || 1}
            value={min}
            onChange={(e) => {
              const newMin = parseFloat(e.target.value)
              const [validMin, validMax] = validateRange(newMin, max)
              setSliderValues(prev => ({ ...prev, [filter.param]: [validMin, validMax] }))
            }}
            onMouseUp={() => {
              debouncedParameterChange(filter.param, sliderValues[filter.param] || currentFilterValue)
            }}
            onTouchEnd={() => {
              debouncedParameterChange(filter.param, sliderValues[filter.param] || currentFilterValue)
            }}
            className={`${styles.rangeSlider} ${styles.rangeSliderMin}`}
          />
          <input
            type="range"
            min={rangeMin}
            max={rangeMax}
            step={filter.tick || 1}
            value={max}
            onChange={(e) => {
              const newMax = parseFloat(e.target.value)
              const [validMin, validMax] = validateRange(min, newMax)
              setSliderValues(prev => ({ ...prev, [filter.param]: [validMin, validMax] }))
            }}
            onMouseUp={() => {
              debouncedParameterChange(filter.param, sliderValues[filter.param] || currentFilterValue)
            }}
            onTouchEnd={() => {
              debouncedParameterChange(filter.param, sliderValues[filter.param] || currentFilterValue)
            }}
            className={`${styles.rangeSlider} ${styles.rangeSliderMax}`}
          />
          
          {/* 범위 표시 바 */}
          <div className={styles.rangeTrack}>
            <div 
              className={styles.rangeHighlight}
              style={{
                left: `${((min - rangeMin) / (rangeMax - rangeMin)) * 100}%`,
                width: `${((max - min) / (rangeMax - rangeMin)) * 100}%`
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  // 체크박스 렌더링 함수
  const renderCheckboxes = (filter: CategoryFilter) => {
    const paramValue = filters.parameters[filter.param]
    const currentValues = Array.isArray(paramValue) 
      ? paramValue.map(String)
      : (paramValue !== null && paramValue !== undefined) 
        ? [String(paramValue)] 
        : []
    
    if (!filter.options) return null
    
    return (
      <div className={styles.checkboxGroup}>
        {filter.options.map((option, index) => {
          const isChecked = currentValues.includes(option.value)
          
          return (
            <label key={`${filter.param}-${index}`} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => handleParameterChange(filter.param, option.value, e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>
                {option.display}
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
            staticFilters.map((filter, index) => {
              const isExpanded = expandedSections.has(filter.param)
              
              return (
                <div key={`${filter.param}-${index}`} className={`${styles.filterGroup} ${!isExpanded ? styles.collapsed : ''}`}>
                  <h4 
                    onClick={() => toggleSection(filter.param)}
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
                      {filter.type === 'checkbox' && renderCheckboxes(filter)}
                      {filter.type === 'slider' && renderSlider(filter)}
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

export default memo(FilterSidebar)