'use client'

import { useState, useEffect, ImgHTMLAttributes } from 'react'

interface SafeImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
  src: string
  alt: string
  onImageError?: () => void
  fallbackSrc?: string
  hideOnError?: boolean // 404 시 숨김 여부 (기본값: true)
}

export default function SafeImage({ 
  src, 
  alt, 
  onImageError, 
  fallbackSrc,
  hideOnError = true,
  style,
  ...props 
}: SafeImageProps) {
  const [isHidden, setIsHidden] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isValidImage, setIsValidImage] = useState(false)

  // 이미지 존재 여부를 사전 검증하는 함수
  const validateImage = async (imageSrc: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image()
      
      img.onload = () => {
        // 실제 이미지인지 확인 (1x1픽셀 등 가짜 이미지 제외)
        const isRealImage = img.naturalWidth > 1 && img.naturalHeight > 1
        resolve(isRealImage)
      }
      
      img.onerror = () => {
        resolve(false)
      }
      
      // 캐시 우회를 위해 타임스탬프 추가
      const separator = imageSrc.includes('?') ? '&' : '?'
      img.src = `${imageSrc}${separator}_t=${Date.now()}`
    })
  }

  // src 변경 시 상태 초기화 및 사전 검증
  useEffect(() => {
    let isMounted = true
    
    const initializeImage = async () => {
      setCurrentSrc(src)
      setIsHidden(false)
      setImageError(false)
      setIsLoading(true)
      setIsValidImage(false)

      // 빈 src 체크
      if (!src || src.trim() === '') {
        if (isMounted) {
          setIsHidden(true)
          setIsLoading(false)
        }
        return
      }

      // 이미지 사전 검증
      const isValid = await validateImage(src)
      
      if (!isMounted) return // 컴포넌트가 언마운트된 경우 중단
      
      if (!isValid) {
        // 사전 검증 실패 시 fallback 시도
        if (fallbackSrc && fallbackSrc !== src) {
          const fallbackValid = await validateImage(fallbackSrc)
          
          if (!isMounted) return
          
          if (fallbackValid) {
            setCurrentSrc(fallbackSrc)
            setIsValidImage(true)
          } else {
            if (hideOnError) {
              setIsHidden(true)
            }
          }
        } else {
          if (hideOnError) {
            setIsHidden(true)
          }
        }
        setIsLoading(false)
      } else {
        setIsValidImage(true)
        setIsLoading(false)
      }
    }

    initializeImage()
    
    return () => {
      isMounted = false
    }
  }, [src, fallbackSrc, hideOnError])

  const handleError = () => {
    setImageError(true)
    setIsLoading(false)
    
    if (fallbackSrc && currentSrc !== fallbackSrc && !imageError) {
      setCurrentSrc(fallbackSrc)
    } else {
      if (hideOnError) {
        setIsHidden(true)
      }
    }
    
    onImageError?.()
  }

  const handleLoad = () => {
    setIsLoading(false)
    setIsValidImage(true)
    setImageError(false)
  }

  // 숨김 조건들
  if (isHidden) {
    return null
  }

  // 로딩 중이면서 유효하지 않은 이미지인 경우 숨김
  if (isLoading && !isValidImage) {
    return null
  }

  // src가 없는 경우도 숨김
  if (!currentSrc || currentSrc.trim() === '') {
    return null
  }

  return (
    <img 
      {...props}
      src={currentSrc}
      alt={alt}
      style={style}
      onError={handleError}
      onLoad={handleLoad}
    />
  )
}