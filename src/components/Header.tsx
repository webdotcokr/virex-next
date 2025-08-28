'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { SearchService } from '@/domains/search/services/search-service'

// Menu configuration for better maintainability
const MENU_CONFIG = {
  products: {
    title: '제품',
    mainLink: '/product-index',
    items: [
      { label: '카메라', href: '/products?categories=9&sort=maker&order=desc' },
      { label: '렌즈', href: '/products?categories=15' },
      { label: '3D 카메라', href: '/products?categories=18' },
      { label: '오토포커스 모듈', href: '/products?categories=4' },
      { label: '조명', href: '/products?categories=20' },
      { label: '프레임그래버', href: '/products?categories=23' },
      { label: '소프트웨어', href: '/products?categories=7' },
      { label: '주변기기', href: '/products?categories=26' }
    ]
  },
  knowledge: {
    title: '지식',
    mainLink: 'https://blog.virex.co.kr',
    items: [
      { label: '기술 지식 블로그', href: 'https://blog.virex.co.kr' },
      { label: '사내이야기', href: 'https://blog.virex.co.kr/category/story' }
    ]
  },
  news: {
    title: '뉴스',
    mainLink: '/news/notice',
    items: [
      { label: '공지사항', href: '/news/notice' },
      { label: '미디어', href: '/news/media' }
    ]
  },
  support: {
    title: '고객지원',
    mainLink: '/support/download',
    items: [
      { label: '다운로드', href: '/support/download' },
      { label: '원격지원', href: '/support/remote' }
    ]
  },
  contact: {
    title: '문의하기',
    mainLink: '/support/inquiry',
    items: [
      { label: '제품문의', href: '/support/inquiry' }
    ]
  },
  company: {
    title: '바이렉스',
    mainLink: '/company/virex',
    items: [
      { label: '회사소개', href: '/company/virex' },
      { label: '글로벌파트너사', href: '/company/global-partners' },
      { label: '오시는 길', href: '/company/location' }
    ]
  }
} as const

export default function Header() {
  // Get current path for determining initial scroll state
  const pathname = usePathname()
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  // Start with scrolled state on product detail pages
  const [isScrolled, setIsScrolled] = useState(
    pathname?.startsWith('/products/') && pathname !== '/products'
  )
  const [isMegaMenuActive, setIsMegaMenuActive] = useState(false)
  const [hoveredMenuItem, setHoveredMenuItem] = useState<string | null>(null)
  
  // Use AuthContext for actual session management
  const { user, profile, signOut } = useAuth()
  const isLoggedIn = !!user
  const userName = profile?.name || user?.email?.split('@')[0] || ''
  
  // Router for navigation
  const router = useRouter()

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setActiveSubmenu(null)
  }

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen)
  }

  const handleSubmenuClick = (menu: string) => {
    setActiveSubmenu(activeSubmenu === menu ? null : menu)
  }

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false)
    setActiveSubmenu(null)
  }

  const handleLogout = async () => {
    if (confirm('로그아웃하시겠습니까?')) {
      await signOut()
    }
  }

  // Search handlers
  const handleSearch = useCallback((e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault()
    }
    
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) {
      return
    }
    
    console.log('🔍 Header search:', trimmedQuery)
    // 최근 검색어에 추가
    SearchService.addRecentSearch(trimmedQuery)
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`)
  }, [searchQuery, router])

  const handleSearchKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }, [handleSearch])

  const handleSearchIconClick = useCallback(() => {
    handleSearch()
  }, [handleSearch])

  // Throttled scroll handler for performance
  const throttle = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    let lastExecTime = 0
    return (...args: any[]) => {
      const currentTime = Date.now()
      
      if (currentTime - lastExecTime > delay) {
        func(...args)
        lastExecTime = currentTime
      } else {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          func(...args)
          lastExecTime = Date.now()
        }, delay - (currentTime - lastExecTime))
      }
    }
  }, [])

  // Scroll event handler
  const handleScroll = useCallback(() => {
    // Skip scroll check on product detail pages to maintain scrolled state
    const isProductDetailPage = pathname?.startsWith('/products/') && pathname !== '/products'
    if (isProductDetailPage) return
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    setIsScrolled(scrollTop > 50)
  }, [pathname])

  // Throttled scroll handler
  const throttledHandleScroll = useCallback(
    throttle(handleScroll, 16), // ~60fps
    [handleScroll, throttle]
  )

  // 완전히 재설계된 메가메뉴 호버 시스템
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  
  // 메뉴 아이템 호버: 메가메뉴 닫지 않고 활성 메뉴만 변경
  const handleMenuItemEnter = (menuKey: string) => {
    setHoveredMenuItem(menuKey)
    // 메가메뉴가 아직 열리지 않았다면 열기
    if (!isMegaMenuActive) {
      setIsMegaMenuActive(true)
    }
  }

  // 전체 메뉴 바 영역 진입: 메가메뉴 활성화 및 timeout 클리어
  const handleHeaderMenuEnter = () => {
    // 진입 시 timeout 클리어 및 메가메뉴 활성화
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    
    setIsMegaMenuActive(true)
    
    // 첫 번째 메뉴를 기본 활성으로 설정 (메뉴가 선택되지 않은 경우)
    if (!hoveredMenuItem) {
      const firstMenuKey = Object.keys(MENU_CONFIG)[0]
      setHoveredMenuItem(firstMenuKey)
    }
  }

  // 전체 메뉴 바 영역 이탈: 메가메뉴 영역으로 이동하지 않으면 닫기
  const handleHeaderMenuLeave = (e: React.MouseEvent) => {
    const relatedTarget = e.relatedTarget as Node
    const megaMenuContainer = document.getElementById('megamenu-container')
    
    // 메가메뉴 영역으로 이동하는지 체크
    const movingToMegaMenu = relatedTarget && megaMenuContainer?.contains(relatedTarget)
    
    if (!movingToMegaMenu) {
      // 메가메뉴가 아닌 다른 곳으로 이동하면 닫기
      const timeout = setTimeout(() => {
        setHoveredMenuItem(null)
        setIsMegaMenuActive(false)
      }, 100)
      
      setHoverTimeout(timeout)
    }
  }

  const handleMegaMenuEnter = () => {
    // Clear any pending hide timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    
    // Keep megamenu active
    setIsMegaMenuActive(true)
  }

  const handleMegaMenuLeave = (e: React.MouseEvent) => {
    // Enhanced event delegation for smoother UX
    const relatedTarget = e.relatedTarget as Node
    const headerElement = document.querySelector('header[data-type="main"]')
    const megaMenuContainer = document.getElementById('megamenu-container')
    
    // Only close if moving to an area outside both header and megamenu
    // relatedTarget이 null이거나 Node가 아닐 수 있으므로 안전하게 체크
    const stillInHeader = relatedTarget && headerElement?.contains(relatedTarget)
    const stillInMegaMenu = relatedTarget && megaMenuContainer?.contains(relatedTarget)
    
    if (!stillInHeader && !stillInMegaMenu) {
      setHoveredMenuItem(null)
      setIsMegaMenuActive(false)
      
      // Clear any pending timeout
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
        setHoverTimeout(null)
      }
    }
  }



  // Setup scroll listener
  useEffect(() => {
    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    
    // Initial check
    handleScroll()
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
    }
  }, [throttledHandleScroll, handleScroll])


  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
      }
    }
  }, [hoverTimeout])


  // Generate dynamic classes
  const headerClasses = [
    isScrolled && 'scrolled',
    isMegaMenuActive && 'megamenu-active'
  ].filter(Boolean).join(' ')

  const mobileHeaderClasses = [
    'mobile-header',
    isScrolled && 'scrolled'
  ].filter(Boolean).join(' ')

  return (
    <>
      <header data-type="main" className={headerClasses}>
        {/* Mobile Header */}
        <div className={mobileHeaderClasses}>
          <div className="mobile-logo">
            <Link href="/"><img src="/common/virex-logo.png" alt="Virex" /></Link>
          </div>
          <div className="mobile-controls">
            <div 
              className="mobile-search-icon" 
              onClick={handleMobileSearchToggle}
            ></div>
            <div 
              className="mobile-menu-icon" 
              onClick={handleMobileMenuToggle}
            ></div>
          </div>
        </div>
        
        {/* Desktop Header */}
        <div id="top-menu">
          <div id="logo">
            <Link href="/"><img src="/common/virex-logo.png" alt="Virex" /></Link>
          </div>
          
          <div 
            className="horizontal-menu"
            onMouseEnter={handleHeaderMenuEnter}
            onMouseLeave={handleHeaderMenuLeave}
          >
            {Object.entries(MENU_CONFIG).map(([key, config]) => (
              <div 
                key={key} 
                className={`top-menu-item ${hoveredMenuItem === key ? 'active' : ''}`}
                data-menu={key}
                onMouseEnter={() => handleMenuItemEnter(key)}
              >
                <Link href={config.mainLink}>{config.title}</Link>
                <div 
                  className={`submenu-column ${hoveredMenuItem === key ? 'active' : ''}`}
                  onMouseEnter={handleMegaMenuEnter}
                >
                  <ul>
                    {config.items.map((item, index) => (
                      <li key={index}>
                        <Link href={item.href}>{item.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div id="search-bar">
            <input 
              type="search" 
              placeholder="Search for..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
            />
            <span 
              className="search-icon" 
              onClick={handleSearchIconClick}
              style={{ cursor: 'pointer' }}
            ></span>
            <span className="close-icon"></span>
          </div>

          <div id="profile">
            {isLoggedIn ? (
              <Link href="/mypage" title="마이페이지">
                <img src="/icon/icon-profile.svg" alt="Profile" />
              </Link>
            ) : (
              <Link href="/auth/login" title="로그인">
                <img src="/icon/icon-profile.svg" alt="Login" />
              </Link>
            )}
          </div>

          {isLoggedIn && (
            <div id="logout" style={{ marginLeft: '10px', display: 'inline-flex', alignItems: 'center' }}>
              <button 
                onClick={handleLogout}
                title="로그아웃" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  textDecoration: 'none', 
                  color: '#666', 
                  fontSize: '14px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16,17 21,12 16,7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>로그아웃</span>
              </button>
            </div>
          )}
        </div>

        {/* Megamenu Container - background only */}
        <div 
          id="megamenu-container" 
          className={isMegaMenuActive ? 'active' : ''}
          onMouseEnter={handleMegaMenuEnter}
          onMouseLeave={handleMegaMenuLeave}
        >
          <div className="megamenu-wrapper"></div>
        </div>
      </header>

      <div className="horizontal-line"></div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`} 
        onClick={handleMobileMenuToggle}
      ></div>

      {/* Mobile Search Container */}
      <div 
        className={`mobile-search-container ${isMobileSearchOpen ? 'active' : ''}`}
      >
        <div 
          className="mobile-search-close"
          onClick={handleMobileSearchToggle}
        ></div>
        <div className="mobile-search-wrapper">
          <input 
            type="search" 
            placeholder="Search for..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyPress}
          />
          <span 
            className="search-icon" 
            onClick={handleSearchIconClick}
            style={{ cursor: 'pointer' }}
          ></span>
        </div>
      </div>

      {/* Mobile Menu Container */}
      <div 
        className={`mobile-menu-container ${isMobileMenuOpen ? 'active' : ''}`}
      >
        <div className="mobile-menu-header">
          <div className="user-info">
            <div className="user-icon">
              {isLoggedIn ? (
                <Link href="/mypage">
                  <img src="/icon/icon-profile.svg" alt="User" />
                </Link>
              ) : (
                <Link href="/auth/login">
                  <img src="/icon/icon-profile.svg" alt="User" />
                </Link>
              )}
            </div>
            <div className="user-status">
              {isLoggedIn ? `${userName}님` : '로그인'}
            </div>
            {isLoggedIn && (
              <div className="logout-button" style={{ marginLeft: '10px' }}>
                <button 
                  onClick={handleLogout}
                  style={{ color: '#666', fontSize: '12px', textDecoration: 'none', background: 'none', border: 'none' }}
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
          <div 
            className="menu-close"
            onClick={handleMobileMenuToggle}
          ></div>
        </div>
        
        <div className="mobile-menu-content">
          {/* Left Side - Main Menu Categories */}
          <div className="mobile-menu-main">
            <ul className="mobile-menu-list">
              {Object.entries(MENU_CONFIG).map(([key, config]) => (
                <li 
                  key={key}
                  className="mobile-menu-item" 
                  data-menu={key}
                  onClick={() => handleSubmenuClick(key)}
                >
                  <div className="mobile-menu-link" style={{ cursor: 'pointer' }}>
                    <div className="menu-title">{config.title}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Right Side - Submenu Items */}
          <div className="mobile-menu-submenu">
            {Object.entries(MENU_CONFIG).map(([key, config]) => (
              <div 
                key={key}
                className={`mobile-submenu-panel ${activeSubmenu === key ? 'active' : ''}`} 
                data-submenu={key}
              >
                <div className="submenu-title">{config.title}</div>
                <ul className="mobile-submenu-list">
                  {config.items.map((item, index) => (
                    <li key={index} className="mobile-submenu-item">
                      <Link href={item.href} onClick={handleMobileMenuClose}>{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}