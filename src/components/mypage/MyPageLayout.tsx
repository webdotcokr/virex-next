'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import PageContentContainer from '@/components/PageContentContainer'

interface MyPageLayoutProps {
  children: React.ReactNode
}

export default function MyPageLayout({ children }: MyPageLayoutProps) {
  const { user, profile, signOut } = useAuth()
  const pathname = usePathname()

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "마이페이지", href: "/mypage" }
  ]

  // 현재 페이지에 따른 추가 breadcrumb
  if (pathname === '/mypage/profile') {
    breadcrumbs.push({ label: "회원정보 수정" })
  } else if (pathname === '/mypage/inquiries') {
    breadcrumbs.push({ label: "문의내역" })
  } else if (pathname === '/mypage/password') {
    breadcrumbs.push({ label: "비밀번호 변경" })
  }

  const menuItems = [
    {
      href: '/mypage',
      label: '대시보드',
      icon: '🏠',
      active: pathname === '/mypage'
    },
    {
      href: '/mypage/profile',
      label: '회원정보 수정',
      icon: '👤',
      active: pathname === '/mypage/profile'
    },
    {
      href: '/mypage/password',
      label: '비밀번호 변경',
      icon: '🔒',
      active: pathname === '/mypage/password'
    },
    {
      href: '/mypage/inquiries',
      label: '문의내역',
      icon: '💬',
      active: pathname === '/mypage/inquiries'
    }
  ]

  const handleSignOut = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await signOut()
    }
  }

  return (
    <PageContentContainer
      backgroundClass="mypage-header-background"
      backgroundImage="/img/bg-support.webp"
      breadcrumbs={breadcrumbs}
      titleEn="My Page"
      titleKo="마이페이지"
    >
      <div style={{ display: 'flex', gap: '40px', minHeight: '600px' }}>
        {/* 사이드바 */}
        <div style={{ 
          width: '280px', 
          flexShrink: 0,
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '0',
          height: 'fit-content',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {/* 사용자 정보 헤더 */}
          <div style={{ 
            padding: '25px 20px', 
            borderBottom: '1px solid #dee2e6',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px 8px 0 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                backgroundColor: '#007bff', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                fontWeight: '600',
                marginRight: '15px'
              }}>
                {profile?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '2px' }}>
                  {profile?.name || '사용자'}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {!profile?.member_level ? '일반회원' :
                   profile?.member_level === 1 ? '일반회원' : 
                   profile?.member_level === 9 ? '관리자' : '일반회원'}
                </div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {user?.email}
            </div>
          </div>

          {/* 메뉴 목록 */}
          <nav style={{ padding: '10px 0' }}>
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px 20px',
                  color: item.active ? '#007bff' : '#333',
                  textDecoration: 'none',
                  backgroundColor: item.active ? '#f0f7ff' : 'transparent',
                  borderLeft: item.active ? '3px solid #007bff' : '3px solid transparent',
                  fontSize: '14px',
                  fontWeight: item.active ? '600' : '400',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ marginRight: '12px', fontSize: '16px' }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 하단 액션 버튼들 */}
          <div style={{ 
            padding: '20px', 
            borderTop: '1px solid #dee2e6',
            marginTop: 'auto'
          }}>
            <Link
              href="/support/inquiry"
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                backgroundColor: '#28a745',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                textAlign: 'center',
                marginBottom: '10px',
                fontWeight: '500'
              }}
            >
              새 문의하기
            </Link>
            
            <button
              onClick={handleSignOut}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div style={{ 
          flex: 1, 
          backgroundColor: 'white', 
          padding: '40px',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {children}
        </div>
      </div>

      {/* 모바일 대응 스타일 */}
      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="display: flex"] {
            flex-direction: column !important;
          }
          div[style*="width: 280px"] {
            width: 100% !important;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </PageContentContainer>
  )
}