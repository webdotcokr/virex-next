import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  console.log('🧪 Testing database connection...')
  
  try {
    // Test basic connection
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(3)

    if (catError) {
      console.error('❌ Categories query error:', catError)
      throw catError
    }

    console.log('✅ Categories test successful:', categories?.length)

    // Test metadata tables
    const { data: displayConfig, error: displayError } = await supabase
      .from('category_display_config')
      .select('*')
      .eq('category_name', 'cis')
      .limit(3)

    if (displayError) {
      console.error('❌ Display config query error:', displayError)
      throw displayError
    }

    console.log('✅ Display config test successful:', displayConfig?.length)

    const { data: labels, error: labelsError } = await supabase
      .from('parameter_labels')
      .select('*')
      .eq('category_name', 'cis')
      .limit(3)

    if (labelsError) {
      console.error('❌ Labels query error:', labelsError)
      throw labelsError
    }

    console.log('✅ Labels test successful:', labels?.length)

    return NextResponse.json({
      status: 'success',
      tests: {
        categories: categories?.length || 0,
        displayConfig: displayConfig?.length || 0,
        labels: labels?.length || 0
      },
      message: 'All database connections working'
    })

  } catch (error) {
    console.error('❌ Database test error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    )
  }
}