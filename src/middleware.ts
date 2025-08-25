import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Request cookies 설정
            request.cookies.set(name, value)
          })
          
          // Response 재생성
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          // Response cookies 설정 (명시적 옵션)
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions = {
              ...options,
              secure: true,        // HTTPS 환경 필수
              sameSite: 'lax' as const,  // strict → lax로 변경
              path: '/',
              httpOnly: false,     // 클라이언트 접근 허용
              maxAge: 60 * 60 * 24 * 7  // 7일
            }
            response.cookies.set(name, value, cookieOptions)
          })
        },
      },
    }
  )

  // 이렇게 하면 Supabase가 쿠키를 새로고침하고 유지함
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    /*
     * 다음 경로들을 제외한 모든 request 경로에 매치:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public 폴더의 파일들
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}