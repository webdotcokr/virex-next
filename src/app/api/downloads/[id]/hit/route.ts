import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const downloadId = parseInt(params.id)

    if (isNaN(downloadId)) {
      return NextResponse.json(
        { error: 'Invalid download ID' },
        { status: 400 }
      )
    }

    // Increment hit count
    const { error } = await supabase
      .from('downloads')
      .update({ 
        hit_count: supabase.raw('hit_count + 1') 
      })
      .eq('id', downloadId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update hit count' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}