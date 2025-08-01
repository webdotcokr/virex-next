'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import PageContentContainer from '@/components/PageContentContainer'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, user } = useAuth()
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

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      setLoading(false)
      return
    }

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error)
      setLoading(false)
    } else {
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
              placeholder="비밀번호를 입력하세요"
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
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px'
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>
              계정이 없으신가요?{' '}
              <Link 
                href={`/auth/signup${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                style={{ color: '#007bff', textDecoration: 'none' }}
              >
                회원가입
              </Link>
            </span>
          </div>
        </form>
      </div>
    </PageContentContainer>
  )
}