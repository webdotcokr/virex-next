'use client';

import { useEffect, useRef, useState } from 'react';

interface KakaoMapProps {
  /** 위도 (기본값: 37.3863) */
  latitude?: number;
  /** 경도 (기본값: 126.9507) */
  longitude?: number;
  /** 지도 확대 레벨 1-14 (기본값: 3) */
  level?: number;
  /** 지도 컨테이너 너비 (기본값: '100%') */
  width?: string;
  /** 지도 컨테이너 높이 (기본값: '400px') */
  height?: string;
  /** 마커 제목 (기본값: '바이렉스') */
  markerTitle?: string;
  /** CSS 클래스명 */
  className?: string;
  /** 지도 로드 완료 콜백 */
  onMapLoad?: () => void;
  /** 에러 발생 콜백 */
  onError?: (error: string) => void;
}

interface KakaoMapSDK {
  maps: {
    LatLng: new (lat: number, lng: number) => any;
    Map: new (container: HTMLElement, options: any) => any;
    Marker: new (options: any) => any;
    InfoWindow: new (options: any) => any;
    event: {
      addListener: (target: any, type: string, handler: () => void) => void;
    };
    load: (callback: () => void) => void;
  };
}

declare global {
  interface Window {
    kakao: KakaoMapSDK;
  }
}

export default function KakaoMap({ 
  latitude = 37.3863,  // 기본값: 바이렉스 본사 위치 (대략적)
  longitude = 126.9507,
  level = 3,
  width = '100%',
  height = '400px',
  markerTitle = '바이렉스',
  className = '',
  onMapLoad,
  onError
}: KakaoMapProps) {
  // Props 유효성 검사
  const validatedLevel = Math.max(1, Math.min(14, level));
  const validatedLatitude = Math.max(-90, Math.min(90, latitude));
  const validatedLongitude = Math.max(-180, Math.min(180, longitude));
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    loadKakaoMapScript();
  }, []);

  useEffect(() => {
    if (map.current) {
      // 위치가 변경되면 지도 업데이트
      updateMapLocation();
    }
  }, [validatedLatitude, validatedLongitude, validatedLevel]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current = null;
      }
    };
  }, []);

  const loadKakaoMapScript = () => {
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
    
    if (!apiKey) {
      const errorMsg = '카카오맵 API 키가 설정되지 않았습니다.';
      setError(errorMsg);
      setIsLoading(false);
      onError?.(errorMsg);
      return;
    }

    // 이미 스크립트가 로드되었는지 확인
    if (window.kakao && window.kakao.maps) {
      initializeMap();
      return;
    }

    // 카카오맵 스크립트 동적 로드
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    
    script.onload = () => {
      // 카카오맵 스크립트 로드 후 지도 초기화
      window.kakao.maps.load(() => {
        initializeMap();
      });
    };
    
    script.onerror = () => {
      if (retryCount < maxRetries) {
        console.warn(`카카오맵 스크립트 로드 실패, 재시도 중... (${retryCount + 1}/${maxRetries})`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadKakaoMapScript(), 1000 * (retryCount + 1)); // 점진적 백오프
      } else {
        const errorMsg = '카카오맵 스크립트를 불러올 수 없습니다. 네트워크 연결을 확인해주세요.';
        setError(errorMsg);
        setIsLoading(false);
        onError?.(errorMsg);
      }
    };

    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapContainer.current || !window.kakao || !window.kakao.maps) {
      const errorMsg = '지도를 초기화할 수 없습니다.';
      setError(errorMsg);
      setIsLoading(false);
      onError?.(errorMsg);
      return;
    }

    try {
      const options = {
        center: new window.kakao.maps.LatLng(validatedLatitude, validatedLongitude),
        level: validatedLevel
      };

      // 지도 생성
      map.current = new window.kakao.maps.Map(mapContainer.current, options);

      // 마커 생성 및 추가
      const markerPosition = new window.kakao.maps.LatLng(validatedLatitude, validatedLongitude);
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        title: markerTitle
      });
      marker.setMap(map.current);

      // 인포윈도우 생성
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px;font-size:12px;color:#333;">${markerTitle}</div>`
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        infowindow.open(map.current, marker);
      });

      setIsLoading(false);
      setError(null);
      onMapLoad?.();
    } catch (err) {
      console.error('카카오맵 초기화 오류:', err);
      const errorMsg = '지도를 초기화하는 중 오류가 발생했습니다.';
      setError(errorMsg);
      setIsLoading(false);
      onError?.(errorMsg);
    }
  };

  const updateMapLocation = () => {
    if (!map.current || !window.kakao) return;

    const moveLatLon = new window.kakao.maps.LatLng(validatedLatitude, validatedLongitude);
    map.current.setCenter(moveLatLon);
    map.current.setLevel(validatedLevel);
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setRetryCount(0);
    loadKakaoMapScript();
  };

  const showFallbackContent = () => (
    <div style={{
      width: '100%',
      height: height,
      background: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #dee2e6',
      borderRadius: '0.5rem',
      flexDirection: 'column',
      color: '#6c757d',
      fontSize: '14px',
      padding: '20px'
    }}>
      <div style={{ marginBottom: '10px', fontSize: '24px' }}>📍</div>
      <div style={{ marginBottom: '15px', textAlign: 'center' }}>
        {error || '지도를 불러올 수 없습니다'}
      </div>
      <div style={{ fontSize: '12px', textAlign: 'center', opacity: 0.7, marginBottom: '15px' }}>
        경기도 안양시 동안구 흥안대로 427번길38, 1214호<br/>
        (관양동, 인덕원성지스타위드)
      </div>
      <button
        onClick={handleRetry}
        style={{
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease'
        }}
        onMouseOver={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#0056b3';
        }}
        onMouseOut={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#007bff';
        }}
      >
        다시 시도
      </button>
    </div>
  );

  if (error) {
    return showFallbackContent();
  }

  return (
    <div className={className} style={{ position: 'relative', width, height }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #dee2e6',
          borderRadius: '0.5rem',
          zIndex: 10
        }}>
          <div style={{ color: '#6c757d' }}>지도를 불러오는 중...</div>
        </div>
      )}
      <div 
        ref={mapContainer}
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '0.5rem',
          overflow: 'hidden'
        }}
      />
    </div>
  );
}