'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// Menu configuration for better maintainability
const MENU_CONFIG = {
  products: {
    title: '제품',
    mainLink: '/product',
    items: [
      { label: '카메라', href: '/product/list?category_id=9' },
      { label: '렌즈', href: '/product/list?category_id=10' },
      { label: '3D 카메라', href: '/product/list?category_id=13' },
      { label: '오토포커스 모듈', href: '/product/list?category_id=4' },
      { label: '조명', href: '/product/list?category_id=15' },
      { label: '프레임그래버', href: '/product/list?category_id=18' },
      { label: '소프트웨어', href: '/product/list?category_id=7' },
      { label: '주변기기', href: '/product/list?category_id=21' }
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMegaMenuActive, setIsMegaMenuActive] = useState(false)
  const [hoveredMenuItem, setHoveredMenuItem] = useState<string | null>(null)
  const [menuPositions, setMenuPositions] = useState<Record<string, number>>({})
  
  // TODO: Replace with actual session management
  const [isLoggedIn] = useState(false)
  const [userName] = useState('')

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

  const handleLogout = () => {
    if (confirm('로그아웃하시겠습니까?')) {
      // TODO: Implement logout logic
      console.log('Logout clicked')
    }
  }

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
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    setIsScrolled(scrollTop > 50)
  }, [])

  // Throttled scroll handler
  const throttledHandleScroll = useCallback(
    throttle(handleScroll, 16), // ~60fps
    [handleScroll, throttle]
  )

  // Megamenu handlers
  const handleMenuItemEnter = (menuKey: string) => {
    setHoveredMenuItem(menuKey)
    setIsMegaMenuActive(true)
  }

  const handleMenuItemLeave = () => {
    // Add small delay to prevent flickering
    setTimeout(() => {
      setHoveredMenuItem(null)
      setIsMegaMenuActive(false)
    }, 100)
  }

  const handleMegaMenuEnter = () => {
    setIsMegaMenuActive(true)
  }

  const handleMegaMenuLeave = () => {
    setHoveredMenuItem(null)
    setIsMegaMenuActive(false)
  }

  // Calculate menu item positions
  const calculateMenuPositions = useCallback(() => {
    const positions: Record<string, number> = {}
    
    Object.keys(MENU_CONFIG).forEach((menuKey) => {
      const menuElement = document.querySelector(`[data-menu="${menuKey}"]`)
      const submenuElement = menuElement?.querySelector('.submenu-column') as HTMLElement
      
      if (menuElement && submenuElement) {
        const menuRect = menuElement.getBoundingClientRect()
        const submenuRect = submenuElement.getBoundingClientRect()
        const containerRect = document.getElementById('top-menu')?.getBoundingClientRect()
        
        if (containerRect) {
          // Calculate center position of menu item relative to container
          const menuCenter = menuRect.left + menuRect.width / 2 - containerRect.left
          // Calculate how much to offset submenu to center it under menu item
          const submenuHalfWidth = submenuRect.width / 2
          const optimalLeft = menuCenter - submenuHalfWidth
          
          positions[menuKey] = optimalLeft
        }
      }
    })
    
    setMenuPositions(positions)
  }, [])

  // Throttled position calculation
  const throttledCalculatePositions = useCallback(
    throttle(calculateMenuPositions, 100),
    [calculateMenuPositions, throttle]
  )

  // Setup scroll listener
  useEffect(() => {
    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    
    // Initial check
    handleScroll()
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
    }
  }, [throttledHandleScroll, handleScroll])

  // Setup position calculation
  useEffect(() => {
    // Calculate positions after component mounts
    const timer = setTimeout(calculateMenuPositions, 100)
    
    // Recalculate on window resize
    window.addEventListener('resize', throttledCalculatePositions, { passive: true })
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', throttledCalculatePositions)
    }
  }, [calculateMenuPositions, throttledCalculatePositions])

  // Recalculate positions when megamenu becomes active
  useEffect(() => {
    if (isMegaMenuActive) {
      // Small delay to ensure DOM is updated
      const timer = setTimeout(calculateMenuPositions, 50)
      return () => clearTimeout(timer)
    }
  }, [isMegaMenuActive, calculateMenuPositions])

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
          
          <div className="horizontal-menu">
            {Object.entries(MENU_CONFIG).map(([key, config]) => (
              <div 
                key={key} 
                className={`top-menu-item ${hoveredMenuItem === key ? 'active' : ''}`}
                data-menu={key}
                onMouseEnter={() => handleMenuItemEnter(key)}
                onMouseLeave={handleMenuItemLeave}
              >
                <Link href={config.mainLink}>{config.title}</Link>
                <div 
                  className="submenu-column"
                  style={{
                    left: menuPositions[key] !== undefined ? `${menuPositions[key]}px` : undefined
                  }}
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
            />
            <span className="search-icon"></span>
            <span className="close-icon"></span>
          </div>

          <div id="profile">
            {isLoggedIn ? (
              <Link href="/member/profile" title="회원정보수정">
                <img src="/icon/icon-profile.svg" alt="Profile" />
              </Link>
            ) : (
              <Link href="/member/login" title="로그인">
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

        {/* Megamenu Container - moved inside header for sticky behavior */}
        <div 
          id="megamenu-container" 
          className={isMegaMenuActive ? 'active' : ''}
          onMouseEnter={handleMegaMenuEnter}
          onMouseLeave={handleMegaMenuLeave}
        >
          <div className="megamenu-wrapper">
            {/* The megamenu content is handled by CSS - shows all submenu-columns when active */}
          </div>
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
          />
          <span className="search-icon"></span>
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
                <Link href="/member/profile">
                  <img src="/icon/icon-profile.svg" alt="User" />
                </Link>
              ) : (
                <Link href="/member/login">
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
                  <a href="javascript:void(0);">
                    <div className="menu-title">{config.title}</div>
                  </a>
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
                      <Link href={item.href}>{item.label}</Link>
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