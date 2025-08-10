<%@Language=VBScript CodePage = 65001%>
<%
Session.CodePage = 65001
Response.charset ="utf-8"
Session.LCID     = 1042 'ko-KR

' 도메인 리다이렉트 처리 (루트 → www, HTTP → HTTPS) - 모든 페이지 적용
Dim currentHost, isWWW
currentHost = LCase(Request.ServerVariables("HTTP_HOST"))
isWWW = (InStr(currentHost, "www.") = 1)

' 루트 도메인을 www로 리다이렉트
If Not isWWW Then
	Dim redirectURL
	redirectURL = "https://www." & currentHost & Request.ServerVariables("URL")
	If Request.QueryString <> "" Then
		redirectURL = redirectURL & "?" & Request.QueryString
	End If
	Response.Status = "301 Moved Permanently"
	Response.AddHeader "Location", redirectURL
	Response.End
End If

' www에서 HTTP를 HTTPS로 리다이렉트
If isWWW And Request.ServerVariables("SERVER_PORT")<>443 And Request.ServerVariables("HTTPS")<>"on" Then
	redirectURL = "https://" & currentHost & Request.ServerVariables("URL")
	If Request.QueryString <> "" Then
		redirectURL = redirectURL & "?" & Request.QueryString
	End If
	Response.Status = "301 Moved Permanently"
	Response.AddHeader "Location", redirectURL
	Response.End
End If

Dim DIR_ROOT
DIR_ROOT = ""

Dim GOOGLE_CAPTCHA_SITE_KEY, GOOGLE_CAPTCHA_SECRET_KEY
GOOGLE_CAPTCHA_SITE_KEY = "6LcbGGIrAAAAAMqtTvvO4CFM5NKumuqTEoZH2VfE"
GOOGLE_CAPTCHA_SECRET_KEY = "6LcbGGIrAAAAAL0HrTp9QyC__6xx-bI-6grmI44F"

' Create PRODUCT_META Dictionary object
Set PRODUCT_META = Server.CreateObject("Scripting.Dictionary")

' Add product type: camera
Set productTypeCamera = Server.CreateObject("Scripting.Dictionary")
productTypeCamera.Add "title_en", "Camera" 
productTypeCamera.Add "title_ko", "카메라"
productTypeCamera.Add "desc_ko", "카메라 렌즈 기술을 선도하는 글로벌 광학 기술 Virex<br/>사진과 영상의 품질을 혁신적으로 향상시키는 첨단 렌즈 솔루션을 제공합니다."
productTypeCamera.Add "p_cate", "10"

' Add categories for camera
Set cameraCategories = Server.CreateObject("Scripting.Dictionary")
cameraCategories.Add "1012", "CIS"
cameraCategories.Add "1015", "TDI"
cameraCategories.Add "1011", "Line"
cameraCategories.Add "1010", "Area"
cameraCategories.Add "1013", "Invisible"
cameraCategories.Add "1014", "Scientific"
productTypeCamera.Add "sub-categories", cameraCategories

' Add category descriptions for camera
Set cameraDescriptions = Server.CreateObject("Scripting.Dictionary")
cameraDescriptions.Add "1012", "센서,렌즈,조명 일체형 / 300~3600DPI / Contact Image Sensor"
cameraDescriptions.Add "1015", "최대 32K해상도 지원 / 16K 해상도 1MHz Line rate / 초고속 고감도 TDI 카메라"
cameraDescriptions.Add "1011", "8K, 16K 해상도에서 최대 300KHz / HDR 및 다중 스펙트럼 / Multi Line Scan 카메라"
cameraDescriptions.Add "1010", "0.3MP 컴팩트 사이즈 카메라부터 / 152MP 초고해상도 / Area Scan 카메라"
cameraDescriptions.Add "1013", "Pixel Operability 99% / 고감도 2K / SWIR Line Scan Camera"
cameraDescriptions.Add "1014", "96%의 QE / 서브전자 0.7e- 노이즈 / back-illuminated sCMOS Camera"
productTypeCamera.Add "category-descriptions", cameraDescriptions

PRODUCT_META.Add "camera", productTypeCamera

' Add product type: lens
Set productTypeLens = Server.CreateObject("Scripting.Dictionary")
productTypeLens.Add "title_en", "Lens" 
productTypeLens.Add "title_ko", "렌즈"
productTypeLens.Add "desc_ko", "카메라 렌즈 기술을 선도하는 글로벌 광학 기술 Virex<br/>사진과 영상의 품질을 혁신적으로 향상시키는 첨단 렌즈 솔루션을 제공합니다."
productTypeLens.Add "p_cate", "11" 
' Add categories for lens
Set lensCategories = Server.CreateObject("Scripting.Dictionary")
lensCategories.Add "1112", "Large Format"
lensCategories.Add "1111", "Telecentric"
lensCategories.Add "1110", "FA Lens"
productTypeLens.Add "sub-categories", lensCategories

' Add category descriptions for lens
Set lensDescriptions = Server.CreateObject("Scripting.Dictionary")
lensDescriptions.Add "1112", "0.04x~6.2x 배율 / Apochromatic 보정 / Image Circle 82mm 이상 라인스캔 렌즈"
lensDescriptions.Add "1111", "2/3"" ~ Dia 44mm Image Circle / 0.12x ~ 6.0x 배율 / Telecentric Lens"
lensDescriptions.Add "1110", "1/1.7"" ~ 1.1"" 24MP / (2.74um 픽셀사이즈 지원) 대응 / Fixed Focal Length 렌즈"
productTypeLens.Add "category-descriptions", lensDescriptions

PRODUCT_META.Add "lens", productTypeLens

' Add product type: 3d-camera
Set productType3DCamera = Server.CreateObject("Scripting.Dictionary")
productType3DCamera.Add "title_en", "3D Camera" 
productType3DCamera.Add "title_ko", "3D 카메라"
productType3DCamera.Add "desc_ko", "카메라 렌즈 기술을 선도하는 글로벌 광학 기술 Virex<br/>사진과 영상의 품질을 혁신적으로 향상시키는 첨단 렌즈 솔루션을 제공합니다."
productType3DCamera.Add "p_cate", "13"
' Add categories for 3d-camera
Set camera3DCategories = Server.CreateObject("Scripting.Dictionary")
camera3DCategories.Add "1310", "3D Laser Profiler"
camera3DCategories.Add "1311", "3D Stereo Camera"
productType3DCamera.Add "sub-categories", camera3DCategories

' Add category descriptions for 3d-camera
Set camera3DDescriptions = Server.CreateObject("Scripting.Dictionary")
camera3DDescriptions.Add "1310", "레이저 광삼각법 방식으로 / 정밀한 높이 측정 / 3D 레이저 프로파일러"
camera3DDescriptions.Add "1311", "Sony 3MP 센서 탑재로 / 높은 깊이 정확도 / 5GigE 3D 스테레오 카메라"
productType3DCamera.Add "category-descriptions", camera3DDescriptions

PRODUCT_META.Add "3d-camera", productType3DCamera

' Add product type: af-module
Set productTypeAFModule = Server.CreateObject("Scripting.Dictionary")
productTypeAFModule.Add "title_en", "AF Module" 
productTypeAFModule.Add "title_ko", "오토포커스모듈"
productTypeAFModule.Add "desc_ko", "FPGA 기반의 실시간 위치 측정 및 Z축 제어 자동 초점 모듈"
productTypeAFModule.Add "p_cate", "16"
' Add categories for af-module
' Set afModuleCategories = Server.CreateObject("Scripting.Dictionary")
' afModuleCategories.Add "0010", "VCM"
' afModuleCategories.Add "0020", "Liquid Lens"
' afModuleCategories.Add "0030", "Step Motor"
' productTypeAFModule.Add "sub-categories", afModuleCategories
PRODUCT_META.Add "af-module", productTypeAFModule

' Add product type: light
Set productTypeLight = Server.CreateObject("Scripting.Dictionary")
productTypeLight.Add "title_en", "Light" 
productTypeLight.Add "title_ko", "조명"
<!-- productTypeLight.Add "desc_ko", "카메라 렌즈 기술을 선도하는 글로벌 광학 기술 Virex<br/>사진과 영상의 품질을 혁신적으로 향상시키는 첨단 렌즈 솔루션을 제공합니다." -->
productTypeLight.Add "p_cate", "14"
' Add categories for light
Set lightCategories = Server.CreateObject("Scripting.Dictionary")
lightCategories.Add "1410", "Light"
lightCategories.Add "1411", "Light sources"
lightCategories.Add "1412", "Controller"
productTypeLight.Add "sub-categories", lightCategories

' Add category descriptions for light
Set lightDescriptions = Server.CreateObject("Scripting.Dictionary")
lightDescriptions.Add "1410", "고속이미징처리에 적합한 / 고휘도 하이브리드 스팟 조명"
lightDescriptions.Add "1411", "최대 2CH 제어 / 150W 라이트소스"
lightDescriptions.Add "1412", "최대 200A에서 0.5us 이하 / 초고속 펄스 생성 / 스트로브 컨트롤러"
productTypeLight.Add "category-descriptions", lightDescriptions

PRODUCT_META.Add "light", productTypeLight

' Add product type: frame-grabber
Set productTypeFrameGrabber = Server.CreateObject("Scripting.Dictionary")
productTypeFrameGrabber.Add "title_en", "Frame Grabber"
productTypeFrameGrabber.Add "title_ko", "프레임그래버"
<!-- productTypeFrameGrabber.Add "desc_ko", "카메라 렌즈 기술을 선도하는 글로벌 광학 기술 Virex<br/>사진과 영상의 품질을 혁신적으로 향상시키는 첨단 렌즈 솔루션을 제공합니다." -->
productTypeFrameGrabber.Add "p_cate", "12"
' Add categories for frame-grabber
Set frameGrabberCategories = Server.CreateObject("Scripting.Dictionary")
frameGrabberCategories.Add "1210", "Frame Grabber"
frameGrabberCategories.Add "1211", "GigE 랜카드"
frameGrabberCategories.Add "1212", "USB 카드"
productTypeFrameGrabber.Add "sub-categories", frameGrabberCategories

' Add category descriptions for frame-grabber
Set frameGrabberDescriptions = Server.CreateObject("Scripting.Dictionary")
frameGrabberDescriptions.Add "1210", "실시간 패킷해제 엔진으로 / CPU부하량을 최소화 하는 Xtium2 / 프레임그래버 시리즈"
frameGrabberDescriptions.Add "1211", "머신비전 산업용 NIC 보드 / (1G, 2.5G, 5G, 10G 지원)"
frameGrabberDescriptions.Add "1212", "머신비전 산업용 USB 카드 / (USB Interface)"
productTypeFrameGrabber.Add "category-descriptions", frameGrabberDescriptions

PRODUCT_META.Add "frame-grabber", productTypeFrameGrabber

' Add product type: software
Set productTypeSoftware = Server.CreateObject("Scripting.Dictionary")
productTypeSoftware.Add "title_en", "Software"
productTypeSoftware.Add "title_ko", "소프트웨어"
productTypeSoftware.Add "desc_ko", "Sapera processing / (Barcode,OCR등) / 및 AI 개발자키트 Astrocyte"
productTypeSoftware.Add "p_cate", "15"
' Add categories for software
PRODUCT_META.Add "software", productTypeSoftware

' Add product type: accessory
Set productTypeAccessory = Server.CreateObject("Scripting.Dictionary")
productTypeAccessory.Add "title_en", "Accessory"
productTypeAccessory.Add "title_ko", "주변기기"
<!-- productTypeAccessory.Add "desc_ko", "카메라 렌즈 기술을 선도하는 글로벌 광학 기술 Virex<br/>사진과 영상의 품질을 혁신적으로 향상시키는 첨단 렌즈 솔루션을 제공합니다." -->
productTypeAccessory.Add "p_cate", "17"
' Add categories for accessory
Set accessoryCategories = Server.CreateObject("Scripting.Dictionary")
accessoryCategories.Add "1711", "케이블"
accessoryCategories.Add "1712", "악세사리"
accessoryCategories.Add "1713", "기타"
productTypeAccessory.Add "sub-categories", accessoryCategories

' Add category descriptions for accessory
Set accessoryDescriptions = Server.CreateObject("Scripting.Dictionary")
accessoryDescriptions.Add "1711", "AOC, Camera Link / USB3.0 / GigE 고성능 데이터 케이블"
accessoryDescriptions.Add "1712", "Camera Link 및 / CoaxPress 리피터, Xtium2 / 프레임그래버용 외부 I/O 보드"
' 기타는 공란이므로 추가하지 않음
productTypeAccessory.Add "category-descriptions", accessoryDescriptions

PRODUCT_META.Add "accessory", productTypeAccessory

Function IIf(bClause, sTrue, sFalse)
    If CBool(bClause) Then
        IIf = sTrue
    Else 
        IIf = sFalse
    End If
End Function

Function GetProductTypeByPCate(pCateCode)
    Dim key, productType
    For Each key In PRODUCT_META.Keys
        Set productType = PRODUCT_META(key)
        If productType("p_cate") = Left(pCateCode, 2) Then
            GetProductTypeByPCate = key
            Exit Function
        End If
    Next
    GetProductTypeByPCate = Null ' Return Null if no match is found
End Function

%>


<link rel="stylesheet" href="<%=DIR_ROOT%>/css/global.css" />
<link rel="stylesheet" href="<%=DIR_ROOT%>/css/layout.css" />
<link rel="stylesheet" href="<%=DIR_ROOT%>/css/responsive.css" />
    <!-- jQuery 라이브러리 (전역) -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    
    <!-- reCAPTCHA 라이브러리 (전역) -->
    <script src="https://www.google.com/recaptcha/api.js?render=<%=GOOGLE_CAPTCHA_SITE_KEY%>"></script>
    
    <!-- 전역 변수 설정 -->
    <script>
        var DIR_ROOT = '<%=DIR_ROOT%>';
        const GOOGLE_CAPTCHA_SITE_KEY = '<%=GOOGLE_CAPTCHA_SITE_KEY%>';
    </script>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">