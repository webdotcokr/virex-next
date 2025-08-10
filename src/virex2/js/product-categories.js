// Define product categories and their subcategories
const productCategories = {
  // Camera categories
  "camera": {
    p_cate: "10",
    fullName: "Camera",
    commonColumns: [
      { field: 'p_name', header: 'Series', main: true },
      { field: 'p_code', header: 'Part Number', main: true },
    ],
    // Common filters for all camera subcategories
    commonFilters: [
    ],
    subCategories: {
      // CIS subcategory with specific filters
      "1012": {
        fullName: "CIS",
        columns: [
          { field: 'p_item1', header: 'Scan width', unit: 'mm'},
          { field: 'p_item2', header: 'DPI', unit: 'dpi'},
          { field: 'p_item3', header: 'Resolution', unit: 'μm'},
          { field: 'p_item4', header: 'Line rate', unit: 'kHz'},
          { field: 'p_item5', header: 'Speed', unit: 'mm/s'},
          { field: 'p_item6', header: 'WD', unit: 'mm'},
          { field: 'p_item7', header: 'No. of Pixels'},
          
          { field: 'p_item_text1', header: 'Spectrum' },
          { field: 'p_item_text2', header: 'Interface' },
          { field: 'p_item_text4', header: 'Maker' },
        ],
        filters: [
          {
            name: "Scan width",
            type: "checkbox",
            param: "p_item1",
            unit: "mm",
            options: [
              { display: "1000mm 이상", value: ">=1000" },
              { display: "500 ~ 999mm", value: "BETWEEN 500 AND 999" },
              { display: "100 ~ 499mm", value: "BETWEEN 100 AND 499" },
              { display: "~ 99mm", value: "<=99" },
            ]
          },
          {
            name: "DPI",
            type: "checkbox",
            param: "p_item2",
            unit: "dpi",
            options: [
              { display: "4800dpi", value: "4800" },
              { display: "3600dpi", value: "3600" },
              { display: "2400dpi", value: "2400" },
              { display: "1800dpi", value: "1800" }, 
              { display: "1200dpi", value: "1200" }, 
              { display: "900dpi", value: "900" }, 
              { display: "600dpi", value: "600" }, 
              { display: "300dpi", value: "300" }, 
            ]
          },
          {
            name: "Speed",
            type: "checkbox",
            param: "p_item5",
            unit: "mm/s",
            options: [
              { display: "5000mm/s 이상", value: ">=5000" },
              { display: "3000 ~ 4999mm/s", value: "BETWEEN 3000 AND 4999" },
              { display: "1000 ~ 2999mm/s", value: "BETWEEN 1000 AND 2999" }, 
              { display: "~ 999mm/s ", value: "<=999" }, 
            ]
          },
          {
            name: "Line rate",
            type: "checkbox",
            param: "p_item4",
            unit: "kHz",
            options: [
              { display: "401kHz 이상", value: ">=401" },
              { display: "301 ~ 400kHz", value: "BETWEEN 301 AND 400" },
              { display: "201 ~ 300kHz", value: "BETWEEN 201 AND 300" },
              { display: "101 ~ 200kHz", value: "BETWEEN 101 AND 200" },
              { display: "100kHz 이하", value: "<=100" }
            ]
          },          
          {
            name: "No. of Pixels",
            type: "slider",
            param: "p_item3",
            range: [0, 200000],
          },
          {
            name: "WD",
            type: "checkbox", 
            param: "p_item6",
            unit: "mm",
            options: [
              { display: "8mm 이하", value: "<=8" },
              { display: "9mm ~ 15mm", value: "BETWEEN 9 AND 15" },
              { display: "16mm 이상", value: ">=16" }
            ]
          },
          {
            name: "Spectrum",
            type: "checkbox", 
            param: "p_item_text1",
            options: ["Mono", "Color", "ETC"],
          },
          {
            name: "Interface",
            type: "checkbox", 
            param: "p_item_text2",
            options: ["CoaXPress", "Camera Link", "40GigE", "10GigE", "1GigE", "ETC"],
          },
          {
            name: "Maker",
            type: "checkbox", 
            param: "p_item_text4",
            options: ["INSNEX", "ARES INTELTECH", "ETC"],
          },
        ],
      },
      
      // TDI Line subcategory
      "1015": {
        fullName: "TDI",
        columns: [
          { field: 'p_item1', header: 'Resolution'},
          { field: 'p_item2', header: 'No. of Line'},
          { field: 'p_item3', header: 'Line rate', unit: 'kHz'},
          { field: 'p_item4', header: 'Pixel size', unit: 'μm'},
          { field: 'p_item_text2', header: 'Interface' },
          { field: 'p_item_text1', header: 'Spectrum'},
          { field: 'p_item5', header: 'Dynamic Range', unit: 'dB' },
          { field: 'p_item_text3', header: 'Mount' },
          { field: 'p_item_text4', header: 'Maker' },
        ],
        filters: [
          {
            name: "Resolution",
            type: "checkbox",
            param: "p_item1",
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
            param: "p_item2",
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
            param: "p_item3",
            unit: "kHz",
            options: [
              { display: "401kHz 이상", value: ">=401" },
              { display: "301 ~ 400kHz", value: "BETWEEN 301 AND 400" },
              { display: "201 ~ 300kHz", value: "BETWEEN 201 AND 300" },
              { display: "101 ~ 200kHz", value: "BETWEEN 101 AND 200" },
              { display: "100kHz 이하", value: "<=100" }
            ]
          },
          {
            name: "Pixel size",
            type: "checkbox",
            param: "p_item4",
            unit: "μm",
            options: [
              { display: "10μm 이상", value: ">=10" },
              { display: "5 ~ 10μm 미만", value: "<=5 AND p_item4 <10" },
              { display: "5μm 미만", value: "<5" },
            ]
          },
          {
            name: "Spectrum",
            type: "checkbox", 
            param: "p_item_text1",
            options: ["Mono", "Color", "ETC"],
          },
          {
            name: "Interface",
            type: "checkbox", 
            param: "p_item_text2",
            options: ["Camera Link HS", "CoaXPress12", "CoaXPress10", "CoaXPress6", "Camera Link", "ETC"],
          },
          {
            name: "Maker",
            type: "checkbox", 
            param: "p_item_text4",
            options: ["Teledyne Dalsa", "i-TEK", "ETC"],
          },
        ],
      },
      
      // Single/Multi Line subcategory
      "1011": {
        fullName: "Line",
        columns: [
          { field: 'p_item1', header: 'Resolution'},
          { field: 'p_item2', header: 'No. of Line'},
          { field: 'p_item3', header: 'Line Rate', unit: 'kHz'},
          { field: 'p_item5', header: 'Pixel size', unit: 'μm'},
          { field: 'p_item_text2', header: 'Interface' },
          { field: 'p_item_text1', header: 'Spectrum' },
          { field: 'p_item6', header: 'Dynamic Range', unit: 'dB'},
          { field: 'p_item_text3', header: 'Mount' },
          { field: 'p_item_text4', header: 'Maker' },
        ],
        filters: [
          {
            name: "Resolution",
            type: "checkbox",
            param: "p_item1",
            options: [
              { display: "16385 이상", value: ">=16385" },
              { display: "8193 ~ 16384", value: "BETWEEN 8193 AND 16384" },
              { display: "4097 ~ 8192", value: "BETWEEN 4097 AND 8192" },
              { display: "2049 ~ 4096", value: "BETWEEN 2049 AND 4096" },
              { display: "2048 이하", value: "<=2048" },
            ]
          },
          {
            name: "No. of Line",
            type: "checkbox",
            param: "p_item2",
            options: [
              { display: "5 이상", value: ">=5" },
              { display: "2 ~ 4", value: "BETWEEN 2 AND 4" },
              { display: "1", value: "1" },
            ]
          },
          {
            name: "Line rate",
            type: "checkbox",
            param: "p_item4",
            unit: "kHz",
            options: [
              { display: "401kHz 이상", value: ">=401" },
              { display: "301 ~ 400kHz", value: "BETWEEN 301 AND 400" },
              { display: "201 ~ 300kHz", value: "BETWEEN 201 AND 300" },
              { display: "101 ~ 200kHz", value: "BETWEEN 101 AND 200" },
              { display: "~ 100kHz", value: "<=100" },
            ]
          },
          {
            name: "Pixel size",
            type: "checkbox",
            param: "p_item5",
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
            param: "p_item_text1",
            options: ["Mono", "Color", "ETC"],
          },
          {
            name: "Interface",
            type: "checkbox", 
            param: "p_item_text2",
            options: ["Camera Link HS", "CoaXPress", "Camera Link", "SFP+", "GigE", "ETC"],
          },
          {
            name: "Maker",
            type: "checkbox", 
            param: "p_item_text4",
            options: ["Teledyne Dalsa", "i-TEK", "ETC"],
          },
        ],
      },
      
      // Area Scan subcategory
      "1010": {
        fullName: "Area",
        columns: [
          { field: 'p_item1', header: 'Mega pixel', unit: 'MP'},
          { field: 'p_item_text5', header: 'Resolution' },
          { field: 'p_item_text6', header: 'Sensor' },
          { field: 'p_item2', header: 'Frame Rate', unit: 'fps'},
          { field: 'p_item4', header: 'Pixel size', unit: 'μm'},
          { field: 'p_item_text7', header: 'Image circle'},
          { field: 'p_item_text2', header: 'Interface' },
          { field: 'p_item_text1', header: 'Spectrum'},
          { field: 'p_item6', header: 'Dynamic Range', unit: 'dB' },
          { field: 'p_item_text3', header: 'Mount' },
          { field: 'p_item_text4', header: 'Maker' },
          
          
          
        ],
        filters: [
          {
            name: "Mega pixel",
            type: "checkbox",
            param: "p_item1",
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
            param: "p_item2",
            options: [
              { display: "300fps 이상", value: ">=300" },
              { display: "200fps ~ 300fps 미만", value: ">=200 AND p_item2 <300" },
              { display: "100fps ~ 200fps 미만", value: ">=100 AND p_item2 <200" },
              { display: "50fps ~ 100fps 미만", value: ">=50 AND p_item2 <100" },
              { display: "10fps ~ 50fps 미만", value: ">=10 AND p_item2 < 50" },
              { display: "10fps 미만", value: "<10" },
            ]
          },
          {
            name: "Pixel size",
            type: "checkbox",
            param: "p_item4",
            unit: "μm",
            options: [
              { display: "10μm이상", value: ">=10" },
              { display: "5μm ~ 10μm 미만", value: ">=5 AND p_item4 <10" },
              { display: "5μm 미만", value: "<5" },
            ]
          },
          {
            name: "Spectrum",
            type: "checkbox", 
            param: "p_item_text1",
            options: ["Mono", "Color"],
          },
          {
            name: "Interface",
            type: "checkbox", 
            param: "p_item_text2",
            options: ["Camera Link HS", "CoaXPress", "Camera Link", "10GigE", "5GigE", "2.5GigE", "1GigE", "USB3.0"],
          },
          {
            name: "Maker",
            type: "checkbox", 
            param: "p_item_text4",
            options: ["Teledyne Dalsa", "Teledyne FLIR", "Teledyne Lumenera", "Daheng Imaging", "i-TEK", "ETC"],
          },
        ]
      },
      
      // Invisible subcategory
      "1013": {
        fullName: "Invisible",
        columns: [
          { field: 'p_item_text8', header: 'Type'},
          { field: 'p_item1', header: 'Mega pixel', unit: 'MP'},
          { field: 'p_item_text5', header: 'Resolution' },
          { field: 'p_item4', header: 'Pixel size', unit: 'μm'},
          { field: 'p_item_text1', header: 'Spectrum'},
          { field: 'p_item6', header: 'Dynamic Range', unit: 'dB' },
          { field: 'p_item_text6', header: 'Sensor' },
          { field: 'p_item2', header: 'Frame Rate', unit: 'fps/kHz'},
          { field: 'p_item_text2', header: 'Interface' },
          { field: 'p_item_text3', header: 'Mount' },
          { field: 'p_item_text4', header: 'Maker' },
        ],
        filters: [
          {
            name: "Mega pixel",
            type: "checkbox",
            param: "p_item1",
            options: [
              { display: "4096 이상", value: ">=4096" },
              { display: "2048 ~ 4095 미만", value: ">=2048 AND p_item1 <4096" },
              { display: "27 ~ 50MP 미만", value: ">=27 AND p_item1 <50" },
              { display: "5.2MP ~ 27MP 미만", value: ">=5.2 AND p_item1 <27" },
              { display: "5.1MP 미만", value: "<5.1" },
            ]
          },
          {
            name: "Frame rate",
            type: "checkbox",
            param: "p_item2",
            unit: "fps/kHz",
            options: [
              { display: "300fps 이상", value: ">=300" },
              { display: "200 ~ 300fps 미만", value: ">=200 AND p_item2 <300" },
              { display: "100 ~ 200fps 미만", value: ">=100 AND p_item2 <200" },
              { display: "50 ~ 100fps 미만", value: ">=50 AND p_item2 <100" },
              { display: "10 ~ 50fps 미만", value: ">=10 AND p_item2 <50" },
              { display: "10fps 미만", value: "<10" },
            ]
          },
          {
            name: "Pixel size",
            type: "checkbox",
            param: "p_item4",
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
            param: "p_item_text1",
            options: ["UV", "NIR", "SWIR", "ETC"],
          },
          {
            name: "Interface",
            type: "checkbox", 
            param: "p_item_text2",
            options: ["Camera Link HS", "CoaXPress", "Camera Link", "10GigE", "5GigE", "2.5GigE", "1GigE", "USB3.0"],
          },
          {
            name: "Maker",
            type: "checkbox", 
            param: "p_item_text4",
            options: ["Teledyne Dalsa", "Teledyne FLIR", "Daheng Imaging", "NIT", "i-TEK", "ETC"],
          },
        ]
      },
      
      // Scientific subcategory
      "1014": {
        fullName: "Scientific",
        columns: [
          { field: 'p_item1', header: 'Mega pixel', unit: 'MP'},
          { field: 'p_item_text5', header: 'Resolution' },
          { field: 'p_item4', header: 'Pixel size', unit: 'μm'},
          { field: 'p_item6', header: 'Dynamic Range', unit: 'dB' },
          { field: 'p_item_text9', header: 'Peak QE'},
          { field: 'p_item_text6', header: 'Sensor' },
          { field: 'p_item2', header: 'Frame Rate', unit: 'fps'},
          { field: 'p_item_text1', header: 'Spectrum'},
          { field: 'p_item_text2', header: 'Interface' },
          { field: 'p_item_text3', header: 'Mount' },
          { field: 'p_item_text4', header: 'Maker' },
        ],
        filters: [
          {
            name: "Mega pixel",
            type: "checkbox",
            param: "p_item1",
            options: [
              { display: "12MP 이상", value: ">=12" },
              { display: "6 ~ 12MP 미만", value: ">=6 AND p_item1 <12" },
              { display: "6MP 미만", value: "<6" }
            ]
          },
          {
            name: "Frame rate",
            type: "checkbox",
            param: "p_item2",
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
            param: "p_item4",
            unit: "μm",
            options: [
              { display: "10μm 이상", value: ">= 10" },
              { display: "5 ~ 10μm 미만", value: ">=5 AND p_item4 <10" },
              { display: "5μm 미만", value: "<5" }
            ]
          },
          {
            name: "Spectrum",
            type: "checkbox", 
            param: "p_item_text1",
            options: ["Mono", "Color", "ETC"],
          },
          {
            name: "Interface",
            type: "checkbox", 
            param: "p_item_text2",
            options: ["CoaXPress", "USB3.2", "USB3.0", "ETC"],
          },
          {
            name: "Maker",
            type: "checkbox", 
            param: "p_item_text4",
            options: ["Teledyne Phtometrics", "Teledyne Princeton Instruments"],
          },
        ]
      }
    },
  },
  
  // Lens categories
  "lens": {
    p_cate: "11",
    fullName: "렌즈",
    // Common filters for all lens subcategories
    commonFilters: [
    ],
    // Specific subcategory configurations
    commonColumns: [
      { field: 'p_name', header: 'Series'},
      { field: 'p_code', header: 'Part Number'},      
    ],
    subCategories: {
      "1112": {
        fullName: "Large Format Lens",
        columns: [
          { field: 'p_item_text1', header: 'Mag Range', unit: 'x'},
          { field: 'p_item1', header: 'Central Mag', unit: 'x'},
          { field: 'p_item2', header: 'Image Circle', unit: 'φ/mm'},
          { field: 'p_item3', header: 'Focal length', unit: 'mm'},
          { field: 'p_item4', header: 'Image Resolution', unit: 'μm' },
          { field: 'p_item_text2', header: 'F#' },
          { field: 'p_item_text3', header: 'Coaxial' },
          { field: 'p_item_text5', header: 'Mount' },
          { field: 'p_item_text4', header: 'Maker' },
        ],
        filters: [
          {
            name: "Central Mag",
            unit: "x",
            type: "slider",
            param: "p_item1",
            range: [0, 7],
            tick: 0.1
          },
          {
            name: "Image Circle",
            unit: "φ/mm",
            type: "slider",
            param: "p_item2",
            range: [0, 100] 
          },
          {
            name: "Focal length",
            unit: "mm",
            type: "slider",
            param: "p_item3",
            range: [4, 150]
          },
          {
            name: "F#",
            type: "checkbox",
            param: "p_item_text2",
            options: [
              { display: "~ 4.0미만", value: "<4" },
              { display: "4.0~5.6미만", value: ">= 4 AND p_item_text2 < 5.6" },
              { display: "5.6이상", value: ">=5.6" }
            ]
          },
          {
            name: "Maker",
            type: "checkbox", 
            param: "p_item_text4",
            options: ["Schneider", "Dzoptics", "ETC"],
          },
        ]
      },
      "1111": {
        fullName: "Telecentric",
        columns: [
          // Mag (x)	WD (mm)	NA	F#	Image Circle (φ/mm)	Coaxial	Mount	Maker
          { field: 'p_item1', header: 'Mag', unit: 'x'},
          { field: 'p_item3', header: 'WD', unit: 'mm'},
          { field: 'p_item4', header: 'NA'},
          { field: 'p_item_text2', header: 'F#' },
          { field: 'p_item2', header: 'Image Circle', unit: 'φ/mm'},
          { field: 'p_item_text3', header: 'Coaxial'},
          { field: 'p_item_text5', header: 'Mount'},
          { field: 'p_item_text4', header: 'Maker'},
        ],
        filters: [
          {
            name: "Mag",
            unit: "x",
            type: "slider", 
            param: "p_item1",
            range: [0, 10],
            tick: 0.1
          },
          {
            name: "Image Circle",
            unit: "φ/mm(인치)",
            type: "checkbox",
            param: "p_item2",
            options: [  
              { display: "45mm 이상", value: ">=45" },
              { display: "35mm 이상 ~45mm 미만", value: ">= 35 AND p_item2 < 45" },
              { display: "21.3mm(4/3\") 이상 ~35mm 미만", value: ">= 21.3 AND p_item2 < 35" },
              { display: "18.4mm(1.1\") 이상 ~21.3mm (4/3\") 미만", value: ">= 18.4 AND p_item2 < 21.3" },
              { display: "16mm(1\") 이상 ~18.4mm (1.1\") 미만", value: ">= 16 AND p_item2 < 18.4" },
              { display: "11.4mm(2/3\") 이상 ~16mm (1\") 미만", value: ">= 11.4 AND p_item2 < 16" },
              { display: "8mm(1/2\") 이상 ~11.4mm (2/3\") 미만", value: ">= 8 AND p_item2 < 11.4" },
              { display: "8mm(1/2\")미만", value: "<8" }
            ]
          },
          {
            name: "WD (±2mm)",
            unit: "mm",
            type: "checkbox",
            param: "p_item3",
            options: [
              { display: "65mm 미만", value: "<65" },
              { display: "66 ~ 110mm 미만", value: ">= 66 AND p_item3 < 110" },
              { display: "111 ~ 200mm 미만", value: ">= 111 AND p_item3 < 200" },
              { display: "201 ~ 300mm 미만", value: ">= 201 AND p_item3 < 300" },
              { display: "301mm 이상", value: ">=301" }
            ]
          },
          {
            name: "F#",
            type: "checkbox",
            param: "p_item_text2",
            options: [
              { display: "10 미만", value: "<10" },
              { display: "10 ~ 20 미만", value: ">= 10 AND p_item_text2 < 20" },
              { display: "21 이상", value: ">=21" }
            ]
          },
          {
            name: "Maker",
            type: "checkbox", 
            param: "p_item_text4",
            options: ["Dzoptics", "NEW TRY", "ETC"],
          },
        ]
      },
      "1110": {
        fullName: "FA Lens",
        columns: [
          { field: 'p_item1', header: 'Focal length', unit: 'mm'},
          { field: 'p_item2', header: 'Image Circle', unit: 'φ/mm'},
          { field: 'p_item3', header: 'Image Resolution', unit: 'μm' },
          { field: 'p_item_text1', header: 'Mag Range', unit: 'x' },          
          { field: 'p_item_text2', header: 'F#'},
          { field: 'p_item_text4', header: 'Maker' },
          { field: 'p_item_text5', header: 'Mount' },
        ],
        filters: [
          {
            name: "Focal length",
            unit: "mm",
            param: "p_item1",
            type: "checkbox",
            options: [
              { display: "50mm 이상", value: ">=50" },
              { display: "25 ~ 50mm 미만", value: ">= 25 AND p_item1 < 50" },
              { display: "6 ~ 25mm 미만", value: ">= 6 AND p_item1 < 25" },
              { display: "~ 6mm미만", value: "<6" },
            ]
          },
          {
            name: "Image Circle",
            unit: "φ/mm",
            param: "p_item2",
            type: "checkbox",
            options: [
              { display: "18.4mm 이상", value: ">=18.4" },
              { display: "16mm(1\") 이상 ~ 18.4mm(1.1\") 미만", value: ">= 16 AND p_item2 < 18.4" },
              { display: "11.4mm(2/3\") 이상 ~ 16mm(1\") 미만", value: ">= 11.4 AND p_item2 < 16" },
              { display: "8mm(1/2\") 이상 ~ 11.4mm(2/3\") 미만", value: ">= 8 AND p_item2 < 11.4" },
            ]
          },
          {
            name: "F#",
            type: "checkbox",
            param: "p_item_text2",
            options: [
              { display: "~ 2.2 미만", value: "<2.2" },
              { display: "2.2 ~ 3.0 미만", value: ">= 2.2 AND p_item_text2 < 3.0" },
              { display: "3.0 이상", value: ">=3" }
            ]
          },
          {
            name: "Maker",
            type: "checkbox", 
            param: "p_item_text4",
            options: ["Dzoptics", "ETC"],
          },
        ]
      },
    },
  },
  
  // 3D Camera categories
  "3d-camera": {
    p_cate: "13",
    fullName: "3D Camera",
    // Common filters for all 3D camera subcategories
    commonFilters: [
    ],
    // Specific subcategory configurations
    commonColumns: [
      { field: 'p_name', header: 'Series', main: true },
      { field: 'p_code', header: 'Part Number', main: true },      
    ],
    subCategories: {
      "1310": {
        fullName: "3D Laser Profiler",
        columns: [
          { field: 'p_item1', header: 'Point'},
          { field: 'p_item2', header: 'Z-Range', unit: 'mm'},
          { field: 'p_item_text1', header: 'Z-Res.', unit: 'μm' },
          { field: 'p_item_text2', header: 'X-Res.', unit: 'μm' },
          { field: 'p_item_text3', header: 'FOV', unit: 'mm' },
          { field: 'p_item3', header: 'Profile Rate', unit: 'Profiles/sec'},
          { field: 'p_item4', header: 'WD', unit: 'mm'},
          { field: 'p_item_text5', header: 'Linearity', unit: '' },
          { field: 'p_item_text6', header: 'Laser option' },
          { field: 'p_item_text4', header: 'Maker' },
        ],
        filters: [
        ]
      },
      "1311": {
        fullName: "3D Stereo Camera",
        columns: [
          /**
           * Mega pixel (MP)	Pixel size (μm)	Spectrum	WD (m)	FOV	"Depth Accuracy"	"Shutter type"	Interface	Maker 
           * Spectrum	FOV	"Depth Accuracy"	Interface					
           */
          { field: 'p_item1', header: 'Mega pixel', unit: 'MP'},
          { field: 'p_item2', header: 'Pixel size', unit: 'μm' },
          { field: 'p_item_text1', header: 'FOV'},
          { field: 'p_item3', header: 'Focal length', unit: 'mm' },
          { field: 'p_item_text2', header: 'Depth Accuracy' },
          { field: 'p_item_text3', header: 'Spectrum' },
          { field: 'p_item_text4', header: 'Shutter type' },
          { field: 'p_item_text5', header: 'Interface' },
          { field: 'p_item_text6', header: 'Maker' },
        ],
        filters: [
        ]
      }
    },
  },
  
  // AF Module categories
  "af-module": {
    p_cate: "16",
    fullName: "Auto Focus Module",
    // Common filters for all 3D camera subcategories
    commonFilters: [
    ],
    // Specific subcategory configurations
    commonColumns: [
      { field: 'p_name', header: 'Series'},
      { field: 'p_code', header: 'Part Number'},
      { field: 'p_content1', header: 'Description'},
      { field: 'p_item_text1', header: 'Sensing Type'},
      { field: 'p_item_text2', header: 'Sampling Rate', unit: 'kHz' },
      { field: 'p_item_text3', header: 'Capture Range', unit: 'μm' },
      { field: 'p_item1', header: 'Laser', unit: 'nm'},
      { field: 'p_item_text5', header: 'Interface' },
      { field: 'p_item_text4', header: 'Stroke', unit: 'mm' },
      { field: 'p_item2', header: 'Resolution', unit: 'μm/Pulse'},
      { field: 'p_item_text7', header: 'Linearity Error', unit: '%' },
      { field: 'p_item_text8', header: 'Repeatablility', unit: 'μm/Pulse' },
      { field: 'p_item_text6', header: 'Maker' }
    ],
    subCategories: {
    },
  },
  
  // Light categories
  "light": {
    p_cate: "14",
    fullName: "조명",
    // Common filters for all 3D camera subcategories
    commonFilters: [
    ],
    // Specific subcategory configurations
    commonColumns: [
      { field: 'p_name', header: 'Series'},
      { field: 'p_code', header: 'Part Number'},
    ],
    subCategories: {
      "1410": {
        fullName: "Light",
        columns: [          
          { field: 'p_item_text1', header: 'Color'},
          { field: 'p_item_text2', header: 'Wavelength' },
          { field: 'p_item_text3', header: 'Power' },
          { field: 'p_item_text4', header: 'Controller' },
          { field: 'p_item_text5', header: 'Current' },
          { field: 'p_item_text6', header: 'Maker' },
          { field: 'p_item_text7', header: 'Focal length' },
        ],
        filters: []
      },
      "1411": {
        fullName: "Light sources",
        columns: [],
        filters: []
      },
      "1412": {
        fullName: "Controller",
        columns: [          
          { field: 'p_item1', header: 'Channel'},
          { field: 'p_item2', header: 'Max. Continuous Current', unit: 'A' },
          { field: 'p_item3', header: 'Max. Pules Current', unit: 'A' },
          { field: 'p_item4', header: 'Min. Pulse Width', unit: 'μs' },
          { field: 'p_item5', header: 'Max.Frequency', unit: 'kHz' },

          { field: 'p_item_text1', header: 'LED Voltage Range', unit: 'V' },
          { field: 'p_item_text2', header: 'Max.Power output', unit: 'W' },
          { field: 'p_item_text6', header: 'Maker' },
        ],
        filters: []
      }
    },
  },
  
  // Frame grabber categories
  "frame-grabber": {
    p_cate: "12",
    fullName: "프레임그래버",
    // Common filters for all 3D camera subcategories
    commonFilters: [
    ],
    // Specific subcategory configurations
    commonColumns: [
      { field: 'p_name', header: 'Series', main: true },
      { field: 'p_code', header: 'Part Number', main: true },
    ],
    subCategories: {
      "1210": {
        fullName: "프레임그래버", // This is the new parent for specific frame grabber types
        columns: [
          { field: 'p_item_text1', header: 'Model'},
          { field: 'p_item_text5', header: 'Interface'},
          { field: 'p_item_text2', header: 'PC slot'},
          { field: 'p_item3', header: 'Acquisition Rate', unit: 'GB/s'},
          { field: 'p_item2', header: 'On-board Memory', unit: 'MB'},
          { field: 'p_item_text3', header: 'Input'},
          { field: 'p_item_text6', header: 'Maker'},
        ], // Or minimal common columns if applicable
        filters: [
          { 
            name: "Interface", 
            param: "p_item_text5",
            type: "checkbox", 
            options: ["10GigE", "CoaXPress", "Camera Link HS", "Camera Link"],
          },
        ],
      },
      "1211": {
        fullName: "GigE 랜카드",
        columns: [
          { field: 'p_item1', header: 'Port'},
          { field: 'p_item_text1', header: 'Chipset'},
          { field: 'p_item_text2', header: 'PCIe'},
          { field: 'p_item_text3', header: 'Connector'},
          { field: 'p_item_text4', header: 'PoE'},
          { field: 'p_item_text5', header: 'Interface'},
          { field: 'p_item_text6', header: 'Maker'},
        ],
        filters: [
          { 
            name: "Interface", 
            param: "p_item_text5",
            type: "checkbox", 
            options: ["10GigE", "5GigE", "2.5GigE", "1GigE"],
          },
          { 
            name: "Port", 
            param: "p_item1",
            type: "checkbox", 
            unit: "CH",
            options: [
              { display: "9CH 이상", value: ">=9" },
              { display: "8CH", value: "8" },
              { display: "4CH", value: "4" },
              { display: "2CH", value: "2" },
              { display: "1CH", value: "1" }
            ],
          },
          { 
            name: "PCIe", 
            param: "p_item_text2",
            type: "checkbox", 
            options: ["PCIe3.0", "PCIe2.0", "PCI"],
          },
          { 
            name: "PoE", 
            param: "p_item_text4",
            type: "checkbox", 
            options: ["PoE", "Non PoE"],
          },
        ]
      },
      "1212": {
        fullName: "USB 카드",
        columns: [
          { field: 'p_item1', header: 'Port', unit: 'CH'},
          { field: 'p_item2', header: 'Trans Speed', unit: 'Gb/s'},
          { field: 'p_item_text1', header: 'Chipset'},
          { field: 'p_item_text2', header: 'PCIe'},
          { field: 'p_item_text3', header: 'Connector'},
          { field: 'p_item_text5', header: 'Interface'},
          { field: 'p_item_text6', header: 'Maker'},
        ],
        filters: [
          { 
            name: "Interface", 
            param: "p_item_text5",
            type: "checkbox", 
            options: ["USB3.2", "USB3.1", "USB3.0"],
          },
          { 
            name: "Port", 
            param: "p_item1",
            type: "checkbox", 
            unit: "CH",
            options: [
              { display: "9CH 이상", value: ">=9" },
              { display: "8CH", value: "8" },
              { display: "4CH", value: "4" },
              { display: "2CH", value: "2" },
              { display: "1CH", value: "1" }           
            ],
          },
          { 
            name: "PCIe", 
            param: "p_item_text2",
            type: "checkbox", 
            options: ["PCIe3.0", "PCIe2.0", "PCI"],
          },
          { 
            name: "Trans Speed", 
            param: "p_item2",
            type: "checkbox", 
            unit: "Gb/s",
            options: [
              { display: "10Gb/s", value: "10" },
              { display: "5Gb/s", value: "5" }
            ],
          },
        ]
      },
    },
  },
  
  // Software categories
  "software": {
    p_cate: "15",
    fullName: "소프트웨어",
    commonFilters: [
    ],
    // Specific subcategory configurations
    commonColumns: [
      { field: 'p_name', header: 'Type'},
      { field: 'p_content1', header: 'Description'},
      { field: 'p_item_text1', header: 'Device'},
      { field: 'p_item_text2', header: 'Part number'},
      { field: 'p_item_text6', header: 'Maker'},
    ],
    subCategories: {
    },
  },
  
  // Accessory categories
  "accessory": {
    p_cate: "17",
    fullName: "주변기기",
    // Common filters for all 3D camera subcategories
    commonFilters: [
    ],
    // Specific subcategory configurations
    commonColumns: [
      { field: 'p_name', header: 'Series'},
      { field: 'p_code', header: 'Part Number'},
    ],
    subCategories: {
      "1711": {
        fullName: "케이블",
        columns: [
          { field: 'p_content1', header: 'Description'},
          { field: 'p_item_text6', header: 'Maker'},
        ],
        filters: []
      },
      "1712": {
        fullName: "악세사리",
        columns: [
          { field: 'p_content1', header: 'Description'},
          { field: 'p_item_text6', header: 'Maker'},
        ],
        filters: []
      },
      "1713": {
        fullName: "기타",
        columns: [],
        filters: []
      }
    },
  },
};

// Helper function to get all filters for a specific subcategory
// This function combines common filters with subcategory-specific filters
productCategories.getSubCategoryFilters = function(productType, subCategoryCode) {
  const category = this[productType];
  if (!category) return [];
  
  // Get common filters for this product type
  const commonFilters = category.commonFilters || [];
  
  // Get subcategory-specific filters
  const subCategoryConfig = category.subCategories[subCategoryCode];
  const specificFilters = subCategoryConfig ? subCategoryConfig.filters || [] : [];
  
  // Combine filters - specific filters override common filters with the same param
  const combinedFilters = [...commonFilters];
  
  // Add or replace specific filters
  specificFilters.forEach(specificFilter => {
    const commonIndex = combinedFilters.findIndex(f => f.param === specificFilter.param);
    if (commonIndex >= 0) {
      // Replace the common filter with the specific one
      combinedFilters[commonIndex] = specificFilter;
    } else {
      // Add the specific filter
      combinedFilters.push(specificFilter);
    }
  });
  
  return combinedFilters;
};

// Helper function to get all filters for a specific subcategory
productCategories.getSubCategoryFilters = function(productType, subCategoryCode) {
  const category = this[productType];
  if (!category) return [];
  const commonFilters = category.commonFilters || [];
  const subCategory = category.subCategories[subCategoryCode];
  const specificFilters = subCategory ? subCategory.filters || [] : [];
  return [...commonFilters, ...specificFilters];
};

// Helper function to get columns for a specific subcategory
productCategories.getSubCategoryColumns = function(productType, subCategoryCode) {
  const category = this[productType];
  if (!category) return [];
  const commonColumns = category.commonColumns || [];
  const subCategory = category.subCategories[subCategoryCode];
  const specificColumns = subCategory ? subCategory.columns || [] : [];
  return [...commonColumns, ...specificColumns];
};
