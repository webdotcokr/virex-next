import { Metadata } from 'next';
import NoticeContent from './NoticeContent';

export const metadata: Metadata = {
  title: "공지사항 - VIREX | 머신비전 최신 소식 및 공지",
  description: "VIREX의 최신 공지사항, 제품 업데이트, 이벤트 소식을 확인하세요. 머신비전 업계 최신 동향과 VIREX 뉴스를 한 곳에서 만나보세요.",
  keywords: [
    "공지사항", "뉴스", "VIREX", "바이렉스", "머신비전", "제품업데이트", 
    "이벤트", "소식", "최신동향", "산업용카메라", "새소식", "알림"
  ].join(', '),
  openGraph: {
    title: "공지사항 - VIREX | 머신비전 최신 소식 및 공지",
    description: "VIREX의 최신 공지사항과 머신비전 업계 동향을 확인하세요. 제품 업데이트부터 이벤트 소식까지 모든 정보를 제공합니다.",
    url: "https://virex.co.kr/news/notice",
    siteName: "VIREX",
    images: [
      {
        url: "https://virex.co.kr/img/bg-news.webp",
        width: 1200,
        height: 630,
        alt: "VIREX 공지사항",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "공지사항 - VIREX | 머신비전 최신 소식 및 공지",
    description: "VIREX의 최신 공지사항과 머신비전 업계 동향을 확인하세요.",
    images: ["https://virex.co.kr/img/bg-news.webp"],
  },
  alternates: {
    canonical: "https://virex.co.kr/news/notice",
  },
  other: {
    // 구조화된 데이터 (JSON-LD) for News Page
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      'name': 'VIREX 공지사항',
      'description': '머신비전 전문기업 VIREX의 최신 공지사항 및 뉴스',
      'url': 'https://virex.co.kr/news/notice',
      'publisher': {
        '@type': 'Organization',
        'name': 'VIREX',
        'url': 'https://virex.co.kr',
        'logo': 'https://virex.co.kr/common/virex-logo-color.png'
      },
      'mainEntity': {
        '@type': 'ItemList',
        'name': '공지사항 목록',
        'description': 'VIREX 공지사항 및 최신 소식'
      },
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://virex.co.kr'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': '뉴스',
            'item': 'https://virex.co.kr/news'
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': '공지사항',
            'item': 'https://virex.co.kr/news/notice'
          }
        ]
      }
    })
  }
};

export default function NoticePage() {
  return (
    <>
      {/* Structured Data Script for Notice Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            'name': 'VIREX 공지사항',
            'description': '머신비전 전문기업 VIREX의 최신 공지사항',
            'url': 'https://virex.co.kr/news/notice',
            'isPartOf': {
              '@type': 'WebSite',
              'name': 'VIREX',
              'url': 'https://virex.co.kr'
            }
          })
        }}
      />
      <NoticeContent />
    </>
  );
}