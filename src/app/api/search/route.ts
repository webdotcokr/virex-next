import { NextRequest, NextResponse } from 'next/server'
import { SearchService } from '@/domains/search/services/search-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Search API: Searching for:', query.trim())

    // SearchService를 사용하여 통합 검색 수행
    const results = await SearchService.search(query, { limit })

    console.log('✅ Search completed:', {
      query: query.trim(),
      products: results.total.products,
      news: results.total.news,
      downloads: results.total.downloads
    })

    return NextResponse.json(results)

  } catch (error) {
    console.error('Search API error:', error)
    
    if (error instanceof Error && error.message === 'Search query is required') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}