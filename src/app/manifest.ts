import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VIREX - 머신비전 & 광학 솔루션 전문기업',
    short_name: 'VIREX',
    description: '바이렉스의 B2B 제품 포털에서 2,000개 이상의 제품을 검색하고 비교하세요. 산업용 카메라, 렌즈, 프레임그래버, 조명 등 머신비전 솔루션 전문기업',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#566BDA',
    orientation: 'portrait',
    scope: '/',
    lang: 'ko',
    dir: 'ltr',
    categories: ['business', 'productivity', 'technology'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: '16x16 32x32 48x48',
        type: 'image/x-icon',
        purpose: 'any'
      },
      {
        src: '/common/virex-logo-color.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/common/virex-logo-color.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
    shortcuts: [
      {
        name: '제품 검색',
        short_name: '제품',
        description: '머신비전 제품 검색 및 비교',
        url: '/products',
        icons: [
          {
            src: '/common/virex-logo-color.png',
            sizes: '96x96'
          }
        ]
      },
      {
        name: '회사소개',
        short_name: '회사',
        description: 'VIREX 회사 정보',
        url: '/company/virex',
        icons: [
          {
            src: '/common/virex-logo-color.png',
            sizes: '96x96'
          }
        ]
      },
      {
        name: '다운로드',
        short_name: '자료',
        description: '기술 자료 다운로드',
        url: '/support/download',
        icons: [
          {
            src: '/common/virex-logo-color.png',
            sizes: '96x96'
          }
        ]
      }
    ]
  }
}