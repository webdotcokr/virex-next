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
  description: "바이렉스의 B2B 제품 포털에서 2,000개 이상의 제품을 검색하고 비교하세요. 산업용 카메라, 렌즈, 프레임그래버, 조명 등 머신비전 솔루션 전문기업",
  keywords: "머신비전, 산업용카메라, CIS카메라, TDI카메라, 프레임그래버, 렌즈, 조명, VIREX, 바이렉스, Teledyne DALSA, FLIR",
  authors: [{ name: "VIREX" }],
  openGraph: {
    title: "VIREX - 머신비전 & 광학 솔루션 전문기업",
    description: "바이렉스의 B2B 제품 포털에서 2,000개 이상의 제품을 검색하고 비교하세요.",
    url: "https://virex.co.kr",
    siteName: "VIREX",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VIREX - 머신비전 & 광학 솔루션 전문기업",
    description: "바이렉스의 B2B 제품 포털에서 2,000개 이상의 제품을 검색하고 비교하세요.",
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
