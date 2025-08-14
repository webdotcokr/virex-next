import { NextResponse } from 'next/server';
import { wordPressService, TechInfoItem } from '@/lib/wordpress-service';

// Fallback data (기존 DB 데이터 시뮬레이션)
const FALLBACK_TECH_INFO: TechInfoItem[] = [
  {
    id: 1,
    title: 'Machine Vision의 최신 기술 동향',
    image: '/img/main/noImg.jpg',
    date: '2024-12-15',
    href: 'https://blog.virex.co.kr/tech-trends-2024'
  },
  {
    id: 2,
    title: '산업용 카메라 선택 가이드',
    image: '/img/main/noImg.jpg',
    date: '2024-12-10',
    href: 'https://blog.virex.co.kr/camera-selection-guide'
  },
  {
    id: 3,
    title: '3D 비전 시스템 구축 사례',
    image: '/img/main/noImg.jpg',
    date: '2024-12-05',
    href: 'https://blog.virex.co.kr/3d-vision-case-study'
  },
  {
    id: 4,
    title: 'LED 조명 시스템 최적화 방법',
    image: '/img/main/noImg.jpg',
    date: '2024-11-28',
    href: 'https://blog.virex.co.kr/led-lighting-optimization'
  },
  {
    id: 5,
    title: '머신비전용 렌즈 성능 비교',
    image: '/img/main/noImg.jpg',
    date: '2024-11-20',
    href: 'https://blog.virex.co.kr/lens-performance-comparison'
  }
];

export async function GET() {
  try {
    // WordPress API에서 최신 포스트 시도
    const techInfoItems = await wordPressService.fetchLatestPosts(5);
    
    console.log('WordPress API 성공:', techInfoItems.length, '개 포스트 로드');
    
    return NextResponse.json({
      success: true,
      source: 'wordpress',
      data: techInfoItems
    });
    
  } catch (error) {
    console.error('WordPress API 실패, 폴백 데이터 사용:', error);
    
    // WordPress API 실패 시 폴백 데이터 반환
    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: FALLBACK_TECH_INFO,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}