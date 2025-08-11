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
 * 고급 의미적 비교 - 인접한 단일값들을 범위로 간주
 */
export function isSemanticallySimilar(value1: string, value2: string, allValues: string[] = []): boolean {
  const norm1 = normalizeFilterValue(value1);
  const norm2 = normalizeFilterValue(value2);
  
  // 직접적인 정규화 비교
  if (norm1 === norm2) {
    return true;
  }
  
  // 범위와 단일값들 간의 의미적 비교
  const isRange1 = norm1.startsWith('[') && norm1.endsWith(']');
  const isRange2 = norm2.startsWith('[') && norm2.endsWith(']');
  const isNumber1 = !isNaN(parseFloat(norm1)) && isFinite(parseFloat(norm1));
  const isNumber2 = !isNaN(parseFloat(norm2)) && isFinite(parseFloat(norm2));
  
  // 범위와 단일값 비교
  if (isRange1 && isNumber2) {
    const match = norm1.match(/^\[(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)\]$/);
    if (match) {
      const [, min, max] = match;
      const num2 = parseFloat(norm2);
      return num2 >= parseFloat(min) && num2 <= parseFloat(max);
    }
  }
  
  if (isRange2 && isNumber1) {
    const match = norm2.match(/^\[(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)\]$/);
    if (match) {
      const [, min, max] = match;
      const num1 = parseFloat(norm1);
      return num1 >= parseFloat(min) && num1 <= parseFloat(max);
    }
  }
  
  // 인접한 단일값들이 범위를 형성하는지 확인
  if (isNumber1 && isNumber2 && allValues.length > 2) {
    const numbers = allValues
      .filter(v => !isNaN(parseFloat(normalizeFilterValue(v))) && isFinite(parseFloat(normalizeFilterValue(v))))
      .map(v => parseFloat(normalizeFilterValue(v)))
      .sort((a, b) => a - b);
      
    const num1 = parseFloat(norm1);
    const num2 = parseFloat(norm2);
    
    // 연속된 숫자인지 확인
    const index1 = numbers.indexOf(num1);
    const index2 = numbers.indexOf(num2);
    
    if (index1 !== -1 && index2 !== -1) {
      return Math.abs(index1 - index2) === 1; // 인접한 값들
    }
  }
  
  return false;
}

/**
 * 두 필터 값이 의미적으로 동일한지 비교
 * 다양한 표현 형태를 정규화하여 비교
 */
export function compareFilterValues(value1: string, value2: string, allValues: string[] = []): boolean {
  // 먼저 기본적인 정규화 비교
  const norm1 = normalizeFilterValue(value1);
  const norm2 = normalizeFilterValue(value2);
  
  if (norm1 === norm2) {
    return true;
  }
  
  // 고급 의미적 비교 (범위와 단일값 간의 관계 등)
  return isSemanticallySimilar(value1, value2, allValues);
}

/**
 * 배열에서 의미적으로 중복되는 값을 제거
 */
export function removeDuplicateFilterValues(values: string[]): string[] {
  const result: string[] = [];
  
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    const isDuplicate = result.some(existing => 
      compareFilterValues(existing, value, values)
    );
    
    if (!isDuplicate) {
      result.push(value);
    }
  }
  
  // 추가로 인접한 단일값들을 범위로 통합
  return consolidateAdjacentValues(result);
}

/**
 * 인접한 단일 값들을 범위로 통합하는 함수
 */
function consolidateAdjacentValues(values: string[]): string[] {
  const numbers: number[] = [];
  const nonNumbers: string[] = [];
  
  // 숫자와 비숫자 분리
  values.forEach(value => {
    const normalized = normalizeFilterValue(value);
    if (!isNaN(parseFloat(normalized)) && isFinite(parseFloat(normalized))) {
      numbers.push(parseFloat(normalized));
    } else {
      nonNumbers.push(value);
    }
  });
  
  if (numbers.length < 2) {
    return values; // 숫자가 2개 미만이면 통합하지 않음
  }
  
  // 숫자들을 정렬
  numbers.sort((a, b) => a - b);
  
  // 연속된 숫자들을 찾아서 범위로 통합
  const consolidated: string[] = [];
  let rangeStart = numbers[0];
  let rangeEnd = numbers[0];
  
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] === rangeEnd + 1) {
      // 연속된 경우 범위 확장
      rangeEnd = numbers[i];
    } else {
      // 연속되지 않은 경우 현재 범위 저장
      if (rangeStart === rangeEnd) {
        consolidated.push(rangeStart.toString());
      } else {
        consolidated.push(`[${rangeStart},${rangeEnd}]`);
      }
      rangeStart = numbers[i];
      rangeEnd = numbers[i];
    }
  }
  
  // 마지막 범위 저장
  if (rangeStart === rangeEnd) {
    consolidated.push(rangeStart.toString());
  } else {
    consolidated.push(`[${rangeStart},${rangeEnd}]`);
  }
  
  // 비숫자 값들도 추가
  return [...consolidated, ...nonNumbers];
}