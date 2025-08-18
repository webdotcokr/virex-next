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

/**
 * 카테고리 ID로 카테고리명 반환
 */
function getCategoryName(categoryId: number): string {
  const categoryNames: Record<number, string> = {
    9: 'CIS',
    10: 'TDI',
    11: 'Line',
    12: 'Area',
    13: 'Invisible',
    14: 'Scientific',
    15: 'Large Format Lens',
    16: 'Telecentric',
    17: 'FA Lens',
    18: '3D Laser Profiler',
    19: '3D Stereo Camera',
    20: 'Light',
    22: 'Controller',
    23: 'Frame Grabber',
    24: 'GigE LAN Card',
    25: 'USB Card',
    7: 'Software',
    26: 'Cable',
    27: 'Accessory'
  }
  return categoryNames[categoryId] || 'Unknown'
}

export async function GET(
  request: NextRequest,
  { params }: { params: { partNumber: string } }
) {
  try {
    const partNumber = params.partNumber

    console.log('🔄 API: Fetching product detail for part_number:', partNumber)

    // 모든 카테고리 테이블에서 part_number로 검색
    const categoryIds = Object.keys(CATEGORY_TABLE_MAPPING).map(Number)
    let product: any = null
    let categoryId: number = 0
    
    for (const catId of categoryIds) {
      const tableName = CATEGORY_TABLE_MAPPING[catId]
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('part_number', partNumber)
        .eq('is_active', true)
        .single()

      if (!error && data) {
        product = data
        categoryId = catId
        break
      }
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    console.log('✅ API: Product found in table:', CATEGORY_TABLE_MAPPING[categoryId])

    // series 정보 별도 조회
    let seriesData = undefined
    if (product.series_id) {
      const { data: series, error: seriesError } = await supabase
        .from('series')
        .select('*')
        .eq('id', product.series_id)
        .single()

      if (!seriesError && series) {
        seriesData = {
          series_name: series.series_name || '',
          intro_text: series.intro_text || '',
          short_text: series.short_text || '',
          youtube_url: series.youtube_url || '',
          feature_image_url: series.feature_image_url || '',
          features: [
            { title: series.feature_title_1 || '', desc: series.feature_desc_1 || '' },
            { title: series.feature_title_2 || '', desc: series.feature_desc_2 || '' },
            { title: series.feature_title_3 || '', desc: series.feature_desc_3 || '' },
            { title: series.feature_title_4 || '', desc: series.feature_desc_4 || '' }
          ].filter(f => f.title && f.desc),
          strengths: [
            series.strength_1, series.strength_2, series.strength_3,
            series.strength_4, series.strength_5, series.strength_6
          ].filter(Boolean),
          apps: [
            { title: series.app_title_1 || '', image: series.app_image_1 || '' },
            { title: series.app_title_2 || '', image: series.app_image_2 || '' },
            { title: series.app_title_3 || '', image: series.app_image_3 || '' },
            { title: series.app_title_4 || '', image: series.app_image_4 || '' }
          ].filter(a => a.title),
          textItems: [
            { title: series.text_title_1 || '', desc: series.text_desc_1 || '', image: series.text_image_url_1 || '' },
            { title: series.text_title_2 || '', desc: series.text_desc_2 || '', image: series.text_image_url_2 || '' },
            { title: series.text_title_3 || '', desc: series.text_desc_3 || '', image: series.text_image_url_3 || '' },
            { title: series.text_title_4 || '', desc: series.text_desc_4 || '', image: series.text_image_url_4 || '' },
            { title: series.text_title_5 || '', desc: series.text_desc_5 || '', image: series.text_image_url_5 || '' }
          ].filter(t => t.title)
        }
      }
    }

    // 관련 제품 조회 (같은 series_id)
    let relatedProducts: any[] = []
    if (product.series_id) {
      const tableName = CATEGORY_TABLE_MAPPING[categoryId]
      const { data: related } = await supabase
        .from(tableName)
        .select('id, part_number, series_id, image_url')
        .eq('series_id', product.series_id)
        .eq('is_active', true)
        .neq('id', product.id)
        .limit(10)

      if (related) {
        relatedProducts = related.map(p => ({
          id: p.id,
          part_number: p.part_number,
          series_id: p.series_id,
          image_url: p.image_url,
          partnumber: p.part_number,
          name: p.part_number,
          series: seriesData?.series_name || '',
          category: { id: categoryId, name: getCategoryName(categoryId) }
        }))
      }
    }

    // 기본 공통 필드들 분리
    const { id, part_number, series_id, is_active, is_new, image_url, created_at, updated_at, maker, ...specifications } = product

    const transformedProduct = {
      id,
      part_number,
      series_id,
      is_active,
      is_new,
      image_url: image_url || '',
      created_at,
      updated_at,
      partnumber: part_number,
      name: part_number,
      category: { id: categoryId, name: getCategoryName(categoryId) },
      series: seriesData?.series_name || '',
      maker_name: maker || 'Unknown',
      category_name: getCategoryName(categoryId),
      series_data: seriesData,
      related_products: relatedProducts,
      specifications
    }

    console.log('✅ API: Product detail response prepared with series and related products')

    return NextResponse.json({
      product: transformedProduct
    })

  } catch (error) {
    console.error('Product detail API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}