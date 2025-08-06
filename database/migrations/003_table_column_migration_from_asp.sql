-- ===============================================
-- 기존 ASP 테이블 컬럼 설정을 동적 컬럼 시스템으로 마이그레이션
-- 생성일: 2025-08-05
-- 설명: 기존 정적 테이블 컬럼을 DB 기반 동적 시스템으로 이전
-- ===============================================

-- 1. CIS (Contact Image Sensor) - Category ID: 9
-- ===============================================

-- Table column configs for CIS
INSERT INTO table_column_configs (category_id, column_name, column_label, column_type, is_visible, is_sortable, sort_order, column_width) VALUES
(9, 'maker_name', 'Maker', 'basic', true, true, 1, '100px'),
(9, 'series', 'Series', 'basic', true, true, 2, '120px'),
(9, 'part_number', 'Part Number', 'basic', true, true, 3, '150px'),
(9, 'scan_width', 'Scan Width', 'specification', true, true, 4, '100px'),
(9, 'dpi', 'DPI', 'specification', true, true, 5, '80px'),
(9, 'resolution', 'Resolution', 'specification', true, true, 6, '100px'),
(9, 'line_rate', 'Line Rate', 'specification', true, true, 7, '100px'),
(9, 'speed', 'Speed', 'specification', true, true, 8, '80px'),
(9, 'wd', 'WD', 'specification', true, true, 9, '80px'),
(9, 'no_of_pixels', 'No. of Pixels', 'specification', true, true, 10, '120px'),
(9, 'spectrum', 'Spectrum', 'specification', true, false, 11, '100px'),
(9, 'interface', 'Interface', 'specification', true, false, 12, '120px');

-- 2. TDI - Category ID: 10
-- ===============================================

-- Table column configs for TDI
INSERT INTO table_column_configs (category_id, column_name, column_label, column_type, is_visible, is_sortable, sort_order, column_width) VALUES
(10, 'maker_name', 'Maker', 'basic', true, true, 1, '150px'),
(10, 'series', 'Series', 'basic', true, true, 2, '120px'),
(10, 'part_number', 'Part Number', 'basic', true, true, 3, '150px'),
(10, 'line_rate', 'Line Rate', 'specification', true, true, 4, '100px'),
(10, 'pixel_size', 'Pixel Size', 'specification', true, true, 5, '100px'),
(10, 'line_length', 'Line Length', 'specification', true, true, 6, '100px'),
(10, 'data_rate', 'Data Rate', 'specification', true, true, 7, '100px'),
(10, 'interface', 'Interface', 'specification', true, false, 8, '120px');

-- 3. Line Camera - Category ID: 11
-- ===============================================

-- Table column configs for Line
INSERT INTO table_column_configs (category_id, column_name, column_label, column_type, is_visible, is_sortable, sort_order, column_width) VALUES
(11, 'maker_name', 'Maker', 'basic', true, true, 1, '150px'),
(11, 'series', 'Series', 'basic', true, true, 2, '120px'),
(11, 'part_number', 'Part Number', 'basic', true, true, 3, '150px'),
(11, 'resolution', 'Resolution', 'specification', true, true, 4, '100px'),
(11, 'number_of_line', 'No. of Line', 'specification', true, true, 5, '100px'),
(11, 'line_rate', 'Line Rate', 'specification', true, true, 6, '100px'),
(11, 'pixel_size', 'Pixel Size', 'specification', true, true, 7, '100px'),
(11, 'interface', 'Interface', 'specification', true, false, 8, '120px'),
(11, 'spectrum', 'Spectrum', 'specification', true, false, 9, '100px'),
(11, 'dynamic_range', 'Dynamic Range', 'specification', true, true, 10, '120px'),
(11, 'mount', 'Mount', 'specification', true, false, 11, '100px');

-- 4. Area Camera - Category ID: 12
-- ===============================================

-- Table column configs for Area
INSERT INTO table_column_configs (category_id, column_name, column_label, column_type, is_visible, is_sortable, sort_order, column_width) VALUES
(12, 'maker_name', 'Maker', 'basic', true, true, 1, '150px'),
(12, 'series', 'Series', 'basic', true, true, 2, '120px'),
(12, 'part_number', 'Part Number', 'basic', true, true, 3, '150px'),
(12, 'mega_pixel', 'Mega Pixel', 'specification', true, true, 4, '100px'),
(12, 'resolution', 'Resolution', 'specification', true, true, 5, '120px'),
(12, 'sensor_model', 'Sensor', 'specification', true, false, 6, '150px'),
(12, 'frame_rate', 'Frame Rate', 'specification', true, true, 7, '100px'),
(12, 'pixel_size', 'Pixel Size', 'specification', true, true, 8, '100px'),
(12, 'image_circle', 'Image Circle', 'specification', true, true, 9, '100px'),
(12, 'interface', 'Interface', 'specification', true, false, 10, '120px'),
(12, 'spectrum', 'Spectrum', 'specification', true, false, 11, '100px'),
(12, 'dynamic_range', 'Dynamic Range', 'specification', true, true, 12, '120px'),
(12, 'mount', 'Mount', 'specification', true, false, 13, '100px');

-- 5. Invisible (SWIR) - Category ID: 13
-- ===============================================

-- Table column configs for Invisible
INSERT INTO table_column_configs (category_id, column_name, column_label, column_type, is_visible, is_sortable, sort_order, column_width) VALUES
(13, 'maker_name', 'Maker', 'basic', true, true, 1, '150px'),
(13, 'series', 'Series', 'basic', true, true, 2, '120px'),
(13, 'part_number', 'Part Number', 'basic', true, true, 3, '150px'),
(13, 'type', 'Type', 'specification', true, false, 4, '100px'),
(13, 'mega_pixel', 'Mega Pixel', 'specification', true, true, 5, '100px'),
(13, 'resolution', 'Resolution', 'specification', true, true, 6, '120px'),
(13, 'pixel_size', 'Pixel Size', 'specification', true, true, 7, '100px'),
(13, 'spectrum', 'Spectrum', 'specification', true, false, 8, '100px'),
(13, 'dynamic_range', 'Dynamic Range', 'specification', true, true, 9, '120px'),
(13, 'sensor_model', 'Sensor', 'specification', true, false, 10, '150px'),
(13, 'frame_rate', 'Frame Rate', 'specification', true, true, 11, '100px'),
(13, 'interface', 'Interface', 'specification', true, false, 12, '120px'),
(13, 'mount', 'Mount', 'specification', true, false, 13, '100px');

-- 6. Scientific Camera - Category ID: 14
-- ===============================================

-- Table column configs for Scientific
INSERT INTO table_column_configs (category_id, column_name, column_label, column_type, is_visible, is_sortable, sort_order, column_width) VALUES
(14, 'maker_name', 'Maker', 'basic', true, true, 1, '200px'),
(14, 'series', 'Series', 'basic', true, true, 2, '120px'),
(14, 'part_number', 'Part Number', 'basic', true, true, 3, '150px'),
(14, 'mega_pixel', 'Mega Pixel', 'specification', true, true, 4, '100px'),
(14, 'resolution', 'Resolution', 'specification', true, true, 5, '120px'),
(14, 'pixel_size', 'Pixel Size', 'specification', true, true, 6, '100px'),
(14, 'dynamic_range', 'Dynamic Range', 'specification', true, true, 7, '120px'),
(14, 'peak_qe', 'Peak QE', 'specification', true, true, 8, '100px'),
(14, 'sensor_model', 'Sensor', 'specification', true, false, 9, '150px'),
(14, 'frame_rate', 'Frame Rate', 'specification', true, true, 10, '100px'),
(14, 'spectrum', 'Spectrum', 'specification', true, false, 11, '100px'),
(14, 'interface', 'Interface', 'specification', true, false, 12, '120px'),
(14, 'mount', 'Mount', 'specification', true, false, 13, '100px');

-- 7. Large Format Lens - Category ID: 15
-- ===============================================

-- Table column configs for Large Format
INSERT INTO table_column_configs (category_id, column_name, column_label, column_type, is_visible, is_sortable, sort_order, column_width) VALUES
(15, 'maker_name', 'Maker', 'basic', true, true, 1, '150px'),
(15, 'series', 'Series', 'basic', true, true, 2, '120px'),
(15, 'part_number', 'Part Number', 'basic', true, true, 3, '150px'),
(15, 'mag_range', 'Mag Range', 'specification', true, true, 4, '100px'),
(15, 'central_mag', 'Central Mag', 'specification', true, true, 5, '100px'),
(15, 'image_circle', 'Image Circle', 'specification', true, true, 6, '100px'),
(15, 'focal_length', 'Focal Length', 'specification', true, true, 7, '100px'),
(15, 'image_resolution', 'Image Resolution', 'specification', true, true, 8, '120px'),
(15, 'f_number', 'F#', 'specification', true, true, 9, '80px'),
(15, 'coaxial', 'Coaxial', 'specification', true, false, 10, '100px'),
(15, 'mount', 'Mount', 'specification', true, false, 11, '100px');

-- 8. Telecentric Lens - Category ID: 16
-- ===============================================

-- Table column configs for Telecentric
INSERT INTO table_column_configs (category_id, column_name, column_label, column_type, is_visible, is_sortable, sort_order, column_width) VALUES
(16, 'maker_name', 'Maker', 'basic', true, true, 1, '150px'),
(16, 'series', 'Series', 'basic', true, true, 2, '120px'),
(16, 'part_number', 'Part Number', 'basic', true, true, 3, '150px'),
(16, 'mag', 'Mag', 'specification', true, true, 4, '80px'),
(16, 'wd', 'WD', 'specification', true, true, 5, '80px'),
(16, 'na', 'NA', 'specification', true, true, 6, '80px'),
(16, 'f_number', 'F#', 'specification', true, true, 7, '80px'),
(16, 'image_circle', 'Image Circle', 'specification', true, true, 8, '100px'),
(16, 'coaxial', 'Coaxial', 'specification', true, false, 9, '100px'),
(16, 'mount', 'Mount', 'specification', true, false, 10, '100px');

-- 9. FA Lens - Category ID: 17
-- ===============================================

-- Table column configs for FA Lens
INSERT INTO table_column_configs (category_id, column_name, column_label, column_type, is_visible, is_sortable, sort_order, column_width) VALUES
(17, 'maker_name', 'Maker', 'basic', true, true, 1, '150px'),
(17, 'series', 'Series', 'basic', true, true, 2, '120px'),
(17, 'part_number', 'Part Number', 'basic', true, true, 3, '150px'),
(17, 'focal_length', 'Focal Length', 'specification', true, true, 4, '100px'),
(17, 'image_circle', 'Image Circle', 'specification', true, true, 5, '100px'),
(17, 'image_resolution', 'Image Resolution', 'specification', true, true, 6, '120px'),
(17, 'mag_range', 'Mag Range', 'specification', true, true, 7, '100px'),
(17, 'f_number', 'F#', 'specification', true, true, 8, '80px'),
(17, 'mount', 'Mount', 'specification', true, false, 9, '100px');

-- 10. 3D Laser Profiler - Category ID: 18
-- ===============================================

-- Table column configs for 3D Laser Profiler
INSERT INTO table_column_configs (category_id, column_name, column_label, column_type, is_visible, is_sortable, sort_order, column_width) VALUES
(18, 'maker_name', 'Maker', 'basic', true, true, 1, '150px'),
(18, 'series', 'Series', 'basic', true, true, 2, '120px'),
(18, 'part_number', 'Part Number', 'basic', true, true, 3, '150px'),
(18, 'point', 'Point', 'specification', true, true, 4, '100px'),
(18, 'z_range', 'Z-Range', 'specification', true, true, 5, '100px'),
(18, 'z_resolution', 'Z-Res.', 'specification', true, true, 6, '100px'),
(18, 'x_resolution', 'X-Res.', 'specification', true, true, 7, '100px'),
(18, 'fov', 'FOV', 'specification', true, true, 8, '100px'),
(18, 'profile_rate', 'Profile Rate', 'specification', true, true, 9, '120px'),
(18, 'wd', 'WD', 'specification', true, true, 10, '80px'),
(18, 'linearity', 'Linearity', 'specification', true, false, 11, '100px'),
(18, 'laser_option', 'Laser Option', 'specification', true, false, 12, '120px');

-- 11. 3D Stereo Camera - Category ID: 19
-- ===============================================

-- Table column configs for 3D Stereo Camera
INSERT INTO table_column_configs (category_id, column_name, column_label, column_type, is_visible, is_sortable, sort_order, column_width) VALUES
(19, 'maker_name', 'Maker', 'basic', true, true, 1, '150px'),
(19, 'series', 'Series', 'basic', true, true, 2, '120px'),
(19, 'part_number', 'Part Number', 'basic', true, true, 3, '150px'),
(19, 'mega_pixel', 'Mega Pixel', 'specification', true, true, 4, '100px'),
(19, 'pixel_size', 'Pixel Size', 'specification', true, true, 5, '100px'),
(19, 'fov', 'FOV', 'specification', true, true, 6, '100px'),
(19, 'focal_length', 'Focal Length', 'specification', true, true, 7, '100px'),
(19, 'depth_accuracy', 'Depth Accuracy', 'specification', true, false, 8, '120px'),
(19, 'spectrum', 'Spectrum', 'specification', true, false, 9, '100px'),
(19, 'shutter_type', 'Shutter Type', 'specification', true, false, 10, '120px'),
(19, 'interface', 'Interface', 'specification', true, false, 11, '120px');

-- 12. Light - Category ID: 20
-- ===============================================

-- Table column configs for Light
INSERT INTO table_column_configs (category_id, column_name, column_label, column_type, is_visible, is_sortable, sort_order, column_width) VALUES
(20, 'maker_name', 'Maker', 'basic', true, true, 1, '150px'),
(20, 'series', 'Series', 'basic', true, true, 2, '120px'),
(20, 'part_number', 'Part Number', 'basic', true, true, 3, '150px'),
(20, 'color', 'Color', 'specification', true, false, 4, '100px'),
(20, 'wavelength', 'Wavelength', 'specification', true, true, 5, '100px'),
(20, 'power', 'Power', 'specification', true, true, 6, '100px'),
(20, 'controller', 'Controller', 'specification', true, false, 7, '120px'),
(20, 'current', 'Current', 'specification', true, true, 8, '100px'),
(20, 'focal_length', 'Focal Length', 'specification', true, true, 9, '100px');

-- 13. Controller - Category ID: 22
-- ===============================================

-- Table column configs for Controller
INSERT INTO table_column_configs (category_id, column_name, column_label, column_type, is_visible, is_sortable, sort_order, column_width) VALUES
(22, 'maker_name', 'Maker', 'basic', true, true, 1, '150px'),
(22, 'series', 'Series', 'basic', true, true, 2, '120px'),
(22, 'part_number', 'Part Number', 'basic', true, true, 3, '150px'),
(22, 'channel', 'Channels', 'specification', true, true, 4, '100px'),
(22, 'max_continuous_current', 'Max. Continuous Current', 'specification', true, true, 5, '180px'),
(22, 'max_pulse_current', 'Max. Pulse Current', 'specification', true, true, 6, '150px'),
(22, 'min_pulse_width', 'Min. Pulse Width', 'specification', true, true, 7, '150px'),
(22, 'max_frequency', 'Max. Frequency', 'specification', true, true, 8, '120px'),
(22, 'led_voltage_range', 'LED Voltage Range', 'specification', true, true, 9, '150px'),
(22, 'max_power_output_total', 'Max. Power Output Total', 'specification', true, true, 10, '180px');

-- 14. Frame Grabber - Category ID: 23
-- ===============================================

-- Table column configs for Frame Grabber
INSERT INTO table_column_configs (category_id, column_name, column_label, column_type, is_visible, is_sortable, sort_order, column_width) VALUES
(23, 'maker_name', 'Maker', 'basic', true, true, 1, '150px'),
(23, 'series', 'Series', 'basic', true, true, 2, '120px'),
(23, 'part_number', 'Part Number', 'basic', true, true, 3, '150px'),
(23, 'model', 'Model', 'specification', true, false, 4, '120px'),
(23, 'pc_slot', 'PC Slot', 'specification', true, false, 5, '100px'),
(23, 'max_pixel_clock', 'Max Pixel Clock', 'specification', true, true, 6, '150px'),
(23, 'acquisition_rate', 'Acquisition Rate', 'specification', true, true, 7, '150px'),
(23, 'onboard_memory', 'Onboard Memory', 'specification', true, false, 8, '150px'),
(23, 'input', 'Input', 'specification', true, false, 9, '100px');

-- 15. GigE LAN Card - Category ID: 24
-- ===============================================

-- Table column configs for GigE LAN Card
INSERT INTO table_column_configs (category_id, column_name, column_label, column_type, is_visible, is_sortable, sort_order, column_width) VALUES
(24, 'maker_name', 'Maker', 'basic', true, true, 1, '150px'),
(24, 'series', 'Series', 'basic', true, true, 2, '120px'),
(24, 'part_number', 'Part Number', 'basic', true, true, 3, '150px'),
(24, 'chipset', 'Chipset', 'specification', true, false, 4, '120px'),
(24, 'interface', 'Interface', 'specification', true, false, 5, '100px'),
(24, 'pc_slot', 'PC Slot', 'specification', true, false, 6, '100px'),
(24, 'port', 'Port', 'specification', true, true, 7, '80px'),
(24, 'connector', 'Connector', 'specification', true, false, 8, '100px'),
(24, 'poe', 'PoE', 'specification', true, false, 9, '80px');

-- 16. USB Card - Category ID: 25
-- ===============================================

-- Table column configs for USB Card
INSERT INTO table_column_configs (category_id, column_name, column_label, column_type, is_visible, is_sortable, sort_order, column_width) VALUES
(25, 'maker_name', 'Maker', 'basic', true, true, 1, '150px'),
(25, 'series', 'Series', 'basic', true, true, 2, '120px'),
(25, 'part_number', 'Part Number', 'basic', true, true, 3, '150px'),
(25, 'chipset', 'Chipset', 'specification', true, false, 4, '120px'),
(25, 'interface', 'Interface', 'specification', true, false, 5, '100px'),
(25, 'pc_slot', 'PC Slot', 'specification', true, false, 6, '100px'),
(25, 'port', 'Port', 'specification', true, true, 7, '80px'),
(25, 'connector', 'Connector', 'specification', true, false, 8, '100px'),
(25, 'trans_speed', 'Transfer Speed', 'specification', true, true, 9, '120px');

-- 17. Cable - Category ID: 26
-- ===============================================

-- Table column configs for Cable
INSERT INTO table_column_configs (category_id, column_name, column_label, column_type, is_visible, is_sortable, sort_order, column_width) VALUES
(26, 'maker_name', 'Maker', 'basic', true, true, 1, '150px'),
(26, 'series', 'Series', 'basic', true, true, 2, '120px'),
(26, 'part_number', 'Part Number', 'basic', true, true, 3, '150px'),
(26, 'description', 'Description', 'specification', true, false, 4, '300px');

-- 18. Accessory - Category ID: 27
-- ===============================================

-- Table column configs for Accessory
INSERT INTO table_column_configs (category_id, column_name, column_label, column_type, is_visible, is_sortable, sort_order, column_width) VALUES
(27, 'maker_name', 'Maker', 'basic', true, true, 1, '150px'),
(27, 'series', 'Series', 'basic', true, true, 2, '120px'),
(27, 'part_number', 'Part Number', 'basic', true, true, 3, '150px'),
(27, 'description', 'Description', 'specification', true, false, 4, '300px');

-- 19. Auto Focus Module - Category ID: 4
-- ===============================================

-- Table column configs for Auto Focus Module
INSERT INTO table_column_configs (category_id, column_name, column_label, column_type, is_visible, is_sortable, sort_order, column_width) VALUES
(4, 'maker_name', 'Maker', 'basic', true, true, 1, '150px'),
(4, 'series', 'Series', 'basic', true, true, 2, '120px'),
(4, 'part_number', 'Part Number', 'basic', true, true, 3, '150px'),
(4, 'description', 'Description', 'specification', true, false, 4, '200px'),
(4, 'sensing_type', 'Sensing Type', 'specification', true, false, 5, '120px'),
(4, 'sampling_rate', 'Sampling Rate', 'specification', true, true, 6, '120px'),
(4, 'capture_range', 'Capture Range', 'specification', true, true, 7, '120px'),
(4, 'laser_wavelength', 'Laser', 'specification', true, true, 8, '100px'),
(4, 'interface', 'Interface', 'specification', true, false, 9, '120px'),
(4, 'stroke', 'Stroke', 'specification', true, true, 10, '100px'),
(4, 'resolution', 'Resolution', 'specification', true, true, 11, '100px'),
(4, 'linearity_error', 'Linearity Error', 'specification', true, true, 12, '130px'),
(4, 'repeatability', 'Repeatability', 'specification', true, true, 13, '120px');

-- 20. Software - Category ID: 7
-- ===============================================

-- Table column configs for Software
INSERT INTO table_column_configs (category_id, column_name, column_label, column_type, is_visible, is_sortable, sort_order, column_width) VALUES
(7, 'maker_name', 'Maker', 'basic', true, true, 1, '150px'),
(7, 'part_number', 'Part Number', 'basic', true, true, 2, '150px'),
(7, 'type', 'Type', 'specification', true, false, 3, '120px'),
(7, 'description', 'Description', 'specification', true, false, 4, '300px'),
(7, 'device', 'Device', 'specification', true, false, 5, '150px');

-- ===============================================
-- 마이그레이션 완료 확인 쿼리
-- ===============================================

-- 각 카테고리별 컬럼 개수 확인
SELECT 
    c.name as category_name,
    COUNT(tcc.id) as column_count,
    COUNT(CASE WHEN tcc.column_type = 'basic' THEN 1 END) as basic_columns,
    COUNT(CASE WHEN tcc.column_type = 'specification' THEN 1 END) as spec_columns,
    COUNT(CASE WHEN tcc.is_visible = true THEN 1 END) as visible_columns,
    COUNT(CASE WHEN tcc.is_sortable = true THEN 1 END) as sortable_columns
FROM categories c
LEFT JOIN table_column_configs tcc ON c.id = tcc.category_id
WHERE c.id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27)
GROUP BY c.id, c.name
ORDER BY c.id;

-- 카테고리별 컬럼 목록 확인
SELECT 
    c.name as category_name,
    tcc.column_name,
    tcc.column_label,
    tcc.column_type,
    tcc.is_visible,
    tcc.is_sortable,
    tcc.sort_order,
    tcc.column_width
FROM categories c
JOIN table_column_configs tcc ON c.id = tcc.category_id
WHERE c.id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27)
ORDER BY c.id, tcc.sort_order;

-- 전체 마이그레이션 요약
SELECT 
    'Filter Configs' as table_name,
    COUNT(*) as total_records
FROM filter_configs
WHERE category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27)

UNION ALL

SELECT 
    'Filter Options' as table_name,
    COUNT(*) as total_records
FROM filter_options fo
JOIN filter_configs fc ON fo.filter_config_id = fc.id
WHERE fc.category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27)

UNION ALL

SELECT 
    'Filter Slider Configs' as table_name,
    COUNT(*) as total_records
FROM filter_slider_configs fsc
JOIN filter_configs fc ON fsc.filter_config_id = fc.id
WHERE fc.category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27)

UNION ALL

SELECT 
    'Table Column Configs' as table_name,
    COUNT(*) as total_records
FROM table_column_configs
WHERE category_id IN (4, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27);