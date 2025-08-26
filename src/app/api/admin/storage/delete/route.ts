import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function DELETE(request: NextRequest) {
  try {
    // 관리자 권한 검증
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Service Role 클라이언트 생성
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get('bucket') || 'downloads';
    const paths = searchParams.get('paths'); // 쉼표로 구분된 파일 경로들

    if (!paths) {
      return NextResponse.json({ error: 'No file paths provided' }, { status: 400 });
    }

    const filePaths = paths.split(',').map(path => path.trim()).filter(Boolean);
    const deleteResults = [];

    console.log(`🗑️ Deleting ${filePaths.length} files from ${bucket}`);

    // 다중 파일 삭제 처리
    for (const filePath of filePaths) {
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .remove([filePath]);

        if (error) {
          deleteResults.push({
            path: filePath,
            success: false,
            error: error.message
          });
          continue;
        }

        deleteResults.push({
          path: filePath,
          success: true,
          deletedFile: data?.[0]
        });

        console.log(`✅ Deleted: ${filePath}`);

      } catch (fileError) {
        deleteResults.push({
          path: filePath,
          success: false,
          error: fileError instanceof Error ? fileError.message : 'Unknown error'
        });
      }
    }

    const successCount = deleteResults.filter(r => r.success).length;
    const failCount = deleteResults.filter(r => !r.success).length;

    console.log(`📊 Delete summary: ${successCount} success, ${failCount} failed`);

    return NextResponse.json({
      success: failCount === 0,
      results: deleteResults,
      summary: {
        total: filePaths.length,
        success: successCount,
        failed: failCount
      }
    });

  } catch (error) {
    console.error('Storage delete API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}