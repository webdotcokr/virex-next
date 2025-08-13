'use client';

import { useEffect, useRef } from 'react';

interface KakaoMapProps {
  timestamp: string;
  mapKey: string;
}

export default function KakaoMap({ timestamp, mapKey }: KakaoMapProps) {
  const mapInitialized = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 10;

  useEffect(() => {
    if (mapInitialized.current) return;

    loadKakaoMapScript();
  }, [timestamp, mapKey]);

  const loadKakaoMapScript = () => {
    // 이미 스크립트가 로드되었는지 확인
    if (document.querySelector('.daum_roughmap_loader_script')) {
      checkAndInitializeMap();
      return;
    }

    // 스크립트 동적으로 로드
    const script = document.createElement('script');
    script.charset = 'UTF-8';
    script.className = 'daum_roughmap_loader_script';
    script.src = 'https://ssl.daumcdn.net/dmaps/map_js_init/roughmapLoader.js';
    
    script.onload = () => {
      console.log('Kakao map script loaded');
      checkAndInitializeMap();
    };
    
    script.onerror = () => {
      console.error('Failed to load Kakao map script');
    };

    document.head.appendChild(script);
  };

  const checkAndInitializeMap = () => {
    const checkInterval = setInterval(() => {
      retryCount.current++;
      
      if (typeof window !== 'undefined' && (window as any).daum?.roughmap?.Lander) {
        clearInterval(checkInterval);
        initializeMap();
      } else if (retryCount.current >= maxRetries) {
        clearInterval(checkInterval);
        console.error('Failed to load Kakao map after', maxRetries, 'attempts');
        // Fallback: 정적 이미지 또는 메시지 표시
        showFallbackMap();
      } else {
        console.log(`Waiting for Kakao map to load... attempt ${retryCount.current}/${maxRetries}`);
      }
    }, 500); // 500ms마다 체크
  };

  const initializeMap = () => {
    try {
      if (mapInitialized.current) return;
      
      new (window as any).daum.roughmap.Lander({
        timestamp: timestamp,
        key: mapKey,
        mapWidth: "100%",
        mapHeight: "100%"
      }).render();
      
      mapInitialized.current = true;
      console.log('Kakao map initialized successfully');
    } catch (error) {
      console.error('Error initializing Kakao map:', error);
      showFallbackMap();
    }
  };

  const showFallbackMap = () => {
    const container = document.getElementById(`daumRoughmapContainer${timestamp}`);
    if (container) {
      container.innerHTML = `
        <div style="
          width: 100%; 
          height: 400px; 
          background: #f8f9fa; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          border: 1px solid #dee2e6;
          border-radius: 0.5rem;
          flex-direction: column;
          color: #6c757d;
        ">
          <div style="margin-bottom: 10px;">📍</div>
          <div>지도를 불러올 수 없습니다</div>
          <div style="font-size: 14px; margin-top: 5px;">경기도 안양시 동안구 흥안대로 427번길38, 1214호</div>
        </div>
      `;
    }
  };

  return (
    <div 
      id={`daumRoughmapContainer${timestamp}`}
      className="root_daum_roughmap root_daum_roughmap_landing"
      style={{ width: '100%', height: '400px' }}
    />
  );
}