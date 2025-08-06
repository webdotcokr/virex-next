# ASP 필터 시스템 → 동적 필터 시스템 마이그레이션 가이드

## 📋 개요
기존 ASP 홈페이지의 정적 필터 설정을 현재 개편된 동적 필터 시스템으로 완전 마이그레이션하는 가이드입니다.

## 🎯 마이그레이션 범위

### 대상 카테고리 (총 18개)
| 카테고리 | ID | 필터 개수 | 슬라이더 | 테이블 컬럼 |
|---------|----|---------|---------|-----------| 
| CIS | 9 | 9개 | 1개 | 12개 |
| TDI | 10 | 7개 | 0개 | 8개 |
| Line Camera | 11 | 7개 | 0개 | 11개 |
| Area Camera | 12 | 6개 | 0개 | 13개 |
| Invisible (SWIR) | 13 | 6개 | 0개 | 13개 |
| Scientific | 14 | 6개 | 0개 | 13개 |
| Large Format | 15 | 5개 | 3개 | 11개 |
| Telecentric | 16 | 5개 | 1개 | 10개 |
| FA Lens | 17 | 4개 | 0개 | 9개 |
| 3D Laser Profiler | 18 | 0개 | 0개 | 12개 |
| 3D Stereo Camera | 19 | 0개 | 0개 | 11개 |
| Light | 20 | 0개 | 0개 | 9개 |
| Controller | 22 | 0개 | 0개 | 10개 |
| Frame Grabber | 23 | 1개 | 0개 | 9개 |
| GigE Card | 24 | 4개 | 0개 | 9개 |
| USB Card | 25 | 4개 | 0개 | 9개 |
| Cable | 26 | 0개 | 0개 | 4개 |
| Accessory | 27 | 0개 | 0개 | 4개 |
| Auto Focus Module | 4 | 0개 | 0개 | 13개 |
| Software | 7 | 0개 | 0개 | 5개 |

### 마이그레이션 통계
- **총 필터**: 68개
- **총 슬라이더**: 5개
- **총 필터 옵션**: 200+ 개
- **총 테이블 컬럼**: 190+ 개

## 🚀 마이그레이션 실행 단계

### 1단계: 데이터베이스 백업
```sql
-- 기존 데이터 백업 (선택사항)
CREATE TABLE filter_configs_backup AS SELECT * FROM filter_configs;
CREATE TABLE filter_options_backup AS SELECT * FROM filter_options;
CREATE TABLE filter_slider_configs_backup AS SELECT * FROM filter_slider_configs;
CREATE TABLE table_column_configs_backup AS SELECT * FROM table_column_configs;
```

### 2단계: 기존 데이터 삭제 (필요한 경우)
```sql
-- 기존 테스트 데이터 삭제
DELETE FROM filter_slider_configs WHERE filter_config_id IN (
    SELECT id FROM filter_configs WHERE category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27)
);
DELETE FROM filter_options WHERE filter_config_id IN (
    SELECT id FROM filter_configs WHERE category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27)
);
DELETE FROM filter_configs WHERE category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27);
DELETE FROM table_column_configs WHERE category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27);
```

### 3단계: 필터 마이그레이션 실행
```bash
# Supabase SQL Editor에서 실행
# 또는 psql 클라이언트 사용
psql -h [HOST] -U [USER] -d [DB] -f database/migrations/002_filter_migration_from_asp.sql
```

### 4단계: 테이블 컬럼 마이그레이션 실행
```bash
# Supabase SQL Editor에서 실행
psql -h [HOST] -U [USER] -d [DB] -f database/migrations/003_table_column_migration_from_asp.sql
```

### 5단계: 마이그레이션 검증
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

-- 전체 마이그레이션 요약
SELECT 
    'Filter Configs' as table_name,
    COUNT(*) as total_records
FROM filter_configs
WHERE category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27);
```

## 🔧 주요 마이그레이션 내용

### CIS (Category ID: 9) - 대표적인 예시

#### 필터 설정
1. **Scan width** (checkbox, mm)
   - 1000mm 이상, 500mm ~ 999mm, 100mm ~ 499mm, ~ 99mm

2. **DPI** (checkbox, dpi, 기본 확장)
   - 4800dpi, 3600dpi, 2400dpi, 1800dpi, 1200dpi, 900dpi, 600dpi, 300dpi

3. **No. of Pixels** (slider)
   - 범위: 0 ~ 200,000, 스텝: 1,000

#### 테이블 컬럼 설정
- Maker (100px), Series (120px), Part Number (150px)
- Scan Width, DPI, Resolution, Line Rate, Speed, WD, No. of Pixels
- Spectrum, Interface (정렬 불가)

### Large Format Lens (Category ID: 15) - 슬라이더 예시

#### 슬라이더 필터
1. **Central Mag**: 0 ~ 7 (스텝: 0.1)
2. **Image Circle**: 0 ~ 100 (스텝: 1)  
3. **Focal length**: 4 ~ 150 (스텝: 1)

## 🎯 특수 처리 사항

### 복잡한 쿼리 조건
기존 ASP의 복잡한 쿼리 조건들을 option_value에 그대로 저장:
- `"BETWEEN 500 AND 999"` - 범위 조건
- `"NOT IN ('Mono','Color')"` - ETC 조건
- `">=5 AND p_item4 <10"` - 복합 조건

### 기본 확장 설정
사용자 경험을 위해 중요한 필터들을 기본 확장으로 설정:
- CIS: DPI, Line rate
- TDI: Resolution
- Area: Mega pixel, Frame rate
- Large Format: Central Mag, Image Circle

### 단위 표시
각 필터별 적절한 단위 설정:
- mm, dpi, kHz, MHz, μm, fps, x, φ/mm 등

## 📊 검증 체크리스트

### ✅ 필터 검증
- [ ] 각 카테고리별 필터 개수 확인
- [ ] 슬라이더 범위 및 스텝 값 확인
- [ ] 체크박스 옵션 개수 및 내용 확인
- [ ] 기본 확장 설정 확인

### ✅ 테이블 컬럼 검증
- [ ] 각 카테고리별 컬럼 개수 확인
- [ ] 컬럼 순서 및 너비 설정 확인
- [ ] 정렬 가능 여부 설정 확인
- [ ] Basic vs Specification 타입 확인

### ✅ 프론트엔드 검증
- [ ] Admin 페이지에서 필터 관리 동작 확인
- [ ] Admin 페이지에서 컬럼 관리 동작 확인
- [ ] 제품 페이지에서 동적 필터 렌더링 확인
- [ ] 제품 페이지에서 동적 컬럼 렌더링 확인

## 🐛 문제 해결

### 일반적인 문제들

#### 1. 외래 키 제약 조건 오류
```sql
-- 순서 확인: 먼저 filter_configs, 그 다음 filter_options와 filter_slider_configs
```

#### 2. 중복 데이터 오류
```sql
-- 기존 데이터 확인 후 삭제
SELECT * FROM filter_configs WHERE category_id = 9 AND filter_name = 'scan_width';
DELETE FROM filter_configs WHERE category_id = 9 AND filter_name = 'scan_width';
```

#### 3. 카테고리 ID 불일치
```sql
-- 카테고리 ID 확인
SELECT id, name FROM categories WHERE name LIKE '%CIS%';
```

## 🔄 롤백 계획

### 데이터 롤백
```sql
-- 마이그레이션 데이터 삭제
DELETE FROM filter_slider_configs WHERE filter_config_id IN (
    SELECT id FROM filter_configs WHERE category_id IN (...)
);
DELETE FROM filter_options WHERE filter_config_id IN (
    SELECT id FROM filter_configs WHERE category_id IN (...)
);
DELETE FROM filter_configs WHERE category_id IN (...);
DELETE FROM table_column_configs WHERE category_id IN (...);

-- 백업 데이터 복원 (백업이 있는 경우)
INSERT INTO filter_configs SELECT * FROM filter_configs_backup;
-- ... 기타 테이블들
```

## 🎉 마이그레이션 완료 확인

마이그레이션이 성공적으로 완료되면:
1. **68개의 필터 설정**이 생성됨
2. **200+ 개의 필터 옵션**이 생성됨  
3. **5개의 슬라이더 설정**이 생성됨
4. **190+ 개의 테이블 컬럼 설정**이 생성됨

### 최종 검증 쿼리
```sql
-- 전체 마이그레이션 요약
SELECT 
    'Total Categories' as item,
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

이 마이그레이션을 통해 기존 ASP의 모든 필터 기능을 유지하면서도 관리자가 웹 인터페이스를 통해 동적으로 관리할 수 있는 현대적인 시스템으로 완전히 전환됩니다.