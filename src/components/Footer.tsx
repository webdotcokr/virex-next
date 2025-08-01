'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      alert('이메일을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    
    try {
      // TODO: 실제 API 엔드포인트로 교체
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        alert('뉴스레터 신청이 완료되었습니다.')
        setEmail('')
      } else {
        throw new Error('신청 처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      alert('뉴스레터 신청에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer>
      <div id="newsletter">
        <div className="newsletter-contents">
          <div className="newsletter-header">
            <span className="newsletter-header-en">Newsletter</span>
          </div>
          <div className="newsletter-title">비전솔루션에 대한 주요 소식을 무료로 받아보실 수 있습니다.</div>
          <div className="newsletter-input">
            <form onSubmit={handleNewsletterSubmit}>
              <div className="email-input-wrapper">
                <div className="icon-email">
                  <img src="/icon/icon-email.svg" alt="Email icon" />
                </div>
                <input 
                  type="email" 
                  placeholder="이메일을 입력해주세요." 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="input-underline"></div>
              <button className="btn-newsletter-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? '처리중...' : '신청하기'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div id="footer-shortcuts">
        <div className="shortcut-item-list">
          <div className="shortcut-item-group left-aligned">
            <div className="shortcut-item">
              <Link href="/support/inquiry">견적 문의하기</Link>
            </div>
          </div>
          <div className="shortcut-item-group right-aligned only-desktop">
            <div className="shortcut-item">
              <Link href="/company/privacy-policy">개인정보처리방침</Link>
            </div>
            <div className="shortcut-item">
              <Link href="/blog">블로그</Link>
            </div>
          </div>
        </div>
      </div>

      <div id="footer-contents">
        <div id="footer-company-info">
          <div className="info-item">
            <div className="info-item-label">Address</div>
            <div className="info-item-value">
              경기도 안양시 동안구 흥안대로 427번길38, 1214호<br/>
              (관양동, 인덕원성지스타위드)
            </div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Tel</div>
            <div className="info-item-value">070-5055-3330</div>
          </div>
          <div className="info-item">
            <div className="info-item-label">Fax</div>
            <div className="info-item-value">070-8233-5445</div>
          </div>
          <div className="info-item">
            <div className="info-item-label">E-mail</div>
            <div className="info-item-value">ts@virex.co.kr</div>
          </div>
          <div className="shortcut-item-group only-mobile">
            <div className="shortcut-item">
              <Link href="/company/privacy-policy">개인정보처리방침</Link>
            </div>
            <div className="shortcut-item">
              <Link href="/blog">블로그</Link>
            </div>
          </div>
        </div>

        <div id="footer-gnb-menu" className="only-desktop">
          <div className="gnb-menu-group">
            <div className="gnb-menu-group-title">
              <Link href="/product">제품</Link>
            </div>
            <div className="gnb-menu-group-item">
              <Link href="/product/camera">카메라</Link>
            </div>
            <div className="gnb-menu-group-item">
              <Link href="/product/lens">렌즈</Link>
            </div>
            <div className="gnb-menu-group-item">
              <Link href="/product/3d-camera">3D카메라</Link>
            </div>
            <div className="gnb-menu-group-item">
              <Link href="/product/af-module">오토포커스 모듈</Link>
            </div>
            <div className="gnb-menu-group-item">
              <Link href="/product/light">조명</Link>
            </div>
            <div className="gnb-menu-group-item">
              <Link href="/product/frame-grabber">프레임그래버</Link>
            </div>
            <div className="gnb-menu-group-item">
              <Link href="/product/software">소프트웨어</Link>
            </div>
            <div className="gnb-menu-group-item">
              <Link href="/product/accessory">주변기기</Link>
            </div>
          </div>
          
          <div className="gnb-menu-group">
            <div className="gnb-menu-group-title">
              <Link href="/news">뉴스</Link>
            </div>
            <div className="gnb-menu-group-item">
              <Link href="/news/notice">공지사항</Link>
            </div>
            <div className="gnb-menu-group-item">
              <Link href="/news/media">미디어</Link>
            </div>
          </div>
          
          <div className="gnb-menu-group">
            <div className="gnb-menu-group-title">
              <Link href="/support">고객지원</Link>
            </div>
            <div className="gnb-menu-group-item">
              <Link href="/support/download">다운로드</Link>
            </div>
            <div className="gnb-menu-group-item">
              <Link href="/support/remote">원격지원</Link>
            </div>
          </div>
          
          <div className="gnb-menu-group">
            <div className="gnb-menu-group-title">
              <Link href="/support/inquiry">문의하기</Link>
            </div>
            <div className="gnb-menu-group-item">
              <Link href="/support/inquiry">제품문의</Link>
            </div>
          </div>
          
          <div className="gnb-menu-group">
            <div className="gnb-menu-group-title">
              <Link href="/company">바이렉스</Link>
            </div>
            <div className="gnb-menu-group-item">
              <Link href="/company/virex">회사소개</Link>
            </div>
            <div className="gnb-menu-group-item">
              <Link href="/company/global-partners">글로벌파트너사</Link>
            </div>
            <div className="gnb-menu-group-item">
              <Link href="/company/location">오시는 길</Link>
            </div>
          </div>
        </div>
      </div>

      <div id="footer-bottom">
        <div id="footer-logo">
          <img src="/common/virex-logo-footer.png" alt="Virex Logo" />
        </div>
        <div id="footer-copyright">
          Copyright © 2025 Virex. All Rights Reserved
        </div>
      </div>
    </footer>
  )
}