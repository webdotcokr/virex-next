import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 카테고리 ID to 테이블명 매핑 (CategoryProductsDataGrid와 동일)
const CATEGORY_TABLE_MAPPING: Record<number, string> = {
  9: 'products_cis',        // CIS
  10: 'products_tdi',       // TDI
  11: 'products_line',      // Line
  12: 'products_area',      // Area
  13: 'products_invisible', // Invisible
  14: 'products_scientific',// Scientific
  15: 'products_large_format_lens', // Large Format Lens
  16: 'products_telecentric',       // Telecentric
  17: 'products_fa_lens',           // FA Lens
  18: 'products_3d_laser_profiler', // 3D Laser Profiler
  19: 'products_3d_stereo_camera',  // 3D Stereo Camera
  20: 'products_light',             // Light
  22: 'products_controller',        // Controller
  23: 'products_frame_grabber',     // Frame Grabber
  24: 'products_gige_lan_card',     // GigE LAN Card
  25: 'products_usb_card',          // USB Card
  7: 'products_software',           // Software
  26: 'products_cable',             // Cable
  27: 'products_accessory'          // Accessory
}

// 카테고리명 매핑 (DB형식)
const getCategoryNameForDB = (categoryId: number): string => {
  const categoryNames: Record<number, string> = {
    9: 'cis',
    10: 'tdi',
    11: 'line',
    12: 'area',
    13: 'invisible',
    14: 'scientific',
    15: 'large_format_lens',
    16: 'telecentric',
    17: 'fa_lens',
    18: '3d_laser_profiler',
    19: '3d_stereo_camera',
    20: 'light',
    22: 'controller',
    23: 'frame_grabber',
    24: 'gige_lan_card',
    25: 'usb_card',
    7: 'software',
    26: 'cable',
    27: 'accessory'
  }
  return categoryNames[categoryId] || 'unknown'
}

// 시스템 컬럼들 (표시하지 않을 컬럼들)
const SYSTEM_COLUMNS = ['id', 'created_at', 'updated_at']

interface TableColumn {
  column_name: string
  data_type: string
  is_nullable: boolean
  column_default: string | null
  has_label: boolean
  label_ko: string | null
  label_en: string | null
  unit: string | null
  is_visible: boolean
  display_order: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: { category_id: string } }
) {
  console.log('🔍 API route called:', request.url)
  console.log('📋 Params received:', params)
  
  try {
    const categoryId = parseInt(params.category_id)
    const tableName = CATEGORY_TABLE_MAPPING[categoryId]
    const categoryNameDB = getCategoryNameForDB(categoryId)

    console.log('🔄 Processing:', { categoryId, tableName, categoryNameDB })

    if (!tableName) {
      console.error('❌ Invalid category ID:', categoryId)
      return NextResponse.json(
        { error: 'Invalid category ID', categoryId },
        { status: 400 }
      )
    }

    console.log('🔍 Fetching schema for table:', tableName)

    // 1. 실제 테이블에서 첫 번째 행을 조회하여 컬럼 구조 파악
    let schemaData: any[] = []
    
    try {
      // 테이블에서 단일 행을 조회하여 컬럼 정보 추출
      const { data: sampleData, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
        .single()

      if (sampleError && sampleError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Sample data query error:', sampleError)
      }

      // 기본 컬럼 구조를 정의 (카테고리별 테이블 공통 구조)
      const baseColumns = [
        { column_name: 'part_number', data_type: 'text', is_nullable: 'NO', column_default: null },
        { column_name: 'series_id', data_type: 'bigint', is_nullable: 'YES', column_default: null },
        { column_name: 'is_active', data_type: 'boolean', is_nullable: 'YES', column_default: 'true' },
        { column_name: 'is_new', data_type: 'boolean', is_nullable: 'YES', column_default: 'false' },
        { column_name: 'image_url', data_type: 'text', is_nullable: 'YES', column_default: null }
      ]

      // 카테고리별 특화 컬럼 정의
      const categorySpecificColumns: Record<string, any[]> = {
        'products_cis': [
          { column_name: 'scan_width', data_type: 'numeric', is_nullable: 'YES', column_default: null },
          { column_name: 'dpi', data_type: 'numeric', is_nullable: 'YES', column_default: null },
          { column_name: 'speed', data_type: 'numeric', is_nullable: 'YES', column_default: null },
          { column_name: 'line_rate', data_type: 'numeric', is_nullable: 'YES', column_default: null },
          { column_name: 'interface', data_type: 'text', is_nullable: 'YES', column_default: null },
          { column_name: 'spectrum', data_type: 'text', is_nullable: 'YES', column_default: null }
        ],
        'products_tdi': [
          { column_name: 'scan_width', data_type: 'numeric', is_nullable: 'YES', column_default: null },
          { column_name: 'dpi', data_type: 'numeric', is_nullable: 'YES', column_default: null },
          { column_name: 'line_rate', data_type: 'numeric', is_nullable: 'YES', column_default: null },
          { column_name: 'interface', data_type: 'text', is_nullable: 'YES', column_default: null }
        ],
        'products_line': [
          { column_name: 'scan_width', data_type: 'numeric', is_nullable: 'YES', column_default: null },
          { column_name: 'dpi', data_type: 'numeric', is_nullable: 'YES', column_default: null },
          { column_name: 'line_rate', data_type: 'numeric', is_nullable: 'YES', column_default: null },
          { column_name: 'interface', data_type: 'text', is_nullable: 'YES', column_default: null }
        ],
        'products_area': [
          { column_name: 'resolution', data_type: 'text', is_nullable: 'YES', column_default: null },
          { column_name: 'mega_pixel', data_type: 'numeric', is_nullable: 'YES', column_default: null },
          { column_name: 'frame_rate', data_type: 'numeric', is_nullable: 'YES', column_default: null },
          { column_name: 'pixel_size', data_type: 'numeric', is_nullable: 'YES', column_default: null },
          { column_name: 'interface', data_type: 'text', is_nullable: 'YES', column_default: null }
        ]
      }

      // 기본 컬럼 + 카테고리 특화 컬럼 결합
      const specificColumns = categorySpecificColumns[tableName] || []
      schemaData = [...baseColumns, ...specificColumns]

      console.log('📋 Schema data prepared for table:', tableName, '- Columns:', schemaData.length)

    } catch (error) {
      console.error('Error preparing schema data:', error)
      throw error
    }

    if (!schemaData || schemaData.length === 0) {
      return NextResponse.json(
        { error: 'Failed to prepare table schema' },
        { status: 500 }
      )
    }

    // 2. 시스템 컬럼 제외
    const filteredColumns = schemaData.filter((col: any) => 
      !SYSTEM_COLUMNS.includes(col.column_name)
    )

    console.log('📋 Found columns:', filteredColumns.map(col => col.column_name))

    // 3. 기존 parameter_labels 데이터 조회
    const { data: labelData, error: labelError } = await supabase
      .from('parameter_labels')
      .select('*')
      .eq('category_name', categoryNameDB)

    if (labelError) {
      console.error('Parameter labels error:', labelError)
    }

    // 4. 기존 category_display_config 데이터 조회
    const { data: displayData, error: displayError } = await supabase
      .from('category_display_config')
      .select('*')
      .eq('category_name', categoryNameDB)

    if (displayError) {
      console.error('Display config error:', displayError)
    }

    // 5. 레이블과 디스플레이 설정을 맵으로 변환
    const labelMap = new Map()
    const displayMap = new Map()

    if (labelData) {
      labelData.forEach(label => {
        labelMap.set(label.parameter_name, label)
      })
    }

    if (displayData) {
      displayData.forEach(config => {
        displayMap.set(config.parameter_name, config)
      })
    }

    // 6. 최종 결과 생성
    const columns: TableColumn[] = filteredColumns.map((col: any, index: number) => {
      const label = labelMap.get(col.column_name)
      const display = displayMap.get(col.column_name)

      return {
        column_name: col.column_name,
        data_type: col.data_type,
        is_nullable: col.is_nullable === 'YES',
        column_default: col.column_default,
        has_label: !!label,
        label_ko: label?.label_ko || null,
        label_en: label?.label_en || null,
        unit: label?.unit || null,
        is_visible: display?.is_visible || false,
        display_order: display?.display_order || index
      }
    })

    console.log('✅ Schema introspection completed:', columns.length, 'columns')

    const response = {
      table_name: tableName,
      category_name: categoryNameDB,
      columns
    }

    console.log('📤 Sending response:', { 
      table_name: response.table_name, 
      category_name: response.category_name, 
      columnCount: response.columns.length 
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Table schema API error:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'Unknown error')
    return NextResponse.json(
      { 
        error: 'Failed to fetch table schema',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// PostgreSQL information_schema 쿼리를 위한 RPC 함수 생성이 필요한 경우
// Supabase SQL Editor에서 실행:
/*
CREATE OR REPLACE FUNCTION get_table_schema(table_name text)
RETURNS TABLE(column_name text, data_type text, is_nullable text, column_default text) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text,
    c.data_type::text,
    c.is_nullable::text,
    c.column_default::text
  FROM information_schema.columns c
  WHERE c.table_name = $1 
    AND c.table_schema = 'public'
  ORDER BY c.ordinal_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/