import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 카테고리 ID to 테이블명 매핑
const CATEGORY_TABLE_MAPPING: Record<number, string> = {
  9: 'products_cis',        // CIS
  10: 'products_tdi',       // TDI
  11: 'products_line',      // Line
  12: 'products_area',      // Area
  13: 'products_invisible', // Invisible
  14: 'products_scientific',// Scientific
}

// 카테고리별 컬럼 설정
interface ColumnConfig {
  key: string
  label: string
  width: string
  unit?: string
}

const CATEGORY_COLUMN_CONFIG: Record<number, ColumnConfig[]> = {
  9: [ // CIS
    { key: 'maker', label: 'Maker', width: '100px' },
    { key: 'part_number', label: 'Part Number', width: '150px' },
    { key: 'scan_width', label: 'Scan Width', width: '100px', unit: 'mm' },
    { key: 'dpi', label: 'DPI', width: '80px' },
    { key: 'resolution', label: 'Resolution', width: '120px' },
    { key: 'line_rate', label: 'Line Rate', width: '100px' },
    { key: 'speed', label: 'Speed', width: '80px' }
  ],
  10: [ // TDI
    { key: 'maker', label: 'Maker', width: '100px' },
    { key: 'part_number', label: 'Part Number', width: '150px' },
    { key: 'mount', label: 'Mount', width: '100px' },
    { key: 'spectrum', label: 'Spectrum', width: '100px' },
    { key: 'interface', label: 'Interface', width: '100px' },
    { key: 'line_rate', label: 'Line Rate', width: '100px' }
  ],
  11: [ // Line
    { key: 'maker', label: 'Maker', width: '100px' },
    { key: 'part_number', label: 'Part Number', width: '150px' },
    { key: 'resolution', label: 'Resolution', width: '100px' },
    { key: 'number_of_line', label: 'No. of Line', width: '100px' },
    { key: 'line_rate', label: 'Line Rate', width: '100px' },
    { key: 'line_rate_turbo', label: 'Line Rate (Turbo)', width: '120px' }
  ],
  12: [ // Area
    { key: 'maker', label: 'Maker', width: '100px' },
    { key: 'part_number', label: 'Part Number', width: '150px' },
    { key: 'mega_pixel', label: 'Mega Pixel', width: '100px', unit: 'MP' },
    { key: 'resolution', label: 'Resolution', width: '120px' },
    { key: 'sensor_model', label: 'Sensor Model', width: '120px' },
    { key: 'frame_rate', label: 'Frame Rate', width: '100px', unit: 'fps' }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 쿼리 파라미터 파싱
    const categoriesParam = searchParams.get('categories') || '9' // 기본값 CIS
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 카테고리 파싱
    const categories = categoriesParam.split(',').map(c => parseInt(c.trim()))
    const categoryId = categories[0]
    
    console.log('🔄 API: Fetching products for category:', categoryId)

    const tableName = CATEGORY_TABLE_MAPPING[categoryId]
    const columnConfig = CATEGORY_COLUMN_CONFIG[categoryId]
    
    if (!tableName || !columnConfig) {
      console.warn(`No table or column mapping found for category ID: ${categoryId}`)
      return NextResponse.json({
        products: [],
        total: 0,
        columns: [],
        page,
        limit,
        hasNextPage: false,
        hasPreviousPage: false
      })
    }

    // 동적 SELECT 컬럼 구성 (기본 필드 + 카테고리별 컬럼)
    const baseColumns = ['id', 'series_id', 'is_active', 'is_new', 'image_url']
    const categoryColumns = columnConfig.map(col => col.key)
    const selectColumns = [...baseColumns, ...categoryColumns].join(', ')
    
    console.log('🔄 API: Dynamic SELECT for category', categoryId, ':', selectColumns)

    // 해당 카테고리 테이블에서 동적 컬럼 조회
    let query = supabase
      .from(tableName)
      .select(selectColumns)
      .eq('is_active', true)
      .order('part_number', { ascending: true })

    // 페이지네이션 적용
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: rawProducts, error, count } = await query

    if (error) {
      console.error('Products fetch error:', error)
      return NextResponse.json(
        { error: `Failed to fetch products: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('✅ API: Products fetched successfully:', rawProducts?.length || 0, 'products from', tableName)
    
    // 총 개수 조회 (별도 쿼리)
    const { count: totalCount } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    const total = totalCount || 0
    const hasNextPage = (page * limit) < total
    const hasPreviousPage = page > 1

    return NextResponse.json({
      products: rawProducts || [],
      columns: columnConfig, // 컬럼 설정 포함
      total,
      page,
      limit,
      hasNextPage,
      hasPreviousPage
    })

  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}