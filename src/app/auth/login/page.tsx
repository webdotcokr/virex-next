'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import PageContentContainer from '@/components/PageContentContainer'
import FormField from '@/components/auth/FormField'

interface FormErrors {
  email?: string
  password?: string
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, user, profile } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const error = searchParams.get('error')

  useEffect(() => {
    if (user) {
      router.push(redirectTo)
    }
  }, [user, router, redirectTo])

  useEffect(() => {
    // URL에서 에러 메시지 처리
    if (error === 'unauthorized') {
      setGeneralError('관리자 권한이 필요합니다. 관리자 계정으로 로그인해주세요.')
    } else if (error === 'server_error') {
      setGeneralError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }
  }, [error])

  // 입력 값 변경 핸들러
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }))
    }
  }

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!email) {
      newErrors.email = '이메일을 입력해주세요.'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        newErrors.email = '올바른 이메일 형식을 입력해주세요.'
      }
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setGeneralError('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    const { error } = await signIn(email, password)
    
    if (error) {
      setGeneralError(error)
      setLoading(false)
    } else {
      // 로그인 성공 시 프로필 정보도 함께 로드됨 (AuthContext에서 처리)
      router.push(redirectTo)
    }
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "로그인" }
  ]

  return (
    <PageContentContainer
      backgroundClass="auth-header-background"
      backgroundImage="/img/bg-support.webp"
      breadcrumbs={breadcrumbs}
      titleEn="Member Login"
      titleKo="회원 로그인"
    >
      <div className="auth-container" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
            회원 로그인
          </h2>
          <p style={{ fontSize: '16px', color: '#666', margin: '0' }}>
            등록된 이메일과 비밀번호로 로그인하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {generalError && (
            <div style={{ 
              color: '#dc3545', 
              backgroundColor: '#f8d7da', 
              border: '1px solid #f5c6cb',
              padding: '15px',
              borderRadius: '6px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {generalError}
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <FormField
              id="email"
              label="이메일"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="example@email.com"
              required
              error={errors.email}
            />

            <FormField
              id="password"
              label="비밀번호"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="비밀번호를 입력하세요"
              required
              error={errors.password}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '16px 24px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          {/* 추가 링크들 */}
          <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #dee2e6' }}>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>
                계정이 없으신가요?{' '}
                <Link 
                  href={`/auth/signup${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                  style={{ color: '#007bff', textDecoration: 'none', fontWeight: '500' }}
                >
                  회원가입
                </Link>
              </span>
            </div>
            
            {/* 향후 비밀번호 찾기 기능을 위한 예비 공간 */}
            {/* <div>
              <Link 
                href="/auth/forgot-password"
                style={{ fontSize: '14px', color: '#6c757d', textDecoration: 'none' }}
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div> */}
          </div>
        </form>

        {/* 로그인 후 프로필 미리보기 (디버깅용 - 운영환경에서는 제거) */}
        {user && profile && (
          <div style={{ 
            marginTop: '30px', 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '6px',
            fontSize: '14px',
            color: '#6c757d'
          }}>
            <strong>로그인 정보:</strong><br />
            이메일: {user.email}<br />
            이름: {profile.name}<br />
            {profile.company && <>회사: {profile.company}<br /></>}
            가입일: {new Date(profile.created_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </PageContentContainer>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}