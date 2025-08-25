import { createBrowserClient, createServerClient } from '@supabase/ssr'

// 클라이언트 컴포넌트용 (브라우저에서 실행)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storageKey: 'sb-auth-token',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: {
          getItem: (key: string) => {
            if (typeof window !== 'undefined') {
              return window.localStorage.getItem(key)
            }
            return null
          },
          setItem: (key: string, value: string) => {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(key, value)
            }
          },
          removeItem: (key: string) => {
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem(key)
            }
          },
        }
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
            
            if (options?.maxAge) {
              cookieString += `; max-age=${options.maxAge}`
            }
            if (options?.path) {
              cookieString += `; path=${options.path}`
            }
            if (options?.domain) {
              cookieString += `; domain=${options.domain}`
            }
            if (options?.secure) {
              cookieString += `; secure`
            }
            if (options?.sameSite) {
              cookieString += `; samesite=${options.sameSite}`
            }
            
            document.cookie = cookieString
          }
        },
        remove(name: string, options?: any) {
          if (typeof document !== 'undefined') {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
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