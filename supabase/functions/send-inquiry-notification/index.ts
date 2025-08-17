import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'sales@virex.co.kr'

serve(async (req) => {
  const { method } = req

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const inquiryData = await req.json()
    
    const {
      id,
      inquiry_type,
      name,
      job_title,
      phone,
      company,
      email,
      product_name,
      contact_path,
      description,
      created_at
    } = inquiryData

    if (!email || !name) {
      return new Response(
        JSON.stringify({ error: 'Email and name are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 1. Send confirmation email to customer
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>VIREX 문의 접수 확인</title>
          <style>
            body {
              font-family: 'Malgun Gothic', sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: white;
              padding: 40px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #566BDA;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #566BDA;
            }
            .info-box {
              background-color: #f8f9ff;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .info-row {
              display: flex;
              margin-bottom: 10px;
            }
            .info-label {
              font-weight: bold;
              width: 120px;
              color: #566BDA;
            }
            .footer {
              border-top: 1px solid #e0e0e0;
              padding-top: 20px;
              font-size: 14px;
              color: #666;
              text-align: center;
            }
            .status-badge {
              background-color: #4CAF50;
              color: white;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 14px;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">VIREX</div>
              <p>산업용 비전 시스템 전문 기업</p>
            </div>
            
            <div class="content">
              <h2>문의해 주셔서 감사합니다!</h2>
              
              <p><strong>${name}</strong>님, 안녕하세요.</p>
              
              <p>VIREX에 소중한 문의를 해주셔서 감사합니다. 문의사항이 정상적으로 접수되었습니다.</p>
              
              <div class="info-box">
                <h3>📋 접수된 문의 정보</h3>
                <div class="info-row">
                  <span class="info-label">접수번호:</span>
                  <span><strong>#${id}</strong></span>
                </div>
                <div class="info-row">
                  <span class="info-label">문의유형:</span>
                  <span>${inquiry_type === 'quote' ? '견적문의' : inquiry_type === 'technical' ? '기술문의' : inquiry_type === 'general' ? '일반문의' : inquiry_type}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">회사명:</span>
                  <span>${company}</span>
                </div>
                ${product_name ? `
                <div class="info-row">
                  <span class="info-label">제품명:</span>
                  <span>${product_name}</span>
                </div>
                ` : ''}
                <div class="info-row">
                  <span class="info-label">접수일시:</span>
                  <span>${new Date(created_at).toLocaleString('ko-KR')}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">처리상태:</span>
                  <span class="status-badge">접수완료</span>
                </div>
              </div>
              
              <div class="info-box">
                <h4>💬 문의 내용</h4>
                <p style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 4px; border: 1px solid #e0e0e0;">${description || '(내용 없음)'}</p>
              </div>
              
              <p><strong>📞 빠른 답변을 원하시나요?</strong></p>
              <p>긴급한 문의는 전화로 연락 주시면 더욱 빠른 상담이 가능합니다.</p>
              <p>📞 전화: <strong>02-2107-1799</strong></p>
              
              <p>전문 상담원이 영업일 기준 1-2일 내에 답변드리겠습니다.</p>
            </div>
            
            <div class="footer">
              <p><strong>㈜바이렉스</strong></p>
              <p>서울특별시 금천구 가산디지털1로 168, 우림라이온스밸리 A동 912호</p>
              <p>Tel: 02-2107-1799 | Fax: 02-2107-1790</p>
              <p>Email: sales@virex.co.kr | Web: www.virex.co.kr</p>
              <br>
              <p style="font-size: 12px; color: #999;">
                이 메일은 문의 접수 확인 메일입니다.<br>
                추가 문의사항이 있으시면 언제든지 연락 주세요.
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    // 2. Send notification email to admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>[VIREX] 새로운 문의 접수 알림</title>
          <style>
            body {
              font-family: 'Malgun Gothic', sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: white;
              padding: 40px;
            }
            .header {
              background-color: #566BDA;
              color: white;
              padding: 20px;
              text-align: center;
              margin: -40px -40px 30px -40px;
            }
            .alert-box {
              background-color: #fff3cd;
              border: 1px solid #ffeeba;
              color: #856404;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .info-table th,
            .info-table td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            .info-table th {
              background-color: #f8f9fa;
              font-weight: bold;
              width: 30%;
            }
            .priority-high {
              color: #dc3545;
              font-weight: bold;
            }
            .button {
              display: inline-block;
              background-color: #566BDA;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🚨 새로운 문의 접수 알림</h2>
              <p>VIREX 웹사이트에 새로운 문의가 접수되었습니다</p>
            </div>
            
            <div class="alert-box">
              <strong>⏰ 즉시 확인 필요</strong><br>
              고객이 ${inquiry_type === 'quote' ? '견적문의' : '기술문의'}를 요청했습니다. 빠른 응답을 부탁드립니다.
            </div>
            
            <h3>📋 문의 상세 정보</h3>
            <table class="info-table">
              <tr><th>접수번호</th><td><strong>#${id}</strong></td></tr>
              <tr><th>문의유형</th><td><span class="priority-high">${inquiry_type === 'quote' ? '견적문의' : inquiry_type === 'technical' ? '기술문의' : inquiry_type === 'general' ? '일반문의' : inquiry_type}</span></td></tr>
              <tr><th>고객명</th><td>${name}</td></tr>
              <tr><th>직책</th><td>${job_title || '(정보없음)'}</td></tr>
              <tr><th>회사명</th><td><strong>${company}</strong></td></tr>
              <tr><th>연락처</th><td>${phone}</td></tr>
              <tr><th>이메일</th><td><a href="mailto:${email}">${email}</a></td></tr>
              ${product_name ? `<tr><th>관심제품</th><td><strong>${product_name}</strong></td></tr>` : ''}
              <tr><th>접촉경로</th><td>${contact_path}</td></tr>
              <tr><th>접수일시</th><td>${new Date(created_at).toLocaleString('ko-KR')}</td></tr>
            </table>
            
            <h3>💬 문의 내용</h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; white-space: pre-wrap; border: 1px solid #dee2e6;">
${description || '(문의 내용이 작성되지 않았습니다)'}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p><strong>📞 고객 직통 연락처: ${phone}</strong></p>
              <p><strong>📧 고객 이메일: <a href="mailto:${email}">${email}</a></strong></p>
            </div>
            
            <div style="background: #e9ecef; padding: 20px; border-radius: 8px; text-align: center;">
              <h4>⚡ 빠른 응답 가이드</h4>
              <p>• <strong>견적문의:</strong> 24시간 내 1차 답변<br>
              • <strong>기술문의:</strong> 48시간 내 전문 상담<br>
              • <strong>일반문의:</strong> 72시간 내 답변 완료</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send customer confirmation email
    const customerEmailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'VIREX <noreply@virex.co.kr>',
        to: [email],
        subject: `[VIREX] 문의가 접수되었습니다 (접수번호: #${id})`,
        html: customerEmailHtml,
      }),
    })

    // Send admin notification email
    const adminEmailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'VIREX 시스템 <noreply@virex.co.kr>',
        to: [ADMIN_EMAIL],
        subject: `🚨 [VIREX] 새로운 ${inquiry_type === 'quote' ? '견적문의' : '기술문의'} 접수 (#${id}) - ${company}`,
        html: adminEmailHtml,
      }),
    })

    const customerResult = customerEmailRes.ok ? await customerEmailRes.json() : null
    const adminResult = adminEmailRes.ok ? await adminEmailRes.json() : null

    if (customerEmailRes.ok || adminEmailRes.ok) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          customerEmail: customerResult?.id,
          adminEmail: adminResult?.id
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } else {
      console.error('Resend API errors:', {
        customer: await customerEmailRes.text(),
        admin: await adminEmailRes.text()
      })
      return new Response(
        JSON.stringify({ error: 'Failed to send emails' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})