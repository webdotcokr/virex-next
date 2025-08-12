/**
 * 제품 파라미터의 단위 매핑 유틸리티
 */

// 파라미터명 → 단위 매핑 객체
export const PARAMETER_UNITS: Record<string, string> = {
  // CIS/Line 카메라
  'scan_width': 'mm',
  'dpi': 'dpi', 
  'resolution': 'μm',
  'line_rate': 'kHz',
  'speed': 'mm/s',
  'wd': 'mm',
  
  // Area 카메라  
  'mega_pixel': 'MP',
  'frame_rate': 'fps',
  'pixel_size': 'μm',
  'dynamic_range': 'dB',
  
  // 렌즈 (Telecentric, FA Lens, Large Format)
  'mag': 'x',
  'image_circle': 'mm',
  'f_number': '', // f/18 형태이므로 단위 없음
  'na': '', // 수치 개구(numerical aperture)는 단위 없음
  'mtf30': 'lp/mm',
  'optical_resolution': 'μm',
  'distortion': '%',
  'dof': 'mm',
  'length_of_io': 'mm',
  'telecentricity': 'mrad',
  
  // 일반 공통
  'weight': 'g',
  'power': 'W',
  'temperature': '°C',
  'voltage': 'V',
  'current': 'A',
  'frequency': 'Hz',
  'wavelength': 'nm',
  
  // 추가 카메라 파라미터
  'exposure_time': 'μs',
  'gain': 'dB',
  'bit_depth': 'bit',
  'sensor_size': 'mm'
}

/**
 * 파라미터명으로 단위를 조회하는 함수
 * @param paramName - 파라미터명
 * @returns 해당 파라미터의 단위 (없으면 빈 문자열)
 */
export function getParameterUnit(paramName: string): string {
  return PARAMETER_UNITS[paramName] || ''
}

/**
 * 값과 파라미터명을 받아 단위가 포함된 문자열로 포맷팅
 * @param value - 원본 값
 * @param paramName - 파라미터명
 * @returns 단위가 포함된 포맷팅된 문자열
 */
export function formatValueWithUnit(value: any, paramName: string): string {
  const unit = getParameterUnit(paramName)
  
  if (typeof value === 'number') {
    const formatted = value.toLocaleString('ko-KR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
    return unit ? `${formatted} ${unit}` : formatted
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  
  return String(value)
}

/**
 * 특정 파라미터가 단위를 가지는지 확인
 * @param paramName - 파라미터명
 * @returns 단위가 있으면 true, 없으면 false
 */
export function hasUnit(paramName: string): boolean {
  return Boolean(PARAMETER_UNITS[paramName])
}