import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
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
    const folder = searchParams.get('folder') || '';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 파일 목록 조회
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit,
        offset,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Storage list error:', error);
      return NextResponse.json({ 
        error: `Failed to list files: ${error.message}` 
      }, { status: 500 });
    }

    // 파일 정보 가공
    const processedFiles = files?.map(file => ({
      name: file.name,
      id: file.id,
      size: file.metadata?.size || 0,
      contentType: file.metadata?.mimetype || 'application/octet-stream',
      lastModified: file.updated_at || file.created_at || new Date().toISOString(),
      isFolder: !file.metadata, // metadata가 없으면 폴더
      publicUrl: file.metadata ? supabase.storage.from(bucket).getPublicUrl(`${folder}${folder ? '/' : ''}${file.name}`).data.publicUrl : null
    })) || [];

    console.log(`📂 Listed ${processedFiles.length} files from ${bucket}/${folder}`);

    return NextResponse.json({
      success: true,
      files: processedFiles,
      bucket,
      folder,
      total: processedFiles.length
    });

  } catch (error) {
    console.error('Storage list API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}