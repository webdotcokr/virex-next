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
        flowType: 'pkce'
      },
      cookies: {
        get(name: string) {
          if (typeof document !== 'undefined') {
            const cookies = document.cookie.split('; ')
            const cookie = cookies.find(row => row.startsWith(name + '='))
            return cookie ? cookie.split('=')[1] : null
          }
          return null
        },
        set(name: string, value: string, options?: any) {
          if (typeof document !== 'undefined') {
            let cookieString = `${name}=${value}`
            
            // 기본 옵션 설정
            cookieString += `; path=/`
            cookieString += `; max-age=${60 * 60 * 24 * 7}` // 7일
            cookieString += `; secure`
            cookieString += `; samesite=lax`
            
            // 추가 옵션 적용
            if (options?.maxAge) {
              cookieString = cookieString.replace(/max-age=\d+/, `max-age=${options.maxAge}`)
            }
            if (options?.domain) {
              cookieString += `; domain=${options.domain}`
            }
            
            document.cookie = cookieString
            console.log('🍪 쿠키 설정:', cookieString)
          }
        },
        remove(name: string, options?: any) {
          if (typeof document !== 'undefined') {
            const removeString = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
            document.cookie = removeString
            console.log('🗑️ 쿠키 제거:', removeString)
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