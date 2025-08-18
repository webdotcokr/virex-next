import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ConditionalLayout from "@/components/ConditionalLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VIREX - 머신비전 & 광학 솔루션 전문기업",
  description: "바이렉스는 는 머신비전 관련 컴포넌트 전문 기업으로, 광학 컨설팅, 신규 메이커 발굴, 맞춤형 솔루션 연구개발을 제공합니다. 최신 기술로 고객의 혁신적인 비즈니스 성장을 지원합니다.",
  keywords: "머신비전, 산업용카메라, CIS카메라, TDI카메라, 프레임그래버, 렌즈, 조명, VIREX, 바이렉스, Teledyne DALSA, FLIR",
  authors: [{ name: "VIREX" }],
  openGraph: {
    title: "VIREX - 머신비전 & 광학 솔루션 전문기업",
    description: "바이렉스는 는 머신비전 관련 컴포넌트 전문 기업으로, 광학 컨설팅, 신규 메이커 발굴, 맞춤형 솔루션 연구개발을 제공합니다. 최신 기술로 고객의 혁신적인 비즈니스 성장을 지원합니다.",
    url: "https://virex.co.kr",
    siteName: "VIREX",
    locale: "ko_KR",
    type: "website",
    images: ['/img/site-image.png'],
  },
  twitter: {
    card: "summary_large_image",
    title: "VIREX - 머신비전 & 광학 솔루션 전문기업",
    description: "바이렉스는 는 머신비전 관련 컴포넌트 전문 기업으로, 광학 컨설팅, 신규 메이커 발굴, 맞춤형 솔루션 연구개발을 제공합니다. 최신 기술로 고객의 혁신적인 비즈니스 성장을 지원합니다.",
    images: ['/img/site-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Google Search Console 인증 태그는 나중에 추가 가능
    // google: "구글 인증 코드",
    // naver: "네이버 인증 코드",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" 
        />
        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/common/virex-logo-color.png" />
        {/* Theme Color for mobile browsers */}
        <meta name="theme-color" content="#566BDA" />
        <meta name="msapplication-TileColor" content="#566BDA" />
        <meta name="msapplication-TileImage" content="/common/virex-logo-color.png" />
        {/* Viewport for responsive design */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
