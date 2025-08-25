import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function verifyAdminAuth(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    
    // 1. 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized',
        status: 401
      }
    }

    // 2. 프로필에서 역할 확인
    const { data: profile, error: profileError } = await supabase
      .from('member_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return {
        success: false,
        error: 'Profile not found',
        status: 404
      }
    }

    // 3. 관리자 권한 확인
    if (profile.role !== 'admin') {
      return {
        success: false,
        error: 'Admin access required',
        status: 403
      }
    }

    return {
      success: true,
      user,
      profile
    }
  } catch (error) {
    console.error('Admin auth verification error:', error)
    return {
      success: false,
      error: 'Internal server error',
      status: 500
    }
  }
}