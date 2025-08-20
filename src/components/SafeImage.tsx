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

  // src 변경 시 상태 초기화
  useEffect(() => {
    setCurrentSrc(src)
    setIsHidden(false)
    setImageError(false)
  }, [src])

  const handleError = () => {
    console.log('SafeImage: Image load error for:', currentSrc)
    setImageError(true)
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      // fallback 이미지가 있고, 아직 시도하지 않았다면 fallback으로 시도
      console.log('SafeImage: Trying fallback:', fallbackSrc)
      setCurrentSrc(fallbackSrc)
    } else {
      // fallback이 없거나 fallback도 실패한 경우
      if (hideOnError) {
        console.log('SafeImage: Hiding image due to error')
        setIsHidden(true)
      }
    }
    
    onImageError?.()
  }

  // 이미지를 숨겨야 하는 경우
  if (isHidden) {
    console.log('SafeImage: Image hidden')
    return null
  }

  // src가 없는 경우도 숨김
  if (!currentSrc || currentSrc.trim() === '') {
    console.log('SafeImage: No src provided, hiding')
    return null
  }

  return (
    <img 
      {...props}
      src={currentSrc}
      alt={alt}
      style={style}
      onError={handleError}
      onLoad={() => console.log('SafeImage: Image loaded successfully:', currentSrc)}
    />
  )
}