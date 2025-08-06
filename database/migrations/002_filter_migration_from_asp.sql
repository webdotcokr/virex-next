-- ===============================================
-- 기존 ASP 필터 시스템을 동적 필터 시스템으로 마이그레이션
-- 생성일: 2025-08-05
-- 설명: 기존 정적 필터 설정을 DB 기반 동적 시스템으로 이전
-- ===============================================

-- 1. CIS (Contact Image Sensor) - Category ID: 9
-- ===============================================

-- Filter configs for CIS
INSERT INTO filter_configs (category_id, filter_name, filter_label, filter_type, filter_unit, sort_order, default_expanded, is_active) VALUES
(9, 'scan_width', 'Scan width', 'checkbox', 'mm', 1, false, true),
(9, 'dpi', 'DPI', 'checkbox', 'dpi', 2, true, true),
(9, 'speed', 'Speed', 'checkbox', 'mm/s', 3, false, true),
(9, 'line_rate', 'Line rate', 'checkbox', 'kHz', 4, true, true),
(9, 'no_of_pixels', 'No. of Pixels', 'slider', '', 5, false, true),
(9, 'wd', 'WD', 'checkbox', 'mm', 6, false, true),
(9, 'spectrum', 'Spectrum', 'checkbox', '', 7, false, true),
(9, 'interface', 'Interface', 'checkbox', '', 8, false, true),
(9, 'maker_name', 'Maker', 'checkbox', '', 9, false, true);

-- Filter options for CIS Scan width
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'scan_width'), '>=1000', '1000mm 이상', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'scan_width'), 'BETWEEN 500 AND 999', '500mm ~ 999mm', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'scan_width'), 'BETWEEN 100 AND 499', '100mm ~ 499mm', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'scan_width'), '<=99', '~ 99mm', 4, true);

-- Filter options for CIS DPI
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'dpi'), '4800', '4800dpi', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'dpi'), '3600', '3600dpi', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'dpi'), '2400', '2400dpi', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'dpi'), '1800', '1800dpi', 4, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'dpi'), '1200', '1200dpi', 5, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'dpi'), '900', '900dpi', 6, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'dpi'), '600', '600dpi', 7, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'dpi'), '300', '300dpi', 8, true);

-- Filter options for CIS Speed
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'speed'), '>=5000', '5000mm/s 이상', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'speed'), 'BETWEEN 3000 AND 4999', '3000 ~ 4999mm/s', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'speed'), 'BETWEEN 1000 AND 2999', '1000 ~ 2999mm/s', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'speed'), '<=999', '~ 999mm/s', 4, true);

-- Filter options for CIS Line rate
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'line_rate'), '>=401', '401kHz 이상', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'line_rate'), 'BETWEEN 301 AND 400', '301 ~ 400kHz', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'line_rate'), 'BETWEEN 201 AND 300', '201 ~ 300kHz', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'line_rate'), 'BETWEEN 101 AND 200', '101 ~ 200kHz', 4, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'line_rate'), '<=100', '100kHz 이하', 5, true);

-- Slider config for CIS No. of Pixels
INSERT INTO filter_slider_configs (filter_config_id, min_value, max_value, step_value) VALUES
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'no_of_pixels'), 0, 200000, 1000);

-- Filter options for CIS WD
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'wd'), '<=8', '8mm 이하', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'wd'), 'BETWEEN 9 AND 15', '9mm ~ 15mm', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'wd'), '>=16', '16mm 이상', 3, true);

-- Filter options for CIS Spectrum
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'spectrum'), 'Mono', 'Mono', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'spectrum'), 'Color', 'Color', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'spectrum'), 'NOT IN (''Mono'',''Color'')', 'ETC', 3, true);

-- Filter options for CIS Interface
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'interface'), 'CoaXPress', 'CoaXPress', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'interface'), 'Camera Link', 'Camera Link', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'interface'), '40GigE', '40GigE', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'interface'), '10GigE', '10GigE', 4, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'interface'), '1GigE', '1GigE', 5, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'interface'), 'NOT IN (''CoaXPress'',''Camera Link'',''40GigE'',''10GigE'',''1GigE'')', 'ETC', 6, true);

-- Filter options for CIS Maker
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'maker_name'), 'INSNEX', 'INSNEX', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'maker_name'), 'ARES INTELTECH', 'ARES INTELTECH', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 9 AND filter_name = 'maker_name'), 'NOT IN (''INSNEX'',''ARES INTELTECH'')', 'ETC', 3, true);

-- 2. TDI - Category ID: 10
-- ===============================================

-- Filter configs for TDI
INSERT INTO filter_configs (category_id, filter_name, filter_label, filter_type, filter_unit, sort_order, default_expanded, is_active) VALUES
(10, 'resolution', 'Resolution', 'checkbox', '', 1, true, true),
(10, 'no_of_line', 'No. of Line', 'checkbox', '', 2, false, true),
(10, 'line_rate', 'Line rate', 'checkbox', 'kHz', 3, false, true),
(10, 'pixel_size', 'Pixel size', 'checkbox', 'μm', 4, false, true),
(10, 'spectrum', 'Spectrum', 'checkbox', '', 5, false, true),
(10, 'interface', 'Interface', 'checkbox', '', 6, false, true),
(10, 'maker_name', 'Maker', 'checkbox', '', 7, false, true);

-- Filter options for TDI Resolution
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'resolution'), '>=16385', '16385 이상', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'resolution'), 'BETWEEN 8193 AND 16384', '8193 ~ 16384', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'resolution'), 'BETWEEN 4097 AND 8192', '4097 ~ 8192', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'resolution'), 'BETWEEN 2049 AND 4096', '2049 ~ 4096', 4, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'resolution'), '<=2048', '2048 이하', 5, true);

-- Filter options for TDI No. of Line
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'no_of_line'), '>=257', '257 이상', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'no_of_line'), 'BETWEEN 193 AND 256', '193 ~ 256', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'no_of_line'), 'BETWEEN 65 AND 192', '65 ~ 192', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'no_of_line'), '<=64', '64 이하', 4, true);

-- Filter options for TDI Line rate
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'line_rate'), '>=401', '401kHz 이상', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'line_rate'), 'BETWEEN 301 AND 400', '301 ~ 400kHz', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'line_rate'), 'BETWEEN 201 AND 300', '201 ~ 300kHz', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'line_rate'), 'BETWEEN 101 AND 200', '101 ~ 200kHz', 4, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'line_rate'), '<=100', '100kHz 이하', 5, true);

-- Filter options for TDI Pixel size
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'pixel_size'), '>=10', '10μm 이상', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'pixel_size'), '<=5 AND p_item4 <10', '5 ~ 10μm 미만', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'pixel_size'), '<5', '5μm 미만', 3, true);

-- Filter options for TDI Spectrum
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'spectrum'), 'Mono', 'Mono', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'spectrum'), 'Color', 'Color', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'spectrum'), 'NOT IN (''Mono'',''Color'')', 'ETC', 3, true);

-- Filter options for TDI Interface
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'interface'), 'Camera Link HS', 'Camera Link HS', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'interface'), 'CoaXPress12', 'CoaXPress12', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'interface'), 'CoaXPress10', 'CoaXPress10', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'interface'), 'CoaXPress6', 'CoaXPress6', 4, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'interface'), 'Camera Link', 'Camera Link', 5, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'interface'), 'NOT IN (''Camera Link HS'',''CoaXPress12'',''CoaXPress10'',''CoaXPress6'',''Camera Link'')', 'ETC', 6, true);

-- Filter options for TDI Maker
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'maker_name'), 'Teledyne Dalsa', 'Teledyne Dalsa', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'maker_name'), 'i-TEK', 'i-TEK', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 10 AND filter_name = 'maker_name'), 'NOT IN (''Teledyne Dalsa'',''i-TEK'')', 'ETC', 3, true);

-- 3. Line Camera - Category ID: 11
-- ===============================================

-- Filter configs for Line
INSERT INTO filter_configs (category_id, filter_name, filter_label, filter_type, filter_unit, sort_order, default_expanded, is_active) VALUES
(11, 'resolution', 'Resolution', 'checkbox', '', 1, true, true),
(11, 'no_of_line', 'No. of Line', 'checkbox', '', 2, false, true),
(11, 'line_rate', 'Line rate', 'checkbox', 'kHz', 3, true, true),
(11, 'pixel_size', 'Pixel size', 'checkbox', 'μm', 4, false, true),
(11, 'spectrum', 'Spectrum', 'checkbox', '', 5, false, true),
(11, 'interface', 'Interface', 'checkbox', '', 6, false, true),
(11, 'maker_name', 'Maker', 'checkbox', '', 7, false, true);

-- Filter options for Line Resolution
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'resolution'), '>=16385', '16385 이상', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'resolution'), 'BETWEEN 8193 AND 16384', '8193 ~ 16384', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'resolution'), 'BETWEEN 4097 AND 8192', '4097 ~ 8192', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'resolution'), 'BETWEEN 2049 AND 4096', '2049 ~ 4096', 4, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'resolution'), '<=2048', '2048 이하', 5, true);

-- Filter options for Line No. of Line
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'no_of_line'), '>=5', '5 이상', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'no_of_line'), 'BETWEEN 2 AND 4', '2 ~ 4', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'no_of_line'), '1', '1', 3, true);

-- Filter options for Line Line rate
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'line_rate'), '>=401', '401kHz 이상', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'line_rate'), 'BETWEEN 301 AND 400', '301 ~ 400kHz', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'line_rate'), 'BETWEEN 201 AND 300', '201 ~ 300kHz', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'line_rate'), 'BETWEEN 101 AND 200', '101 ~ 200kHz', 4, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'line_rate'), '<=100', '~ 100kHz', 5, true);

-- Filter options for Line Pixel size
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'pixel_size'), '>=10', '10μm 이상', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'pixel_size'), '>=5 AND p_item5 <10', '5μm ~ 10μm 미만', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'pixel_size'), '<5', '5μm 미만', 3, true);

-- Filter options for Line Spectrum
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'spectrum'), 'Mono', 'Mono', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'spectrum'), 'Color', 'Color', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'spectrum'), 'NOT IN (''Mono'',''Color'')', 'ETC', 3, true);

-- Filter options for Line Interface
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'interface'), 'Camera Link HS', 'Camera Link HS', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'interface'), 'CoaXPress', 'CoaXPress', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'interface'), 'Camera Link', 'Camera Link', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'interface'), 'SFP+', 'SFP+', 4, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'interface'), 'GigE', 'GigE', 5, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'interface'), 'NOT IN (''Camera Link HS'',''CoaXPress'',''Camera Link'',''SFP+'',''GigE'')', 'ETC', 6, true);

-- Filter options for Line Maker
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'maker_name'), 'Teledyne Dalsa', 'Teledyne Dalsa', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'maker_name'), 'i-TEK', 'i-TEK', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 11 AND filter_name = 'maker_name'), 'NOT IN (''Teledyne Dalsa'',''i-TEK'')', 'ETC', 3, true);

-- 4. Area Camera - Category ID: 12
-- ===============================================

-- Filter configs for Area
INSERT INTO filter_configs (category_id, filter_name, filter_label, filter_type, filter_unit, sort_order, default_expanded, is_active) VALUES
(12, 'mega_pixel', 'Mega pixel', 'checkbox', '', 1, true, true),
(12, 'frame_rate', 'Frame rate', 'checkbox', '', 2, true, true),
(12, 'pixel_size', 'Pixel size', 'checkbox', 'μm', 3, false, true),
(12, 'spectrum', 'Spectrum', 'checkbox', '', 4, false, true),
(12, 'interface', 'Interface', 'checkbox', '', 5, false, true),
(12, 'maker_name', 'Maker', 'checkbox', '', 6, false, true);

-- Filter options for Area Mega pixel
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'mega_pixel'), '>=100', '100MP 이상', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'mega_pixel'), '>=50 AND p_item1 <100', '50MP ~ 100MP 미만', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'mega_pixel'), '>=10 AND p_item1 <50', '10MP ~ 50MP 미만', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'mega_pixel'), '>=5 AND p_item1 <10', '5MP ~ 10MP 미만', 4, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'mega_pixel'), '>=3 AND p_item1 <5', '3MP ~ 5MP 미만', 5, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'mega_pixel'), '>=1 AND p_item1 <3', '1MP ~ 3MP 미만', 6, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'mega_pixel'), '>=0.3 AND p_item1 <1', '0.3MP ~ 1MP 미만', 7, true);

-- Filter options for Area Frame rate
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'frame_rate'), '>=300', '300fps 이상', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'frame_rate'), '>=200 AND p_item2 <300', '200fps ~ 300fps 미만', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'frame_rate'), '>=100 AND p_item2 <200', '100fps ~ 200fps 미만', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'frame_rate'), '>=50 AND p_item2 <100', '50fps ~ 100fps 미만', 4, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'frame_rate'), '>=10 AND p_item2 < 50', '10fps ~ 50fps 미만', 5, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'frame_rate'), '<10', '10fps 미만', 6, true);

-- Filter options for Area Pixel size
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'pixel_size'), '>=10', '10μm이상', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'pixel_size'), '>=5 AND p_item4 <10', '5μm ~ 10μm 미만', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'pixel_size'), '<5', '5μm 미만', 3, true);

-- Filter options for Area Spectrum
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'spectrum'), 'Mono', 'Mono', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'spectrum'), 'Color', 'Color', 2, true);

-- Filter options for Area Interface
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'interface'), 'Camera Link HS', 'Camera Link HS', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'interface'), 'CoaXPress', 'CoaXPress', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'interface'), 'Camera Link', 'Camera Link', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'interface'), '10GigE', '10GigE', 4, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'interface'), '5GigE', '5GigE', 5, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'interface'), '2.5GigE', '2.5GigE', 6, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'interface'), '1GigE', '1GigE', 7, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'interface'), 'USB3.0', 'USB3.0', 8, true);

-- Filter options for Area Maker
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'maker_name'), 'Teledyne Dalsa', 'Teledyne Dalsa', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'maker_name'), 'Teledyne FLIR', 'Teledyne FLIR', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'maker_name'), 'Teledyne Lumenera', 'Teledyne Lumenera', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'maker_name'), 'Daheng Imaging', 'Daheng Imaging', 4, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'maker_name'), 'i-TEK', 'i-TEK', 5, true),
((SELECT id FROM filter_configs WHERE category_id = 12 AND filter_name = 'maker_name'), 'NOT IN (''Teledyne Dalsa'',''Teledyne FLIR'',''Teledyne Lumenera'',''Daheng Imaging'',''i-TEK'')', 'ETC', 6, true);

-- 5. Large Format Lens - Category ID: 15
-- ===============================================

-- Filter configs for Large Format
INSERT INTO filter_configs (category_id, filter_name, filter_label, filter_type, filter_unit, sort_order, default_expanded, is_active) VALUES
(15, 'central_mag', 'Central Mag', 'slider', 'x', 1, true, true),
(15, 'image_circle', 'Image Circle', 'slider', 'φ/mm', 2, true, true),
(15, 'focal_length', 'Focal length', 'slider', 'mm', 3, false, true),
(15, 'f_number', 'F#', 'checkbox', '', 4, false, true),
(15, 'maker_name', 'Maker', 'checkbox', '', 5, false, true);

-- Slider configs for Large Format
INSERT INTO filter_slider_configs (filter_config_id, min_value, max_value, step_value) VALUES
((SELECT id FROM filter_configs WHERE category_id = 15 AND filter_name = 'central_mag'), 0, 7, 0.1),
((SELECT id FROM filter_configs WHERE category_id = 15 AND filter_name = 'image_circle'), 0, 100, 1),
((SELECT id FROM filter_configs WHERE category_id = 15 AND filter_name = 'focal_length'), 4, 150, 1);

-- Filter options for Large Format F#
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 15 AND filter_name = 'f_number'), '<4', '~ 4.0미만', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 15 AND filter_name = 'f_number'), '>= 4 AND f_number < 5.6', '4.0~5.6미만', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 15 AND filter_name = 'f_number'), '>=5.6', '5.6이상', 3, true);

-- Filter options for Large Format Maker
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 15 AND filter_name = 'maker_name'), 'Schneider', 'Schneider', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 15 AND filter_name = 'maker_name'), 'Dzoptics', 'Dzoptics', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 15 AND filter_name = 'maker_name'), 'NOT IN (''Schneider'',''Dzoptics'')', 'ETC', 3, true);

-- 6. Telecentric Lens - Category ID: 16
-- ===============================================

-- Filter configs for Telecentric
INSERT INTO filter_configs (category_id, filter_name, filter_label, filter_type, filter_unit, sort_order, default_expanded, is_active) VALUES
(16, 'mag', 'Mag', 'slider', 'x', 1, true, true),
(16, 'image_circle', 'Image Circle', 'checkbox', 'φ/mm(인치)', 2, false, true),
(16, 'wd', 'WD', 'checkbox', 'mm', 3, false, true),
(16, 'f_number', 'F#', 'checkbox', '', 4, false, true),
(16, 'maker_name', 'Maker', 'checkbox', '', 5, false, true);

-- Slider config for Telecentric Mag
INSERT INTO filter_slider_configs (filter_config_id, min_value, max_value, step_value) VALUES
((SELECT id FROM filter_configs WHERE category_id = 16 AND filter_name = 'mag'), 0, 10, 0.1);

-- Filter options for Telecentric Image Circle
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 16 AND filter_name = 'image_circle'), '>=45', '45mm 이상', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 16 AND filter_name = 'image_circle'), '>= 35 AND image_circle < 45', '35mm 이상 ~45mm 미만', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 16 AND filter_name = 'image_circle'), '>= 21.3 AND image_circle < 35', '21.3mm(4/3") 이상 ~35mm 미만', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 16 AND filter_name = 'image_circle'), '>= 18.4 AND image_circle < 21.3', '18.4mm(1.1") 이상 ~21.3mm (4/3") 미만', 4, true),
((SELECT id FROM filter_configs WHERE category_id = 16 AND filter_name = 'image_circle'), '>= 16 AND image_circle < 18.4', '16mm(1") 이상 ~18.4mm (1.1") 미만', 5, true),
((SELECT id FROM filter_configs WHERE category_id = 16 AND filter_name = 'image_circle'), '>= 11.4 AND image_circle < 16', '11.4mm(2/3") 이상 ~16mm (1") 미만', 6, true),
((SELECT id FROM filter_configs WHERE category_id = 16 AND filter_name = 'image_circle'), '>= 8 AND image_circle < 11.4', '8mm(1/2") 이상 ~11.4mm (2/3") 미만', 7, true),
((SELECT id FROM filter_configs WHERE category_id = 16 AND filter_name = 'image_circle'), '<8', '8mm(1/2")미만', 8, true);

-- Filter options for Telecentric WD
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 16 AND filter_name = 'wd'), '<65', '65mm 미만', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 16 AND filter_name = 'wd'), '>= 66 AND wd < 110', '66 ~ 110mm 미만', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 16 AND filter_name = 'wd'), '>= 111 AND wd < 200', '111 ~ 200mm 미만', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 16 AND filter_name = 'wd'), '>= 201 AND wd < 300', '201 ~ 300mm 미만', 4, true),
((SELECT id FROM filter_configs WHERE category_id = 16 AND filter_name = 'wd'), '>=301', '301mm 이상', 5, true);

-- Filter options for Telecentric F#
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 16 AND filter_name = 'f_number'), '<10', '10 미만', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 16 AND filter_name = 'f_number'), '>= 10 AND f_number < 20', '10 ~ 20 미만', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 16 AND filter_name = 'f_number'), '>=21', '21 이상', 3, true);

-- Filter options for Telecentric Maker
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 16 AND filter_name = 'maker_name'), 'Dzoptics', 'Dzoptics', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 16 AND filter_name = 'maker_name'), 'NEW TRY', 'NEW TRY', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 16 AND filter_name = 'maker_name'), 'NOT IN (''Dzoptics'',''NEW TRY'')', 'ETC', 3, true);

-- 7. FA Lens - Category ID: 17
-- ===============================================

-- Filter configs for FA Lens
INSERT INTO filter_configs (category_id, filter_name, filter_label, filter_type, filter_unit, sort_order, default_expanded, is_active) VALUES
(17, 'focal_length', 'Focal length', 'checkbox', 'mm', 1, true, true),
(17, 'image_circle', 'Image Circle', 'checkbox', 'φ/mm', 2, true, true),
(17, 'f_number', 'F#', 'checkbox', '', 3, false, true),
(17, 'maker_name', 'Maker', 'checkbox', '', 4, false, true);

-- Filter options for FA Lens Focal length
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 17 AND filter_name = 'focal_length'), '>=50', '50mm 이상', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 17 AND filter_name = 'focal_length'), '>= 25 AND focal_length < 50', '25 ~ 50mm 미만', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 17 AND filter_name = 'focal_length'), '>= 6 AND focal_length < 25', '6 ~ 25mm 미만', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 17 AND filter_name = 'focal_length'), '<6', '~ 6mm미만', 4, true);

-- Filter options for FA Lens Image Circle
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 17 AND filter_name = 'image_circle'), '>=18.4', '18.4mm 이상', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 17 AND filter_name = 'image_circle'), '>= 16 AND image_circle < 18.4', '16mm(1") 이상 ~ 18.4mm(1.1") 미만', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 17 AND filter_name = 'image_circle'), '>= 11.4 AND image_circle < 16', '11.4mm(2/3") 이상 ~ 16mm(1") 미만', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 17 AND filter_name = 'image_circle'), '>= 8 AND image_circle < 11.4', '8mm(1/2") 이상 ~ 11.4mm(2/3") 미만', 4, true);

-- Filter options for FA Lens F#
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 17 AND filter_name = 'f_number'), '<2.2', '~ 2.2 미만', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 17 AND filter_name = 'f_number'), '>= 2.2 AND f_number < 3.0', '2.2 ~ 3.0 미만', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 17 AND filter_name = 'f_number'), '>=3', '3.0 이상', 3, true);

-- Filter options for FA Lens Maker
INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 17 AND filter_name = 'maker_name'), 'Dzoptics', 'Dzoptics', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 17 AND filter_name = 'maker_name'), 'NOT IN (''Dzoptics'')', 'ETC', 2, true);

-- ===============================================
-- 계속해서 나머지 카테고리들...
-- (Frame Grabber, GigE Card, USB Card, Invisible, Scientific)
-- ===============================================

-- Frame Grabber - Category ID: 23
INSERT INTO filter_configs (category_id, filter_name, filter_label, filter_type, filter_unit, sort_order, default_expanded, is_active) VALUES
(23, 'interface', 'Interface', 'checkbox', '', 1, true, true);

INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 23 AND filter_name = 'interface'), '10GigE', '10GigE', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 23 AND filter_name = 'interface'), 'CoaXPress', 'CoaXPress', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 23 AND filter_name = 'interface'), 'Camera Link HS', 'Camera Link HS', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 23 AND filter_name = 'interface'), 'Camera Link', 'Camera Link', 4, true);

-- GigE LAN Card - Category ID: 24
INSERT INTO filter_configs (category_id, filter_name, filter_label, filter_type, filter_unit, sort_order, default_expanded, is_active) VALUES
(24, 'interface', 'Interface', 'checkbox', '', 1, true, true),
(24, 'port', 'Port', 'checkbox', 'CH', 2, false, true),
(24, 'pc_slot', 'PCIe', 'checkbox', '', 3, false, true),
(24, 'poe', 'PoE', 'checkbox', '', 4, false, true);

INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 24 AND filter_name = 'interface'), '1GigE', '1GigE', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 24 AND filter_name = 'interface'), '2.5GigE', '2.5GigE', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 24 AND filter_name = 'interface'), '5GigE', '5GigE', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 24 AND filter_name = 'interface'), '10GigE', '10GigE', 4, true),
((SELECT id FROM filter_configs WHERE category_id = 24 AND filter_name = 'port'), '1', '1CH', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 24 AND filter_name = 'port'), '2', '2CH', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 24 AND filter_name = 'port'), '4', '4CH', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 24 AND filter_name = 'port'), '8', '8CH', 4, true),
((SELECT id FROM filter_configs WHERE category_id = 24 AND filter_name = 'port'), '>=9', '9CH 이상', 5, true),
((SELECT id FROM filter_configs WHERE category_id = 24 AND filter_name = 'pc_slot'), 'PCIe2.0', 'PCIe2.0', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 24 AND filter_name = 'pc_slot'), 'PCIe3.0', 'PCIe3.0', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 24 AND filter_name = 'pc_slot'), 'PCI', 'PCI', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 24 AND filter_name = 'poe'), 'PoE', 'PoE', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 24 AND filter_name = 'poe'), 'Non PoE', 'Non PoE', 2, true);

-- USB Card - Category ID: 25
INSERT INTO filter_configs (category_id, filter_name, filter_label, filter_type, filter_unit, sort_order, default_expanded, is_active) VALUES
(25, 'interface', 'Interface', 'checkbox', '', 1, true, true),
(25, 'port', 'Port', 'checkbox', 'CH', 2, false, true),
(25, 'pc_slot', 'PCIe', 'checkbox', '', 3, false, true),
(25, 'trans_speed', 'Trans Speed', 'checkbox', 'Gb/s', 4, false, true);

INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 25 AND filter_name = 'interface'), 'USB3.0', 'USB3.0', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 25 AND filter_name = 'interface'), 'USB3.1', 'USB3.1', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 25 AND filter_name = 'interface'), 'USB3.2', 'USB3.2', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 25 AND filter_name = 'port'), '1', '1CH', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 25 AND filter_name = 'port'), '2', '2CH', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 25 AND filter_name = 'port'), '4', '4CH', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 25 AND filter_name = 'port'), '8', '8CH', 4, true),
((SELECT id FROM filter_configs WHERE category_id = 25 AND filter_name = 'port'), '>=9', '9CH 이상', 5, true),
((SELECT id FROM filter_configs WHERE category_id = 25 AND filter_name = 'pc_slot'), 'PCIe2.0', 'PCIe2.0', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 25 AND filter_name = 'pc_slot'), 'PCIe3.0', 'PCIe3.0', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 25 AND filter_name = 'pc_slot'), 'PCI', 'PCI', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 25 AND filter_name = 'trans_speed'), '5', '5Gb/s', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 25 AND filter_name = 'trans_speed'), '10', '10Gb/s', 2, true);

-- Invisible (SWIR) - Category ID: 13
INSERT INTO filter_configs (category_id, filter_name, filter_label, filter_type, filter_unit, sort_order, default_expanded, is_active) VALUES
(13, 'mega_pixel', 'Mega pixel', 'checkbox', '', 1, false, true),
(13, 'frame_rate', 'Frame rate', 'checkbox', 'fps/kHz', 2, false, true),
(13, 'pixel_size', 'Pixel size', 'checkbox', 'μm', 3, false, true),
(13, 'spectrum', 'Spectrum', 'checkbox', '', 4, true, true),
(13, 'interface', 'Interface', 'checkbox', '', 5, false, true),
(13, 'maker_name', 'Maker', 'checkbox', '', 6, false, true);

INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 13 AND filter_name = 'mega_pixel'), '>=4096', '4096 이상', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 13 AND filter_name = 'mega_pixel'), '>=2048 AND p_item1 <4096', '2048 ~ 4095 미만', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 13 AND filter_name = 'mega_pixel'), '>=27 AND p_item1 <50', '27 ~ 50MP 미만', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 13 AND filter_name = 'mega_pixel'), '>=5.2 AND p_item1 <27', '5.2MP ~ 27MP 미만', 4, true),
((SELECT id FROM filter_configs WHERE category_id = 13 AND filter_name = 'mega_pixel'), '<5.1', '5.1MP 미만', 5, true),
((SELECT id FROM filter_configs WHERE category_id = 13 AND filter_name = 'spectrum'), 'UV', 'UV', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 13 AND filter_name = 'spectrum'), 'NIR', 'NIR', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 13 AND filter_name = 'spectrum'), 'SWIR', 'SWIR', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 13 AND filter_name = 'spectrum'), 'NOT IN (''UV'',''NIR'',''SWIR'')', 'ETC', 4, true);

-- Scientific Camera - Category ID: 14
INSERT INTO filter_configs (category_id, filter_name, filter_label, filter_type, filter_unit, sort_order, default_expanded, is_active) VALUES
(14, 'mega_pixel', 'Mega pixel', 'checkbox', '', 1, true, true),
(14, 'frame_rate', 'Frame rate', 'checkbox', '', 2, false, true),
(14, 'pixel_size', 'Pixel size', 'checkbox', 'μm', 3, false, true),
(14, 'spectrum', 'Spectrum', 'checkbox', '', 4, false, true),
(14, 'interface', 'Interface', 'checkbox', '', 5, false, true),
(14, 'maker_name', 'Maker', 'checkbox', '', 6, false, true);

INSERT INTO filter_options (filter_config_id, option_value, option_label, sort_order, is_active) VALUES
((SELECT id FROM filter_configs WHERE category_id = 14 AND filter_name = 'mega_pixel'), '>=12', '12MP 이상', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 14 AND filter_name = 'mega_pixel'), '>=6 AND mega_pixel <12', '6 ~ 12MP 미만', 2, true),
((SELECT id FROM filter_configs WHERE category_id = 14 AND filter_name = 'mega_pixel'), '<6', '6MP 미만', 3, true),
((SELECT id FROM filter_configs WHERE category_id = 14 AND filter_name = 'maker_name'), 'Teledyne Phtometrics', 'Teledyne Phtometrics', 1, true),
((SELECT id FROM filter_configs WHERE category_id = 14 AND filter_name = 'maker_name'), 'Teledyne Princeton Instruments', 'Teledyne Princeton Instruments', 2, true);

-- ===============================================
-- 마이그레이션 완료 확인 쿼리
-- ===============================================

-- 각 카테고리별 필터 개수 확인
SELECT 
    c.name as category_name,
    COUNT(fc.id) as filter_count,
    COUNT(CASE WHEN fc.filter_type = 'checkbox' THEN 1 END) as checkbox_filters,
    COUNT(CASE WHEN fc.filter_type = 'slider' THEN 1 END) as slider_filters
FROM categories c
LEFT JOIN filter_configs fc ON c.id = fc.category_id
WHERE c.id IN (9, 10, 11, 12, 13, 14, 15, 16, 17, 23, 24, 25)
GROUP BY c.id, c.name
ORDER BY c.id;

-- 옵션 개수 확인
SELECT 
    fc.filter_label,
    c.name as category_name,
    COUNT(fo.id) as option_count
FROM filter_configs fc
JOIN categories c ON fc.category_id = c.id
LEFT JOIN filter_options fo ON fc.id = fo.filter_config_id
WHERE fc.filter_type = 'checkbox'
AND c.id IN (9, 10, 11, 12, 13, 14, 15, 16, 17, 23, 24, 25)
GROUP BY fc.id, fc.filter_label, c.name
ORDER BY c.id, fc.sort_order;

-- 슬라이더 설정 확인
SELECT 
    fc.filter_label,
    c.name as category_name,
    fsc.min_value,
    fsc.max_value,
    fsc.step_value
FROM filter_configs fc
JOIN categories c ON fc.category_id = c.id
JOIN filter_slider_configs fsc ON fc.id = fsc.filter_config_id
WHERE fc.filter_type = 'slider'
AND c.id IN (9, 10, 11, 12, 13, 14, 15, 16, 17, 23, 24, 25)
ORDER BY c.id, fc.sort_order;