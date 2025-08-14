import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // Supabase 클라이언트 생성
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )
    
    // 현재 로그인한 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // URL 파라미터 파싱
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // 기본 쿼리 구성
    let query = supabase
      .from('inquiries')
      .select('*')
      .eq('email', user.email!) // 로그인한 사용자의 이메일과 일치하는 문의만 조회
      .order('created_at', { ascending: false })

    // 상태 필터
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // 유형 필터
    if (type && type !== 'all') {
      query = query.eq('inquiry_type', type)
    }

    // 페이지네이션
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: inquiries, error, count } = await query

    if (error) {
      console.error('Inquiries fetch error:', error)
      return NextResponse.json(
        { error: '문의내역을 불러오는데 실패했습니다.' },
        { status: 500 }
      )
    }

    // 전체 개수 조회 (페이지네이션을 위해)
    let totalQuery = supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('email', user.email!)

    if (status && status !== 'all') {
      totalQuery = totalQuery.eq('status', status)
    }

    if (type && type !== 'all') {
      totalQuery = totalQuery.eq('inquiry_type', type)
    }

    const { count: totalCount } = await totalQuery

    return NextResponse.json({
      inquiries: inquiries || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}