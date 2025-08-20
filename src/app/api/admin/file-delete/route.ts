import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get current user for authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('fileUrl');

    if (!fileUrl) {
      return NextResponse.json({ error: 'File URL is required' }, { status: 400 });
    }

    // Extract file path from Supabase Storage URL
    // URL format: https://project.supabase.co/storage/v1/object/public/downloads/category-1/uuid-filename.ext
    const urlParts = fileUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'downloads');
    
    if (bucketIndex === -1 || bucketIndex === urlParts.length - 1) {
      return NextResponse.json({ error: 'Invalid file URL format' }, { status: 400 });
    }

    // Get the file path after the bucket name
    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from('downloads')
      .remove([filePath]);

    if (error) {
      console.error('Storage delete error:', error);
      // Don't fail if storage deletion fails, as the database record is more important
      console.warn('Failed to delete file from storage, but continuing with database deletion');
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('File delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}