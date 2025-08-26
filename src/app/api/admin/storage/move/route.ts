import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { bucket = 'downloads', fromPath, toPath } = body;

    if (!fromPath || !toPath) {
      return NextResponse.json({ 
        error: 'Both fromPath and toPath are required' 
      }, { status: 400 });
    }

    console.log(`📁 Moving file: ${fromPath} -> ${toPath} in ${bucket}`);

    // Supabase Storage move 작업
    const { data, error } = await supabase.storage
      .from(bucket)
      .move(fromPath, toPath);

    if (error) {
      console.error('Storage move error:', error);
      return NextResponse.json({ 
        error: `Failed to move file: ${error.message}` 
      }, { status: 500 });
    }

    // 새로운 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(toPath);

    console.log(`✅ File moved successfully: ${fromPath} -> ${toPath}`);

    return NextResponse.json({
      success: true,
      fromPath,
      toPath,
      newPublicUrl: urlData.publicUrl,
      message: `File moved from ${fromPath} to ${toPath}`
    });

  } catch (error) {
    console.error('Storage move API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}