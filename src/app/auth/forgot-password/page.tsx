'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import PageContentContainer from '@/components/PageContentContainer'
import FormField from '@/components/auth/FormField'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  // 이미 로그인된 사용자는 메인페이지로 리다이렉트
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) {
      setError('')
    }
  }

  const validateEmail = (): boolean => {
    if (!email) {
      setError('이메일을 입력해주세요.')
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식을 입력해주세요.')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validateEmail()) {
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/recovery`
      })

      if (error) {
        if (error.message.includes('User not found')) {
          setError('등록되지 않은 이메일입니다.')
        } else {
          setError('비밀번호 재설정 요청 중 오류가 발생했습니다.')
        }
      } else {
        setSuccess(true)
      }
    } catch (error) {
      setError('비밀번호 재설정 요청 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "로그인", href: "/auth/login" },
    { label: "비밀번호 찾기" }
  ]

  if (success) {
    return (
      <PageContentContainer
        backgroundClass="auth-header-background"
        backgroundImage="/img/bg-support.webp"
        breadcrumbs={breadcrumbs}
        titleEn="Password Reset"
        titleKo="비밀번호 재설정"
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
              이메일이 전송되었습니다
            </h2>
            
            <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.5', marginBottom: '8px' }}>
              <strong>{email}</strong>로 비밀번호 재설정 링크를 보냈습니다.
            </p>
            
            <p style={{ fontSize: '14px', color: '#888', lineHeight: '1.5', marginBottom: '32px' }}>
              이메일을 확인하여 비밀번호를 재설정해주세요.
              이메일이 도착하지 않았다면 스팸함을 확인해보세요.
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
                로그인 페이지로 돌아가기
              </Link>
              
              <button
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6c757d',
                  fontSize: '14px',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                다른 이메일로 다시 시도
              </button>
            </div>
          </div>
        </div>
      </PageContentContainer>
    )
  }

  return (
    <PageContentContainer
      backgroundClass="auth-header-background"
      backgroundImage="/img/bg-support.webp"
      breadcrumbs={breadcrumbs}
      titleEn="Password Reset"
      titleKo="비밀번호 재설정"
    >
      <div className="auth-container" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
            비밀번호를 잊으셨나요?
          </h2>
          <p style={{ fontSize: '16px', color: '#666', margin: '0' }}>
            가입할 때 사용한 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {error && (
            <div style={{ 
              color: '#dc3545', 
              backgroundColor: '#f8d7da', 
              border: '1px solid #f5c6cb',
              padding: '15px',
              borderRadius: '6px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          <FormField
            id="email"
            label="이메일"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="example@email.com"
            required
            disabled={loading}
          />

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
            {loading ? '전송 중...' : '비밀번호 재설정 링크 전송'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #dee2e6' }}>
            <div style={{ marginBottom: '12px' }}>
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
            
            <div>
              <span style={{ fontSize: '14px', color: '#666' }}>
                계정이 없으신가요?{' '}
                <Link 
                  href="/auth/signup"
                  style={{ color: '#007bff', textDecoration: 'none', fontWeight: '500' }}
                >
                  회원가입
                </Link>
              </span>
            </div>
          </div>
        </form>
      </div>
    </PageContentContainer>
  )
}