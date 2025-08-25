'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-client'

interface MemberProfile {
  id: string
  legacy_id?: number
  name: string
  phone1?: string
  phone2?: string  
  phone3?: string
  mobile1?: string
  mobile2?: string
  mobile3?: string
  postcode?: string
  address_basic?: string
  address_detail?: string
  company?: string
  department?: string
  agree_terms: boolean
  agree_privacy: boolean
  agree_marketing: boolean
  member_level?: number
  status?: number
  role: string
  created_at: string
  updated_at: string
}

interface SignUpData {
  email: string
  password: string
  name: string
  phone1?: string
  phone2?: string
  phone3?: string
  mobile1?: string
  mobile2?: string
  mobile3?: string
  postcode?: string
  address_basic?: string
  address_detail?: string
  company?: string
  department?: string
  agree_terms: boolean
  agree_privacy: boolean
  agree_marketing: boolean
}

interface AuthContextType {
  user: User | null
  profile: MemberProfile | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  role: string | null
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (signUpData: SignUpData) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
  updatePassword: (newPassword: string) => Promise<{ error?: string }>
  verifyPassword: (password: string) => Promise<boolean>
  fetchAdminData: (table: string, query?: any) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  // SSR 친화적 Supabase 클라이언트 생성
  const supabase = createClient()
  
  // 쿠키 확인 함수
  const checkAuthCookie = () => {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split('; ')
      const authCookie = cookies.find(c => c.startsWith('sb-') && c.includes('auth-token'))
      console.log('🍪 인증 쿠키 확인:', { found: !!authCookie, cookies: cookies.length })
      return !!authCookie
    }
    return false
  }
  
  // 관리자 권한 상태 (더 명확한 검증)
  const isAdmin = Boolean(profile?.role === 'admin' && user)
  const role = profile?.role || null
  
  // 관리자 전용 데이터 조회 함수
  const fetchAdminData = async (table: string, query?: any) => {
    if (!isAdmin) {
      throw new Error('관리자 권한이 필요합니다.')
    }
    return supabase.from(table).select(query || '*')
  }


  // 회원 프로필 조회
  const fetchProfile = async (userId: string): Promise<MemberProfile | null> => {
    try {
      console.log('🔍 프로필 조회 시작:', userId)
      
      const { data, error } = await supabase
        .from('member_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('📊 프로필 조회 결과:', { data, error })

      if (error) {
        // PGRST116은 "행을 찾을 수 없음" 오류
        if (error.code === 'PGRST116') {
          console.log('⚠️ 프로필이 존재하지 않습니다. 기본 프로필을 생성합니다.')
          return await createDefaultProfile(userId)
        }
        console.error('❌ 프로필 조회 오류:', error)
        return null
      }

      console.log('✅ 프로필 조회 성공:', { name: data.name, role: data.role })
      return data
    } catch (error) {
      console.error('💥 프로필 조회 중 예외 발생:', error)
      return null
    }
  }

  // 기본 프로필 생성 (기존 사용자용)
  const createDefaultProfile = async (userId: string): Promise<MemberProfile | null> => {
    try {
      console.log('기본 프로필 생성 시작:', userId)
      
      // 현재 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.id !== userId) {
        console.error('사용자 정보 불일치 또는 없음')
        return null
      }

      // 사용자 메타데이터에서 이름 추출
      const userName = user.user_metadata?.name || user.email?.split('@')[0] || '사용자'

      // 프로필 생성 (member_level은 NULL로 설정)
      const { data, error } = await supabase
        .from('member_profiles')
        .insert({
          id: userId,
          name: userName,
          agree_terms: true, // 기존 사용자는 약관에 동의했다고 가정
          agree_privacy: true,  
          agree_marketing: false, // 마케팅은 기본적으로 false
          member_level: null, // tbl_member_level 데이터가 없으므로 NULL
          status: 0,
          role: 'member' // 기본적으로 일반 회원
        })
        .select()
        .single()

      if (error) {
        console.error('기본 프로필 생성 오류:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        return null
      }

      console.log('기본 프로필 생성 완료:', data)
      return data
    } catch (error) {
      console.error('기본 프로필 생성 중 예외 발생:', error)
      return null
    }
  }

  // 프로필 새로고침
  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchProfile(user.id)
      setProfile(userProfile)
    }
  }

  useEffect(() => {
    // Get initial session with retry logic
    const getInitialSession = async () => {
      console.log('🚀 초기 세션 조회 시작')
      
      try {
        // 쿠키 존재 여부 먼저 확인
        const hasCookie = checkAuthCookie()
        console.log('🔐 인증 쿠키 상태:', hasCookie)
        
        if (!hasCookie) {
          console.log('⚠️ 인증 쿠키 없음 - 로그아웃 상태로 처리')
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }
        
        // 1차: getUser() 먼저 시도 (쿠키 기반)
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        console.log('👤 User 조회 결과:', { user: user ? { id: user.id, email: user.email } : null, error: userError })
        
        if (user && !userError) {
          // User가 있으면 세션도 조회
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          console.log('📋 세션 조회 결과:', { 
            session: session ? { 
              user_id: session.user.id, 
              email: session.user.email,
              expires_at: session.expires_at 
            } : null, 
            error: sessionError 
          })
          
          setSession(session)
          setUser(user)
          
          // 프로필 조회
          const userProfile = await fetchProfile(user.id)
          setProfile(userProfile)
        } else {
          // User가 없으면 세션만 확인 (fallback)
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (session?.user) {
            console.log('📋 세션에서 사용자 발견')
            setSession(session)
            setUser(session.user)
            
            const userProfile = await fetchProfile(session.user.id)
            setProfile(userProfile)
          } else {
            console.log('👤 사용자 세션 없음')
            setSession(null)
            setUser(null)
            setProfile(null)
          }
        }
      } catch (error) {
        console.error('❌ 초기 세션 조회 중 오류:', error)
        setSession(null)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
        console.log('✅ 초기 세션 조회 완료')
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 인증 상태 변경:', event, session ? {
          user_id: session.user.id,
          email: session.user.email
        } : null)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id)
          setProfile(userProfile)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // 에러 메시지를 더 사용자 친화적으로 변환
        if (error.message.includes('Invalid login credentials')) {
          return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' }
        }
        if (error.message.includes('Email not confirmed')) {
          return { error: '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.' }
        }
        return { error: error.message }
      }

      // 로그인 성공 시 쿠키 설정 보장
      if (data?.session?.access_token) {
        console.log('🔐 로그인 성공 - 쿠키 설정 보장')
        
        // 프로젝트 ID 추출 (URL에서)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const projectRef = supabaseUrl.split('//')[1].split('.')[0]
        
        // sb-auth-token 쿠키 명시적 설정
        const cookieName = `sb-${projectRef}-auth-token`
        const cookieValue = JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          token_type: data.session.token_type,
          user: data.session.user
        })
        
        if (typeof document !== 'undefined') {
          document.cookie = `${cookieName}=${encodeURIComponent(cookieValue)}; path=/; max-age=${60*60*24*7}; secure; samesite=lax`
          console.log('✅ 인증 쿠키 설정 완료:', cookieName)
          
          // 쿠키 설정 확인
          setTimeout(() => {
            const isSet = checkAuthCookie()
            console.log('🔍 쿠키 설정 확인:', isSet)
          }, 100)
        }
      }

      return {}
    } catch (error) {
      console.error('로그인 오류:', error)
      return { error: '로그인 중 오류가 발생했습니다.' }
    }
  }

  const signUp = async (signUpData: SignUpData) => {
    try {
      // 1. Supabase Auth를 통한 사용자 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            name: signUpData.name,
          }
        }
      })

      if (authError) {
        if (authError.message.includes('User already registered')) {
          return { error: '이미 가입된 이메일입니다.' }
        }
        return { error: authError.message }
      }

      if (!authData.user) {
        return { error: '회원가입에 실패했습니다.' }
      }

      // 2. member_profiles 테이블에 프로필 정보 저장 (기본회원 = 1)
      const { error: profileError } = await supabase
        .from('member_profiles')
        .insert({
          id: authData.user.id,
          name: signUpData.name,
          phone1: signUpData.phone1 || null,
          phone2: signUpData.phone2 || null,
          phone3: signUpData.phone3 || null,
          mobile1: signUpData.mobile1 || null,
          mobile2: signUpData.mobile2 || null,
          mobile3: signUpData.mobile3 || null,
          postcode: signUpData.postcode || null,
          address_basic: signUpData.address_basic || null,
          address_detail: signUpData.address_detail || null,
          company: signUpData.company || null,
          department: signUpData.department || null,
          agree_terms: signUpData.agree_terms,
          agree_privacy: signUpData.agree_privacy,
          agree_marketing: signUpData.agree_marketing,
          member_level: null, // tbl_member_level 데이터가 없으므로 NULL
          status: 0, // 정상 상태
          role: 'member' // 기본적으로 일반 회원
        })

      if (profileError) {
        console.error('프로필 생성 오류:', profileError)
        // 프로필 생성 실패 시에도 계정은 생성되었으므로, 경고만 로그
        // 실제 서비스에서는 이런 경우를 위한 추가 처리가 필요할 수 있습니다.
      }

      return {}
    } catch (error) {
      console.error('회원가입 오류:', error)
      return { error: '회원가입 중 오류가 발생했습니다.' }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  // 비밀번호 재설정 이메일 전송
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/recovery`
      })

      if (error) {
        if (error.message.includes('User not found')) {
          return { error: '등록되지 않은 이메일입니다.' }
        }
        return { error: '비밀번호 재설정 요청 중 오류가 발생했습니다.' }
      }

      return {}
    } catch (error) {
      return { error: '비밀번호 재설정 요청 중 오류가 발생했습니다.' }
    }
  }

  // 비밀번호 업데이트
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      })

      if (error) {
        if (error.message.includes('Auth session missing')) {
          return { error: '인증 세션이 만료되었습니다. 다시 로그인해주세요.' }
        }
        if (error.message.includes('Password should be at least')) {
          return { error: '비밀번호는 최소 6자 이상이어야 합니다.' }
        }
        return { error: '비밀번호 변경 중 오류가 발생했습니다.' }
      }

      return {}
    } catch (error) {
      return { error: '비밀번호 변경 중 오류가 발생했습니다.' }
    }
  }

  // 현재 비밀번호 검증 (로그인된 사용자의 비밀번호 확인)
  const verifyPassword = async (password: string): Promise<boolean> => {
    try {
      if (!user?.email) return false
      
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      })

      return !error
    } catch (error) {
      return false
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    isAdmin,
    role,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    resetPassword,
    updatePassword,
    verifyPassword,
    fetchAdminData,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}