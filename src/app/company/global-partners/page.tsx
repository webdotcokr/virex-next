import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import PageContentContainer from '@/components/PageContentContainer';
import styles from '../company.module.css'; // CSS 모듈 import

const CompanyPage = () => {
  const DIR_ROOT = ''; // public 폴더 기준 경로
  const page_title_en = "Leading your vision to success";
  const page_title_ko = "바이렉스";

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "바이렉스", href: "/sub/company/" },
    { label: "파트너사" }
  ];

  // 파트너사 데이터의 타입을 정의합니다.
type Partner = {
  imageSrc: string;
  name: string;
  description: string;
  products: string;
};

// 파트너사 정보를 배열로 관리합니다. (데이터와 뷰의 분리)
// 파트너사 정보를 배열로 관리합니다. (데이터와 뷰의 분리)
const partners: Partner[] = [
  {
    imageSrc: 'global-partner1.jpg',
    name: 'Teleyne Dalsa',
    description: '센서, 카메라, 프레임 그래버, 영상처리 소프트웨어 등 고성능 디지털 이미징 분야 세계 1위 기업',
    products: 'TDI 라인스캔카메라, Mulit/Single 라인스캔 카메라Area GigE, Camera Link, CoaxPress, CLHS 카메라 프레임그래버, 이미지프로세싱 SW',
  },
  {
    imageSrc: 'global-partner2.jpg',
    name: 'Teledyne FLIR',
    description: '다양한 산업시장에 적합한 이미징 카메라 개발 및 제조',
    products: 'GigE, USB Area 카메라, USB Board level 카메라, 3D Stereo 카메라',
  },
  {
    imageSrc: 'global-partner3.jpg',
    name: 'INSNEX',
    description: '머신비전 용으로 설계된 고성능 CIS 카메라 개발 및 제조',
    products: 'CIS 카메라, 2.5D 카메라CIS 2.5D 카메라, SCIS 카메라',
  },
  {
    imageSrc: 'global-partner4.jpg',
    name: 'ARES INTELTEC',
    description: '좁은 공간에 설치 가능한 센서, 렌즈, 조명 일체형 Contact Image Sensor',
    products: 'CIS 카메라, CIS Light',
  },
  {
    imageSrc: 'global-partner5.jpg',
    name: 'Teledyne Photometrics',
    description: '생물 연구를 지원하는 고성능 CMOS, CCD 카메라 분야의 글로벌 리더',
    products: 'CCD 카메라, EMCCD 카메라, sCMOS 카메라',
  },
  {
    imageSrc: 'global-partner6.jpg',
    name: 'Teledyne Princeton Instruments',
    description: '과학 이미지 응용 분야에 사용할 수 있는 최고 감도의 CCD 카메라',
    products: 'CCD 카메라, EMCCD 카메라, X-Ray 카메라, InGaAs 카메라',
  },
  {
    imageSrc: 'global-partner7.jpg',
    name: 'Teledyne Lumenera',
    description: '산업용 및 과학용 이미징 카메라 제조 및 개발',
    products: 'USB 카메라, USB Board Level 카메라',
  },
  {
    imageSrc: 'global-partner8.jpg',
    name: 'DAHENG IMAGING',
    description: '중국최대 비전시스템 개발 업체 0.3MP 부터 100MP 이상 Area 카메라 제조',
    products: '1GigE ~ 10GigE 카메라, USB 카메라, CXP-12 카메라',
  },
  {
    imageSrc: 'global-partner9.jpg',
    name: 'Schneider-Kreuznach',
    description: '고품질의 산업 용 렌즈 개발 및 제조',
    products: 'Large format 렌즈F, C mount 렌즈, SWIR 렌즈',
  },
  {
    imageSrc: 'global-partner10.jpg',
    name: 'DZOPTICS',
    description: '중 고가형 시장 타겟으로 합리적인 성능과 가격을 제공하는 렌즈 개발 및 제조',
    products: 'Large format 렌즈, Macro 렌즈,CCTV 렌즈, Telecentric 렌즈',
  },
  {
    imageSrc: 'global-partner11.jpg',
    name: 'NEW TRY',
    description: '텔레센트릭 렌즈,조명 전문 빠른 납기와 대응력, 어플리케이션 커스텀 솔루션',
    products: 'Bi-Telecentric 렌즈, Object Telecentric 렌즈, 조명, 기타 주변장치',
  },
  {
    imageSrc: 'global-partner12.jpg',
    name: 'ICORE',
    description: '최고 수준의 아날로그 회로 설계,정밀 기구 광학 및 조명 설계',
    products: 'Auto Focus Module, 고광량 Spot 조명, 고속 Strobe 조명 컨트롤러, Repeater',
  },
  {
    imageSrc: 'global-partner13.jpg',
    name: 'PlusTek',
    description: '광학 연구개발 및 커스텀 제작 전문',
    products: '머신비전조명, 라이트소스, 조명컨트롤러',
  },
  {
    imageSrc: 'global-partner14.jpg',
    name: 'LVS CO.,Ltd',
    description: '머신비전 조명 전문 다양한 어플리케이션 솔루션 보유 고객 맞춤 서비스',
    products: '머신비전 조명, 광소스, 조명 컨트롤러',
  },
  {
    imageSrc: 'global-partner15.jpg',
    name: 'LR-LINK',
    description: '중국 최대 산업용 NIC 제조사. 수십 종의 머신비전 랜카드 공급',
    products: '1GigE ~ 10GigE Lan Card5G / 10G USB Card',
  },
  {
    imageSrc: 'global-partner16.jpg',
    name: 'Alysium Tech GmbH',
    description: '고성능 머신 비전 케이블 전문 커넥터, 케이블 어셈블리분야의 강력한 생산 및 엔지니어링 능력 보유',
    products: '머신 비전 케이블, AOC 케이블, 커넥터, 어셈블리',
  },
];


  return (
    <div>
      <Head> 
        <title>{`회사소개 | 바이렉스`}</title>
      </Head>

      <PageContentContainer
        backgroundClass="company-header-background"
        backgroundImage="/img/bg-company.webp"
        breadcrumbs={breadcrumbs}
        titleEn={page_title_en}
        titleKo={page_title_ko}
      >
    <div className={`${styles['container']} ${styles['flex-col']}`} data-page="global-partners">
      <div className="content-title">
        <h2>파트너사</h2>
      </div>
      <div className={`${styles['content-subtitle']} mt-14px`}>
        글로벌 선두 파트너사들과 함께
        <br />
        귀사에 최적의 솔루션을 제안합니다.
      </div>
      <div className={`${styles['content-body']} mt-30px`}>
        <div className={`${styles['global-partners-list']} ${styles['flex-row']}`}>
          {/* 파트너사 데이터를 map으로 순회하여 카드 UI를 렌더링합니다. */}
          {partners.map((partner) => (
            <div key={partner.name} className={`${styles['global-partners-item']} ${styles['flex-col']}`}>
              <div className={styles['global-partners-item-image']}>
                <img alt={partner.name} src={`${DIR_ROOT}/img/${partner.imageSrc}`} />
              </div>
              <div className={styles['global-partners-item-content']}>
                <div className={styles['global-partners-item-name']}>
                  <span className={styles['bar-block']}></span>
                  <span className={styles['text']}><h3>{partner.name}</h3></span>
                </div>
                <div className={styles['global-partners-item-desc']}>
                  <h4>{partner.description}</h4>
                </div>
                <div className={styles['horizontal-line']}></div>
                <div className={styles['global-partners-item-products']}>
                  <h5>{partner.products}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
      </PageContentContainer>
      </div>
  );
};

export default CompanyPage;
