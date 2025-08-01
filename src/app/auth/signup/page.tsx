'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import PageContentContainer from '@/components/PageContentContainer'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  useEffect(() => {
    if (user) {
      router.push(redirectTo)
    }
  }, [user, router, redirectTo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    if (!email || !password || !confirmPassword) {
      setError('모든 필드를 입력해주세요.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      setLoading(false)
      return
    }

    const { error } = await signUp(email, password)
    
    if (error) {
      setError(error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "회원가입" }
  ]

  if (success) {
    return (
      <PageContentContainer
        backgroundClass="auth-header-background"
        backgroundImage="/img/bg-support.webp"
        breadcrumbs={breadcrumbs}
        titleEn="Member Signup"
        titleKo="회원 가입"
      >
        <div className="auth-container" style={{ maxWidth: '400px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ 
            color: '#28a745', 
            backgroundColor: '#d4edda', 
            border: '1px solid #c3e6cb',
            padding: '20px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>회원가입이 완료되었습니다!</h3>
            <p style={{ margin: '0', fontSize: '14px' }}>
              이메일을 확인하여 계정을 활성화해주세요.
            </p>
          </div>
          
          <Link 
            href="/auth/login"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          >
            로그인 페이지로 이동
          </Link>
        </div>
      </PageContentContainer>
    )
  }

  return (
    <PageContentContainer
      backgroundClass="auth-header-background"
      backgroundImage="/img/bg-support.webp"
      breadcrumbs={breadcrumbs}
      titleEn="Member Signup"
      titleKo="회원 가입"
    >
      <div className="auth-container" style={{ maxWidth: '400px', margin: '0 auto', padding: '40px 20px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{ 
              color: '#dc3545', 
              backgroundColor: '#f8d7da', 
              border: '1px solid #f5c6cb',
              padding: '12px',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="email" style={{ fontSize: '14px', fontWeight: '500' }}>
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="password" style={{ fontSize: '14px', fontWeight: '500' }}>
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요 (최소 6자)"
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="confirmPassword" style={{ fontSize: '14px', fontWeight: '500' }}>
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px'
            }}
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>
              이미 계정이 있으신가요?{' '}
              <Link 
                href={`/auth/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                style={{ color: '#007bff', textDecoration: 'none' }}
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