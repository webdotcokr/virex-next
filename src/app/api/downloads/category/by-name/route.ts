import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Remove spaces and search for category (flexible matching)
    const { data: categories, error } = await supabase
      .from('download_categories')
      .select('*')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    // Find category by name (with flexible space handling)
    const normalizedSearchName = name.replace(/\s+/g, '').toLowerCase()
    const category = categories?.find(cat => 
      cat.name.replace(/\s+/g, '').toLowerCase() === normalizedSearchName
    )

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}