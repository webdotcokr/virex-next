import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Admin 경로 접근 시 기본 인증 확인
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // 간단한 토큰 체크 (쿠키에서 Supabase 토큰 확인)
    const authToken = req.cookies.get('sb-access-token') || 
                      req.cookies.get('supabase-auth-token') ||
                      req.cookies.get('sb-auth-token')

    // 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!authToken) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // 토큰이 있어도 만료되었을 수 있으므로 클라이언트에서 추가 검증
    // AdminRoute 컴포넌트에서 실제 권한 검증을 수행
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}