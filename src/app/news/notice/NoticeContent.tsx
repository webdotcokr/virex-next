'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageContentContainer from '@/components/PageContentContainer';
import type { Database } from '@/lib/supabase';
import Pagination from '@/components/ui/Pagination';

type NewsItem = Database['public']['Tables']['news']['Row'];

const NoticeContent = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  const fetchNews = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/news?category=1&page=${currentPage}&limit=${itemsPerPage}`);
      
      if (!response.ok) {
        throw new Error('데이터를 불러올 수 없습니다.');
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setNews(result.data || []);
      setTotalCount(result.count || 0);
      setError(null);
    } catch (err: any) {
      setError(err.message || '데이터를 불러올 수 없습니다.');
      setNews([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [currentPage]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ko-KR');
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
          { label: "공지사항" }
        ]}
        titleEn="Leading your vision to success"
        titleKo="뉴스"
      >
        <div className="page-container">
          <div className="content-title">
            <h2>공지사항</h2>
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
          </div>
        ) : (
          <>
            <table id="general-article-list" className="mt-10px w-full">
              <thead>
                <tr>
                  <th className="w-[10%]">번호</th>
                  <th className="w-[60%]">제목</th>
                  <th className="w-[15%]">등록일</th>
                  <th className="w-[15%]">조회수</th>
                </tr>
              </thead>
              <tbody>
                {news.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8">
                      게시물이 없습니다.
                    </td>
                  </tr>
                ) : (
                  news.map((item, index) => {
                    const displayNumber = totalCount - ((currentPage - 1) * itemsPerPage) - index;
                    return (
                      <tr key={item.id}>
                        <td className="text-center">
                          {item.is_featured ? (
                            <img src="/img/icon_notice.gif" className="vmiddle" alt="notice" />
                          ) : (
                            displayNumber
                          )}
                        </td>
                        <td>
                          <h3>
                            <Link href={`/news/notice/${item.id}`} className="hover:underline">
                              {item.title}
                            </Link>
                          </h3>
                        </td>
                        <td className="text-center">{formatDate(item.created_at)}</td>
                        <td className="text-center">{item.view_count || 0}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

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
      </PageContentContainer>
    </div>
  );
};

export default NoticeContent;