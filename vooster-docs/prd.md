# 제품 요구사항 문서(PRD)

## 1. 개요
주식회사 바이렉스의 B2B 제품 포털 웹사이트를 구축한다. 2,000개 이상의 제품 정보를 체계적으로 제공하고, 복잡한 필터링·검색 기능을 통해 B2B 담당자가 신속히 최적 제품을 찾을 수 있도록 지원한다. Next.js와 Supabase 기반의 효율적인 코드 구조로 개발·유지보수 비용을 절감하고, 확장성 높은 플랫폼을 제공한다.

## 2. 문제 정의
- 기존 바이렉스 웹 채널은 제품 수가 많음에도 불구하고 복수 파라미터별 필터링·검색이 어려워 B2B 담당자가 원하는 제품을 찾기 힘듦  
- 상세 페이지 요소와 리스트 필터 파라미터가 상이해 정보 일관성이 부족  
- 관리자가 대규모 제품 데이터를 수작업으로 관리해 운영 효율이 낮음  
- 경쟁사 대비 현대적 UX·반응속도가 떨어져 신뢰도·매출 전환률 감소

## 3. 목표 및 목적
- 1차 목표: 2,000+ 제품의 고성능 다중 필터링·검색 제공
- 2차 목표: 유지보수가 쉬운 컴포넌트 아키텍처 설계  
- 성공 지표  
  - 제품 검색 성공률 ≥ 90% (3회 이하 클릭/스크롤)  
  - 페이지 로딩 2초 이하 (P95)  
  - 제품 문의 전환율 15%↑  
  - 관리자 데이터 입력 시간 40%↓  

## 4. 대상 사용자
### 주요 사용자
- 국내·해외 B2B 구매 담당자 및 엔지니어  
  - 연령 25~50세, 데스크탑·모바일 혼용  
  - 빠른 스펙 비교, 상품별 관련 데이터시트, 스펙표 등 자료 다운로드 (상품마다 다르게 DB가 준비되어있음), 견적 문의, 뉴스레터 신청(이메일 입력) 필요
### 부차적 사용자
- 바이렉스 내부 영업팀·마케팅팀  
- 파트너사 유통·AS 팀

## 5. 사용자 스토리
- “B2B 구매 담당자로서, 여러 파라미터로 제품을 필터링해 최적 제품을 즉시 찾고 싶다.”
- “엔지니어로서, 상세 페이지에서 다이어그램·데이터시트·규격 비교를 보고 싶다.”
- “마케터로서, 특정 산업군 방문자 행동 데이터를 분석해 캠페인을 최적화하고 싶다.”
- “관리자로서, 대량 CSV 업로드로 제품 정보를 빠르게 갱신하고 싶다.”

## 6. 기능 요구사항
### 핵심 기능
1. 제품 카탈로그 & 다중 필터링  
   - 파라미터 유형: partnumber, series 등 공통요소들과, 각 상품 카테고리별로 상이한 파라미터 >= 10
   - AND/OR 조합 필터, 슬라이더 기반 필터, 체크박스 기반 필터, 필터링 시 URL 파라미터에 적용 필요
   - 각 상품 파라미터에 신제품 boolen DB값이 true인 경우, 상품 리스트에서 가장 상단에 위치시키며, 'NEW' badge 디자인을 추가
   - 헤더 내에 전체 상품 검색을 위한 검색 bar 존재, partnumber / series 등으로 검색 필요
   - 상품 이미지 등 관련 정적 DB들의 쉬운 관리 필요
   - 메인페이지에 워드프레스로 제작된 블로그의 글들을 실시간으로 연동 필요
   - 수반되는 API 응답 ≤ 300ms

2. 제품 상세 페이지  
   - 리스트 필터 파라미터를 포함한 그 외 파라미터들을 추가적으로 표시 (상세페이지에서만 보이는 파라미터 DB가 존재. 해당 파라미터는 제품 DB의 series의 ID와 연동되어 관리
   - 유사 제품 제안, PDF 다운로드, 문의 폼 통합  
   - SEO 메타 태그 자동 생성

3. 관리자 CMS  
   - Supabase 테이블 연동, 역할 기반 접근 제어  
   - CSV/Excel 일괄 업로드, 버전 관리, 에러 로그

4. 글로벌 반응형 UI  
   - Next.js + Tailwind 기반, 데스크탑·태블릿·모바일 대응  
   - Lighthouse 접근성 점수 90↑

### 보조 기능(제안)
- 다국어(i18n) 지원 (KR/EN/JP)  
- AI 기반 제품 추천(Phase 3)  
- 즐겨찾기·비교 리스트  
- ElasticSearch 연동 자동 완성  
- Google Tag Manager, GA4 이벤트 추적 대시보드  
- 문의/견적 CRM 연동(Salesforce, HubSpot)

## 7. 비기능 요구사항
- 성능: 초과 2,000제품·50k 필터 조합에서도 <2초 렌더  
- 보안: Supabase RLS, OAuth2 SSO, WAF 적용  
- 사용성: WCAG 2.1 AA, 키보드 탐색 완전 지원  
- 확장성: 멀티리전 DB, CDN 캐싱, 모듈화된 Next.js 구조  
- 호환성: 최신 Chrome, Edge, Safari, Firefox, iOS14+, Android10+

## 8. 기술 고려사항
- 아키텍처: Next.js(SSR/SCSR 하이브리드) + Supabase(Postgres, Auth, Edge Functions)  
- 인프라: Vercel 배포, Cloudflare CDN, GitHub Actions CI/CD  
- 데이터: 제품 테이블, 파라미터 메타테이블, 다국어 번역 테이블  
- 외부 연동: Stripe(결제 옵션 보류), SendGrid(이메일), Elasticsearch(검색)  

## 9. 성공 지표(KPI)
- 월간 사용자(MAU) 20%↑ 6개월 내  
- 평균 세션 길이 3분↑  
- 제품 문의 리드 수 1.5배↑  
- 서버 오류율 <0.1%  
- Lighthouse 성능 ≥ 90점

## 10. 일정 및 마일스톤
- Phase 1 (M+0~M+3): MVP  
  - 카탈로그, 필터링, 상세 페이지, 기본 CMS, KR UI
- Phase 2 (M+4~M+6): 고도화  
  - 다국어, 즐겨찾기, GA4, Edge caching, SEO
- Phase 3 (M+7~M+9): 확장  
  - AI 추천, CRM·결제 연동, 오프라인 전시 연계 기능

## 11. 리스크 및 대응
- 대량 데이터 성능 저하 → 인덱스 튜닝, 캐싱 계층 적용  
- 필터 로직 복잡도 → Pre-computed 필터 매트릭스, SSG fallback  
- 내부 리소스 부족 → 파트너 에이전시 협업, 스프린트 당 일정 버퍼 확보  
- 사용자 채택 저조 → 온보딩 가이드, 검색 로그 기반 UX 개선

## 12. 향후 과제
- PWA 오프라인 브로슈어 모드  
- AR/VR 제품 3D 뷰어  
- ESG·친환경 지표 필터 추가  
- 파트너사 API 마켓플레이스 구축