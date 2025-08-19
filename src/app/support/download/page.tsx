import { Metadata } from 'next';
import DownloadContent from './DownloadContent';

export const metadata: Metadata = {
  title: "다운로드 센터 - VIREX | 카탈로그, 매뉴얼, 소프트웨어 자료실",
  description: "VIREX 제품 카탈로그, 데이터시트, 매뉴얼, 드라이버, 소프트웨어 등 다양한 기술 자료를 다운로드하세요. 회원 전용 자료도 제공됩니다.",
  keywords: [
    "다운로드", "카탈로그", "데이터시트", "매뉴얼", "드라이버", "소프트웨어", 
    "VIREX", "바이렉스", "기술자료", "사용설명서", "펌웨어", "도면",
    "산업용카메라", "머신비전", "자료실", "회원전용"
  ].join(', '),
  openGraph: {
    title: "다운로드 센터 - VIREX | 카탈로그, 매뉴얼, 소프트웨어 자료실",
    description: "VIREX 제품 관련 모든 기술 자료를 한 곳에서 다운로드하세요. 카탈로그부터 소프트웨어까지 완벽 지원.",
    url: "https://virex.co.kr/support/download",
    siteName: "VIREX",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "다운로드 센터 - VIREX | 카탈로그, 매뉴얼, 소프트웨어 자료실",
    description: "VIREX 제품 관련 모든 기술 자료를 한 곳에서 다운로드하세요.",
  },
  alternates: {
    canonical: "https://virex.co.kr/support/download",
  },
  other: {
    // 구조화된 데이터 (JSON-LD) for Download Center
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'VIREX 다운로드 센터',
      'description': '머신비전 제품 카탈로그, 매뉴얼, 소프트웨어 등 기술 자료 다운로드',
      'url': 'https://virex.co.kr/support/download',
      'mainEntity': {
        '@type': 'DataCatalog',
        'name': 'VIREX 기술 자료실',
        'description': '산업용 카메라, 렌즈, 프레임그래버 등 머신비전 제품의 모든 기술 문서',
        'publisher': {
          '@type': 'Organization',
          'name': 'VIREX',
          'url': 'https://virex.co.kr'
        },
        'dataset': [
          {
            '@type': 'Dataset',
            'name': '제품 카탈로그',
            'description': '머신비전 제품 전체 카탈로그'
          },
          {
            '@type': 'Dataset',
            'name': '데이터시트',
            'description': '제품별 상세 기술 사양서'
          },
          {
            '@type': 'Dataset',
            'name': '사용 매뉴얼',
            'description': '제품 설치 및 사용 가이드'
          },
          {
            '@type': 'Dataset',
            'name': '드라이버 & 소프트웨어',
            'description': '제품 구동을 위한 드라이버 및 소프트웨어'
          }
        ]
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
            'name': '고객지원',
            'item': 'https://virex.co.kr/support'
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': '다운로드',
            'item': 'https://virex.co.kr/support/download'
          }
        ]
      }
    })
  }
};

export default function DownloadPage() {
  return (
    <>
      {/* Structured Data Script for Download Center */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SupportPage',
            'name': 'VIREX 다운로드 센터',
            'description': '머신비전 제품 기술 자료 다운로드',
            'url': 'https://virex.co.kr/support/download',
            'provider': {
              '@type': 'Organization',
              'name': 'VIREX',
              'url': 'https://virex.co.kr'
            }
          })
        }}
      />
      <DownloadContent />
    </>
  );
}