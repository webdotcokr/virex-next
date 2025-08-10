class ProductFilter {

    constructor(categories) {

        this.categories = categories;

        this.defaultParams = {

            type: "camera",

            p_cate: "1012",

            category: "CIS",

            page: 1,

            pageSize: 20,

            search: ""

        };

        this.currentSortField = '';

        this.currentSortDir = 'ASC';

        this.tableId = 'product-list';

        this.selectedProducts = []; // Array to store selected products for comparison

        this.maxCompareProducts = 6; // Maximum number of products that can be compared

        this.initEventHandlers();

    }



    decodeUrlParam(param) {

        try {

            return decodeURIComponent(param.replace(/\+/g, ' '));

        } catch (e) {

            console.error('Error decoding parameter:', param, e);

            return param;

        }

    }



    getUrlParams() {

        const params = {};

        const queryString = window.location.search.substring(1);

        const pairs = queryString.split('&');



        // Parse the URL parameters with proper handling of comma-separated values

        for (let i = 0; i < pairs.length; i++) {

            if (!pairs[i]) continue;



            const pair = pairs[i].split('=');

            const key = decodeURIComponent(pair[0]);



            // If the value contains a comma, it's multiple values

            if (pair[1] && pair[1].includes(',')) {

                params[key] = this.decodeUrlParam(pair[1]);

            } else {

                params[key] = pair[1] ? this.decodeUrlParam(pair[1]) : '';

            }

        }



        // Apply defaults for essential parameters if not present

        params.type = params.type || this.defaultParams.type;

        params.p_cate = params.p_cate || this.defaultParams.p_cate;

        params.category = params.category || this.defaultParams.category;

        params.page = parseInt(params.page) || this.defaultParams.page;

        params.pageSize = parseInt(params.pageSize) || this.defaultParams.pageSize;

        params.search = params.search !== undefined ? params.search : this.defaultParams.search;



        return params;

    }



    // Method to update URL with current filter parameters

    updateUrlWithParams(params) {

        const urlParams = new URLSearchParams();



        // Add all non-empty parameters to URL

        for (const key in params) {

            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {

                urlParams.set(key, params[key]);

            }

        }



        // Update browser URL without reloading the page

        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;

        window.history.pushState({ path: newUrl }, '', newUrl);

    }



    // Get product type metadata from URL params

    getProductTypeInfo() {

        const params = this.getUrlParams();

        const productType = params.type || this.defaultParams.type;

        return this.categories[productType] || null;

    }



    // Get category name from p_cate code

    getCategoryNameFromCode(productType, p_cate) {

        const typeInfo = this.categories[productType];

        if (!typeInfo || !typeInfo.subCategories) return null;



        return typeInfo.subCategories[p_cate] || null;

    }



    showLoadingIndicator() {

        // Force redraw by detaching and reattaching tbody

        const table = $(`#${this.tableId}`);

        const totalColumns = table.find('thead th').length || 7; // Get actual column count or fallback to 7



        table.find('tbody').remove();

        table.append($('<tbody>').html(`

            <tr>

                <td colspan="${totalColumns}" class="loading-cell">

                    <div class="loading-container">

                    <div class="loading-spinner"></div>

                    <div class="loading-message">데이터를 불러오는 중입니다...</div>

                    </div>

                </td>

            </tr>

        `));

    }



    // Method to get all applicable filters for the current category and subcategory

    getFiltersForCurrentCategory() {

        const params = this.getUrlParams();

        const productType = params.type || this.defaultParams.type;

        const p_cate = params.p_cate || this.defaultParams.p_cate;

        return this.categories.getSubCategoryFilters(productType, p_cate);

    }



    renderFilterOptions() {

        const params = this.getUrlParams();

        const productType = params.type;

        const category = params.category;

        const p_cate = params.p_cate;



        if (!productType || !this.categories[productType]) return;



        const typeInfo = this.categories[productType].subCategories[p_cate] || this.categories[productType];



        $('.filter-product-title-name').text(typeInfo.fullName);

        $('#filter-products').find('.filter-product-property, .filter-product-line').remove();



        // 항상 전체 사양 보기 모드 사용

        const showAll = true;

        this.updateTableStructure(category, showAll);



        // Get filters for this specific subcategory using the new method

        const filters = this.getFiltersForCurrentCategory();



        const validFilters = filters.filter(filter =>

            (filter.type !== 'checkbox' || (filter.options && filter.options.length > 0)) &&

            (filter.type !== 'slider' || (filter.range && filter.range.length === 2))

        );



        // 카테고리별 기본 열려있는 필터 정의

        const defaultOpenFilters = {

            'CIS': ['DPI', 'Line Rate'],

            'TDI': ['Resolution', 'Line Rate'],

            'Line': ['Resolution', 'Line Rate'],

            'Area': ['Mega pixel', 'Frame Rate'],

            'Invisible': ['Resolution', 'Spectrum'],

            'Invisible Camera': ['Resolution', 'Spectrum'],  // 두 가지 이름 모두 지원

            'Scientific': ['Mega pixel', 'Dynamic Range'],

            'Scientific Camera': ['Mega pixel', 'Dynamic Range'],  // 두 가지 이름 모두 지원

            'Large Format': ['Central Mag', 'Image Circle'],

            'Telecentric': ['Mag', 'WD'],

            'FA': ['Focal length', 'Image Circle'],

            'FA Lens': ['Focal length', 'Image Circle'],  // 두 가지 이름 모두 지원

            '3D Laser Profiler': ['Point', 'Z-Range'],

            '3D Stereo Camera': ['FOV(H)', 'FOV(V)'],
            
            'Frame Grabber': ['Interface'],
            '프레임그래버': ['Interface'],
            'GigE 랜카드': ['Interface'],
            'USB 카드': ['Interface'],

        };



        // 현재 카테고리의 기본 열려있는 필터 목록 (소문자로 변환하여 비교 용이하게)

        let openFilters = [];
        
        // 정확한 일치 먼저 확인
        if (defaultOpenFilters[category]) {
            openFilters = defaultOpenFilters[category].map(f => f.toLowerCase());
        } else {
            // 정확한 일치가 없으면 부분 일치 확인
            for (const key in defaultOpenFilters) {
                // 카테고리 이름이 키에 포함되어 있거나, 키가 카테고리 이름에 포함되어 있으면 매칭
                if (category.toLowerCase().includes(key.toLowerCase()) || 
                    key.toLowerCase().includes(category.toLowerCase())) {
                    openFilters = defaultOpenFilters[key].map(f => f.toLowerCase());
                    console.log(`부분 일치 카테고리 발견: ${key} for ${category}`);
                    break;
                }
            }
        }



        // 디버깅용 로그: 현재 카테고리와 열릴 필터 출력

        console.log(`현재 카테고리: ${category}, 열릴 필터:`, openFilters);



        validFilters.forEach((filter, index) => {

            // 해당 필터가 기본적으로 열려있어야 하는지 확인 - 대소문자 구분 없이 비교

            const filterNameLower = filter.name.toLowerCase();

            const shouldBeOpen = openFilters.includes(filterNameLower) ||

                openFilters.some(f => filterNameLower === f);



            // 디버깅용 로그: 각 필터의 열림 여부 확인

            console.log(`필터 이름: ${filter.name}, 소문자: ${filterNameLower}, 열림 여부: ${shouldBeOpen}`);



            let filterHtml = index > 0 ? `<div class="filter-product-line"></div>` : '';

            filterHtml += `<div class="filter-product-property" data-filter-name="${filter.name}">

                <div class="filter-product-property-title">${filter.name}

                    <span class="filter-product-property-title-expand-toggle" data-expanded='${shouldBeOpen ? "1" : "0"}'></span>

                </div>

                <div class="filter-product-property-item-list" data-expanded="${shouldBeOpen ? "1" : "0"}">

            `;



            if (filter.type === 'checkbox') {

                // Add "Select All" checkbox for filter groups with 3+ options

                if (filter.options && filter.options.length >= 3) {

                    filterHtml += `<div class="filter-product-property-item select-all-item">

                        <input type="checkbox" id="select-all-${filter.param}" class="select-all-checkbox" data-param="${filter.param}">

                        <label for="select-all-${filter.param}">전체 선택</label>

                    </div>`;

                }



                filter.options.forEach((option, i) => {

                    const optionValue = typeof option === 'object' ? option.value : option;

                    const optionDisplay = typeof option === 'object' ? option.display : option;

                    filterHtml += `<div class="filter-product-property-item">

                        <input type="checkbox" name="${filter.param}_${i}" value="${optionValue}" data-param="${filter.param}" data-display="${optionDisplay}" id="${filter.param}_${i}">

                        <label for="${filter.param}_${i}">${optionDisplay}</label>

                    </div>`;

                });

            } else if (filter.type === 'slider') {

                // Add slider interface with custom tick values

                const [min, max] = filter.range;

                const tick = parseFloat(filter.tick) || 1; // Default tick value is 1 if not provided

                filterHtml += `

                    <div class="filter-slider-container">

                        <div class="filter-slider-range-display">

                            <span class="min-value">${min}</span> - <span class="max-value">${max}</span>

                            ${filter.unit ? `<span class="unit">${filter.unit}</span>` : ''}

                        </div>

                        <div class="filter-slider" 

                            data-param="${filter.param}"

                            data-min="${min}" 

                            data-max="${max}" 

                            data-tick="${tick}" 

                            data-current-min="${min}" 

                            data-current-max="${max}">

                            <div class="filter-slider-track"></div>

                            <div class="filter-slider-range"></div>

                            <div class="filter-slider-handle min-handle"></div>

                            <div class="filter-slider-handle max-handle"></div>

                        </div>

                    </div>

                `;

            }



            filterHtml += `</div></div>`;

            $('#filter-products').append(filterHtml);

        });



        this.initFilterEvents();

    }



    // Unified method to generate column data for a category

    getColumnData(categoryName, showAll = false) {

        const params = this.getUrlParams();

        const productType = params.type;

        const p_cate = params.p_cate;

        const columns = this.categories.getSubCategoryColumns(productType, p_cate);

        const filters = this.getFiltersForCurrentCategory();

        const allFilterColumns = filters.map(filter => ({

            field: filter.param,

            header: filter.name,

            unit: filter.unit

        }));



        return {

            columns: columns,

            allFilters: allFilterColumns,

            displayColumns: showAll ? columns : columns.filter(column => column.main)

        };

    }



    // Unified method to update table structure (header and body)

    updateTableStructure(categoryName, showAll = false) {

        const columnData = this.getColumnData(categoryName, showAll);

        this.updateTableHeader(columnData.displayColumns);

        return columnData;

    }



    // Method to update just the table header

    updateTableHeader(displayColumns) {

        if (!displayColumns || !displayColumns.length) return;



        // Generate the table header HTML

        let headerHtml = '<tr><th>비교</th>';



        // Add category-specific column headers

        displayColumns.forEach(column => {

            headerHtml += `<th>${column.header} <img src="/img/icon-sort.svg" data-sort="${column.field}" /></th>`;

        });



        // // Add the action column
        // 다운로드 칼럼 추가
        // headerHtml += '<th>Download</th></tr>';



        // Update the table header

        $(`#${this.tableId} thead`).html(headerHtml);



        // Add click handlers for sorting

        this.addSortHandlers();

    }



    // Method to add sort handlers to header images

    addSortHandlers() {

        $(`#${this.tableId} thead th img`).off('click').on('click', (e) => {

            const sortField = $(e.currentTarget).data('sort');

            if (!sortField) return;



            // Toggle sort direction or set to ASC if it's a new field

            let sortDir = 'ASC';

            if (this.currentSortField === sortField) {

                sortDir = this.currentSortDir === 'ASC' ? 'DESC' : 'ASC';

            }



            this.currentSortField = sortField;

            this.currentSortDir = sortDir;



            // Update URL and fetch products with sorting

            const params = this.getUrlParams();

            params.sortBy = sortField;

            params.sortDir = sortDir;

            this.updateUrlWithParams(params);

            this.fetchProducts(params);

        });

    }



    initFilterEvents() {

        // 현재 카테고리 값을 가져오기 위한 파라미터

        const params = this.getUrlParams();

        const category = params.category || '';



        // 카테고리별 기본 열려있는 필터 정의

        const defaultOpenFilters = {

            'CIS': ['DPI', 'Line Rate'],

            'TDI': ['Resolution', 'Line Rate'],

            'Line': ['Resolution', 'Line Rate'],

            'Area': ['Mega pixel', 'Frame Rate'],

            'Invisible': ['Resolution', 'Spectrum'],

            'Invisible Camera': ['Resolution', 'Spectrum'],  // 두 가지 이름 모두 지원

            'Scientific': ['Mega pixel', 'Dynamic Range'],

            'Scientific Camera': ['Mega pixel', 'Dynamic Range'],  // 두 가지 이름 모두 지원

            'Large Format': ['Central Mag', 'Image Circle'],

            'Telecentric': ['Mag', 'WD'],

            'FA': ['Focal length', 'Image Circle'],

            'FA Lens': ['Focal length', 'Image Circle'],  // 두 가지 이름 모두 지원

            '3D Laser Profiler': ['Point', 'Z-Range'],

            '3D Stereo Camera': ['FOV(H)', 'FOV(V)'],

            'Frame Grabber': ['Interface'],
            '프레임그래버': ['Interface'],

            'GigE 랜카드': ['Interface'],

            'USB 카드': ['Interface'],
        };



        // 현재 카테고리의 기본 열려있는 필터 목록 (소문자로 변환)

        let openFilters = [];
        
        // 정확한 일치 먼저 확인
        if (defaultOpenFilters[category]) {
            openFilters = defaultOpenFilters[category].map(f => f.toLowerCase());
        } else {
            // 정확한 일치가 없으면 부분 일치 확인
            for (const key in defaultOpenFilters) {
                // 카테고리 이름이 키에 포함되어 있거나, 키가 카테고리 이름에 포함되어 있으면 매칭
                if (category.toLowerCase().includes(key.toLowerCase()) || 
                    key.toLowerCase().includes(category.toLowerCase())) {
                    openFilters = defaultOpenFilters[key].map(f => f.toLowerCase());
                    console.log(`부분 일치 카테고리 발견: ${key} for ${category}`);
                    break;
                }
            }
        }



        // 디버깅용 로그

        console.log(`initFilterEvents - 현재 카테고리: ${category}, 열릴 필터:`, openFilters);



        // Handle filter section expand/collapse toggles - 타이틀 영역 전체를 클릭 가능하도록 변경
        $('.filter-product-property-title').off('click').on('click', function (e) {
            // 타이틀 내부의 다른 요소(체크박스 등)가 클릭된 경우 이벤트 중복 방지
            if ($(e.target).is('input[type="checkbox"]')) {
                return;
            }

            // 현재 타이틀에 속한 토글 버튼 찾기
            let $toggle = $(this).find('.filter-product-property-title-expand-toggle');
            let expanded = $toggle.attr("data-expanded") === "1" ? "0" : "1";

            // 열려고 하는 경우, 이미 열려있는 필터 중 카테고리별 기본 필터가 아닌 것만 닫기
            if (expanded === "1") {
                // 현재 클릭한 필터의 이름 가져오기
                const clickedFilterName = $(this).text().trim();

                // 현재 열려있는 다른 필터들 중 기본 열림 필터가 아닌 것만 닫기
                $('.filter-product-property-title-expand-toggle[data-expanded="1"]').each(function () {
                    if (this !== $toggle[0]) { // 현재 클릭한 요소가 아니면
                        const filterName = $(this).parent().text().trim().toLowerCase();

                        // 기본 열림 필터 목록에 없으면 닫기
                        const isDefaultOpenFilter = openFilters.includes(filterName) ||
                            openFilters.some(f => filterName.includes(f));

                        if (!isDefaultOpenFilter) {
                            $(this).attr("data-expanded", "0");
                            $(this).parent().next(".filter-product-property-item-list").attr("data-expanded", "0");
                        }
                    }
                });
            }

            // 현재 토글 상태 변경
            $toggle.attr("data-expanded", expanded);
            $(this).next(".filter-product-property-item-list").attr("data-expanded", expanded);
        });

        // 3D Stereo Camera 카테고리일 때 FOV(H)와 FOV(V) 필터 항상 열기
        if (category.includes('3D Stereo Camera')) {
            // FOV(H)와 FOV(V) 필터 찾기 및 열기
            $('.filter-product-property').each(function() {
                const filterName = $(this).data('filter-name');
                
                if (filterName === 'FOV(H)' || filterName === 'FOV(V)') {
                    $(this).find('.filter-product-property-title-expand-toggle').attr('data-expanded', '1');
                    $(this).find('.filter-product-property-item-list').attr('data-expanded', '1');
                }
            });
        }

        // 이전 토글 버튼 클릭 이벤트는 유지하되, stopPropagation 추가하여 이벤트 버블링 방지
        $('.filter-product-property-title-expand-toggle').off('click').on('click', function (e) {
            e.stopPropagation(); // 상위 요소로 이벤트 전파 방지
            
            let $this = $(this);
            let expanded = $this.attr("data-expanded") === "1" ? "0" : "1";

            // 현재 토글 상태 변경
            $this.attr("data-expanded", expanded);
            $this.parent().next(".filter-product-property-item-list").attr("data-expanded", expanded);
        });

        // Add event listener for filter checkboxes

        $('.filter-product-property-item input[type="checkbox"]').not('.select-all-checkbox').off('change').on('change', (e) => {

            // If a checkbox is checked/unchecked, update the "Select All" checkbox state

            const param = $(e.target).data('param');

            if (param) {

                this.updateSelectAllCheckboxState(param);

            }

            this.applyFilters();

        });



        // Add event handler for "Select All" checkboxes

        $('.select-all-checkbox').off('change').on('change', (e) => {

            const param = $(e.target).data('param');

            const isChecked = $(e.target).prop('checked');



            // Set all checkboxes in this group to the same state

            $(`input[type="checkbox"][data-param="${param}"]`).not('.select-all-checkbox').prop('checked', isChecked);



            // Apply filters

            this.applyFilters();

        });



        // Set initial state of "Select All" checkboxes

        $('.select-all-checkbox').each((index, checkbox) => {

            const param = $(checkbox).data('param');

            this.updateSelectAllCheckboxState(param);

        });



        // Initialize sliders with integer values

        this.initSliders();

    }



    // Helper method to update the state of "Select All" checkboxes

    updateSelectAllCheckboxState(param) {

        const $selectAll = $(`.select-all-checkbox[data-param="${param}"]`);

        if ($selectAll.length) {

            const $checkboxes = $(`input[type="checkbox"][data-param="${param}"]`).not('.select-all-checkbox');

            const allChecked = $checkboxes.length === $checkboxes.filter(':checked').length;

            $selectAll.prop('checked', allChecked);

        }

    }



    // Updated method to initialize range sliders with integer values and auto-apply

    initSliders() {

        $('.filter-slider').each((index, slider) => {

            const $slider = $(slider);

            const min = parseFloat($slider.data('min')) || 0;

            const max = parseFloat($slider.data('max')) || 100;

            const tick = parseFloat($slider.data('tick')) || 1; // Default tick value is 1 if not provided

            const range = max - min;



            // Get handles

            const $minHandle = $slider.find('.min-handle');

            const $maxHandle = $slider.find('.max-handle');

            const $range = $slider.find('.filter-slider-range');

            const $minValue = $slider.closest('.filter-slider-container').find('.min-value');

            const $maxValue = $slider.closest('.filter-slider-container').find('.max-value');



            // Set initial handle positions

            let currentMin = parseFloat($slider.data('current-min')) || min;

            let currentMax = parseFloat($slider.data('current-max')) || max;

            let isDragging = false;



            const updateHandlePosition = () => {

                const minPos = ((currentMin - min) / range) * 100;

                const maxPos = ((currentMax - min) / range) * 100;



                $minHandle.css('left', `${minPos}%`);

                $maxHandle.css('left', `${maxPos}%`);

                $range.css({

                    'left': `${minPos}%`,

                    'width': `${maxPos - minPos}%`

                });



                $minValue.text(currentMin.toFixed(1)); // Display with one decimal place

                $maxValue.text(currentMax.toFixed(1)); // Display with one decimal place



                $slider.data('current-min', currentMin);

                $slider.data('current-max', currentMax);

            };



            updateHandlePosition();



            // Handle dragging functionality for min handle

            let draggingMin = false;

            $minHandle.on('mousedown', function (e) {

                draggingMin = true;

                isDragging = true;

                e.preventDefault();

            });



            // Handle dragging functionality for max handle

            let draggingMax = false;

            $maxHandle.on('mousedown', function (e) {

                draggingMax = true;

                isDragging = true;

                e.preventDefault();

            });



            // Handle mouse move for both handles

            $(document).on('mousemove', function (e) {

                if (!draggingMin && !draggingMax) return;



                const sliderRect = $slider[0].getBoundingClientRect();

                const sliderWidth = sliderRect.width;

                let position = (e.clientX - sliderRect.left) / sliderWidth;

                position = Math.max(0, Math.min(1, position)); // Clamp between 0 and 1



                let value = min + position * range;



                // Apply tick value

                value = Math.round(value / tick) * tick;



                if (draggingMin) {

                    currentMin = Math.min(value, currentMax - tick); // Prevent overlap with max handle

                    currentMin = Math.max(min, currentMin); // Ensure min value is not less than slider min

                } else if (draggingMax) {

                    currentMax = Math.max(value, currentMin + tick); // Prevent overlap with min handle

                    currentMax = Math.min(max, currentMax); // Ensure max value is not more than slider max

                }



                updateHandlePosition();

            });



            // Handle mouse up (stop dragging and apply filters)

            $(document).on('mouseup', () => {

                if ((draggingMin || draggingMax) && isDragging) {

                    draggingMin = false;

                    draggingMax = false;

                    isDragging = false;



                    // Auto-apply filters when dragging stops

                    this.applyFilters();

                }

            });

        });

    }



    // New method to collect and apply selected filters

    applyFilters() {

        const params = this.getUrlParams();



        // Clear any existing filter parameters but keep essential ones

        const reservedParams = ['type', 'p_cate', 'category', 'page', 'pageSize', 'search', 'sortBy', 'sortDir'];

        for (const key in params) {

            if (!reservedParams.includes(key)) {

                delete params[key];

            }

        }



        // Reset to page 1 when applying new filters

        params.page = 1;



        // Group checked checkboxes by parameter name to apply OR within same filter type

        const filterGroups = {};



        $('.filter-product-property-item input[type="checkbox"]:checked').each((index, checkbox) => {

            const $checkbox = $(checkbox);



            // Check if this is a select-all checkbox

            if ($checkbox.hasClass('select-all-checkbox')) {

                // For select-all checkboxes, use data-param directly

                const param = $checkbox.data('param');

                if (param && !filterGroups[param]) {

                    filterGroups[param] = [];

                }

            } else {

                // For regular checkboxes, extract parameter name from the data-param attribute

                const paramName = $checkbox.data('param');

                const value = $checkbox.val();



                // Group values by parameter name for OR operations within the same filter type

                if (!filterGroups[paramName]) {

                    filterGroups[paramName] = [];

                }

                filterGroups[paramName].push(value);

            }

        });



        // Add slider range values to params (ensure integer values)

        $('.filter-slider').each((index, slider) => {

            const $slider = $(slider);

            const param = $slider.data('param');

            const min = parseFloat($slider.data('min'));

            const max = parseFloat($slider.data('max'));

            const currentMin = parseFloat($slider.data('current-min'));

            const currentMax = parseFloat($slider.data('current-max'));



            // Only add range filter if it's different from the default range

            if (currentMin > min || currentMax < max) {

                // Use a URL-safe format for range parameters

                params[`${param}_range`] = `${currentMin}-${currentMax}`;

            }

        });



        // Apply filter groups to parameters with comma-separated values for OR operations

        for (const paramName in filterGroups) {

            if (filterGroups[paramName].length > 0) {

                params[paramName] = filterGroups[paramName].join(',');

            }

        }



        // Get current product type and category

        const productType = params.type;

        const typeInfo = this.categories[productType];



        if (typeInfo && typeInfo.filters) {

            // Check for any calculated fields in this product type's filters

            typeInfo.filters.forEach(filter => {

                // For calculated fields (like number of pixels or resolution MP)

                if (filter.calculateFrom && (filterGroups[filter.param] ||

                    params[filter.param + '_min'] || params[filter.param + '_max'])) {

                    // Add source parameters names to the API request for backend calculation

                    params.resolution_source_params = filter.calculateFrom.join(',');

                }

            });

        }



        // Update URL and fetch products

        this.updateUrlWithParams(params);

        this.fetchProducts(params);

    }



    fetchProducts(filters = null) {

        const params = filters || this.getUrlParams();
        console.log('API 호출 파라미터:', params);
        
        this.showLoadingIndicator();



        $.ajax({

            url: '/api/products.asp',

            type: 'GET',

            data: params,

            dataType: 'json',

            success: (response) => {
                console.log('API 응답:', response);
                this.renderProductList(response);
            },

            error: (xhr) => {
                console.error("Error fetching products:", xhr.responseText);
                console.log('실패한 요청 URL:', xhr.responseURL);
            }

        });

    }



    calculateMegapixels(resX, resY) {

        const x = parseFloat(resX) || 0;

        const y = parseFloat(resY) || 0;

        return (x * y / 1000000).toFixed(1);

    }



    // Calculate number of pixels for CIS category using DPI and Scan width

    calculateNumberOfPixels(dpi, scanWidth) {

        const dpiValue = parseFloat(dpi) || 0;

        const width = parseFloat(scanWidth) || 0;

        return Math.round(dpiValue * width / 25.4); // Convert to number of pixels

    }



    renderProductList(response) {
        // Get current parameters
        const params = this.getUrlParams();
        const productType = params.type;
        const categoryName = params.category;

        console.log(`Rendering product list for type: ${productType}, category: ${categoryName}`);

        // 항상 전체 사양 보기 모드 사용
        const showAll = true;
        const columnData = this.updateTableStructure(categoryName, showAll);
        const { allFilters, displayColumns } = columnData;
        let tbody = '';

        if (!response.items || response.items.length === 0) {
            tbody = `<tr><td colspan="${displayColumns.length + 3}" style="text-align: center; padding: 40px;">
                <div class="no-products-message">
                    <p>관리자에게 문의하세요.</p>
                </div>
            </td></tr>`;
        } else {
            // 서버에서 이미 is_newproduct를 기준으로 정렬된 데이터를 사용
            response.items.forEach(product => {
                const isSelected = this.selectedProducts.some(p => p.idx === product.idx);
                tbody += `<tr><td><input type="checkbox" class="product-compare-checkbox" data-product='${JSON.stringify(product)}' ${isSelected ? 'checked' : ''} /></td>`;

                // Add data for each column defined in the category
                displayColumns.forEach(col => {
                    let cellValue = '';

                    if (Array.isArray(col.field) && col.glue) {
                        // Handle columns with multiple fields and a glue string
                        const values = col.field.map(field => product[field] || '').filter(value => value);
                        cellValue = values.join(col.glue);
                    } else {
                        // Handle regular fields
                        cellValue = product[col.field] || '';
                    }

                    // Add unit to the cell value if defined
                    if (cellValue && col.unit) {
                        // 특정 필드에는 단위를 추가하지 않음 (이미 데이터에 단위가 포함된 경우)
                        const skipUnitFields = ['p_spec_text2']; // Peak QE 필드
                        
                        // Skip MP unit for mega pixel values >= 2000
                        if (col.field === 'p_item1' && col.unit === 'MP' && parseFloat(cellValue) >= 2000) {
                            // Don't add MP unit for values >= 2000
                        } else if (!skipUnitFields.includes(col.field)) {
                            cellValue = `${cellValue}${col.unit}`;
                        }
                    }

                    // Add NEW badge for new products in Series Name column (p_name field)
                    let additionalClass = '';
                    if (col.field === 'p_name' && (product.is_newproduct === true || product.is_newproduct === 1 || product.is_newproduct === '1' || product.is_newproduct === 'True' || product.is_newproduct === 'true')) {
                        additionalClass = ' has-new-badge';
                    }

                    const visible = showAll || columnData.columns.some(column => column.field === col.field);
                    tbody += `<td class="column-${col.field}${additionalClass}" style="display: ${visible ? 'table-cell' : 'none'};">${cellValue}</td>`;
                });

                // Extract manual link
                const manualLinks = [product.p_addtext1, product.p_addtext2, product.p_addtext3, product.p_addtext4, product.p_addtext5];
                let manualLink = null;
                let manualName = null;

                for (let i = 0; i < manualLinks.length; i++) {
                    if (manualLinks[i]) {
                        const parts = manualLinks[i].split('#$');
                        if (parts.length > 2 && parts[1] && parts[2]) {
                            manualName = parts[1];
                            manualLink = parts[2];
                            break;
                        }
                    }
                }

                // // Check if p_content1 is not empty or just whitespace
                // const hasPlan = product.p_content1 && product.p_content1.trim() !== '' && product.p_content1.trim() !== '<p>&nbsp;</p>';

                // // Add download/action buttons column
                // tbody += `
                //     <td class="action-buttons" data-idx="${product.idx}" data-manual-link="${manualLink || ''}">
                //         <span class="btn-gray-rounded btn-clickable btn-spec">
                //             <img src="/img/icon-spec.svg" /> 사양
                //         </span>
                //         ${manualLink ? `<span class="btn-gray-rounded btn-clickable btn-manual">
                //             <img src="/img/icon-manual.svg" /> 매뉴얼
                //         </span>` : ''}
                //         ${hasPlan ? `<span class="btn-gray-rounded btn-clickable btn-plan">
                //             <img src="/img/icon-plan.svg" /> 도면
                //         </span>` : ''}
                //     </td>
                // </tr>`;
            });
        }

        $(`#${this.tableId} tbody`).html(tbody);

        // Update pagination using the correct API response properties
        this.renderPagination(response.total || 0, response.page || 1, response.pageSize || this.defaultParams.pageSize);

        // Initialize comparison checkboxes
        this.initComparisonCheckboxes();
    }

    // Updated method to handle pagination
    renderPagination(totalItems, currentPage, pageSize) {
        // Ensure we have at least 1 page even when there are no items
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        currentPage = parseInt(currentPage) || 1;

        // Calculate page range to show
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        // Adjust start if we're near the end
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        let paginationHtml = '';

        // Previous button with disabled state when needed
        paginationHtml += `<span class="prev${currentPage === 1 ? ' disabled' : ''}" ${currentPage > 1 ? `data-page="${currentPage - 1}"` : ''}></span>`;

        // Always show at least page 1 even with no items
        // Add first page if not in range
        if (startPage > 1) {
            paginationHtml += `<span class="page${currentPage === 1 ? ' active' : ''}" data-page="1">1</span>`;
            if (startPage > 2) paginationHtml += '<span class="ellipsis">...</span>';
        }

        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `<span class="page${currentPage === i ? ' active' : ''}" data-page="${i}">${i}</span>`;
        }

        // Add last page if not in range
        if (endPage < totalPages && totalPages > 1) {
            if (endPage < totalPages - 1) paginationHtml += '<span class="ellipsis">...</span>';
            paginationHtml += `<span class="page${currentPage === totalPages ? ' active' : ''}" data-page="${totalPages}">${totalPages}</span>`;
        }

        // Next button with disabled state when needed
        paginationHtml += `<span class="next${currentPage === totalPages || totalItems === 0 ? ' disabled' : ''}" ${currentPage < totalPages ? `data-page="${currentPage + 1}"` : ''}></span>`;

        $('.pagination').html(paginationHtml);

        // Add event handlers for page buttons
        $('.pagination .page').off('click').on('click', (e) => {
            const page = $(e.currentTarget).data('page');
            const params = this.getUrlParams();
            params.page = page;

            this.updateUrlWithParams(params);
            this.fetchProducts(params);
        });

        // Add event handlers for prev/next
        $('.pagination .prev:not(.disabled)').off('click').on('click', (e) => {
            const page = $(e.currentTarget).data('page');
            const params = this.getUrlParams();
            params.page = page;

            this.updateUrlWithParams(params);
            this.fetchProducts(params);
        });

        $('.pagination .next:not(.disabled)').off('click').on('click', (e) => {
            const page = $(e.currentTarget).data('page');
            const params = this.getUrlParams();
            params.page = page;

            this.updateUrlWithParams(params);
            this.fetchProducts(params);
        });
    }

    initEventHandlers() {
        $(document).on('click', '.btn-spec', function () {
            const idx = $(this).closest('td').data('idx');
            if (idx) {
                window.location.href = `/api/download-spec.asp?idx=${idx}`;
            }
        });

        $(document).on('click', '.btn-manual', function () {
            const manualLink = $(this).closest('td').data('manual-link');
            if (manualLink) {
                window.open(manualLink, '_blank');
            }
        });

        $(document).on('click', '.btn-plan', function () {
            const idx = $(this).closest('td').data('idx');
            if (idx) {
                window.location.href = `/api/download-plan.asp?idx=${idx}`;
            }
        });

        // Add row click handler to redirect to product detail page
        $(document).on('click', `#${this.tableId} tbody tr`, function (e) {
            // Prevent redirection if clicking on checkboxes or buttons
            if ($(e.target).is('input[type="checkbox"], .btn-spec, .btn-manual, .btn-plan, .btn-gray-rounded') ||
                $(e.target).closest('.btn-gray-rounded, .action-buttons').length > 0) {
                return;
            }

            // Get product ID from the row's action cell
            const idx = $(this).find('td.action-buttons').data('idx');
            if (idx) {
                // Redirect to product detail page
                window.location.href = `/sub/product/detail.asp?idx=${idx}`;
            }
        });

        $(document).on('click', '.btn-product-inquiry', function () {
            const p_name = $(this).data('name');
            if (p_name) {
                const inquiryUrl = `${DIR_ROOT}/sub/support/inquiry.asp?p_name=${encodeURIComponent(p_name)}`;
                window.open(inquiryUrl, '_blank');
            }
        });

        // Add click handler for header menu items
        $('#header-attached-menu .menu-item').off('click').on('click', (event) => {
            event.preventDefault();
            const params = this.getUrlParams();
            const productType = params.type; // Keep current product type
            const p_cate = $(event.currentTarget).attr('data-cate');
            const typeInfo = this.categories[productType];

            if (typeInfo && typeInfo.subCategories) {
                const categoryName = typeInfo.subCategories[p_cate].fullName || null;

                if (categoryName) {
                    // Update active menu item globally
                    this.setActiveMenuItem(p_cate);

                    // Update URL with new category and p_cate, keeping the type
                    const newParams = {
                        type: productType,
                        p_cate: p_cate,
                        category: categoryName,
                        page: 1,
                        pageSize: params.pageSize,
                        search: ''
                    };

                    // Clear the search input field
                    $('#search-input').val('');

                    // Update URL parameters and render filters 
                    this.updateUrlWithParams(newParams);

                    // Update both the filters and table columns
                    this.renderFilterOptions();
                    this.fetchProducts(newParams);
                }
            }
        });

        // Ensure the active menu item is set on page load
        const params = this.getUrlParams();
        this.setActiveMenuItem(params.p_cate);

        // Add search functionality
        $('#search-input').off('keypress').on('keypress', (event) => {
            if (event.which === 13) { // Enter key
                const searchTerm = $(event.currentTarget).val().trim();
                const params = this.getUrlParams();
                params.search = searchTerm;
                params.page = 1;

                this.updateUrlWithParams(params);
                this.fetchProducts(params);
            }
        });

        // Add search button click handler
        $('#search-button').off('click').on('click', () => {
            const searchTerm = $('#search-input').val().trim();
            const params = this.getUrlParams();
            params.search = searchTerm;
            params.page = 1;

            this.updateUrlWithParams(params);
            this.fetchProducts(params);
        });

        // Add filter reset button click handler
        $('.filter-product-title-btn-refresh').off('click').on('click', () => {
            this.clearFilters();
        });

        // Add event listener for display count select
        $('select[name="display_count"]').off('change').on('change', () => {
            const pageSize = $('select[name="display_count"]').val();
            const params = this.getUrlParams();
            params.pageSize = pageSize;
            params.page = 1; // Reset to page 1 when changing page size

            this.updateUrlWithParams(params);
            this.fetchProducts(params);
        });

        // Use event delegation for pagination links
        $(document).off('click', '.page-link').on('click', '.page-link', (event) => {
            event.preventDefault();
            const page = $(event.currentTarget).data('page');
            const params = this.getUrlParams();
            params.page = page;

            this.updateUrlWithParams(params);
            this.fetchProducts(params);
        });

        // Initialize column visibility toggle
        this.initColumnVisibilityToggle();

        // Initialize comparison related elements
        this.initComparisonElements();
    }

    // New method to set the active menu item globally
    setActiveMenuItem(p_cate) {
        $('#header-attached-menu .menu-item').removeClass('active');
        $(`#header-attached-menu .menu-item[data-cate="${p_cate}"]`).addClass('active');
        $(`#header-attached-menu .horizontal-menu`).attr('data-active', p_cate);
    }

    // Method to handle column visibility toggle using jQuery
    initColumnVisibilityToggle() {
        // 이제 단일 모드만 있으므로 "전체 사양보기" 상태로 고정
        const $expandFilterAll = $('#expand_filter_all');

        if (!$expandFilterAll.length) return;

        // Get reference to the product list table
        const $productTable = $(`#${this.tableId}`);
        if (!$productTable.length) return;

        // 항상 전체 사양 보기 모드 사용
        const categoryKey = this.getCategoryKeyFromUrl();
        this.updateTableStructure(categoryKey, true);

        // 이벤트 핸들러는 이제 필요 없음 (히든 필드만 사용)
    }

    // Helper method to get category key from URL params
    getCategoryKeyFromUrl() {
        const params = this.getUrlParams();
        return params.category || this.getCategoryKeyFromUrlParam(params.p_cate);
    }

    // New method to update the table body based on column visibility
    updateTableBody(columns, showAll, visibleInSelectedMode) {
        const $productTable = $(`#${this.tableId}`);
        const $rows = $productTable.find('tbody tr');

        $rows.each((rowIndex, row) => {
            const $cells = $(row).find('td');

            $cells.each((cellIndex, cell) => {
                const visible = showAll || visibleInSelectedMode.includes(cellIndex);
                $(cell).css('display', visible ? 'table-cell' : 'none');
            });
        });
    }

    // Modified method to initialize comparison related elements
    initComparisonElements() {
        const $compareButton = $('#btn-float-compare-product');
        if ($compareButton.length) {
            $compareButton.off('click').on('click', () => {
                this.showComparisonDialog();
            });
        }

        const $questionButton = $('#btn-float-product-question');
        if ($questionButton.length) {
            $questionButton.off('click').on('click', () => {
                const selectedCodes = this.selectedProducts.map(product => product.p_code).join(',');
                if (selectedCodes) {
                    const inquiryUrl = `${DIR_ROOT}/sub/support/inquiry.asp?p_code=${encodeURIComponent(selectedCodes)}`;
                    window.open(inquiryUrl, '_blank');
                } else {
                    alert('문의할 제품을 선택하세요.');
                }
            });
        }
    }

    // New method to initialize product comparison checkboxes
    initComparisonCheckboxes() {
        $('.product-compare-checkbox').off('change').on('change', (e) => {
            const $checkbox = $(e.target);
            const productData = $checkbox.data('product');

            if ($checkbox.prop('checked')) {
                // Check if maximum number of products is already selected
                if (this.selectedProducts.length >= this.maxCompareProducts) {
                    alert(`최대 ${this.maxCompareProducts}개의 제품만 비교할 수 있습니다.`);
                    $checkbox.prop('checked', false);
                    return;
                }

                // Add product to selected list
                this.selectedProducts.push(productData);
            } else {
                // Remove product from selected list
                this.selectedProducts = this.selectedProducts.filter(p => p.idx !== productData.idx);

                // If comparison dialog is open, remove this product from it
                if ($('.product-comparison-overlay').length) {
                    this.removeProductFromComparison(productData.idx);
                }
            }
        });

        // Restore checkbox state for selected products
        this.selectedProducts.forEach(product => {
            $(`.product-compare-checkbox[data-product*='"idx":${product.idx}']`).prop('checked', true);
        });
    }

    // Modified method to show comparison dialog without adding CSS
    showComparisonDialog() {
        // Check if we have at least 2 products to compare
        if (this.selectedProducts.length < 2) {
            alert('비교하려면 최소 2개 이상의 제품을 선택하세요.');
            return;
        }

        // Get current product type and subcategory code from URL parameters
        const params = this.getUrlParams();
        const productType = params.type;
        const subCategoryCode = params.p_cate;

        // Retrieve category columns using product-categories.js helper
        const categoryColumns = this.categories.getSubCategoryColumns(productType, subCategoryCode);

        if (!categoryColumns || categoryColumns.length === 0) {
            console.error('Category not found or has no columns:', productType, subCategoryCode);
            return;
        }

        // Create dialog HTML
        let dialogHTML = `
            <div class="product-comparison-overlay">
                <div class="product-comparison-dialog">
                    <div class="comparison-header">
                        <h3>제품 비교</h3>
                        <span class="close-comparison"></span>
                    </div>
                    <div class="comparison-content">
                        <table class="comparison-table">
                            <thead>
                                <tr>
                                    <th width="158">속성</th>
                                    ${this.selectedProducts.map(product => {
            const imageUrl = product.p_image1
                ? `/upload/prod/thumb_m/${product.p_image1}`
                : '/img/virex-logo-color.png';
            return `<th class="comparison-product-header">
                                            <div class="comparison-product-image">
                                                <img src="${imageUrl}" alt="${product.p_name || 'Product'}" onerror="this.src='/img/no-image-available.svg';">
                                                <div class="comparison-product-name">${product.p_name}</div>
                                            </div>
                                            <span class="btn-remove-from-compare" data-idx="${product.idx}" title="Remove"></span>
                                            <div class="btn-product-inquiry" data-name="${product.p_name}">
                                                <span>상품 문의하기</span>
                                                <span><img src="${DIR_ROOT}/img/icon-arrow-white.svg"/></span>
                                            </div>
                                        </th>`;
        }).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${categoryColumns.map(column => `
                                    <tr>
                                        <td class="comparison-property">${column.header}</td>
                                        ${this.selectedProducts.map(product => {
            let cellValue = '';

            if (Array.isArray(column.field) && column.glue) {
                // Handle array-type columns with glue
                const values = column.field.map(field => product[field] || '').filter(value => value);
                cellValue = values.join(column.glue);
            } else {
                // Handle regular fields
                cellValue = product[column.field] || '';
            }

            // Add unit if defined
            if (cellValue && column.unit) {
                // 특정 필드에는 단위를 추가하지 않음 (이미 데이터에 단위가 포함된 경우)
                const skipUnitFields = ['p_spec_text2']; // Peak QE 필드
                
                if (!skipUnitFields.includes(column.field)) {
                    cellValue = `${cellValue}${column.unit}`;
                }
            }

            return `<td>${cellValue}</td>`;
        }).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Add dialog to DOM
        $('body').append(dialogHTML);

        // Add event handler for close button
        $('.close-comparison').on('click', () => {
            $('.product-comparison-overlay').remove();
        });

        // Add event handler for remove product buttons
        $('.btn-remove-from-compare').on('click', (e) => {
            const idx = $(e.currentTarget).data('idx');
            this.removeProductFromComparison(idx);
        });
    }

    // New method to remove a product from comparison
    removeProductFromComparison(idx) {
        // Remove product from the selected products array
        this.selectedProducts = this.selectedProducts.filter(p => p.idx !== idx);

        // Uncheck the corresponding checkbox in the product list
        $(`.product-compare-checkbox[data-product*='"idx":${idx}']`).prop('checked', false);

        // If we still have at least 2 products, update the comparison dialog
        if (this.selectedProducts.length >= 2) {
            // Remove the product column from the comparison table
            const $table = $('.comparison-table');
            const colIndex = $table.find(`th button[data-idx="${idx}"]`).closest('th').index();

            $table.find('tr').each(function () {
                $(this).find(`th:eq(${colIndex}), td:eq(${colIndex})`).remove();
            });
        } else {
            // Close the dialog if fewer than 2 products remain
            $('.product-comparison-overlay').remove();

            // Hide the compare button if we have fewer than 2 products selected
            $('#btn-float-compare-product').hide();
        }
    }

    // Method to clear all filters
    clearFilters() {
        // Uncheck all filter checkboxes
        $('.filter-product-property-item input[type="checkbox"]').prop('checked', false);
        $('.select-all-checkbox').prop('checked', false);

        // Reset sliders to their default values
        $('.filter-slider').each((index, slider) => {
            const $slider = $(slider);
            const min = Math.round(parseFloat($slider.data('min'))) || 0;
            const max = Math.round(parseFloat($slider.data('max'))) || 100;

            // Reset current values to min/max
            $slider.data('current-min', min);
            $slider.data('current-max', max);

            // Update slider UI
            const $minHandle = $slider.find('.min-handle');
            const $maxHandle = $slider.find('.max-handle');
            const $range = $slider.find('.filter-slider-range');
            const $minValue = $slider.closest('.filter-slider-container').find('.min-value');
            const $maxValue = $slider.closest('.filter-slider-container').find('.max-value');

            $minHandle.css('left', '0%');
            $maxHandle.css('left', '100%');
            $range.css({
                'left': '0%',
                'width': '100%'
            });

            $minValue.text(min.toLocaleString());
            $maxValue.text(max.toLocaleString());
        });

        // Get current parameters - keep type, p_cate and category
        const params = this.getUrlParams();

        // Reset to default parameters but keep the current type, p_cate and category
        const resetParams = {
            type: params.type,
            p_cate: params.p_cate,
            category: params.category,
            page: 1,
            pageSize: params.pageSize || this.defaultParams.pageSize,
            search: ''
        };

        // Clear search input
        $('#search-input').val('');

        // Update URL and fetch products with reset parameters
        this.updateUrlWithParams(resetParams);
        this.fetchProducts(resetParams);
    }

}

$(document).ready(() => {
    // Load required scripts
    if (typeof productCategories === 'undefined') {
        $.getScript('/js/product-categories.js', function () {
            initializeProductFilter();
        });
    } else {
        initializeProductFilter();
    }

    function initializeProductFilter() {
        if (typeof productCategories !== 'undefined') {
            const filter = new ProductFilter(productCategories);
            const params = filter.getUrlParams();

            // Set active menu item based on p_cate parameter
            $('#header-attached-menu .menu-item').removeClass('active');
            $('#header-attached-menu .menu-item[data-cate="' + params.p_cate + '"]').addClass('active');
            $('#search-input').val(params.search);
            $('select[name="display_count"]').val(params.pageSize);

            // 항상 전체 사양 보기 모드 사용
            $('#expand_filter_all').prop('checked', true);

            filter.renderFilterOptions();
            filter.fetchProducts(params);
        }
    }
});