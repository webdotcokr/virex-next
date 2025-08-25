import { MetadataRoute } from 'next'

// TODO: 향후 동적 sitemap 구현 시 아래 import 활성화
// import { createClient } from '@/lib/supabase-client'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://virex.co.kr'
  const currentDate = new Date()

  // 정적 페이지들
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/company/virex`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/company/location`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/company/global-partners`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/support/download`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/support/inquiry`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/support/remote`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/news/notice`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/news/media`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ]

  // 카테고리별 제품 페이지들
  const productCategories = [
    { id: '9', name: 'cis', priority: 0.9 },
    { id: '10', name: 'tdi', priority: 0.8 },
    { id: '11', name: 'line', priority: 0.8 },
    { id: '12', name: 'area', priority: 0.8 },
    { id: '13', name: 'invisible', priority: 0.7 },
    { id: '14', name: 'scientific', priority: 0.7 },
    { id: '15', name: 'large-format-lens', priority: 0.8 },
    { id: '16', name: 'telecentric', priority: 0.8 },
    { id: '17', name: 'fa-lens', priority: 0.7 },
    { id: '18', name: '3d-laser-profiler', priority: 0.7 },
    { id: '19', name: '3d-stereo-camera', priority: 0.7 },
    { id: '20', name: 'light', priority: 0.7 },
    { id: '22', name: 'controller', priority: 0.7 },
    { id: '23', name: 'frame-grabber', priority: 0.8 },
    { id: '24', name: 'gige-lan-card', priority: 0.6 },
    { id: '25', name: 'usb-card', priority: 0.6 },
    { id: '26', name: 'cable', priority: 0.5 },
    { id: '27', name: 'accessory', priority: 0.5 },
    { id: '4', name: 'af-module', priority: 0.7 },
    { id: '7', name: 'software', priority: 0.6 },
  ]

  const categoryPages = productCategories.map(category => ({
    url: `${baseUrl}/products?categories=${category.id}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: category.priority,
  }))

  // TODO: 실제 제품 상세 페이지들 (데이터베이스에서 동적으로 가져와야 함)
  // 현재는 예시로 몇 개만 추가
  // 구현 예정: Supabase products 테이블에서 part_number 기반 URL 생성
  // 예: /products/[part_number] 형태로 모든 제품 상세 페이지 자동 생성
  // 참고: 하단 예시 코드 사용하여 비동기 sitemap 생성
  const sampleProductPages = [
    {
      url: `${baseUrl}/products/ARL-22CH-12D`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/products/ARL-36CH-12D`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/products/ARL-44CH-12D`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ]

  // 다운로드 카테고리 페이지들
  const downloadPages = [
    {
      url: `${baseUrl}/support/download/list`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ]

  return [
    ...staticPages,
    ...categoryPages,
    ...sampleProductPages,
    ...downloadPages,
  ]
}

// 향후 개선사항:
// 1. 실제 제품 데이터를 데이터베이스에서 가져와서 동적으로 sitemap 생성
// 2. 뉴스 기사들도 동적으로 추가
// 3. 다운로드 카테고리별 페이지들도 동적으로 추가
// 4. lastModified 날짜를 실제 업데이트 날짜로 설정

// 예시 코드 (추후 구현 시 참고):
/*
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://virex.co.kr'
  
  // 실제 제품 데이터 가져오기
  const { data: products } = await supabase
    .from('products')
    .select('part_number, updated_at')
    .eq('is_active', true)
  
  const productPages = products?.map(product => ({
    url: `${baseUrl}/products/${product.part_number}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) || []

  // 뉴스 기사 데이터 가져오기
  const { data: news } = await supabase
    .from('news')
    .select('id, updated_at')
    .eq('is_published', true)
  
  const newsPages = news?.map(article => ({
    url: `${baseUrl}/news/notice/${article.id}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  })) || []

  return [
    ...staticPages,
    ...categoryPages,
    ...productPages,
    ...newsPages,
  ]
}
*/