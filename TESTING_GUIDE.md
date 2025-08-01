# 회원가입/로그인 시스템 테스트 가이드

## 🚀 시작하기 전에

### 1. 데이터베이스 설정 확인
1. Supabase 프로젝트에 접속
2. SQL Editor에서 `member-level-setup.sql` 실행
3. 다음 테이블들이 존재하는지 확인:
   - `auth.users` (Supabase 자동 생성)
   - `member_profiles`
   - `tbl_member_level`

### 2. 환경 변수 확인
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 개발 서버 시작
```bash
npm run dev
```

## 🧪 테스트 시나리오

### 📝 회원가입 테스트

#### 시나리오 1: 정상 회원가입
1. `http://localhost:3000/auth/signup` 접속
2. 다음 정보 입력:
   - **이메일**: test@example.com
   - **비밀번호**: test123456
   - **비밀번호 확인**: test123456
   - **이름**: 홍길동
   - **전화번호**: 02-1234-5678 (선택)
   - **휴대폰**: 010-1234-5678 (선택)
   - **회사명**: 테스트회사 (선택)
   - **부서명**: 개발팀 (선택)
   - **이용약관 동의**: ✅ (필수)
   - **개인정보처리방침 동의**: ✅ (필수)
   - **마케팅 수신 동의**: ✅ (선택)

3. "회원가입 완료" 버튼 클릭
4. 성공 메시지 확인
5. 로그인 페이지로 이동

#### 시나리오 2: 유효성 검사 테스트
- 필수 필드 누락 시 오류 메시지 확인
- 잘못된 이메일 형식 입력 시 오류 메시지 확인
- 비밀번호 불일치 시 오류 메시지 확인
- 필수 약관 미동의 시 오류 메시지 확인

#### 시나리오 3: 중복 이메일 테스트
1. 이미 가입된 이메일로 재가입 시도
2. "이미 가입된 이메일입니다" 오류 메시지 확인

### 🔐 로그인 테스트

#### 시나리오 1: 정상 로그인
1. `http://localhost:3000/auth/login` 접속
2. 가입한 이메일과 비밀번호 입력
3. "로그인" 버튼 클릭
4. 메인 페이지로 리다이렉트 확인
5. 프로필 정보 로드 확인 (개발자 도구 콘솔 확인)

#### 시나리오 2: 잘못된 인증정보 테스트
- 존재하지 않는 이메일 입력
- 잘못된 비밀번호 입력
- 각각에 대한 적절한 오류 메시지 확인

### 🔍 데이터베이스 확인

#### Supabase Dashboard에서 확인할 내용:

1. **auth.users 테이블**:
   ```sql
   SELECT id, email, created_at, email_confirmed_at 
   FROM auth.users 
   ORDER BY created_at DESC;
   ```

2. **member_profiles 테이블**:
   ```sql
   SELECT id, name, company, department, agree_terms, agree_privacy, 
          agree_marketing, member_level, created_at 
   FROM member_profiles 
   ORDER BY created_at DESC;
   ```

3. **연관 관계 확인**:
   ```sql
   SELECT 
     u.email,
     p.name,
     p.company,
     p.member_level,
     ml.m_sort as level_name
   FROM auth.users u
   JOIN member_profiles p ON u.id = p.id
   LEFT JOIN tbl_member_level ml ON p.member_level = ml.m_lev;
   ```

## 🐛 예상 문제점 및 해결방법

### 1. RLS (Row Level Security) 오류
**증상**: "new row violates row-level security policy"
**해결**: Supabase Dashboard에서 RLS 정책 확인 및 수정

### 2. 외래 키 오류
**증상**: 프로필 생성 시 member_level 오류
**해결**: `member-level-setup.sql` 실행 확인

### 3. 이메일 인증 관련
**증상**: 회원가입 후 로그인 안됨
**해결**: Supabase Auth 설정에서 이메일 인증 비활성화 (개발 환경)

### 4. 프로필 정보 로드 실패
**증상**: 로그인은 되지만 프로필 정보가 없음
**해결**: AuthContext의 fetchProfile 함수 디버깅

## 📊 성공 기준

### ✅ 회원가입 성공 기준:
- [ ] auth.users 테이블에 사용자 생성
- [ ] member_profiles 테이블에 프로필 생성
- [ ] 기본 회원 등급(m_lev: 1) 자동 설정
- [ ] 약관 동의 상태 정확히 저장
- [ ] 성공 메시지 표시

### ✅ 로그인 성공 기준:
- [ ] 이메일/비밀번호 인증 성공
- [ ] AuthContext에 user 객체 설정
- [ ] AuthContext에 profile 객체 설정
- [ ] 메인 페이지로 리다이렉트
- [ ] 로그인 상태 유지

### ✅ 사용자 경험 성공 기준:
- [ ] 폼 유효성 검사 즉시 피드백
- [ ] 로딩 상태 표시
- [ ] 적절한 오류 메시지
- [ ] 반응형 디자인 작동
- [ ] 브라우저 새로고침 시 로그인 상태 유지

## 🔧 디버깅 팁

1. **브라우저 개발자 도구**: Console에서 AuthContext 상태 확인
2. **Network 탭**: API 요청/응답 확인
3. **Supabase Logs**: 실시간 데이터베이스 로그 확인
4. **React DevTools**: 컴포넌트 상태 및 props 확인

## 📞 문제 발생 시

1. 콘솔 로그 확인
2. Supabase Dashboard에서 데이터 확인
3. RLS 정책 및 권한 확인
4. 환경 변수 재확인