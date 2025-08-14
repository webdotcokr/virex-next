// 제품 테이블 컬럼 설정

export interface ColumnConfig {
  column_name: string
  column_label: string
  is_sortable: boolean
  column_width?: string | null
  unit?: string
}

// 카테고리별 컬럼 설정 (category_id 기반)
export const PRODUCT_COLUMN_CONFIGS: Record<number, ColumnConfig[]> = {
  // CIS (Contact Image Sensor) - category_id: 9
  9: [
    { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
    { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
    { column_name: 'scan_width', column_label: 'Scan Width', is_sortable: true, column_width: '100px', unit: 'mm' },
    { column_name: 'dpi', column_label: 'DPI', is_sortable: true, column_width: '80px', unit: 'dpi' },
    { column_name: 'resolution', column_label: 'Resolution', is_sortable: true, column_width: '100px', unit: 'μm' },
    { column_name: 'line_rate', column_label: 'Line Rate', is_sortable: true, column_width: '90px', unit: 'kHz' },
    { column_name: 'speed', column_label: 'Speed', is_sortable: true, column_width: '80px', unit: 'mm/s' },
    { column_name: 'wd', column_label: 'WD', is_sortable: true, column_width: '70px', unit: 'mm' },
    { column_name: 'no_of_pixels', column_label: 'No. of Pixels', is_sortable: true, column_width: '110px' },
    { column_name: 'spectrum', column_label: 'Spectrum', is_sortable: true, column_width: '90px' },
    { column_name: 'interface', column_label: 'Interface', is_sortable: true, column_width: '100px' },
    { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
  ],
  
  // TDI (Time Delay Integration) - category_id: 10  
  10: [
    { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
    { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
    { column_name: 'resolution', column_label: 'Resolution', is_sortable: true, column_width: '100px' },
    { column_name: 'number_of_line', column_label: 'No. of Line', is_sortable: true, column_width: '120px' },
    { column_name: 'line_rate', column_label: 'Line Rate', is_sortable: true, column_width: '90px', unit: 'kHz' },
    { column_name: 'pixel_size', column_label: 'Pixel Size', is_sortable: true, column_width: '90px', unit: 'μm' },
    { column_name: 'interface', column_label: 'Interface', is_sortable: true, column_width: '100px' },
    { column_name: 'spectrum', column_label: 'Spectrum', is_sortable: true, column_width: '90px' },
    { column_name: 'dynamic_range', column_label: 'Dynamic Range', is_sortable: true, column_width: '110px', unit: 'dB' },
    { column_name: 'mount', column_label: 'Mount', is_sortable: true, column_width: '80px' },
    { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
  ],

  // Line Scan Camera - category_id: 11
  11: [
    { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
    { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
    { column_name: 'resolution', column_label: 'Resolution', is_sortable: true, column_width: '100px' },
    { column_name: 'number_of_line', column_label: 'No. of Line', is_sortable: true, column_width: '120px' },
    { column_name: 'line_rate', column_label: 'Line Rate', is_sortable: true, column_width: '90px', unit: 'kHz' },
    // { column_name: 'line_rate_turbo', column_label: 'Line Rate Turbo', is_sortable: true, column_width: '130px', unit: 'kHz' },
    { column_name: 'pixel_size', column_label: 'Pixel Size', is_sortable: true, column_width: '90px', unit: 'μm' },
    { column_name: 'interface', column_label: 'Interface', is_sortable: true, column_width: '100px' },
    { column_name: 'spectrum', column_label: 'Spectrum', is_sortable: true, column_width: '90px' },
    { column_name: 'dynamic_range', column_label: 'Dynamic Range', is_sortable: true, column_width: '110px', unit: 'dB' },
    { column_name: 'mount', column_label: 'Mount', is_sortable: true, column_width: '80px' },
    { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
  ],

  // Area Scan Camera - category_id: 12
  12: [
    { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
    { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
    { column_name: 'mega_pixel', column_label: 'Mega Pixel', is_sortable: true, column_width: '100px', unit: 'MP' },
    { column_name: 'resolution', column_label: 'Resolution', is_sortable: true, column_width: '120px' },
    { column_name: 'sensor_model', column_label: 'Sensor', is_sortable: true, column_width: '120px' },
    { column_name: 'frame_rate', column_label: 'Frame Rate', is_sortable: true, column_width: '90px', unit: 'fps' },
    { column_name: 'pixel_size', column_label: 'Pixel Size', is_sortable: true, column_width: '90px', unit: 'μm' },
    { column_name: 'image_circle', column_label: 'Image Circle', is_sortable: true, column_width: '100px' },
    { column_name: 'interface', column_label: 'Interface', is_sortable: true, column_width: '100px' },
    { column_name: 'spectrum', column_label: 'Spectrum', is_sortable: true, column_width: '90px' },
    { column_name: 'dynamic_range', column_label: 'Dynamic Range', is_sortable: true, column_width: '110px', unit: 'dB' },
    { column_name: 'mount', column_label: 'Mount', is_sortable: true, column_width: '80px' },
    { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
  ],

  // Invisible Light Camera - category_id: 13
  13: [
    { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
    { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
    { column_name: 'type', column_label: 'Type', is_sortable: true, column_width: '80px' },
    { column_name: 'mega_pixel', column_label: 'Mega Pixel', is_sortable: true, column_width: '100px', unit: 'MP' },
    { column_name: 'resolution', column_label: 'Resolution', is_sortable: true, column_width: '120px' },
    { column_name: 'pixel_size', column_label: 'Pixel Size', is_sortable: true, column_width: '90px', unit: 'μm' },
    { column_name: 'spectrum', column_label: 'Spectrum', is_sortable: true, column_width: '90px' },
    { column_name: 'dynamic_range', column_label: 'Dynamic Range', is_sortable: true, column_width: '110px', unit: 'dB' },
    { column_name: 'sensor_model', column_label: 'Sensor', is_sortable: true, column_width: '120px' },
    { column_name: 'frame_rate', column_label: 'Frame Rate', is_sortable: true, column_width: '90px', unit: 'fps/kHz' },
    { column_name: 'interface', column_label: 'Interface', is_sortable: true, column_width: '100px' },
    { column_name: 'mount', column_label: 'Mount', is_sortable: true, column_width: '80px' },
    // { column_name: 'image_circle', column_label: 'Image Circle', is_sortable: true, column_width: '100px', unit: 'mm' },
    { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
  ],

  // Scientific Camera - category_id: 14
  14: [
    { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
    { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
    { column_name: 'mega_pixel', column_label: 'Mega Pixel', is_sortable: true, column_width: '100px', unit: 'MP' },
    { column_name: 'resolution', column_label: 'Resolution', is_sortable: true, column_width: '120px' },
    { column_name: 'pixel_size', column_label: 'Pixel Size', is_sortable: true, column_width: '90px', unit: 'μm' },
    { column_name: 'dynamic_range', column_label: 'Dynamic Range', is_sortable: true, column_width: '110px', unit: 'dB' },
    { column_name: 'peak_qe', column_label: 'Peak QE', is_sortable: true, column_width: '80px' },
    { column_name: 'sensor_model', column_label: 'Sensor', is_sortable: true, column_width: '120px' },
    { column_name: 'frame_rate', column_label: 'Frame Rate', is_sortable: true, column_width: '90px', unit: 'fps' },
    { column_name: 'spectrum', column_label: 'Spectrum', is_sortable: true, column_width: '90px' },
    { column_name: 'interface', column_label: 'Interface', is_sortable: true, column_width: '100px' },
    { column_name: 'mount', column_label: 'Mount', is_sortable: true, column_width: '80px' },
    { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
  ],
  
    // Large Format Lens - category_id: 16 (실제 테이블: products_large_format_lens)
  15: [
    { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
    { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
    { column_name: 'mag_range', column_label: 'Mag Range', is_sortable: true, column_width: '100px', unit: 'x' },
    { column_name: 'central_mag', column_label: 'Central Mag', is_sortable: true, column_width: '100px', unit: 'x' },
    { column_name: 'image_circle', column_label: 'Image Circle', is_sortable: true, column_width: '100px', unit: 'φ/mm' },
    { column_name: 'focal_length', column_label: 'Focal Length', is_sortable: true, column_width: '100px', unit: 'mm' },
    { column_name: 'image_resolution', column_label: 'Image Resolution', is_sortable: true, column_width: '120px', unit: 'μm' },
    { column_name: 'f_number', column_label: 'F#', is_sortable: true, column_width: '70px' },
    { column_name: 'coaxial', column_label: 'Coaxial', is_sortable: true, column_width: '80px' },
    { column_name: 'mount', column_label: 'Mount', is_sortable: true, column_width: '80px' },
    { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
  ],


  // Telecentric Lens - category_id: 16
  16: [
    { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
    { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
    { column_name: 'mag', column_label: 'Mag', is_sortable: true, column_width: '110px', unit: 'x' },
    { column_name: 'wd', column_label: 'WD', is_sortable: true, column_width: '80px', unit: 'mm' },
    { column_name: 'na', column_label: 'NA', is_sortable: true, column_width: '70px' },
    { column_name: 'f_number', column_label: 'F#', is_sortable: true, column_width: '70px' },
    { column_name: 'image_circle', column_label: 'Image Circle', is_sortable: true, column_width: '100px', unit: 'mm' },
    { column_name: 'coaxial', column_label: 'Coaxial', is_sortable: true, column_width: '80px' },
    { column_name: 'mount', column_label: 'Mount', is_sortable: true, column_width: '80px' },
    { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
  ],

  // FA Lens - category_id: 17 (실제 테이블: products_fa_lens)
  17: [
    { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
    { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
    { column_name: 'focal_length', column_label: 'Focal Length', is_sortable: true, column_width: '100px', unit: 'mm' },
    { column_name: 'image_circle', column_label: 'Image Circle', is_sortable: true, column_width: '100px', unit: 'φ/mm' },
    { column_name: 'image_resolution', column_label: 'Image Resolution', is_sortable: true, column_width: '120px', unit: 'μm' },
    { column_name: 'mag_range', column_label: 'Mag Range', is_sortable: true, column_width: '100px', unit: 'x' },
    { column_name: 'f_number', column_label: 'F#', is_sortable: true, column_width: '70px' },
    { column_name: 'mount', column_label: 'Mount', is_sortable: true, column_width: '80px' },
    { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
  ],

  // Frame Grabber - category_id: 23
  23: [
    { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
    { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
    { column_name: 'model', column_label: 'Model', is_sortable: true, column_width: '120px' },
    { column_name: 'interface', column_label: 'Interface', is_sortable: true, column_width: '100px' },
    { column_name: 'pc_slot', column_label: 'PC Slot', is_sortable: true, column_width: '80px' },
    { column_name: 'acquisition_rate', column_label: 'Acquisition Rate', is_sortable: true, column_width: '120px', unit: 'GB/s' },
    { column_name: 'onboard_memory', column_label: 'On-board Memory', is_sortable: true, column_width: '120px', unit: 'MB' },
    { column_name: 'input', column_label: 'Input', is_sortable: true, column_width: '80px' },
    // { column_name: 'cables', column_label: 'Cables', is_sortable: true, column_width: '80px' },
    { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
  ],

  // Light - category_id: 20
  20: [
    { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
    { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
    { column_name: 'color', column_label: 'Color', is_sortable: true, column_width: '80px' },
    { column_name: 'wavelength', column_label: 'Wavelength', is_sortable: true, column_width: '100px' },
    { column_name: 'power', column_label: 'Power', is_sortable: true, column_width: '80px' },
    { column_name: 'controller', column_label: 'Controller', is_sortable: true, column_width: '100px' },
    { column_name: 'current', column_label: 'Current', is_sortable: true, column_width: '80px' },
    { column_name: 'focal_length', column_label: 'Focal Length', is_sortable: true, column_width: '100px' },
    { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
  ],

  // Controller - category_id: 22
  22: [
    { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
    { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
    { column_name: 'channel', column_label: 'Channel', is_sortable: true, column_width: '80px' },
    { column_name: 'max_continuous_current', column_label: 'Max Continuous Current', is_sortable: true, column_width: '150px', unit: 'A' },
    { column_name: 'max_pulse_current', column_label: 'Max Pulse Current', is_sortable: true, column_width: '130px', unit: 'A' },
    { column_name: 'led_voltage_range', column_label: 'LED Voltage Range', is_sortable: true, column_width: '130px', unit: 'V' },
    { column_name: 'min_pulse_width', column_label: 'Min Pulse Width', is_sortable: true, column_width: '120px', unit: 'μs' },
    { column_name: 'max_frequency', column_label: 'Max Frequency', is_sortable: true, column_width: '110px', unit: 'kHz' },
    { column_name: 'max_power_output_total', column_label: 'Max Power Output Total', is_sortable: true, column_width: '160px', unit: 'W' },
    { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
  ],

  // 3D Laser Profiler - category_id: 18
  18: [
    { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
    { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
    { column_name: 'point', column_label: 'Point', is_sortable: true, column_width: '80px' },
    { column_name: 'z_range', column_label: 'Z Range', is_sortable: true, column_width: '90px', unit: 'mm' },
    { column_name: 'z_resolution', column_label: 'Z Resolution', is_sortable: true, column_width: '100px', unit: 'μm' },
    { column_name: 'x_resolution', column_label: 'X Resolution', is_sortable: true, column_width: '100px', unit: 'μm' },
    { column_name: 'fov', column_label: 'FOV', is_sortable: true, column_width: '80px', unit: 'mm' },
    { column_name: 'profile_rate', column_label: 'Profile Rate', is_sortable: true, column_width: '100px', unit: 'Profiles/sec' },
    { column_name: 'wd', column_label: 'WD', is_sortable: true, column_width: '70px', unit: 'mm' },
    { column_name: 'linearity', column_label: 'Linearity', is_sortable: true, column_width: '90px' },
    { column_name: 'laser_option', column_label: 'Laser Option', is_sortable: true, column_width: '100px' },
    { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
  ],

  // 3D Stereo Camera - category_id: 19
  19: [
    { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
    { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
    { column_name: 'mega_pixel', column_label: 'Mega Pixel', is_sortable: true, column_width: '100px', unit: 'MP' },
    { column_name: 'pixel_size', column_label: 'Pixel Size', is_sortable: true, column_width: '90px', unit: 'μm' },
    { column_name: 'fov', column_label: 'FOV', is_sortable: true, column_width: '80px'  },
    { column_name: 'focal_length', column_label: 'Focal Length', is_sortable: true, column_width: '100px', unit: 'mm' },
    { column_name: 'depth_accuracy', column_label: 'Depth Accuracy', is_sortable: true, column_width: '110px' },
    { column_name: 'spectrum', column_label: 'Spectrum', is_sortable: true, column_width: '90px' },
    { column_name: 'shutter_type', column_label: 'Shutter Type', is_sortable: true, column_width: '100px' },
    { column_name: 'interface', column_label: 'Interface', is_sortable: true, column_width: '100px' },
    { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
  ],

  // Software - category_id: 7
  7: [
    { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
    { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
    { column_name: 'type', column_label: 'Type', is_sortable: true, column_width: '120px' },
    { column_name: 'description', column_label: 'Description', is_sortable: true, column_width: '200px' },
    { column_name: 'device', column_label: 'Device', is_sortable: true, column_width: '120px' },
    { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
  ],

  // Cable - category_id: 26
  26: [
    { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
    { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
    { column_name: 'description', column_label: 'Description', is_sortable: true, column_width: '250px' },
    { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
  ],

  // Accessory - category_id: 27
  27: [
    { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
    { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
    { column_name: 'description', column_label: 'Description', is_sortable: true, column_width: '250px' },
    { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
  ],

  // Autofocus Module - category_id: 4
  4: [
    { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
    { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
    { column_name: 'description', column_label: 'Description', is_sortable: true, column_width: '200px' },
    { column_name: 'sensing_type', column_label: 'Sensing Type', is_sortable: true, column_width: '120px' },
    { column_name: 'sampling_rate', column_label: 'Sampling Rate', is_sortable: true, column_width: '120px', unit: 'Hz' },
    { column_name: 'capture_range', column_label: 'Capture Range', is_sortable: true, column_width: '120px', unit: 'mm' },
    { column_name: 'laser_wavelength', column_label: 'Laser', is_sortable: true, column_width: '130px', unit: 'nm' },
    { column_name: 'interface', column_label: 'Interface', is_sortable: true, column_width: '100px' },
    { column_name: 'stroke', column_label: 'Stroke', is_sortable: true, column_width: '80px', unit: 'mm' },
    { column_name: 'resolution', column_label: 'Resolution', is_sortable: true, column_width: '100px', unit: 'μm' },
    { column_name: 'linearity_error', column_label: 'Linearity Error', is_sortable: true, column_width: '120px' },
    { column_name: 'repeatability', column_label: 'Repeatability', is_sortable: true, column_width: '110px' },
    { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
  ],

  // GigE LAN Card - category_id: 24
  24: [
    { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
    { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
    { column_name: 'port', column_label: 'Port', is_sortable: true, column_width: '70px' },
    { column_name: 'chipset', column_label: 'Chipset', is_sortable: true, column_width: '120px' },
    { column_name: 'pcle', column_label: 'PCIe', is_sortable: true, column_width: '80px' },
    { column_name: 'connector', column_label: 'Connector', is_sortable: true, column_width: '100px' },
    { column_name: 'poe', column_label: 'PoE', is_sortable: true, column_width: '70px' },
    { column_name: 'interface', column_label: 'Interface', is_sortable: true, column_width: '100px' },
    { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
  ],

  // USB Card - category_id: 25
  25: [
    { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
    { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
    { column_name: 'port', column_label: 'Port', is_sortable: true, column_width: '70px' },
    { column_name: 'trans_speed', column_label: 'Transfer Speed', is_sortable: true, column_width: '120px', unit: 'GB/s' },
    { column_name: 'chipset', column_label: 'Chipset', is_sortable: true, column_width: '120px' },
    { column_name: 'pcle', column_label: 'PCIe', is_sortable: true, column_width: '80px' },
    { column_name: 'connector', column_label: 'Connector', is_sortable: true, column_width: '100px' },
    { column_name: 'interface', column_label: 'Interface', is_sortable: true, column_width: '100px' },
    { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
  ],
}

// 기본 컬럼 설정 (설정이 없는 카테고리용)
export const DEFAULT_COLUMN_CONFIG: ColumnConfig[] = [
  { column_name: 'series', column_label: 'Series', is_sortable: true, column_width: '120px' },
  { column_name: 'part_number', column_label: 'Part Number', is_sortable: true, column_width: '150px' },
  { column_name: 'maker', column_label: 'Maker', is_sortable: true, column_width: '100px' },
]

// 카테고리ID로 컬럼 설정 가져오기
export function getColumnConfigForCategory(categoryId?: number): ColumnConfig[] {
  if (!categoryId) return DEFAULT_COLUMN_CONFIG
  return PRODUCT_COLUMN_CONFIGS[categoryId] || DEFAULT_COLUMN_CONFIG
}

/**
 * 값과 컬럼 설정을 받아 단위가 포함된 문자열로 포맷팅
 * @param value - 원본 값
 * @param columnConfig - 컬럼 설정 (단위 정보 포함)
 * @returns 단위가 포함된 포맷팅된 문자열
 */
export function formatColumnValue(value: any, columnConfig: ColumnConfig): string {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  const unit = columnConfig.unit || ''
  
  if (typeof value === 'number') {
    const formatted = value.toLocaleString('ko-KR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
    return unit ? `${formatted} ${unit}` : formatted
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  
  const stringValue = String(value)
  return unit ? `${stringValue} ${unit}` : stringValue
}