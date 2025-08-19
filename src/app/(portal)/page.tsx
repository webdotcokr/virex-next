import { Metadata } from 'next'
import HomeContent from './HomeContent'

export const metadata: Metadata = {
  title: "VIREX - 머신비전 & 광학 솔루션 전문기업",
  description: "바이렉스는 머신비전 관련 컴포넌트 전문 기업으로, 광학 컨설팅, 신규 메이커 발굴, 맞춤형 솔루션 연구개발을 제공합니다. 최신 기술로 고객의 혁신적인 비즈니스 성장을 지원합니다.",
  keywords: [
    "바이렉스", "VIREX", "머신비전", "산업용카메라", "CIS카메라", "TDI카메라", 
    "Line카메라", "Area카메라", "프레임그래버", "렌즈", "조명", "Teledyne DALSA", 
    "FLIR", "비전시스템", "광학솔루션", "자동화", "검사장비"
  ].join(', '),
  openGraph: {
    title: "VIREX - 머신비전 & 광학 솔루션 전문기업",
    description: "검증된 파트너 바이렉스와 함께 최적의 비전 솔루션을 구축하세요. 2,000개 이상의 제품을 검색하고 비교할 수 있습니다.",
    url: "https://virex.co.kr",
    siteName: "VIREX",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VIREX - 머신비전 & 광학 솔루션 전문기업",
    description: "검증된 파트너 바이렉스와 함께 최적의 비전 솔루션을 구축하세요.",
  },
  alternates: {
    canonical: "https://virex.co.kr",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    // 구조화된 데이터 (JSON-LD) for Organization
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'VIREX',
      'alternateName': '바이렉스',
      'url': 'https://virex.co.kr',
      'logo': 'https://virex.co.kr/common/virex-logo-color.png',
      'description': '머신비전 & 광학 솔루션 전문기업',
      'address': {
        '@type': 'PostalAddress',
        'addressCountry': 'KR',
        'addressLocality': '서울',
      },
      'sameAs': [
        'https://blog.virex.co.kr'
      ],
      'hasOfferCatalog': {
        '@type': 'OfferCatalog',
        'name': '머신비전 제품 카탈로그',
        'itemListElement': [
          {
            '@type': 'OfferCatalog',
            'name': '산업용 카메라',
            'description': 'CIS, TDI, Line, Area, Invisible, Scientific 카메라'
          },
          {
            '@type': 'OfferCatalog', 
            'name': '렌즈',
            'description': 'Large Format, Telecentric, FA 렌즈'
          },
          {
            '@type': 'OfferCatalog',
            'name': '프레임그래버',
            'description': 'Camera Link, CoaXPress, GigE 프레임그래버'
          }
        ]
      }
    })
  }
}

export default function Home() {
  return (
    <>
      {/* Structured Data Script for better SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            'name': 'VIREX',
            'alternateName': '바이렉스',
            'url': 'https://virex.co.kr',
            'description': '머신비전 & 광학 솔루션 전문기업',
            'potentialAction': {
              '@type': 'SearchAction',
              'target': {
                '@type': 'EntryPoint',
                'urlTemplate': 'https://virex.co.kr/products?search={search_term_string}'
              },
              'query-input': 'required name=search_term_string'
            }
          })
        }}
      />
      <HomeContent />
    </>
  )
}