import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface CSVDownloadRecord {
  title: string;
  file_name: string;
  file_url: string;
  category_id: number;
  hit_count?: number;
  _originalRowIndex?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Service Role 클라이언트 생성 (관리자 권한)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { 
        auth: { 
          autoRefreshToken: false, 
          persistSession: false 
        } 
      }
    );

    const body = await request.json();
    const { data: records, table } = body as { 
      data: CSVDownloadRecord[]; 
      table: string;
    };

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: 'No data provided or invalid data format' },
        { status: 400 }
      );
    }

    if (table !== 'downloads') {
      return NextResponse.json(
        { error: 'Invalid table specified' },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    // 각 레코드를 순차적으로 처리
    for (const record of records) {
      try {
        // 필수 필드 검증
        if (!record.title || !record.file_name || !record.file_url || !record.category_id) {
          results.failed++;
          results.errors.push(
            `Row ${record._originalRowIndex}: 필수 필드가 누락되었습니다. (title, file_name, file_url, category_id 필요)`
          );
          continue;
        }

        // 카테고리 ID 검증
        const { data: category, error: categoryError } = await supabase
          .from('download_categories')
          .select('id')
          .eq('id', record.category_id)
          .single();

        if (categoryError || !category) {
          results.failed++;
          results.errors.push(
            `Row ${record._originalRowIndex}: 유효하지 않은 카테고리 ID (${record.category_id})`
          );
          continue;
        }

        // 중복 체크 (file_url 기준)
        const { data: existingRecord } = await supabase
          .from('downloads')
          .select('id')
          .eq('file_url', record.file_url)
          .single();

        if (existingRecord) {
          // 업데이트
          const { error: updateError } = await supabase
            .from('downloads')
            .update({
              title: record.title,
              file_name: record.file_name,
              category_id: record.category_id,
              hit_count: record.hit_count || 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingRecord.id);

          if (updateError) {
            results.failed++;
            results.errors.push(
              `Row ${record._originalRowIndex}: 업데이트 실패 - ${updateError.message}`
            );
          } else {
            results.success++;
          }
        } else {
          // 새로 삽입
          const { error: insertError } = await supabase
            .from('downloads')
            .insert({
              title: record.title,
              file_name: record.file_name,
              file_url: record.file_url,
              category_id: record.category_id,
              hit_count: record.hit_count || 0
            });

          if (insertError) {
            results.failed++;
            results.errors.push(
              `Row ${record._originalRowIndex}: 삽입 실패 - ${insertError.message}`
            );
          } else {
            results.success++;
          }
        }

      } catch (error) {
        results.failed++;
        results.errors.push(
          `Row ${record._originalRowIndex}: 처리 중 오류 - ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        );
      }
    }

    return NextResponse.json({
      success: results.success,
      failed: results.failed,
      total: records.length,
      errors: results.errors
    });

  } catch (error) {
    console.error('Downloads CSV Import Error:', error);
    return NextResponse.json(
      { 
        error: 'CSV 임포트 처리 중 서버 오류가 발생했습니다.', 
        details: error instanceof Error ? error.message : '알 수 없는 오류' 
      },
      { status: 500 }
    );
  }
}

// CSV 템플릿 다운로드 엔드포인트
export async function GET() {
  try {
    const csvContent = [
      // 헤더
      'title,file_name,file_url,category_id,hit_count',
      // 샘플 데이터
      'Sample Document 1,document1.pdf,https://example.com/document1.pdf,1,0',
      'Sample Document 2,document2.pdf,https://example.com/document2.pdf,2,5',
      'Sample Manual,manual.pdf,https://example.com/manual.pdf,3,10'
    ].join('\n');

    const fileName = 'downloads_template.csv';

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('CSV Template Generation Error:', error);
    return NextResponse.json(
      { 
        error: 'CSV 템플릿 생성 중 오류가 발생했습니다.', 
        details: error instanceof Error ? error.message : '알 수 없는 오류' 
      }, 
      { status: 500 }
    );
  }
}