import React from 'react'

interface CheckboxFieldProps {
  id: string
  label: string | React.ReactNode
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  error?: string
  disabled?: boolean
}

export default function CheckboxField({
  id,
  label,
  checked,
  onChange,
  required = false,
  error,
  disabled = false
}: CheckboxFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <input
          id={id}
          name={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          required={required}
          disabled={disabled}
          style={{
            marginTop: '2px',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
        />
        <label 
          htmlFor={id} 
          style={{ 
            fontSize: '14px', 
            lineHeight: '1.4',
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: disabled ? '#6c757d' : '#333'
          }}
        >
          {label}
          {required && <span style={{ color: '#dc3545', marginLeft: '2px' }}>*</span>}
        </label>
      </div>
      {error && (
        <span style={{ 
          fontSize: '12px', 
          color: '#dc3545',
          marginLeft: '24px'
        }}>
          {error}
        </span>
      )}
    </div>
  )
}