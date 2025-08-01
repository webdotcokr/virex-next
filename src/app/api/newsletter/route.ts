import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: '이메일을 입력해주세요.' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingSubscription, error: checkError } = await supabase
      .from('newsletter_subscriptions')
      .select('id, is_active')
      .eq('email', email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Database check error:', checkError)
      return NextResponse.json(
        { error: '서버 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    if (existingSubscription) {
      if (existingSubscription.is_active) {
        return NextResponse.json(
          { error: '이미 구독 중인 이메일입니다.' },
          { status: 409 }
        )
      } else {
        // Reactivate subscription
        const { error: updateError } = await supabase
          .from('newsletter_subscriptions')
          .update({ 
            is_active: true, 
            subscribed_at: new Date().toISOString() 
          })
          .eq('email', email)

        if (updateError) {
          console.error('Database update error:', updateError)
          return NextResponse.json(
            { error: '구독 처리 중 오류가 발생했습니다.' },
            { status: 500 }
          )
        }

        return NextResponse.json({ 
          message: '뉴스레터 구독이 재활성화되었습니다.' 
        })
      }
    }

    // Insert new subscription
    const { error: insertError } = await supabase
      .from('newsletter_subscriptions')
      .insert([{
        email: email.toLowerCase().trim(),
        is_active: true
      }])

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: '구독 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: '뉴스레터 구독이 완료되었습니다.' 
    })

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}