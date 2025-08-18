import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category_id')
    const sCate = searchParams.get('s_cate')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build the base query
    let query = supabase
      .from('downloads')
      .select(`
        id,
        title,
        file_name,
        file_url,
        hit_count,
        created_at,
        download_categories!inner (
          id,
          name,
          is_member_only
        )
      `, { count: 'exact' })

    // Add category filter
    if (categoryId && !isNaN(parseInt(categoryId))) {
      query = query.eq('category_id', parseInt(categoryId))
    } else if (sCate) {
      // For category name search, we need to join and filter
      // This is more complex with Supabase, so we'll do it in two steps
      const { data: categories } = await supabase
        .from('download_categories')
        .select('id, name')

      if (categories) {
        const normalizedSearchName = sCate.replace(/\s+/g, '').toLowerCase()
        const matchingCategory = categories.find(cat => 
          cat.name.replace(/\s+/g, '').toLowerCase() === normalizedSearchName
        )
        
        if (matchingCategory) {
          query = query.eq('category_id', matchingCategory.id)
        } else {
          // No matching category found, return empty result
          return NextResponse.json({
            downloads: [],
            totalCount: 0
          })
        }
      }
    }

    // Add search filter
    if (search && search.trim()) {
      const searchTerm = search.trim()
      query = query.or(`title.ilike.%${searchTerm}%,file_name.ilike.%${searchTerm}%`)
    }

    // Add ordering
    query = query.order('created_at', { ascending: false })

    // Add pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: downloads, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch downloads' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      downloads: downloads || [],
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}