'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import PageContentContainer from '@/components/PageContentContainer';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type NewsItem = Database['public']['Tables']['news']['Row'];

const MediaPage = () => {
  const [media, setMedia] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12; // Grid layout에 적합한 수량

  const page_title_en = "Leading your vision to success";
  const page_title_ko = "뉴스";

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "뉴스", href: "/news" },
    { label: "미디어" }
  ];

  useEffect(() => {
    fetchMedia();
  }, [currentPage]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const { data, error, count } = await supabase
        .from('news')
        .select('*', { count: 'exact' })
        .eq('category_id', 2) // 미디어 카테고리
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) throw error;

      setMedia(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : '미디어를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const maxPage = Math.ceil(totalCount / itemsPerPage);

  const renderPagination = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 5);
    const endPage = Math.min(maxPage, currentPage + 5);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 mx-1 ${
            i === currentPage
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } rounded`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center mt-6">
        {currentPage > 1 && (
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 mx-1 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded"
          >
            이전
          </button>
        )}
        {pages}
        {currentPage < maxPage && (
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 mx-1 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded"
          >
            다음
          </button>
        )}
      </div>
    );
  };

  return (
    <div>
      <Head>
        <title>{`미디어 | 바이렉스`}</title>
      </Head>

      <PageContentContainer
        backgroundClass="company-header-background"
        backgroundImage="/img/bg-news.webp"
        breadcrumbs={breadcrumbs}
        titleEn={page_title_en}
        titleKo={page_title_ko}
      >
        <div className="content-title">
          <h2>미디어</h2>
        </div>
        
        <div id="general-article-list-header">
          <div className="cnt-area">
            <span className="cnt-label">TOTAL</span>
            <span className="cnt-value">{totalCount}</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
            <button 
              onClick={fetchMedia} 
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <>
            <div className="grid-container mt-10px">
              {media.length === 0 ? (
                <div className="grid-item">
                  <div className="text-center py-8">
                    게시물이 없습니다.
                  </div>
                </div>
              ) : (
                media.map((item) => (
                  <Link key={item.id} href={`/news/media/${item.id}`}>
                    <div className="grid-item hover:shadow-lg transition-shadow duration-200">
                      <div className="grid-item-thumbnail">
                        {item.thumbnail_url && item.thumbnail_url.trim() !== '' ? (
                          <img
                            src={item.thumbnail_url}
                            alt={item.title}
                            className="w-full h-48 object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/img/main/noImg.jpg';
                            }}
                          />
                        ) : (
                          <img
                            src="/img/main/noImg.jpg"
                            alt="이미지 없음"
                            className="w-full h-48 object-cover rounded"
                          />
                        )}
                      </div>
                      <div className="grid-item-content mt-18px">
                        <h3 className="grid-item-title text-lg font-semibold line-clamp-2">
                          {item.title}
                        </h3>
                        <div className="grid-item-date mt-26px text-gray-500 text-sm">
                          {formatDate(item.created_at)}
                        </div>
                        </div>
                      </div>
                    </Link>
                  ))
              )}
            </div>

            {maxPage > 1 && renderPagination()}
          </>
        )}

        <style jsx>{`
          .grid-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 24px;
            margin-top: 20px;
          }
          
          .grid-item {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
            transition: all 0.2s ease;
          }
          
          .grid-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          
          .grid-item-thumbnail {
            position: relative;
            width: 100%;
            height: 200px;
            overflow: hidden;
          }
          
          .grid-item-content {
            padding: 18px;
          }
          
          .grid-item-title {
            color: #1f2937;
            margin-bottom: 12px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .grid-item-date {
            color: #6b7280;
            font-size: 14px;
          }
          
          .mt-10px {
            margin-top: 10px;
          }
          
          .mt-18px {
            margin-top: 18px;
          }
          
          .mt-26px {
            margin-top: 26px;
          }
          
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          @media (max-width: 768px) {
            .grid-container {
              grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
              gap: 16px;
            }
          }
          
          @media (max-width: 480px) {
            .grid-container {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </PageContentContainer>
    </div>
  );
};

export default MediaPage;