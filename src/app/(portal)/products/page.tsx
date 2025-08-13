import { Metadata } from 'next'
import { Suspense } from 'react'
import ProductsContent from './ProductsContent'

export async function generateMetadata({ searchParams }: {
  searchParams: { [key: string]: string | string[] | undefined }
}): Promise<Metadata> {
  const categories = searchParams.categories as string
  const search = searchParams.search as string
  
  // 카테고리별 메타 정보 매핑
  const categoryMeta: Record<string, { name: string; description: string; keywords: string[] }> = {
    '9': {
      name: 'CIS 카메라',
      description: 'Contact Image Sensor 카메라 전문 제품군. 높은 해상도와 정밀한 이미지 품질을 제공하는 CIS 카메라를 만나보세요.',
      keywords: ['CIS카메라', 'Contact Image Sensor', '산업용카메라', '고해상도카메라']
    },
    '10': {
      name: 'TDI 카메라',
      description: 'Time Delay Integration 카메라로 고속 라인 스캔 검사에 최적화된 제품군입니다.',
      keywords: ['TDI카메라', 'Time Delay Integration', '라인스캔', '고속검사']
    },
    '11': {
      name: 'Line 카메라',
      description: '라인 스캔 카메라로 연속적인 검사 및 측정 애플리케이션에 적합한 제품군입니다.',
      keywords: ['Line카메라', '라인스캔카메라', '연속검사', '측정카메라']
    },
    '12': {
      name: 'Area 카메라',
      description: '에어리어 스캔 카메라로 일반적인 머신비전 애플리케이션에 널리 사용되는 제품군입니다.',
      keywords: ['Area카메라', '에어리어카메라', '일반검사', '머신비전']
    },
    '15': {
      name: '렌즈',
      description: '산업용 머신비전 렌즈 제품군. Large Format, Telecentric, FA 렌즈 등 다양한 종류를 제공합니다.',
      keywords: ['산업용렌즈', 'Large Format렌즈', 'Telecentric렌즈', 'FA렌즈']
    },
    '23': {
      name: '프레임그래버',
      description: '카메라 인터페이스를 위한 프레임그래버 제품군. Camera Link, CoaXPress, GigE 등 다양한 인터페이스를 지원합니다.',
      keywords: ['프레임그래버', 'Camera Link', 'CoaXPress', 'GigE', '카메라인터페이스']
    }
  }

  const currentCategory = categories || '9'
  const categoryInfo = categoryMeta[currentCategory] || categoryMeta['9']
  
  let title = `${categoryInfo.name} - VIREX | 머신비전 전문 제품`
  let description = categoryInfo.description
  let keywords = [...categoryInfo.keywords, 'VIREX', '바이렉스', '머신비전', '산업용카메라']

  if (search) {
    title = `"${search}" 검색결과 - ${categoryInfo.name} | VIREX`
    description = `"${search}" 검색결과입니다. ${categoryInfo.description}`
    keywords = [search, ...keywords]
  }

  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      url: `https://virex.co.kr/products${categories ? `?categories=${categories}` : ''}`,
      siteName: "VIREX",
      images: [
        {
          url: `https://virex.co.kr/img/backgrounds/camera-${currentCategory === '9' ? 'cis' : currentCategory === '10' ? 'tdi' : currentCategory === '11' ? 'line' : currentCategory === '12' ? 'area' : 'cis'}-bg.webp`,
          width: 1200,
          height: 630,
          alt: `${categoryInfo.name} 제품 목록`,
        },
      ],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://virex.co.kr/products${categories ? `?categories=${categories}` : ''}`,
    },
    other: {
      // 구조화된 데이터 (JSON-LD) for Product Catalog
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': `${categoryInfo.name} 제품 목록`,
        'description': categoryInfo.description,
        'url': `https://virex.co.kr/products${categories ? `?categories=${categories}` : ''}`,
        'isPartOf': {
          '@type': 'WebSite',
          'name': 'VIREX',
          'url': 'https://virex.co.kr'
        },
        'mainEntity': {
          '@type': 'OfferCatalog',
          'name': `${categoryInfo.name} 카탈로그`,
          'description': `VIREX ${categoryInfo.name} 제품 전체 목록`,
          'itemListElement': {
            '@type': 'OfferCatalog',
            'name': categoryInfo.name
          }
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
              'name': '제품',
              'item': 'https://virex.co.kr/products'
            },
            {
              '@type': 'ListItem',
              'position': 3,
              'name': categoryInfo.name,
              'item': `https://virex.co.kr/products?categories=${currentCategory}`
            }
          ]
        }
      })
    }
  }
}
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <ProductsContent />
    </Suspense>
  )
}