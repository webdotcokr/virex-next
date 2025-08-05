import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// 공통 컬럼 정의
const COMMON_COLUMNS = [
  'part_number',
  'category',
  'maker',
  'series',
  'is_active',
  'is_new',
  'image_url'
]

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // 인증 체크 (관리자만 접근 가능)
    const cookieStore = cookies()
    const token = cookieStore.get('sb-access-token')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // FormData에서 파일 추출
    const formData = await request.formData()
    const file = formData.get('file') as File
    const categoryId = formData.get('categoryId') as string

    if (!file || !categoryId) {
      return NextResponse.json(
        { error: 'File and categoryId are required' },
        { status: 400 }
      )
    }

    // CSV 파일 읽기
    const text = await file.text()
    
    // CSV 파싱
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_')
    })

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV parsing failed', details: parseResult.errors },
        { status: 400 }
      )
    }

    const rows = parseResult.data as Record<string, any>[]
    
    // 카테고리 유효성 검증
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', categoryId)
      .single()

    if (categoryError || !category) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      )
    }

    // 제조사 목록 가져오기 (캐싱용)
    const { data: makers } = await supabase
      .from('makers')
      .select('id, name')
    
    const makerMap = new Map(makers?.map(m => [m.name.toLowerCase(), m.id]) || [])

    // 시리즈 목록 가져오기 (캐싱용)
    const { data: seriesList } = await supabase
      .from('series')
      .select('id, series_name')
    
    const seriesMap = new Map(seriesList?.map(s => [s.series_name.toLowerCase(), s.id]) || [])

    // 데이터 변환 및 검증
    const productsToInsert = []
    const errors = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      
      // 필수 필드 검증
      if (!row.part_number) {
        errors.push({ row: i + 2, error: 'part_number is required' })
        continue
      }

      // 공통 컬럼과 specifications 분리
      const commonData: any = {
        part_number: row.part_number.trim(),
        category_id: parseInt(categoryId),
        is_active: row.is_active ? 
          (row.is_active.toLowerCase() === 'true' || row.is_active === '1') : true,
        is_new: row.is_new ? 
          (row.is_new.toLowerCase() === 'true' || row.is_new === '1') : false,
        image_url: row.image_url || null
      }

      // 제조사 처리
      if (row.maker) {
        const makerName = row.maker.trim().toLowerCase()
        let makerId = makerMap.get(makerName)
        
        // 새로운 제조사인 경우 생성
        if (!makerId) {
          const { data: newMaker, error: makerError } = await supabase
            .from('makers')
            .insert({ name: row.maker.trim() })
            .select('id')
            .single()
          
          if (!makerError && newMaker) {
            makerId = newMaker.id
            makerMap.set(makerName, makerId)
          }
        }
        
        if (makerId) {
          commonData.maker_id = makerId
        }
      }

      // 시리즈 처리
      if (row.series) {
        const seriesName = row.series.trim().toLowerCase()
        let seriesId = seriesMap.get(seriesName)
        
        // 새로운 시리즈인 경우 생성
        if (!seriesId) {
          const { data: newSeries, error: seriesError } = await supabase
            .from('series')
            .insert({ 
              series_name: row.series.trim(),
              category_id: parseInt(categoryId)
            })
            .select('id')
            .single()
          
          if (!seriesError && newSeries) {
            seriesId = newSeries.id
            seriesMap.set(seriesName, seriesId)
          }
        }
        
        if (seriesId) {
          commonData.series_id = seriesId
        }
      }

      // specifications 구성 (공통 컬럼이 아닌 모든 필드)
      const specifications: Record<string, any> = {}
      for (const [key, value] of Object.entries(row)) {
        if (!COMMON_COLUMNS.includes(key) && value !== null && value !== '') {
          // 숫자로 변환 가능한 경우 숫자로 저장
          const numValue = parseFloat(value as string)
          specifications[key] = isNaN(numValue) ? value : numValue
        }
      }

      commonData.specifications = specifications
      productsToInsert.push(commonData)
    }

    // 트랜잭션으로 일괄 삽입/업데이트 (upsert)
    const { data: insertedProducts, error: insertError } = await supabase
      .from('products')
      .upsert(productsToInsert, {
        onConflict: 'part_number',
        ignoreDuplicates: false
      })
      .select()

    if (insertError) {
      return NextResponse.json(
        { 
          error: 'Failed to import products', 
          details: insertError.message,
          validationErrors: errors 
        },
        { status: 500 }
      )
    }

    // 성공 응답
    return NextResponse.json({
      success: true,
      imported: insertedProducts?.length || 0,
      errors: errors,
      summary: {
        total_rows: rows.length,
        successful: insertedProducts?.length || 0,
        failed: errors.length
      }
    })

  } catch (error) {
    console.error('CSV import error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// CSV 템플릿 다운로드 엔드포인트
export async function GET(request: NextRequest) {
  const categoryId = request.nextUrl.searchParams.get('categoryId')
  
  if (!categoryId) {
    return NextResponse.json(
      { error: 'categoryId is required' },
      { status: 400 }
    )
  }

  // 카테고리별 샘플 CSV 생성
  const headers = [
    'part_number',
    'maker',
    'series',
    'is_active',
    'is_new',
    'image_url',
    // 카테고리별 추가 필드 예시
    'scan_width',
    'dpi',
    'resolution',
    'line_rate',
    'speed',
    'wd',
    'no_of_pixels'
  ]

  const sampleData = [
    {
      part_number: 'SAMPLE-001',
      maker: 'Sample Maker',
      series: 'Sample Series',
      is_active: 'true',
      is_new: 'false',
      image_url: 'https://example.com/sample.jpg',
      scan_width: '400',
      dpi: '600',
      resolution: '7200',
      line_rate: '80',
      speed: '120',
      wd: '150',
      no_of_pixels: '7200'
    }
  ]

  // CSV 생성
  const csv = Papa.unparse({
    fields: headers,
    data: sampleData
  })

  // CSV 파일로 응답
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="product_import_template_category_${categoryId}.csv"`
    }
  })
}