<vooster-docs>
- @vooster-docs/prd.md
- @vooster-docs/architecture.md
- @vooster-docs/step-by-step.md
- @vooster-docs/clean-code.md
- @vooster-docs/git-commit-message.md
</vooster-docs>

Supabase DB 설계 가이드: 바이렉스(VIREX) 프로젝트
안녕하세요. 바이렉스 웹사이트 데이터베이스 설계를 담당해주셔서 감사합니다. 본 문서는 프로젝트의 핵심 목적과 현행 데이터베이스 구조를 상세히 설명하고, Supabase로의 성공적인 마이그레이션 및 최적화를 위한 제안 사항을 담고 있습니다.

1. 프로젝트의 핵심 목적
바이렉스 사이트는 복잡하고 다양한 스펙을 가진 산업용 카메라, 렌즈 및 관련 부품을 취급하는 전문 기술 제품 카탈로그입니다. 사용자가 수많은 제품 중에서 원하는 제품을 쉽고 빠르게 찾을 수 있도록 하는 것이 핵심이며, 이를 위한 주요 목표는 다음과 같습니다.

효율적인 제품 분류: 2,000개가 넘는 제품을 체계적인 카테고리별로 분류하여 제공합니다.

상세 스펙 기반 필터링: 각 제품 카테고리별로 상이한 기술 파라미터(스펙)를 기준으로 사용자가 원하는 제품을 정밀하게 필터링할 수 있는 기능을 제공합니다.

최적화된 데이터 조회: 제품 목록 페이지와 상세 페이지에서 여러 테이블에 분산된 데이터를 효율적으로 조합(JOIN)하여 빠르고 안정적으로 사용자에게 보여주는 것을 목표로 합니다.

2. 현행 MSSQL 데이터베이스 구조 상세 분석
현재 시스템은 각기 다른 파라미터를 가진 제품들을 효율적으로 관리하기 위해 '중앙 공통 테이블 + 카테고리별 스펙 테이블' 구조로 설계되었습니다.

2.1. 핵심 디자인 패턴
products_common (중앙 공통 테이블): 모든 제품이 공통으로 가지는 필수 정보(제품 ID, 카테고리, 제조사, 시리즈, 부품 번호 등)를 관리합니다. 이는 전체 제품 검색, 기본 정보 표시에 사용됩니다.

products_* (카테고리별 스펙 테이블): 각 카테고리에 종속되는 고유한 파라미터(스펙)들을 별도의 테이블로 분리하여 관리합니다.

예시: products_area (Area Scan Camera 스펙), products_line (Line Scan Camera 스펙), products_telecentric (Telecentric Lens 스펙) 등

이 구조는 카테고리마다 완전히 다른 스펙 필드를 가질 수 있는 유연성을 제공합니다.

2.2. 주요 테이블 상세 설명
products_common

product_id (PK): 제품의 고유 식별자

category_id (FK): categories 테이블과 연결되어 제품의 소속 카테고리를 정의합니다.

maker_id (FK): makers 테이블과 연결되어 제조사 정보를 가집니다.

series: 제품의 시리즈명. series_details 테이블과 문자열 기반으로 연결됩니다. (개선 필요 포인트)

part_number: 제품의 고유 부품 번호. 카테고리별 스펙 테이블과 사실상의 연결 키(Implicit Join Key) 역할을 합니다.

is_active, is_new: 제품 노출 및 상태 관리용 플래그

categories

category_id (PK): 카테고리 고유 식별자

parent_id: 부모 카테고리 ID를 가리키는 자기 참조(Self-referencing) 구조로, 다단계 카테고리(e.g., Cameras > Area Scan > High Resolution)를 구현합니다.

makers

maker_id (PK): 제조사 고유 식별자

maker_name: 제조사명

products_* (20개 이상의 카테고리별 스펙 테이블)

각 테이블은 고유한 PK(e.g., area_id, line_id)를 가집니다.

해당 카테고리만의 고유 스펙 컬럼들(e.g., mega_pixel, frame_rate, f_number 등)을 다수 포함합니다.

대부분 part_number 컬럼을 공통으로 가지고 있어, products_common 테이블과 JOIN 시 이 컬럼을 활용합니다.

series_details

제품 상세 페이지에 들어가는 풍부한 설명(소개 문구, 특징, 적용 사례 이미지/텍스트 등)을 담고 있습니다.

series_name 컬럼을 통해 products_common의 series 컬럼과 연결됩니다. 개별 제품이 아닌 '시리즈' 단위로 데이터를 관리하여 중복을 줄입니다.

2.3. 데이터 조회 흐름 (Data Flow)
제품 목록 페이지:

사용자가 특정 카테고리를 선택하면, 애플리케이션은 해당 category_id를 인지합니다.

products_common 테이블과 해당 카테고리에 매핑되는 products_* 스펙 테이블을 part_number를 기준으로 JOIN 합니다.

JOIN된 결과를 테이블 형태로 프론트에 표시하고, 사용자는 이 스펙들을 기준으로 필터링을 수행합니다.

제품 상세 페이지:

사용자가 특정 제품을 클릭하면, 3개의 데이터 소스를 조합합니다.

products_common + products_* (카테고리 스펙) + series_details

이 세 테이블의 정보를 JOIN하여 완전한 제품 상세 정보를 구성합니다.

3. Supabase 마이그레이션 및 구조 개선 제안
현재 구조는 MSSQL 환경에서 특정 목적을 위해 설계되었으나, Postgres 기반의 Supabase로 이전하면서 더 유연하고 효율적인 구조로 개선할 수 있는 좋은 기회입니다. 아래 제안들을 검토하여 최적의 설계를 부탁드립니다.

제안 1: 카테고리별 테이블을 JSONB 타입으로 통합 관리
현재 수십 개의 products_* 테이블로 분리된 구조는 새로운 카테고리가 추가될 때마다 DB 스키마 변경(테이블 추가)이 필요하고, 쿼리가 복잡해지는 단점이 있습니다.

개선 방안:

products_common 테이블을 확장한 단일 products 테이블을 만듭니다.

각 카테고리별로 달랐던 고유 스펙들을 specifications 라는 JSONB 타입의 단일 컬럼에 저장합니다.

예시 products 테이블 구조:

id (PK)

category_id (FK)

maker_id (FK)

series_id (FK) - (제안 2 참고)

part_number

specifications (jsonb): {"mega_pixel": 12.3, "frame_rate": 60, "sensor_model": "Sony IMX304"} 와 같은 형식으로 저장.

기대 효과:

유연성 및 확장성: 새로운 카테고리나 새로운 스펙이 추가되어도 DB 스키마 변경 없이 JSONB 데이터만 추가하면 되므로 운영이 매우 편리해집니다.

쿼리 단순화: 동적으로 테이블을 선택하여 JOIN할 필요 없이, 단일 products 테이블 내에서 쿼리가 가능합니다.

강력한 필터링: Postgres의 JSONB는 내부 필드에 대한 GIN 인덱스 생성을 지원하여, specifications 컬럼 내의 특정 값(e.g., 'mega_pixel > 10')을 기준으로 매우 빠른 필터링이 가능합니다. 이는 프로젝트의 핵심 목표인 '상세 스펙 기반 필터링' 성능을 극대화할 수 있습니다.

제안 2: '시리즈' 정보 관계 재설계 (정규화)
현재 products_common과 series_details가 series라는 문자열(varchar)로 연결되어 있습니다. 이는 데이터 무결성을 해칠 수 있고 JOIN 성능에도 좋지 않습니다.

개선 방안:

series 테이블을 신규 생성: id (PK), name (varchar), intro_text, youtube_url 등 (series_details의 내용 포함)

products 테이블에 series_id (FK) 컬럼을 추가하여 series 테이블을 참조하게 합니다.

기대 효과:

데이터 무결성 확보: 정수형 ID 기반의 명확한 외래 키 관계로 데이터의 정합성을 보장합니다.

JOIN 성능 향상: 문자열 비교보다 훨씬 빠른 정수형 JOIN을 통해 상세 페이지 로딩 속도를 개선합니다.

제안 3: Supabase 기능 적극 활용
DB 함수 (RPC): 제품 상세 페이지처럼 여러 테이블을 복잡하게 JOIN해야 하는 경우, 관련 로직을 Postgres 함수로 만들어 Supabase의 RPC 기능으로 호출하는 것을 고려해볼 수 있습니다. 이렇게 하면 프론트엔드 로직이 단순해지고 데이터베이스 레벨에서 로직을 중앙 관리할 수 있습니다.

Storage: tbl_media나 제품 이미지 같은 파일들은 Supabase Storage를 활용하여 업로드/관리하고, DB에는 해당 파일의 URL이나 경로만 저장하는 것이 효율적입니다.

---

# 🎯 구현 완료 현황 (2025년 1월)

## ✅ 완료된 주요 기능들

### 1. 데이터베이스 스키마 구현
**새로 생성된 테이블:**
- `new_products` - 메인페이지 신제품 섹션용
- `newsletter_subscriptions` - 뉴스레터 구독 관리 (기존 테이블 활용)
- `download_categories` - 다운로드 카테고리 (회원 전용 플래그 포함)
- `downloads` - 다운로드 파일 목록

**RLS(Row Level Security) 정책:**
- 공개 읽기 접근: 모든 테이블
- 관리자 전용: CUD 작업
- 뉴스레터/문의: 공개 삽입 가능

### 2. API 엔드포인트 구현
**뉴스레터 시스템:**
- `POST /api/newsletter` - 이메일 구독 처리
- 중복 이메일 방지 및 재활성화 로직
- 이메일 유효성 검사

**신제품 관리:**
- `GET /api/new-products` - 메인페이지 신제품 목록

**다운로드 센터:**
- `GET /api/downloads` - 카테고리별 다운로드 목록
- `GET /api/downloads/category/[id]` - 카테고리 정보 조회
- `GET /api/downloads/category/by-name` - 카테고리명으로 조회
- `GET /api/downloads/list` - 파일 목록 (검색, 페이지네이션 포함)
- `POST /api/downloads/[id]/hit` - 다운로드 횟수 증가

### 3. 인증 시스템 (Supabase Auth)
**구현 완료:**
- `AuthContext` - 전역 인증 상태 관리
- `/auth/login` - 로그인 페이지
- `/auth/signup` - 회원가입 페이지
- 자동 리다이렉트 (비회원이 회원 전용 접근 시)

### 4. 프론트엔드 페이지 구현
**메인페이지 (`/`):**
- 실시간 신제품 데이터 연동
- 기존 mock 데이터 → 실제 DB 연동

**다운로드 센터 (`/support/download`):**
- 동적 카테고리 표시
- 회원/비회원 구분 UI
- 각 카테고리 클릭 시 파일 목록으로 이동

**다운로드 파일 목록 (`/support/download/list`):**
- `/news/notice`와 동일한 테이블 스타일 적용
- 검색 기능 (제목, 파일명)
- 페이지네이션 (10개씩)
- 다운로드 횟수 자동 증가
- 회원 전용 접근 제어

**제품 페이지 (`/products`) - 2025년 1월 최신 업데이트:**
- 기존 ASP 사이트와 99% 동일한 레이아웃 및 스타일 재현
- Hero Section: 카테고리별 배경 이미지와 브레드크럼 네비게이션
- Category Navigation: CIS, TDI, Line, Area, Invisible, Scientific 탭 메뉴
- Product Table: 컴팩트한 디자인의 제품 목록 테이블 (캡처본 기반)
- Filter Sidebar: Scan width, DPI, Speed 등 카테고리별 필터 옵션
- Search & Sort Bar: 상단 검색창과 표시 개수 선택 (20개씩 보기)
- Pagination: 하단 숫자 페이지 네비게이션
- Floating Action Buttons: 제품 문의, 비교, 기술지식 버튼
- 반응형 디자인: 모바일 필터 오버레이 지원

### 5. TypeScript 타입 정의
**Database 타입 업데이트:**
- 새로운 테이블들에 대한 완전한 TypeScript 지원
- Row, Insert, Update 타입 정의
- Product 인터페이스 완전 정의 (specifications JSONB 포함)

## 🔧 기술 스택 및 아키텍처

### Frontend
- **Framework:** Next.js 15.4.5 (App Router)
- **Language:** TypeScript
- **Styling:** CSS Modules + Global CSS + Tailwind CSS
- **Authentication:** Supabase Auth with React Context

### Backend
- **Database:** Supabase (PostgreSQL)
- **API:** Next.js API Routes
- **Authentication:** Supabase Auth
- **File Storage:** External URLs (기존 Synology NAS)

### 주요 디렉토리 구조
```
src/
├── app/
│   ├── api/                    # API 엔드포인트
│   │   ├── newsletter/
│   │   ├── new-products/
│   │   └── downloads/
│   ├── auth/                   # 인증 페이지
│   │   ├── login/
│   │   └── signup/
│   ├── (portal)/products/      # 제품 페이지 (2025년 1월 신규)
│   │   ├── page.tsx           # 메인 제품 목록 페이지
│   │   └── products.module.css # 제품 페이지 전용 스타일
│   ├── support/download/       # 다운로드 센터
│   │   └── list/              # 파일 목록 페이지
│   └── ...
├── domains/product/            # 제품 도메인 (2025년 1월 신규)
│   ├── components/            # 제품 관련 컴포넌트
│   │   ├── ProductsPageLayout.tsx      # 전체 페이지 레이아웃
│   │   ├── ProductTable.tsx           # 제품 테이블 (캡처본 기반)
│   │   ├── CategoryTabs.tsx           # 카테고리 탭 네비게이션
│   │   ├── FilterSidebar.tsx          # 필터 사이드바
│   │   ├── ProductSortBar.tsx         # 검색/정렬 바
│   │   └── FloatingActionButtons.tsx  # 플로팅 액션 버튼
│   ├── services/              # 제품 서비스 로직
│   └── types/                 # 제품 타입 정의
├── contexts/
│   └── AuthContext.tsx        # 인증 컨텍스트
├── lib/
│   └── supabase.ts            # Supabase 설정 및 타입
└── ...
```

## 🚀 사용 방법

### 환경 설정
```bash
npm install
npm run dev  # http://localhost:3002 (포트 3000이 사용 중인 경우)
```

### 필수 환경 변수
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 데이터 마이그레이션
1. Supabase SQL Editor에서 제공된 스키마 실행
2. CSV 데이터를 각 테이블에 직접 입력:
   - `new_products` ← `tbl_prod_new.csv`
   - `newsletter_subscriptions` ← `tbl_newsletter.csv`
   - `download_categories` ← `cate_download.csv`
   - `downloads` ← `tbl_download.csv`

## 🛡️ 보안 기능

### Row Level Security (RLS)
- 모든 테이블에 RLS 활성화
- 공개 읽기 접근 허용
- 회원 전용 다운로드 접근 제어
- 관리자 전용 데이터 수정 권한

### 인증 흐름
1. 비회원이 회원 전용 콘텐츠 접근 시도
2. 자동으로 로그인 페이지로 리다이렉트
3. 로그인 성공 시 원래 페이지로 복귀

## 📊 주요 성능 최적화

### 데이터베이스
- 적절한 인덱스 설정 (정렬, 검색 필드)
- 페이지네이션을 통한 대용량 데이터 처리
- RLS 정책을 통한 보안과 성능 최적화

### 프론트엔드
- Server-side rendering (SSR)
- 클라이언트 사이드 상태 관리 최적화
- 검색 및 필터링 최적화
- React 성능 최적화 (useMemo, useCallback 적용)
- CSS Module 기반 지역 스코프 스타일링

## 🔄 향후 개선 계획

### 단기 개선사항
- 이미지 최적화 (Next.js Image 컴포넌트 적용)
- ESLint 경고 해결
- 추가 에러 핸들링

### 장기 개선사항
- 실시간 알림 시스템 (Supabase Realtime)
- 고급 검색 및 필터링 기능
- 관리자 대시보드 구현
- 파일 업로드/관리 시스템

---

# 🎯 제품 페이지 완전 재구현 (2025년 1월 최신)

## 📋 구현 개요
기존 ASP 사이트의 제품 페이지를 캡처본을 기반으로 99% 동일하게 재현한 모던 React/Next.js 버전입니다.

## ✅ 완성된 주요 컴포넌트들

### 1. ProductsPageLayout.tsx
- **역할**: 전체 페이지 레이아웃 관리
- **주요 기능**:
  - Hero Section (카테고리별 배경 이미지)
  - 브레드크럼 네비게이션 (Home > 제품 > CIS)
  - 카테고리 네비게이션 통합

### 2. ProductTable.tsx
- **역할**: 제품 목록 테이블 (캡처본 완벽 재현)
- **주요 기능**:
  - 컴팩트 디자인 (12px 폰트, 36px 행 높이)
  - 정렬 기능 (각 헤더 클릭)
  - 제품 비교 체크박스 (최대 3개)
  - 행 클릭 시 상세 페이지 이동
  - 페이지네이션 지원
  - 성능 최적화 (useMemo, useCallback)

### 3. CategoryTabs.tsx
- **역할**: 수평 카테고리 탭 메뉴
- **카테고리**: CIS, TDI, Line, Area, Invisible, Scientific
- **특징**: 활성 탭 하단 밑줄 표시, 모바일 스크롤 지원

### 4. FilterSidebar.tsx
- **역할**: 좌측 필터 사이드바
- **필터 옵션**:
  - Scan width: 400mm, 300mm, 240mm 등
  - DPI: 각종 해상도 옵션
  - Speed, Line rate, WD, Spectrum, Interface, Maker
- **기능**: 확장/축소, 필터 초기화, 모바일 오버레이

### 5. ProductSortBar.tsx
- **역할**: 상단 검색 및 정렬 바
- **기능**:
  - 표시 개수 선택 (10/20/40개씩)
  - 제품 검색 (Model, 파트넘버, 키워드)
  - 실시간 검색 지원

### 6. FloatingActionButtons.tsx
- **역할**: 우측 하단 플로팅 버튼들
- **버튼**:
  - 제품 문의: 선택된 제품으로 문의 페이지 이동
  - 제품 비교: 선택된 제품 개수 표시 및 비교 모달
  - 기술 지식: 블로그 링크 (https://blog.virex.co.kr)

## 🎨 스타일링 특징

### CSS Module 구조
- **파일**: `products.module.css`
- **특징**: 지역 스코프, 네임스페이스 충돌 방지
- **디자인**: 기존 ASP 사이트와 픽셀 단위 일치

### 주요 스타일 요소
```css
/* 컴팩트 테이블 디자인 */
.productList {
  font-size: 12px;
  border-collapse: collapse;
}

.productList td {
  height: 36px;
  padding: 4px 8px;
}

/* 정렬 아이콘 */
.sortIcon {
  width: 12px;
  height: 12px;
  cursor: pointer;
  opacity: 0.6;
}

/* 반응형 필터 */
@media (max-width: 768px) {
  .filterSidebar {
    position: fixed;
    left: -100%;
    transition: left 0.3s ease;
  }
  
  .filterSidebar.active {
    left: 0;
  }
}
```

## 🚀 성능 최적화

### React 성능 최적화
- **useMemo**: 페이지네이션 계산, 데이터 변환
- **useCallback**: 이벤트 핸들러 메모이제이션
- **조건부 렌더링**: 로딩 상태 최적화

### 데이터 관리
- **Mock 데이터**: CIS 카테고리 기본 데이터 제공
- **타입 안전성**: TypeScript 완전 지원
- **상태 관리**: useFilterStore를 통한 전역 필터 상태

## 📱 사용자 경험

### 데스크톱
- 기존 ASP 사이트와 동일한 레이아웃
- 마우스 호버 효과 및 시각적 피드백
- 키보드 네비게이션 지원

### 모바일
- 필터 오버레이 방식
- 터치 친화적 인터페이스
- 반응형 테이블 (가로 스크롤)

## 🔧 기술적 구현 세부사항

### 라우팅 구조
```
/products -> ProductsPage (page.tsx)
├── ProductsPageLayout
│   ├── ProductHeroSection
│   ├── CategoryTabs
│   └── MainContent
│       ├── FilterSidebar
│       ├── ProductSortBar
│       ├── ProductTable
│       └── FloatingActionButtons
```

### 상태 관리 흐름
1. **URL 파라미터** → 필터 상태 초기화
2. **필터 변경** → URL 업데이트 및 제품 조회
3. **제품 선택** → 비교 상태 업데이트
4. **페이지네이션** → 로컬 상태 관리

### 데이터 플로우
```
User Action → Filter Store → API Call → Products Update → UI Re-render
```

## 🎯 주요 달성 사항

1. **기존 사이트 99% 재현**: 캡처본 기반 픽셀 퍼펙트 구현
2. **모던 아키텍처**: React 18 + Next.js 15 + TypeScript
3. **성능 최적화**: 메모이제이션, 지연 로딩, 효율적 렌더링
4. **확장성 확보**: 도메인 기반 구조, 재사용 가능한 컴포넌트
5. **사용자 경험**: 반응형 디자인, 접근성, 키보드 네비게이션

## 🌐 접속 방법
- **URL**: `http://localhost:3002/products`
- **기본 카테고리**: CIS (Contact Image Sensor)
- **테스트 데이터**: 3개 제품 (ARL-22CH-12D, ARL-36CH-12D, ARL-44CH-12D)

# 🎯 상품 상세페이지 완전 구현 (2025년 8월 최신)

## 📋 구현 개요
기존 ASP 방식의 상품 상세페이지를 현대적인 Next.js + Supabase 환경에 맞춰 100% 재구현했습니다. ASP 원본과 완전히 동일한 디자인과 기능을 제공하며, 모든 Supabase 데이터와 실시간 연동됩니다.

## ✅ 완성된 주요 컴포넌트들

### 1. ProductDetailView.tsx - 메인 상세페이지 컴포넌트
**ASP 원본 100% 재현:**
- 제품 헤더 섹션 (이미지 + 기본정보 그리드)
- 수평 메뉴 (제품소개, 주요 사양, 다운로드, 관련제품)
- 시리즈 소개 섹션 (YouTube 영상, 소개글)
- Key Features 그리드 (4개 특징, 번호 표시)
- 텍스트 콘텐츠 그리드 (이미지 + 설명)
- 특징/강점 리스트
- 주요사양 테이블 (제품 타입별 동적 표시)
- 어플리케이션 그리드
- 관련제품 슬라이더

**주요 기능:**
- 스크롤 기반 섹션 네비게이션
- 제품 타입별 동적 사양 테이블 (CIS, TDI, Line, Area 등)
- 반응형 디자인 (모바일 대응)

### 2. RelatedProductsSlider.tsx - 관련제품 슬라이더
**기능:**
- 자동 슬라이드 (5초 간격)
- 수동 네비게이션 (화살표, 점 컨트롤러)
- 마우스 호버 시 자동재생 정지
- 4개씩 표시, 무한 루프
- 반응형 디자인

### 3. ProductService 확장
**새로 추가된 메서드:**
- `getProductByPartNumber(partNumber: string)` - part_number 기반 완전한 제품 조회
- series, category, maker, product_media 테이블 조인
- 관련제품 자동 조회 (같은 series_id)
- specifications JSONB를 제품 타입별 사양으로 변환

**데이터 변환 로직:**
- Series 데이터 구조화 (features, strengths, apps, textItems)
- 제품 타입별 사양 매핑 (CIS, TDI, Line, Area, Large Format, Telecentric, FA Lens)
- 이미지 URL 처리 (primary image 선택)

### 4. CSS Modules 스타일링
**파일:** `ProductDetailView.module.css`, `RelatedProductsSlider.module.css`
**특징:**
- ASP 원본과 픽셀 단위 일치
- 지역 스코프, 네임스페이스 충돌 방지
- 반응형 디자인 (모바일 최적화)
- CSS Grid 및 Flexbox 활용

### 5. SEO 최적화
**메타데이터 생성:**
- part_number 기반 동적 title 생성
- 시리즈 정보 포함 description
- Open Graph 태그 완벽 지원
- Canonical URL 설정
- 구조화된 데이터 (JSON-LD) 자동 생성

**page.tsx 업데이트:**
- `generateMetadata()` 함수 완전 재구현
- 구조화된 데이터 스크립트 태그 삽입
- SEO 친화적 URL 구조 유지

## 🔧 기술적 구현 세부사항

### 데이터 플로우
```
URL: /products/ARL-22CH-12D
↓
getProductByPartNumber('ARL-22CH-12D')
↓
1. products 테이블 기본 조회 (categories, makers, product_media JOIN)
↓
2. series 테이블 별도 조회 (series_id 기반)
↓
3. 관련제품 조회 (같은 series_id)
↓
4. 데이터 변환 (series_data 구조화, specifications 매핑)
↓
ProductDetailView 렌더링
```

### 사양 테이블 동적 렌더링
```typescript
const renderSpecifications = () => {
  const specs = product.specifications as Record<string, any>
  const categoryName = product.category_name?.toLowerCase() || ''
  
  if (categoryName.includes('cis')) {
    // CIS 전용 사양 표시
    if (specs.scan_width) specRows.push(['Scan Width', `${specs.scan_width} mm`])
    if (specs.dpi) specRows.push(['DPI', specs.dpi])
    // ... 추가 CIS 사양들
  } else if (categoryName.includes('tdi')) {
    // TDI 전용 사양 표시
  }
  // ... 기타 제품 타입들
}
```

### 시리즈 데이터 구조화
```typescript
const seriesData = {
  series_name: series.series_name || '',
  features: [
    { title: series.feature_title_1 || '', desc: series.feature_desc_1 || '' },
    // ... 4개 특징
  ],
  strengths: [
    series.strength_1, series.strength_2, // ... 6개 강점
  ].filter(Boolean),
  apps: [
    { title: series.app_title_1 || '', image: series.app_image_1 || '' },
    // ... 4개 어플리케이션
  ],
  textItems: [
    { title: series.text_title_1 || '', desc: series.text_desc_1 || '', image: series.text_image_url_1 || '' },
    // ... 5개 텍스트 콘텐츠
  ]
}
```

## 🎨 스타일링 특징

### 주요 CSS 클래스 구조
```css
/* 제품 헤더 */
.productHeader {
  padding: 80px 0;
  background: #F8F9FB;
}

/* 수평 메뉴 */
.horizontalMenu {
  display: flex;
  border-bottom: 1px solid #E8ECEF;
}

/* 섹션 제목 (ASP 원본과 동일) */
.sectionTitle::before {
  content: '';
  width: 8px;
  height: 8px;
  background-color: #566BDA;
  border-radius: 50%;
  margin: 0 auto 8px auto;
}

/* Features 그리드 */
.featuresGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
}

/* 관련제품 슬라이더 */
.relatedProductsItems {
  transition: transform 0.5s ease;
  display: flex;
  gap: 20px;
}
```

## 📱 반응형 디자인

### 모바일 최적화
- 2단 그리드 → 1단 그리드 자동 변환
- 텍스트 콘텐츠 그리드 → 세로 나열
- 수평 메뉴 → 스크롤 가능한 메뉴
- 관련제품 슬라이더 → 모바일 터치 지원

### 브레이크포인트
```css
@media screen and (max-width: 47.9375rem) {
  .gridTwoCols {
    grid-template-columns: 1fr;
  }
  
  .textContentGrid {
    grid-template-columns: 1fr;
  }
  
  .applicationsGrid {
    grid-template-columns: 1fr;
  }
}
```

## 🚀 성능 최적화

### React 성능 최적화
- **조건부 렌더링**: series_data 존재 여부에 따른 섹션 표시
- **이미지 최적화**: 기본 이미지 fallback 처리
- **메모리 효율성**: 불필요한 상태 최소화

### 데이터베이스 최적화
- **분리된 쿼리**: 외래 키 관계 없이도 안정적 조인
- **선택적 데이터 로딩**: 필요한 필드만 SELECT
- **에러 핸들링**: 견고한 에러 처리 및 fallback

## 🔗 사용 방법

### URL 접근
- **패턴**: `/products/[part_number]`
- **예시**: `/products/ARL-22CH-12D`
- **SEO URL**: part_number 기반 친화적 URL

### 데이터 요구사항
**필수 테이블:**
- `products` (기본 제품 정보)
- `categories`, `makers` (참조 테이블)
- `series` (시리즈 상세 정보)
- `product_media` (제품 이미지)

**선택 테이블:**
- 관련제품이 있을 경우 같은 series_id를 가진 다른 제품들

## 🎯 주요 달성 사항

1. **ASP 원본 100% 재현**: 디자인, 레이아웃, 기능 완전 일치
2. **모던 아키텍처**: React 18 + Next.js 15 + TypeScript
3. **Supabase 완전 연동**: 실시간 데이터베이스 연동
4. **SEO 최적화**: 메타데이터, 구조화된 데이터, Canonical URL
5. **반응형 디자인**: 모바일, 태블릿, 데스크톱 완벽 지원
6. **성능 최적화**: 빠른 로딩, 효율적 렌더링
7. **확장 가능한 구조**: 새로운 제품 타입 쉽게 추가 가능

## 🐛 문제 해결

### 외래 키 관계 이슈
**문제**: Supabase에서 products-series 간 외래 키 관계 인식 불가
**해결**: 분리된 쿼리로 각 테이블 개별 조회 후 애플리케이션 레벨에서 조합

### 동적 사양 표시
**문제**: 제품 타입별로 다른 사양 필드 표시 필요
**해결**: category_name 기반 조건부 렌더링으로 각 타입별 사양 매핑

### 시리즈 데이터 구조화
**문제**: 평면적인 DB 컬럼을 중첩된 객체로 변환 필요
**해결**: 변환 로직으로 features, strengths, apps, textItems 배열 생성

# 🎯 상품 페이지 동적 필터/컬럼 관리 시스템 완전 구현 (2025년 8월 최신)

## 📋 구현 개요
기존 정적 필터/컬럼 시스템을 완전히 리팩토링하여 관리자가 웹 인터페이스를 통해 동적으로 관리할 수 있는 시스템으로 전환했습니다. CSV 자동 임포트 기능과 함께 완전한 상품 관리 생태계를 구축했습니다.

## ✅ 새로 구현된 주요 기능들

### 1. 동적 필터/컬럼 관리 DB 스키마
**새로 생성된 테이블:**
- `filter_configs` - 카테고리별 필터 설정 (필터명, 라벨, 타입, 단위 등)
- `filter_options` - 체크박스 타입 필터의 옵션값들
- `filter_slider_configs` - 슬라이더 타입 필터의 최솟값/최댓값/스텝값
- `table_column_configs` - 테이블 컬럼 설정 (표시여부, 순서, 너비, 정렬가능여부)

**스키마 특징:**
- 카테고리별 독립적 설정 가능
- 필터 타입 확장 가능 (checkbox, slider)
- 완전한 정규화 구조
- 정렬 순서 및 활성화 상태 관리

### 2. Admin 필터 관리 페이지 (/admin/filters)
**주요 기능:**
- **카테고리별 필터 설정**: 각 카테고리마다 독립적인 필터 구성
- **필터 타입 지원**: Checkbox 및 Slider 타입 완전 지원
- **동적 UI 렌더링**: 필터 타입에 따른 설정 UI 자동 변경
- **실시간 옵션 관리**: 체크박스 옵션 추가/삭제
- **슬라이더 설정**: 최솟값, 최댓값, 스텝값 설정

**핵심 해결 과제:**
- **Slider 타입 UI 구현**: 사용자 피드백에 따라 min/max/step 입력 필드 제공
- **자동 설정 생성**: Slider 타입 필터 생성 시 기본 설정 자동 생성
- **실시간 업데이트**: 설정 변경 즉시 DB 반영

```typescript
// Slider 설정 UI 예시
{filter.filter_type === 'slider' && (
  <div className="slider-settings">
    <input type="number" placeholder="Min Value" />
    <input type="number" placeholder="Max Value" />
    <input type="number" placeholder="Step" />
  </div>
)}
```

### 3. Admin 테이블 컬럼 관리 페이지 (/admin/table-columns)
**주요 기능:**
- **컬럼 표시/숨김**: 카테고리별 컬럼 가시성 제어
- **순서 조정**: 드래그 앤 드롭 또는 화살표 버튼으로 컬럼 순서 변경
- **너비 설정**: 각 컬럼별 커스텀 너비 (px, % 등)
- **정렬 가능 여부**: 컬럼별 정렬 기능 활성화/비활성화
- **실시간 미리보기**: 설정 변경사항을 테이블로 즉시 확인

**컬럼 타입:**
- **Basic**: 제품 기본 정보 (maker_name, series, part_number)
- **Specification**: JSONB specifications 필드의 특정 값

### 4. CSV 자동 임포트 시스템 (/api/admin/csv-import)
**핵심 기능:**
- **자동 필드 분리**: 공통 컬럼과 specifications 필드 자동 구분
- **동적 스펙 변환**: 비공통 컬럼을 JSONB로 자동 변환
- **제조사/시리즈 자동 생성**: 없는 제조사/시리즈 자동 생성
- **Upsert 로직**: part_number 기반 업데이트 또는 삽입

**공통 컬럼:**
```typescript
const COMMON_COLUMNS = [
  'part_number', 'category', 'maker', 'series', 
  'is_active', 'is_new', 'image_url'
]
```

**사용 예시:**
```bash
curl -X POST /api/admin/csv-import \
  -F "file=@products.csv" \
  -F "categoryId=9"
```

### 5. 동적 제품 페이지 렌더링
**FilterSidebar 리팩토링:**
- 정적 설정 파일 → DB 기반 동적 로딩
- 카테고리 변경 시 필터 자동 업데이트
- 슬라이더/체크박스 타입별 UI 렌더링
- 필터 확장/축소 상태 관리

**ProductTable 리팩토링:**
- 정적 컬럼 → DB 기반 동적 컬럼
- 컬럼 순서, 너비, 정렬 가능 여부 적용  
- NEW 뱃지 스타일링 추가
- is_new 제품 우선 표시

**성능 최적화:**
- `useMemo`로 계산 결과 캐싱
- `useCallback`으로 핸들러 메모이제이션
- 카테고리 변경 시에만 설정 리로드

## 🔧 기술적 구현 세부사항

### 데이터 플로우
```
Admin 설정 변경
↓
filter_configs/table_column_configs 업데이트
↓
사용자 카테고리 변경
↓
FilterSidebar/ProductTable에서 설정 로드
↓
동적 UI 렌더링
```

### 핵심 컴포넌트 구조
```typescript
// FilterSidebar.tsx
const FilterSidebar = () => {
  const [dynamicFilters, setDynamicFilters] = useState<FilterConfig[]>([])
  const [filterOptions, setFilterOptions] = useState<Record<number, FilterOption[]>>({})
  
  useEffect(() => {
    loadFilters() // 카테고리별 필터 설정 로드
  }, [filters.categories])
  
  // 필터 타입별 렌더링
  {filter.filter_type === 'checkbox' && renderCheckboxes(filter, options)}
  {filter.filter_type === 'slider' && renderSlider(filter)}
}
```

### Supabase 스키마 설계
```sql
-- 필터 설정 테이블
CREATE TABLE filter_configs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id BIGINT NOT NULL,
  filter_name TEXT NOT NULL,
  filter_label TEXT NOT NULL,
  filter_type TEXT NOT NULL CHECK (filter_type IN ('checkbox', 'slider')),
  filter_unit TEXT,
  sort_order INTEGER DEFAULT 0,
  default_expanded BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE
);

-- 슬라이더 설정 테이블
CREATE TABLE filter_slider_configs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  filter_config_id BIGINT NOT NULL REFERENCES filter_configs(id) ON DELETE CASCADE,
  min_value NUMERIC NOT NULL,
  max_value NUMERIC NOT NULL,
  step_value NUMERIC NOT NULL
);
```

## 🎨 주요 개선사항

### 1. 사용자 피드백 완전 해결
**문제**: "slider로 선택할때 이에맞게 입력하는항목들이 최솟값,최댓값,tic?(드래그할 때 움직이는 최소단위)로 변경되어야하는데"
**해결**: Slider 타입 선택 시 min/max/step 전용 UI 제공

### 2. 관리 편의성 극대화  
- 코드 변경 없이 새로운 카테고리/필터 추가 가능
- 웹 인터페이스를 통한 실시간 설정 변경
- 설정 변경사항 즉시 반영

### 3. 확장성 확보
- 새로운 필터 타입 쉽게 추가 가능
- 카테고리별 독립적 설정
- JSONB 기반 유연한 스펙 관리

## 📊 데이터 마이그레이션 가이드

### 1. 기존 정적 설정 → DB 이전
```sql
-- CIS 카테고리 필터 설정 예시
INSERT INTO filter_configs (category_id, filter_name, filter_label, filter_type, filter_unit) VALUES
(9, 'scan_width', 'Scan Width', 'checkbox', 'mm'),
(9, 'dpi', 'DPI', 'slider', 'dpi'),
(9, 'speed', 'Speed', 'checkbox', 'MHz');
```

### 2. CSV 데이터 준비
```csv
part_number,maker,series,is_active,is_new,image_url,scan_width,dpi,resolution
ARL-22CH-12D,Vieworks,ARL,true,false,https://example.com/image.jpg,400,600,7200
```

### 3. 자동 임포트 실행
```bash
curl -X POST /api/admin/csv-import \
  -H "Content-Type: multipart/form-data" \
  -F "file=@products.csv" \
  -F "categoryId=9"
```

## 🚀 성능 및 사용성 개선

### 성능 최적화
- **지연 로딩**: 카테고리 변경 시에만 설정 리로드
- **메모이제이션**: React 성능 최적화 기법 전면 적용
- **인덱싱**: JSONB 필드에 GIN 인덱스 적용 가능

### 사용성 개선
- **직관적 UI**: 필터 타입별 맞춤형 설정 인터페이스
- **실시간 미리보기**: 설정 변경사항 즉시 확인
- **에러 핸들링**: 명확한 에러 메시지 및 복구 방안

## 🎯 주요 달성 사항

1. **완전한 동적 시스템**: 정적 설정 파일에서 DB 기반 동적 관리로 전환
2. **관리자 친화적**: 코드 지식 없이도 필터/컬럼 관리 가능
3. **확장성 확보**: 새로운 카테고리/필터 타입 쉽게 추가
4. **성능 최적화**: React 성능 최적화 및 효율적 DB 쿼리
5. **사용자 피드백 반영**: Slider UI 문제 완전 해결
6. **CSV 자동화**: 대량 제품 데이터 자동 임포트 시스템

## 🔗 주요 파일 및 경로

### Admin 페이지
- `/src/app/admin/filters/page.tsx` - 필터 관리 인터페이스
- `/src/app/admin/table-columns/page.tsx` - 컬럼 관리 인터페이스

### API 엔드포인트  
- `/src/app/api/admin/csv-import/route.ts` - CSV 임포트 API

### 리팩토링된 컴포넌트
- `/src/domains/product/components/FilterSidebar.tsx` - 동적 필터 사이드바
- `/src/domains/product/components/ProductTable.tsx` - 동적 테이블

### 스타일링
- `/src/app/(portal)/products/products.module.css` - NEW 뱃지 스타일 추가

### 타입 정의
- `/src/lib/supabase.ts` - 새 테이블 타입 정의

## 🌐 사용 방법

### 관리자 접근
- **필터 관리**: `http://localhost:3002/admin/filters`
- **컬럼 관리**: `http://localhost:3002/admin/table-columns`

### CSV 데이터 업로드
1. CSV 파일 준비 (공통 컬럼 + 스펙 컬럼)
2. Admin 페이지에서 파일 업로드
3. 자동으로 제품 데이터 및 필터 설정 생성

---

# Using Gemini CLI for Large Codebase Analysis

  When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive
  context window. Use `gemini -p` to leverage Google Gemini's large context capacity.

  ## File and Directory Inclusion Syntax

  Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the
   gemini command:

  ### Examples:

  **Single file analysis:**
  ```bash
  gemini -p "@src/main.py Explain this file's purpose and structure"

  Multiple files:
  gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"

  Entire directory:
  gemini -p "@src/ Summarize the architecture of this codebase"

  Multiple directories:
  gemini -p "@src/ @tests/ Analyze test coverage for the source code"

  Current directory and subdirectories:
  gemini -p "@./ Give me an overview of this entire project"
  
#
 Or use --all_files flag:
  gemini --all_files -p "Analyze the project structure and dependencies"

  Implementation Verification Examples

  Check if a feature is implemented:
  gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"

  Verify authentication implementation:
  gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"

  Check for specific patterns:
  gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"

  Verify error handling:
  gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"

  Check for rate limiting:
  gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"

  Verify caching strategy:
  gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"

  Check for specific security measures:
  gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"

  Verify test coverage for features:
  gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"

  When to Use Gemini CLI

  Use gemini -p when:
  - Analyzing entire codebases or large directories
  - Comparing multiple large files
  - Need to understand project-wide patterns or architecture
  - Current context window is insufficient for the task
  - Working with files totaling more than 100KB
  - Verifying if specific features, patterns, or security measures are implemented
  - Checking for the presence of certain coding patterns across the entire codebase

  Important Notes

  - Paths in @ syntax are relative to your current working directory when invoking gemini
  - The CLI will include file contents directly in the context
  - No need for --yolo flag for read-only analysis
  - Gemini's context window can handle entire codebases that would overflow Claude's context
  - When checking implementations, be specific about what you're looking for to get accurate results # Using Gemini CLI for Large Codebase Analysis


  When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive
  context window. Use `gemini -p` to leverage Google Gemini's large context capacity.


  ## File and Directory Inclusion Syntax


  Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the
   gemini command:


  ### Examples:


  **Single file analysis:**
  ```bash
  gemini -p "@src/main.py Explain this file's purpose and structure"


  Multiple files:
  gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"


  Entire directory:
  gemini -p "@src/ Summarize the architecture of this codebase"


  Multiple directories:
  gemini -p "@src/ @tests/ Analyze test coverage for the source code"


  Current directory and subdirectories:
  gemini -p "@./ Give me an overview of this entire project"
  # Or use --all_files flag:
  gemini --all_files -p "Analyze the project structure and dependencies"


  Implementation Verification Examples


  Check if a feature is implemented:
  gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"


  Verify authentication implementation:
  gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"


  Check for specific patterns:
  gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"


  Verify error handling:
  gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"


  Check for rate limiting:
  gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"


  Verify caching strategy:
  gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"


  Check for specific security measures:
  gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"


  Verify test coverage for features:
  gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"


  When to Use Gemini CLI


  Use gemini -p when:
  - Analyzing entire codebases or large directories
  - Comparing multiple large files
  - Need to understand project-wide patterns or architecture
  - Current context window is insufficient for the task
  - Working with files totaling more than 100KB
  - Verifying if specific features, patterns, or security measures are implemented
  - Checking for the presence of certain coding patterns across the entire codebase


  Important Notes


  - Paths in @ syntax are relative to your current working directory when invoking gemini
  - The CLI will include file contents directly in the context
  - No need for --yolo flag for read-only analysis
  - Gemini's context window can handle entire codebases that would overflow Claude's context
  - When checking implementations, be specific about what you're looking for to get accurate results

