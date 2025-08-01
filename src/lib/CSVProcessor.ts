/**
 * CSV Processor for Products
 * Handles parsing, validation, and conversion of flat CSV to JSONB specifications
 */

interface ParsedCSVRow {
  basicFields: Record<string, any>;
  specifications: Record<string, any>;
  originalRow: Record<string, any>;
  rowIndex: number;
}

interface ValidationError {
  rowIndex: number;
  field: string;
  error: string;
  severity: 'error' | 'warning';
}

interface ProcessingResult {
  success: boolean;
  data: ParsedCSVRow[];
  errors: ValidationError[];
  summary: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    detectedCategory?: string;
    specificationFields: string[];
  };
}

export class CSVProcessor {
  private static readonly BASIC_FIELDS = [
    'part_number',
    'category_id',
    'maker_id', 
    'series_id',
    'is_active',
    'is_new'
  ];

  private static readonly REQUIRED_FIELDS = [
    'part_number',
    'category_id',
    'maker_id'
  ];

  /**
   * Parse CSV file content into structured data
   */
  static async parseCSVFile(file: File): Promise<ProcessingResult> {
    try {
      const text = await file.text();
      return this.parseCSVText(text);
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [{
          rowIndex: 0,
          field: 'file',
          error: error instanceof Error ? error.message : 'Failed to read file',
          severity: 'error'
        }],
        summary: {
          totalRows: 0,
          validRows: 0,
          errorRows: 1,
          specificationFields: []
        }
      };
    }
  }

  /**
   * Parse CSV text content
   */
  static parseCSVText(csvText: string): ProcessingResult {
    const lines = csvText.split('\n').filter(line => line.trim());
    const errors: ValidationError[] = [];
    
    if (lines.length < 2) {
      return {
        success: false,
        data: [],
        errors: [{
          rowIndex: 0,
          field: 'file',
          error: 'CSV file must contain at least a header and one data row',
          severity: 'error'
        }],
        summary: {
          totalRows: 0,
          validRows: 0,
          errorRows: 1,
          specificationFields: []
        }
      };
    }

    // Parse headers
    const headers = this.parseCSVLine(lines[0]);
    const { basicColumns, specColumns } = this.analyzeColumns(headers);
    
    // Validate headers
    const missingRequired = this.REQUIRED_FIELDS.filter(field => !basicColumns.includes(field));
    if (missingRequired.length > 0) {
      errors.push({
        rowIndex: 0,
        field: 'headers',
        error: `Missing required columns: ${missingRequired.join(', ')}`,
        severity: 'error'
      });
    }

    // Parse data rows
    const parsedRows: ParsedCSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      
      if (values.length === 0) continue; // Skip empty rows
      
      // Create row object
      const rowData: Record<string, any> = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });

      // Convert to structured format
      const { basicFields, specifications } = this.convertRowToStructured(rowData);
      
      // Validate row
      const rowErrors = this.validateRow(basicFields, specifications, i);
      errors.push(...rowErrors);

      parsedRows.push({
        basicFields,
        specifications,
        originalRow: rowData,
        rowIndex: i
      });
    }

    // Detect category from specifications
    const detectedCategory = this.detectCategoryFromSpecs(specColumns);

    return {
      success: errors.filter(e => e.severity === 'error').length === 0,
      data: parsedRows,
      errors,
      summary: {
        totalRows: parsedRows.length,
        validRows: parsedRows.length - errors.filter(e => e.severity === 'error').length,
        errorRows: errors.filter(e => e.severity === 'error').length,
        detectedCategory,
        specificationFields: specColumns
      }
    };
  }

  /**
   * Parse a single CSV line handling quoted values
   */
  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result.map(val => val.replace(/^"|"$/g, '')); // Remove surrounding quotes
  }

  /**
   * Analyze CSV columns to separate basic fields from specifications
   */
  private static analyzeColumns(headers: string[]): {
    basicColumns: string[];
    specColumns: string[];
  } {
    const basicColumns = headers.filter(header => 
      this.BASIC_FIELDS.includes(header.toLowerCase())
    );
    
    const specColumns = headers
      .filter(header => header.toLowerCase().startsWith('spec_'))
      .map(header => header.substring(5)); // Remove 'spec_' prefix
    
    return { basicColumns, specColumns };
  }

  /**
   * Convert flat CSV row to structured format with specifications JSONB
   */
  private static convertRowToStructured(csvRow: Record<string, any>): {
    basicFields: Record<string, any>;
    specifications: Record<string, any>;
  } {
    const basicFields: Record<string, any> = {};
    const specifications: Record<string, any> = {};
    
    Object.entries(csvRow).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      
      if (lowerKey.startsWith('spec_')) {
        // Extract specification field
        const specKey = key.substring(5); // Remove 'spec_' prefix
        if (value !== '' && value !== null && value !== undefined) {
          specifications[specKey] = this.convertValueType(value, specKey);
        }
      } else if (this.BASIC_FIELDS.includes(lowerKey)) {
        // Basic product field
        basicFields[lowerKey] = this.convertBasicFieldValue(lowerKey, value);
      }
    });
    
    return { basicFields, specifications };
  }

  /**
   * Convert value to appropriate type based on field name and content
   */
  private static convertValueType(value: any, fieldKey: string): any {
    if (value === '' || value === null || value === undefined) {
      return null;
    }

    const stringValue = String(value).trim();
    const lowerKey = fieldKey.toLowerCase();
    const lowerValue = stringValue.toLowerCase();
    
    // Boolean fields
    if (lowerValue === 'true' || lowerValue === 'false') {
      return lowerValue === 'true';
    }
    
    // Numeric fields (common specifications)
    if (lowerKey.includes('rate') || 
        lowerKey.includes('frequency') || 
        lowerKey.includes('dpi') || 
        lowerKey.includes('size') || 
        lowerKey.includes('distance') || 
        lowerKey.includes('stages') ||
        lowerKey.includes('depth') ||
        lowerKey.includes('fps')) {
      
      const numericValue = parseFloat(stringValue);
      if (!isNaN(numericValue)) {
        return numericValue;
      }
    }
    
    // Keep as string for other cases
    return stringValue;
  }

  /**
   * Convert basic field values to appropriate types
   */
  private static convertBasicFieldValue(fieldKey: string, value: any): any {
    if (value === '' || value === null || value === undefined) {
      return null;
    }

    const stringValue = String(value).trim();
    
    // ID fields should be numbers
    if (fieldKey.includes('_id')) {
      const numericValue = parseInt(stringValue);
      return isNaN(numericValue) ? null : numericValue;
    }
    
    // Boolean fields
    if (fieldKey === 'is_active' || fieldKey === 'is_new') {
      const lowerValue = stringValue.toLowerCase();
      return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
    }
    
    return stringValue;
  }

  /**
   * Validate a parsed row
   */
  private static validateRow(
    basicFields: Record<string, any>,
    specifications: Record<string, any>,
    rowIndex: number
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Check required fields
    this.REQUIRED_FIELDS.forEach(field => {
      if (!basicFields[field] || basicFields[field] === '') {
        errors.push({
          rowIndex,
          field,
          error: `Required field '${field}' is missing or empty`,
          severity: 'error'
        });
      }
    });
    
    // Validate part_number format (basic check)
    if (basicFields.part_number && typeof basicFields.part_number === 'string') {
      if (basicFields.part_number.length < 3) {
        errors.push({
          rowIndex,
          field: 'part_number',
          error: 'Part number should be at least 3 characters long',
          severity: 'warning'
        });
      }
    }
    
    // Validate ID fields are numbers
    ['category_id', 'maker_id', 'series_id'].forEach(field => {
      if (basicFields[field] !== null && (isNaN(basicFields[field]) || basicFields[field] <= 0)) {
        errors.push({
          rowIndex,
          field,
          error: `${field} must be a positive number`,
          severity: field === 'series_id' ? 'warning' : 'error'
        });
      }
    });
    
    return errors;
  }

  /**
   * Detect product category from specification column names
   */
  private static detectCategoryFromSpecs(specColumns: string[]): string | undefined {
    const lowerSpecColumns = specColumns.map(col => col.toLowerCase());
    
    // CIS detection
    if (lowerSpecColumns.some(col => col.includes('scan_width') || col.includes('dpi'))) {
      return 'CIS';
    }
    
    // TDI detection
    if (lowerSpecColumns.some(col => col.includes('stages') || col.includes('tdi'))) {
      return 'TDI';
    }
    
    // Line scan detection
    if (lowerSpecColumns.some(col => col.includes('line_rate'))) {
      return 'Line Scan';
    }
    
    // Area scan detection
    if (lowerSpecColumns.some(col => col.includes('frame_rate') || col.includes('fps'))) {
      return 'Area Scan';
    }
    
    // Telecentric lens detection
    if (lowerSpecColumns.some(col => col.includes('magnification') || col.includes('telecentric'))) {
      return 'Telecentric';
    }
    
    // FA lens detection
    if (lowerSpecColumns.some(col => col.includes('focal_length') || col.includes('aperture'))) {
      return 'FA Lens';
    }
    
    return undefined;
  }

  /**
   * Generate comparison operations for database synchronization
   */
  static generateSyncOperations(
    parsedData: ParsedCSVRow[],
    existingProducts: any[] = []
  ): any[] {
    // This would typically compare with existing database records
    // For now, we'll simulate the operations
    
    return parsedData.map((row, index) => {
      const existingProduct = existingProducts.find(p => 
        p.part_number === row.basicFields.part_number
      );
      
      let operationType: 'INSERT' | 'UPDATE' | 'SKIP' = 'INSERT';
      let reason = 'New product';
      
      if (existingProduct) {
        // Check if specifications differ
        const specsChanged = JSON.stringify(existingProduct.specifications) !== 
                           JSON.stringify(row.specifications);
        
        if (specsChanged) {
          operationType = 'UPDATE';
          reason = 'Specifications updated';
        } else {
          operationType = 'SKIP';
          reason = 'No changes detected';
        }
      }
      
      return {
        id: `op_${index}`,
        type: operationType,
        table: 'products',
        data: {
          ...row.basicFields,
          specifications: row.specifications
        },
        reason,
        selected: operationType !== 'SKIP',
        originalRow: row
      };
    });
  }

  /**
   * Get processing statistics
   */
  static getProcessingStats(result: ProcessingResult): {
    success: boolean;
    summary: string;
    details: {
      totalRows: number;
      validRows: number;
      errorRows: number;
      warningRows: number;
      detectedCategory?: string;
      specificationCount: number;
    };
  } {
    const errorCount = result.errors.filter(e => e.severity === 'error').length;
    const warningCount = result.errors.filter(e => e.severity === 'warning').length;
    
    return {
      success: result.success,
      summary: result.success 
        ? `Successfully processed ${result.summary.validRows} products${result.summary.detectedCategory ? ` (${result.summary.detectedCategory})` : ''}`
        : `Processing failed with ${errorCount} errors`,
      details: {
        totalRows: result.summary.totalRows,
        validRows: result.summary.validRows,
        errorRows: errorCount,
        warningRows: warningCount,
        detectedCategory: result.summary.detectedCategory,
        specificationCount: result.summary.specificationFields.length
      }
    };
  }
}