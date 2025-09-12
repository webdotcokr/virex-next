import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { verifyAdminAuth } from '@/lib/admin-auth';

// 파일 타입별 카테고리 매핑
const FILE_TYPE_TO_CATEGORY = {
  catalog: { id: 1, folder: 'catalog', name: '카달로그' },
  datasheet: { id: 2, folder: 'datasheet', name: '데이터시트' },
  manual: { id: 3, folder: 'manual', name: '메뉴얼' },
  drawing: { id: 4, folder: 'drawing', name: '도면' }
} as const;

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
    .replace(/카달로그/g, 'catalog')
    .replace(/메뉴얼/g, 'manual')
    .replace(/도면/g, 'drawing')
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
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as keyof typeof FILE_TYPE_TO_CATEGORY;
    const productPartNumber = formData.get('productPartNumber') as string;

    if (!file || !fileType || !productPartNumber) {
      return NextResponse.json({ 
        error: 'Missing required fields: file, fileType, productPartNumber' 
      }, { status: 400 });
    }

    if (!FILE_TYPE_TO_CATEGORY[fileType]) {
      return NextResponse.json({ 
        error: `Invalid file type: ${fileType}. Must be one of: ${Object.keys(FILE_TYPE_TO_CATEGORY).join(', ')}` 
      }, { status: 400 });
    }

    const maxSize = 50 * 1024 * 1024; // 50MB (Supabase 제한)
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large (max 50MB): ${(file.size / 1024 / 1024).toFixed(2)}MB` 
      }, { status: 400 });
    }

    const categoryConfig = FILE_TYPE_TO_CATEGORY[fileType];

    // Step 1: Supabase Storage에 파일 업로드
    const sanitizedFileName = sanitizeFileName(file.name);
    const uniqueFileName = `${Date.now()}-${uuidv4().substring(0, 8)}-${sanitizedFileName}`;
    const filePath = `${categoryConfig.folder}/${uniqueFileName}`;

    console.log(`📤 Uploading file: ${file.name} -> downloads/${filePath}`);

    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('downloads')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ 
        error: `File upload failed: ${uploadError.message}` 
      }, { status: 500 });
    }

    // Step 2: 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from('downloads')
      .getPublicUrl(filePath);

    // Step 3: downloads 테이블에 레코드 등록
    // 원본 파일명에서 확장자 제거한 것을 title로 사용
    const originalFileNameWithoutExt = file.name.lastIndexOf('.') !== -1 
      ? file.name.slice(0, file.name.lastIndexOf('.'))
      : file.name;

    const downloadTitle = originalFileNameWithoutExt;
    
    const { data: downloadData, error: downloadError } = await supabase
      .from('downloads')
      .insert({
        title: downloadTitle,
        file_name: uniqueFileName,
        file_url: urlData.publicUrl,
        category_id: categoryConfig.id,
        hit_count: 0
      })
      .select()
      .single();

    if (downloadError) {
      console.error('Downloads table insert error:', downloadError);
      // 스토리지에서 파일 삭제 (cleanup)
      await supabase.storage.from('downloads').remove([filePath]);
      
      return NextResponse.json({ 
        error: `Database insert failed: ${downloadError.message}` 
      }, { status: 500 });
    }

    console.log(`✅ File upload successful: ${file.name} -> ID: ${downloadData.id}`);

    return NextResponse.json({
      success: true,
      data: {
        download: downloadData,
        fileInfo: {
          originalName: file.name,
          fileName: uniqueFileName,
          filePath: uploadData.path,
          publicUrl: urlData.publicUrl,
          size: file.size,
          contentType: file.type
        },
        category: categoryConfig
      }
    });

  } catch (error) {
    console.error('Product file upload API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}