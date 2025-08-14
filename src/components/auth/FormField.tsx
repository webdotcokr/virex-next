import React from 'react'

interface FormFieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  error?: string
  disabled?: boolean
}

export default function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false
}: FormFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label htmlFor={id} style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
        {label}
        {required && <span style={{ color: '#dc3545', marginLeft: '2px' }}>*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={{
          padding: '12px',
          border: error ? '1px solid #dc3545' : '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '16px',
          backgroundColor: disabled ? '#f8f9fa' : 'white',
          color: disabled ? '#6c757d' : '#333'
        }}
      />
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