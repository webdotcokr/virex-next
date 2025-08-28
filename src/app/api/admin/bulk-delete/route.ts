import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface BulkDeleteRequest {
  table: string;
  ids: number[];
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
    const { table, ids } = body as BulkDeleteRequest;

    if (!table || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: table and ids array required' },
        { status: 400 }
      );
    }

    // 지원되는 테이블 검증
    const supportedTables = ['downloads', 'products'];
    if (!supportedTables.includes(table)) {
      return NextResponse.json(
        { error: `Unsupported table: ${table}` },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    // downloads 테이블의 경우 Supabase Storage 파일도 함께 삭제
    if (table === 'downloads') {
      // 먼저 삭제할 레코드들의 file_url을 조회
      const { data: recordsToDelete, error: selectError } = await supabase
        .from('downloads')
        .select('id, file_url')
        .in('id', ids);

      if (selectError) {
        return NextResponse.json(
          { error: `Failed to fetch records: ${selectError.message}` },
          { status: 500 }
        );
      }

      // 각 레코드를 개별적으로 삭제 (Storage 파일 삭제 포함)
      for (const record of recordsToDelete || []) {
        try {
          // 1. 데이터베이스에서 삭제
          const { error: dbDeleteError } = await supabase
            .from('downloads')
            .delete()
            .eq('id', record.id);

          if (dbDeleteError) {
            throw new Error(`Database delete failed: ${dbDeleteError.message}`);
          }

          // 2. Supabase Storage에서 파일 삭제 (파일 URL이 Supabase Storage인 경우만)
          if (record.file_url && record.file_url.includes('/storage/v1/object/public/downloads/')) {
            try {
              const deleteResponse = await fetch(`/api/admin/file-delete?fileUrl=${encodeURIComponent(record.file_url)}`, {
                method: 'DELETE'
              });
              
              if (!deleteResponse.ok) {
                console.warn(`Failed to delete file from storage: ${record.file_url}`);
                // Storage 삭제 실패는 전체 작업을 실패로 처리하지 않음
              }
            } catch (storageError) {
              console.warn('Storage deletion failed:', storageError);
              // Storage 삭제 실패는 전체 작업을 실패로 처리하지 않음
            }
          }

          results.success++;

        } catch (error) {
          results.failed++;
          results.errors.push(`ID ${record.id}: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        }
      }
    } else {
      // 다른 테이블의 경우 단순 일괄 삭제
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .in('id', ids);

      if (deleteError) {
        return NextResponse.json(
          { error: `Bulk delete failed: ${deleteError.message}` },
          { status: 500 }
        );
      }

      results.success = ids.length;
    }

    return NextResponse.json({
      success: results.success,
      failed: results.failed,
      total: ids.length,
      errors: results.errors
    });

  } catch (error) {
    console.error('Bulk Delete Error:', error);
    return NextResponse.json(
      { 
        error: '일괄 삭제 처리 중 서버 오류가 발생했습니다.', 
        details: error instanceof Error ? error.message : '알 수 없는 오류' 
      },
      { status: 500 }
    );
  }
}