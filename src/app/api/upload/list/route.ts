import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';

// Category to directory mapping (same as upload route)
const CATEGORY_PATHS: Record<string, string> = {
  'products': 'products',
  'series': 'series',
  'news': '', // Root img folder for news
  'new-products': 'new-products',
  'admin-uploads': 'admin-uploads' // Fallback
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'admin-uploads';
    
    // Determine directory based on category
    const categoryPath = CATEGORY_PATHS[category] || CATEGORY_PATHS['admin-uploads'];
    const UPLOAD_DIR = categoryPath 
      ? path.join(process.cwd(), 'public', 'img', categoryPath)
      : path.join(process.cwd(), 'public', 'img');

    console.log('📁 Listing files for category:', category, 'in directory:', UPLOAD_DIR);

    // Read files from upload directory
    const files = await readdir(UPLOAD_DIR);
    
    // Filter out non-image files and get file stats
    const fileInfos = await Promise.all(
      files
        .filter(file => !file.startsWith('.')) // Skip hidden files like .gitkeep
        .map(async (filename) => {
          const filePath = path.join(UPLOAD_DIR, filename);
          const stats = await stat(filePath);
          
          const fileUrl = categoryPath 
            ? `/img/${categoryPath}/${filename}`
            : `/img/${filename}`;
          
          return {
            name: filename,
            url: fileUrl,
            size: stats.size,
            created: stats.birthtime.toISOString(),
            modified: stats.mtime.toISOString(),
            isImage: /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)
          };
        })
    );

    // Sort by creation date (newest first)
    fileInfos.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    return NextResponse.json({
      success: true,
      category,
      files: fileInfos,
      count: fileInfos.length
    });

  } catch (error) {
    console.error('❌ Error listing files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list files' },
      { status: 500 }
    );
  }
}