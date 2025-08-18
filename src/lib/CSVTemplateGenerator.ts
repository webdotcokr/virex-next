/**
 * CSV Template Generator for Products
 * Generates category-specific CSV templates with appropriate specification columns
 */

interface SpecificationField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean';
  required?: boolean;
  unit?: string;
  description?: string;
}

interface CategoryTemplate {
  categoryName: string;
  baseColumns: string[];
  specificationFields: SpecificationField[];
}

export class CSVTemplateGenerator {
  private static readonly BASE_COLUMNS = [
    'part_number',
    'category_name', 
    'maker_name',
    'series_name',
    'is_active',
    'is_new',
    'image_url'
  ];

  private static readonly CATEGORY_TEMPLATES: Record<string, SpecificationField[]> = {
    // 카메라 카테고리
    // CIS (Contact Image Sensor)
    'cis': [
      { key: 'scan_width', label: 'Scan Width', type: 'number', unit: 'mm', required: true },
      { key: 'dpi', label: 'DPI', type: 'number', required: true },
      { key: 'resolution', label: 'Resolution', type: 'number', unit: 'mm', required: true },
      { key: 'line_rate', label: 'Line Rate', type: 'number', unit: 'kHz' },
      { key: 'speed', label: 'Speed', type: 'number' },
      { key: 'wd', label: 'Working Distance', type: 'number', unit: 'mm' },
      { key: 'no_of_pixels', label: 'Number of Pixels', type: 'number' },
      { key: 'spectrum', label: 'Spectrum', type: 'string' },
      { key: 'interface', label: 'Interface', type: 'string' },
    ],

    // TDI (Time Delay Integration)
    'tdi': [
      { key: 'resolution', label: 'Resolution', type: 'string', required: true },
      { key: 'number_of_line', label: 'Number of Line', type: 'number', required: true },
      { key: 'line_rate', label: 'Line Rate', type: 'number', unit: 'kHz', required: true },
      { key: 'pixel_size', label: 'Pixel Size', type: 'number', unit: 'μm' },
      { key: 'interface', label: 'Interface', type: 'string' },
      { key: 'spectrum', label: 'Spectrum', type: 'string' },
      { key: 'dynamic_range', label: 'Dynamic Range', type: 'string' },
      { key: 'mount', label: 'Mount', type: 'string' },
    ],

    // Line Scan Camera
    'line': [
      { key: 'resolution', label: 'Resolution', type: 'string', required: true },
      { key: 'number_of_line', label: 'Number of Line', type: 'number' },
      { key: 'line_rate', label: 'Line Rate', type: 'number', unit: 'kHz', required: true },
      { key: 'line_rate_turbo', label: 'Line Rate Turbo', type: 'number', unit: 'kHz' },
      { key: 'pixel_size', label: 'Pixel Size', type: 'number', unit: 'μm', required: true },
      { key: 'interface', label: 'Interface', type: 'string' },
      { key: 'spectrum', label: 'Spectrum', type: 'string' },
      { key: 'dynamic_range', label: 'Dynamic Range', type: 'string' },
      { key: 'mount', label: 'Mount', type: 'string' },
    ],

    // Area Scan Camera
    'area': [
      { key: 'mega_pixel', label: 'Mega Pixel', type: 'number', unit: 'MP', required: true },
      { key: 'resolution', label: 'Resolution', type: 'string', required: true },
      { key: 'sensor_model', label: 'Sensor Model', type: 'string' },
      { key: 'frame_rate', label: 'Frame Rate', type: 'number', unit: 'fps', required: true },
      { key: 'pixel_size', label: 'Pixel Size', type: 'number', unit: 'μm' },
      { key: 'image_circle', label: 'Image Circle', type: 'string' },
      { key: 'interface', label: 'Interface', type: 'string' },
      { key: 'spectrum', label: 'Spectrum', type: 'string' },
      { key: 'dynamic_range', label: 'Dynamic Range', type: 'string' },
      { key: 'mount', label: 'Mount', type: 'string' },
    ],

    // Invisible Camera
    'invisible': [
      { key: 'type', label: 'Type', type: 'string', required: true },
      { key: 'mega_pixel', label: 'Mega Pixel', type: 'number', unit: 'MP' },
      { key: 'resolution', label: 'Resolution', type: 'string', required: true },
      { key: 'pixel_size', label: 'Pixel Size', type: 'number', unit: 'μm' },
      { key: 'spectrum', label: 'Spectrum', type: 'string', required: true },
      { key: 'dynamic_range', label: 'Dynamic Range', type: 'string' },
      { key: 'sensor_model', label: 'Sensor Model', type: 'string' },
      { key: 'frame_rate', label: 'Frame Rate', type: 'number', unit: 'fps' },
      { key: 'interface', label: 'Interface', type: 'string' },
      { key: 'mount', label: 'Mount', type: 'string' },
      { key: 'image_circle', label: 'Image Circle', type: 'string' },
      { key: 'number_of_line', label: 'Number of Line', type: 'number' },
    ],

    // Scientific Camera
    'scientific': [
      { key: 'mega_pixel', label: 'Mega Pixel', type: 'number', unit: 'MP', required: true },
      { key: 'resolution', label: 'Resolution', type: 'string', required: true },
      { key: 'pixel_size', label: 'Pixel Size', type: 'number', unit: 'μm', required: true },
      { key: 'dynamic_range', label: 'Dynamic Range', type: 'string' },
      { key: 'peak_qe', label: 'Peak QE', type: 'string' },
      { key: 'sensor_model', label: 'Sensor Model', type: 'string' },
      { key: 'frame_rate', label: 'Frame Rate', type: 'number', unit: 'fps' },
      { key: 'spectrum', label: 'Spectrum', type: 'string' },
      { key: 'interface', label: 'Interface', type: 'string' },
      { key: 'mount', label: 'Mount', type: 'string' },
    ],

    // 렌즈 카테고리
    // Large Format Lens
    'large format': [
      { key: 'mag_range', label: 'Magnification Range', type: 'string', required: true },
      { key: 'central_mag', label: 'Central Magnification', type: 'string' },
      { key: 'image_circle', label: 'Image Circle', type: 'string' },
      { key: 'focal_length', label: 'Focal Length', type: 'string' },
      { key: 'image_resolution', label: 'Image Resolution', type: 'string' },
      { key: 'f_number', label: 'F Number', type: 'string' },
      { key: 'coaxial', label: 'Coaxial', type: 'string' },
      { key: 'mount', label: 'Mount', type: 'string' },
    ],

    // Telecentric Lens
    'telecentric': [
      { key: 'mag', label: 'Magnification', type: 'string', required: true },
      { key: 'wd', label: 'Working Distance', type: 'number', unit: 'mm', required: true },
      { key: 'na', label: 'NA', type: 'string' },
      { key: 'f_number', label: 'F Number', type: 'string' },
      { key: 'image_circle', label: 'Image Circle', type: 'string' },
      { key: 'coaxial', label: 'Coaxial', type: 'string' },
      { key: 'mount', label: 'Mount', type: 'string' },
      { key: 'mtf30', label: 'MTF30', type: 'string' },
      { key: 'optical_resolution', label: 'Optical Resolution', type: 'string' },
      { key: 'distortion', label: 'Distortion', type: 'string' },
      { key: 'dof', label: 'DOF', type: 'string' },
      { key: 'length_of_io', label: 'Length of I/O', type: 'string' },
      { key: 'telecentricity', label: 'Telecentricity', type: 'string' },
    ],

    // FA Lens
    'fa lens': [
      { key: 'focal_length', label: 'Focal Length', type: 'number', unit: 'mm', required: true },
      { key: 'image_circle', label: 'Image Circle', type: 'string' },
      { key: 'image_resolution', label: 'Image Resolution', type: 'string' },
      { key: 'mag_range', label: 'Magnification Range', type: 'string' },
      { key: 'f_number', label: 'F Number', type: 'string' },
      { key: 'mount', label: 'Mount', type: 'string' },
      { key: 'mod', label: 'MOD', type: 'string' },
      { key: 'optical_distortion', label: 'Optical Distortion', type: 'string' },
      { key: 'wd', label: 'Working Distance', type: 'string' },
    ],

    // 3D 카메라 카테고리
    // Laser Profiler
    'laser profiler': [
      { key: 'point', label: 'Point', type: 'number', required: true },
      { key: 'z_range', label: 'Z Range', type: 'string', required: true },
      { key: 'z_resolution', label: 'Z Resolution', type: 'string' },
      { key: 'x_resolution', label: 'X Resolution', type: 'string' },
      { key: 'fov', label: 'FOV', type: 'string' },
      { key: 'profile_rate', label: 'Profile Rate', type: 'string' },
      { key: 'wd', label: 'Working Distance', type: 'string' },
      { key: 'linearity', label: 'Linearity', type: 'string' },
      { key: 'laser_option', label: 'Laser Option', type: 'string' },
    ],

    // Stereo Camera
    'stereo camera': [
      { key: 'mega_pixel', label: 'Mega Pixel', type: 'number', unit: 'MP', required: true },
      { key: 'pixel_size', label: 'Pixel Size', type: 'number', unit: 'μm' },
      { key: 'fov', label: 'FOV', type: 'string' },
      { key: 'focal_length', label: 'Focal Length', type: 'string' },
      { key: 'depth_accuracy', label: 'Depth Accuracy', type: 'string' },
      { key: 'spectrum', label: 'Spectrum', type: 'string' },
      { key: 'shutter_type', label: 'Shutter Type', type: 'string' },
      { key: 'interface', label: 'Interface', type: 'string' },
    ],

    // 오토포커스모듈 카테고리
    // Auto Focus
    'auto focus': [
      { key: 'description', label: 'Description', type: 'string' },
      { key: 'sensing_type', label: 'Sensing Type', type: 'string' },
      { key: 'sampling_rate', label: 'Sampling Rate', type: 'string' },
      { key: 'capture_range', label: 'Capture Range', type: 'string' },
      { key: 'laser_wavelength', label: 'Laser Wavelength', type: 'string' },
      { key: 'interface', label: 'Interface', type: 'string' },
      { key: 'stroke', label: 'Stroke', type: 'string' },
      { key: 'resolution', label: 'Resolution', type: 'string' },
      { key: 'linearity_error', label: 'Linearity Error', type: 'string' },
      { key: 'repeatability', label: 'Repeatability', type: 'string' },
    ],

    // 조명 카테고리
    // Light
    'light': [
      { key: 'color', label: 'Color', type: 'string' },
      { key: 'wavelength', label: 'Wavelength', type: 'string' },
      { key: 'power', label: 'Power', type: 'string' },
      { key: 'controller', label: 'Controller', type: 'string' },
      { key: 'current', label: 'Current', type: 'string' },
      { key: 'focal_length', label: 'Focal Length', type: 'string' },
    ],

    // Controller
    'controller': [
      { key: 'channel', label: 'Channel', type: 'number' },
      { key: 'max_continuous_current', label: 'Max Continuous Current', type: 'string' },
      { key: 'max_pulse_current', label: 'Max Pulse Current', type: 'string' },
      { key: 'led_voltage_range', label: 'LED Voltage Range', type: 'string' },
      { key: 'min_pulse_width', label: 'Min Pulse Width', type: 'string' },
      { key: 'max_frequency', label: 'Max Frequency', type: 'string' },
      { key: 'max_power_output_total', label: 'Max Power Output Total', type: 'string' },
    ],

    // 프레임그래버 카테고리
    'frame grabber': [
      { key: 'model', label: 'Model', type: 'string' },
      { key: 'pc_slot', label: 'PC Slot', type: 'string' },
      { key: 'max_pixel_clock', label: 'Max Pixel Clock', type: 'string' },
      { key: 'acquisition_rate', label: 'Acquisition Rate', type: 'string' },
      { key: 'onboard_memory', label: 'Onboard Memory', type: 'string' },
      { key: 'input', label: 'Input', type: 'string' },
      { key: 'cables', label: 'Cables', type: 'string' },
    ],

    // 소프트웨어 카테고리
    'software': [
      { key: 'type', label: 'Type', type: 'string' },
      { key: 'description', label: 'Description', type: 'string' },
      { key: 'device', label: 'Device', type: 'string' },
    ],

    // 주변기기 카테고리
    // 케이블
    'cable': [
      { key: 'description', label: 'Description', type: 'string' },
    ],

    // 악세사리
    'accessory': [
      { key: 'description', label: 'Description', type: 'string' },
    ],
  };

  /**
   * Get category template based on category name
   */
  static getCategoryTemplate(categoryName: string): CategoryTemplate | null {
    const normalizedName = categoryName.toLowerCase();
    
    // Find matching template by checking if category name contains key
    const templateKey = Object.keys(this.CATEGORY_TEMPLATES).find(key => 
      normalizedName.includes(key)
    );

    if (!templateKey) {
      return null;
    }

    return {
      categoryName: categoryName,
      baseColumns: this.BASE_COLUMNS,
      specificationFields: this.CATEGORY_TEMPLATES[templateKey],
    };
  }

  /**
   * Generate CSV header row for a category
   */
  static generateCSVHeaders(categoryName: string): string[] {
    const template = this.getCategoryTemplate(categoryName);
    
    if (!template) {
      // Return basic template for unknown categories
      return [
        ...this.BASE_COLUMNS,
        'spec_model',
        'spec_specification'
      ];
    }

    const specColumns = template.specificationFields.map(field => `spec_${field.key}`);
    return [...template.baseColumns, ...specColumns];
  }

  /**
   * Generate sample CSV data for a category
   */
  static generateSampleData(categoryName: string): Record<string, unknown>[] {
    const template = this.getCategoryTemplate(categoryName);
    
    if (!template) {
      return [{
        part_number: 'SAMPLE-001',
        category_name: categoryName,
        maker_name: 'Sample Maker',
        series_name: 'Sample Series',
        is_active: 'true',
        is_new: 'false',
        image_url: '/images/sample.jpg',
        spec_model: 'Sample Model',
        spec_specification: 'Sample Specification'
      }];
    }

    const sampleData: Record<string, unknown> = {
      part_number: 'SAMPLE-001',
      category_name: categoryName,
      maker_name: 'Sample Maker',
      series_name: 'Sample Series',
      is_active: 'true',
      is_new: 'false',
      image_url: '/images/sample.jpg',
    };

    // Add sample values for specifications
    template.specificationFields.forEach(field => {
      const specKey = `spec_${field.key}`;
      
      if (field.type === 'number') {
        sampleData[specKey] = field.key.includes('rate') || field.key.includes('frequency') ? '1000' :
                            field.key.includes('size') || field.key.includes('distance') ? '5.5' :
                            field.key.includes('resolution') || field.key.includes('dpi') ? '1200' : '100';
      } else if (field.type === 'boolean') {
        sampleData[specKey] = 'true';
      } else {
        sampleData[specKey] = field.key.includes('interface') ? 'Camera Link' :
                            field.key.includes('type') ? 'CMOS' :
                            field.key.includes('mount') ? 'C-mount' : 'Sample Value';
      }
    });

    return [sampleData];
  }

  /**
   * Generate complete CSV content for download
   */
  static generateCSVContent(categoryName: string, includeSampleData: boolean = true): string {
    const headers = this.generateCSVHeaders(categoryName);
    let csvContent = headers.join(',') + '\n';

    if (includeSampleData) {
      const sampleData = this.generateSampleData(categoryName);
      sampleData.forEach(row => {
        const values = headers.map(header => row[header] || '');
        csvContent += values.map(value => `"${value}"`).join(',') + '\n';
      });
    }

    return csvContent;
  }

  /**
   * Get template information for a category
   */
  static getTemplateInfo(categoryName: string): {
    categoryName: string;
    totalColumns: number;
    baseColumns: number;
    specColumns: number;
    requiredSpecs: string[];
    optionalSpecs: string[];
  } {
    const template = this.getCategoryTemplate(categoryName);
    
    if (!template) {
      return {
        categoryName,
        totalColumns: this.BASE_COLUMNS.length + 2,
        baseColumns: this.BASE_COLUMNS.length,
        specColumns: 2,
        requiredSpecs: [],
        optionalSpecs: ['model', 'specification'],
      };
    }

    const requiredSpecs = template.specificationFields
      .filter(field => field.required)
      .map(field => field.key);
    
    const optionalSpecs = template.specificationFields
      .filter(field => !field.required)
      .map(field => field.key);

    return {
      categoryName: template.categoryName,
      totalColumns: template.baseColumns.length + template.specificationFields.length,
      baseColumns: template.baseColumns.length,
      specColumns: template.specificationFields.length,
      requiredSpecs,
      optionalSpecs,
    };
  }

  /**
   * Get all available category templates
   */
  static getAllTemplateKeys(): string[] {
    return Object.keys(this.CATEGORY_TEMPLATES);
  }

  /**
   * Validate if a category has a template
   */
  static hasTemplate(categoryName: string): boolean {
    return this.getCategoryTemplate(categoryName) !== null;
  }
}