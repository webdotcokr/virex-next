# Virex B2B Product Portal

바이렉스의 B2B 제품 포털은 2,000개 이상의 제품에 대한 고성능 필터링 및 검색 기능을 제공하는 Next.js 기반 웹 애플리케이션입니다.

## 🚀 주요 기능

### 사용자 포털
- **고급 제품 검색**: 제품번호, 시리즈명으로 실시간 자동완성 검색
- **다중 파라미터 필터링**: 10개 이상의 파라미터로 AND/OR 조합 필터링
- **제품 상세 페이지**: 사양, 데이터시트, 문의 양식 통합
- **반응형 디자인**: 데스크탑, 태블릿, 모바일 최적화
- **URL 상태 관리**: 필터 상태를 URL에 저장하여 북마크 및 공유 가능

### 관리자 시스템
- **직관적인 CMS**: 비개발자도 쉽게 사용할 수 있는 관리 인터페이스
- **대량 데이터 처리**: CSV 일괄 업로드 및 검증 시스템
- **제품 관리**: 제품 정보 CRUD 및 카테고리 관리
- **문의 관리**: 고객 문의 및 견적 요청 처리

## 🛠 기술 스택

- **프론트엔드**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **백엔드**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **상태 관리**: Zustand
- **데이터 페칭**: SWR
- **UI 컴포넌트**: Radix UI, Lucide React
- **배포**: Vercel

## 📦 설치 및 설정

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd virex-next/my-app
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.example` 파일을 `.env.local`로 복사하고 값을 설정합니다:

```bash
cp .env.example .env.local
```

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Optional configurations
NEXT_PUBLIC_ADMIN_EMAIL=admin@virex.com
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@virex.com
WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json/wp/v2
```

### 4. Supabase 데이터베이스 설정
`supabase-schema.sql` 파일의 내용을 Supabase SQL 에디터에서 실행합니다:

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택 → SQL Editor
3. `supabase-schema.sql` 내용 복사 후 실행

### 5. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

## 📁 프로젝트 구조

```
src/
├── app/                      # Next.js App Router
│   ├── (admin)/             # 관리자 페이지 그룹
│   │   ├── dashboard/       
│   │   └── layout.tsx       
│   ├── (portal)/            # 사용자 포털 그룹
│   │   ├── products/        
│   │   ├── categories/      
│   │   └── layout.tsx       
│   ├── api/                 # API 라우트
│   ├── globals.css          # 전역 스타일
│   └── layout.tsx           # 루트 레이아웃
├── components/              # 공유 UI 컴포넌트
├── domains/                 # 핵심 비즈니스 도메인
│   └── product/
│       ├── components/      # 제품 관련 컴포넌트
│       ├── services/        # 제품 데이터 서비스
│       └── types/           # 제품 타입 정의
├── lib/                     # 공유 라이브러리
│   ├── hooks/              # 커스텀 훅
│   ├── supabase.ts         # Supabase 클라이언트
│   ├── store.ts            # Zustand 스토어
│   └── utils.ts            # 유틸리티 함수
└── types/                  # 전역 타입 정의
```

## 🔧 개발 가이드

### 새 제품 컴포넌트 추가
```typescript
// src/domains/product/components/YourComponent.tsx
import type { Product } from '../types'

interface YourComponentProps {
  product: Product
}

export default function YourComponent({ product }: YourComponentProps) {
  // 컴포넌트 로직
}
```

### 새 서비스 메서드 추가
```typescript
// src/domains/product/services/product-service.ts
export class ProductService {
  static async yourNewMethod(): Promise<YourType> {
    const { data, error } = await supabase
      .from('your_table')
      .select('*')
    
    if (error) throw new Error(error.message)
    return data
  }
}
```

### 새 페이지 추가
```typescript
// src/app/(portal)/your-page/page.tsx
export const metadata = {
  title: 'Your Page - Virex',
}

export default function YourPage() {
  return <div>Your page content</div>
}
```

## 🚀 배포

### Vercel 배포
1. GitHub에 프로젝트 푸시
2. [Vercel Dashboard](https://vercel.com/dashboard)에서 Import
3. 환경 변수 설정
4. 배포 완료

### 환경 변수 (Production)
배포 시 다음 환경 변수들을 설정해야 합니다:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📊 성능 목표

- **페이지 로딩**: P95 기준 2초 이내
- **API 응답**: 300ms 이내
- **Lighthouse 점수**: 90점 이상
- **접근성**: WCAG 2.1 AA 준수

## 🧪 테스트

```bash
# 린트 검사
npm run lint

# 타입 검사
npm run type-check

# 빌드 테스트
npm run build
```

## 📝 주요 특징

### 필터링 시스템
- URL 기반 상태 관리로 공유 및 북마크 가능
- 실시간 필터 결과 업데이트
- 다중 선택 및 AND/OR 조합 지원

### 검색 기능
- 제품번호, 시리즈명 자동완성
- 전체 텍스트 검색 지원
- 최근 검색어 저장

### 관리자 기능
- 직관적인 대시보드
- 대량 데이터 CSV 업로드
- 실시간 문의 관리

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🆘 지원

문제가 발생하거나 궁금한 점이 있으시면:
- Issues 탭에서 버그 리포트나 기능 요청
- 이메일: dev@virex.com

---

Made with ❤️ by Virex Team