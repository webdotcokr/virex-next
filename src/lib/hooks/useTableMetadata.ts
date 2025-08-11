import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { getParameterUnit as getUnitFromUtils } from '@/lib/units';

interface ColumnConfig {
  id: number;
  category_name: string;
  parameter_name: string;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

interface TableMetadata {
  columns: ColumnConfig[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch and manage table metadata for a specific category
 * @param categoryId - The category ID to fetch metadata for
 * @returns Table metadata including column configurations
 */
export function useTableMetadata(categoryId: number | null) {
  const [metadata, setMetadata] = useState<TableMetadata>({
    columns: [],
    loading: true,
    error: null,
  });

  // Map category ID to category name for database lookup
  const categoryNameMap: Record<number, string> = {
    9: 'cis',
    10: 'tdi',
    11: 'line',
    12: 'area',
    13: 'invisible',
    14: 'scientific',
    15: 'large_format_lens',
    16: 'telecentric',
    17: 'fa_lens',
    18: '3d_laser_profiler',
    19: '3d_stereo_camera',
    20: 'light',
    22: 'controller',
    23: 'frame_grabber',
    24: 'gige_lan_card',
    25: 'usb_card',
    7: 'software',
    26: 'cable',
    27: 'accessory'
  };

  useEffect(() => {
    if (!categoryId) {
      setMetadata({
        columns: [],
        loading: false,
        error: null,
      });
      return;
    }

    const fetchMetadata = async () => {
      try {
        setMetadata(prev => ({ ...prev, loading: true, error: null }));
        
        const categoryName = categoryNameMap[categoryId];
        if (!categoryName) {
          throw new Error(`Unknown category ID: ${categoryId}`);
        }

        const { data, error } = await supabase
          .from('category_display_config')
          .select('*')
          .eq('category_name', categoryName)
          .order('display_order', { ascending: true });

        if (error) {
          throw error;
        }

        setMetadata({
          columns: data || [],
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching table metadata:', error);
        setMetadata(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch metadata',
        }));
      }
    };

    fetchMetadata();
  }, [categoryId]);

  // Create a structured metadata object similar to what the component expects
  const structuredMetadata = useMemo(() => {
    if (!metadata.columns.length) return null;
    
    return {
      displayConfig: metadata.columns,
      parameterLabels: metadata.columns.reduce((acc, col) => {
        acc[col.parameter_name] = getParameterLabel(col.parameter_name);
        return acc;
      }, {} as Record<string, string>),
      parameterUnits: metadata.columns.reduce((acc, col) => {
        const unit = getParameterUnit(col.parameter_name);
        if (unit) {
          acc[col.parameter_name] = unit;
        }
        return acc;
      }, {} as Record<string, string>),
    };
  }, [metadata.columns]);

  return {
    metadata: structuredMetadata,
    loading: metadata.loading,
    error: metadata.error,
  };
}

/**
 * Get visible columns from metadata, sorted by display order
 * @param metadata - Structured metadata object or column array
 * @returns Array of visible column configurations
 */
export function getVisibleColumns(metadata: any): ColumnConfig[] {
  // Handle both structured metadata object and raw column array
  const columns = metadata?.displayConfig || metadata || [];
  
  return columns
    .filter((col: ColumnConfig) => col.is_visible)
    .sort((a: ColumnConfig, b: ColumnConfig) => a.display_order - b.display_order);
}

/**
 * Convert parameter name to a user-friendly label
 * @param parameterName - The parameter name (snake_case)
 * @param metadata - Optional structured metadata or column array
 * @returns Formatted label (Title Case)
 */
export function getParameterLabel(parameterName: string, metadata?: any): string {
  // Special cases for common abbreviations and terms
  const specialCases: Record<string, string> = {
    'part_number': 'Part Number',
    'series_id': 'Series',
    'is_new': 'New',
    'is_active': 'Active',
    'scan_width': 'Scan Width',
    'dpi': 'DPI',
    'line_rate': 'Line Rate',
    'wd': 'WD',
    'no_of_pixels': 'No. of Pixels',
    'mega_pixel': 'Mega Pixel',
    'frame_rate': 'Frame Rate',
    'pixel_size': 'Pixel Size',
    'dynamic_range': 'Dynamic Range',
    'mag': 'Magnification',
    'image_circle': 'Image Circle',
    'f_number': 'F-Number',
    'na': 'NA',
    'mtf30': 'MTF30',
    'optical_resolution': 'Optical Resolution',
    'dof': 'DOF',
    'length_of_io': 'Length of I/O',
    'focal_length': 'Focal Length',
    'image_url': 'Image',
    'created_at': 'Created At',
    'updated_at': 'Updated At',
  };

  // Check if we have a special case
  if (specialCases[parameterName]) {
    return specialCases[parameterName];
  }

  // Convert snake_case to Title Case
  return parameterName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get the unit for a parameter
 * @param parameterName - The parameter name
 * @param metadata - Optional structured metadata (not used currently but kept for compatibility)
 * @returns The unit string (e.g., 'mm', 'fps', etc.) or empty string if no unit
 */
export function getParameterUnit(parameterName: string, metadata?: any): string {
  // Check if metadata has parameterUnits
  if (metadata?.parameterUnits && metadata.parameterUnits[parameterName]) {
    return metadata.parameterUnits[parameterName];
  }
  
  // Use the existing units utility
  return getUnitFromUtils(parameterName);
}