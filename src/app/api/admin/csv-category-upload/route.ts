import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/admin-auth';

// 카테고리 ID to 테이블명 매핑
const CATEGORY_TABLE_MAPPING: Record<number, string> = {
  9: 'products_cis',        // CIS
  10: 'products_tdi',       // TDI
  11: 'products_line',      // Line
  12: 'products_area',      // Area
  13: 'products_invisible', // Invisible
  14: 'products_scientific',// Scientific
  15: 'products_large_format_lens', // Large Format Lens
  16: 'products_telecentric',       // Telecentric
  17: 'products_fa_lens',           // FA Lens
  18: 'products_3d_laser_profiler', // 3D Laser Profiler
  19: 'products_3d_stereo_camera',  // 3D Stereo Camera
  20: 'products_light',             // Light
  22: 'products_controller',        // Controller
  23: 'products_frame_grabber',     // Frame Grabber
  24: 'products_gige_lan_card',     // GigE LAN Card
  25: 'products_usb_card',          // USB Card
  7: 'products_software',           // Software
  26: 'products_cable',             // Cable
  27: 'products_accessory'          // Accessory
};

// 공통 컬럼들 (카테고리별 테이블의 공통 필드)
const COMMON_COLUMNS = [
  'part_number', 'series_id', 'is_active', 'is_new', 'image_url'
];

export async function POST(request: NextRequest) {
  console.log('CSV Upload API called');
  
  try {
    // 통합된 관리자 권한 검증
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }
    console.log('Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const categoryIdStr = formData.get('categoryId') as string;
    const categoryId = parseInt(categoryIdStr);
    
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }
    
    console.log('File:', file?.name, 'Category ID:', categoryId);
    
    if (!file || !file.name.endsWith('.csv')) {
      console.log('Invalid file type');
      return NextResponse.json(
        { error: 'Please upload a valid CSV file' },
        { status: 400 }
      );
    }

    if (!categoryId || !CATEGORY_TABLE_MAPPING[categoryId]) {
      console.log('Invalid category ID:', categoryId);
      return NextResponse.json(
        { error: 'Invalid category ID provided' },
        { status: 400 }
      );
    }

    const tableName = CATEGORY_TABLE_MAPPING[categoryId];
    console.log('Target table:', tableName);
    
    // Parse CSV file
    console.log('Reading CSV file...');
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    console.log('CSV Headers:', headers);
    console.log('Total lines:', lines.length);
    
    const results = {
      inserted: 0,
      updated: 0,
      errors: [] as any[]
    };

    // Load series mapping for reference
    console.log('Loading series data...');
    const { data: seriesData, error: seriesError } = await supabase
      .from('series')
      .select('id, series_name');
    
    if (seriesError) {
      console.error('Series fetch error:', seriesError);
    } else {
      console.log('Series data loaded:', seriesData?.length);
    }
    
    const seriesMap = new Map<string, number>();
    seriesData?.forEach(series => {
      seriesMap.set(series.series_name.toLowerCase(), series.id);
    });

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;

      const rowData: Record<string, any> = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index] || null;
      });

      try {
        // Process row data
        const processedData: Record<string, any> = {};

        // Handle common columns
        COMMON_COLUMNS.forEach(column => {
          if (rowData[column] !== undefined) {
            if (column === 'is_active' || column === 'is_new') {
              processedData[column] = rowData[column] === 'true' || rowData[column] === '1';
            } else if (column === 'series_id' && rowData['series']) {
              // Map series name to ID
              const seriesId = seriesMap.get(rowData['series'].toLowerCase());
              processedData[column] = seriesId || null;
            } else {
              processedData[column] = rowData[column];
            }
          }
        });

        // Handle series mapping by name if series_id not set
        if (!processedData['series_id'] && rowData['series']) {
          // Create new series if not exists
          const seriesName = rowData['series'];
          let seriesId = seriesMap.get(seriesName.toLowerCase());
          
          if (!seriesId) {
            const { data: newSeries, error: seriesError } = await supabase
              .from('series')
              .insert({ series_name: seriesName, category_id: categoryId })
              .select('id')
              .single();
              
            if (!seriesError && newSeries) {
              seriesId = newSeries.id;
              seriesMap.set(seriesName.toLowerCase(), seriesId);
            }
          }
          
          if (seriesId) {
            processedData['series_id'] = seriesId;
          }
        }

        // Handle specification columns (non-common columns)
        Object.keys(rowData).forEach(key => {
          if (!COMMON_COLUMNS.includes(key) && key !== 'series' && rowData[key] !== null && rowData[key] !== '') {
            // Convert numeric strings to numbers
            const value = rowData[key];
            if (!isNaN(value) && !isNaN(parseFloat(value))) {
              processedData[key] = parseFloat(value);
            } else {
              processedData[key] = value;
            }
          }
        });

        // Ensure part_number exists
        if (!processedData.part_number) {
          results.errors.push({
            row: i + 1,
            error: 'Missing part_number'
          });
          continue;
        }

        // Check if product exists
        console.log(`Checking existing product for: ${processedData.part_number}`);
        const { data: existingProduct, error: checkError } = await supabase
          .from(tableName)
          .select('id')
          .eq('part_number', processedData.part_number)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is expected for new products
          console.error('Error checking existing product:', checkError);
          throw checkError;
        }

        if (existingProduct) {
          // Update existing product
          console.log(`Updating product: ${processedData.part_number}`);
          const { error } = await supabase
            .from(tableName)
            .update({
              ...processedData,
              updated_at: new Date().toISOString()
            })
            .eq('part_number', processedData.part_number);

          if (error) {
            console.error('Update error:', error);
            throw error;
          }
          results.updated++;
        } else {
          // Insert new product
          console.log(`Inserting new product: ${processedData.part_number}`);
          const { error } = await supabase
            .from(tableName)
            .insert(processedData);

          if (error) {
            console.error('Insert error:', error);
            throw error;
          }
          results.inserted++;
        }

      } catch (error: any) {
        console.error(`Error processing row ${i + 1}:`, error);
        results.errors.push({
          row: i + 1,
          part_number: rowData.part_number,
          error: error.message || 'Unknown error'
        });
      }
    }

    console.log('Upload completed. Results:', results);
    
    return NextResponse.json({
      success: true,
      summary: {
        totalRows: lines.length - 1,
        inserted: results.inserted,
        updated: results.updated,
        errors: results.errors.length
      },
      errors: results.errors
    });

  } catch (error: any) {
    console.error('CSV Category Upload Error:', error);
    
    // Return detailed error information
    return NextResponse.json(
      { 
        error: 'Failed to process CSV upload',
        details: error.message || 'Unknown error',
        stack: error.stack || 'No stack trace available'
      },
      { status: 500 }
    );
  }
}