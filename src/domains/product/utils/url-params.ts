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
 * 필터 값을 URL 파라미터 형태로 변환 (단순화됨)
 * 모든 값을 원본 그대로 반환하여 일관성 보장
 */
export function filterValueToUrlParam(value: string): string {
  // 원본 값 그대로 반환 - 체크박스 상태 유지를 위해 변환 로직 제거
  return value;
}

/**
 * URL 파라미터를 필터 값으로 변환 (단순화됨)
 * 모든 값을 원본 그대로 반환하여 일관성 보장
 */
export function urlParamToFilterValue(param: string): string {
  // 원본 값 그대로 반환 - 변환 로직 제거로 체크박스 상태 유지 보장
  return param;
}

// 사용되지 않는 복잡한 함수들 제거됨 - 단순화를 위해

// 사용되지 않는 함수 제거됨

// 복잡한 정규화 함수도 제거됨

// 복잡한 의미적 비교 함수 제거됨 - 단순화를 위해

/**
 * 두 필터 값이 동일한지 단순 비교 (단순화됨)
 */
export function compareFilterValues(value1: string, value2: string, allValues: string[] = []): boolean {
  // 단순한 문자열 비교만 수행
  return value1 === value2;
}

/**
 * 배열에서 중복되는 값을 제거 (단순화됨)
 */
export function removeDuplicateFilterValues(values: string[]): string[] {
  // 단순한 Set을 사용한 중복 제거
  return [...new Set(values)];
}

// 복잡한 인접값 통합 함수 제거됨 - 단순화를 위해