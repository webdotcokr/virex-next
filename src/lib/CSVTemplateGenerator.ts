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
    'category_id', 
    'maker_id',
    'series_id',
    'is_active',
    'is_new'
  ];

  private static readonly CATEGORY_TEMPLATES: Record<string, SpecificationField[]> = {
    // CIS (Contact Image Sensor) - 접촉식 이미지 센서
    'cis': [
      { key: 'scan_width', label: 'Scan Width', type: 'number', unit: 'mm', required: true, description: 'Scanning width in millimeters' },
      { key: 'dpi', label: 'DPI', type: 'number', required: true, description: 'Dots per inch resolution' },
      { key: 'line_rate', label: 'Line Rate', type: 'number', unit: 'kHz', required: true, description: 'Line scanning rate in kHz' },
      { key: 'wd', label: 'Working Distance', type: 'number', unit: 'mm', description: 'Working distance in millimeters' },
      { key: 'speed', label: 'Speed', type: 'number', description: 'Processing speed' },
      { key: 'spectrum', label: 'Spectrum', type: 'string', description: 'Spectral characteristics (Mono, Color, etc.)' },
      { key: 'resolution', label: 'Resolution', type: 'number', unit: 'mm', description: 'Resolution in millimeters' },
      { key: 'no_of_pixels', label: 'Number of Pixels', type: 'number', description: 'Total number of pixels' },
      { key: 'interface', label: 'Interface', type: 'string', description: 'Communication interface (Camera Link, USB, etc.)' },
    ],

    // TDI (Time Delay Integration) - 시간 지연 적분
    'tdi': [
      { key: 'stages', label: 'TDI Stages', type: 'number', required: true, description: 'Number of TDI stages' },
      { key: 'pixel_size', label: 'Pixel Size', type: 'number', unit: 'μm', required: true, description: 'Individual pixel size in micrometers' },
      { key: 'line_frequency', label: 'Line Frequency', type: 'number', unit: 'kHz', required: true, description: 'Line scanning frequency in kHz' },
      { key: 'sensor_model', label: 'Sensor Model', type: 'string', description: 'Specific sensor model number' },
      { key: 'interface', label: 'Interface', type: 'string', description: 'Communication interface' },
      { key: 'spectral_range', label: 'Spectral Range', type: 'string', unit: 'nm', description: 'Spectral sensitivity range' },
      { key: 'bit_depth', label: 'Bit Depth', type: 'number', unit: 'bit', description: 'Digital output bit depth' },
    ],

    // Line Scan Camera - 라인 스캔 카메라
    'line': [
      { key: 'resolution', label: 'Resolution', type: 'string', required: true, description: 'Image resolution (e.g., 2048x1)' },
      { key: 'pixel_size', label: 'Pixel Size', type: 'number', unit: 'μm', required: true, description: 'Individual pixel size in micrometers' },
      { key: 'line_rate', label: 'Line Rate', type: 'number', unit: 'kHz', required: true, description: 'Maximum line scanning rate' },
      { key: 'sensor_type', label: 'Sensor Type', type: 'string', description: 'CCD or CMOS sensor type' },
      { key: 'interface', label: 'Interface', type: 'string', description: 'Communication interface' },
      { key: 'shutter_type', label: 'Shutter Type', type: 'string', description: 'Electronic or global shutter' },
      { key: 'trigger_mode', label: 'Trigger Mode', type: 'string', description: 'External or internal trigger' },
    ],

    // Area Scan Camera - 영역 스캔 카메라
    'area': [
      { key: 'resolution', label: 'Resolution', type: 'string', required: true, description: 'Image resolution (e.g., 1920x1080)' },
      { key: 'frame_rate', label: 'Frame Rate', type: 'number', unit: 'fps', required: true, description: 'Maximum frames per second' },
      { key: 'pixel_size', label: 'Pixel Size', type: 'number', unit: 'μm', required: true, description: 'Individual pixel size in micrometers' },
      { key: 'sensor_type', label: 'Sensor Type', type: 'string', description: 'CCD or CMOS sensor type' },
      { key: 'interface', label: 'Interface', type: 'string', description: 'Communication interface' },
      { key: 'shutter_type', label: 'Shutter Type', type: 'string', description: 'Rolling or global shutter' },
      { key: 'lens_mount', label: 'Lens Mount', type: 'string', description: 'Lens mounting standard (C-mount, CS-mount, etc.)' },
    ],

    // Large Format Camera - 대형 포맷 카메라
    'large': [
      { key: 'resolution', label: 'Resolution', type: 'string', required: true, description: 'High resolution specification' },
      { key: 'sensor_size', label: 'Sensor Size', type: 'string', unit: 'mm', required: true, description: 'Physical sensor dimensions' },
      { key: 'pixel_size', label: 'Pixel Size', type: 'number', unit: 'μm', description: 'Individual pixel size' },
      { key: 'frame_rate', label: 'Frame Rate', type: 'number', unit: 'fps', description: 'Maximum frame rate' },
      { key: 'interface', label: 'Interface', type: 'string', description: 'High-speed interface type' },
      { key: 'lens_mount', label: 'Lens Mount', type: 'string', description: 'Large format lens mounting' },
    ],

    // Telecentric Lens - 텔레센트릭 렌즈
    'telecentric': [
      { key: 'magnification', label: 'Magnification', type: 'string', required: true, description: 'Optical magnification ratio' },
      { key: 'working_distance', label: 'Working Distance', type: 'number', unit: 'mm', required: true, description: 'Working distance from lens to object' },
      { key: 'field_of_view', label: 'Field of View', type: 'number', unit: 'mm', description: 'Maximum field of view diameter' },
      { key: 'resolution', label: 'Resolution', type: 'number', unit: 'μm', description: 'Optical resolution capability' },
      { key: 'mount_type', label: 'Mount Type', type: 'string', description: 'Lens mounting standard' },
      { key: 'distortion', label: 'Distortion', type: 'string', unit: '%', description: 'Maximum optical distortion' },
      { key: 'aperture', label: 'Aperture', type: 'string', description: 'F-number range' },
    ],

    // FA Lens - Factory Automation 렌즈
    'fa': [
      { key: 'focal_length', label: 'Focal Length', type: 'number', unit: 'mm', required: true, description: 'Lens focal length' },
      { key: 'aperture', label: 'Aperture', type: 'string', required: true, description: 'F-number specification' },
      { key: 'mount_type', label: 'Mount Type', type: 'string', required: true, description: 'Lens mounting standard' },
      { key: 'image_circle', label: 'Image Circle', type: 'number', unit: 'mm', description: 'Maximum image circle diameter' },
      { key: 'resolution', label: 'Resolution', type: 'number', unit: 'MP', description: 'Lens resolution in megapixels' },
      { key: 'working_distance', label: 'Working Distance', type: 'string', unit: 'mm', description: 'Recommended working distance range' },
      { key: 'distortion', label: 'Distortion', type: 'string', unit: '%', description: 'Maximum optical distortion' },
    ],

    // Invisible/IR Camera - 비가시광/적외선 카메라
    'invisible': [
      { key: 'spectral_range', label: 'Spectral Range', type: 'string', unit: 'nm', required: true, description: 'Wavelength sensitivity range' },
      { key: 'resolution', label: 'Resolution', type: 'string', required: true, description: 'Image resolution' },
      { key: 'pixel_size', label: 'Pixel Size', type: 'number', unit: 'μm', description: 'Individual pixel size' },
      { key: 'sensitivity', label: 'Sensitivity', type: 'string', description: 'Spectral sensitivity characteristics' },
      { key: 'interface', label: 'Interface', type: 'string', description: 'Communication interface' },
      { key: 'cooling', label: 'Cooling', type: 'string', description: 'Cooling mechanism if any' },
    ],

    // Scientific Camera - 과학용 카메라
    'scientific': [
      { key: 'resolution', label: 'Resolution', type: 'string', required: true, description: 'High-precision resolution' },
      { key: 'pixel_size', label: 'Pixel Size', type: 'number', unit: 'μm', required: true, description: 'Precise pixel dimensions' },
      { key: 'sensitivity', label: 'Sensitivity', type: 'string', description: 'Quantum efficiency or sensitivity' },
      { key: 'bit_depth', label: 'Bit Depth', type: 'number', unit: 'bit', description: 'Digital precision bit depth' },
      { key: 'noise_level', label: 'Noise Level', type: 'string', description: 'Electronic noise characteristics' },
      { key: 'cooling', label: 'Cooling', type: 'string', description: 'Active cooling system' },
      { key: 'interface', label: 'Interface', type: 'string', description: 'High-speed data interface' },
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
  static generateSampleData(categoryName: string): Record<string, any>[] {
    const template = this.getCategoryTemplate(categoryName);
    
    if (!template) {
      return [{
        part_number: 'SAMPLE-001',
        category_id: '',
        maker_id: '',
        series_id: '',
        is_active: 'true',
        is_new: 'false',
        spec_model: 'Sample Model',
        spec_specification: 'Sample Specification'
      }];
    }

    const sampleData: Record<string, any> = {
      part_number: 'SAMPLE-001',
      category_id: '',
      maker_id: '',
      series_id: '',
      is_active: 'true',
      is_new: 'false',
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