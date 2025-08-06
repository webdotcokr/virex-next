import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { CSVProcessor } from '@/lib/CSVProcessor'
import { CSVTemplateGenerator } from '@/lib/CSVTemplateGenerator'

// Supabase 클라이언트 초기화 (Service Role Key 사용)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // 인증 체크 (관리자만 접근 가능) - 선택사항
    // const cookieStore = cookies()
    // const token = cookieStore.get('sb-access-token')
    
    // FormData에서 파일 추출
    const formData = await request.formData()
    const file = formData.get('file') as File
    const categoryId = formData.get('categoryId') as string

    if (!file || !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Please upload a valid CSV file' },
        { status: 400 }
      )
    }

    // Initialize mapping caches
    const [makersResult, seriesResult, categoriesResult] = await Promise.all([
      supabase.from('makers').select('id, name'),
      supabase.from('series').select('id, series_name'),
      supabase.from('categories').select('id, name')
    ])

    if (makersResult.error || seriesResult.error || categoriesResult.error) {
      throw new Error('Failed to load reference data')
    }

    CSVProcessor.initializeMappingCaches(
      makersResult.data || [],
      seriesResult.data || [],
      categoriesResult.data || []
    )

    // Parse CSV file using CSVProcessor
    const processingResult = await CSVProcessor.parseCSVFile(file)
    
    if (!processingResult.success && processingResult.data.length === 0) {
      return NextResponse.json(
        { 
          error: 'CSV processing failed',
          details: processingResult.errors
        },
        { status: 400 }
      )
    }

    // Generate sync operations
    const operations = CSVProcessor.generateSyncOperations(processingResult.data)
    
    // Execute operations
    const results = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: [] as any[]
    }

    // If categoryId is provided, validate it
    if (categoryId) {
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
    }

    for (const operation of operations) {
      if (!operation.selected) {
        results.skipped++
        continue
      }

      try {
        // Override category_id if provided in form data
        if (categoryId) {
          operation.data.category_id = parseInt(categoryId)
        }

        if (operation.type === 'INSERT') {
          const { error } = await supabase
            .from('products')
            .insert({
              part_number: operation.data.part_number,
              maker_id: operation.data.maker_id,
              category_id: operation.data.category_id,
              series_id: operation.data.series_id,
              specifications: operation.data.specifications,
              is_active: operation.data.is_active ?? true,
              is_new: operation.data.is_new ?? false,
            })
          
          if (error) throw error
          results.inserted++
          
        } else if (operation.type === 'UPDATE') {
          const { error } = await supabase
            .from('products')
            .update({
              maker_id: operation.data.maker_id,
              category_id: operation.data.category_id,
              series_id: operation.data.series_id,
              specifications: operation.data.specifications,
              is_active: operation.data.is_active ?? true,
              is_new: operation.data.is_new ?? false,
              updated_at: new Date().toISOString()
            })
            .eq('part_number', operation.data.part_number)
          
          if (error) throw error
          results.updated++
        }
      } catch (error: any) {
        results.errors.push({
          operation: operation.type,
          part_number: operation.data.part_number,
          error: error.message || 'Unknown error'
        })
      }
    }

    // Handle product media if image_url is provided
    const productsWithImages = processingResult.data.filter(
      row => row.basicFields.image_url && row.basicFields.part_number
    )

    for (const row of productsWithImages) {
      try {
        // Get product ID by part_number
        const { data: product } = await supabase
          .from('products')
          .select('id')
          .eq('part_number', row.basicFields.part_number)
          .single()

        if (product) {
          // Check if media already exists
          const { data: existingMedia } = await supabase
            .from('product_media')
            .select('id')
            .eq('product_id', product.id)
            .eq('media_type', 'image')
            .eq('is_primary', true)
            .single()

          if (!existingMedia) {
            // Insert new media
            await supabase.from('product_media').insert({
              product_id: product.id,
              media_type: 'image',
              url: row.basicFields.image_url,
              is_primary: true
            })
          }
        }
      } catch (error) {
        // Silently continue - media is optional
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalRows: processingResult.summary.totalRows,
        inserted: results.inserted,
        updated: results.updated,
        skipped: results.skipped,
        errors: results.errors.length
      },
      processingResult: {
        ...processingResult.summary,
        validationErrors: processingResult.errors
      },
      operationErrors: results.errors
    })

  } catch (error) {
    console.error('CSV Import Error:', error)
    return NextResponse.json(
      { error: 'Failed to process CSV import', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// CSV 템플릿 다운로드 엔드포인트 (CSVTemplateGenerator 호환)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const categoryName = searchParams.get('category') // 카테고리명으로도 접근 가능
    const includeSample = searchParams.get('sample') !== 'false' // 기본값: true
    
    let finalCategoryName = categoryName

    // categoryId가 제공된 경우 카테고리명 조회
    if (categoryId && !categoryName) {
      const { data: category, error } = await supabase
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single()

      if (error || !category) {
        return NextResponse.json(
          { error: 'Invalid category ID' },
          { status: 400 }
        )
      }
      
      finalCategoryName = category.name
    }

    if (!finalCategoryName) {
      return NextResponse.json(
        { error: 'Category name or categoryId is required' },
        { status: 400 }
      )
    }

    // CSVTemplateGenerator를 사용하여 템플릿 생성
    const csvContent = CSVTemplateGenerator.generateCSVContent(finalCategoryName, includeSample)
    const fileName = `${finalCategoryName.toLowerCase().replace(/\s+/g, '_')}_template.csv`

    // CSV 파일로 응답
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('CSV Template Generation Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSV template', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}