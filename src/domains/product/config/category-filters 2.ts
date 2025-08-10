// ASP 원본 제품 필터링 규칙을 Next.js 환경에 완전 이식
// 17개 제품 카테고리별 고급 필터링 시스템

import type { FilterDefinition } from '../types'

// ASP 원본 필터 옵션 타입 정의
interface FilterOption {
  display: string;
  value: string;
}

interface CategoryFilter {
  name: string;
  type: 'checkbox' | 'slider';
  param: string;
  unit?: string;
  defaultExpanded?: boolean;
  options?: FilterOption[];
  range?: number[];
  tick?: number;
}

interface ColumnDefinition {
  field: string;
  header: string;
  unit?: string;
  main?: boolean;
}

interface CategoryConfig {
  tableName: string;
  columns: ColumnDefinition[];
  filters: CategoryFilter[];
}

// 중앙 관리형 제품 필터링 설정
export const categoryConfigs: Record<string, CategoryConfig> = {
  // CIS 제품 설정
  'cis': {
    tableName: 'products_cis',
    columns: [
      { field: 'series', header: 'Series'},
      { field: 'part_number', header: 'Part Number'},
      { field: 'scan_width', header: 'Scan Width', unit: 'mm' },
      { field: 'dpi', header: 'DPI', unit: 'dpi' },
      { field: 'resolution', header: 'Resolution', unit: 'μm' },
      { field: 'line_rate', header: 'Line Rate', unit: 'kHz' },
      { field: 'speed', header: 'Speed', unit: 'MHz' },
      { field: 'wd', header: 'WD', unit: 'mm' },
      { field: 'no_of_pixels', header: 'No. of Pixels' },
      { field: 'spectrum', header: 'Spectrum' },
      { field: 'interface', header: 'Interface' },
      { field: 'maker_name', header: 'Maker' }
    ],
    filters: [
      {
        name: "Scan width",
        type: "checkbox",
        param: "scan_width",
        unit: "mm",
        options: [
          { display: "1000mm 이상", value: "[1000,99999]" },
          { display: "500mm ~ 999mm", value: "[500,999]" },
          { display: "100mm ~ 499mm", value: "[100,499]" },
          { display: "~ 99mm", value: "[0,99]" }
        ]
      },
      {
        name: "DPI",
        type: "checkbox",
        param: "dpi",
        unit: "dpi",
        defaultExpanded: true,
        options: [
          { display: "4800dpi", value: "4800" },
          { display: "3600dpi", value: "3600" },
          { display: "2400dpi", value: "2400" },
          { display: "1800dpi", value: "1800" }, 
          { display: "1200dpi", value: "1200" }, 
          { display: "900dpi", value: "900" }, 
          { display: "600dpi", value: "600" }, 
          { display: "300dpi", value: "300" }
        ]
      },
      {
        name: "Speed",
        type: "checkbox",
        param: "speed",
        unit: "mm/s",
        options: [
          { display: "5000mm/s 이상", value: "[5000,99999]" },
          { display: "3000 ~ 4999mm/s", value: "[3000,4999]" },
          { display: "1000 ~ 2999mm/s", value: "[1000,2999]" },
          { display: "~ 999mm/s ", value: "[0,999]" }
        ]
      },
      {
        name: "Line rate",
        type: "checkbox",
        param: "line_rate",
        unit: "kHz",
        defaultExpanded: true,
        options: [
            { display: "401kHz 이상", value: "[401,99999]" },
            { display: "301 ~ 400kHz", value: "[301,400]" },
            { display: "201 ~ 300kHz", value: "[201,300]" },
            { display: "101 ~ 200kHz", value: "[101,200]" },
            { display: "100kHz 이하", value: "[0,100]" }
        ]
      },
      {
        name: "No. of Pixels",
        type: "slider",
        param: "no_of_pixels",
        range: [0, 200000]
      },
      {
        name: "WD",
        type: "checkbox",
        param: "wd",
        unit: "mm",
        options: [
          { display: "8mm 이하", value: "[0,8]" },
          { display: "9mm ~ 15mm", value: "[9,15]" },
          { display: "16mm 이상", value: "[16,999]" }
        ]
      },
      {
        name: "Spectrum",
        type: "checkbox",
        param: "spectrum",
        options: [
          { display: "Mono", value: "Mono" },
          { display: "Color", value: "Color" },
          { display: "ETC", value: "!Mono,Color" }
        ]
      },
      {
        name: "Interface",
        type: "checkbox",
        param: "interface",
        options: [
          { display: "CoaXPress", value: "CoaXPress" },
          { display: "Camera Link", value: "Camera Link" },
          { display: "40GigE", value: "40GigE" },
          { display: "10GigE", value: "10GigE" },
          { display: "1GigE", value: "1GigE" },
          { display: "ETC", value: "!CoaXPress,Camera Link,40GigE,10GigE,1GigE" }
        ]
      },
      {
        name: "Maker",
        type: "checkbox",
        param: "maker_name",
        options: [
          { display: "INSNEX", value: "INSNEX" },
          { display: "ARES INTELTECH", value: "ARES INTELTECH" },
          { display: "ETC", value: "!INSNEX,ARES INTELTECH" }
        ]
      }
    ]
  },

  // TDI 제품 설정
  'tdi': {
    tableName: 'products_tdi',
    columns: [
      { field: 'series', header: 'Series', main: true },
      { field: 'part_number', header: 'Part Number', main: true },
      { field: 'line_rate', header: 'Line Rate', unit: 'kHz' },
      { field: 'pixel_size', header: 'Pixel Size', unit: 'μm' },
      { field: 'line_length', header: 'Line Length' },
      { field: 'data_rate', header: 'Data Rate', unit: 'MHz' },
      { field: 'interface', header: 'Interface' },
      { field: 'maker_name', header: 'Maker' }
    ],
    filters: [
      {
        name: "Resolution",
        type: "checkbox",
        param: "resolution",
        defaultExpanded: true,
        options: [
            { display: "16385 이상", value: ">=16385" },
            { display: "8193 ~ 16384", value: "BETWEEN 8193 AND 16384" },
            { display: "4097 ~ 8192", value: "BETWEEN 4097 AND 8192" },
            { display: "2049 ~ 4096", value: "BETWEEN 2049 AND 4096" },
            { display: "2048 이하", value: "<=2048" }
        ]
      },
      {
        name: "No. of Line",
        type: "checkbox",
        param: "no_of_line",
        options: [
            { display: "257 이상", value: ">=257" },
            { display: "193 ~ 256", value: "BETWEEN 193 AND 256" },
            { display: "65 ~ 192", value: "BETWEEN 65 AND 192" },
            { display: "64 이하", value: "<=64" }
        ]
      },
      {
        name: "Line rate",
        type: "checkbox",
        param: "line_rate",
        unit: "kHz",
        options: [
            { display: "401kHz 이상", value: "[401,99999]" },
            { display: "301 ~ 400kHz", value: "[301,400]" },
            { display: "201 ~ 300kHz", value: "[201,300]" },
            { display: "101 ~ 200kHz", value: "[101,200]" },
            { display: "100kHz 이하", value: "[0,100]" }
        ]
      },
      {
        name: "Pixel size",
        type: "checkbox",
        param: "pixel_size",
        unit: "μm",
        options: [
            { display: "10μm 이상", value: ">=10" },
            { display: "5 ~ 10μm 미만", value: "<=5 AND p_item4 <10" },
            { display: "5μm 미만", value: "<5" }
        ]
      },
      {
        name: "Spectrum",
        type: "checkbox",
        param: "spectrum",
        options: [
          { display: "Mono", value: "Mono" },
          { display: "Color", value: "Color" },
          { display: "ETC", value: "!Mono,Color" }
        ]
      },
      {
        name: "Interface",
        type: "checkbox",
        param: "interface",
        options: [
          { display: "Camera Link HS", value: "Camera Link HS" },
          { display: "CoaXPress12", value: "CoaXPress12" },
          { display: "CoaXPress10", value: "CoaXPress10" },
          { display: "CoaXPress6", value: "CoaXPress6" },
          { display: "Camera Link", value: "Camera Link" },
          { display: "ETC", value: "NOT IN ('Camera Link HS','CoaXPress12','CoaXPress10','CoaXPress6','Camera Link')" }
        ]
      },
      {
        name: "Maker",
        type: "checkbox",
        param: "maker_name",
        options: [
          { display: "Teledyne Dalsa", value: "Teledyne Dalsa" },
          { display: "i-TEK", value: "i-TEK" },
          { display: "ETC", value: "NOT IN ('Teledyne Dalsa','i-TEK')" }
        ]
      }
    ]
  },

  // Line 카메라 제품 설정
  'line': {
    tableName: 'products_line',
    columns: [
      { field: 'series', header: 'Series', main: true },
      { field: 'part_number', header: 'Part Number', main: true },
      { field: 'resolution', header: 'Resolution' },
      { field: 'number_of_line', header: 'No. of Line' },
      { field: 'line_rate', header: 'Line Rate', unit: 'kHz' },
      { field: 'pixel_size', header: 'Pixel Size', unit: 'μm' },
      { field: 'interface', header: 'Interface' },
      { field: 'spectrum', header: 'Spectrum' },
      { field: 'dynamic_range', header: 'Dynamic Range', unit: 'dB' },
      { field: 'mount', header: 'Mount' },
      { field: 'maker_name', header: 'Maker' }
    ],
    filters: [
      {
        name: "Resolution",
        type: "checkbox",
        param: "resolution",
        defaultExpanded: true,
        options: [
            { display: "16385 이상", value: ">=16385" },
            { display: "8193 ~ 16384", value: "BETWEEN 8193 AND 16384" },
            { display: "4097 ~ 8192", value: "BETWEEN 4097 AND 8192" },
            { display: "2049 ~ 4096", value: "BETWEEN 2049 AND 4096" },
            { display: "2048 이하", value: "<=2048" }
        ]
      },
      {
        name: "No. of Line",
        type: "checkbox",
        param: "no_of_line",
        options: [
          { display: "5 이상", value: ">=5" },
          { display: "2 ~ 4", value: "BETWEEN 2 AND 4" },
          { display: "1", value: "1" }
        ]
      },
      {
        name: "Line rate",
        type: "checkbox",
        param: "line_rate",
        unit: "kHz",
        defaultExpanded: true,
        options: [
            { display: "401kHz 이상", value: ">=401" },
            { display: "301 ~ 400kHz", value: "BETWEEN 301 AND 400" },
            { display: "201 ~ 300kHz", value: "BETWEEN 201 AND 300" },
            { display: "101 ~ 200kHz", value: "BETWEEN 101 AND 200" },
            { display: "~ 100kHz", value: "<=100" }
        ]
      },
      {
        name: "Pixel size",
        type: "checkbox",
        param: "pixel_size",
        unit: "μm",
        options: [
              { display: "10μm 이상", value: ">=10" },
              { display: "5μm ~ 10μm 미만", value: ">=5 AND p_item5 <10" },
              { display: "5μm 미만", value: "<5" },
        ]
      },
      {
        name: "Spectrum",
        type: "checkbox",
        param: "spectrum",
        options: [
          { display: "Mono", value: "Mono" },
          { display: "Color", value: "Color" },
          { display: "ETC", value: "!Mono,Color" }
        ]
      },
      {
        name: "Interface",
        type: "checkbox",
        param: "interface",
        options: [
          { display: "Camera Link HS", value: "Camera Link HS" },
          { display: "CoaXPress", value: "CoaXPress" },
          { display: "Camera Link", value: "Camera Link" },
          { display: "SFP+", value: "SFP+" },
          { display: "GigE", value: "GigE" },
          { display: "ETC", value: "NOT IN ('Camera Link HS','CoaXPress','Camera Link','SFP+','GigE')" }
        ]
      },
      {
        name: "Maker",
        type: "checkbox",
        param: "maker_name",
        options: [
          { display: "Teledyne Dalsa", value: "Teledyne Dalsa" },
          { display: "i-TEK", value: "i-TEK" },
          { display: "ETC", value: "NOT IN ('Teledyne Dalsa','i-TEK')" }
        ]
      }
    ]
  },

  // Area 카메라 제품 설정
  'area': {
    tableName: 'products_area',
    columns: [
      { field: 'series', header: 'Series', main: true },
      { field: 'part_number', header: 'Part Number', main: true },
      { field: 'mega_pixel', header: 'Mega Pixel', unit: 'MP' },
      { field: 'resolution', header: 'Resolution' },
      { field: 'sensor_model', header: 'Sensor' },
      { field: 'frame_rate', header: 'Frame Rate', unit: 'fps' },
      { field: 'pixel_size', header: 'Pixel Size', unit: 'μm' },
      { field: 'image_circle', header: 'Image Circle', unit: 'mm' },
      { field: 'interface', header: 'Interface' },
      { field: 'spectrum', header: 'Spectrum' },
      { field: 'dynamic_range', header: 'Dynamic Range', unit: 'dB' },
      { field: 'mount', header: 'Mount' },
      { field: 'maker_name', header: 'Maker' }
    ],
    filters: [
      {
        name: "Mega pixel",
        type: "checkbox",
        param: "mega_pixel",
        defaultExpanded: true,
        options: [
            { display: "100MP 이상", value: ">=100" },
            { display: "50MP ~ 100MP 미만", value: ">=50 AND p_item1 <100" },
            { display: "10MP ~ 50MP 미만", value: ">=10 AND p_item1 <50" },
            { display: "5MP ~ 10MP 미만", value: ">=5 AND p_item1 <10" },
            { display: "3MP ~ 5MP 미만", value: ">=3 AND p_item1 <5" },
            { display: "1MP ~ 3MP 미만", value: ">=1 AND p_item1 <3" },
            { display: "0.3MP ~ 1MP 미만", value: ">=0.3 AND p_item1 <1" }
        ]
      },
      {
        name: "Frame rate",
        type: "checkbox",
        param: "frame_rate",
        defaultExpanded: true,
        options: [
            { display: "300fps 이상", value: ">=300" },
            { display: "200fps ~ 300fps 미만", value: ">=200 AND p_item2 <300" },
            { display: "100fps ~ 200fps 미만", value: ">=100 AND p_item2 <200" },
            { display: "50fps ~ 100fps 미만", value: ">=50 AND p_item2 <100" },
            { display: "10fps ~ 50fps 미만", value: ">=10 AND p_item2 < 50" },
            { display: "10fps 미만", value: "<10" }
        ]
      },
      {
        name: "Pixel size",
        type: "checkbox",
        param: "pixel_size",
        unit: "μm",
        options: [
            { display: "10μm이상", value: ">=10" },
            { display: "5μm ~ 10μm 미만", value: ">=5 AND p_item4 <10" },
            { display: "5μm 미만", value: "<5" }
        ]
      },
      {
        name: "Spectrum",
        type: "checkbox",
        param: "spectrum",
        options: [
          { display: "Mono", value: "Mono" },
          { display: "Color", value: "Color" }
        ]
      },
      {
        name: "Interface",
        type: "checkbox",
        param: "interface",
        options: [
          { display: "Camera Link HS", value: "Camera Link HS" },
          { display: "CoaXPress", value: "CoaXPress" },
          { display: "Camera Link", value: "Camera Link" },
          { display: "10GigE", value: "10GigE" },
          { display: "5GigE", value: "5GigE" },
          { display: "2.5GigE", value: "2.5GigE" },
          { display: "1GigE", value: "1GigE" },
          { display: "USB3.0", value: "USB3.0" }
        ]
      },
      {
        name: "Maker",
        type: "checkbox",
        param: "maker_name",
        options: [
          { display: "Teledyne Dalsa", value: "Teledyne Dalsa" },
          { display: "Teledyne FLIR", value: "Teledyne FLIR" },
          { display: "Teledyne Lumenera", value: "Teledyne Lumenera" },
          { display: "Daheng Imaging", value: "Daheng Imaging" },
          { display: "i-TEK", value: "i-TEK" },
          { display: "ETC", value: "NOT IN ('Teledyne Dalsa','Teledyne FLIR','Teledyne Lumenera','Daheng Imaging','i-TEK')" }
        ]
      }
    ]
  },

  // Large Format 렌즈 설정
  'large_format': {
    tableName: 'products_large_format_lens',
    columns: [
      { field: 'series', header: 'Series' },
      { field: 'part_number', header: 'Part Number' },
      { field: 'mag_range', header: 'Mag Range' },
      { field: 'central_mag', header: 'Central Mag' },
      { field: 'image_circle', header: 'Image Circle', unit: 'φ/mm' },
      { field: 'focal_length', header: 'Focal Length', unit: 'mm' },
      { field: 'image_resolution', header: 'Image Resolution', unit: 'μm' },
      { field: 'f_number', header: 'F#' },
      { field: 'coaxial', header: 'Coaxial' },
      { field: 'mount', header: 'Mount' },
      { field: 'maker_name', header: 'Maker' }
    ],
    filters: [
      {
        name: "Central Mag",
        unit: "x",
        type: "slider",
        param: "central_mag",
        defaultExpanded: true,
        range: [0, 7],
        tick: 0.1
      },
      {
        name: "Image Circle",
        unit: "φ/mm",
        type: "slider",
        param: "image_circle",
        defaultExpanded: true,
        range: [0, 100]
      },
      {
        name: "Focal length",
        unit: "mm",
        type: "slider",
        param: "focal_length",
        range: [4, 150]
      },
      {
        name: "F#",
        type: "checkbox",
        param: "f_number",
        options: [
              { display: "~ 4.0미만", value: "<4" },
              { display: "4.0~5.6미만", value: ">= 4 AND f_number < 5.6" },
              { display: "5.6이상", value: ">=5.6" }
        ]
      },
      {
        name: "Maker",
        type: "checkbox",
        param: "maker_name",
        options: [
          { display: "Schneider", value: "Schneider" },
          { display: "Dzoptics", value: "Dzoptics" },
          { display: "ETC", value: "NOT IN ('Schneider','Dzoptics')" }
        ]
      }
    ]
  },

  // Telecentric 렌즈 설정
  'telecentric': {
    tableName: 'products_telecentric',
    columns: [
      { field: 'series', header: 'Series', main: true },
      { field: 'part_number', header: 'Part Number', main: true },
      { field: 'mag', header: 'Mag', unit: 'x' },
      { field: 'wd', header: 'WD', unit: 'mm' },
      { field: 'na', header: 'NA' },
      { field: 'f_number', header: 'F#' },
      { field: 'image_circle', header: 'Image Circle', unit: 'φ/mm' },
      { field: 'coaxial', header: 'Coaxial' },
      { field: 'mount', header: 'Mount' },
      { field: 'maker_name', header: 'Maker' }
    ],
    filters: [
      {
        name: "Mag",
        unit: "x",
        type: "slider",
        param: "mag",
        defaultExpanded: true,
        range: [0, 10],
        tick: 0.1
      },
      {
        name: "Image Circle",
        unit: "φ/mm(인치)",
        type: "checkbox",
        param: "image_circle",
        options: [
              { display: "45mm 이상", value: ">=45" },
              { display: "35mm 이상 ~45mm 미만", value: ">= 35 AND image_circle < 45" },
              { display: "21.3mm(4/3\") 이상 ~35mm 미만", value: ">= 21.3 AND image_circle < 35" },
              { display: "18.4mm(1.1\") 이상 ~21.3mm (4/3\") 미만", value: ">= 18.4 AND image_circle < 21.3" },
              { display: "16mm(1\") 이상 ~18.4mm (1.1\") 미만", value: ">= 16 AND image_circle < 18.4" },
              { display: "11.4mm(2/3\") 이상 ~16mm (1\") 미만", value: ">= 11.4 AND image_circle < 16" },
              { display: "8mm(1/2\") 이상 ~11.4mm (2/3\") 미만", value: ">= 8 AND image_circle < 11.4" },
              { display: "8mm(1/2\")미만", value: "<8" }
        ]
      },
      {
        name: "WD",
        unit: "mm",
        type: "checkbox",
        param: "wd",
        options: [
              { display: "65mm 미만", value: "<65" },
              { display: "66 ~ 110mm 미만", value: ">= 66 AND wd < 110" },
              { display: "111 ~ 200mm 미만", value: ">= 111 AND wd < 200" },
              { display: "201 ~ 300mm 미만", value: ">= 201 AND wd < 300" },
              { display: "301mm 이상", value: ">=301" }
          ]
        },
      {
        name: "F#",
        type: "checkbox",
        param: "f_number",
        options: [
              { display: "10 미만", value: "<10" },
              { display: "10 ~ 20 미만", value: ">= 10 AND f_number < 20" },
              { display: "21 이상", value: ">=21" }
        ]
      },
      {
        name: "Maker",
        type: "checkbox",
        param: "maker_name",
        options: [
          { display: "Dzoptics", value: "Dzoptics" },
          { display: "NEW TRY", value: "NEW TRY" },
          { display: "ETC", value: "NOT IN ('Dzoptics','NEW TRY')" }
        ]
      }
    ]
  },

  // FA Lens 설정
  'fa_lens': {
    tableName: 'products_fa_lens',
    columns: [
      { field: 'series', header: 'Series', main: true },
      { field: 'part_number', header: 'Part Number', main: true },
      { field: 'focal_length', header: 'Focal Length', unit: 'mm' },
      { field: 'image_circle', header: 'Image Circle', unit: 'φ/mm' },
      { field: 'image_resolution', header: 'Image Resolution', unit: 'μm' },
      { field: 'mag_range', header: 'Mag Range', unit: 'x' },
      { field: 'f_number', header: 'F#' },
      { field: 'mount', header: 'Mount' },
      { field: 'maker_name', header: 'Maker' }
    ],
    filters: [
      {
        name: "Focal length",
        unit: "mm",
        param: "focal_length",
        type: "checkbox",
        defaultExpanded: true,
        options: [
            { display: "50mm 이상", value: ">=50" },
            { display: "25 ~ 50mm 미만", value: ">= 25 AND focal_length < 50" },
            { display: "6 ~ 25mm 미만", value: ">= 6 AND focal_length < 25" },
            { display: "~ 6mm미만", value: "<6" }
        ]
      },
      {
        name: "Image Circle",
        unit: "φ/mm",
        param: "image_circle",
        type: "checkbox",
        defaultExpanded: true,
        options: [
            { display: "18.4mm 이상", value: ">=18.4" },
            { display: "16mm(1\") 이상 ~ 18.4mm(1.1\") 미만", value: ">= 16 AND image_circle < 18.4" },
            { display: "11.4mm(2/3\") 이상 ~ 16mm(1\") 미만", value: ">= 11.4 AND image_circle < 16" },
            { display: "8mm(1/2\") 이상 ~ 11.4mm(2/3\") 미만", value: ">= 8 AND image_circle < 11.4" },
        ]
      },
      {
        name: "F#",
        type: "checkbox",
        param: "f_number",
        options: [
            { display: "~ 2.2 미만", value: "<2.2" },
            { display: "2.2 ~ 3.0 미만", value: ">= 2.2 AND f_number < 3.0" },
            { display: "3.0 이상", value: ">=3" }
        ]
      },
      {
        name: "Maker",
        type: "checkbox",
        param: "maker_name",
        options: [
          { display: "Dzoptics", value: "Dzoptics" },
          { display: "ETC", value: "NOT IN ('Dzoptics')" }
        ]
      }
    ]
  },

  // 3D Laser Profiler 설정
  'laser_3d': {
    tableName: 'products_3d_laser_profiler',
    columns: [
      { field: 'series', header: 'Series', main: true },
      { field: 'part_number', header: 'Part Number', main: true },
      { field: 'point', header: 'Point' },
      { field: 'z_range', header: 'Z-Range', unit: 'mm' },
      { field: 'z_resolution', header: 'Z-Res.', unit: 'μm' },
      { field: 'x_resolution', header: 'X-Res.', unit: 'μm' },
      { field: 'fov', header: 'FOV', unit: 'mm' },
      { field: 'profile_rate', header: 'Profile Rate', unit: 'Profiles/sec' },
      { field: 'wd', header: 'WD', unit: 'mm' },
      { field: 'linearity', header: 'Linearity' },
      { field: 'laser_option', header: 'Laser Option' },
      { field: 'maker_name', header: 'Maker' }
    ],
    filters: []
  },

  // 3D Stereo Camera 설정
  'stereo_3d': {
    tableName: 'products_3d_stereo_camera',
    columns: [
      { field: 'series', header: 'Series'},
      { field: 'part_number', header: 'Part Number'},
      { field: 'mega_pixel', header: 'Mega Pixel', unit: 'MP' },
      { field: 'pixel_size', header: 'Pixel Size', unit: 'μm' },
      { field: 'fov', header: 'FOV' },
      { field: 'focal_length', header: 'Focal Length', unit: 'mm' },
      { field: 'depth_accuracy', header: 'Depth Accuracy' },
      { field: 'spectrum', header: 'Spectrum' },
      { field: 'shutter_type', header: 'Shutter Type' },
      { field: 'interface', header: 'Interface' },
      { field: 'maker_name', header: 'Maker' }
    ],
    filters: []
  },

  // Light 설정
  'light': {
    tableName: 'products_light',
    columns: [
      { field: 'series', header: 'Series', main: true },
      { field: 'part_number', header: 'Part Number', main: true },
      { field: 'color', header: 'Color' },
      { field: 'wavelength', header: 'Wavelength' },
      { field: 'power', header: 'Power' },
      { field: 'controller', header: 'Controller' },
      { field: 'current', header: 'Current' },
      { field: 'focal_length', header: 'Focal Length' },
      { field: 'maker_name', header: 'Maker' }
    ],
    filters: []
  },

  // Controller 설정
  'controller': {
    tableName: 'products_controller',
    columns: [
      { field: 'series', header: 'Series' },
      { field: 'part_number', header: 'Part Number' },
      { field: 'channel', header: 'Channels' },
      { field: 'max_continuous_current', header: 'Max. Continuous Current', unit: 'A' },
      { field: 'max_pulse_current', header: 'Max. Pulse Current', unit: 'A' },
      { field: 'min_pulse_width', header: 'Min. Pulse Width', unit: 'μs' },
      { field: 'max_frequency', header: 'Max. Frequency', unit: 'kHz' },
      { field: 'led_voltage_range', header: 'LED Voltage Range', unit: 'V' },
      { field: 'max_power_output_total', header: 'Max. Power Output Total', unit: 'W' },
      { field: 'maker_name', header: 'Maker' }
    ],
    filters: []
  },

  // Frame Grabber 설정
  'frame_grabber': {
    tableName: 'products_frame_grabber',
    columns: [
      { field: 'series', header: 'Series' },
      { field: 'part_number', header: 'Part Number' },
      { field: 'model', header: 'Model' },
      { field: 'pc_slot', header: 'PC Slot' },
      { field: 'max_pixel_clock', header: 'Max Pixel Clock', unit: 'MHz' },
      { field: 'acquisition_rate', header: 'Acquisition Rate' },
      { field: 'onboard_memory', header: 'Onboard Memory' },
      { field: 'input', header: 'Input' },
      { field: 'maker_name', header: 'Maker' }
    ],
    filters: [
      {
        name: "Interface",
        param: "interface",
        type: "checkbox",
        defaultExpanded: true,
        options: [
          { display: "10GigE", value: "10GigE" },
          { display: "CoaXPress", value: "CoaXPress" },
          { display: "Camera Link HS", value: "Camera Link HS" },
          { display: "Camera Link", value: "Camera Link" }
        ]
      }
    ]
  },

  // GigE LAN Card 설정
  'gige_card': {
    tableName: 'products_gige_lan_card',
    columns: [
      { field: 'series', header: 'Series', main: true },
      { field: 'part_number', header: 'Part Number', main: true },
      { field: 'chipset', header: 'Chipset' },
      { field: 'interface', header: 'Interface' },
      { field: 'pc_slot', header: 'PC Slot' },
      { field: 'port', header: 'Port' },
      { field: 'connector', header: 'Connector' },
      { field: 'poe', header: 'PoE' },
      { field: 'maker_name', header: 'Maker' }
    ],
    filters: [
      {
        name: "Interface",
        param: "interface",
        type: "checkbox",
        defaultExpanded: true,
        options: [
          { display: "1GigE", value: "1GigE" },
          { display: "2.5GigE", value: "2.5GigE" },
          { display: "5GigE", value: "5GigE" },
          { display: "10GigE", value: "10GigE" }
        ]
      },
      {
        name: "Port",
        param: "port",
        type: "checkbox",
        unit: "CH",
        options: [
          { display: "1CH", value: "1" },
          { display: "2CH", value: "2" },
          { display: "4CH", value: "4" },
          { display: "8CH", value: "8" },
          { display: "9CH 이상", value: ">=9" }
        ]
      },
      {
        name: "PCIe",
        param: "pc_slot",
        type: "checkbox",
        options: [
          { display: "PCIe2.0", value: "PCIe2.0" },
          { display: "PCIe3.0", value: "PCIe3.0" },
          { display: "PCI", value: "PCI" }
        ]
      },
      {
        name: "PoE",
        param: "poe",
        type: "checkbox",
        options: [
          { display: "PoE", value: "PoE" },
          { display: "Non PoE", value: "Non PoE" }
        ]
      }
    ]
  },

  // USB Card 설정
  'usb_card': {
    tableName: 'products_usb_card',
    columns: [
      { field: 'series', header: 'Series', main: true },
      { field: 'part_number', header: 'Part Number', main: true },
      { field: 'chipset', header: 'Chipset' },
      { field: 'interface', header: 'Interface' },
      { field: 'pc_slot', header: 'PC Slot' },
      { field: 'port', header: 'Port' },
      { field: 'connector', header: 'Connector' },
      { field: 'trans_speed', header: 'Transfer Speed' },
      { field: 'maker_name', header: 'Maker' }
    ],
    filters: [
      {
        name: "Interface",
        param: "interface",
        type: "checkbox",
        defaultExpanded: true,
        options: [
          { display: "USB3.0", value: "USB3.0" },
          { display: "USB3.1", value: "USB3.1" },
          { display: "USB3.2", value: "USB3.2" }
        ]
      },
      {
        name: "Port",
        param: "port",
        type: "checkbox",
        unit: "CH",
        options: [
          { display: "1CH", value: "1" },
          { display: "2CH", value: "2" },
          { display: "4CH", value: "4" },
          { display: "8CH", value: "8" },
          { display: "9CH 이상", value: ">=9" }
        ]
      },
      {
        name: "PCIe",
        param: "pc_slot",
        type: "checkbox",
        options: [
          { display: "PCIe2.0", value: "PCIe2.0" },
          { display: "PCIe3.0", value: "PCIe3.0" },
          { display: "PCI", value: "PCI" }
        ]
      },
      {
        name: "Trans Speed",
        param: "trans_speed",
        type: "checkbox",
        unit: "Gb/s",
        options: [
          { display: "5Gb/s", value: "5" },
          { display: "10Gb/s", value: "10" }
        ]
      }
    ]
  },

  // Cable 설정
  'cable': {
    tableName: 'products_cable',
    columns: [
      { field: 'series', header: 'Series', main: true },
      { field: 'part_number', header: 'Part Number', main: true },
      { field: 'description', header: 'Description' },
      { field: 'maker_name', header: 'Maker' }
    ],
    filters: []
  },

  // Accessory 설정
  'accessory': {
    tableName: 'products_accessory',
    columns: [
      { field: 'series', header: 'Series', main: true },
      { field: 'part_number', header: 'Part Number', main: true },
      { field: 'description', header: 'Description' },
      { field: 'maker_name', header: 'Maker' }
    ],
    filters: []
  },

  // Auto Focus Module 설정
  'auto_focus_module': {
    tableName: 'products_auto_focus_module',
    columns: [
      { field: 'series', header: 'Series' },
      { field: 'part_number', header: 'Part Number' },
      { field: 'description', header: 'Description' },
      { field: 'sensing_type', header: 'Sensing Type' },
      { field: 'sampling_rate', header: 'Sampling Rate', unit: 'kHz' },
      { field: 'capture_range', header: 'Capture Range', unit: 'μm' },
      { field: 'laser_wavelength', header: 'Laser', unit: 'nm' },
      { field: 'interface', header: 'Interface' },
      { field: 'stroke', header: 'Stroke', unit: 'mm' },
      { field: 'resolution', header: 'Resolution', unit: 'μm/Pulse' },
      { field: 'linearity_error', header: 'Linearity Error', unit: '%' },
      { field: 'repeatability', header: 'Repeatability', unit: 'μm/Pulse' },
      { field: 'maker_name', header: 'Maker' }
    ],
    filters: []
  },

  // Software 설정
  'software': {
    tableName: 'products_software',
    columns: [
      { field: 'part_number', header: 'Part Number', main: true },
      { field: 'type', header: 'Type' },
      { field: 'description', header: 'Description' },
      { field: 'device', header: 'Device' },
      { field: 'maker_name', header: 'Maker' }
    ],
    filters: []
  },

  // Invisible (SWIR) 설정
  'invisible': {
    tableName: 'products_invisible',
    columns: [
      { field: 'series', header: 'Series', main: true },
      { field: 'part_number', header: 'Part Number', main: true },
      { field: 'type', header: 'Type' },
      { field: 'mega_pixel', header: 'Mega Pixel', unit: 'MP' },
      { field: 'resolution', header: 'Resolution' },
      { field: 'pixel_size', header: 'Pixel Size', unit: 'μm' },
      { field: 'spectrum', header: 'Spectrum' },
      { field: 'dynamic_range', header: 'Dynamic Range', unit: 'dB' },
      { field: 'sensor_model', header: 'Sensor' },
      { field: 'frame_rate', header: 'Frame Rate', unit: 'fps' },
      { field: 'interface', header: 'Interface' },
      { field: 'mount', header: 'Mount' },
      { field: 'maker_name', header: 'Maker' }
    ],
    filters: [
      {
        name: "Mega pixel",
        type: "checkbox",
        param: "mega_pixel",
        options: [
            { display: "4096 이상", value: ">=4096" },
            { display: "2048 ~ 4095 미만", value: ">=2048 AND p_item1 <4096" },
            { display: "27 ~ 50MP 미만", value: ">=27 AND p_item1 <50" },
            { display: "5.2MP ~ 27MP 미만", value: ">=5.2 AND p_item1 <27" },
            { display: "5.1MP 미만", value: "<5.1" }
        ]
      },
      {
        name: "Frame rate",
        type: "checkbox",
        param: "frame_rate",
        unit: "fps/kHz",
        options: [
            { display: "300fps 이상", value: ">=300" },
            { display: "200 ~ 300fps 미만", value: ">=200 AND p_item2 <300" },
            { display: "100 ~ 200fps 미만", value: ">=100 AND p_item2 <200" },
            { display: "50 ~ 100fps 미만", value: ">=50 AND p_item2 <100" },
            { display: "10 ~ 50fps 미만", value: ">=10 AND p_item2 <50" },
            { display: "10fps 미만", value: "<10" }
        ]
      },
      {
        name: "Pixel size",
        type: "checkbox",
        param: "pixel_size",
        unit: "μm",
        options: [
            { display: "10μm 이상", value: ">10" },
            { display: "5 ~ 10μm 미만", value: ">=5 AND p_item4 <10" },
            { display: "5μm 미만", value: "<5" }
        ]
      },
      {
        name: "Spectrum",
        type: "checkbox",
        param: "spectrum",
        defaultExpanded: true,
        options: [
          { display: "UV", value: "UV" },
          { display: "NIR", value: "NIR" },
          { display: "SWIR", value: "SWIR" },
          { display: "ETC", value: "NOT IN ('UV','NIR','SWIR')" }
        ]
      },
      {
        name: "Interface",
        type: "checkbox",
        param: "interface",
        options: [
          { display: "Camera Link HS", value: "Camera Link HS" },
          { display: "CoaXPress", value: "CoaXPress" },
          { display: "Camera Link", value: "Camera Link" },
          { display: "10GigE", value: "10GigE" },
          { display: "5GigE", value: "5GigE" },
          { display: "2.5GigE", value: "2.5GigE" },
          { display: "1GigE", value: "1GigE" },
          { display: "USB3.0", value: "USB3.0" }
        ]
      },
      {
        name: "Maker",
        type: "checkbox",
        param: "maker_name",
        options: [
          { display: "Teledyne Dalsa", value: "Teledyne Dalsa" },
          { display: "Teledyne FLIR", value: "Teledyne FLIR" },
          { display: "Daheng Imaging", value: "Daheng Imaging" },
          { display: "NIT", value: "NIT" },
          { display: "i-TEK", value: "i-TEK" },
          { display: "ETC", value: "NOT IN ('Teledyne Dalsa','Teledyne FLIR','Daheng Imaging','NIT','i-TEK')" }
        ]
      }
    ]
  },

  // Scientific Camera 설정
  'scientific': {
    tableName: 'products_scientific',
    columns: [
      { field: 'series', header: 'Series', main: true },
      { field: 'part_number', header: 'Part Number', main: true },
      { field: 'mega_pixel', header: 'Mega Pixel', unit: 'MP' },
      { field: 'resolution', header: 'Resolution' },
      { field: 'pixel_size', header: 'Pixel Size', unit: 'μm' },
      { field: 'dynamic_range', header: 'Dynamic Range', unit: 'dB' },
      { field: 'peak_qe', header: 'Peak QE', unit: '' },
      { field: 'sensor_model', header: 'Sensor' },
      { field: 'frame_rate', header: 'Frame Rate', unit: 'fps' },
      { field: 'spectrum', header: 'Spectrum' },
      { field: 'interface', header: 'Interface' },
      { field: 'mount', header: 'Mount' },
      { field: 'maker_name', header: 'Maker' }
    ],
    filters: [
      {
        name: "Mega pixel",
        type: "checkbox",
        param: "mega_pixel",
        defaultExpanded: true,
        options: [
            { display: "12MP 이상", value: ">=12" },
            { display: "6 ~ 12MP 미만", value: ">=6 AND mega_pixel <12" },
            { display: "6MP 미만", value: "<6" }
        ]
      },
      {
        name: "Frame rate",
        type: "checkbox",
        param: "frame_rate",
        options: [
            { display: "300fps 이상", value: ">=300" },
            { display: "200 ~ 300fps 미만", value: ">=200 AND frame_rate <300" },
            { display: "100 ~ 200fps 미만", value: ">=100 AND frame_rate <200" },
            { display: "50 ~ 100fps 미만", value: ">=50 AND frame_rate <100" },
            { display: "10 ~ 50fps 미만", value: ">=10 AND frame_rate <50" },
            { display: "10fps 미만", value: "<10" }
        ]
      },
      {
        name: "Pixel size",
        type: "checkbox",
        param: "pixel_size",
        unit: "μm",
        options: [
            { display: "10μm 이상", value: ">= 10" },
            { display: "5 ~ 10μm 미만", value: ">=5 AND pixel_size <10" },
            { display: "5μm 미만", value: "<5" }
        ]
      },
      {
        name: "Spectrum",
        type: "checkbox",
        param: "spectrum",
        options: [
          { display: "Mono", value: "Mono" },
          { display: "Color", value: "Color" },
          { display: "ETC", value: "!Mono,Color" }
        ]
      },
      {
        name: "Interface",
        type: "checkbox",
        param: "interface",
        options: [
          { display: "CoaXPress", value: "CoaXPress" },
          { display: "USB3.2", value: "USB3.2" },
          { display: "USB3.0", value: "USB3.0" },
          { display: "ETC", value: "NOT IN ('CoaXPress','USB3.2','USB3.0')" }
        ]
      },
      {
        name: "Maker",
        type: "checkbox",
        param: "maker_name",
        options: [
          { display: "Teledyne Phtometrics", value: "Teledyne Phtometrics" },
          { display: "Teledyne Princeton Instruments", value: "Teledyne Princeton Instruments" }
        ]
      }
    ]
  },
};

// 카테고리 이름을 키로 사용하는 매핑 테이블
const categoryNameToConfig: Record<string, string> = {
  'CIS': 'cis',
  'TDI': 'tdi', 
  'Line': 'line',
  'Area': 'area',
  'Large Format': 'large_format',
  'Telecentric': 'telecentric',
  'FA Lens': 'fa_lens',
  '3D Laser Profiler': 'laser_3d',
  '3D Stereo Camera': 'stereo_3d',
  'Light': 'light',
  'Controller': 'controller',
  'Frame Grabber': 'frame_grabber',
  'GigE LAN Card': 'gige_card',
  'USB Card': 'usb_card',
  'Cable': 'cable',
  'Accessory': 'accessory',
  'Auto Focus Module': 'auto_focus_module',
  'Software': 'software',
  'Invisible': 'invisible',
  'Scientific': 'scientific'
};

// 카테고리 이름으로 설정 가져오기
export function getConfigByCategoryName(categoryName: string): CategoryConfig | null {
  const configKey = categoryNameToConfig[categoryName];
  return configKey ? categoryConfigs[configKey] : null;
}

// 제품 타입별 설정을 가져오는 함수
export function getConfigByProductType(productType: string): CategoryConfig | null {
  return categoryConfigs[productType] || null;
}

// 카테고리별 필터를 새로운 구조로 변환하는 함수
export function getCategoryFilters(categoryNames: string[]): FilterDefinition[] {
  if (categoryNames.length === 0) {
    return [];
  }

  const processedFilters = new Map<string, FilterDefinition>();

  categoryNames.forEach(categoryName => {
    const config = getConfigByCategoryName(categoryName);
    if (config && config.filters) {
      config.filters.forEach((filter) => {
        const filterDef: FilterDefinition = {
          name: filter.name,
          type: filter.type === 'checkbox' ? 'multiselect' : 
                filter.type === 'slider' ? 'range' : 'select',
          options: filter.options?.map((opt) => ({
            label: opt.display,
            value: opt.value
          })),
          min: filter.range?.[0],
          max: filter.range?.[1],
          step: filter.tick || 1
        };

        processedFilters.set(filter.param, filterDef);
      });
    }
  });

  return Array.from(processedFilters.values());
}

// 기존 함수들 호환성 유지
export function extractCategoryFilters(
  products: Array<{category_id: number, specifications?: Record<string, string | number | boolean>}>
): FilterDefinition[] {
  // 실제 제품 데이터에서 카테고리 추출
  const categoryNames = [...new Set(products.map(p => p.specifications?.category_name).filter(Boolean))] as string[];
  return getCategoryFilters(categoryNames);
}

export function getFiltersForCategories(categoryIds: string[], categories: Array<{id: number, name: string}>): FilterDefinition[] {
  const categoryNames = categoryIds.map(id => {
    const category = categories.find(c => c.id === parseInt(id));
    return category?.name;
  }).filter(Boolean) as string[];
  
  return getCategoryFilters(categoryNames);
}