import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="h-16 bg-gray-100 animate-pulse" />}>
      </Suspense>
      
      <main className="flex-1">
        {children}
      </main>
      

    </div>
  )
}