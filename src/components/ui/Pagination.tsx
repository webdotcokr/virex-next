'use client'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showEllipsis?: boolean
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  showEllipsis = true 
}: PaginationProps) {
  if (totalPages <= 1) return null

  const generatePageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    
    // 총 페이지가 5 이하인 경우 모든 페이지 표시
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
      return pages
    }

    // 5 이상인 경우 ellipsis 로직 적용
    if (showEllipsis) {
      // 처음 페이지들 (1, 2, 3)
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
      // 마지막 페이지들 (n-2, n-1, n)
      else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      }
      // 중간 페이지들
      else {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    } else {
      // ellipsis 없이 모든 페이지 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  const pageNumbers = generatePageNumbers()

  return (
    <div className="pagination">
      {/* Previous Button */}
      {currentPage > 1 && (
        <span 
          className="prev" 
          onClick={() => onPageChange(currentPage - 1)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onPageChange(currentPage - 1)
            }
          }}
        />
      )}

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => (
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="ellipsis">...</span>
        ) : (
          <span
            key={page}
            className={`page ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onPageChange(page)
              }
            }}
          >
            {page}
          </span>
        )
      ))}

      {/* Next Button */}
      {currentPage < totalPages && (
        <span 
          className="next" 
          onClick={() => onPageChange(currentPage + 1)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onPageChange(currentPage + 1)
            }
          }}
        />
      )}
    </div>
  )
}