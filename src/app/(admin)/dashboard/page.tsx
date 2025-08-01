'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Tags, MessageSquare, TrendingUp, Calendar } from 'lucide-react'

// Mock data - in real implementation, this would come from Supabase
interface DashboardStats {
  totalProducts: number
  totalCategories: number
  totalInquiries: number
  newInquiries: number
  recentProducts: Array<{
    id: string
    name: string
    partnumber: string
    created_at: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalInquiries: 0,
    newInquiries: 0,
    recentProducts: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchStats = async () => {
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStats({
        totalProducts: 2847,
        totalCategories: 12,
        totalInquiries: 156,
        newInquiries: 23,
        recentProducts: [
          {
            id: '1',
            name: 'High-Performance Sensor Module',
            partnumber: 'VRX-2024-001',
            created_at: '2024-01-15'
          },
          {
            id: '2',
            name: 'Industrial Controller Unit',
            partnumber: 'VRX-2024-002',
            created_at: '2024-01-14'
          },
          {
            id: '3',
            name: 'Power Management IC',
            partnumber: 'VRX-2024-003',
            created_at: '2024-01-13'
          }
        ]
      })
      setLoading(false)
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: '총 제품 수',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'blue',
      href: '/admin/products'
    },
    {
      title: '카테고리 수',
      value: stats.totalCategories.toString(),
      icon: Tags,
      color: 'green',
      href: '/admin/categories'
    },
    {
      title: '총 문의',
      value: stats.totalInquiries.toString(),
      icon: MessageSquare,
      color: 'purple',
      href: '/admin/inquiries'
    },
    {
      title: '신규 문의',
      value: stats.newInquiries.toString(),
      icon: TrendingUp,
      color: 'orange',
      href: '/admin/inquiries?status=new'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600">Virex B2B 포털 관리 시스템</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600">Virex B2B 포털 관리 시스템</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            orange: 'bg-orange-100 text-orange-600'
          }

          return (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">최근 등록 제품</h2>
            <Link 
              href="/admin/products"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              전체 보기 →
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats.recentProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.partnumber}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(product.created_at).toLocaleDateString('ko-KR')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">빠른 작업</h2>
          
          <div className="space-y-3">
            <Link
              href="/admin/products/new"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="w-5 h-5 text-gray-400 mr-3" />
              <span className="font-medium text-gray-700">새 제품 등록</span>
            </Link>
            
            <Link
              href="/admin/categories/new"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Tags className="w-5 h-5 text-gray-400 mr-3" />
              <span className="font-medium text-gray-700">새 카테고리 추가</span>
            </Link>
            
            <Link
              href="/admin/upload"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <span className="font-medium text-gray-700">일괄 데이터 업로드</span>
            </Link>
            
            <Link
              href="/admin/inquiries"
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 text-gray-400 mr-3" />
                <span className="font-medium text-gray-700">문의 관리</span>
              </div>
              {stats.newInquiries > 0 && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  {stats.newInquiries}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}