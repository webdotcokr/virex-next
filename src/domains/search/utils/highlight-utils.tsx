import React from 'react'

/**
 * 텍스트에서 검색어를 하이라이트 처리하는 함수
 */
export function highlightSearchTerm(text: string, searchTerm: string): React.ReactNode {
  if (!text || !searchTerm) {
    return text
  }

  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, index) => {
    if (regex.test(part)) {
      return (
        <span 
          key={index} 
          style={{ 
            backgroundColor: '#566BDA', 
            color: 'white', 
            padding: '1px 3px', 
            borderRadius: '2px',
            fontWeight: 'bold'
          }}
        >
          {part}
        </span>
      )
    }
    return part
  })
}

/**
 * 정규 표현식에서 특수 문자를 이스케이프하는 함수
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 텍스트를 지정된 길이로 자르고 검색어 주변을 표시하는 함수
 */
export function getTextExcerpt(text: string, searchTerm: string, maxLength: number = 150): string {
  if (!text || text.length <= maxLength) {
    return text
  }

  if (!searchTerm) {
    return text.substring(0, maxLength) + '...'
  }

  const regex = new RegExp(escapeRegExp(searchTerm), 'gi')
  const match = text.match(regex)
  
  if (!match) {
    return text.substring(0, maxLength) + '...'
  }

  const matchIndex = text.toLowerCase().indexOf(searchTerm.toLowerCase())
  const start = Math.max(0, matchIndex - Math.floor(maxLength / 2))
  const end = Math.min(text.length, start + maxLength)
  
  let excerpt = text.substring(start, end)
  
  if (start > 0) {
    excerpt = '...' + excerpt
  }
  
  if (end < text.length) {
    excerpt = excerpt + '...'
  }
  
  return excerpt
}

/**
 * 검색어를 볼드 처리하는 함수 (React 컴포넌트가 아닌 HTML 문자열)
 */
export function boldSearchTerm(text: string, searchTerm: string): string {
  if (!text || !searchTerm) {
    return text
  }

  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi')
  return text.replace(regex, '<strong>$1</strong>')
}