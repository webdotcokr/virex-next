import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileType = searchParams.get('fileType');
    const search = searchParams.get('search');

    // First, get category mapping if filtering by file type
    let categoryIds: number[] | null = null;
    if (fileType) {
      // Map file types to download categories
      const categoryMapping: Record<string, string[]> = {
        'catalog': ['바이렉스 제품 카달로그', 'Catalog'],
        'datasheet': ['데이터 시트', 'Datasheet'],
        'manual': ['Manual', '메뉴얼'],
        'drawing': ['Drawing', 'Drawings', '도면'],
      };

      const categoryNames = categoryMapping[fileType] || [fileType];
      
      // Get category IDs
      const categoriesResult = await supabase
        .from('download_categories')
        .select('id')
        .in('name', categoryNames);
      
      if (categoriesResult.data) {
        categoryIds = categoriesResult.data.map(cat => cat.id);
      }
    }

    // Build main query
    let query = supabase
      .from('downloads')
      .select('id, title, file_name, file_url, category_id')
      .order('file_name');

    // Filter by category IDs if we have them
    if (categoryIds && categoryIds.length > 0) {
      query = query.in('category_id', categoryIds);
    }

    // Filter by search term if provided
    if (search) {
      query = query.ilike('file_name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching files:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Get category names for the results
    const categoryNamesResult = await supabase
      .from('download_categories')
      .select('id, name');

    const categoryMap = new Map();
    if (categoryNamesResult.data) {
      categoryNamesResult.data.forEach(cat => {
        categoryMap.set(cat.id, cat.name);
      });
    }

    // Transform data to include category name
    const transformedData = data?.map(file => ({
      id: file.id,
      filename: file.file_name || file.title,
      file_url: file.file_url,
      category_id: file.category_id,
      category_name: categoryMap.get(file.category_id) || 'Unknown',
    })) || [];

    return NextResponse.json({ data: transformedData });
  } catch (error) {
    console.error('Files API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new file record (used after uploading to storage)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filename, file_url, file_type, category_id } = body;

    if (!filename || !file_url) {
      return NextResponse.json(
        { error: 'Missing required fields: filename, file_url' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('downloads')
      .insert({
        title: filename,
        file_name: filename,
        file_url,
        category_id: category_id,
        hit_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating file record:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Files POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}