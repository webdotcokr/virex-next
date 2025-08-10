$(document).ready(function() {

    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        window.isMobile = true;
    }

    // 모바일 검색바 클릭 이벤트
    if(window.isMobile) {
        const searchBar = $('#search-bar');
        const searchIcon = $('#search-bar .search-icon');
        const closeIcon = $('#search-bar .close-icon');
        const searchInput = $('#search-bar input[type="search"]');
        
        // 검색 아이콘 클릭 시 검색바 확장
        searchIcon.on('click', function() {
            searchBar.addClass('expanded');
            setTimeout(function() {
                searchInput.focus();
            }, 300); // 애니메이션 후 포커스
        });
        
        // 닫기 아이콘 클릭 시 검색바 축소
        closeIcon.on('click', function(e) {
            e.stopPropagation(); // 이벤트 버블링 방지
            searchBar.removeClass('expanded');
            searchInput.blur();
        });
        
        // 검색바 외부 클릭 시 축소
        $(document).on('click', function(e) {
            if (!$(e.target).closest('#search-bar').length && searchBar.hasClass('expanded')) {
                searchBar.removeClass('expanded');
                searchInput.blur();
            }
        });
        
        // 검색바 내부 클릭 시 이벤트 버블링 방지
        searchBar.on('click', function(e) {
            e.stopPropagation();
        });
    }

    // 헤더 검색 기능 - 데스크톱
    $('#search-bar input[type="search"]').on('keypress', function(e) {
        if (e.which === 13) { // Enter 키
            e.preventDefault();
            const searchQuery = $(this).val().trim();
            if (searchQuery !== '') {
                window.location.href = DIR_ROOT + '/sub/search-result.asp?q=' + encodeURIComponent(searchQuery);
            }
        }
    });

    // 검색 아이콘 클릭 시 검색 실행
    $('#search-bar .search-icon').on('click', function() {
        const searchQuery = $('#search-bar input[type="search"]').val().trim();
        if (searchQuery !== '') {
            window.location.href = DIR_ROOT + '/sub/search-result.asp?q=' + encodeURIComponent(searchQuery);
        }
    });

    // 모바일 검색 기능
    $('#mobile-search-input').on('keypress', function(e) {
        if (e.which === 13) { // Enter 키
            e.preventDefault();
            const searchQuery = $(this).val().trim();
            if (searchQuery !== '') {
                window.location.href = DIR_ROOT + '/sub/search-result.asp?q=' + encodeURIComponent(searchQuery);
            }
        }
    });

    // 모바일 검색 아이콘 클릭 시 검색 실행
    $('.mobile-search-wrapper .search-icon').on('click', function() {
        const searchQuery = $('#mobile-search-input').val().trim();
        if (searchQuery !== '') {
            window.location.href = DIR_ROOT + '/sub/search-result.asp?q=' + encodeURIComponent(searchQuery);
        }
    });

    // Megamenu hover functionality
    let megamenuTimeout;
    
    // Calculate and store menu positions for alignment
    function calculateMenuPositions() {
        // Get horizontal menu position
        const horizontalMenuLeft = $('.horizontal-menu').offset().left;
        
        // Store the horizontal menu's left position as a CSS variable
        document.documentElement.style.setProperty('--horizontal-menu-left', horizontalMenuLeft + 'px');
    }
    
    // Call on page load
    calculateMenuPositions();
    
    // Recalculate on window resize
    $(window).on('resize', calculateMenuPositions);
    
    // Function to show megamenu with all submenus
    function showMegamenu(menuType) {
        clearTimeout(megamenuTimeout);
        
        // Mark the active menu item
        $('.horizontal-menu .top-menu-item').removeClass('active');
        $(`.horizontal-menu .top-menu-item[data-menu="${menuType}"]`).addClass('active');
        
        // Show the megamenu container (which triggers all submenus to show via CSS)
        $('#megamenu-container').addClass('active');
        
        // Alternative approach - add class to header
        $('header').addClass('megamenu-active');
    }
    
    // Function to hide megamenu with delay
    function hideMegamenu() {
        megamenuTimeout = setTimeout(function() {
            $('#megamenu-container').removeClass('active');
            $('header').removeClass('megamenu-active');
            $('.horizontal-menu .top-menu-item').removeClass('active');
        }, 300); // Delay to prevent accidental mouseout
    }
    
    // Mouse enter on menu items
    $('.horizontal-menu .top-menu-item').on('mouseenter', function() {
        const menuType = $(this).data('menu');
        showMegamenu(menuType);
    });
    
    // Mouse leave from menu items
    $('.horizontal-menu').on('mouseleave', function() {
        hideMegamenu();
    });
    
    // Mouse enter/leave for megamenu container
    $('#megamenu-container').on('mouseenter', function() {
        clearTimeout(megamenuTimeout);
    }).on('mouseleave', function() {
        hideMegamenu();
    });
    
    // Close megamenu when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.horizontal-menu').length && 
            !$(e.target).closest('#megamenu-container').length) {
            $('#megamenu-container').removeClass('active');
            $('header').removeClass('megamenu-active');
            $('.horizontal-menu .top-menu-item').removeClass('active');
        }
    });
    
    // Submenu column hover behavior
    $('.submenu-column').hover(
        function() {
            const menuType = $(this).closest('.top-menu-item').data('menu');
            $('.horizontal-menu .top-menu-item').removeClass('active');
            $(`.horizontal-menu .top-menu-item[data-menu="${menuType}"]`).addClass('active');
        },
        function() {
            // Handled by container mouseleave
        }
    );

    // Mobile megamenu initialization function
    function initMobileMenu() {
        // Add toggle elements to menu items if they don't exist
        $('.horizontal-menu .top-menu-item').each(function() {
            if ($(this).find('.menu-toggle').length === 0) {
                $(this).append('<span class="menu-toggle"></span>');
            }
        });
        
        // Create mobile menu toggle button if it doesn't exist
        if ($('.megamenu-toggle').length === 0) {
            $('header #top-menu').prepend(`
                <div class="megamenu-toggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `);
        }
    }

    // Function to remove mobile menu elements
    function cleanupMobileMenu() {
        // Only cleanup if we're above mobile breakpoint
        if (window.innerWidth > 992) {
            // Reset menu state
            $('.megamenu-toggle').removeClass('active');
            $('#megamenu-container').removeClass('active');
            $('body').removeClass('megamenu-open');
            
            // Remove cloned menu from megamenu container
            $('#megamenu-container .horizontal-menu').remove();
        }
    }

    // Handle mobile menu based on window size
    function handleMobileMenu() {
        if (window.innerWidth <= 992) {
            initMobileMenu();
        } else {
            cleanupMobileMenu();
        }
    }

    // Initialize on page load
    handleMobileMenu();

    // Handle window resize
    $(window).on('resize', throttle(function() {
        handleMobileMenu();
        
        // Remove any stray close buttons in the megamenu when not active
        if (!$('#megamenu-container').hasClass('active')) {
            $('#megamenu-container .mobile-menu-close').remove();
        }
    }, 250));

    // Mobile menu event handlers
    $(document).on('click', '.megamenu-toggle', function() {
        $(this).toggleClass('active');
        
        if ($(this).hasClass('active')) {
            // Only add the close button when the menu is being opened
            if ($('#megamenu-container .mobile-menu-close').length === 0) {
                $('#megamenu-container .megamenu-wrapper').prepend('<div class="mobile-menu-close"></div>');
            }
            
            // Move the horizontal menu into the megamenu container for mobile
            if ($('#megamenu-container .horizontal-menu').length === 0) {
                const clonedMenu = $('.horizontal-menu').clone(true);
                $('#megamenu-container .megamenu-wrapper').append(clonedMenu);
            }
            
            // Open megamenu after the content is ready
            $('#megamenu-container').addClass('active');
            $('body').addClass('megamenu-open');
        } else {
            // Close menu
            $('#megamenu-container').removeClass('active');
            $('body').removeClass('megamenu-open');
            
            // Remove the close button when the menu is closed
            setTimeout(function() {
                $('#megamenu-container .mobile-menu-close').remove();
            }, 300);
        }
    });
    
    // Close mobile menu when clicking the close button
    $(document).on('click', '.mobile-menu-close', function() {
        $('.megamenu-toggle').removeClass('active');
        $('#megamenu-container').removeClass('active');
        $('body').removeClass('megamenu-open');
        
        // Remove the close button after animation completes
        setTimeout(function() {
            $('#megamenu-container .mobile-menu-close').remove();
        }, 300);
    });
    
    // Toggle submenu in mobile view
    $(document).on('click', '#megamenu-container .top-menu-item .menu-toggle, #megamenu-container .top-menu-item > a', function(e) {
        if (window.innerWidth <= 992) {
            e.preventDefault();
            const menuItem = $(this).closest('.top-menu-item');
            
            // Toggle only the clicked menu item
            if (menuItem.hasClass('active')) {
                menuItem.removeClass('active');
            } else {
                $('#megamenu-container .top-menu-item').removeClass('active');
                menuItem.addClass('active');
            }
        }
    });
    
    // Mobile header scroll effect
    const applyMobileHeaderScrollEffect = function() {
        const scrollTop = $(window).scrollTop();
        const mobileHeader = $('.mobile-header');
        
        if (scrollTop > 50) {
            mobileHeader.addClass('scrolled');
            // 메뉴 아이콘은 filter 효과 없이 직접 교체
            $('.mobile-menu-icon').css('background-image', 'url("' + DIR_ROOT + '/img/icon-menu-black.svg")');
            // 검색 아이콘은 filter 효과 적용
            $('.mobile-search-icon').css('filter', 'none');
        } else {
            mobileHeader.removeClass('scrolled');
            // 메뉴 아이콘은 filter 효과 없이 직접 교체
            $('.mobile-menu-icon').css('background-image', 'url("' + DIR_ROOT + '/img/icon-menu.svg")');
            // 검색 아이콘은 filter 효과 적용
            $('.mobile-search-icon').css('filter', 'brightness(0) invert(1)');
        }
    };
    
    // 검색 토글 기능 수정
    $(document).on('click', '#mobile-search-toggle', function(e) {
        e.preventDefault(); // 기본 이벤트 방지
        
        // 현재 스크롤 위치 저장
        var currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        $('#mobile-search-container').addClass('active');
        $('#mobile-menu-overlay').addClass('active');
        
        // body에 fixed 스타일을 적용하기 전에 현재 스크롤 위치를 data 속성에 저장
        $('body').attr('data-scroll-position', currentScrollPosition);
        
        // body에 megamenu-open 클래스 추가 및 스타일 설정
        $('body').addClass('megamenu-open');
        $('body').css({
            'position': 'fixed',
            'width': '100%',
            'top': -currentScrollPosition + 'px'
        });
        
        setTimeout(function() {
            $('#mobile-search-input').focus();
        }, 300);
    });
    
    // 검색 닫기 버튼 클릭
    $(document).on('click', '#mobile-search-close, #mobile-menu-overlay', function(e) {
        if($('#mobile-search-container').hasClass('active')) {
            e.preventDefault(); // 기본 이벤트 방지
            
            $('#mobile-search-container').removeClass('active');
            $('#mobile-menu-overlay').removeClass('active');
            
            // 저장된 스크롤 위치 복원
            var scrollPosition = parseInt($('body').attr('data-scroll-position'), 10);
            
            // body에서 megamenu-open 클래스 제거 및 스타일 복원
            $('body').removeClass('megamenu-open');
            $('body').css({
                'position': '',
                'width': '',
                'top': ''
            });
            
            // 스크롤 위치 복원
            window.scrollTo(0, scrollPosition);
        }
    });
    
    // Mobile menu toggle
    $(document).on('click', '#mobile-menu-toggle', function(e) {
        e.preventDefault(); // 기본 이벤트 방지
        
        // 현재 스크롤 위치 저장
        var currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        $('#mobile-menu-container').addClass('active');
        $('#mobile-menu-overlay').addClass('active');
        
        // body에 fixed 스타일을 적용하기 전에 현재 스크롤 위치를 data 속성에 저장
        $('body').attr('data-scroll-position', currentScrollPosition);
        
        // body에 megamenu-open 클래스 추가 및 스타일 설정
        $('body').addClass('megamenu-open');
        $('body').css({
            'position': 'fixed',
            'width': '100%',
            'top': -currentScrollPosition + 'px'
        });
    });
    
    // Mobile menu close
    $(document).on('click', '#mobile-menu-close, #mobile-menu-overlay', function(e) {
        e.preventDefault(); // 기본 이벤트 방지
        
        $('#mobile-menu-container').removeClass('active');
        $('#mobile-menu-overlay').removeClass('active');
        
        // Clean up active states
        $('.mobile-menu-item').removeClass('active');
        $('.mobile-submenu-panel').removeClass('active');
        
        // 저장된 스크롤 위치 복원
        var scrollPosition = parseInt($('body').attr('data-scroll-position'), 10);
        
        // body에서 megamenu-open 클래스 제거 및 스타일 복원
        $('body').removeClass('megamenu-open');
        $('body').css({
            'position': '',
            'width': '',
            'top': ''
        });
        
        // 스크롤 위치 복원
        window.scrollTo(0, scrollPosition);
    });
    
    // Mobile menu item toggle - updated for split layout
    $(document).on('click', '.mobile-menu-item > a', function(e) {
        e.preventDefault();
        
        const menuItem = $(this).parent();
        const menuType = menuItem.data('menu');
        
        // Update active state for menu items
        $('.mobile-menu-item').removeClass('active');
        menuItem.addClass('active');
        
        // Show corresponding submenu panel
        $('.mobile-submenu-panel').removeClass('active');
        $(`.mobile-submenu-panel[data-submenu="${menuType}"]`).addClass('active');
    });
    
    // Set first menu item as active on menu open
    $(document).on('click', '#mobile-menu-toggle', function() {
        // After mobile menu container becomes visible
        setTimeout(function() {
            // Activate first menu item if none is active
            if ($('.mobile-menu-item.active').length === 0) {
                // 모바일 메뉴 열릴 때 첫 번째 항목 자동 선택
                const firstMenuItem = $('.mobile-menu-item:first-child');
                firstMenuItem.addClass('active');
                const firstMenuType = firstMenuItem.data('menu');
                $(`.mobile-submenu-panel[data-submenu="${firstMenuType}"]`).addClass('active');
            }
        }, 100); // Reduced timeout for faster response
    });
    
    // 터치 이벤트 처리 최적화
    if ('ontouchstart' in window) {
        // Add touch-specific styles
        $('body').addClass('touch-device');
        
        // Improve touch response time
        $('.mobile-menu-item > a, .mobile-submenu-item > a').on('touchstart', function() {
            $(this).addClass('touch-active');
        }).on('touchend touchcancel', function() {
            $(this).removeClass('touch-active');
        });
    }
    
    // Apply on page load
    applyMobileHeaderScrollEffect();
    
    // Remove any close buttons that might be showing on page load
    if (!$('#megamenu-container').hasClass('active')) {
        $('#megamenu-container .mobile-menu-close').remove();
    }
    
    // Add scroll event listener with throttling
    $(window).on('scroll', throttle(applyMobileHeaderScrollEffect, 100));
    
    // Also handle touch events for mobile
    if (window.isMobile) {
        $(window).on('touchmove', throttle(applyMobileHeaderScrollEffect, 100));
        $(window).on('touchend', throttle(applyMobileHeaderScrollEffect, 100));
    }
    
    // Close button click
    $(document).on('click', '.mobile-menu-close', function() {
        $('.megamenu-toggle').removeClass('active');
        $('#megamenu-container').removeClass('active');
        $('body').removeClass('megamenu-open');
    });
    
    // Toggle submenu on menu item click (mobile only)
    $(document).on('click', '.menu-toggle', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const menuItem = $(this).closest('.top-menu-item');
        
        // Toggle active class on the menu item
        if (menuItem.hasClass('active')) {
            menuItem.removeClass('active');
        } else {
            // Close any other open menu item
            $('.top-menu-item').removeClass('active');
            // Open this menu item
            menuItem.addClass('active');
        }
    });
    
    // Prevent menu item link from activating when trying to toggle submenu
    $(document).on('click', '.top-menu-item > a', function(e) {
        if (window.innerWidth <= 992 && $(this).siblings('.submenu-column').length > 0) {
            e.preventDefault();
            $(this).siblings('.menu-toggle').trigger('click');
        }
    });

    // Product item link
    $('button.product-item-link').on('click', function(e) {
        location.href = $(this).data("url");
        // console.log(e);
    });
    
    // Horizontal menu item hover functionality
    $('.horizontal-menu > .menu-item').hover(
        function() {
            $(this).addClass('active');
        },
        function() {
            // Re-fetch the dynamically updated data-active attribute
            const activeCate = $(this).closest('.horizontal-menu').attr('data-active');
            const itemCate = $(this).data('cate');

            // Keep active if data-active matches data-cate, otherwise remove active
            if (!activeCate || activeCate != itemCate) {
                $(this).removeClass('active');
            }
        }
    );

    /** Category */
    const $categoryList = $('.button-category-list[data-name="category"]');
    const $hiddenCategoryInput = $('input[name="category"]');

    if ($categoryList.length && $hiddenCategoryInput.length) {
        $categoryList.on('click', '.button-category-item', function () {
            console.log("click");

            // Remove 'selected' class from all items
            $categoryList.find('.button-category-item').removeClass('selected');

            // Add 'selected' class to the clicked item
            $(this).addClass('selected');

            // Update the hidden input's value
            $hiddenCategoryInput.val($(this).data('id'));
        });
    }

    /** List Type Switcher */
    const $listTypeIcons = $('.list-type-icons');

    // Create hidden input for list_type if it doesn't exist
    if ($listTypeIcons.length && !$('input[name="list_type"]').length) {
        // Add the hidden input right after the form starts
        $('form').prepend('<input type="hidden" name="list_type" value="thumb" />');
    }

    const $hiddenListTypeInput = $('input[name="list_type"]');

    if ($listTypeIcons.length && $hiddenListTypeInput.length) {
        $listTypeIcons.on('click', '[data-list-type]', function() {
            const listType = $(this).data('list-type');
            
            // Remove 'active' class from all items
            $listTypeIcons.find('[data-list-type]').removeClass('active');
            
            // Add 'active' class to the clicked item
            $(this).addClass('active');
            
            // Update the hidden input's value
            $hiddenListTypeInput.val(listType);
            
            // Optional: Trigger list view change immediately
            updateListView(listType);
        });
    }

    // Function to update the visual appearance of the list based on selected type
    function updateListView(listType) {
        const $container = $('.grid-container');

        if (listType === 'list') {
            $container.addClass('list-view').removeClass('thumb-view');
        } else {
            $container.addClass('thumb-view').removeClass('list-view');
        }
    }

    // Throttle function to improve scroll performance
    function throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function() {
            const context = this;
            const args = arguments;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }

    // Header scroll detection - 모든 페이지에 적용
    const applyHeaderScrollEffect = function() {
        const scrollTop = $(window).scrollTop();
        const header = $('header');
        
        if (scrollTop > 50) {
            header.addClass('scrolled');
        } else {
            header.removeClass('scrolled');
        }
    };
    
    // 초기 로드 시 현재 스크롤 위치에 따라 클래스 적용
    applyHeaderScrollEffect();
    
    // 스크롤 이벤트에 스로틀링 적용하여 등록
    $(window).on('scroll', throttle(applyHeaderScrollEffect, 100));
    
    // 모바일에서도 터치 이벤트 처리
    if (window.isMobile) {
        $(window).on('touchmove', throttle(applyHeaderScrollEffect, 100));
        $(window).on('touchend', throttle(applyHeaderScrollEffect, 100));
    }

    // Update scroll event with throttling for both scroll and touch events
    const handleScroll = throttle(function() {
        const scrollTop = $(window).scrollTop();
        const header = $('header');
        
        if (scrollTop > 0) {
            header.addClass('bg-white-header');
            
            // On mobile, adjust the header's position to make it sticky at the top
            if (window.isMobile) {
                header.css({
                    'position': 'sticky',
                    'top': '0',
                    'z-index': '1200'
                });
            }
        } else {
            header.removeClass('bg-white-header');
            
            // Reset the header's position on mobile when at the top
            if (window.isMobile) {
                header.css({
                    'position': '',
                    'top': '',
                    'z-index': ''
                });
            }
        }
    }, 100); // Adjust the limit (100ms) as needed

    // Apply on page load to handle page refreshes when already scrolled
    handleScroll();
    
    // Add scroll event listener
    $(window).on('scroll', handleScroll);
    
    // Also handle touch events for mobile
    if (window.isMobile) {
        $(window).on('touchmove', handleScroll);
        $(window).on('touchend', handleScroll);
    }

    // 기존 DOMContentLoaded 내부의 헤더 스크롤 코드 제거
    document.addEventListener('DOMContentLoaded', function() {
        // Mobile menu toggle - Removed btn-menu code since the element has been removed
        
        // Card hover/touch effects
        const cardItems = document.querySelectorAll('.company-content-card-item');
        if (cardItems.length > 0) {
            cardItems.forEach(function(item) {
                // Desktop hover
                item.addEventListener('mouseenter', function() {
                    this.querySelector('.base-content').style.display = 'none';
                    this.querySelector('.onhover-content').style.display = 'flex';
                });
                
                item.addEventListener('mouseleave', function() {
                    this.querySelector('.base-content').style.display = 'block';
                    this.querySelector('.onhover-content').style.display = 'none';
                });
                
                // Mobile touch
                if (window.innerWidth <= 768) {
                    item.addEventListener('click', function() {
                        const hoverContent = this.querySelector('.onhover-content');
                        const baseContent = this.querySelector('.base-content');
                        
                        if (hoverContent.style.display === 'none' || 
                            hoverContent.style.display === '') {
                            baseContent.style.display = 'none';
                            hoverContent.style.display = 'flex';
                        } else {
                            baseContent.style.display = 'block';
                            hoverContent.style.display = 'none';
                        }
                    });
                }
            });
        }
    });

    // Mobile search form submission
    $(document).on('keypress', '#mobile-search-input', function(e) {
        if (e.which === 13) { // Enter key
            e.preventDefault();
            const searchTerm = $(this).val().trim();
            if (searchTerm) {
                // Redirect to search results page with the search term
                window.location.href = DIR_ROOT + '/sub/search/search.asp?query=' + encodeURIComponent(searchTerm);
            }
        }
    });
    
    // Mobile search icon click (execute search)
    $(document).on('click', '.mobile-search-wrapper .search-icon', function() {
        const searchTerm = $('#mobile-search-input').val().trim();
        if (searchTerm) {
            // Redirect to search results page with the search term
            window.location.href = DIR_ROOT + '/sub/search/search.asp?query=' + encodeURIComponent(searchTerm);
        }
    });

    // Smooth scrolling for product category links - 성능 최적화
    $('#header-attached-menu a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        
        const target = $(this.hash);
        if (target.length) {
            // 활성 클래스 즉시 적용
            $('#header-attached-menu .menu-item').removeClass('active');
            $(this).parent().addClass('active');
            
            // 헤더 높이 계산
            const headerHeight = $('#header-attached-menu').outerHeight();
            const additionalOffset = 20;
            const offset = target.offset().top - headerHeight - additionalOffset;
            
            // 애니메이션 시간 단축 및 성능 개선
            $('html, body').animate({
                scrollTop: offset
            }, 300, 'swing'); // 시간 단축 및 easing 함수 변경
            
            // URL 해시 업데이트 (스크롤 없이)
            if(history.pushState) {
                history.pushState(null, null, this.hash);
            } else {
                location.hash = this.hash;
            }
        }
    });
    
    // 스크롤 이벤트 최적화 - 스로틀링 개선
    const scrollThrottle = throttle(function() {
        const scrollPosition = $(window).scrollTop();
        const headerHeight = $('#header-attached-menu').outerHeight();
        
        // 현재 활성화된 섹션 찾기
        let activeSection = null;
        
        // 각 섹션의 위치 확인
        $('.product-list-container').each(function() {
            const currentSection = $(this);
            const sectionTop = currentSection.offset().top - headerHeight - 50;
            const sectionBottom = sectionTop + currentSection.outerHeight();
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                activeSection = currentSection.attr('id');
                return false; // 해당 섹션을 찾으면 반복 중단
            }
        });
        
        // 활성 메뉴 업데이트
        if (activeSection) {
            $('#header-attached-menu .menu-item').removeClass('active');
            $(`#header-attached-menu a[href="#${activeSection}"]`).parent().addClass('active');
        }
    }, 100); // 100ms 간격으로 실행
    
    // 스크롤 이벤트에 최적화된 함수 연결
    $(window).on('scroll', scrollThrottle);

    // 페이지 로드 시 한 번 스크롤 위치 체크하여 메뉴 활성화
    $(document).ready(function() {
        // 페이지 로드 후 약간의 지연을 주고 실행 (레이아웃 안정화)
        setTimeout(function() {
            scrollThrottle();
        }, 200);
    });
    
    // 이미지 로드가 완료되면 스크롤 위치 다시 확인 (레이아웃 변경 가능성)
    $(window).on('load', function() {
        scrollThrottle();
    });
    
    // 모바일 특화 터치 이벤트 최적화
    if('ontouchstart' in window) {
        // 터치 움직임 종료 후 스크롤 위치 확인
        $(window).on('touchend', scrollThrottle);
    }
    
    // 스크롤 이벤트에 최적화된 함수 연결
    $(window).on('scroll', scrollThrottle);
});