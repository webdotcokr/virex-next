import { NextRequest, NextResponse } from 'next/server'
import { testEmailConnection, sendContactNotification, sendNewsletterNotification } from '@/lib/email'

export async function GET(request: NextRequest) {
  return await testEmailFunction();
}

export async function POST(request: NextRequest) {
  return await testEmailFunction();
}

async function testEmailFunction() {
  try {
    // SMTP 연결 테스트
    const connectionTest = await testEmailConnection()
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: 'SMTP 연결 실패',
        details: connectionTest.error
      }, { status: 500 })
    }

    // 테스트 메일 발송
    const testContactResult = await sendContactNotification({
      company: '(주)웹닷',
      name: '홍길동',
      phone: '010-1234-5678',
      email: 'test@example.com',
      subject: '테스트 문의',
      message: '이것은 메일 발송 테스트입니다.\n\n여러 줄 테스트\n감사합니다.'
    })

    const testNewsletterResult = await sendNewsletterNotification('test@example.com')

    return NextResponse.json({
      success: true,
      message: '메일 발송 테스트 완료',
      results: {
        connection: connectionTest,
        contactEmail: testContactResult,
        newsletterEmail: testNewsletterResult
      }
    })

  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json({
      success: false,
      error: '메일 테스트 실패',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}