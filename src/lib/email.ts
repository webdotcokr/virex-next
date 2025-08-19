// Dynamic import nodemailer only on server side
let nodemailer: any = null;
let transporter: any = null;

// Initialize nodemailer only on server side
async function getTransporter() {
  if (typeof window !== 'undefined') {
    throw new Error('Email functionality is only available on server side');
  }
  
  if (!transporter) {
    if (!nodemailer) {
      nodemailer = await import('nodemailer');
    }
    
    transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  return transporter;
}

// 문의접수 알림 메일 템플릿
export const createContactNotificationHTML = (data: {
  company?: string
  name: string
  phone?: string
  email?: string
  subject?: string
  message: string
  createdAt: string
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>새로운 문의가 접수되었습니다</title>
      <style>
        body { font-family: 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #566BDA; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #566BDA; }
        .value { margin-left: 10px; }
        .message-box { background-color: white; padding: 15px; border-left: 4px solid #566BDA; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🔔 새로운 문의가 접수되었습니다</h2>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">접수일시:</span>
            <span class="value">${data.createdAt}</span>
          </div>
          ${data.company ? `
          <div class="field">
            <span class="label">회사명:</span>
            <span class="value">${data.company}</span>
          </div>
          ` : ''}
          <div class="field">
            <span class="label">이름:</span>
            <span class="value">${data.name}</span>
          </div>
          ${data.phone ? `
          <div class="field">
            <span class="label">연락처:</span>
            <span class="value">${data.phone}</span>
          </div>
          ` : ''}
          ${data.email ? `
          <div class="field">
            <span class="label">이메일:</span>
            <span class="value">${data.email}</span>
          </div>
          ` : ''}
          ${data.subject ? `
          <div class="field">
            <span class="label">제목:</span>
            <span class="value">${data.subject}</span>
          </div>
          ` : ''}
          <div class="message-box">
            <div class="label">문의내용:</div>
            <div style="margin-top: 10px; white-space: pre-wrap;">${data.message}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// 뉴스레터 구독 알림 메일 템플릿
export const createNewsletterNotificationHTML = (data: {
  email: string
  createdAt: string
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>새로운 뉴스레터 구독자</title>
      <style>
        body { font-family: 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #566BDA; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #566BDA; }
        .value { margin-left: 10px; }
        .highlight { background-color: white; padding: 15px; border-left: 4px solid #566BDA; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📧 새로운 뉴스레터 구독자</h2>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">구독일시:</span>
            <span class="value">${data.createdAt}</span>
          </div>
          <div class="highlight">
            <div class="label">구독 이메일:</div>
            <div style="margin-top: 10px; font-size: 16px; font-weight: bold;">${data.email}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// 문의접수 알림 메일 발송
export async function sendContactNotification(contactData: {
  company?: string
  name: string
  phone?: string
  email?: string
  subject?: string
  message: string
}) {
  try {
    const transporter = await getTransporter();
    
    const createdAt = new Date().toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })

    const htmlContent = createContactNotificationHTML({
      ...contactData,
      createdAt
    })

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.NOTIFICATION_EMAIL,
      subject: `[바이렉스] 새로운 문의접수 - ${contactData.name}${contactData.company ? ` (${contactData.company})` : ''}`,
      html: htmlContent,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('문의접수 알림 메일 발송 성공:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('문의접수 알림 메일 발송 실패:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 뉴스레터 구독 알림 메일 발송
export async function sendNewsletterNotification(email: string) {
  try {
    const transporter = await getTransporter();
    
    const createdAt = new Date().toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })

    const htmlContent = createNewsletterNotificationHTML({
      email,
      createdAt
    })

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.NOTIFICATION_EMAIL,
      subject: `[바이렉스] 새로운 뉴스레터 구독 - ${email}`,
      html: htmlContent,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('뉴스레터 구독 알림 메일 발송 성공:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('뉴스레터 구독 알림 메일 발송 실패:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 메일 설정 테스트
export async function testEmailConnection() {
  try {
    const transporter = await getTransporter();
    await transporter.verify()
    console.log('SMTP 연결 테스트 성공')
    return { success: true }
  } catch (error) {
    console.error('SMTP 연결 테스트 실패:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}