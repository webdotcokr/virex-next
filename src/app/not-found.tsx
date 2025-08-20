'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageContentContainer from '@/components/PageContentContainer'

export default function NotFound() {
  const [countdown, setCountdown] = useState(3)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const router = useRouter()

  // 카운트다운만 담당하는 useEffect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setShouldRedirect(true) // 플래그만 설정
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // 리다이렉트만 담당하는 useEffect
  useEffect(() => {
    if (shouldRedirect) {
      router.push('/')
    }
  }, [shouldRedirect, router])

  const handleImmediateRedirect = () => {
    router.push('/')
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "404 - 페이지를 찾을 수 없습니다" }
  ]

  return (
    <PageContentContainer
      backgroundClass="error-header-background"
      backgroundImage="/img/bg-support.webp"
      breadcrumbs={breadcrumbs}
      titleEn="Page Not Found"
      titleKo="페이지를 찾을 수 없습니다"
    >
      <div className="error-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          {/* 404 아이콘 */}
          <div style={{ 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            backgroundColor: '#fff3cd', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 32px auto',
            border: '3px solid #ffeaa7'
          }}>
            <div style={{
              fontSize: '48px',
              fontWeight: '700',
              color: '#856404'
            }}>
              404
            </div>
          </div>
          
          <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>
            페이지를 찾을 수 없습니다
          </h1>
          
          <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.6', marginBottom: '24px' }}>
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.<br/>
            입력하신 주소를 다시 확인해주세요.
          </p>

          {/* 카운트다운 메시지 */}
          <div style={{ 
            fontSize: '16px', 
            color: '#856404', 
            backgroundColor: '#fff3cd',
            padding: '16px 24px',
            borderRadius: '8px',
            border: '1px solid #ffeaa7',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#856404',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {countdown}
            </div>
            <span>
              {countdown > 0 ? `${countdown}초 후 메인페이지로 자동 이동합니다` : '메인페이지로 이동 중...'}
            </span>
          </div>

          {/* 액션 버튼들 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <button
              onClick={handleImmediateRedirect}
              style={{
                padding: '16px 32px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                minWidth: '200px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
              지금 메인페이지로 이동
            </button>
          </div>
        </div>
      </div>

      {/* 반응형 스타일 */}
      <style jsx>{`
        @media (max-width: 768px) {
          .error-container {
            padding: 20px 15px !important;
          }
        }
      `}</style>
    </PageContentContainer>
  )
}