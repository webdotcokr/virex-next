export interface ProductItem {
  id: string
  title: string
  description: string[]
  imageUrl: string
  linkUrl: string
}

export interface ProductCategory {
  id: string
  title: string
  items: ProductItem[]
}

export const productCategories: ProductCategory[] = [
  {
    id: 'camera',
    title: '카메라',
    items: [
      {
        id: 'cis',
        title: 'CIS',
        description: [
          '센서,렌즈,조명 일체형',
          '300~3600DPI',
          'Contact Image Sensor'
        ],
        imageUrl: '/img/camera-01.png',
        linkUrl: '/products?type=camera&p_cate=1012&category=CIS&page=1&pageSize=20&sortBy=p_item_text4&sortDir=DESC'
      },
      {
        id: 'tdi',
        title: 'TDI',
        description: [
          '최대 32K해상도 지원,',
          '16K 해상도 1MHz Line rate',
          '초고속 고감도 TDI 카메라'
        ],
        imageUrl: '/img/camera-02.png',
        linkUrl: '/products?type=camera&category=TDI%20Line&p_cate=1015'
      },
      {
        id: 'line',
        title: 'Line',
        description: [
          '8K, 16K 해상도에서 최대 300KHz,',
          'HDR 및 다중 스펙트럼',
          'Multi Line Scan 카메라'
        ],
        imageUrl: '/img/camera-03.png',
        linkUrl: '/products?type=camera&category=Line&p_cate=1011'
      },
      {
        id: 'area',
        title: 'Area',
        description: [
          '0.3MP 컴팩트 사이즈 카메라부터',
          '152MP 초고해상도',
          'Area Scan 카메라'
        ],
        imageUrl: '/img/camera-04.png',
        linkUrl: '/products?type=camera&category=Area&p_cate=1010'
      },
      {
        id: 'invisible',
        title: 'Invisible',
        description: [
          'Pixel Operability 99%,',
          '고감도 2K',
          'SWIR Line Scan Camera'
        ],
        imageUrl: '/img/camera-05.png',
        linkUrl: '/products?type=camera&category=Invisible&p_cate=1013'
      },
      {
        id: 'scientific',
        title: 'Scientific',
        description: [
          '96%의 QE,',
          '서브전자 0.7e- 노이즈',
          'back-illuminated sCMOS Camera'
        ],
        imageUrl: '/img/camera-06.png',
        linkUrl: '/products?type=camera&category=Scientific&p_cate=1014'
      }
    ]
  },
  {
    id: 'lens',
    title: '렌즈',
    items: [
      {
        id: 'large-format',
        title: 'Large Format',
        description: [
          '0.04x~6.2x 배율,',
          'Apochromatic 보정,',
          'Image Circle 82mm 이상 라인스캔 렌즈'
        ],
        imageUrl: '/img/lens-01.png',
        linkUrl: '/products?type=lens&category=Large%20Format&p_cate=1112'
      },
      {
        id: 'telecentric',
        title: 'Telecentric',
        description: [
          '2/3" ~ Dia 44mm Image Circle',
          '0.12x ~ 6.0x 배율',
          'Telecentric Lens'
        ],
        imageUrl: '/img/lens-02.png',
        linkUrl: '/products?type=lens&category=Telecentric&p_cate=1111'
      },
      {
        id: 'fa',
        title: 'FA',
        description: [
          '1/1.7" ~ 1.1" 24MP',
          '(2.74um 픽셀사이즈 지원) 대응',
          'Fixed Focal Length 렌즈'
        ],
        imageUrl: '/img/lens-03.png',
        linkUrl: '/products?type=lens&category=FA&p_cate=1110'
      }
    ]
  },
  {
    id: '3d-camera',
    title: '3D Camera',
    items: [
      {
        id: 'laser-profiler',
        title: 'Laser Profiler',
        description: [
          '레이저 광삼각법 방식으로',
          '정밀한 높이 측정',
          '3D 레이저 프로파일러'
        ],
        imageUrl: '/img/main-products/02.png',
        linkUrl: '/products?type=3d-camera&category=Laser%20Profiler&p_cate=1310'
      },
      {
        id: 'stereo-camera',
        title: 'Stereo Camera',
        description: [
          'Sony 3MP 센서 탑재로',
          '높은 깊이 정확도,',
          '5GigE 3D 스테레오 카메라'
        ],
        imageUrl: '/img/main-products/03.png',
        linkUrl: '/products?type=3d-camera&category=Stereo%20Camera&p_cate=1311'
      }
    ]
  },
  {
    id: 'af-module',
    title: '오토포커스모듈',
    items: [
      {
        id: 'auto-focus',
        title: 'Auto Focus',
        description: [
          'FPGA 기반의',
          '실시간 위치 측정',
          '및 Z축 제어 자동 초점 모듈'
        ],
        imageUrl: '/img/main-products/04.png',
        linkUrl: '/products?type=af-module&category=Autos%20Focus&p_cate=16'
      }
    ]
  },
  {
    id: 'light',
    title: '조명',
    items: [
      {
        id: 'light',
        title: 'Light',
        description: [
          '고속이미징처리에 적합한',
          '고휘도 하이브리드 스팟 조명',
          ''
        ],
        imageUrl: '/img/light-01.png',
        linkUrl: '/products?type=light&category=Light&p_cate=1410'
      },
      {
        id: 'light-sources',
        title: 'Light Sources',
        description: [
          '최대 2CH 제어',
          '150W 라이트소스',
          ''
        ],
        imageUrl: '/img/light-02.png',
        linkUrl: '/products?type=light&category=Light%20Sources&p_cate=1411'
      },
      {
        id: 'controller',
        title: 'Controller',
        description: [
          '최대 200A에서 0.5us 이하',
          '초고속 펄스 생성',
          '스트로브 컨트롤러'
        ],
        imageUrl: '/img/light-03.png',
        linkUrl: '/products?type=light&category=Controller&p_cate=1412'
      }
    ]
  },
  {
    id: 'frame-grabber',
    title: '프레임그래버',
    items: [
      {
        id: '10gige',
        title: '10GigE',
        description: [
          '실시간 패킷해제 엔진으로',
          'CPU부하량을 최소화 하는 Xtium2',
          'XGV PX8 Series'
        ],
        imageUrl: '/img/frame-grabber-01.png',
        linkUrl: '/products?type=frame-grabber&p_cate=1210&category=프레임그래버&page=1&pageSize=20&p_item_text5=10GigE'
      },
      {
        id: 'coaxpress',
        title: 'CoaxPress',
        description: [
          '1,2,4 Port (최대 12.5Gbx4)를',
          '지원하는 CXP12 Xtium2',
          'CXP PX8 Series'
        ],
        imageUrl: '/img/frame-grabber-02.png',
        linkUrl: '/products?type=frame-grabber&p_cate=1210&category=프레임그래버&page=1&pageSize=20&p_item_text5=CoaXPress'
      },
      {
        id: 'camera-link-hs',
        title: 'Camera Link HS',
        description: [
          '고속 및 유연한 장거리',
          '광 케이블 지원 Xtium2',
          'CLHS Series'
        ],
        imageUrl: '/img/frame-grabber-03.png',
        linkUrl: '/products?type=frame-grabber&p_cate=1210&category=프레임그래버&page=1&pageSize=20&p_item_text5=Camera+Link+HS'
      },
      {
        id: 'camera-link',
        title: 'Camera Link',
        description: [
          '하나의 보드로 2xBase,',
          '1xMedium, Full or 80bit 지원',
          'Xtium2 MX4'
        ],
        imageUrl: '/img/frame-grabber-04.png',
        linkUrl: '/products?type=frame-grabber&p_cate=1210&category=프레임그래버&page=1&pageSize=20&p_item_text5=Camera+Link'
      },
      {
        id: 'gige-lan-card',
        title: 'GigE 랜카드',
        description: [
          '머신비전 산업용 NIC 보드',
          '(1G, 2.5G, 5G, 10G 지원)'
        ],
        imageUrl: '/img/frame-grabber-05.png',
        linkUrl: '/products?type=frame-grabber&category=CoaxPress&p_cate=1211'
      },
      {
        id: 'usb-card',
        title: 'USB 카드',
        description: [
          '머신비전 산업용 USB 카드',
          '(USB Interface)'
        ],
        imageUrl: '/img/frame-grabber-06.png',
        linkUrl: '/products?type=frame-grabber&category=Camera%20Link&p_cate=1212'
      }
    ]
  },
  {
    id: 'software',
    title: '소프트웨어',
    items: [
      {
        id: 'software',
        title: 'Software',
        description: [
          'Sapera processing',
          '(Barcode,OCR등)',
          '및 AI 개발자키트 Astrocyte'
        ],
        imageUrl: '/img/software-01.png',
        linkUrl: '/products?type=software&p_cate=15'
      }
    ]
  },
  {
    id: 'accessory',
    title: '주변기기',
    items: [
      {
        id: 'cable',
        title: '케이블',
        description: [
          'AOC, Camera Link,',
          'USB3.0,',
          'GigE 고성능 데이터 케이블'
        ],
        imageUrl: '/img/accessory-01.png',
        linkUrl: '/products?type=accessory&category=Cable&p_cate=1711'
      },
      {
        id: 'accessory',
        title: '악세사리',
        description: [
          'Camera Link 및',
          'CoaxPress 리피터, Xtium2',
          '프레임그래버용 외부 I/O 보드'
        ],
        imageUrl: '/img/accessory-02.png',
        linkUrl: '/products?type=accessory&category=Accessory&p_cate=1712'
      },
      {
        id: 'etcs',
        title: '기타',
        description: [],
        imageUrl: '/img/accessory-03.png',
        linkUrl: '/products?type=accessory&category=Etcs&p_cate=1713'
      }
    ]
  }
]