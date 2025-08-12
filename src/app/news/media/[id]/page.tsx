'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PageContentContainer from '@/components/PageContentContainer';
import type { Database } from '@/lib/supabase';

type NewsItem = Database['public']['Tables']['news']['Row'];

const MediaDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page_title_en = "Leading your vision to success";
  const page_title_ko = "뉴스";

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "뉴스", href: "/news" },
    { label: "미디어", href: "/news/media" },
    { label: "상세보기" }
  ];

  useEffect(() => {
    if (params.id) {
      fetchArticle(params.id as string);
    }
  }, [params.id]);

  const fetchArticle = async (id: string) => {
    try {
      setLoading(true);
      
      // ID 유효성 검사
      if (!id || isNaN(Number(id))) {
        setError('잘못된 접근입니다.');
        return;
      }

      // 게시물 조회
      const response = await fetch(`/api/news/${id}`);
      
      if (!response.ok) {
        throw new Error('미디어를 불러올 수 없습니다.');
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      // category_id 체크 (미디어만)
      if (result.data?.category_id !== 2) {
        setError('게시물이 없습니다.');
        return;
      }

      setArticle(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
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

  const handleGoBack = () => {
    router.push('/news/media');
  };

  if (loading) {
    return (
      <div>
        <PageContentContainer
          backgroundClass="news-header-background"
          backgroundImage="/img/bg-news.webp"
          breadcrumbs={breadcrumbs}
          titleEn={page_title_en}
          titleKo={page_title_ko}
        >
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">로딩 중...</p>
          </div>
        </PageContentContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageContentContainer
          backgroundClass="news-header-background"
          backgroundImage="/img/bg-company.webp"
          breadcrumbs={breadcrumbs}
          titleEn={page_title_en}
          titleKo={page_title_ko}
        >
          <div className="text-center py-8 text-red-600">
            <p className="text-lg">{error}</p>
            <button 
              onClick={handleGoBack}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              목록으로 돌아가기
            </button>
          </div>
        </PageContentContainer>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div>
      <PageContentContainer
        backgroundClass="news-header-background"
        backgroundImage="/img/bg-company.webp"
        breadcrumbs={breadcrumbs}
        titleEn={page_title_en}
        titleKo={page_title_ko}
      >
        <div className="page-container">
          <div id="general-article-view">
            <div className="article-view-header">
            <h2 className="article-view-title">
              {article.is_featured && (
                <span style={{ color: '#3b82f6' }}>[중요] </span>
              )}
              {article.title}
            </h2>
            <div className="article-view-info">
              <div>
                <label>등록일</label>
                <span>{formatDate(article.created_at)}</span>
              </div>
              <div>
                <label>조회수</label>
                <span>{article.view_count || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="article-view-content">
            {/* 썸네일 이미지가 있는 경우 콘텐츠 상단에 표시 */}
            {article.thumbnail_url && (
              <div className="media-thumbnail">
                <img 
                  src={article.thumbnail_url} 
                  alt={article.title}
                />
              </div>
            )}
            
            {typeof article.content === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            ) : (
              <div>{JSON.stringify(article.content)}</div>
            )}
          </div>
          
          <div className="article-view-footer">
            <div className="article-view-button-group">
              <Link href="/news/media" className="btn-default">
                목록으로
              </Link>
            </div>
          </div>
        </div>
        </div>

        <style jsx>{`
          .article-view-header {
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .article-view-title {
            font-size: 28px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 16px;
            line-height: 1.4;
          }
          
          .article-view-info {
            display: flex;
            gap: 24px;
            color: #6b7280;
            font-size: 14px;
          }
          
          .article-view-info div {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .article-view-info label {
            font-weight: 500;
            min-width: 50px;
          }
          
          .article-view-content {
            line-height: 1.8;
            color: #374151;
            margin-bottom: 40px;
            font-size: 16px;
          }
          
          .media-thumbnail {
            text-align: center;
            margin-bottom: 30px;
          }
          
          .media-thumbnail img {
            max-width: 50%;
            max-height: auto;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          
          .article-view-content :global(p) {
            margin-bottom: 16px;
          }
          
          .article-view-content :global(img) {
            max-width: 100%;
            width: 100%;
            height: auto;
            margin: 20px 0;
          }
          
          .article-view-footer {
            border-top: 1px solid #e5e7eb;
            padding-top: 24px;
            text-align: center;
          }
          
          .article-view-button-group {
            display: flex;
            justify-content: center;
            gap: 12px;
          }
          
          .btn-default {
            display: inline-block;
            padding: 12px 24px;
            background-color: #f3f4f6;
            color: #374151;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.2s ease;
            border: 1px solid #d1d5db;
          }
          
          .btn-default:hover {
            background-color: #e5e7eb;
            color: #1f2937;
          }
          
          @media (max-width: 768px) {
            #general-article-view {
              padding: 20px 0;
            }
            
            .article-view-title {
              font-size: 24px;
            }
            
            .article-view-info {
              flex-direction: column;
              gap: 8px;
            }
            
            .media-thumbnail img {
              max-height: 250px;
            }
          }
        `}</style>
      </PageContentContainer>
    </div>
  );
};

export default MediaDetailPage;