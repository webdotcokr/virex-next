import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 현재 로그인한 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const inquiryId = params.id

    // 문의 상세 정보 조회 (본인의 문의만)
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', inquiryId)
      .eq('email', user.email!) // 본인의 문의만 조회 가능
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '문의를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }
      
      console.error('Inquiry fetch error:', error)
      return NextResponse.json(
        { error: '문의 정보를 불러오는데 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      inquiry
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}