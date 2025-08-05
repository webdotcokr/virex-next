export interface WordPressPost {
  id: number;
  date: string;
  link: string;
  title: {
    rendered: string;
  };
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      id: number;
      source_url: string;
      alt_text: string;
    }>;
  };
}

export interface TechInfoItem {
  id: number;
  title: string;
  image: string;
  date: string;
  href: string;
}

class WordPressService {
  private readonly API_BASE_URL = 'https://blog.virex.co.kr/wp-json/wp/v2';
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds

  /**
   * WordPress REST API에서 최신 포스트를 가져옵니다
   */
  async fetchLatestPosts(count: number = 5): Promise<TechInfoItem[]> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/posts?per_page=${count}&_embed&type=post`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; VirexBot/1.0)',
          },
          signal: AbortSignal.timeout(this.REQUEST_TIMEOUT),
        }
      );

      if (!response.ok) {
        throw new Error(`WordPress API returned ${response.status}: ${response.statusText}`);
      }

      const posts: WordPressPost[] = await response.json();
      return this.transformPostsToTechInfoItems(posts);
    } catch (error) {
      console.error('WordPress API Error:', error);
      throw error;
    }
  }

  /**
   * WordPress 포스트 데이터를 TechInfoItem 형식으로 변환
   */
  private transformPostsToTechInfoItems(posts: WordPressPost[]): TechInfoItem[] {
    return posts.map(post => ({
      id: post.id,
      title: this.decodeHtmlEntities(post.title.rendered),
      image: this.extractFeaturedImage(post),
      date: post.date.split('T')[0], // ISO date to YYYY-MM-DD
      href: post.link
    }));
  }

  /**
   * WordPress 포스트에서 featured image URL 추출
   */
  private extractFeaturedImage(post: WordPressPost): string {
    // Try to get image from _embedded data
    if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
      return post._embedded['wp:featuredmedia'][0].source_url;
    }

    // Fallback to default image
    return '/img/main/noImg.jpg';
  }

  /**
   * HTML 엔티티 디코딩 (예: &amp; → &, &#8217; → ')
   */
  private decodeHtmlEntities(text: string): string {
    const entityMap: { [key: string]: string } = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#039;': "'",
      '&#8217;': "'",
      '&#8220;': '"',
      '&#8221;': '"',
      '&#8211;': '–',
      '&#8212;': '—',
    };

    return text.replace(/&[#\w]+;/g, (entity) => {
      return entityMap[entity] || entity;
    });
  }

  /**
   * 유니코드 이스케이프 문자를 실제 문자로 변환 (\uXXXX → 실제 문자)
   */
  private decodeUnicodeEscapes(text: string): string {
    return text.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
      return String.fromCharCode(parseInt(code, 16));
    });
  }
}

export const wordPressService = new WordPressService();