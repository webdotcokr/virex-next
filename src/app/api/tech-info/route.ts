import { NextResponse } from 'next/server';
import { wordPressService, TechInfoItem } from '@/lib/wordpress-service';

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