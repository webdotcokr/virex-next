import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

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
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Send welcome email via Resend
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>VIREX 뉴스레터 구독 확인</title>
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
            .content {
              margin-bottom: 30px;
            }
            .highlight {
              background-color: #f8f9ff;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .footer {
              border-top: 1px solid #e0e0e0;
              padding-top: 20px;
              font-size: 14px;
              color: #666;
              text-align: center;
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
              <div class="logo">VIREX</div>
              <p>산업용 비전 시스템 전문 기업</p>
            </div>
            
            <div class="content">
              <h2>뉴스레터 구독해 주셔서 감사합니다!</h2>
              
              <p>안녕하세요, VIREX입니다.</p>
              
              <p><strong>${email}</strong> 주소로 뉴스레터 구독이 정상적으로 완료되었습니다.</p>
              
              <div class="highlight">
                <h3>🎯 VIREX 뉴스레터에서 만나볼 수 있는 내용</h3>
                <ul>
                  <li><strong>신제품 출시 소식</strong> - 최신 산업용 카메라, 렌즈, 조명 시스템</li>
                  <li><strong>기술 업데이트</strong> - 머신비전 기술 동향 및 솔루션</li>
                  <li><strong>특별 혜택</strong> - 구독자 전용 할인 정보</li>
                  <li><strong>기술 자료</strong> - 제품 매뉴얼, 애플리케이션 가이드</li>
                </ul>
              </div>
              
              <p>더 궁금한 사항이 있으시면 언제든지 문의해 주세요.</p>
              
              <p style="text-align: center;">
                <a href="https://virex.co.kr" class="button">VIREX 웹사이트 방문하기</a>
              </p>
            </div>
            
            <div class="footer">
              <p><strong>㈜바이렉스</strong></p>
              <p>서울특별시 금천구 가산디지털1로 168, 우림라이온스밸리 A동 912호</p>
              <p>Tel: 02-2107-1799 | Fax: 02-2107-1790</p>
              <p>Email: sales@virex.co.kr | Web: www.virex.co.kr</p>
              <br>
              <p style="font-size: 12px; color: #999;">
                이 메일은 VIREX 뉴스레터 구독 확인 메일입니다.<br>
                구독을 취소하려면 <a href="mailto:sales@virex.co.kr">sales@virex.co.kr</a>로 연락주세요.
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'VIREX <noreply@virex.co.kr>',
        to: [email],
        subject: '[VIREX] 뉴스레터 구독이 완료되었습니다',
        html: emailHtml,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      return new Response(
        JSON.stringify({ success: true, messageId: data.id }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } else {
      const error = await res.text()
      console.error('Resend API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
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