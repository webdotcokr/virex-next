'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import MyPageLayout from '@/components/mypage/MyPageLayout'

export default function MyPageLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?redirect=' + encodeURIComponent('/mypage'))
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        fontSize: '16px',
        color: '#666'
      }}>
        로딩 중...
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <MyPageLayout>{children}</MyPageLayout>
}