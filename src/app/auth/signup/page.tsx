'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import PageContentContainer from '@/components/PageContentContainer'
import FormField from '@/components/auth/FormField'
import PhoneField from '@/components/auth/PhoneField'
import CheckboxField from '@/components/auth/CheckboxField'

interface FormData {
  email: string
  password: string
  confirmPassword: string
  name: string
  phone1: string
  phone2: string
  phone3: string
  mobile1: string
  mobile2: string
  mobile3: string
  postcode: string
  address_basic: string
  address_detail: string
  company: string
  department: string
  agree_terms: boolean
  agree_privacy: boolean
  agree_marketing: boolean
}

interface FormErrors {
  [key: string]: string
}

function SignupPage() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone1: '',
    phone2: '',
    phone3: '',
    mobile1: '',
    mobile2: '',
    mobile3: '',
    postcode: '',
    address_basic: '',
    address_detail: '',
    company: '',
    department: '',
    agree_terms: false,
    agree_privacy: false,
    agree_marketing: false,
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [generalError, setGeneralError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  useEffect(() => {
    if (user) {
      router.push(redirectTo)
    }
  }, [user, router, redirectTo])

  // 입력 값 변경 핸들러
  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 입력 시 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // 필수 입력 검사
    if (!formData.email) newErrors.email = '이메일을 입력해주세요.'
    if (!formData.password) newErrors.password = '비밀번호를 입력해주세요.'
    if (!formData.confirmPassword) newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.'
    if (!formData.name) newErrors.name = '이름을 입력해주세요.'

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.'
    }

    // 비밀번호 검사
    if (formData.password && formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.'
    }

    // 비밀번호 확인 검사
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }

    // 필수 약관 동의 검사
    if (!formData.agree_terms) {
      newErrors.agree_terms = '이용약관에 동의해주세요.'
    }
    if (!formData.agree_privacy) {
      newErrors.agree_privacy = '개인정보처리방침에 동의해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setGeneralError('')
    setSuccess(false)

    if (!validateForm()) {
      setLoading(false)
      return
    }

    const { error } = await signUp({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone1: formData.phone1,
      phone2: formData.phone2,
      phone3: formData.phone3,
      mobile1: formData.mobile1,
      mobile2: formData.mobile2,
      mobile3: formData.mobile3,
      postcode: formData.postcode,
      address_basic: formData.address_basic,
      address_detail: formData.address_detail,
      company: formData.company,
      department: formData.department,
      agree_terms: formData.agree_terms,
      agree_privacy: formData.agree_privacy,
      agree_marketing: formData.agree_marketing,
    })
    
    if (error) {
      setGeneralError(error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "회원가입" }
  ]

  if (success) {
    return (
      <PageContentContainer
        backgroundClass="auth-header-background"
        backgroundImage="/img/bg-support.webp"
        breadcrumbs={breadcrumbs}
        titleEn="Member Signup"
        titleKo="회원 가입"
      >
        <div className="auth-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ 
            color: '#28a745', 
            backgroundColor: '#d4edda', 
            border: '1px solid #c3e6cb',
            padding: '30px',
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '24px' }}>회원가입이 완료되었습니다!</h3>
            <p style={{ margin: '0', fontSize: '16px', lineHeight: '1.5' }}>
              회원가입이 정상적으로 처리되었습니다.<br />
              이메일을 확인하여 계정을 활성화한 후 로그인해주세요.
            </p>
          </div>
          
          <Link 
            href="/auth/login"
            style={{
              display: 'inline-block',
              padding: '15px 30px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            로그인 페이지로 이동
          </Link>
        </div>
      </PageContentContainer>
    )
  }

  return (
    <PageContentContainer
      backgroundClass="auth-header-background"
      backgroundImage="/img/bg-support.webp"
      breadcrumbs={breadcrumbs}
      titleEn="Member Signup"
      titleKo="회원 가입"
    >
      <div className="auth-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {generalError && (
            <div style={{ 
              color: '#dc3545', 
              backgroundColor: '#f8d7da', 
              border: '1px solid #f5c6cb',
              padding: '15px',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              {generalError}
            </div>
          )}
          
          {/* 기본 정보 섹션 */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '8px' }}>
              기본 정보
            </h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <FormField
                id="email"
                label="이메일"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="example@email.com"
                required
                error={errors.email}
              />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormField
                  id="password"
                  label="비밀번호"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  placeholder="최소 6자 이상"
                  required
                  error={errors.password}
                />
                
                <FormField
                  id="confirmPassword"
                  label="비밀번호 확인"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  placeholder="비밀번호 재입력"
                  required
                  error={errors.confirmPassword}
                />
              </div>
              
              <FormField
                id="name"
                label="이름"
                value={formData.name}
                onChange={handleInputChange('name')}
                placeholder="홍길동"
                required
                error={errors.name}
              />
            </div>
          </div>

          {/* 연락처 정보 섹션 */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '8px' }}>
              연락처 정보
            </h3>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              <PhoneField
                label="전화번호"
                phone1={formData.phone1}
                phone2={formData.phone2}
                phone3={formData.phone3}
                onPhone1Change={handleInputChange('phone1')}
                onPhone2Change={handleInputChange('phone2')}
                onPhone3Change={handleInputChange('phone3')}
              />
              
              <PhoneField
                label="휴대폰번호"
                phone1={formData.mobile1}
                phone2={formData.mobile2}
                phone3={formData.mobile3}
                onPhone1Change={handleInputChange('mobile1')}
                onPhone2Change={handleInputChange('mobile2')}
                onPhone3Change={handleInputChange('mobile3')}
              />
            </div>
          </div>

          {/* 주소 정보 섹션 */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '8px' }}>
              주소 정보
            </h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <FormField
                id="postcode"
                label="우편번호"
                value={formData.postcode}
                onChange={handleInputChange('postcode')}
                placeholder="12345"
              />
              
              <FormField
                id="address_basic"
                label="기본주소"
                value={formData.address_basic}
                onChange={handleInputChange('address_basic')}
                placeholder="서울특별시 강남구 테헤란로"
              />
              
              <FormField
                id="address_detail"
                label="상세주소"
                value={formData.address_detail}
                onChange={handleInputChange('address_detail')}
                placeholder="123동 456호"
              />
            </div>
          </div>

          {/* 회사 정보 섹션 */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '8px' }}>
              회사 정보
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <FormField
                id="company"
                label="회사명"
                value={formData.company}
                onChange={handleInputChange('company')}
                placeholder="(주)바이렉스"
              />
              
              <FormField
                id="department"
                label="부서명"
                value={formData.department}
                onChange={handleInputChange('department')}
                placeholder="개발팀"
              />
            </div>
          </div>

          {/* 약관 동의 섹션 */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '8px' }}>
              약관 동의
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <CheckboxField
                id="agree_terms"
                label={<span><strong>이용약관</strong>에 동의합니다</span>}
                checked={formData.agree_terms}
                onChange={handleInputChange('agree_terms')}
                required
                error={errors.agree_terms}
              />
              
              <CheckboxField
                id="agree_privacy"
                label={<span><strong>개인정보처리방침</strong>에 동의합니다</span>}
                checked={formData.agree_privacy}
                onChange={handleInputChange('agree_privacy')}
                required
                error={errors.agree_privacy}
              />
              
              <CheckboxField
                id="agree_marketing"
                label="마케팅 정보 수신에 동의합니다 (선택)"
                checked={formData.agree_marketing}
                onChange={handleInputChange('agree_marketing')}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '16px 24px',
              backgroundColor: loading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '20px'
            }}
          >
            {loading ? '가입 처리 중...' : '회원가입 완료'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #dee2e6' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>
              이미 계정이 있으신가요?{' '}
              <Link 
                href={`/auth/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                style={{ color: '#007bff', textDecoration: 'none', fontWeight: '500' }}
              >
                로그인
              </Link>
            </span>
          </div>
        </form>
      </div>
    </PageContentContainer>
  )
}

export default function SignupPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupPage />
    </Suspense>
  )
}