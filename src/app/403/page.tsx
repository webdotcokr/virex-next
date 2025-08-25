'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Forbidden() {
  const router = useRouter()

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      textAlign: 'center',
      padding: '40px 20px',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        fontSize: '128px',
        marginBottom: '20px',
        fontWeight: 'bold',
        color: '#dc3545'
      }}>
        403
      </div>
      
      <div style={{
        fontSize: '64px',
        marginBottom: '20px'
      }}>🚫</div>
      
      <h1 style={{
        color: '#333',
        marginBottom: '16px',
        fontSize: '32px',
        fontWeight: 'bold'
      }}>
        접근 권한이 없습니다
      </h1>
      
      <p style={{
        color: '#666',
        marginBottom: '32px',
        lineHeight: '1.6',
        fontSize: '18px',
        maxWidth: '500px'
      }}>
        관리자 페이지에 접근하려면 관리자 권한이 필요합니다.<br />
        권한이 필요하시면 시스템 관리자에게 문의해주세요.
      </p>
      
      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => router.back()}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          뒤로 가기
        </button>
        
        <Link
          href="/"
          style={{
            backgroundColor: '#566BDA',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}