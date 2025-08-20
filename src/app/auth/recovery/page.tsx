'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import PageContentContainer from '@/components/PageContentContainer'
import FormField from '@/components/auth/FormField'

interface FormErrors {
  password?: string
  confirmPassword?: string
}

function RecoveryForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // URL의 type=recovery 여부 확인 (hash fragment도 체크)
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)
  const [linkError, setLinkError] = useState('')

  useEffect(() => {
    // 쿼리 파라미터에서 type 확인
    const queryType = searchParams.get('type')
    
    // hash fragment에서 type 및 에러 확인 (Supabase 이메일 링크 형태)
    let hashType = null
    let hashError = null
    let errorCode = null
    let errorDescription = null
    
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      hashType = hashParams.get('type')
      hashError = hashParams.get('error')
      errorCode = hashParams.get('error_code')
      errorDescription = hashParams.get('error_description')
    }
    
    const isRecovery = queryType === 'recovery' || hashType === 'recovery'
    
    console.log('Recovery mode check:', { 
      queryType, 
      hashType, 
      hashError,
      errorCode,
      errorDescription,
      isRecovery, 
      hash: typeof window !== 'undefined' ? window.location.hash : 'SSR',
      href: typeof window !== 'undefined' ? window.location.href : 'SSR'
    })
    
    // 에러 처리
    if (hashError) {
      if (errorCode === 'otp_expired') {
        setLinkError('비밀번호 재설정 링크가 만료되었습니다. 새로운 재설정 링크를 요청해주세요.')
      } else if (hashError === 'access_denied') {
        setLinkError('비밀번호 재설정 링크가 유효하지 않습니다. 새로운 재설정 링크를 요청해주세요.')
      } else {
        setLinkError('비밀번호 재설정 중 오류가 발생했습니다. 다시 시도해주세요.')
      }
      setIsRecoveryMode(false)
      return
    }
    
    setIsRecoveryMode(isRecovery)
    
    // 잠시 대기 후 리다이렉트 (Supabase auth state 처리 시간 확보)
    const redirectTimer = setTimeout(() => {
      if (!isRecovery && !hashError) {
        console.log('No recovery parameters found after timeout, redirecting to login')
        router.push('/auth/login')
      }
    }, 1000) // 1초 대기
    
    return () => clearTimeout(redirectTimer)
  }, [searchParams, router])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }))
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // 비밀번호 유효성 검사
    if (!password) {
      newErrors.password = '새 비밀번호를 입력해주세요.'
    } else if (password.length < 8) {
      newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다.'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = '비밀번호는 대소문자, 숫자를 포함해야 합니다.'
    }

    // 비밀번호 확인 검사
    if (!confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
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

    try {
      // Supabase Auth를 통한 비밀번호 업데이트
      const { data, error } = await supabase.auth.updateUser({ 
        password: password 
      })

      if (error) {
        if (error.message.includes('Auth session missing')) {
          setGeneralError('비밀번호 재설정 세션이 만료되었습니다. 다시 비밀번호 재설정을 요청해주세요.')
        } else if (error.message.includes('Password should be at least')) {
          setGeneralError('비밀번호는 최소 6자 이상이어야 합니다.')
        } else {
          setGeneralError('비밀번호 변경 중 오류가 발생했습니다.')
        }
      } else {
        setSuccess(true)
        // 3초 후 로그인 페이지로 리다이렉트
        setTimeout(() => {
          router.push('/auth/login?message=password_updated')
        }, 3000)
      }
    } catch (error) {
      setGeneralError('비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "로그인", href: "/auth/login" },
    { label: "비밀번호 재설정" }
  ]

  // 성공 페이지
  if (success) {
    return (
      <PageContentContainer
        backgroundClass="auth-header-background"
        backgroundImage="/img/bg-support.webp"
        breadcrumbs={breadcrumbs}
        titleEn="Password Updated"
        titleKo="비밀번호 변경 완료"
      >
        <div className="auth-container" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              backgroundColor: '#d4edda', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 24px auto'
            }}>
              <svg width="40" height="40" fill="#155724" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
            
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>
              비밀번호가 변경되었습니다
            </h2>
            
            <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.5', marginBottom: '24px' }}>
              새로운 비밀번호로 변경이 완료되었습니다.<br/>
              잠시 후 로그인 페이지로 이동합니다.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <Link 
                href="/auth/login"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                지금 로그인하기
              </Link>
            </div>
          </div>
        </div>
      </PageContentContainer>
    )
  }

  // 링크 에러가 있는 경우 에러 페이지 표시
  if (linkError) {
    return (
      <PageContentContainer
        backgroundClass="auth-header-background"
        backgroundImage="/img/bg-support.webp"
        breadcrumbs={breadcrumbs}
        titleEn="Password Reset Error"
        titleKo="비밀번호 재설정 오류"
      >
        <div className="auth-container" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              backgroundColor: '#f8d7da', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 24px auto'
            }}>
              <svg width="40" height="40" fill="#721c24" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>
              링크 오류
            </h2>
            
            <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.5', marginBottom: '24px' }}>
              {linkError}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <Link 
                href="/auth/forgot-password"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                새 재설정 링크 요청
              </Link>
              
              <Link
                href="/auth/login"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6c757d',
                  fontSize: '14px',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                로그인 페이지로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </PageContentContainer>
    )
  }

  // recovery 모드가 아닌 경우 로딩 표시
  if (!isRecoveryMode) {
    return <div>Loading...</div>
  }

  return (
    <PageContentContainer
      backgroundClass="auth-header-background"
      backgroundImage="/img/bg-support.webp"
      breadcrumbs={breadcrumbs}
      titleEn="Password Recovery"
      titleKo="비밀번호 재설정"
    >
      <div className="auth-container" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
            새 비밀번호 설정
          </h2>
          <p style={{ fontSize: '16px', color: '#666', margin: '0' }}>
            안전한 새 비밀번호를 설정해주세요
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
              id="password"
              label="새 비밀번호"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="새 비밀번호를 입력하세요"
              required
              error={errors.password}
              disabled={loading}
            />

            <FormField
              id="confirmPassword"
              label="새 비밀번호 확인"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="새 비밀번호를 다시 입력하세요"
              required
              error={errors.confirmPassword}
              disabled={loading}
            />
          </div>

          {/* 비밀번호 조건 안내 */}
          <div style={{ 
            fontSize: '14px', 
            color: '#6c757d', 
            backgroundColor: '#f8f9fa',
            padding: '12px',
            borderRadius: '6px',
            borderLeft: '4px solid #007bff'
          }}>
            <strong>비밀번호 조건:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>최소 8자 이상</li>
              <li>대문자, 소문자, 숫자 포함</li>
            </ul>
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
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #dee2e6' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>
              비밀번호가 기억나셨나요?{' '}
              <Link 
                href="/auth/login"
                style={{ color: '#007bff', textDecoration: 'none', fontWeight: '500' }}
              >
                로그인
              </Link>
            </span>
          </div>
        </form>
      </div>
    </PageContentContainer>
  )
}

export default function RecoveryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecoveryForm />
    </Suspense>
  )
}