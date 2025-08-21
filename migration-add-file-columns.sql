-- 모든 products_* 테이블에 파일 참조 컬럼을 한번에 추가하는 마이그레이션
-- Supabase SQL Editor에서 실행하세요

-- 1. 동적 SQL 함수 생성
CREATE OR REPLACE FUNCTION add_file_columns_to_product_tables()
RETURNS text AS $$
DECLARE
    table_name text;
    result_text text := '';
    executed_count integer := 0;
BEGIN
    -- public 스키마의 모든 products_* 테이블 찾기
    FOR table_name IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' AND tablename LIKE 'products_%'
        ORDER BY tablename
    LOOP
        -- 각 테이블에 파일 참조 컬럼 추가
        BEGIN
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS catalog_file_id BIGINT REFERENCES downloads(id)', table_name);
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS datasheet_file_id BIGINT REFERENCES downloads(id)', table_name);
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS manual_file_id BIGINT REFERENCES downloads(id)', table_name);
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS drawing_file_id BIGINT REFERENCES downloads(id)', table_name);
            
            result_text := result_text || '✅ ' || table_name || ' - 파일 참조 컬럼 추가 완료' || E'\n';
            executed_count := executed_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            result_text := result_text || '❌ ' || table_name || ' - 오류: ' || SQLERRM || E'\n';
        END;
    END LOOP;
    
    result_text := result_text || E'\n총 ' || executed_count || '개 테이블 처리 완료';
    RETURN result_text;
END;
$$ LANGUAGE plpgsql;

-- 2. 함수 실행
SELECT add_file_columns_to_product_tables();

-- 3. 함수 삭제 (정리)
DROP FUNCTION IF EXISTS add_file_columns_to_product_tables();

-- 4. 컬럼 추가 확인 쿼리 (선택사항)
/*
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name LIKE 'products_%'
  AND column_name IN ('catalog_file_id', 'datasheet_file_id', 'manual_file_id', 'drawing_file_id')
ORDER BY table_name, column_name;
*/

-- 사용법:
-- 1. 위 전체 SQL을 Supabase SQL Editor에 복사
-- 2. 실행하면 모든 products_* 테이블에 파일 참조 컬럼이 추가됩니다
-- 3. 결과 메시지에서 성공/실패 여부를 확인할 수 있습니다