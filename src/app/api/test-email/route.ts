import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return await testEmailFunction();
}

export async function POST(request: NextRequest) {
  return await testEmailFunction();
}

async function testEmailFunction() {
  try {
    // Dynamic import to ensure server-side only execution
    const { testEmailConnection, sendContactNotification, sendNewsletterNotification } = await import('@/lib/email-server')

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
      name: '테스트 사용자',
      phone: '010-1234-5678',
      email: 'test@example.com',
      jobTitle: '개발팀장',
      productName: 'ARL-22CH-12D',
      contactPath: '웹사이트',
      inquiryType: '견적 문의',
      description: '이것은 이메일 발송 테스트입니다.\n\n시스템이 정상 작동하는지 확인 중입니다.\n감사합니다.'
    })

    const testNewsletterResult = await sendNewsletterNotification('test-newsletter@example.com')

    return NextResponse.json({
      success: true,
      message: '이메일 발송 테스트 완료',
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
      error: '이메일 테스트 실패',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}