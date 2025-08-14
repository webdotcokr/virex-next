import { useState, useMemo } from 'react'

interface UsePaginationProps {
  totalCount: number
  itemsPerPage: number
  initialPage?: number
}

interface UsePaginationReturn {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  startIndex: number
  endIndex: number
  setCurrentPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void
}

export function usePagination({
  totalCount,
  itemsPerPage,
  initialPage = 1
}: UsePaginationProps): UsePaginationReturn {
  const [currentPage, setCurrentPageState] = useState(initialPage)

  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / itemsPerPage)
  }, [totalCount, itemsPerPage])

  const hasNextPage = useMemo(() => {
    return currentPage < totalPages
  }, [currentPage, totalPages])

  const hasPreviousPage = useMemo(() => {
    return currentPage > 1
  }, [currentPage])

  const startIndex = useMemo(() => {
    return (currentPage - 1) * itemsPerPage
  }, [currentPage, itemsPerPage])

  const endIndex = useMemo(() => {
    return Math.min(startIndex + itemsPerPage - 1, totalCount - 1)
  }, [startIndex, itemsPerPage, totalCount])

  const setCurrentPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPageState(page)
    }
  }

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPageState(prev => prev + 1)
    }
  }

  const previousPage = () => {
    if (hasPreviousPage) {
      setCurrentPageState(prev => prev - 1)
    }
  }

  const goToFirstPage = () => {
    setCurrentPageState(1)
  }

  const goToLastPage = () => {
    setCurrentPageState(totalPages)
  }

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    setCurrentPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage
  }
}