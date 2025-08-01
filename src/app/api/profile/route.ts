import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function PATCH(request: NextRequest) {
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

    // 요청 데이터 파싱
    const body = await request.json()
    const {
      name,
      phone1,
      phone2,
      phone3,
      mobile1,
      mobile2,
      mobile3,
      postcode,
      address_basic,
      address_detail,
      company,
      department,
      agree_marketing
    } = body

    // 필수 필드 검사
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: '이름은 필수 입력 항목입니다.' },
        { status: 400 }
      )
    }

    // member_profiles 업데이트
    const { data, error } = await supabase
      .from('member_profiles')
      .update({
        name: name.trim(),
        phone1: phone1 || null,
        phone2: phone2 || null,
        phone3: phone3 || null,
        mobile1: mobile1 || null,
        mobile2: mobile2 || null,
        mobile3: mobile3 || null,
        postcode: postcode || null,
        address_basic: address_basic || null,
        address_detail: address_detail || null,
        company: company || null,
        department: department || null,
        agree_marketing: agree_marketing || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json(
        { error: '회원정보 업데이트에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: '회원정보가 성공적으로 업데이트되었습니다.',
      profile: data
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}