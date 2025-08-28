// 서버 전용 이메일 유틸리티 - 클라이언트 사이드에서 절대 import하지 말 것!
import * as nodemailer from 'nodemailer';

// 환경 변수 검증
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.NOTIFICATION_EMAIL) {
  throw new Error('Required email environment variables are not set');
}

// SMTP 설정
const transporterConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // 연결 타임아웃 설정 추가
  connectionTimeout: 10000, // 10초
  greetingTimeout: 5000,    // 5초
  socketTimeout: 10000,     // 10초
};

let transporter: nodemailer.Transporter | null = null;

// 트랜스포터 초기화 (지연 초기화)
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(transporterConfig);
  }
  return transporter;
}

// 문의접수 알림 메일 템플릿
export const createContactNotificationHTML = (data: {
  company?: string
  name: string
  phone?: string
  email?: string
  jobTitle?: string
  productName?: string
  contactPath?: string
  inquiryType?: string
  description: string
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
        .label { font-weight: bold; color: #566BDA; display: inline-block; width: 120px; }
        .value { margin-left: 10px; }
        .message-box { background-color: white; padding: 15px; border-left: 4px solid #566BDA; margin-top: 15px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
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
          ${data.inquiryType ? `
          <div class="field">
            <span class="label">문의유형:</span>
            <span class="value">${data.inquiryType}</span>
          </div>
          ` : ''}
          <div class="field">
            <span class="label">이름:</span>
            <span class="value">${data.name}</span>
          </div>
          ${data.jobTitle ? `
          <div class="field">
            <span class="label">직책:</span>
            <span class="value">${data.jobTitle}</span>
          </div>
          ` : ''}
          ${data.company ? `
          <div class="field">
            <span class="label">회사명:</span>
            <span class="value">${data.company}</span>
          </div>
          ` : ''}
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
          ${data.productName ? `
          <div class="field">
            <span class="label">관심제품:</span>
            <span class="value">${data.productName}</span>
          </div>
          ` : ''}
          ${data.contactPath ? `
          <div class="field">
            <span class="label">문의경로:</span>
            <span class="value">${data.contactPath}</span>
          </div>
          ` : ''}
          <div class="message-box">
            <div class="label">문의내용:</div>
            <div style="margin-top: 10px; white-space: pre-wrap;">${data.description}</div>
          </div>
        </div>
        <div class="footer">
          <p>이 메일은 바이렉스 웹사이트에서 자동으로 발송되었습니다.</p>
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
        .label { font-weight: bold; color: #566BDA; display: inline-block; width: 120px; }
        .value { margin-left: 10px; }
        .highlight { background-color: white; padding: 15px; border-left: 4px solid #566BDA; margin-top: 15px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
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
        <div class="footer">
          <p>이 메일은 바이렉스 웹사이트에서 자동으로 발송되었습니다.</p>
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
  jobTitle?: string
  productName?: string
  contactPath?: string
  inquiryType?: string
  description: string
}) {
  console.log('문의접수 메일 발송 시도 시작...');
  
  try {
    const transporter = getTransporter();
    
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

    // Primary SMTP로 먼저 시도 (타임아웃 10초)
    const sendWithTimeout = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('메일 발송 타임아웃 (10초)'))
      }, 10000)
      
      transporter.sendMail(mailOptions)
        .then(result => {
          clearTimeout(timeout)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timeout)
          reject(error)
        })
    })

    const result = await sendWithTimeout as any;
    console.log('문의접수 알림 메일 발송 성공:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('문의접수 알림 메일 발송 실패:', error)
    
    // 로컬 개발환경에서는 메일 실패해도 정상 처리로 간주
    if (process.env.NODE_ENV === 'development') {
      console.log('개발환경: 메일 발송 실패는 무시하고 정상 처리')
      return { success: true, messageId: 'dev-skip', error: 'Development mode - email skipped' }
    }
    
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// 뉴스레터 구독 알림 메일 발송
export async function sendNewsletterNotification(email: string) {
  try {
    const transporter = getTransporter();
    
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
    const transporter = getTransporter();
    
    // 타임아웃이 있는 Promise로 래핑
    const verifyWithTimeout = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('SMTP 연결 테스트 타임아웃 (10초)'))
      }, 10000)
      
      transporter.verify()
        .then(result => {
          clearTimeout(timeout)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timeout)
          reject(error)
        })
    })
    
    await verifyWithTimeout
    console.log('SMTP 연결 테스트 성공')
    return { success: true }
  } catch (error) {
    console.error('SMTP 연결 테스트 실패:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}