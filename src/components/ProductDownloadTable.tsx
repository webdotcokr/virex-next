'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface Download {
  id: number
  title: string
  file_name: string | null
  file_url: string
  hit_count: number
  is_member_only?: boolean
  file_type?: string // 'catalog' | 'datasheet' | 'manual' | 'drawing'
}

interface ProductDownloadTableProps {
  downloads: Download[]
  showMemberOnly?: boolean
}

export default function ProductDownloadTable({ downloads, showMemberOnly = true }: ProductDownloadTableProps) {
  const { user } = useAuth()
  const router = useRouter()

  const handleDownload = async (download: Download) => {
    try {
      // 회원 전용 파일 (도면) 접근 제어
      if (download.is_member_only && !user) {
        if (confirm('회원만 다운로드 가능합니다. 로그인 페이지로 이동하시겠습니까?')) {
          const currentUrl = window.location.pathname + window.location.search
          router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`)
        }
        return
      }

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

  // 파일 타입에 따른 한국어 라벨 매핑
  const getFileTypeLabel = (fileType?: string) => {
    switch (fileType) {
      case 'catalog': return '카달로그'
      case 'datasheet': return '제안서'
      case 'manual': return '메뉴얼'
      case 'drawing': return '도면'
      default: return '파일'
    }
  }

  // downloads 배열을 필터링 (null 또는 빈 파일 제외)
  const filteredDownloads = downloads.filter(download => 
    download && download.file_url && download.file_url.trim() !== ''
  )

  if (filteredDownloads.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        다운로드 가능한 파일이 없습니다.
      </div>
    )
  }

  return (
    <table id="general-article-list" className="mt-10px">
      <thead>
        <tr>
          <th className="w-[20%]">구분</th>
          <th className="w-[65%]">파일명</th>
          <th className="w-[15%]">다운로드</th>
        </tr>
      </thead>
      <tbody>
        {filteredDownloads.map((download, index) => (
          <tr key={`${download.id}-${download.file_type || index}`}>
            <td className="text-center">{getFileTypeLabel(download.file_type)}</td>
            <td>
              <h3>
                {download.is_member_only && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                    회원전용
                  </span>
                )}
                {download.title}
              </h3>
            </td>
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
        ))}
      </tbody>
    </table>
  )
}