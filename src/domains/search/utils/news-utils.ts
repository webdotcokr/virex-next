import type { NewsResult } from '../services/search-service'

/**
 * 뉴스 아이템의 category_id에 따라 올바른 URL을 생성하는 함수
 */
export function getNewsUrl(newsItem: NewsResult): string {
  if (newsItem.category_id === 1) {
    // 공지사항
    return `/news/notice/${newsItem.id}`
  } else if (newsItem.category_id === 2) {
    // 미디어
    return `/news/media/${newsItem.id}`
  }
  
  // 기본값 (안전장치) - category_id가 null이거나 예상하지 못한 값일 경우
  // 대부분의 뉴스가 공지사항이므로 기본값을 notice로 설정
  return `/news/notice/${newsItem.id}`
}

/**
 * 뉴스 카테고리 ID를 카테고리명으로 변환하는 함수
 */
export function getNewsCategoryName(categoryId: number | null): string {
  if (categoryId === 1) {
    return '공지사항'
  } else if (categoryId === 2) {
    return '미디어'
  }
  return '뉴스'
}

/**
 * 뉴스 카테고리 ID를 카테고리 경로로 변환하는 함수
 */
export function getNewsCategoryPath(categoryId: number | null): string {
  if (categoryId === 1) {
    return '/news/notice'
  } else if (categoryId === 2) {
    return '/news/media'
  }
  return '/news/notice'
}