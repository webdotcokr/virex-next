'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AdminRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AdminRoute({ children, fallback }: AdminRouteProps) {
  const { user, profile, isAdmin, loading } = useAuth()
  const router = useRouter()

  // 디버깅 로그 추가 (상태 변화 추적)
  const currentState = {
    loading,
    user: user ? { id: user.id, email: user.email } : null,
    profile: profile ? { id: profile.id, name: profile.name, role: profile.role } : null,
    isAdmin
  }
  
  // 무한루프 감지 로직 (디버깅 로그 제거)
  const stateKey = `${loading}-${user?.id || 'null'}-${profile?.id || 'null'}-${isAdmin}`
  if (typeof window !== 'undefined') {
    const lastStateKey = window.sessionStorage.getItem('adminRouteLastState')
    if (lastStateKey !== stateKey) {
      window.sessionStorage.setItem('adminRouteLastState', stateKey)
    }
  }

  useEffect(() => {
    // 로딩이 완료되고 사용자가 없으면 로그인 페이지로 리다이렉트
    if (!loading && !user) {
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname))
    }
  }, [loading, user, router])

  // 로딩 중일 때
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #566BDA',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '16px', color: '#666' }}>권한 확인 중...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // 사용자가 없으면 null 반환 (리다이렉트 처리됨)
  if (!user) {
    return null
  }

  // 관리자가 아닌 경우
  if (!isAdmin) {
    return fallback || (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        textAlign: 'center',
        padding: '40px 20px'
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '20px'
        }}>🚫</div>
        <h2 style={{
          color: '#333',
          marginBottom: '16px',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          접근 권한이 없습니다
        </h2>
        <p style={{
          color: '#666',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          관리자 페이지에 접근하려면 관리자 권한이 필요합니다.<br />
          권한이 필요하시면 시스템 관리자에게 문의해주세요.
        </p>
        <button
          onClick={() => router.push('/')}
          style={{
            backgroundColor: '#566BDA',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500'
          }}
        >
          홈으로 돌아가기
        </button>
      </div>
    )
  }

  // 관리자인 경우 자식 컴포넌트 렌더링
  return <>{children}</>
}