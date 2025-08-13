'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './search.module.css'
import { SearchService, type SearchResults } from '@/domains/search/services/search-service'
import { highlightSearchTerm, getTextExcerpt } from '@/domains/search/utils/highlight-utils'
import { getNewsUrl } from '@/domains/search/utils/news-utils'
import PageContentContainer from '@/components/PageContentContainer'
import type { BreadcrumbItem } from '@/types/breadcrumb'

// 검색 결과를 가져오는 함수
async function fetchSearchResults(query: string): Promise<SearchResults | null> {
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) {
      throw new Error('Failed to fetch search results')
    }
    return await response.json()
  } catch (error) {
    console.error('Search error:', error)
    return null
  }
}

// 검색 컨텐츠 컴포넌트 (Suspense 내부용)
function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'products' | 'news' | 'downloads'>('products')
  const [error, setError] = useState<string | null>(null)

  // 브레드크럼 생성
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: '검색', href: '/search' },
    { label: query ? `'${query}' 검색 결과` : '검색 결과' }
  ]

  useEffect(() => {
    if (!query.trim()) {
      setLoading(false)
      setError('검색어를 입력해주세요.')
      return
    }

    const performSearch = async () => {
      setLoading(true)
      setError(null)
      
      const searchResults = await fetchSearchResults(query.trim())
      
      if (searchResults) {
        // 최근 검색어에 추가
        SearchService.addRecentSearch(query.trim())
        
        setResults(searchResults)
        // 결과가 가장 많은 탭을 기본으로 선택
        if (searchResults.total.products > 0) {
          setActiveTab('products')
        } else if (searchResults.total.news > 0) {
          setActiveTab('news')
        } else if (searchResults.total.downloads > 0) {
          setActiveTab('downloads')
        }
      } else {
        setError('검색 중 오류가 발생했습니다.')
      }
      
      setLoading(false)
    }

    performSearch()
  }, [query])

  if (loading) {
    return (
      <PageContentContainer
        backgroundClass="support-header-background"
        backgroundImage="/img/bg-support.webp"
        breadcrumbs={breadcrumbs}
        titleEn="Leading your vision to success"
        titleKo="검색결과"
      >
        <div className={styles.searchLoading}>
          <div className={styles.loadingSpinner}></div>
          <p>검색 중...</p>
        </div>
      </PageContentContainer>
    )
  }

  if (error) {
    return (
      <PageContentContainer
        backgroundClass="support-header-background"
        backgroundImage="/img/bg-support.webp"
        breadcrumbs={breadcrumbs}
        titleEn="Leading your vision to success"
        titleKo="검색"
      >
        <div className={styles.searchError}>
          <p>{error}</p>
          <Link href="/" className={styles.backHomeBtn}>
            홈으로 돌아가기
          </Link>
        </div>
      </PageContentContainer>
    )
  }

  if (!results) {
    return (
      <PageContentContainer
        backgroundClass="support-header-background"
        backgroundImage="/img/bg-support.webp"
        breadcrumbs={breadcrumbs}
        titleEn="Leading your vision to success"
        titleKo="검색 결과"
      >
        <div className={styles.searchError}>
          <p>검색 결과를 가져올 수 없습니다.</p>
          <Link href="/" className={styles.backHomeBtn}>
            홈으로 돌아가기
          </Link>
        </div>
      </PageContentContainer>
    )
  }

  const hasResults = results.total.products > 0 || results.total.news > 0 || results.total.downloads > 0

  return (
    <PageContentContainer
      backgroundClass="support-header-background"
      backgroundImage="/img/bg-support.webp"
      breadcrumbs={breadcrumbs}
      titleEn="Leading your vision to success"
      titleKo="검색 결과"
    >
      <div className={styles.searchPage}>
        {/* 검색 헤더 */}
        <div className={styles.searchHeader}>
          <h1>검색 결과</h1>
          <p className={styles.searchQuery}>'{query}' 검색 결과</p>
          {hasResults && (
            <p className={styles.searchSummary}>
              총 {results.total.products + results.total.news + results.total.downloads}개의 결과를 찾았습니다.
            </p>
          )}
        </div>

      {!hasResults ? (
        <div className={styles.noResults}>
          <h2>검색 결과가 없습니다</h2>
          <p>다른 검색어를 입력해보세요.</p>
          <div className={styles.searchSuggestions}>
            <h3>검색 팁:</h3>
            <ul>
              <li>제품명 또는 모델명으로 검색해보세요</li>
              <li>짧은 키워드를 사용해보세요</li>
              <li>띄어쓰기나 대소문자를 바꿔보세요</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          {/* 탭 네비게이션 */}
          <div className={styles.searchTabs}>
            <button
              className={`${styles.tabButton} ${activeTab === 'products' ? styles.active : ''}`}
              onClick={() => setActiveTab('products')}
            >
              제품 ({results.total.products})
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'news' ? styles.active : ''}`}
              onClick={() => setActiveTab('news')}
            >
              뉴스 ({results.total.news})
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'downloads' ? styles.active : ''}`}
              onClick={() => setActiveTab('downloads')}
            >
              다운로드 ({results.total.downloads})
            </button>
          </div>

          {/* 검색 결과 */}
          <div className={styles.searchResults}>
            {/* 제품 결과 */}
            {activeTab === 'products' && (
              <div className={styles.productsResults}>
                {results.products.length === 0 ? (
                  <p className={styles.noCategoryResults}>제품 검색 결과가 없습니다.</p>
                ) : (
                  <div className={styles.productsGrid}>
                    {results.products.map((product) => (
                      <div key={`${product.category_id}-${product.id}`} className={styles.productCard}>
                        <div className={styles.productImage}>
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.part_number}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent) {
                                  parent.innerHTML = '<div class="no-image"><span>이미지 없음</span></div>'
                                }
                              }}
                            />
                          ) : (
                            <div className={styles.noImage}>
                              <span>이미지 없음</span>
                            </div>
                          )}
                        </div>
                        <div className={styles.productInfo}>
                          <h3 className={styles.partNumber}>
                            <Link href={`/products/${product.part_number}`}>
                              {highlightSearchTerm(product.part_number, query)}
                            </Link>
                          </h3>
                          <p className={styles.seriesName}>
                            {product.series_name || '시리즈 정보 없음'}
                          </p>
                          <p className={styles.categoryBadge}>
                            {product.category_name}
                          </p>
                          {product.maker && (
                            <p className={styles.makerName}>
                              {product.maker}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 뉴스 결과 */}
            {activeTab === 'news' && (
              <div className={styles.newsResults}>
                {results.news.length === 0 ? (
                  <p className={styles.noCategoryResults}>뉴스 검색 결과가 없습니다.</p>
                ) : (
                  <div className={styles.newsList}>
                    {results.news.map((newsItem) => (
                      <div key={newsItem.id} className={styles.newsCard}>
                        {newsItem.thumbnail_url && (
                          <div className={styles.newsThumbnail}>
                            <img src={newsItem.thumbnail_url} alt={newsItem.title} />
                          </div>
                        )}
                        <div className={styles.newsContent}>
                          <h3 className={styles.newsTitle}>
                            <Link href={getNewsUrl(newsItem)}>
                              {highlightSearchTerm(newsItem.title, query)}
                            </Link>
                          </h3>
                          <p className={styles.newsExcerpt}>
                            {highlightSearchTerm(getTextExcerpt(newsItem.content, query, 150), query)}
                          </p>
                          <p className={styles.newsDate}>
                            {new Date(newsItem.created_at).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 다운로드 결과 */}
            {activeTab === 'downloads' && (
              <div className={styles.downloadsResults}>
                {results.downloads.length === 0 ? (
                  <p className={styles.noCategoryResults}>다운로드 검색 결과가 없습니다.</p>
                ) : (
                  <div className={styles.downloadsList}>
                    {results.downloads.map((download) => (
                      <div key={download.id} className={styles.downloadCard}>
                        <div className={styles.downloadIcon}>
                          📄
                        </div>
                        <div className={styles.downloadInfo}>
                          <h3 className={styles.downloadTitle}>
                            <Link href={`/support/download?id=${download.id}`}>
                              {highlightSearchTerm(download.title, query)}
                            </Link>
                          </h3>
                          <p className={styles.downloadFilename}>
                            {highlightSearchTerm(download.file_name, query)}
                          </p>
                          <p className={styles.downloadDate}>
                            {new Date(download.created_at).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </PageContentContainer>
  )
}

// 메인 검색 페이지 컴포넌트
export default function SearchPage() {
  const defaultBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: '검색', href: '/search' },
    { label: '검색 결과' }
  ]

  return (
    <Suspense fallback={
      <PageContentContainer
        backgroundClass="support-header-background"
        backgroundImage="/img/bg-support.webp"
        breadcrumbs={defaultBreadcrumbs}
        titleEn="Leading your vision to success"
        titleKo="검색결과"
      >
        <div className={styles.searchLoading}>
          <div className={styles.loadingSpinner}></div>
          <p>페이지를 로드하는 중...</p>
        </div>
      </PageContentContainer>
    }>
      <SearchContent />
    </Suspense>
  )
}