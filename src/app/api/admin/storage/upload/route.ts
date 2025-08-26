import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { verifyAdminAuth } from '@/lib/admin-auth';

// 파일명 정리 함수 (기존 함수 재사용)
function sanitizeFileName(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.');
  const name = lastDotIndex !== -1 ? fileName.slice(0, lastDotIndex) : fileName;
  const extension = lastDotIndex !== -1 ? fileName.slice(lastDotIndex) : '';
  
  const sanitized = name
    .replace(/다운로드/g, 'download')
    .replace(/이미지/g, 'image')
    .replace(/사진/g, 'photo')
    .replace(/파일/g, 'file')
    .replace(/문서/g, 'document')
    .replace(/\s+/g, '_')
    .replace(/[()]/g, '')
    .replace(/[^\w\-_.]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  
  const finalName = sanitized || 'file';
  return finalName + extension;
}

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const bucket = formData.get('bucket') as string || 'downloads';
    const folder = formData.get('folder') as string || '';
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const maxSize = 50 * 1024 * 1024; // 50MB (Supabase 제한)
    const uploadResults = [];

    // 다중 파일 업로드 처리
    for (const file of files) {
      try {
        // 파일 크기 검증
        if (file.size > maxSize) {
          uploadResults.push({
            originalName: file.name,
            success: false,
            error: `File too large (max 50MB): ${(file.size / 1024 / 1024).toFixed(2)}MB`
          });
          continue;
        }

        // 안전한 파일명 생성
        const sanitizedFileName = sanitizeFileName(file.name);
        const uniqueFileName = `${Date.now()}-${uuidv4().substring(0, 8)}-${sanitizedFileName}`;
        const filePath = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

        console.log(`📤 Uploading: ${file.name} -> ${filePath}`);

        // Supabase Storage 업로드
        const fileBuffer = await file.arrayBuffer();
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, fileBuffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          uploadResults.push({
            originalName: file.name,
            success: false,
            error: error.message
          });
          continue;
        }

        // 공개 URL 생성
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        uploadResults.push({
          originalName: file.name,
          fileName: uniqueFileName,
          filePath: data.path,
          publicUrl: urlData.publicUrl,
          size: file.size,
          contentType: file.type,
          success: true
        });

        console.log(`✅ Upload successful: ${file.name}`);

      } catch (fileError) {
        uploadResults.push({
          originalName: file.name,
          success: false,
          error: fileError instanceof Error ? fileError.message : 'Unknown error'
        });
      }
    }

    const successCount = uploadResults.filter(r => r.success).length;
    const failCount = uploadResults.filter(r => !r.success).length;

    console.log(`📊 Upload summary: ${successCount} success, ${failCount} failed`);

    return NextResponse.json({
      success: failCount === 0,
      results: uploadResults,
      summary: {
        total: files.length,
        success: successCount,
        failed: failCount
      }
    });

  } catch (error) {
    console.error('Storage upload API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}