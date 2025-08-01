import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateProductSlug(partnumber: string, series: string): string {
  return `${partnumber}-${series}`.toLowerCase().replace(/[^a-z0-9-]/g, '-')
}

export function formatPrice(price: number, currency = 'KRW'): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function formatParameterValue(
  value: string,
  type: 'text' | 'number' | 'boolean' | 'select'
): string {
  switch (type) {
    case 'boolean':
      return value === 'true' ? '예' : '아니오'
    case 'number':
      return parseFloat(value).toLocaleString('ko-KR')
    default:
      return value
  }
}

export function buildFilterUrl(filters: Record<string, unknown>): string {
  const params = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(','))
      } else if (!Array.isArray(value)) {
        params.set(key, String(value))
      }
    }
  })
  
  return params.toString() ? `?${params.toString()}` : ''
}