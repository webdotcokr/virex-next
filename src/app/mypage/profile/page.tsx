'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import FormField from '@/components/auth/FormField'
import PhoneField from '@/components/auth/PhoneField'
import CheckboxField from '@/components/auth/CheckboxField'

interface ProfileFormData {
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
  agree_marketing: boolean
}

interface FormErrors {
  [key: string]: string
}

export default function ProfileEditPage() {
  const { profile, refreshProfile } = useAuth()
  const [formData, setFormData] = useState<ProfileFormData>({
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
    agree_marketing: false,
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [generalError, setGeneralError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // 프로필 데이터로 폼 초기화
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone1: profile.phone1 || '',
        phone2: profile.phone2 || '',
        phone3: profile.phone3 || '',
        mobile1: profile.mobile1 || '',
        mobile2: profile.mobile2 || '',
        mobile3: profile.mobile3 || '',
        postcode: profile.postcode || '',
        address_basic: profile.address_basic || '',
        address_detail: profile.address_detail || '',
        company: profile.company || '',
        department: profile.department || '',
        agree_marketing: profile.agree_marketing || false,
      })
    }
  }, [profile])

  // 입력 값 변경 핸들러
  const handleInputChange = (field: keyof ProfileFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 입력 시 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // 성공 메시지 제거
    if (successMessage) {
      setSuccessMessage('')
    }
  }

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // 필수 입력 검사
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setGeneralError('')
    setSuccessMessage('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccessMessage('회원정보가 성공적으로 수정되었습니다.')
        // AuthContext의 프로필 정보 새로고침
        await refreshProfile()
      } else {
        setGeneralError(result.error || '회원정보 수정 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      setGeneralError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>프로필 정보를 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
          회원정보 수정
        </h1>
        <p style={{ fontSize: '16px', color: '#666' }}>
          회원정보를 수정하고 최신 상태로 유지하세요
        </p>
      </div>

      {/* 수정 불가 정보 안내 */}
      <div style={{ 
        backgroundColor: '#e3f2fd', 
        padding: '20px', 
        borderRadius: '6px', 
        marginBottom: '30px',
        border: '1px solid #bbdefb'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#1565c0' }}>
          📝 수정 가능한 정보
        </h3>
        <p style={{ fontSize: '14px', color: '#1976d2', margin: '0', lineHeight: '1.5' }}>
          이메일과 비밀번호는 보안상 이유로 별도의 절차를 통해 변경 가능합니다.<br />
          아래 정보들을 자유롭게 수정하실 수 있습니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* 성공/오류 메시지 */}
        {successMessage && (
          <div style={{ 
            color: '#28a745', 
            backgroundColor: '#d4edda', 
            border: '1px solid #c3e6cb',
            padding: '15px',
            borderRadius: '6px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {successMessage}
          </div>
        )}

        {generalError && (
          <div style={{ 
            color: '#dc3545', 
            backgroundColor: '#f8d7da', 
            border: '1px solid #f5c6cb',
            padding: '15px',
            borderRadius: '6px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {generalError}
          </div>
        )}
        
        {/* 기본 정보 섹션 */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '8px' }}>
            기본 정보
          </h3>
          
          <div style={{ display: 'grid', gap: '20px' }}>
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
        <div>
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
        <div>
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
        <div>
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

        {/* 마케팅 수신 설정 */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '8px' }}>
            마케팅 수신 설정
          </h3>
          
          <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
            <CheckboxField
              id="agree_marketing"
              label="마케팅 정보 수신에 동의합니다 (신제품 소식, 이벤트 안내 등)"
              checked={formData.agree_marketing}
              onChange={handleInputChange('agree_marketing')}
            />
            
            <p style={{ fontSize: '12px', color: '#666', marginTop: '12px', marginBottom: '0' }}>
              마케팅 정보 수신에 동의하시면 새로운 제품 소식과 특별 혜택을 이메일로 받아보실 수 있습니다.
            </p>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div style={{ paddingTop: '20px', borderTop: '1px solid #dee2e6' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '16px 32px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginRight: '12px'
            }}
          >
            {loading ? '수정 중...' : '회원정보 수정'}
          </button>
          
          <button
            type="button"
            onClick={() => window.history.back()}
            style={{
              padding: '16px 32px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}