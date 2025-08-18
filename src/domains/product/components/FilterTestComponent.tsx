'use client'

import { useState } from 'react'
import { getConfigByCategoryName, categoryConfigs } from '../config/category-filters'
import { buildFilterQuery, parseFilterValue, buildAdvancedFilterConditions } from '../services/filter-query-builder'
import type { AdvancedFilterOption } from '../types'

// 필터링 시스템 통합 테스트 컴포넌트
export default function FilterTestComponent() {
  const [selectedCategory, setSelectedCategory] = useState('cis')
  const [testResults, setTestResults] = useState<string[]>([])

  // 모든 카테고리 목록
  const categoryOptions = Object.keys(categoryConfigs)

  // 선택된 카테고리의 설정 가져오기
  const categoryConfig = getConfigByCategoryName(selectedCategory) || categoryConfigs['cis']

  const runTests = () => {
    const results: string[] = []
    
    // 1. 설정된 모든 카테고리 확인
    results.push('=== 카테고리 설정 테스트 ===')
    categoryOptions.forEach(categoryKey => {
      const config = categoryConfigs[categoryKey]
      results.push(`✓ ${categoryKey}: ${config.filters.length}개 필터, ${config.columns.length}개 컬럼`)
    })

    // 2. 필터 값 파싱 테스트
    results.push('\n=== 필터 값 파싱 테스트 ===')
    const testValues = [
      '>=1000',
      'BETWEEN 500 AND 999', 
      'NOT IN (\'Mono\',\'Color\')',
      '<=99',
      'Mono',
      '4800',
      '>=5 AND p_item4 <10'
    ]
    
    testValues.forEach(value => {
      try {
        const condition = parseFilterValue('test_field', value)
        results.push(`✓ "${value}" → ${condition.operator} (${JSON.stringify(condition.value)})`)
      } catch (error) {
        results.push(`✗ "${value}" → 오류: ${error}`)
      }
    })

    // 3. SQL 쿼리 생성 테스트
    results.push('\n=== SQL 쿼리 생성 테스트 ===')
    const sampleFilterState = {
      scan_width: {
        type: 'checkbox' as const,
        field: 'scan_width',
        values: ['>=1000', 'BETWEEN 500 AND 999'],
        options: [
          { display: '1000mm 이상', value: '>=1000' },
          { display: '500mm ~ 999mm', value: 'BETWEEN 500 AND 999' }
        ] as AdvancedFilterOption[]
      },
      dpi: {
        type: 'checkbox' as const,
        field: 'dpi', 
        values: ['4800', '3600'],
        options: [
          { display: '4800dpi', value: '4800' },
          { display: '3600dpi', value: '3600' }
        ] as AdvancedFilterOption[]
      },
      no_of_pixels: {
        type: 'slider' as const,
        field: 'no_of_pixels',
        values: [50000, 150000] as [number, number]
      }
    }
    
    try {
      const query = buildFilterQuery(sampleFilterState)
      results.push('✓ 쿼리 생성 성공:')
      results.push(`  SQL: ${query.sql}`)
      results.push(`  파라미터: ${JSON.stringify(query.parameters, null, 2)}`)
    } catch (error) {
      results.push(`✗ 쿼리 생성 실패: ${error}`)
    }

    // 4. 현재 선택된 카테고리의 필터 구조 분석
    results.push(`\n=== ${selectedCategory.toUpperCase()} 카테고리 필터 분석 ===`)
    categoryConfig.filters.forEach(filter => {
      const optionCount = filter.options?.length || 0
      const rangeInfo = filter.range ? `범위: ${filter.range[0]}-${filter.range[1]}` : ''
      results.push(`✓ ${filter.name} (${filter.type}) - ${optionCount}개 옵션 ${rangeInfo}`)
      
      // 체크박스 필터의 경우 몇 개 옵션 표시
      if (filter.type === 'checkbox' && filter.options && filter.options.length > 0) {
        const sampleOptions = filter.options.slice(0, 3).map(opt => opt.display).join(', ')
        results.push(`  예: ${sampleOptions}${filter.options.length > 3 ? '...' : ''}`)
      }
    })

    setTestResults(results)
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>제품 필터링 시스템 통합 테스트</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label>테스트할 카테고리 선택: </label>
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ marginLeft: '10px', padding: '5px' }}
        >
          {categoryOptions.map(category => (
            <option key={category} value={category}>
              {category.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <button 
        onClick={runTests}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        테스트 실행
      </button>

      {testResults.length > 0 && (
        <div style={{ 
          marginTop: '20px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          whiteSpace: 'pre-line'
        }}>
          {testResults.join('\n')}
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <h3>현재 선택된 카테고리: {selectedCategory.toUpperCase()}</h3>
        <p>필터 개수: {categoryConfig.filters.length}</p>
        <p>컬럼 개수: {categoryConfig.columns.length}</p>
        
        <details style={{ marginTop: '10px' }}>
          <summary>필터 세부 정보</summary>
          <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', fontSize: '12px' }}>
            {JSON.stringify(categoryConfig.filters, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}