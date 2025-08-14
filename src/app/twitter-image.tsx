import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'VIREX - 머신비전 & 광학 솔루션 전문기업'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fb',
          backgroundImage: 'linear-gradient(135deg, #566BDA 0%, #4A5BC7 100%)',
        }}
      >
        {/* Logo Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
              letterSpacing: '4px',
            }}
          >
            VIREX
          </div>
        </div>

        {/* Main Text */}
        <div
          style={{
            fontSize: '36px',
            fontWeight: '600',
            color: '#ffffff',
            textAlign: 'center',
            marginBottom: '20px',
            lineHeight: '1.2',
          }}
        >
          머신비전 & 광학 솔루션 전문기업
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: '#e8ecef',
            textAlign: 'center',
            marginBottom: '40px',
            maxWidth: '800px',
            lineHeight: '1.4',
          }}
        >
          Leading your vision to success
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '60px',
            fontSize: '18px',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              backgroundColor: '#ffffff', 
              borderRadius: '50%' 
            }} />
            2,000+ Products
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              backgroundColor: '#ffffff', 
              borderRadius: '50%' 
            }} />
            Machine Vision
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              backgroundColor: '#ffffff', 
              borderRadius: '50%' 
            }} />
            Industrial Camera
          </div>
        </div>

        {/* Twitter hashtag */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '40px',
            fontSize: '18px',
            color: '#e8ecef',
          }}
        >
          #머신비전 #산업용카메라 #VIREX
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            fontSize: '20px',
            color: '#e8ecef',
          }}
        >
          virex.co.kr
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}