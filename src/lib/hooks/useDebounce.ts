import { useCallback, useRef } from 'react'

export function useDebounce<TArgs extends unknown[]>(
  func: (...args: TArgs) => void | Promise<void>,
  delay: number
): (...args: TArgs) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedFunc = useCallback(
    (...args: TArgs) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        func(...args)
      }, delay)
    },
    [func, delay]
  )

  return debouncedFunc
}