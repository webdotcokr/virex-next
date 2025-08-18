import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Fetch download categories with their downloads
    const { data: categories, error: categoriesError } = await supabase
      .from('download_categories')
      .select(`
        *,
        downloads (
          id,
          title,
          file_name,
          file_url,
          hit_count,
          created_at
        )
      `)
      .order('id', { ascending: true })

    if (categoriesError) {
      console.error('Database error:', categoriesError)
      return NextResponse.json(
        { error: 'Failed to fetch download categories' },
        { status: 500 }
      )
    }

    // Also order downloads within each category by created_at
    const categoriesWithSortedDownloads = categories?.map(category => ({
      ...category,
      downloads: category.downloads?.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) || []
    }))

    return NextResponse.json(categoriesWithSortedDownloads || [])
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}