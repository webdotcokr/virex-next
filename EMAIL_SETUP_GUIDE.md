# 이메일 자동 발송 시스템 설정 가이드

## 1. Resend 계정 설정

### 1.1 계정 생성
1. https://resend.com 방문
2. 계정 생성 및 로그인

### 1.2 도메인 인증
1. Dashboard > Domains 메뉴 이동
2. "Add Domain" 클릭
3. `virex.co.kr` 도메인 추가
4. DNS 설정에 다음 레코드 추가:
   ```
   Type: TXT
   Name: _resend
   Value: [Resend에서 제공하는 값]
   ```

### 1.3 API 키 발급
1. Dashboard > API Keys 메뉴 이동
2. "Create API Key" 클릭
3. 이름: "VIREX Production"
4. 권한: "Sending access"
5. 생성된 API 키 복사 (re_xxxxxxxxxx 형태)

## 2. Supabase 환경 변수 설정

### 2.1 Edge Function Secrets 설정
Supabase Dashboard에서 다음 환경 변수들을 설정하세요:

```bash
# Resend API 키
RESEND_API_KEY=re_xxxxxxxxxx

# 관리자 이메일 (문의사항 알림 수신)
ADMIN_EMAIL=sales@virex.co.kr
```

### 2.2 설정 방법
1. Supabase Dashboard > Project Settings > Edge Functions
2. "Add new secret" 클릭
3. 위 환경 변수들을 각각 추가

## 3. Edge Functions 배포

### 3.1 Supabase CLI 설치 및 로그인
```bash
# CLI 설치 (macOS)
brew install supabase/tap/supabase

# 또는 npm으로 설치
npm install -g supabase

# 로그인
supabase login
```

### 3.2 프로젝트 링크
```bash
# 프로젝트 루트 디렉토리에서 실행
cd /Users/kimjunha/Desktop/fuck
supabase link --project-ref YOUR_PROJECT_REF
```

### 3.3 Edge Functions 배포
```bash
# 뉴스레터 알림 함수 배포
supabase functions deploy send-newsletter-notification

# 문의사항 알림 함수 배포
supabase functions deploy send-inquiry-notification

# 또는 모든 함수 한번에 배포
supabase functions deploy
```

## 4. 테스트

### 4.1 뉴스레터 구독 테스트
1. 웹사이트에서 뉴스레터 구독 시도
2. 구독 완료 후 이메일 수신 확인

### 4.2 문의사항 테스트
1. 웹사이트에서 문의사항 작성
2. 고객 확인 이메일 수신 확인
3. 관리자 알림 이메일 수신 확인

## 5. 모니터링

### 5.1 Edge Function 로그 확인
```bash
# 실시간 로그 확인
supabase functions logs send-newsletter-notification
supabase functions logs send-inquiry-notification
```

### 5.2 Resend Dashboard
- https://resend.com/emails 에서 발송 상태 확인
- 전송 성공/실패율 모니터링
- 바운스/스팸 신고 확인

## 6. 문제 해결

### 6.1 일반적인 문제들

**이메일이 발송되지 않는 경우:**
1. RESEND_API_KEY 환경변수 확인
2. Resend 도메인 인증 상태 확인
3. Edge Function 로그 확인

**스팸 폴더로 분류되는 경우:**
1. SPF, DKIM, DMARC 레코드 설정
2. 발신자 이메일을 noreply@virex.co.kr로 설정
3. 이메일 내용에 스팸 키워드 제거

**배포 오류:**
```bash
# 로그인 상태 확인
supabase status

# 다시 로그인
supabase login

# 프로젝트 재링크
supabase link --project-ref YOUR_PROJECT_REF
```

## 7. 추가 개선사항

### 7.1 이메일 템플릿 개선
- 로고 이미지 추가
- 반응형 디자인 개선
- 다국어 지원

### 7.2 발송 이력 저장
- 이메일 발송 로그 DB 저장
- 재발송 기능 구현
- 발송 실패 알림

### 7.3 고급 기능
- 이메일 큐 시스템
- 템플릿 A/B 테스트
- 개인화된 이메일 내용

## 8. 보안 고려사항

1. **API 키 보안**: Supabase Secrets에만 저장, 코드에 하드코딩 금지
2. **이메일 검증**: 발송 전 이메일 주소 유효성 검증
3. **스팸 방지**: 발송량 제한, 차단 목록 관리
4. **로깅**: 민감정보 제외한 로그만 저장

## 9. 비용 관리

### Resend 요금제
- **Free**: 월 3,000개 이메일 무료
- **Pro**: 월 $20 (50,000개 이메일)
- **Business**: 맞춤형 요금

### 예상 사용량
- 뉴스레터: 월 500-1,000개
- 문의사항: 월 100-300개
- **총 예상**: 월 600-1,300개 (Free 플랜으로 충분)

---

## 📞 지원 문의

설정 중 문제가 발생하면 다음으로 연락주세요:
- **이메일**: tech@virex.co.kr
- **전화**: 02-2107-1799