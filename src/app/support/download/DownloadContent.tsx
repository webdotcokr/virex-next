'use client'

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContentContainer from '@/components/PageContentContainer';
import { useAuth } from '@/contexts/AuthContext';
import styles from '../support.module.css';

interface Download {
  id: number;
  title: string;
  file_name: string;
  file_url: string;
  hit_count: number;
  created_at: string;
}

interface DownloadCategory {
  id: number;
  name: string;
  is_member_only: boolean;
  created_at: string;
  downloads: Download[];
}

const DownloadContent = () => {
  const [categories, setCategories] = useState<DownloadCategory[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()
  
  const DIR_ROOT = '/img';
  const page_title_en = "Leading your vision to success";
  const page_title_ko = "고객지원";

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "고객지원"},
    { label: "다운로드" }
  ];

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const response = await fetch('/api/downloads')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        } else {
          console.error('Failed to fetch downloads')
        }
      } catch (error) {
        console.error('Error fetching downloads:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDownloads()
  }, [])

  const handleDownload = async (download: Download, categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId)
    
    if (category?.is_member_only && !user) {
      // Redirect to login with current page as redirect target
      router.push(`/auth/login?redirect=${encodeURIComponent('/support/download')}`)
      return
    }

    // Update hit count
    try {
      await fetch(`/api/downloads/${download.id}/hit`, {
        method: 'POST',
      })
    } catch (error) {
      console.error('Failed to update hit count:', error)
    }

    // Open download link
    window.open(download.file_url, '_blank')
  }

  const handleMemberOnlyClick = (categoryId: number) => {
    if (!user) {
      alert('로그인이 필요합니다.')
      router.push(`/auth/login?redirect=${encodeURIComponent('/support/download')}`)
      return
    }
    // If user is logged in, proceed to the list page
    router.push(`/support/download/list?category_id=${categoryId}`)
  }

  const getIconForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    if (name.includes('카달로그') || name.includes('catalog')) return 'icon-download-catalog.svg'
    if (name.includes('데이터') || name.includes('datasheet')) return 'icon-download-datasheet.svg'
    if (name.includes('메뉴얼') || name.includes('manual')) return 'icon-download-manual.svg'
    if (name.includes('도면') || name.includes('drawing')) return 'icon-download-drawing.svg'
    if (name.includes('펌웨어') || name.includes('firmware')) return 'icon-download-firmware.svg'
    if (name.includes('소프트웨어') || name.includes('software')) return 'icon-download-software.svg'
    if (name.includes('드라이버') || name.includes('driver')) return 'icon-download-driver.svg'
    return 'icon-download-catalog.svg' // default
  }

  return (
    <div>
      <PageContentContainer
        backgroundClass="company-header-background"
        backgroundImage="/img/bg-support.webp"
        breadcrumbs={breadcrumbs}
        titleEn={page_title_en}
        titleKo={page_title_ko}
      >
      <div className="content-title">
        <h2>다운로드 센터</h2>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>다운로드 목록을 불러오는 중...</p>
        </div>
      ) : (
        <div className={`${styles['content-body']} mt-37px`}>
          {/* Public Downloads */}
          {categories.filter(cat => !cat.is_member_only).length > 0 && (
            <div className={styles['download-item-list']}>
              {categories
                .filter(cat => !cat.is_member_only)
                .map(category => (
                  <Link key={category.id} href={`/support/download/list?category_id=${category.id}`} className={styles['download-item']}>
                    <div className={styles['download-item-content']}>
                      <div className={styles['download-item-image']}>
                        <img src={`${DIR_ROOT}/${getIconForCategory(category.name)}`} alt={category.name} />
                      </div>
                      <div className={styles['download-item-text-first']}>
                        <h3>{category.name}</h3>
                      </div>
                      <div className={styles['download-item-text-second']}>
                        <h4>{category.downloads.length}개 파일</h4>
                      </div>
                      <div className={styles['download-item-button']}>
                        <img src={`${DIR_ROOT}/btn-download.svg`} alt="다운로드" />
                      </div>
                    </div>
                  </Link>
                ))
              }
            </div>
          )}

          {/* Member-only Downloads */}
          {categories.filter(cat => cat.is_member_only).length > 0 && (
            <>
              <div className={`${styles['sub-title-area']} mt-80px`}>
                <img src={`${DIR_ROOT}/icon-member-only.svg`} alt="회원전용" />
                <h2>회원 전용</h2>
                {!user && (
                  <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                    회원 전용 자료를 다운로드하려면 <Link href="/auth/login" style={{ color: '#007bff' }}>로그인</Link>이 필요합니다.
                  </p>
                )}
              </div>
              <div className={`${styles['download-item-list']} mt-12px`}>
                {categories
                  .filter(cat => cat.is_member_only)
                  .map(category => (
                    <div 
                      key={category.id} 
                      className={`${styles['download-item']} ${styles['bg-member-only']}`}
                      onClick={() => handleMemberOnlyClick(category.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles['download-item-content']}>
                        <div className={styles['download-item-image']}>
                          <img src={`${DIR_ROOT}/${getIconForCategory(category.name)}`} alt={category.name} />
                        </div>
                        <div className={styles['download-item-text-first']}>
                          <h3>{category.name}</h3>
                        </div>
                        <div className={styles['download-item-text-second']}>
                          <h4>{category.downloads.length}개 파일</h4>
                        </div>
                        <div className={styles['download-item-button']}>
                          <img src={`${DIR_ROOT}/btn-download.svg`} alt="다운로드" />
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </>
          )}
          <div className={`${styles['download-banner']} mt-80px`}>
            <div className={styles['download-banner-inner-wrapper']}>
              <div className={styles['download-banner-title']}>
                더 자세한 안내가 필요하신가요?
              </div>
              <p className={styles['download-banner-description']}>
                사이트 우측 하단, 바이렉스 채널 톡 상담을 통해 간편하게 문의 주세요.
              </p>
            </div>
          </div>
        </div>
      )}
      </PageContentContainer>
    </div>
  );
};

export default DownloadContent;