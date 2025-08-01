-- 회원 등급 테이블 기본 데이터 설정
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 기존 데이터가 있다면 삭제 (선택사항)
-- DELETE FROM tbl_member_level;

-- 기본 회원 등급 데이터 추가
INSERT INTO tbl_member_level (idx, m_lev, m_sort, m_memo, m_default) VALUES
(1, 1, '일반회원', '기본 회원 등급', true),
(2, 2, '우수회원', '우수 고객을 위한 등급', false),
(3, 3, 'VIP회원', 'VIP 고객을 위한 최고 등급', false),
(4, 9, '관리자', '시스템 관리자', false);

-- 확인 쿼리
SELECT * FROM tbl_member_level ORDER BY m_lev;