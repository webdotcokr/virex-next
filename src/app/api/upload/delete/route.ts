import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';

// Category to directory mapping (same as upload route)
const CATEGORY_PATHS: Record<string, string> = {
  'products': 'products',
  'series': 'series',
  'news': '', // Root img folder for news
  'new-products': 'new-products',
  'admin-uploads': 'admin-uploads' // Fallback
};

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const category = searchParams.get('category') || 'admin-uploads';

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Security check: prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { success: false, error: 'Invalid filename' },
        { status: 400 }
      );
    }

    // Determine directory based on category
    const categoryPath = CATEGORY_PATHS[category] || CATEGORY_PATHS['admin-uploads'];
    const UPLOAD_DIR = categoryPath 
      ? path.join(process.cwd(), 'public', 'img', categoryPath)
      : path.join(process.cwd(), 'public', 'img');

    const filePath = path.join(UPLOAD_DIR, filename);
    
    try {
      await unlink(filePath);
      
      console.log('✅ File deleted successfully:', { category, filename, filePath });
      
      return NextResponse.json({
        success: true,
        message: `File ${filename} deleted successfully from ${category} category`
      });
    } catch (deleteError: any) {
      if (deleteError.code === 'ENOENT') {
        return NextResponse.json(
          { success: false, error: 'File not found' },
          { status: 404 }
        );
      }
      throw deleteError;
    }

  } catch (error) {
    console.error('❌ Error deleting file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}