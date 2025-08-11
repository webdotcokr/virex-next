// URL 파라미터와 필터 값 간 직렬화/역직렬화 유틸리티

/**
 * 범위 값을 URL에 적합한 문자열로 인코딩
 * - null 상한: "5000-" (5000 이상)
 * - null 하한: "-999" (999 이하) 
 * - 범위: "1000-2999" (1000~2999)
 */
export function encodeRangeToken(min: number | null, max: number | null): string {
  if (min !== null && max !== null) {
    return `${min}-${max}`;
  } else if (min !== null && max === null) {
    return `${min}-`;
  } else if (min === null && max !== null) {
    return `-${max}`;
  }
  return '';
}

/**
 * URL 토큰을 범위 객체로 디코딩
 * "5000-" -> { min: 5000, max: null }
 * "-999" -> { min: null, max: 999 }
 * "1000-2999" -> { min: 1000, max: 2999 }
 */
export function decodeRangeToken(token: string): { min: number | null; max: number | null } {
  const dashIndex = token.indexOf('-');
  
  if (dashIndex === -1) {
    // 단일 값 (예: "300")
    const value = parseFloat(token);
    return { min: value, max: value };
  }
  
  const beforeDash = token.substring(0, dashIndex);
  const afterDash = token.substring(dashIndex + 1);
  
  const min = beforeDash ? parseFloat(beforeDash) : null;
  const max = afterDash ? parseFloat(afterDash) : null;
  
  return { min, max };
}

/**
 * 필터 값을 URL 파라미터 형태로 변환
 * ">= 5000" -> "5000-"
 * "[1000,2999]" -> "1000-2999"
 * "<= 999" -> "-999"
 */
export function filterValueToUrlParam(value: string): string {
  const trimmed = value.trim();
  
  // >=, >, <=, < 형태 처리
  const comparisonMatch = trimmed.match(/^(>=|<=|>|<)(\d+(?:\.\d+)?)$/);
  if (comparisonMatch) {
    const [, operator, number] = comparisonMatch;
    const num = parseFloat(number);
    
    switch (operator) {
      case '>=':
      case '>':
        return encodeRangeToken(num, null);
      case '<=':
      case '<':
        return encodeRangeToken(null, num);
    }
  }
  
  // [min,max] 형태 처리
  const rangeMatch = trimmed.match(/^\[(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)\]$/);
  if (rangeMatch) {
    const [, minStr, maxStr] = rangeMatch;
    return encodeRangeToken(parseFloat(minStr), parseFloat(maxStr));
  }
  
  // 일반 문자열은 그대로 반환
  return value;
}

/**
 * URL 파라미터를 필터 값으로 변환
 * "5000-" -> ">=5000"
 * "1000-2999" -> "[1000,2999]"
 * "-999" -> "<=999"
 */
export function urlParamToFilterValue(param: string): string {
  // 범위 토큰 형식인지 확인 (숫자-숫자 또는 -숫자 또는 숫자- 형태)
  const isRangeFormat = /^(\d*)-(\d*)$/.test(param);
  
  if (isRangeFormat) {
    const range = decodeRangeToken(param);
    
    if (range.min !== null && range.max !== null) {
      if (range.min === range.max) {
        return range.min.toString();
      }
      return `[${range.min},${range.max}]`;
    } else if (range.min !== null) {
      return `>=${range.min}`;
    } else if (range.max !== null) {
      return `<=${range.max}`;
    }
  }
  
  // 범위 형식이 아니면 원본 그대로 반환 (예: "Mono", "Color")
  return param;
}

/**
 * SearchParams에 범위 필터 추가
 */
export function appendRangeFiltersToSearchParams(
  searchParams: URLSearchParams,
  filterParam: string,
  selectedValues: string[]
): URLSearchParams {
  const newParams = new URLSearchParams(searchParams);
  
  // 기존 파라미터 제거
  newParams.delete(filterParam);
  
  // 새 값들 추가
  selectedValues.forEach(value => {
    const urlParam = filterValueToUrlParam(value);
    if (urlParam) {
      newParams.append(filterParam, urlParam);
    }
  });
  
  return newParams;
}

/**
 * SearchParams에서 범위 필터 읽기
 */
export function getRangeFiltersFromSearchParams(
  searchParams: URLSearchParams,
  filterParam: string
): string[] {
  const urlParams = searchParams.getAll(filterParam);
  return urlParams.map(param => urlParamToFilterValue(param));
}

/**
 * 필터 값을 정규화된 형태로 변환
 * 다양한 형태의 범위 표현을 일관된 형태로 통합
 */
export function normalizeFilterValue(value: string): string {
  const trimmed = value.trim();
  
  // 이미 정규화된 형태들은 그대로 반환
  if (trimmed.match(/^(>=|<=|>|<)\d+(\.\d+)?$/)) {
    return trimmed;
  }
  
  if (trimmed.match(/^\[\d+(\.\d+)?,\d+(\.\d+)?\]$/)) {
    return trimmed;
  }
  
  // 범위 토큰 형태 (3000-4999)를 대괄호 형태로 변환
  if (trimmed.match(/^\d+(\.\d+)?-\d+(\.\d+)?$/)) {
    const [min, max] = trimmed.split('-').map(parseFloat);
    const normalized = `[${min},${max}]`;
    return normalized;
  }
  
  // 단방향 범위 토큰 형태
  if (trimmed.match(/^\d+(\.\d+)?-$/)) {
    const min = parseFloat(trimmed.replace('-', ''));
    const normalized = `>=${min}`;
    return normalized;
  }
  
  if (trimmed.match(/^-\d+(\.\d+)?$/)) {
    const max = parseFloat(trimmed.replace('-', ''));
    const normalized = `<=${max}`;
    return normalized;
  }
  
  // 일반 문자열은 그대로 반환
  return trimmed;
}

/**
 * 두 필터 값이 의미적으로 동일한지 비교
 * 다양한 표현 형태를 정규화하여 비교
 */
export function compareFilterValues(value1: string, value2: string): boolean {
  const norm1 = normalizeFilterValue(value1);
  const norm2 = normalizeFilterValue(value2);
  return norm1 === norm2;
}

/**
 * 배열에서 의미적으로 중복되는 값을 제거
 */
export function removeDuplicateFilterValues(values: string[]): string[] {
  const result: string[] = [];
  
  for (const value of values) {
    const normalized = normalizeFilterValue(value);
    const isDuplicate = result.some(existing => 
      normalizeFilterValue(existing) === normalized
    );
    
    if (!isDuplicate) {
      result.push(value);
    }
  }
  
  return result;
}