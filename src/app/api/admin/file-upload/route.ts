import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { verifyAdminAuth } from '@/lib/admin-auth';

// 파일명 정리 함수
function sanitizeFileName(fileName: string): string {
  // 파일명과 확장자 분리
  const lastDotIndex = fileName.lastIndexOf('.');
  const name = lastDotIndex !== -1 ? fileName.slice(0, lastDotIndex) : fileName;
  const extension = lastDotIndex !== -1 ? fileName.slice(lastDotIndex) : '';
  
  // 한글 및 특수문자 변환
  const sanitized = name
    // 한글을 영문으로 변환 (간단한 매핑)
    .replace(/다운로드/g, 'download')
    .replace(/이미지/g, 'image')
    .replace(/사진/g, 'photo')
    .replace(/파일/g, 'file')
    .replace(/문서/g, 'document')
    // 공백을 언더스코어로
    .replace(/\s+/g, '_')
    // 괄호 및 특수문자 제거/변환
    .replace(/[()]/g, '')
    .replace(/[^\w\-_.]/g, '_')
    // 연속된 언더스코어를 하나로
    .replace(/_+/g, '_')
    // 시작/끝 언더스코어 제거
    .replace(/^_+|_+$/g, '');
  
  // 빈 문자열이 되면 기본값 사용
  const finalName = sanitized || 'file';
  
  return finalName + extension;
}

export async function POST(request: NextRequest) {
  try {
    // 통합된 관리자 권한 검증
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Service Role 클라이언트 생성
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const categoryId = formData.get('categoryId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // File validation
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 100MB)' }, { status: 400 });
    }

    // Generate unique filename with sanitization
    const sanitizedFileName = sanitizeFileName(file.name);
    const uniqueFileName = `${Date.now()}-${uuidv4().substring(0, 8)}-${sanitizedFileName}`;
    
    console.log('🔧 File processing:', {
      originalName: file.name,
      sanitizedName: sanitizedFileName,
      finalFileName: uniqueFileName,
      categoryId
    });
    
    // Create directory path based on category
    // Handle both numeric categoryId and string category names
    let categoryPath = 'general';
    if (categoryId) {
      // If it's a numeric ID, use category-{id} format
      if (/^\d+$/.test(categoryId)) {
        categoryPath = `category-${categoryId}`;
      } else {
        // If it's a string (like "series"), use it directly
        categoryPath = categoryId;
      }
    }
    const filePath = `${categoryPath}/${uniqueFileName}`;
    
    console.log('📁 Storage path:', filePath);

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { error } = await supabase.storage
      .from('downloads')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      return NextResponse.json({ 
        error: `Upload failed: ${error.message}`,
        details: error 
      }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('downloads')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      filePath: filePath,
      fileUrl: urlData.publicUrl,
      fileSize: file.size
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}