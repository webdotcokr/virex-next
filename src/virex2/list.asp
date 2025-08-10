<!-- #include virtual="/inc/config.asp" -->
<!-- #include virtual="/inc/common.asp" -->

<!-- Define page variables -->
<%
Dim productType, productTypeTitleKo, productTypeTitleEn, productTypeDescKo, productSubCategory, productSubCategories
productType = Request.QueryString("type")
' Check if type parameter exists, set default to 'camera' if not
If productType = "" Then
    productType = "camera"
End If
productSubCategory = Request.QueryString("p_cate")
productTypeTitleKo = PRODUCT_META(productType)("title_ko")
productTypeTitleEn = PRODUCT_META(productType)("title_en")
productTypeDescKo = PRODUCT_META(productType)("desc_ko")

' Check if category-specific description exists
If productSubCategory <> "" And Not IsEmpty(PRODUCT_META(productType)("category-descriptions")) Then
    If PRODUCT_META(productType)("category-descriptions").Exists(productSubCategory) Then
        productTypeDescKo = PRODUCT_META(productType)("category-descriptions")(productSubCategory)
    End If
Else
    ' 하위 카테고리가 없는 경우 기본 desc_ko 사용 (이미 위에서 설정됨)
    ' productTypeDescKo = PRODUCT_META(productType)("desc_ko") - 이미 설정됨
End If

page_type = "product" 
page_category = "product"
page_category_name = "제품"
page_subcategory = productType
page_subcategory_name = productTypeTitleKo
page_title_en = productTypeTitleEn
page_title_ko = productTypeTitleKo

' 제품 카테고리와 제품군에 따른 배경 이미지 클래스 정의
Dim category, bgImage
category = Request.QueryString("category")
If category = "" Then
    category = PRODUCT_META(productType)("title_en")
End If

' 기본 배경 이미지 경로 (기본값)
bgImage = DIR_ROOT & "/img/backgrounds/virex-product-bg.jpg"

' 제품 타입과 카테고리에 따라 배경 이미지 경로 설정
If productType = "camera" Then
    ' 카메라 기본 배경
    bgImage = DIR_ROOT & "/img/backgrounds/virex-product-bg.jpg"
    
    ' 카메라 하위 카테고리
    If productSubCategory = "1012" Or LCase(category) = "cis" Then
        bgImage = DIR_ROOT & "/img/backgrounds/camera-cis-bg.png"
    ElseIf productSubCategory = "1015" Or LCase(category) = "tdi" Or LCase(category) = "tdi line" Then
        bgImage = DIR_ROOT & "/img/backgrounds/camera-tdi-bg.png"
    ElseIf productSubCategory = "1011" Or LCase(category) = "line" Then
        bgImage = DIR_ROOT & "/img/backgrounds/camera-line-bg.png"
    ElseIf productSubCategory = "1010" Or LCase(category) = "area" Then
        bgImage = DIR_ROOT & "/img/backgrounds/camera-area-bg.png"
    ElseIf productSubCategory = "1013" Or LCase(category) = "invisible" Then
        bgImage = DIR_ROOT & "/img/backgrounds/camera-invisible-bg.png"
    ElseIf productSubCategory = "1014" Or LCase(category) = "scientific" Then
        bgImage = DIR_ROOT & "/img/backgrounds/camera-scientific-bg.png"
    End If

ElseIf productType = "lens" Then
    ' 렌즈 기본 배경
    bgImage = DIR_ROOT & "/img/backgrounds/virex-product-bg.jpg"
    
    ' 렌즈 하위 카테고리
    If productSubCategory = "1112" Or LCase(category) = "large format" Then
        bgImage = DIR_ROOT & "/img/backgrounds/lens-large-format-bg.png"
    ElseIf productSubCategory = "1111" Or LCase(category) = "telecentric" Then
        bgImage = DIR_ROOT & "/img/backgrounds/lens-telecentric-bg.png"
    ElseIf productSubCategory = "1110" Or LCase(category) = "fa" Or LCase(category) = "fa lens" Then
        bgImage = DIR_ROOT & "/img/backgrounds/lens-fa-bg.png"
    End If

ElseIf productType = "3d-camera" Then
    ' 3D 카메라 기본 배경
    bgImage = DIR_ROOT & "/img/backgrounds/virex-product-bg.jpg"
    
    ' 3D 카메라 하위 카테고리
    If LCase(category) = "laser profiler" Then
        bgImage = DIR_ROOT & "/img/backgrounds/3d-camera-laser-profiler-bg.png"
    ElseIf LCase(category) = "stereo camera" Then
        bgImage = DIR_ROOT & "/img/backgrounds/3d-camera-stereo-camera-bg.png"
    End If

ElseIf productType = "af-module" Then
    ' 오토포커스모듈 기본 배경
    bgImage = DIR_ROOT & "/img/backgrounds/virex-product-bg.jpg"
    
    ' 오토포커스모듈 하위 카테고리
    If LCase(category) = "auto focus" Then
        bgImage = DIR_ROOT & "/img/backgrounds/af-module-auto-focus-bg.png"
    End If

ElseIf productType = "light" Then
    ' 조명 기본 배경
    bgImage = DIR_ROOT & "/img/backgrounds/light-light-source-bg.png"
    
    ' 조명 하위 카테고리 - 수정된 카테고리 정보 반영
    If productSubCategory = "1410" Or LCase(category) = "light" Then
        bgImage = DIR_ROOT & "/img/backgrounds/light-light-bg.png"
    ElseIf productSubCategory = "1411" Or LCase(category) = "light sources" Then
        bgImage = DIR_ROOT & "/img/backgrounds/light-source-bg.png"
    ElseIf productSubCategory = "1412" Or LCase(category) = "controller" Then
        bgImage = DIR_ROOT & "/img/backgrounds/light-controller-bg.png"
    End If

ElseIf productType = "frame-grabber" Then
    ' 프레임그래버 기본 배경
    bgImage = DIR_ROOT & "/img/backgrounds/frame-grabber-10gige-bg.png"
    
    ' 프레임그래버 하위 카테고리 - 수정된 카테고리 정보 반영
    If productSubCategory = "1211" Or LCase(category) = "gige랜카드" Then
        bgImage = DIR_ROOT & "/img/backgrounds/frame-grabber-gige-bg.png"
    ElseIf productSubCategory = "1212" Or LCase(category) = "usb카드" Then
        bgImage = DIR_ROOT & "/img/backgrounds/frame-grabber-usb-bg.png"
    ElseIf productSubCategory = "1210" Or LCase(category) = "프레임그래버" Then
        bgImage = DIR_ROOT & "/img/backgrounds/frame-grabber-10gige-bg.png"
    End If

ElseIf productType = "software" Then
    ' 소프트웨어 기본 배경
    bgImage = DIR_ROOT & "/img/backgrounds/software-bg.png"
    
    ' 소프트웨어 하위 카테고리 - 하위 카테고리 없음

ElseIf productType = "accessory" Then
    ' 주변기기 기본 배경
    bgImage = DIR_ROOT & "/img/backgrounds/accessory-cable-bg.png"
    
    ' 주변기기 하위 카테고리
    If productSubCategory = "1711" Or LCase(category) = "케이블" Then
        bgImage = DIR_ROOT & "/img/backgrounds/accessory-cable-bg.png"
    ElseIf productSubCategory = "1712" Or LCase(category) = "악세사리" Then
        bgImage = DIR_ROOT & "/img/backgrounds/accessory-items-bg.png"
    ElseIf productSubCategory = "1713" Or LCase(category) = "기타" Then
        bgImage = DIR_ROOT & "/img/backgrounds/accessory-etc-bg.png"
    End If
End If

Dim productTypeClass
productTypeClass = "product-" & productType
If category <> "" Then
    productTypeClass = productTypeClass & " product-" & productType & "-" & Replace(Replace(LCase(category), " ", "-"), ".", "-")
End If
%>

<!DOCTYPE html>
<html lang="ko">
<head>
    <!-- #include virtual="/inc/meta.asp" -->
    <link rel="stylesheet" href="<%=DIR_ROOT%>/css/layout.css" />
    <link rel="stylesheet" href="<%=DIR_ROOT%>/css/sub-product.css" />
    <script src="<%=DIR_ROOT%>/js/common.js"></script>
    <script src="<%=DIR_ROOT%>/js/product-category.js"></script>
    <script src="<%=DIR_ROOT%>/js/product-filter.js"></script>

<!-- 제품 리스트 페이지 특별 스타일 -->
<style>
  #page-content-container #page-content {
    align-items: start !important;
  }
  #page-content .page-title-ko {
    text-align: left !important;
    margin: 0.5rem 0;
  }
  
  /* 배경 이미지 전환 애니메이션 */
  #page-content-container {
    transition: background-image 0.2s ease-in-out;
    background-size: cover !important;
    background-position: center !important;
  }
</style>
</head>

<body data-type="product">
  <div id="root">

    <!-- Header -->
    <!-- #include file="../../inc/header.asp" -->
    
    <!-- 페이지 컨텐츠 직접 구성 (page-content.asp 대체) -->
    <div id="page-content-container" class="<%=page_type%>-header-background <%=productTypeClass%>" style="background-image: url('<%=bgImage%>'); background-size: cover; background-position: center;">
        <div id="page-content">
            <div id="breadcrumb">
                <span><a href="<%=DIR_ROOT%>/">Home</a></span>
                <span class="arrow"><img src="<%=DIR_ROOT%>/img/icon-breadcrumb-arrow.svg" /></span>
                <span><a href="<%=DIR_ROOT%>/sub/<%=page_category%>/"><%=page_category_name%></a></span>
                <span class="arrow"><img src="<%=DIR_ROOT%>/img/icon-breadcrumb-arrow.svg" /></span>
                <span class="active"><%=page_subcategory_name%></span>
            </div>
            <div class="left-aligned">
                <div class="page-title-en"><%=page_title_en%></div>
                <div class="page-title-ko"><h1><%=page_title_ko%></h1></div>
                <div class="page-description">
                    <%=productTypeDescKo%>
                </div>
            </div>
        </div>
    </div>

<%
If Not IsEmpty(PRODUCT_META(productType)("sub-categories")) Then
%>
    <div id="header-attached-menu" data-theme="white">
      <div class="menu-container">
        <div class="horizontal-menu">
<%
Dim arrKey, arrItem
arrKey  = PRODUCT_META(productType)("sub-categories").Keys
arrItem = PRODUCT_META(productType)("sub-categories").Items
For i = 0 To PRODUCT_META(productType)("sub-categories").Count-1
    Dim isActive
    isActive = ""
    If arrKey(i) = productSubCategory Then
        isActive = " active"
    End If
%>
            <div 
              class="menu-item<%=isActive%>"
              data-cate="<%=arrkey(i)%>">
              <a href="./list.asp?type=<%=productType%>&p_cate=<%=arrKey(i)%>&category=<%=arrItem(i)%>"><%=arrItem(i)%></a>
            </div>
<%
Next
%>
        </div>
      </div>
    </div>
<%
End If
%>

    <div class="container">
      
      <!-- 모바일 필터 토글 버튼 추가 -->
      <div class="mobile-filter-toggle">
        <span>필터</span>
        <img src="<%=DIR_ROOT%>/img/icon-filter.svg" alt="필터" />
      </div>
      
      <!-- 필터 오버레이 추가 -->
      <div class="filter-overlay"></div>
      
      <!-- #include virtual="/inc/product-filter-sidebar.asp" -->
      
      <!-- 모바일 필터 닫기 버튼과 액션 버튼 추가 -->
      <div class="mobile-filter-close"></div>
      <div class="filter-actions">
        <div class="filter-action-btn reset">초기화</div>
        <div class="filter-action-btn apply">적용</div>
      </div>

      <div id="main-contents">

        <div id="product-list-sort-bar">
          <div class="sort-bar-item">
            <input type="hidden" name="expand_filter" value="all" id="expand_filter_all" checked />
          </div>
          <div class="sort-bar-item right-aligned">
            <select name="display_count">
              <option value="10">10개씩 보기</option>
              <option value="20" selected>20개씩 보기</option>
              <option value="40">40개씩 보기</option>
            </select>
          </div>
          <div class="search-bar sort-bar-item">
            <input id="search-input" type="text" placeholder="Model, 파트넘버, 키워드로 검색하세요." />
            <span class="search-icon" id="search-button"></span>
          </div>
        </div>

        <div id="product-list-wrapper">
          <!-- 상단 스크롤바를 위한 더미 요소 -->
          <div id="top-scrollbar-wrapper">
            <div id="top-scrollbar-content"></div>
          </div>
          <!-- 테이블 컨테이너 -->
          <div id="product-list-container">
            <table id="product-list">
              <thead>
                <tr>
                  <th>비교</th>
                  <th>Model <img src="<%=DIR_ROOT%>/img/icon-sort.svg" /></th>
                  <th>Number of Pixel <img src="<%=DIR_ROOT%>/img/icon-sort.svg" /></th>
                  <th>Number of Lines <img src="<%=DIR_ROOT%>/img/icon-sort.svg" /></th>
                  <th>Frame Rate <img src="<%=DIR_ROOT%>/img/icon-sort.svg" /></th>
                  <!-- <th>Download</th> -->
                </tr>
              </thead>
              <tbody>   
              </tbody>
            </table>
          </div>
        </div>

        <!-- #include virtual="/inc/pagination.asp" -->

      </div>
    </div>

    <!-- Move product-action-buttons outside of the main-contents -->
    <div class="product-action-buttons">
    <button class="btn-product-action" id="btn-float-product-question">
        <img src="<%=DIR_ROOT%>/img/btn-question.png" alt="제품문의" />
        </button>
      <button class="btn-product-action" id="btn-float-compare-product">
        <img src="<%=DIR_ROOT%>/img/btn-compare-product.png" alt="제품비교" />
      </button>
      <!-- <a href="https://43.203.243.152/"><button class="btn-product-action" id="btn-float-knowledge-product">
        <img src="<%=DIR_ROOT%>/img/btn-knowledge.png" alt="기술지식" />
      </button>
        </a> -->
    </div>

    <!-- #include virtual="/inc/footer.asp" -->

  </div>

  <!-- include virtual="/inc/quick-menu.asp" -->

  <script>
  // CIS 카테고리에서 정렬 파라미터 확인 및 추가
  window.addEventListener('load', function() {
      var urlParams = new URLSearchParams(window.location.search);
      var pCate = urlParams.get('p_cate');
      var sortBy = urlParams.get('sortBy');
      
      // CIS 카테고리인데 정렬 파라미터가 없는 경우 - 즉시 리다이렉트
      if (pCate === '1012' && !sortBy) {
          // 기존 파라미터 유지하면서 정렬 파라미터 추가
          urlParams.set('sortBy', 'p_item_text4');
          urlParams.set('sortDir', 'DESC');
          
          var newUrl = window.location.pathname + '?' + urlParams.toString();
          
          // 페이지 리로드로 확실하게 적용
          window.location.href = newUrl;
          return;
      }
  });
  
  // 페이지 로드 및 초기화 기능 확장
  document.addEventListener('DOMContentLoaded', function() {
      // 모바일 필터 기능 초기화
      initMobileFilter();
      
      // 전역 클릭 이벤트 핸들러로 처리 (document level)
      document.addEventListener('click', function(e) {
          // header-attached-menu 내의 링크인지 확인
          var menuLink = e.target.closest('#header-attached-menu .menu-item a');
          if (!menuLink) return;
          
          var href = menuLink.getAttribute('href');
          if (!href || !href.includes('list.asp')) return;
          
          // 로딩 중인지 확인
          var isLoading = document.querySelector('.loading-overlay') || 
                         document.querySelector('.loading-spinner') ||
                         document.body.classList.contains('loading') ||
                         (window.productFilter && window.productFilter.isLoading);
          
          // CIS 카테고리 확인
          var isCIS = href.includes('p_cate=1012') || href.includes('category=CIS');
          
          if (isCIS) {
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              
              // 로딩 중이면 잠시 대기 후 실행
              if (isLoading) {
                  setTimeout(function() {
                      window.location.href = '<%=DIR_ROOT%>/sub/product/list.asp?type=camera&p_cate=1012&category=CIS&page=1&pageSize=20&sortBy=p_item_text4&sortDir=DESC';
                  }, 100);
              } else {
                  window.location.href = '<%=DIR_ROOT%>/sub/product/list.asp?type=camera&p_cate=1012&category=CIS&page=1&pageSize=20&sortBy=p_item_text4&sortDir=DESC';
              }
              return false;
          }
          
          // 다른 카테고리들은 기존 방식대로
          e.preventDefault();
          var url = new URL(window.location.origin + window.location.pathname + href);
          history.pushState({}, document.title, url);
          updateBackgroundByUrl();
          return false;
          
      }, true); // capture phase에서 처리 (최우선)
      
      // URL 변경 감지 설정
      setupUrlChangeDetection();
      
      // 페이지 로드 시 URL에서 카테고리 확인하고 배경 이미지 업데이트
      updateBackgroundByUrl();
      
      // URL 변경 감지 (브라우저 히스토리 변경 시)
      window.addEventListener('popstate', function() {
          updateBackgroundByUrl();
      });
      
      // Ajax 데이터 로드를 감지하기 위한 MutationObserver 설정
      setupContentChangeDetection();
  });

  // 컨텐츠 변경 감지 (Ajax 로드 등)
  function setupContentChangeDetection() {
      // 제품 리스트 컨테이너 관찰
      var productListContainer = document.getElementById('product-list-container');
      if (productListContainer) {
          var observer = new MutationObserver(function(mutations) {
              // 컨텐츠가 변경되면 배경 업데이트 확인
              setTimeout(updateBackgroundByUrl, 100); // 약간의 지연으로 DOM 업데이트 완료 보장
              // 상단 스크롤바 너비도 업데이트
              if (window.updateTopScrollbarWidth) {
                  setTimeout(window.updateTopScrollbarWidth, 150);
              }
          });
          
          observer.observe(productListContainer, { 
              childList: true, 
              subtree: true,
              characterData: true
          });
      }
      
      // 페이지네이션 변경 감지
      var paginationContainer = document.querySelector('.pagination');
      if (paginationContainer) {
          var paginationObserver = new MutationObserver(function(mutations) {
              // 페이지 번호 변경시 배경 업데이트 확인
              setTimeout(updateBackgroundByUrl, 100);
          });
          
          paginationObserver.observe(paginationContainer, {
              childList: true,
              subtree: true
          });
      }
  }

  // URL 해시 변경 감지 (SPA에서 #hash 사용 시)
  window.addEventListener('hashchange', function() {
      setTimeout(updateBackgroundByUrl, 100);
  });

  // 모든 클릭 이벤트에 대한 일반적인 처리 (필요 시)
  document.addEventListener('click', function(e) {
      // 특정 클래스나 속성을 가진 요소 클릭 시 URL 변경 없이 컨텐츠만 변경되는 경우 처리
      var targetElement = e.target.closest('[data-category-link]');
      if (targetElement) {
          setTimeout(updateBackgroundByUrl, 300); // 컨텐츠 변경 후 배경 업데이트
      }
  });

  // 모바일 필터 기능 초기화
  function initMobileFilter() {
      // 필터 토글 버튼
      const filterToggle = document.querySelector('.mobile-filter-toggle');
      const filterOverlay = document.querySelector('.filter-overlay');
      const filterClose = document.querySelector('.mobile-filter-close');
      const filterProducts = document.getElementById('filter-products');
      const filterReset = document.querySelector('.filter-action-btn.reset');
      const filterApply = document.querySelector('.filter-action-btn.apply');
      
      // 상단 스크롤바 초기화
      initTopScrollbar();
      
      // 화면 크기에 따라 필터 UI 상태 조정
      function adjustFilterUI() {
          if (window.innerWidth <= 768) {
              // 모바일에서 필터 닫기 버튼과 액션 버튼 표시
              filterClose.style.display = 'block';
              document.querySelector('.filter-actions').style.display = 'flex';
              filterToggle.style.display = 'flex';
          } else {
              // 데스크톱에서 필터 닫기 버튼과 액션 버튼 숨기기
              filterClose.style.display = 'none';
              document.querySelector('.filter-actions').style.display = 'none';
              filterToggle.style.display = 'none';
              
              // 데스크톱에서는 필터 항상 표시
              filterProducts.classList.remove('active');
              filterOverlay.classList.remove('active');
              document.body.style.overflow = '';
          }
      }
      
      // 초기 상태 설정
      adjustFilterUI();
      
      // 화면 크기 변경 시 조정
      window.addEventListener('resize', adjustFilterUI);
      
      // 필터 토글 버튼 클릭 이벤트
      if (filterToggle) {
          filterToggle.addEventListener('click', function() {
              filterProducts.classList.add('active');
              filterOverlay.classList.add('active');
              document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
          });
      }
      
      // 필터 오버레이 클릭 이벤트 (필터 닫기)
      if (filterOverlay) {
          filterOverlay.addEventListener('click', function() {
              filterProducts.classList.remove('active');
              filterOverlay.classList.remove('active');
              document.body.style.overflow = '';
          });
      }
      
      // 필터 닫기 버튼 클릭 이벤트
      if (filterClose) {
          filterClose.addEventListener('click', function() {
              filterProducts.classList.remove('active');
              filterOverlay.classList.remove('active');
              document.body.style.overflow = '';
          });
      }
      
      // 필터 초기화 버튼 클릭 이벤트
      if (filterReset) {
          filterReset.addEventListener('click', function() {
              // 모든 필터 체크박스 해제
              const checkboxes = filterProducts.querySelectorAll('input[type="checkbox"]');
              checkboxes.forEach(function(checkbox) {
                  checkbox.checked = false;
              });
              
              // 모든 슬라이더 초기화
              const sliders = filterProducts.querySelectorAll('.filter-slider');
              if (sliders.length && window.productFilter) {
                  window.productFilter.resetSliders();
              }
          });
      }
      
      // 필터 적용 버튼 클릭 이벤트
      if (filterApply) {
          filterApply.addEventListener('click', function() {
              // 필터 적용 후 필터 UI 숨기기
              filterProducts.classList.remove('active');
              filterOverlay.classList.remove('active');
              document.body.style.overflow = '';
              
              // 필터 적용 - 제품 필터 적용 함수 호출
              if (window.productFilter) {
                  window.productFilter.applyFilter();
              }
          });
      }
      
      // 터치 이벤트 최적화
      if ('ontouchstart' in window) {
          // 스와이프로 필터 닫기 기능 추가
          let touchStartX = 0;
          let touchMoveX = 0;
          
          filterProducts.addEventListener('touchstart', function(e) {
              touchStartX = e.touches[0].clientX;
          }, {passive: true});
          
          filterProducts.addEventListener('touchmove', function(e) {
              touchMoveX = e.touches[0].clientX;
              
              // 왼쪽으로 스와이프하면 필터 닫기
              if (touchStartX - touchMoveX > 50) {
                  filterProducts.classList.remove('active');
                  filterOverlay.classList.remove('active');
                  document.body.style.overflow = '';
              }
          }, {passive: true});
      }
      
      // 모바일 환경에서 테이블 터치 스크롤 최적화
      const productListContainer = document.getElementById('product-list-container');
      
      if (productListContainer && 'ontouchstart' in window) {
          // 터치 이벤트 최적화
          productListContainer.addEventListener('touchstart', function() {
              // 터치 시작 이벤트 최적화
          }, {passive: true});
          
          // 스크롤 시 최적화
          productListContainer.addEventListener('scroll', function() {
              // 스크롤 이벤트 최적화
          }, {passive: true});
      }
      
      // 검색 입력 시 자동 완성 및 즉시 검색 기능
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
          let searchTimeout;
          
          searchInput.addEventListener('input', function() {
              clearTimeout(searchTimeout);
              
              // 입력 후 300ms 지연으로 연속 검색 방지
              searchTimeout = setTimeout(function() {
                  const searchTerm = searchInput.value.trim();
                  
                  // 검색어가 있을 경우만 검색 실행
                  if (searchTerm.length >= 2) {
                      if (window.productFilter) {
                          window.productFilter.search(searchTerm);
                      }
                  }
              }, 300);
          });
      }
  }

  // 상단 스크롤바 초기화 함수
  function initTopScrollbar() {
      const topScrollbarWrapper = document.getElementById('top-scrollbar-wrapper');
      const topScrollbarContent = document.getElementById('top-scrollbar-content');
      const productList = document.getElementById('product-list');
      const productListContainer = document.getElementById('product-list-container');
      
      if (!topScrollbarWrapper || !topScrollbarContent || !productList || !productListContainer) {
          return;
      }

      // 상단 스크롤바 콘텐츠 너비를 테이블 너비와 동일하게 설정
      function updateTopScrollbarWidth() {
          const tableWidth = productList.scrollWidth;
          topScrollbarContent.style.width = tableWidth + 'px';
      }

      // 스크롤 동기화
      let isTopScrolling = false;
      let isBottomScrolling = false;

      // 상단 스크롤바 스크롤 이벤트
      topScrollbarWrapper.addEventListener('scroll', function() {
          if (!isBottomScrolling) {
              isTopScrolling = true;
              productListContainer.scrollLeft = topScrollbarWrapper.scrollLeft;
              setTimeout(() => { isTopScrolling = false; }, 50);
          }
      });

      // 하단(테이블) 스크롤바 스크롤 이벤트
      productListContainer.addEventListener('scroll', function() {
          if (!isTopScrolling) {
              isBottomScrolling = true;
              topScrollbarWrapper.scrollLeft = productListContainer.scrollLeft;
              setTimeout(() => { isBottomScrolling = false; }, 50);
          }
      });

      // 초기 너비 설정
      updateTopScrollbarWidth();
      
      // 리사이즈 이벤트에서 너비 재계산
      window.addEventListener('resize', updateTopScrollbarWidth);
      
      // MutationObserver로 테이블 내용 변경 감지
      const observer = new MutationObserver(function(mutations) {
          setTimeout(updateTopScrollbarWidth, 100);
      });
      
      observer.observe(productList, { 
          childList: true, 
          subtree: true,
          attributes: true,
          attributeFilter: ['style']
      });

      // 전역 함수로 노출 (필요 시 외부에서 호출)
      window.updateTopScrollbarWidth = updateTopScrollbarWidth;
  }

  // URL 기반으로 배경 이미지 업데이트 함수
  function updateBackgroundByUrl() {
      var currentUrl = window.location.href;
      var pageContentContainer = document.getElementById('page-content-container');
      
      if(!pageContentContainer) return;
      
      // URL에서 파라미터 추출
      var urlParams = new URLSearchParams(window.location.search);
      var productType = urlParams.get('type') || 'camera';
      var category = urlParams.get('category') || '';
      var pCate = urlParams.get('p_cate') || '';
      
      // 디코딩 처리 (URL 인코딩된 값 처리)
      if (category) {
          category = decodeURIComponent(category);
      }
      
      // 로그 출력 (디버깅용)
      console.log('현재 URL 파라미터:', {productType, category, pCate});
      
      // 기본 배경 이미지 경로
      var bgImage = '<%=DIR_ROOT%>/img/backgrounds/virex-product-bg.jpg';
      
      // 제품 타입과 카테고리에 따라 배경 이미지 경로 결정
      if(productType === 'camera') {
          if(pCate === '1012' || category.toLowerCase() === 'cis') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/camera-cis-bg.png';
          } else if(pCate === '101110' || category.toLowerCase() === 'tdi' || category.toLowerCase() === 'tdi line') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/camera-tdi-bg.png';
          } else if(pCate === '101111' || category.toLowerCase() === 'line') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/camera-line-bg.png';
          } else if(pCate === '1010' || category.toLowerCase() === 'area') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/camera-area-bg.png';
          } else if(pCate === '1013' || category.toLowerCase() === 'invisible') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/camera-invisible-bg.png';
          } else if(pCate === '1014' || category.toLowerCase() === 'scientific') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/camera-scientific-bg.png';
          }
      } else if(productType === 'lens') {
          if(pCate === '1112' || category.toLowerCase() === 'large format') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/lens-large-format-bg.png';
          } else if(pCate === '1113' || category.toLowerCase() === 'telecentric') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/lens-telecentric-bg.png';
          } else if(pCate === '1114' || category.toLowerCase() === 'fa' || category.toLowerCase() === 'fa lens') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/lens-fa-bg.png';
          }
      } else if(productType === '3d-camera') {
          bgImage = '<%=DIR_ROOT%>/img/backgrounds/virex-product-bg.jpg';
          if(pCate === '1310' || category.toLowerCase() === '3d laser profiler' || category.toLowerCase() === 'laser profiler') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/3d-camera-laser-profiler-bg.png';
          } else if(pCate === '1311' || category.toLowerCase() === '3d stereo camera' || category.toLowerCase() === 'stereo camera') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/3d-camera-stereo-camera-bg.png';
          }
      } else if(productType === 'af-module') {
          bgImage = '<%=DIR_ROOT%>/img/backgrounds/af-module-auto-focus-bg.png';
          if(category.toLowerCase() === 'auto focus') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/af-module-auto-focus-bg.png';
          }
      } else if(productType === 'light') {
          bgImage = '<%=DIR_ROOT%>/img/backgrounds/light-light-bg.png';
          if(category.toLowerCase() === 'light') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/light-light-bg.png';
          } else if(category.toLowerCase() === 'light source') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/light-source-bg.png';
          } else if(category.toLowerCase() === 'controller') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/light-controller-bg.png';
          }
      } else if(productType === 'frame-grabber') {
          // p_item_text5 파라미터로 interface 구분
          var itemText5 = urlParams.get('p_item_text5') || '';
          
          if(pCate === '1210' || category.toLowerCase() === '프레임그래버') {
              // interface 필터링에 따른 배경 이미지
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/frame-grabber-10gige-bg.png'; // 기본값
              if(itemText5.toLowerCase() === '10gige') {
                  bgImage = '<%=DIR_ROOT%>/img/backgrounds/frame-grabber-10gige-bg.png';
              } else if(itemText5.toLowerCase() === 'coaxpress') {
                  bgImage = '<%=DIR_ROOT%>/img/backgrounds/frame-grabber-coaxpress-bg.png';
              } else if(itemText5.toLowerCase() === 'camera link hs') {
                  bgImage = '<%=DIR_ROOT%>/img/backgrounds/frame-grabber-camera-link-hs-bg.png';
              } else if(itemText5.toLowerCase() === 'camera link') {
                  bgImage = '<%=DIR_ROOT%>/img/backgrounds/frame-grabber-camera-link-bg.png';
              }
          } else if(pCate === '1211' || category.toLowerCase() === '기가랜카드' || category.toLowerCase() === 'gige랜카드') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/frame-grabber-gige-card-bg.png';
          } else if(pCate === '1212' || category.toLowerCase() === 'usb카드') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/frame-grabber-usb-card-bg.png';
          } else {
              // 메인 Frame Grabber 카테고리 (12)인 경우 기본 이미지
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/frame-grabber-10gige-bg.png';
          }
      } else if(productType === 'software') {
          bgImage = '<%=DIR_ROOT%>/img/backgrounds/software-bg.png';
      } else if(productType === 'accessory') {
          bgImage = '<%=DIR_ROOT%>/img/backgrounds/accessory-cable-bg.png';
          if(category.toLowerCase() === '랜카드' || category.toLowerCase() === 'lan card') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/accessory-lan-card-bg.png';
          } else if(category.toLowerCase() === '케이블' || category.toLowerCase() === 'cable') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/accessory-cable-bg.png';
          } else if(category.toLowerCase() === '악세사리' || category.toLowerCase() === 'accessory') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/accessory-items-bg.png';
          } else if(category.toLowerCase() === '기타' || category.toLowerCase() === 'etc') {
              bgImage = '<%=DIR_ROOT%>/img/backgrounds/virex-product-bg.jpg';
          }
      }
      
      // 배경 이미지 업데이트
      console.log('배경 이미지 변경:', bgImage);
      pageContentContainer.style.backgroundImage = 'url("' + bgImage + '")';
      
      // 메뉴 항목 활성화 업데이트
      var menuItems = document.querySelectorAll('#header-attached-menu .menu-item');
      menuItems.forEach(function(item) {
          item.classList.remove('active');
          if(item.dataset.cate === pCate) {
              item.classList.add('active');
          }
      });
      
      // 타이틀 및 콘텐츠 업데이트 (옵션)
      updatePageContent(productType, category, pCate);
  }

  // 카테고리별 설명 데이터
  var categoryDescriptions = {
      camera: {
          '1012': '센서,렌즈,조명 일체형 / 300~3600DPI / Contact Image Sensor',
          '1015': '최대 32K해상도 지원 / 16K 해상도 1MHz Line rate / 초고속 고감도 TDI 카메라',
          '1011': '8K, 16K 해상도에서 최대 300KHz / HDR 및 다중 스펙트럼 / Multi Line Scan 카메라',
          '1010': '0.3MP 컴팩트 사이즈 카메라부터 / 152MP 초고해상도 / Area Scan 카메라',
          '1013': 'Pixel Operability 99% / 고감도 2K / SWIR Line Scan Camera',
          '1014': '96%의 QE / 서브전자 0.7e- 노이즈 / back-illuminated sCMOS Camera'
      },
      lens: {
          '1112': '0.04x~6.2x 배율 / Apochromatic 보정 / Image Circle 82mm 이상 라인스캔 렌즈',
          '1111': '2/3" ~ Dia 44mm Image Circle / 0.12x ~ 6.0x 배율 / Telecentric Lens',
          '1110': '1/1.7" ~ 1.1" 24MP / (2.74um 픽셀사이즈 지원) 대응 / Fixed Focal Length 렌즈'
      },
      '3d-camera': {
          '1310': '레이저 광삼각법 방식으로 / 정밀한 높이 측정 / 3D 레이저 프로파일러',
          '1311': 'Sony 3MP 센서 탑재로 / 높은 깊이 정확도 / 5GigE 3D 스테레오 카메라'
      },
      light: {
          '1410': '고속이미징처리에 적합한 / 고휘도 하이브리드 스팟 조명',
          '1411': '최대 2CH 제어 / 150W 라이트소스',
          '1412': '최대 200A에서 0.5us 이하 / 초고속 펄스 생성 / 스트로브 컨트롤러'
      },
      'frame-grabber': {
          '1210': '실시간 패킷해제 엔진으로 / CPU부하량을 최소화 하는 Xtium2 / 프레임그래버 시리즈',
          '1211': '머신비전 산업용 NIC 보드 / (1G, 2.5G, 5G, 10G 지원)',
          '1212': '머신비전 산업용 USB 카드 / (USB Interface)'
      },
      accessory: {
          '1711': 'AOC, Camera Link / USB3.0 / GigE 고성능 데이터 케이블',
          '1712': 'Camera Link 및 / CoaxPress 리피터, Xtium2 / 프레임그래버용 외부 I/O 보드'
          // '1713': 기타는 공란이므로 추가하지 않음
      }
  };

  // 페이지 컨텐츠 업데이트 (타이틀, 설명 등)
  function updatePageContent(productType, category, pCate) {
      // 카테고리별 설명 업데이트
      var descElement = document.querySelector('.page-description');
      if (descElement && categoryDescriptions[productType] && categoryDescriptions[productType][pCate]) {
          descElement.innerHTML = categoryDescriptions[productType][pCate];
      }
  }

  // 페이지 내 파라미터 변경 감지
  function setupUrlChangeDetection() {
      // 페이지가 SPA 방식으로 작동하는 경우를 위한 로직
      // 현재 구현에서는 전체 페이지 이동이므로 필요 없을 수 있음
      
      // history 변경 감지
      var oldPushState = history.pushState;
      history.pushState = function(state, title, url) {
          oldPushState.call(history, state, title, url);
          updateBackgroundByUrl();
      };
      
      var oldReplaceState = history.replaceState;
      history.replaceState = function(state, title, url) {
          oldReplaceState.call(history, state, title, url);
          updateBackgroundByUrl();
      };
  }
  </script>

</body>
</html>