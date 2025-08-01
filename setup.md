# Virex B2B Portal - 빠른 시작 가이드

## 🚀 5분 안에 시작하기

### 1단계: 환경 변수 설정
```bash
# .env.local 파일 생성
cp .env.example .env.local
```

### 2단계: Supabase 프로젝트 생성
1. [supabase.com](https://supabase.com)에서 무료 계정 생성
2. 새 프로젝트 생성
3. Settings → API에서 URL과 anon key 복사
4. `.env.local` 파일에 붙여넣기

### 3단계: 데이터베이스 스키마 설정
1. Supabase 대시보드에서 SQL Editor 열기
2. `supabase-schema.sql` 파일 내용 복사 후 실행
3. 샘플 데이터가 자동으로 생성됩니다

### 4단계: 개발 서버 실행
```bash
npm install
npm run dev
```

### 5단계: 확인
- 사용자 포털: http://localhost:3000
- 관리자 대시보드: http://localhost:3000/admin/dashboard

## 🎯 주요 기능 테스트

### 검색 기능
- 헤더 검색바에서 "VRX" 또는 "SERIES" 입력
- 실시간 자동완성 확인

### 필터링
- `/products` 페이지에서 카테고리 필터 사용
- URL이 자동으로 업데이트되는지 확인

### 제품 상세 페이지
- 제품 카드 클릭 시 상세 페이지 이동
- 문의하기 폼 테스트

### 관리자 기능
- `/admin/dashboard`에서 통계 확인
- 대시보드 네비게이션 테스트

## 🛠 문제 해결

### 빌드 오류
```bash
# TypeScript 검사
npx tsc --noEmit

# 린트 검사
npm run lint
```

### Supabase 연결 오류
- `.env.local` 파일의 URL과 키 확인
- Supabase 프로젝트가 활성 상태인지 확인

### 스타일링 문제
- Tailwind CSS가 제대로 로드되는지 확인
- 브라우저 캐시 삭제 후 새로고침

## 📞 지원
문제가 지속되면 GitHub Issues에 문의해 주세요.