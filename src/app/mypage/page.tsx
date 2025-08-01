'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function MyPageDashboard() {
  const { user, profile } = useAuth()

  if (!user || !profile) {
    return (
      <div>사용자 정보를 불러오는 중...</div>
    )
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
          마이페이지
        </h1>
        <p style={{ fontSize: '16px', color: '#666' }}>
          {profile.name}님, 안녕하세요!
        </p>
      </div>

      {/* 회원 정보 요약 카드 */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '30px', 
        borderRadius: '8px', 
        marginBottom: '40px',
        border: '1px solid #dee2e6'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>
          회원 정보
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>이메일</span>
              <span style={{ fontSize: '16px', color: '#333' }}>{user.email}</span>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>이름</span>
              <span style={{ fontSize: '16px', color: '#333' }}>{profile.name}</span>
            </div>
          </div>
          
          <div>
            {profile.company && (
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>회사명</span>
                <span style={{ fontSize: '16px', color: '#333' }}>{profile.company}</span>
              </div>
            )}
            {profile.department && (
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>부서명</span>
                <span style={{ fontSize: '16px', color: '#333' }}>{profile.department}</span>
              </div>
            )}
          </div>
          
          <div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>가입일</span>
              <span style={{ fontSize: '16px', color: '#333' }}>
                {new Date(profile.created_at).toLocaleDateString('ko-KR')}
              </span>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>회원등급</span>
              <span style={{ fontSize: '16px', color: '#333' }}>
                {profile.member_level === 1 ? '일반회원' : 
                 profile.member_level === 2 ? '우수회원' : 
                 profile.member_level === 3 ? 'VIP회원' : '일반회원'}
              </span>
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #dee2e6' }}>
          <Link 
            href="/mypage/profile"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            회원정보 수정
          </Link>
        </div>
      </div>

      {/* 빠른 메뉴 카드들 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* 문의내역 카드 */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '8px', 
          border: '1px solid #dee2e6',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
            문의내역
          </h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px', lineHeight: '1.5' }}>
            제품 문의, 기술 지원 등<br />
            모든 문의내역을 확인하세요
          </p>
          <Link 
            href="/mypage/inquiries"
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            문의내역 보기
          </Link>
        </div>

        {/* 새 문의하기 카드 */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '8px', 
          border: '1px solid #dee2e6',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
            제품 문의
          </h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px', lineHeight: '1.5' }}>
            제품에 대한 문의사항이나<br />
            기술 지원이 필요하신가요?
          </p>
          <Link 
            href="/support/inquiry"
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#ffc107',
              color: '#212529',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            새 문의하기
          </Link>
        </div>

        {/* 다운로드 센터 카드 */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '8px', 
          border: '1px solid #dee2e6',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
            다운로드 센터
          </h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px', lineHeight: '1.5' }}>
            제품 매뉴얼, 드라이버 등<br />
            다양한 자료를 받아보세요
          </p>
          <Link 
            href="/support/download"
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#6f42c1',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            다운로드 센터
          </Link>
        </div>
      </div>

      {/* 마케팅 수신 설정 */}
      {profile.agree_marketing !== undefined && (
        <div style={{ 
          marginTop: '40px',
          padding: '20px',
          backgroundColor: profile.agree_marketing ? '#d4edda' : '#fff3cd',
          border: `1px solid ${profile.agree_marketing ? '#c3e6cb' : '#ffeaa7'}`,
          borderRadius: '8px'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
            마케팅 정보 수신 설정
          </h4>
          <p style={{ fontSize: '14px', color: '#666', margin: '0' }}>
            현재 마케팅 정보 수신에 <strong>{profile.agree_marketing ? '동의' : '동의하지 않음'}</strong>하셨습니다.
            {!profile.agree_marketing && ' 최신 제품 정보와 특별 혜택을 놓치지 마세요!'}
          </p>
        </div>
      )}
    </div>
  )
}