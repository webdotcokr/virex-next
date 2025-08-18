'use client'

import React from 'react'

export interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'file'
  value?: any
  onChange?: (value: any) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  options?: Array<{ value: any; label: string }>
  rows?: number
  accept?: string
  multiple?: boolean
  description?: string
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  options = [],
  rows = 4,
  accept,
  multiple = false,
  description
}: FormFieldProps) {
  const baseInputClasses = `
    w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
  `

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            rows={rows}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={baseInputClasses}
          />
        )

      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            required={required}
            disabled={disabled}
            className={baseInputClasses}
          >
            <option value="">{placeholder || '선택하세요'}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={name}
              name={name}
              checked={value || false}
              onChange={(e) => onChange?.(e.target.checked)}
              disabled={disabled}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={name} className="ml-3 text-sm text-gray-700">
              {description || label}
            </label>
          </div>
        )

      case 'file':
        return (
          <input
            type="file"
            id={name}
            name={name}
            onChange={(e) => onChange?.(multiple ? e.target.files : e.target.files?.[0])}
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            className={`
              w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              file:mr-4 file:py-1 file:px-4 file:rounded file:border-0
              file:text-sm file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            `}
          />
        )

      default:
        return (
          <input
            type={type}
            id={name}
            name={name}
            value={value || ''}
            onChange={(e) => onChange?.(type === 'number' ? Number(e.target.value) : e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={baseInputClasses}
          />
        )
    }
  }

  if (type === 'checkbox') {
    return (
      <div className="mb-4">
        {renderInput()}
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {description && type !== 'checkbox' && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}