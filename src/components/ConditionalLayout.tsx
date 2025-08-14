'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import QuickMenu from "@/components/QuickMenu"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // 관리자 페이지인지 확인
  const isAdminPage = isClient && pathname?.startsWith('/admin')

  if (isAdminPage) {
    // 관리자 페이지: Header, Footer, QuickMenu 없이 순수하게 children만
    return <>{children}</>
  }

  // 일반 사용자 페이지: 기존 레이아웃
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <QuickMenu />
    </>
  )
}