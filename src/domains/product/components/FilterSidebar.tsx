'use client'

import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useFilterStore } from '@/lib/store'
import { buildFilterUrl } from '@/lib/utils'
import { getConfigByCategoryName } from '../config/category-filters'
import { encodeRangeToken } from '../utils/url-params'
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
      console.log('🔄 FilterSidebar: Loading filters for category:', categoryName)
      
      // category-filters.ts에서 설정 가져오기
      const config = getConfigByCategoryName(categoryName || 'CIS')
      
      if (!config || !config.filters) {
        console.warn('⚠️ No filter config found for category:', categoryName)
        setStaticFilters([])
        setExpandedSections(new Set())
        return
      }
      
      console.log(`✅ Loaded ${config.filters.length} filters for ${categoryName}:`, config.filters.map(f => f.param))
      setStaticFilters(config.filters)

      // 기본 확장 섹션 설정
      const defaultExpanded = new Set<string>()
      config.filters.forEach(filter => {
        if (filter.defaultExpanded) {
          defaultExpanded.add(filter.param)
        }
      })
      setExpandedSections(defaultExpanded)
    } catch (error) {
      console.error('❌ Error loading static filters:', error)
      setStaticFilters([])
      setExpandedSections(new Set())
    } finally {
      setLoading(false)
    }
  }, [categoryName])

  // URL update function - 단순화된 버전
  const updateUrl = useCallback((newFilters: Record<string, unknown>) => {
    const currentFilters = Object.fromEntries(searchParams.entries())
    
    // 업데이트되는 파라미터들에 대해서는 기존 값을 완전히 제거
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] === '' || newFilters[key] === null || newFilters[key] === undefined) {
        delete currentFilters[key]
      }
    })
    
    const mergedFilters = { ...currentFilters, ...newFilters }
    
    // Remove empty filters - 단순화된 로직
    Object.keys(mergedFilters).forEach(key => {
      const value = mergedFilters[key]
      if (value === '' || value === null || value === undefined || 
          (Array.isArray(value) && value.length === 0)) {
        delete mergedFilters[key]
      } else if (Array.isArray(value)) {
        // 단순한 중복 제거만 (Set 사용)
        mergedFilters[key] = [...new Set(value.map(String))]
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

  // 슬라이더 값 안전 파싱 함수
  const getCurrentSliderValue = (paramValue: any, defaultRange: number[]): [number, number] => {
    console.log(`🔧 getCurrentSliderValue processing:`, paramValue, 'defaultRange:', defaultRange)
    
    // 배열인 경우
    if (Array.isArray(paramValue) && paramValue.length >= 2) {
      const result = [Number(paramValue[0]), Number(paramValue[1])] as [number, number]
      console.log('   Array case result:', result)
      return result
    }
    
    // 배열이지만 길이가 1인 경우 (URL에서 단일값) - 특별 처리
    if (Array.isArray(paramValue) && paramValue.length === 1) {
      const singleValue = Number(paramValue[0])
      if (!isNaN(singleValue)) {
        // 단일 값을 고정값으로 처리 (min=max=값)
        const result = [singleValue, singleValue] as [number, number]
        console.log('   Single array value result:', result)
        return result
      }
    }
    
    // 문자열 범위 "[min,max]" 파싱
    if (typeof paramValue === 'string' && paramValue.startsWith('[')) {
      const match = paramValue.match(/^\[(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)\]$/)
      if (match) {
        const result = [parseFloat(match[1]), parseFloat(match[2])] as [number, number]
        console.log('   String range result:', result)
        return result
      }
    }
    
    // 단일 숫자 문자열 처리
    if (typeof paramValue === 'string') {
      const numValue = parseFloat(paramValue)
      if (!isNaN(numValue)) {
        const result = [numValue, numValue] as [number, number]
        console.log('   Single string number result:', result)
        return result
      }
    }
    
    // 기본값 사용
    const result = defaultRange as [number, number] || [0, 100]
    console.log('   Default range result:', result)
    return result
  }

  // 필터 변경 시 슬라이더 값 초기화
  useEffect(() => {
    setSliderValues({})
  }, [filters.categories])

  // URL에서 파싱된 filters.parameters가 변경되었을 때 UI 강제 동기화
  useEffect(() => {
    console.log('🔄 FilterSidebar: filters.parameters changed:', filters.parameters)
    
    // 슬라이더 값들을 filters.parameters에 맞게 초기화
    if (staticFilters.length > 0) {
      const newSliderValues: Record<string, [number, number]> = {}
      staticFilters.forEach(filter => {
        if (filter.type === 'slider' && filters.parameters[filter.param]) {
          const paramValue = filters.parameters[filter.param]
          const defaultRange = filter.range || [0, 100]
          const currentValue = getCurrentSliderValue(paramValue, defaultRange)
          newSliderValues[filter.param] = currentValue
          console.log(`   Slider [${filter.param}] initialized to:`, currentValue)
        }
      })
      
      if (Object.keys(newSliderValues).length > 0) {
        setSliderValues(newSliderValues)
        console.log('✅ Slider values synchronized from URL:', newSliderValues)
      }
    }
  }, [filters.parameters, staticFilters])

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
      // 체크박스 형태 (multiselect) - 단순화된 로직
      const paramValue = currentParams[paramName]
      const currentValues = Array.isArray(paramValue) 
        ? paramValue.map(String)
        : (paramValue !== null && paramValue !== undefined) 
          ? [String(paramValue)] 
          : []
      
      if (checked) {
        // 단순 중복 체크 및 추가
        if (!currentValues.includes(value)) {
          const newValues = [...currentValues, value]
          currentParams[paramName] = newValues
        }
      } else {
        // 정확한 값만 제거
        const filteredValues = currentValues.filter(existing => existing !== value)
        
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
    
    // URL 업데이트 - 단순화된 로직
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
          urlParams[paramName] = rangeToken
        } else if (Array.isArray(paramValue)) {
          // 체크박스 배열 - 단순히 그대로 URL에 전달
          urlParams[paramName] = paramValue
        } else {
          // 단일 값인 경우 그대로 전달
          urlParams[paramName] = paramValue
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

  // 체크박스 렌더링 함수 - 단순화된 버전
  const renderCheckboxes = (filter: CategoryFilter) => {
    const paramValue = filters.parameters[filter.param]
    
    // 현재 값들을 문자열 배열로 노멀라이즈
    let currentValues: string[] = []
    if (Array.isArray(paramValue)) {
      currentValues = paramValue.map(String)
    } else if (paramValue !== null && paramValue !== undefined) {
      currentValues = [String(paramValue)]
    }
    
    // 디버깅: 체크박스 상태 로깅
    if (paramValue !== null && paramValue !== undefined) {
      console.log(`📋 Checkbox [${filter.param}] current values:`, currentValues)
    }
    
    if (!filter.options) return null
    
    return (
      <div className={styles.checkboxGroup}>
        {filter.options.map((option, index) => {
          // 단순한 문자열 비교를 통한 체크 상태 판별
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