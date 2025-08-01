// 카테고리별 독립적 스펙 매핑 시스템
// Supabase categories 테이블의 실제 category_id를 키로 사용

export interface CategorySpecification {
  order: string[]  // 표시 순서
  labels: Record<string, string>  // DB 필드 → 표시 라벨 매핑
}

export const categorySpecifications: Record<number, CategorySpecification> = {
  // 9: CIS 카메라 (현재 제품들이 실제로 있는 카테고리)
  9: {
    order: ['spectrum', 'interface', 'resolution', 'speed', 'scan_width', 'line_rate', 'wd', 'dpi', 'no_of_pixels'],
    labels: {
      'spectrum': 'Spectrum',
      'interface': 'Interface',
      'resolution': 'Resolution (μm)',
      'speed': 'Speed',
      'scan_width': 'Scan Width (mm)',
      'line_rate': 'Line Rate (kHz)',
      'wd': 'Working Distance (mm)',
      'dpi': 'DPI',
      'no_of_pixels': 'Number of Pixels'
    }
  },

  // 10: TDI 카메라 (예시 - 추후 제품 추가시 사용)
  10: {
    order: ['spectrum', 'interface', 'pixel_size', 'frame_rate', 'exposure_time'],
    labels: {
      'spectrum': 'TDI Spectrum',
      'interface': 'TDI Interface',
      'pixel_size': 'Pixel Size (μm)',
      'frame_rate': 'Frame Rate (fps)',
      'exposure_time': 'Exposure Time (μs)'
    }
  },

  // 11: Line 카메라
  11: {
    order: ['spectrum', 'interface', 'resolution', 'line_rate', 'pixel_size'],
    labels: {
      'spectrum': 'Line Spectrum',
      'interface': 'Line Interface', 
      'resolution': 'Line Resolution (μm)',
      'line_rate': 'Line Rate (kHz)',
      'pixel_size': 'Pixel Size (μm)'
    }
  },

  // 12: Area 카메라  
  12: {
    order: ['spectrum', 'interface', 'resolution', 'frame_rate', 'pixel_size'],
    labels: {
      'spectrum': 'Area Spectrum',
      'interface': 'Area Interface',
      'resolution': 'Area Resolution (MP)',
      'frame_rate': 'Frame Rate (fps)',
      'pixel_size': 'Pixel Size (μm)'
    }
  },

  // 15: Large Format 렌즈
  15: {
    order: ['focal_length', 'aperture', 'magnification', 'field_of_view', 'working_distance'],
    labels: {
      'focal_length': 'Focal Length (mm)',
      'aperture': 'Aperture (f/)',
      'magnification': 'Magnification',
      'field_of_view': 'Field of View (mm)',
      'working_distance': 'Working Distance (mm)'
    }
  },

  // 16: Telecentric 렌즈
  16: {
    order: ['magnification', 'working_distance', 'field_of_view', 'aperture', 'focal_length'],
    labels: {
      'magnification': 'Magnification',
      'working_distance': 'Working Distance (mm)',
      'field_of_view': 'Field of View (mm)',
      'aperture': 'Aperture (f/)',
      'focal_length': 'Focal Length (mm)'
    }
  },

  // 18: 3D Laser Profiler
  18: {
    order: ['depth_range', 'point_cloud_density', '3d_accuracy', 'measurement_volume', 'laser_class'],
    labels: {
      'depth_range': 'Depth Range (mm)',
      'point_cloud_density': 'Point Cloud Density',
      '3d_accuracy': '3D Accuracy (μm)',
      'measurement_volume': 'Measurement Volume (mm³)',
      'laser_class': 'Laser Class'
    }
  },

  // 19: 3D Stereo Camera
  19: {
    order: ['baseline', 'depth_range', '3d_accuracy', 'frame_rate', 'resolution'],
    labels: {
      'baseline': 'Baseline (mm)',
      'depth_range': 'Depth Range (mm)',
      '3d_accuracy': '3D Accuracy (μm)', 
      'frame_rate': 'Frame Rate (fps)',
      'resolution': 'Resolution (MP)'
    }
  }
}

// 카테고리별로 해당하는 스펙 필드들과 순서를 가져오는 함수
export function getCategorySpecifications(categoryIds: number[]): { fields: string[], labels: Record<string, string> } {
  if (categoryIds.length === 0) {
    return { fields: [], labels: {} }
  }

  const allFields: string[] = []
  const allLabels: Record<string, string> = {}
  const processedFields = new Set<string>()

  // 카테고리 순서대로 처리하여 우선순위 유지
  categoryIds.forEach(categoryId => {
    const categorySpec = categorySpecifications[categoryId]
    if (categorySpec) {
      // 순서대로 필드 추가 (중복 제거)
      categorySpec.order.forEach(field => {
        if (!processedFields.has(field)) {
          allFields.push(field)
          processedFields.add(field)
        }
      })
      
      // 라벨 병합 (나중에 추가된 것이 우선)
      Object.assign(allLabels, categorySpec.labels)
    }
  })

  return { fields: allFields, labels: allLabels }
}

// 제품 배열에서 카테고리별 스펙 필드들을 추출
export function extractCategorySpecifications(products: Array<{category_id: number, specifications?: Record<string, string | number | boolean>}>): { fields: string[], labels: Record<string, string> } {
  // 현재 제품들의 카테고리 ID 수집
  const categoryIds = [...new Set(products.map(p => p.category_id))]
  
  // 카테고리별 스펙 정의 가져오기
  const { fields: orderedFields, labels } = getCategorySpecifications(categoryIds)
  
  // 실제로 존재하는 스펙 필드만 필터링
  const existingFields = new Set<string>()
  products.forEach(product => {
    if (product.specifications) {
      Object.keys(product.specifications).forEach(field => {
        existingFields.add(field)
      })
    }
  })
  
  // 순서는 카테고리 정의대로, 하지만 실제 존재하는 것만
  const finalFields = orderedFields.filter(field => existingFields.has(field))
  
  // 카테고리 정의에 없지만 실제로 존재하는 필드들을 마지막에 추가
  const undefinedFields = Array.from(existingFields).filter(field => !orderedFields.includes(field))
  finalFields.push(...undefinedFields.sort())
  
  return { fields: finalFields, labels }
}

// 스펙 값 포맷팅 (기존과 동일)
export function formatSpecificationValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '-'
  }
  
  if (typeof value === 'number') {
    return Number(value.toFixed(2)).toString()
  }
  
  return String(value)
}

// 스펙 필드명을 라벨로 변환 (카테고리별 라벨 또는 기본 변환)
export function getSpecificationLabel(fieldName: string, labels: Record<string, string>): string {
  return labels[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}