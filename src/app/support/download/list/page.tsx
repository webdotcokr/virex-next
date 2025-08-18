'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PageContentContainer from '@/components/PageContentContainer'
import Pagination from '@/components/ui/Pagination'
import { useAuth } from '@/contexts/AuthContext'

interface Download {
  id: number
  title: string
  file_name: string | null
  file_url: string
  hit_count: number
  created_at: string
}

interface DownloadCategory {
  id: number
  name: string
  is_member_only: boolean
}

const ITEMS_PER_PAGE = 10

function DownloadListPage() {
  const [downloads, setDownloads] = useState<Download[]>([])
  const [category, setCategory] = useState<DownloadCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const categoryId = searchParams.get('category_id')
  const sCate = searchParams.get('s_cate')
  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''

  useEffect(() => {
    setCurrentPage(page)
    setSearchKeyword(search)
    setSearchInput(search)
  }, [page, search])

  const fetchDownloads = async () => {
    try {
      setLoading(true)
      
      // First get category info
      let categoryInfo = null
      if (categoryId) {
        const categoryResponse = await fetch(`/api/downloads/category/${categoryId}`)
        if (categoryResponse.ok) {
          categoryInfo = await categoryResponse.json()
        }
      } else if (sCate) {
        const categoryResponse = await fetch(`/api/downloads/category/by-name?name=${encodeURIComponent(sCate)}`)
        if (categoryResponse.ok) {
          categoryInfo = await categoryResponse.json()
        }
      }

      if (categoryInfo) {
        setCategory(categoryInfo)
        
        // Check member access
        if (categoryInfo.is_member_only && !user) {
          const currentUrl = window.location.pathname + window.location.search
          router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`)
          return
        }
      }

      // Build query parameters
      const params = new URLSearchParams()
      if (categoryId) params.append('category_id', categoryId)
      if (sCate) params.append('s_cate', sCate)
      if (search) params.append('search', search)
      params.append('page', currentPage.toString())
      params.append('limit', ITEMS_PER_PAGE.toString())

      const response = await fetch(`/api/downloads/list?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setDownloads(data.downloads || [])
        setTotalCount(data.totalCount || 0)
      } else {
        console.error('Failed to fetch downloads')
      }
    } catch (error) {
      console.error('Error fetching downloads:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDownloads()
  }, [categoryId, sCate, currentPage, search, user])

  const handleDownload = async (download: Download) => {
    try {
      // Update hit count
      await fetch(`/api/downloads/${download.id}/hit`, {
        method: 'POST',
      })
      
      // Open download link
      window.open(download.file_url, '_blank')
    } catch (error) {
      console.error('Failed to update hit count:', error)
      // Still open the download link even if hit count update fails
      window.open(download.file_url, '_blank')
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (categoryId) params.append('category_id', categoryId)
    if (sCate) params.append('s_cate', sCate)
    if (searchInput.trim()) params.append('search', searchInput.trim())
    params.append('page', '1') // Reset to first page on search

    router.push(`/support/download/list?${params.toString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const goToPage = (pageNum: number) => {
    const params = new URLSearchParams()
    if (categoryId) params.append('category_id', categoryId)
    if (sCate) params.append('s_cate', sCate)
    if (search) params.append('search', search)
    params.append('page', pageNum.toString())

    router.push(`/support/download/list?${params.toString()}`)
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "고객지원", href: "/support/" },
    { label: "다운로드 센터", href: "/support/download" },
    { label: category?.name || "파일목록" }
  ]

  return (
    <div>
      <PageContentContainer
        backgroundClass="support-header-background"
        backgroundImage="/img/bg-support.webp"
        breadcrumbs={breadcrumbs}
        titleEn="Leading your vision to success"
        titleKo="고객지원"
      >
        <div className="content-body">
        <div className="content-title">
          <h2>다운로드 센터</h2>
        </div>
        <div id="general-article-list-header">
          <div className="cnt-area">
            <span className="cnt-label">TOTAL</span>
            <span className="cnt-value">{totalCount}</span>
          </div>
            <div className="search-area">
              <input
                type="text"
                placeholder="키워드로 검색하세요."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <span className="search-icon" onClick={handleSearch}></span>
            </div>
          </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">파일 목록을 불러오는 중...</p>
          </div>
        ) : (
          <>
            <table id="general-article-list" className="mt-10px">
              <thead>
                <tr>
                  <th className="w-[10%]">번호</th>
                  <th className="w-[60%]">제목</th>
                  <th className="w-[15%]">등록일</th>
                  <th className="w-[15%]">다운로드</th>
                </tr>
              </thead>
              <tbody>
                {downloads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8">
                      게시물이 없습니다.
                    </td>
                  </tr>
                ) : (
                  downloads.map((download, index) => {
                    const num = totalCount - ((currentPage - 1) * ITEMS_PER_PAGE) - index
                    return (
                      <tr key={download.id}>
                        <td className="text-center">{num}</td>
                        <td>
                          <h3>{download.title}</h3>
                        </td>
                        <td className="text-center">{formatDate(download.created_at)}</td>
                        <td className="text-center">
                          {download.file_url ? (
                            <button
                              onClick={() => handleDownload(download)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                            >
                              <img src="/img/btn-download.svg" alt="다운로드" />
                            </button>
                          ) : (
                            <span style={{ color: '#999' }}>-</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>

            <div className="flex justify-center mt-6">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </div>
          </>
        )}
        </div>
      </PageContentContainer>
    </div>
  )
}

export default function DownloadListPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DownloadListPage />
    </Suspense>
  )
}