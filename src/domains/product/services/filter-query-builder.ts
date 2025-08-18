// ASP 원본 필터링 로직을 Supabase/PostgreSQL에 맞게 변환하는 쿼리 빌더
// 복합 SQL 조건 (BETWEEN, NOT IN, 부등호 연산) 처리

import type { FilterCondition, FilterQuery, AdvancedFilterOption } from '../types'

/**
 * ASP 원본 필터 값을 PostgreSQL 조건으로 변환
 * 지원하는 조건 타입:
 * - ">=1000" -> field >= 1000
 * - "BETWEEN 500 AND 999" -> field BETWEEN 500 AND 999  
 * - "NOT IN ('A','B')" -> field NOT IN ('A','B')
 * - "<=99" -> field <= 99
 * - "Mono" -> field = 'Mono'
 */
export function parseFilterValue(field: string, value: string): FilterCondition {
  const trimmedValue = value.trim();
  
  // JSON 배열 형식 [min,max] 처리
  const jsonArrayMatch = trimmedValue.match(/^\[(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)\]$/);
  if (jsonArrayMatch) {
    const [, min, max] = jsonArrayMatch;
    return {
      field,
      operator: 'between',
      value: [parseFloat(min), parseFloat(max)]
    };
  }
  
  // BETWEEN 조건 처리
  const betweenMatch = trimmedValue.match(/^BETWEEN\s+(\d+(?:\.\d+)?)\s+AND\s+(\d+(?:\.\d+)?)$/i);
  if (betweenMatch) {
    const [, min, max] = betweenMatch;
    return {
      field,
      operator: 'between',
      value: [parseFloat(min), parseFloat(max)]
    };
  }
  
  // NOT IN 조건 처리
  const notInMatch = trimmedValue.match(/^NOT\s+IN\s*\((.+)\)$/i);
  if (notInMatch) {
    const values = notInMatch[1]
      .split(',')
      .map(v => v.trim().replace(/^['"]|['"]$/g, ''));
    return {
      field,
      operator: 'not_in',
      value: values
    };
  }
  
  // 부등호 조건 처리
  const inequalityMatch = trimmedValue.match(/^(>=|<=|>|<)(\d+(?:\.\d+)?)$/);
  if (inequalityMatch) {
    const [, operator, numValue] = inequalityMatch;
    const operatorMap: Record<string, FilterCondition['operator']> = {
      '>=': 'gte',
      '<=': 'lte', 
      '>': 'gt',
      '<': 'lt'
    };
    return {
      field,
      operator: operatorMap[operator],
      value: parseFloat(numValue)
    };
  }
  
  // 복합 AND 조건 처리 (예: ">=5 AND p_item4 <10")
  const complexAndMatch = trimmedValue.match(/(.+)\s+AND\s+(.+)/i);
  if (complexAndMatch) {
    return {
      field,
      operator: 'custom',
      value: null,
      customSql: trimmedValue.replace(/p_item\d+/g, field) // p_item4 -> 실제 필드명으로 교체
    };
  }
  
  // 숫자 값 처리
  if (/^\d+(?:\.\d+)?$/.test(trimmedValue)) {
    return {
      field,
      operator: 'eq',
      value: parseFloat(trimmedValue)
    };
  }
  
  // 문자열 값 처리 (기본값)
  return {
    field,
    operator: 'eq',
    value: trimmedValue
  };
}

/**
 * 필터 조건을 PostgreSQL WHERE 절로 변환
 */
export function buildWhereClause(conditions: FilterCondition[]): FilterQuery {
  if (conditions.length === 0) {
    return {
      conditions: [],
      parameters: {},
      sql: ''
    };
  }
  
  const whereClauses: string[] = [];
  const parameters: Record<string, unknown> = {};
  let paramIndex = 1;
  
  conditions.forEach(condition => {
    const { field, operator, value, customSql } = condition;
    
    // 커스텀 SQL 조건 처리
    if (operator === 'custom' && customSql) {
      whereClauses.push(`(${customSql})`);
      return;
    }
    
    const paramKey = `param_${paramIndex++}`;
    
    switch (operator) {
      case 'eq':
        whereClauses.push(`${field} = $${paramIndex - 1}`);
        parameters[paramKey] = value;
        break;
        
      case 'ne':
        whereClauses.push(`${field} != $${paramIndex - 1}`);
        parameters[paramKey] = value;
        break;
        
      case 'gt':
        whereClauses.push(`${field} > $${paramIndex - 1}`);
        parameters[paramKey] = value;
        break;
        
      case 'gte':
        whereClauses.push(`${field} >= $${paramIndex - 1}`);
        parameters[paramKey] = value;
        break;
        
      case 'lt':
        whereClauses.push(`${field} < $${paramIndex - 1}`);
        parameters[paramKey] = value;
        break;
        
      case 'lte':
        whereClauses.push(`${field} <= $${paramIndex - 1}`);
        parameters[paramKey] = value;
        break;
        
      case 'between':
        if (Array.isArray(value) && value.length === 2) {
          const minKey = `param_${paramIndex - 1}`;
          const maxKey = `param_${paramIndex++}`;
          whereClauses.push(`${field} BETWEEN $${paramIndex - 2} AND $${paramIndex - 1}`);
          parameters[minKey] = value[0];
          parameters[maxKey] = value[1];
        }
        break;
        
      case 'in':
        if (Array.isArray(value)) {
          const placeholders = value.map((_, i) => `$${paramIndex + i}`).join(', ');
          whereClauses.push(`${field} IN (${placeholders})`);
          value.forEach((val, i) => {
            parameters[`param_${paramIndex + i}`] = val;
          });
          paramIndex += value.length;
        }
        break;
        
      case 'not_in':
        if (Array.isArray(value)) {
          const placeholders = value.map((_, i) => `$${paramIndex + i}`).join(', ');
          whereClauses.push(`${field} NOT IN (${placeholders})`);
          value.forEach((val, i) => {
            parameters[`param_${paramIndex + i}`] = val;
          });
          paramIndex += value.length;
        }
        break;
        
      case 'like':
        whereClauses.push(`${field} ILIKE $${paramIndex - 1}`);
        parameters[paramKey] = `%${value}%`;
        break;
    }
  });
  
  return {
    conditions,
    parameters,
    sql: whereClauses.length > 0 ? whereClauses.join(' AND ') : ''
  };
}

/**
 * 체크박스 필터 (다중 선택) 처리
 * 선택된 여러 조건을 OR로 연결
 */
export function buildCheckboxFilter(field: string, selectedValues: string[]): FilterCondition[] {
  if (selectedValues.length === 0) {
    return [];
  }
  
  return selectedValues.map(value => parseFilterValue(field, value));
}

/**
 * 슬라이더 필터 (범위) 처리
 */
export function buildSliderFilter(field: string, range: [number, number]): FilterCondition[] {
  const [min, max] = range;
  
  if (min === max) {
    return [{
      field,
      operator: 'eq',
      value: min
    }];
  }
  
  return [{
    field,
    operator: 'between',
    value: [min, max]
  }];
}

/**
 * 고급 필터 옵션을 SQL 조건으로 변환
 */
export function buildAdvancedFilterConditions(
  field: string, 
  options: AdvancedFilterOption[], 
  selectedValues: string[]
): FilterCondition[] {
  const conditions: FilterCondition[] = [];
  
  selectedValues.forEach(selectedValue => {
    const option = options.find(opt => opt.value === selectedValue);
    if (option) {      
      // sqlCondition이 있으면 사용, 없으면 기본 조건
      if (option.sqlCondition) {
        conditions.push(parseFilterValue(field, option.sqlCondition));
      } else {
        conditions.push({
          field,
          operator: 'eq',
          value: option.value
        });
      }
    }
  });
  
  return conditions;
}

/**
 * 전체 필터 상태를 Supabase 쿼리로 변환
 * 여러 필터 조건을 AND로 연결
 */
export function buildFilterQuery(filterState: {
  [key: string]: {
    type: 'checkbox' | 'slider' | 'select'
    field: string
    values: string[] | [number, number] | string
    options?: AdvancedFilterOption[]
  }
}): FilterQuery {
  const allConditions: FilterCondition[] = [];
  
  Object.values(filterState).forEach(filter => {
    let conditions: FilterCondition[] = [];
    
    switch (filter.type) {
      case 'checkbox':
        if (Array.isArray(filter.values)) {
          if (filter.options) {
            conditions = buildAdvancedFilterConditions(filter.field, filter.options, filter.values as string[]);
          } else {
            conditions = buildCheckboxFilter(filter.field, filter.values as string[]);
          }
        }
        break;
        
      case 'slider':
        if (Array.isArray(filter.values) && filter.values.length === 2) {
          conditions = buildSliderFilter(filter.field, filter.values as [number, number]);
        }
        break;
        
      case 'select':
        if (typeof filter.values === 'string') {
          conditions = [parseFilterValue(filter.field, filter.values)];
        }
        break;
    }
    
    allConditions.push(...conditions);
  });
  
  return buildWhereClause(allConditions);
}

/**
 * 필터 값 검증
 */
export function validateFilterValue(value: string): boolean {
  // 위험한 SQL 인젝션 패턴 체크
  const dangerousPatterns = [
    /;\s*(drop|delete|truncate|alter)\s+/i,
    /union\s+select/i,
    /script\s*:/i,
    /javascript\s*:/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(value));
}