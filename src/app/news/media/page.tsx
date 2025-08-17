'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageContentContainer from '@/components/PageContentContainer';
import Pagination from '@/components/ui/Pagination';
import type { Database } from '@/lib/supabase';

type NewsItem = Database['public']['Tables']['news']['Row'];

const MediaPage = () => {
  const [media, setMedia] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 12;

  const fetchMedia = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/news?category=2&page=${currentPage}&limit=${itemsPerPage}`);
      
      if (!response.ok) {
        throw new Error('미디어를 불러올 수 없습니다.');
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setMedia(result.data || []);
      setTotalCount(result.count || 0);
      setError(null);
    } catch (err: any) {
      setError(err.message || '미디어를 불러올 수 없습니다.');
      setMedia([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [currentPage]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div>
      <PageContentContainer
        backgroundClass="company-header-background"
        backgroundImage="/img/bg-news.webp"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "뉴스"},
          { label: "미디어" }
        ]}
        titleEn="Leading your vision to success"
        titleKo="뉴스"
      >
        <div className="page-container">
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

            <div className="flex justify-center mt-6">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
          )}
        </div>

        <style jsx>{`
          .grid-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 24px;
            margin-top: 20px;
          }
          
          .grid-item {
            background: white;
            overflow: hidden;
            transition: all 0.2s ease;
          }
          
          .grid-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          
          .grid-item-thumbnail {
            position: relative;
            width: 100%;
            height: auto;
            overflow: hidden;
          }
          
          .grid-item-content {
            padding-bottom: 16px;
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