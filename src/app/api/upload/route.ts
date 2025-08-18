import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// File validation configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
];

// Category to directory mapping
const CATEGORY_PATHS: Record<string, string> = {
  'products': 'products',
  'series': 'series',
  'news': '', // Root img folder for news
  'new-products': 'new-products',
  'admin-uploads': 'admin-uploads' // Fallback
};

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'admin-uploads';
    
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
      return NextResponse.json(
        { success: false, error: `File size too large. Maximum size: ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // Determine upload directory based on category
    const categoryPath = CATEGORY_PATHS[category] || CATEGORY_PATHS['admin-uploads'];
    const UPLOAD_DIR = categoryPath 
      ? path.join(process.cwd(), 'public', 'img', categoryPath)
      : path.join(process.cwd(), 'public', 'img');

    // Generate unique filename
    const timestamp = Date.now();
    const uuid = uuidv4().substring(0, 8);
    const fileExtension = path.extname(file.name);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${uuid}-${sanitizedName}`;

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(UPLOAD_DIR, filename);
    
    await writeFile(filePath, buffer);

    // Generate public URL based on category
    const publicUrl = categoryPath 
      ? `/img/${categoryPath}/${filename}`
      : `/img/${filename}`;

    console.log('✅ File uploaded successfully:', {
      category,
      originalName: file.name,
      filename,
      size: file.size,
      type: file.type,
      uploadDir: UPLOAD_DIR,
      publicUrl
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      originalName: file.name,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}