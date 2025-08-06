import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// 메타데이터 인터페이스들
export interface DisplayConfig {
  category_name: string;
  parameter_name: string;
  display_order: number;
  is_visible: boolean;
}

export interface ParameterLabel {
  category_name: string;
  parameter_name: string;
  label_ko: string;
  label_en: string;
  unit?: string;
}

export interface CategoryMetadata {
  displayConfig: DisplayConfig[];
  parameterLabels: Record<string, ParameterLabel>;
}

// 카테고리 ID to DB name 매핑
export const getCategoryNameForDB = (categoryId: number | string): string => {
  const categoryNames: Record<string, string> = {
    '9': 'cis',
    '10': 'tdi',
    '11': 'line',
    '12': 'area',
    '13': 'invisible',
    '14': 'scientific',
    '15': 'large_format_lens',
    '16': 'telecentric',
    '17': 'fa_lens',
    '18': '3d_laser_profiler',
    '19': '3d_stereo_camera',
    '20': 'light',
    '22': 'controller',
    '23': 'frame_grabber',
    '24': 'gige_lan_card',
    '25': 'usb_card',
    '7': 'software',
    '26': 'cable',
    '27': 'accessory'
  }
  return categoryNames[String(categoryId)] || 'cis'
}

/**
 * 카테고리별 메타데이터를 로드하는 커스텀 훅
 * CategoryProductsDataGrid와 ProductTable에서 공통으로 사용
 */
export const useTableMetadata = (categoryId: number | string | null) => {
  const [metadata, setMetadata] = useState<CategoryMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!categoryId) {
        setMetadata(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const categoryNameDB = getCategoryNameForDB(categoryId)
        console.log('🔄 Fetching metadata for category:', categoryNameDB)

        // Display config와 parameter labels를 병렬로 조회
        const [displayResult, labelsResult] = await Promise.all([
          supabase
            .from('category_display_config')
            .select('*')
            .eq('category_name', categoryNameDB)
            .order('display_order'),
          supabase
            .from('parameter_labels')
            .select('*')
            .eq('category_name', categoryNameDB)
        ])

        if (displayResult.error) {
          console.error('Error fetching display config:', displayResult.error)
          throw displayResult.error
        }

        if (labelsResult.error) {
          console.error('Error fetching parameter labels:', labelsResult.error)
        }

        const displayConfig = displayResult.data || []
        const parameterLabels: Record<string, ParameterLabel> = {}
        
        (labelsResult.data || []).forEach(label => {
          parameterLabels[label.parameter_name] = label
        })

        console.log('✅ Metadata loaded:', { 
          displayConfig: displayConfig.length, 
          labels: Object.keys(parameterLabels).length 
        })

        setMetadata({
          displayConfig,
          parameterLabels
        })
      } catch (err) {
        console.error('Error fetching category metadata:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setMetadata(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMetadata()
  }, [categoryId])

  return { metadata, loading, error }
}

/**
 * 메타데이터에서 표시 가능한 컬럼만 필터링하여 반환
 */
export const getVisibleColumns = (metadata: CategoryMetadata | null) => {
  if (!metadata) return []
  
  return metadata.displayConfig
    .filter(config => config.is_visible)
    .sort((a, b) => a.display_order - b.display_order)
}

/**
 * 파라미터명에 대한 한국어 라벨 반환
 */
export const getParameterLabel = (
  parameterName: string, 
  metadata: CategoryMetadata | null,
  fallback?: string
): string => {
  if (!metadata) return fallback || parameterName
  
  const label = metadata.parameterLabels[parameterName]
  return label?.label_ko || fallback || parameterName
}

/**
 * 파라미터에 대한 단위 반환
 */
export const getParameterUnit = (
  parameterName: string,
  metadata: CategoryMetadata | null
): string | undefined => {
  if (!metadata) return undefined
  
  const label = metadata.parameterLabels[parameterName]
  return label?.unit || undefined
}