import { createBrowserClient, createServerClient } from '@supabase/ssr'

// 클라이언트 컴포넌트용 (브라우저에서 실행)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        // 배포 환경에서 안정성을 위한 추가 옵션
        debug: false,
        storageKey: 'sb-auth-token'
      },
      cookies: {
        get(name: string) {
          if (typeof document !== 'undefined') {
            const cookies = document.cookie.split('; ')
            const cookie = cookies.find(row => row.startsWith(name + '='))
            const value = cookie ? decodeURIComponent(cookie.split('=')[1]) : null
            console.log('🔍 쿠키 읽기:', name, value ? '존재' : '없음')
            return value
          }
          return null
        },
        set(name: string, value: string, options?: any) {
          if (typeof document !== 'undefined') {
            let cookieString = `${name}=${encodeURIComponent(value)}`
            
            // 기본 옵션 설정
            cookieString += `; path=/`
            cookieString += `; max-age=${options?.maxAge || 60 * 60 * 24 * 7}` // 7일
            cookieString += `; secure`
            cookieString += `; samesite=lax`
            
            // 추가 옵션 적용
            if (options?.domain) {
              cookieString += `; domain=${options.domain}`
            }
            if (options?.httpOnly === false) {
              // HttpOnly 레벨 명시적 비활성화
            }
            
            document.cookie = cookieString
            console.log('🍪 쿠키 설정 완료:', name)
            
            // 설정 즉시 확인
            setTimeout(() => {
              const check = document.cookie.split('; ').find(row => row.startsWith(name + '='))
              console.log('🔍 쿠키 설정 확인:', check ? '성공' : '실패')
            }, 10)
          }
        },
        remove(name: string, options?: any) {
          if (typeof document !== 'undefined') {
            const removeString = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=lax`
            document.cookie = removeString
            console.log('🗑️ 쿠키 제거:', name)
          }
        }
      }
    }
  )
}

// 서버 컴포넌트용 (쿠키 지원)
export function createServerClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll(cookiesToSet) {
          // 서버 컴포넌트에서는 쿠키 설정 불가
        },
      },
    }
  )
}

// Admin API용 (Service Role 키 사용)
export function createAdminClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}