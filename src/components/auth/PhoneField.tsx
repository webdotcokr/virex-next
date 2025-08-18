import React from 'react'

interface PhoneFieldProps {
  label: string
  phone1: string
  phone2: string
  phone3: string
  onPhone1Change: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPhone2Change: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPhone3Change: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  error?: string
  disabled?: boolean
}

export default function PhoneField({
  label,
  phone1,
  phone2,
  phone3,
  onPhone1Change,
  onPhone2Change,
  onPhone3Change,
  required = false,
  error,
  disabled = false
}: PhoneFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
        {label}
        {required && <span style={{ color: '#dc3545', marginLeft: '2px' }}>*</span>}
      </label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          value={phone1}
          onChange={onPhone1Change}
          placeholder="02"
          maxLength={4}
          disabled={disabled}
          style={{
            padding: '12px',
            border: error ? '1px solid #dc3545' : '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            width: '80px',
            textAlign: 'center',
            backgroundColor: disabled ? '#f8f9fa' : 'white',
            color: disabled ? '#6c757d' : '#333'
          }}
        />
        <span style={{ color: '#666', fontSize: '16px' }}>-</span>
        <input
          type="text"
          value={phone2}
          onChange={onPhone2Change}
          placeholder="1234"
          maxLength={4}
          disabled={disabled}
          style={{
            padding: '12px',
            border: error ? '1px solid #dc3545' : '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            width: '80px',
            textAlign: 'center',
            backgroundColor: disabled ? '#f8f9fa' : 'white',
            color: disabled ? '#6c757d' : '#333'
          }}
        />
        <span style={{ color: '#666', fontSize: '16px' }}>-</span>
        <input
          type="text"
          value={phone3}
          onChange={onPhone3Change}
          placeholder="5678"
          maxLength={4}
          disabled={disabled}
          style={{
            padding: '12px',
            border: error ? '1px solid #dc3545' : '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            width: '80px',
            textAlign: 'center',
            backgroundColor: disabled ? '#f8f9fa' : 'white',
            color: disabled ? '#6c757d' : '#333'
          }}
        />
      </div>
      {error && (
        <span style={{ 
          fontSize: '12px', 
          color: '#dc3545',
          marginTop: '4px'
        }}>
          {error}
        </span>
      )}
    </div>
  )
}