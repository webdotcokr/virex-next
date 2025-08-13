import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CSVProcessor } from '@/lib/CSVProcessor';

function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    
    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file || !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Please upload a valid CSV file' },
        { status: 400 }
      );
    }

    // Initialize mapping caches
    const [makersResult, seriesResult, categoriesResult] = await Promise.all([
      supabase.from('makers').select('id, name'),
      supabase.from('series').select('id, series_name'),
      supabase.from('categories').select('id, name')
    ]);

    if (makersResult.error || seriesResult.error || categoriesResult.error) {
      throw new Error('Failed to load reference data');
    }

    CSVProcessor.initializeMappingCaches(
      makersResult.data || [],
      seriesResult.data || [],
      categoriesResult.data || []
    );

    // Parse CSV file
    const processingResult = await CSVProcessor.parseCSVFile(file);
    
    if (!processingResult.success && processingResult.data.length === 0) {
      return NextResponse.json(
        { 
          error: 'CSV processing failed',
          details: processingResult.errors
        },
        { status: 400 }
      );
    }

    // Generate sync operations
    const operations = CSVProcessor.generateSyncOperations(processingResult.data);
    
    // Execute operations
    const results = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: [] as any[]
    };

    for (const operation of operations) {
      if (!operation.selected) {
        results.skipped++;
        continue;
      }

      try {
        if (operation.type === 'INSERT') {
          const { error } = await supabase
            .from('products')
            .insert({
              part_number: operation.data.part_number,
              maker_id: operation.data.maker_id,
              category_id: operation.data.category_id,
              series_id: operation.data.series_id,
              specifications: operation.data.specifications,
              is_active: operation.data.is_active,
              is_new: operation.data.is_new,
            });
          
          if (error) throw error;
          results.inserted++;
          
        } else if (operation.type === 'UPDATE') {
          const { error } = await supabase
            .from('products')
            .update({
              maker_id: operation.data.maker_id,
              category_id: operation.data.category_id,
              series_id: operation.data.series_id,
              specifications: operation.data.specifications,
              is_active: operation.data.is_active,
              is_new: operation.data.is_new,
              updated_at: new Date().toISOString()
            })
            .eq('part_number', operation.data.part_number);
          
          if (error) throw error;
          results.updated++;
        }
      } catch (error: any) {
        results.errors.push({
          operation: operation.type,
          part_number: operation.data.part_number,
          error: error.message || 'Unknown error'
        });
      }
    }

    // Handle product media if image_url is provided
    const productsWithImages = processingResult.data.filter(
      row => row.basicFields.image_url && row.basicFields.part_number
    );

    for (const row of productsWithImages) {
      try {
        // Get product ID by part_number
        const { data: product } = await supabase
          .from('products')
          .select('id')
          .eq('part_number', row.basicFields.part_number)
          .single();

        if (product) {
          // Check if media already exists
          const { data: existingMedia } = await supabase
            .from('product_media')
            .select('id')
            .eq('product_id', product.id)
            .eq('media_type', 'image')
            .eq('is_primary', true)
            .single();

          if (!existingMedia) {
            // Insert new media
            await supabase.from('product_media').insert({
              product_id: product.id,
              media_type: 'image',
              url: row.basicFields.image_url,
              is_primary: true
            });
          }
        }
      } catch (error) {
        // Silently continue - media is optional
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalRows: processingResult.summary.totalRows,
        inserted: results.inserted,
        updated: results.updated,
        skipped: results.skipped,
        errors: results.errors.length
      },
      processingResult: {
        ...processingResult.summary,
        validationErrors: processingResult.errors
      },
      operationErrors: results.errors
    });

  } catch (error) {
    console.error('CSV Upload Error:', error);
    return NextResponse.json(
      { error: 'Failed to process CSV upload' },
      { status: 500 }
    );
  }
}

// Preview endpoint - parse CSV and return preview data
export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file || !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Please upload a valid CSV file' },
        { status: 400 }
      );
    }

    // Initialize mapping caches for preview
    const [makersResult, seriesResult, categoriesResult] = await Promise.all([
      supabase.from('makers').select('id, name'),
      supabase.from('series').select('id, series_name'),
      supabase.from('categories').select('id, name')
    ]);

    CSVProcessor.initializeMappingCaches(
      makersResult.data || [],
      seriesResult.data || [],
      categoriesResult.data || []
    );

    // Parse CSV file
    const processingResult = await CSVProcessor.parseCSVFile(file);
    
    // Get existing products for comparison
    const partNumbers = processingResult.data.map(row => row.basicFields.part_number);
    const { data: existingProducts } = await supabase
      .from('products')
      .select('part_number, specifications')
      .in('part_number', partNumbers);

    // Generate operations with comparison
    const operations = CSVProcessor.generateSyncOperations(
      processingResult.data,
      existingProducts || []
    );

    return NextResponse.json({
      success: true,
      preview: {
        totalRows: processingResult.summary.totalRows,
        operations: operations.slice(0, 50), // Limit preview to 50 rows
        stats: CSVProcessor.getProcessingStats(processingResult),
        mappingResults: {
          unmappedMakers: processingResult.data
            .filter(row => row.basicFields.maker_name && !row.basicFields.maker_id)
            .map(row => row.basicFields.maker_name)
            .filter((v, i, a) => a.indexOf(v) === i),
          unmappedSeries: processingResult.data
            .filter(row => row.basicFields.series_name && !row.basicFields.series_id)
            .map(row => row.basicFields.series_name)
            .filter((v, i, a) => a.indexOf(v) === i),
          unmappedCategories: processingResult.data
            .filter(row => row.basicFields.category_name && !row.basicFields.category_id)
            .map(row => row.basicFields.category_name)
            .filter((v, i, a) => a.indexOf(v) === i),
        }
      }
    });

  } catch (error) {
    console.error('CSV Preview Error:', error);
    return NextResponse.json(
      { error: 'Failed to preview CSV' },
      { status: 500 }
    );
  }
}