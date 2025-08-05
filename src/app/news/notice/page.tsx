'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageContentContainer from '@/components/PageContentContainer';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type NewsItem = Database['public']['Tables']['news']['Row'];

const NoticePage = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  const page_title_en = "Leading your vision to success";
  const page_title_ko = "뉴스";

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "뉴스", href: "/news" },
    { label: "공지사항" }
  ];

  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchNewsData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state
        
        const { data, error, count } = await supabase
          .from('news')
          .select('*', { count: 'exact' })
          .eq('category_id', 1) // 공지사항 카테고리
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

        if (error) {
          console.error('❌ Supabase error:', error);
          throw error;
        }

        // AbortController 체크
        if (abortController.signal.aborted) {
          return;
        }

        setNews(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        console.error('❌ Error fetching news:', err);
        
        if (!abortController.signal.aborted) {
          setError(err instanceof Error ? err.message : '뉴스를 불러오는데 실패했습니다.');
          setNews([]); // Reset data on error
          setTotalCount(0);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchNewsData();

    // Cleanup function
    return () => {
      abortController.abort();
    };
  }, [currentPage]);

  const fetchNews = async () => {
    // 수동 새로고침용 함수
    try {
      setLoading(true);
      setError(null);
      
      const { data, error, count } = await supabase
        .from('news')
        .select('*', { count: 'exact' })
        .eq('category_id', 1)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) throw error;

      setNews(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('❌ Error fetching news:', err);
      setError(err instanceof Error ? err.message : '뉴스를 불러오는데 실패했습니다.');
      setNews([]);
      setTotalCount(0);
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
      <PageContentContainer
        backgroundClass="company-header-background"
        backgroundImage="/img/bg-news.webp"
        breadcrumbs={breadcrumbs}
        titleEn={page_title_en}
        titleKo={page_title_ko}
      >
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
            <button 
              onClick={fetchNews} 
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              다시 시도
            </button>
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

            {maxPage > 1 && renderPagination()}
          </>
        )}
      </PageContentContainer>
    </div>
  );
};

export default NoticePage;