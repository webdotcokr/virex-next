'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import FormField from '@/components/auth/FormField'

interface FormErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export default function PasswordChangePage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { user } = useAuth()

  const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPassword(e.target.value)
    if (errors.currentPassword) {
      setErrors(prev => ({ ...prev, currentPassword: '' }))
    }
  }

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value)
    if (errors.newPassword) {
      setErrors(prev => ({ ...prev, newPassword: '' }))
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // 현재 비밀번호 검사
    if (!currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요.'
    }

    // 새 비밀번호 유효성 검사
    if (!newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.'
    } else if (newPassword.length < 8) {
      newErrors.newPassword = '비밀번호는 최소 8자 이상이어야 합니다.'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = '비밀번호는 대소문자, 숫자를 포함해야 합니다.'
    } else if (currentPassword === newPassword) {
      newErrors.newPassword = '현재 비밀번호와 다른 비밀번호를 입력해주세요.'
    }

    // 비밀번호 확인 검사
    if (!confirmPassword) {
      newErrors.confirmPassword = '새 비밀번호 확인을 입력해주세요.'
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = '새 비밀번호가 일치하지 않습니다.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 현재 비밀번호 검증
  const verifyCurrentPassword = async (): Promise<boolean> => {
    try {
      if (!user?.email) return false
      
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      return !error
    } catch (error) {
      return false
    }
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

    try {
      // 1. 현재 비밀번호 검증
      const isCurrentPasswordValid = await verifyCurrentPassword()
      if (!isCurrentPasswordValid) {
        setErrors(prev => ({ ...prev, currentPassword: '현재 비밀번호가 올바르지 않습니다.' }))
        setLoading(false)
        return
      }

      // 2. 새 비밀번호로 업데이트
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      })

      if (error) {
        if (error.message.includes('Password should be at least')) {
          setGeneralError('비밀번호는 최소 6자 이상이어야 합니다.')
        } else {
          setGeneralError('비밀번호 변경 중 오류가 발생했습니다.')
        }
      } else {
        setSuccess(true)
        // 폼 초기화
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (error) {
      setGeneralError('비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
          비밀번호 변경
        </h1>
        <p style={{ fontSize: '16px', color: '#666', margin: '0' }}>
          계정 보안을 위해 정기적으로 비밀번호를 변경해주세요
        </p>
      </div>

      {success && (
        <div style={{ 
          color: '#155724', 
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb',
          padding: '15px',
          borderRadius: '6px',
          fontSize: '14px',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <svg width="16" height="16" fill="currentColor" style={{ marginRight: '8px' }} viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          비밀번호가 성공적으로 변경되었습니다.
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
        {generalError && (
          <div style={{ 
            color: '#721c24', 
            backgroundColor: '#f8d7da', 
            border: '1px solid #f5c6cb',
            padding: '15px',
            borderRadius: '6px',
            fontSize: '14px',
            marginBottom: '30px'
          }}>
            {generalError}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <FormField
            id="currentPassword"
            label="현재 비밀번호"
            type="password"
            value={currentPassword}
            onChange={handleCurrentPasswordChange}
            placeholder="현재 비밀번호를 입력하세요"
            required
            error={errors.currentPassword}
            disabled={loading}
          />

          <div style={{ height: '1px', backgroundColor: '#dee2e6', margin: '10px 0' }} />

          <FormField
            id="newPassword"
            label="새 비밀번호"
            type="password"
            value={newPassword}
            onChange={handleNewPasswordChange}
            placeholder="새 비밀번호를 입력하세요"
            required
            error={errors.newPassword}
            disabled={loading}
          />

          <FormField
            id="confirmPassword"
            label="새 비밀번호 확인"
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="새 비밀번호를 다시 입력하세요"
            required
            error={errors.confirmPassword}
            disabled={loading}
          />
        </div>

        {/* 비밀번호 조건 안내 */}
        <div style={{ 
          fontSize: '14px', 
          color: '#6c757d', 
          backgroundColor: '#f8f9fa',
          padding: '16px',
          borderRadius: '6px',
          borderLeft: '4px solid #007bff',
          margin: '24px 0'
        }}>
          <strong>새 비밀번호 조건:</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>최소 8자 이상</li>
            <li>대문자, 소문자, 숫자 포함</li>
            <li>현재 비밀번호와 달라야 함</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentPassword('')
              setNewPassword('')
              setConfirmPassword('')
              setErrors({})
              setGeneralError('')
              setSuccess(false)
            }}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: '#6c757d',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            초기화
          </button>
        </div>
      </form>

      {/* 보안 팁 */}
      <div style={{ 
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '6px',
        borderLeft: '4px solid #ffd93d'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#856404', marginBottom: '12px' }}>
          💡 비밀번호 보안 팁
        </h3>
        <ul style={{ fontSize: '14px', color: '#856404', margin: '0', paddingLeft: '20px' }}>
          <li>다른 사이트와 동일한 비밀번호 사용을 피하세요</li>
          <li>개인정보(생년월일, 전화번호 등)가 포함된 비밀번호는 피하세요</li>
          <li>3-6개월마다 비밀번호를 변경하는 것이 좋습니다</li>
          <li>비밀번호 관리자 사용을 권장합니다</li>
        </ul>
      </div>
    </div>
  )
}