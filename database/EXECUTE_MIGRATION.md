# 🚀 마이그레이션 실행 가이드

## 📋 실행 준비사항

### 1. Supabase Dashboard 접속
1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 해당 프로젝트 선택
3. 좌측 메뉴에서 "SQL Editor" 클릭

### 2. 파일 준비
다음 마이그레이션 파일들이 준비되어 있습니다:
- `database/migrations/002_filter_migration_from_asp.sql` - 필터 설정 마이그레이션
- `database/migrations/003_table_column_migration_from_asp.sql` - 테이블 컬럼 마이그레이션

## 🔧 실행 단계

### Step 1: 현재 상태 확인
```sql
-- 현재 데이터 상태 확인
SELECT 
    'Filter Configs' as table_name,
    COUNT(*) as current_count
FROM filter_configs

UNION ALL

SELECT 
    'Filter Options' as table_name,
    COUNT(*) as current_count
FROM filter_options

UNION ALL

SELECT 
    'Filter Slider Configs' as table_name,
    COUNT(*) as current_count
FROM filter_slider_configs

UNION ALL

SELECT 
    'Table Column Configs' as table_name,
    COUNT(*) as current_count
FROM table_column_configs;
```

**예상 결과**: 현재 소량의 테스트 데이터가 있을 것입니다.

### Step 2: 기존 테스트 데이터 백업 (선택사항)
```sql
-- 기존 데이터 백업
CREATE TABLE filter_configs_backup AS SELECT * FROM filter_configs;
CREATE TABLE filter_options_backup AS SELECT * FROM filter_options;
CREATE TABLE filter_slider_configs_backup AS SELECT * FROM filter_slider_configs;
CREATE TABLE table_column_configs_backup AS SELECT * FROM table_column_configs;
```

### Step 3: 기존 테스트 데이터 삭제 (필요한 경우)
```sql
-- 충돌 방지를 위한 기존 데이터 삭제
DELETE FROM filter_slider_configs WHERE filter_config_id IN (
    SELECT id FROM filter_configs WHERE category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27)
);

DELETE FROM filter_options WHERE filter_config_id IN (
    SELECT id FROM filter_configs WHERE category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27)
);

DELETE FROM filter_configs WHERE category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27);

DELETE FROM table_column_configs WHERE category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27);
```

### Step 4: 필터 마이그레이션 실행

**Supabase SQL Editor에서 실행:**

1. **파일 내용 복사**: `database/migrations/002_filter_migration_from_asp.sql` 파일의 전체 내용을 복사

2. **SQL Editor에 붙여넣기**: Supabase SQL Editor에 붙여넣기

3. **실행**: "Run" 버튼 클릭

**⚠️ 주의사항**: 
- 파일이 크므로 여러 부분으로 나누어 실행할 수 있습니다
- 오류 발생 시 해당 부분만 다시 실행

### Step 5: 테이블 컬럼 마이그레이션 실행

**Supabase SQL Editor에서 실행:**

1. **파일 내용 복사**: `database/migrations/003_table_column_migration_from_asp.sql` 파일의 전체 내용을 복사

2. **SQL Editor에 붙여넣기**: Supabase SQL Editor에 붙여넣기

3. **실행**: "Run" 버튼 클릭

### Step 6: 마이그레이션 검증

```sql
-- 전체 마이그레이션 요약 확인
SELECT 
    'Total Categories with Filters' as item,
    COUNT(DISTINCT category_id) as count
FROM filter_configs
WHERE category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27)

UNION ALL

SELECT 'Total Filters', COUNT(*) FROM filter_configs
WHERE category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27)

UNION ALL

SELECT 'Total Filter Options', COUNT(*) FROM filter_options fo
JOIN filter_configs fc ON fo.filter_config_id = fc.id
WHERE fc.category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27)

UNION ALL

SELECT 'Total Slider Configs', COUNT(*) FROM filter_slider_configs fsc
JOIN filter_configs fc ON fsc.filter_config_id = fc.id
WHERE fc.category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27)

UNION ALL

SELECT 'Total Table Columns', COUNT(*) FROM table_column_configs
WHERE category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27);
```

**예상 결과:**
- Total Categories with Filters: ~12개
- Total Filters: ~68개
- Total Filter Options: ~200개
- Total Slider Configs: ~5개
- Total Table Columns: ~190개

### Step 7: 카테고리별 상세 확인

```sql
-- 각 카테고리별 필터 개수 확인
SELECT 
    c.name as category_name,
    COUNT(fc.id) as filter_count,
    COUNT(CASE WHEN fc.filter_type = 'checkbox' THEN 1 END) as checkbox_filters,
    COUNT(CASE WHEN fc.filter_type = 'slider' THEN 1 END) as slider_filters
FROM categories c
LEFT JOIN filter_configs fc ON c.id = fc.category_id
WHERE c.id IN (9, 10, 11, 12, 13, 14, 15, 16, 17, 23, 24, 25)
GROUP BY c.id, c.name
ORDER BY c.id;
```

**예상 결과 (주요 카테고리):**
- CIS: 9개 필터 (8개 checkbox, 1개 slider)
- TDI: 7개 필터 (7개 checkbox, 0개 slider)
- Area: 6개 필터 (6개 checkbox, 0개 slider)
- Large Format: 5개 필터 (2개 checkbox, 3개 slider)

## 🎯 성공 기준

### ✅ 필터 마이그레이션 성공 체크리스트
- [ ] CIS 카테고리에 9개 필터가 생성됨
- [ ] CIS의 "No. of Pixels" 슬라이더가 올바른 범위(0-200000)로 설정됨
- [ ] DPI 필터에 8개 옵션(4800dpi~300dpi)이 생성됨
- [ ] Large Format에 3개 슬라이더가 생성됨

### ✅ 테이블 컬럼 마이그레이션 성공 체크리스트
- [ ] CIS 카테고리에 12개 컬럼이 생성됨
- [ ] 각 컬럼의 너비가 올바르게 설정됨 (Maker: 100px, Series: 120px 등)
- [ ] Basic/Specification 타입이 올바르게 분류됨
- [ ] 정렬 가능 여부가 올바르게 설정됨

## 🐛 문제 해결

### 오류 발생 시 대처방법

#### 1. "duplicate key value violates unique constraint" 오류
```sql
-- 중복 데이터 확인 및 삭제
SELECT category_id, filter_name, COUNT(*) 
FROM filter_configs 
WHERE category_id = 9 
GROUP BY category_id, filter_name 
HAVING COUNT(*) > 1;

-- 중복 제거
DELETE FROM filter_configs 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM filter_configs 
    GROUP BY category_id, filter_name
);
```

#### 2. "foreign key violation" 오류
```sql
-- 카테고리 존재 확인
SELECT id, name FROM categories WHERE id IN (9, 10, 11, 12);

-- 누락된 카테고리가 있다면 categories 테이블 확인 필요
```

#### 3. 부분 실행 필요 시
```sql
-- CIS만 먼저 테스트
INSERT INTO filter_configs (category_id, filter_name, filter_label, filter_type, filter_unit, sort_order, default_expanded, is_active) VALUES
(9, 'scan_width', 'Scan width', 'checkbox', 'mm', 1, false, true);

-- 정상 동작 확인 후 나머지 진행
```

## 🔄 롤백 방법

마이그레이션에 문제가 있을 경우:

```sql
-- 마이그레이션 데이터 완전 삭제
DELETE FROM filter_slider_configs WHERE filter_config_id IN (
    SELECT id FROM filter_configs WHERE category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27)
);

DELETE FROM filter_options WHERE filter_config_id IN (
    SELECT id FROM filter_configs WHERE category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27)
);

DELETE FROM filter_configs WHERE category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27);

DELETE FROM table_column_configs WHERE category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27);

-- 백업 데이터 복원 (백업을 생성한 경우)
INSERT INTO filter_configs SELECT * FROM filter_configs_backup;
INSERT INTO filter_options SELECT * FROM filter_options_backup;
INSERT INTO filter_slider_configs SELECT * FROM filter_slider_configs_backup;
INSERT INTO table_column_configs SELECT * FROM table_column_configs_backup;
```

## 🎉 마이그레이션 완료 후

마이그레이션이 성공적으로 완료되면:

1. **Admin 필터 관리 페이지** (`/admin/filters`) 접속
2. **CIS 카테고리 선택** 후 9개 필터가 표시되는지 확인
3. **"No. of Pixels" 슬라이더** 설정이 올바른지 확인
4. **Admin 테이블 컬럼 관리 페이지** (`/admin/table-columns`) 접속
5. **각 카테고리별 컬럼** 설정이 올바른지 확인
6. **제품 페이지** (`/products`) 접속하여 동적 필터링 동작 확인

이제 기존 ASP의 모든 필터 기능을 현대적인 동적 관리 시스템에서 사용할 수 있습니다! 🚀