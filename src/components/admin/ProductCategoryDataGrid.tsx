'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  IconButton,
  Checkbox,
  FormControlLabel,
  LinearProgress,
} from '@mui/material';
import SeriesDropdown from './SeriesDropdown';
import ImageUploadField from './ImageUploadField';
import EnhancedFileSelector from './EnhancedFileSelector';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowId,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FileUpload as UploadIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { httpQueries } from '@/lib/http-supabase';

interface ProductCategoryDataGridProps {
  tableName: string;
  categoryName: string;
}

interface TableSchema {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

export default function ProductCategoryDataGrid({ tableName, categoryName }: ProductCategoryDataGridProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  
  // Edit dialog state
  const [editDialog, setEditDialog] = useState({
    open: false,
    record: null as any,
    data: {} as any,
  });

  // Add dialog state
  const [addDialog, setAddDialog] = useState({
    open: false,
    data: {} as any,
  });
  
  // CSV upload state
  const [uploadProgress, setUploadProgress] = useState({
    isUploading: false,
    processed: 0,
    total: 0,
  });
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Fetch table schema
  const fetchSchema = useCallback(async () => {
    // Set timeout for schema fetch
    const timeoutId = setTimeout(() => {
      console.error(`⏰ Schema fetch timeout for ${tableName}`);
      setError('Schema loading timed out. Using default schema.');
      setDefaultSchema();
    }, 5000); // 5 second timeout
    
    try {
      console.log(`🔍 Fetching schema for table: ${tableName}`);
      
      // Fetch one row to infer schema from actual data
      const sampleResult = await httpQueries.getGenericData(tableName, {
        limit: 1
      });
      
      if (!sampleResult.error && sampleResult.data) {
        let inferredSchema: TableSchema[];
        
        if (sampleResult.data.length > 0) {
          // Infer from actual data
          inferredSchema = Object.keys(sampleResult.data[0]).map(col => ({
            column_name: col,
            data_type: typeof sampleResult.data[0][col] === 'boolean' ? 'boolean' : 
                       typeof sampleResult.data[0][col] === 'number' ? 'numeric' : 
                       col.includes('_at') ? 'timestamp' : 'text',
            is_nullable: 'YES',
            column_default: null,
          }));
        } else {
          // Fallback to basic columns if no data
          const columns = ['id', 'part_number', 'series_id', 'is_active', 'is_new', 'created_at', 'updated_at'];
          
          inferredSchema = columns.map(col => ({
            column_name: col,
            data_type: col === 'id' || col.includes('_id') ? 'bigint' :
                       col.includes('is_') ? 'boolean' :
                       col.includes('_at') ? 'timestamp' :
                       col.includes('_url') ? 'text' :
                       col.includes('price') || col.includes('count') ? 'numeric' : 'text',
            is_nullable: col === 'id' ? 'NO' : 'YES',
            column_default: null,
          }));
        }
        
        // Sort to put important columns first
        const columnOrder = ['id', 'part_number', 'series_id', 'is_active', 'is_new'];
        inferredSchema.sort((a, b) => {
          const aIndex = columnOrder.indexOf(a.column_name);
          const bIndex = columnOrder.indexOf(b.column_name);
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return 0;
        });
        
        setSchema(inferredSchema);
        console.log(`✅ Schema inferred for ${tableName}:`, inferredSchema);
        clearTimeout(timeoutId);
      } else {
        console.error('❌ Error fetching sample data:', sampleResult.error);
        clearTimeout(timeoutId);
        setError(`Failed to load schema: ${sampleResult.error?.message || 'Unknown error'}`);
        setDefaultSchema();
      }
    } catch (error) {
      console.error('❌ Error in fetchSchema:', error);
      clearTimeout(timeoutId);
      setError(`Schema error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDefaultSchema();
    }
  }, [tableName]);

  // Set default schema helper
  const setDefaultSchema = useCallback(() => {
    const defaultSchema: TableSchema[] = [
      { column_name: 'id', data_type: 'bigint', is_nullable: 'NO', column_default: null },
      { column_name: 'part_number', data_type: 'text', is_nullable: 'YES', column_default: null },
      { column_name: 'series', data_type: 'text', is_nullable: 'YES', column_default: null },
      { column_name: 'is_active', data_type: 'boolean', is_nullable: 'YES', column_default: null },
      { column_name: 'is_new', data_type: 'boolean', is_nullable: 'YES', column_default: null },
    ];
    setSchema(defaultSchema);
    console.log('📋 Using default schema for', tableName);
  }, [tableName]);

  // Build columns from schema
  const buildColumns = useCallback(() => {
    const cols: GridColDef[] = schema.map((col) => {
      const baseCol: GridColDef = {
        field: col.column_name,
        headerName: col.column_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        flex: 1,
        minWidth: 100,
      };

      // Special handling for certain columns
      if (col.column_name === 'id') {
        baseCol.width = 80;
        baseCol.flex = 0;
      } else if (col.column_name === 'part_number') {
        baseCol.minWidth = 150;
        baseCol.flex = 1.5;
      } else if (col.data_type === 'boolean') {
        baseCol.width = 100;
        baseCol.flex = 0;
        baseCol.renderCell = (params: GridRenderCellParams) => (
          <Checkbox checked={params.value || false} disabled />
        );
      } else if (col.column_name === 'image_url') {
        baseCol.minWidth = 200;
        baseCol.renderCell = (params: GridRenderCellParams) => (
          params.value ? (
            <a href={params.value} target="_blank" rel="noopener noreferrer" style={{ color: '#566BDA' }}>
              View Image
            </a>
          ) : '-'
        );
      } else if (col.data_type === 'timestamp with time zone' || col.data_type === 'timestamp') {
        baseCol.minWidth = 120;
        baseCol.renderCell = (params: GridRenderCellParams) => (
          params.value ? new Date(params.value).toLocaleDateString('ko-KR') : '-'
        );
      }

      return baseCol;
    });

    // Add actions column
    cols.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.id)}
        />,
      ],
    });

    setColumns(cols);
  }, [schema]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Set timeout for data fetch
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Data loading timed out. Please check your connection and try again.');
      setRows([]);
    }, 10000); // 10 second timeout
    
    try {
      console.log(`🔄 Fetching data from ${tableName}...`);
      
      const [dataResult, countResult] = await Promise.all([
        httpQueries.getGenericData(tableName, {
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          orderBy: 'id',
          orderDirection: 'asc'
        }),
        httpQueries.getGenericCount(tableName)
      ]);

      if (dataResult.error) {
        console.error('❌ Fetch error:', dataResult.error);
        clearTimeout(timeoutId);
        throw dataResult.error;
      }

      clearTimeout(timeoutId);
      setRows(dataResult.data || []);
      setTotalRows(countResult.count || 0);
      setError(null);
      
      console.log(`✅ Loaded ${dataResult.data?.length} rows out of ${countResult.count} total`);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      clearTimeout(timeoutId);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to load data: ${errorMessage}`);
      setSnackbar({
        open: true,
        message: `Failed to load data: ${errorMessage}`,
        severity: 'error',
      });
      setRows([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [tableName, paginationModel]);

  // Retry handler
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setError(null);
    await fetchSchema();
    // Data will be fetched automatically when schema is ready
    setIsRetrying(false);
  }, [fetchSchema]);

  // Load schema and data when component mounts or table changes
  useEffect(() => {
    fetchSchema();
  }, [fetchSchema]);

  useEffect(() => {
    if (schema.length > 0) {
      buildColumns();
      fetchData();
    }
  }, [schema, buildColumns, fetchData]);

  // Handle edit
  const handleEdit = (record: any) => {
    setEditDialog({
      open: true,
      record,
      data: { ...record },
    });
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      const { id, ...updateData } = editDialog.data;
      
      // Remove read-only fields
      delete updateData.created_at;
      delete updateData.updated_at;
      
      // bigint/integer 필드들의 빈 문자열을 null로 변환
      const bigintFields = ['series_id', 'catalog_file_id', 'datasheet_file_id', 'manual_file_id', 'drawing_file_id'];
      bigintFields.forEach(field => {
        if (updateData[field] === '' || updateData[field] === undefined) {
          updateData[field] = null;
        }
      });
      
      // integer 타입 필드들도 처리
      const integerFields = ['dpi', 'no_of_pixels'];
      integerFields.forEach(field => {
        if (updateData[field] === '' || updateData[field] === undefined) {
          updateData[field] = null;
        }
      });
      
      console.log(`Updating ${tableName} record:`, id, updateData);

      const { error } = await httpQueries.updateGeneric(tableName, id, updateData);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      setSnackbar({
        open: true,
        message: 'Record updated successfully!',
        severity: 'success',
      });

      setEditDialog({ open: false, record: null, data: {} });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating record:', error);
      setSnackbar({
        open: true,
        message: `Failed to update: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle add new
  const handleAdd = () => {
    // Initialize default values based on schema
    const defaultData: any = {};
    schema.forEach(col => {
      if (col.column_name !== 'id' && col.column_name !== 'created_at' && col.column_name !== 'updated_at') {
        if (col.data_type === 'boolean') {
          defaultData[col.column_name] = false;
        } else if (col.data_type === 'numeric' || col.data_type === 'integer' || col.data_type === 'bigint') {
          defaultData[col.column_name] = null;
        } else {
          defaultData[col.column_name] = '';
        }
      }
    });
    
    setAddDialog({
      open: true,
      data: defaultData,
    });
  };

  // Handle save add
  const handleSaveAdd = async () => {
    try {
      console.log(`Adding new ${tableName} record:`, addDialog.data);

      // bigint/integer 필드들의 빈 문자열을 null로 변환
      const processedData = { ...addDialog.data };
      
      // bigint 타입 필드들 처리
      const bigintFields = ['series_id', 'catalog_file_id', 'datasheet_file_id', 'manual_file_id', 'drawing_file_id'];
      bigintFields.forEach(field => {
        if (processedData[field] === '' || processedData[field] === undefined) {
          processedData[field] = null;
        }
      });
      
      // integer 타입 필드들도 처리
      const integerFields = ['dpi', 'no_of_pixels'];
      integerFields.forEach(field => {
        if (processedData[field] === '' || processedData[field] === undefined) {
          processedData[field] = null;
        }
      });

      const { error } = await httpQueries.insertGeneric(tableName, processedData);

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      setSnackbar({
        open: true,
        message: 'Record added successfully!',
        severity: 'success',
      });

      setAddDialog({ open: false, data: {} });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error adding record:', error);
      setSnackbar({
        open: true,
        message: `Failed to add: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: GridRowId) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      console.log(`Deleting ${tableName} record:`, id);

      const { error } = await httpQueries.deleteGeneric(tableName, id);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      setSnackbar({
        open: true,
        message: 'Record deleted successfully!',
        severity: 'success',
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting record:', error);
      setSnackbar({
        open: true,
        message: `Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Parse CSV line handling quotes and commas
  const parseCSVLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  // Handle CSV upload
  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadProgress({ isUploading: true, processed: 0, total: 0 });
    
    try {
      // Read file
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain headers and at least one data row');
      }

      // Parse headers
      const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'));
      
      // Check for part_number column
      if (!headers.includes('part_number')) {
        throw new Error('CSV must contain a "part_number" column');
      }

      const dataLines = lines.slice(1);
      setUploadProgress({ isUploading: true, processed: 0, total: dataLines.length });

      const results = {
        inserted: 0,
        updated: 0,
        errors: [] as string[],
      };

      // Process each row
      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i];
        if (!line.trim()) continue;

        try {
          const values = parseCSVLine(line);
          const record: any = {};
          
          // Build record object
          headers.forEach((header, index) => {
            let value = values[index] || '';
            
            // Skip empty values for non-required fields
            if (value === '' && header !== 'part_number') {
              return;
            }
            
            // Type conversion based on schema
            const schemaCol = schema.find(col => col.column_name === header);
            if (schemaCol) {
              if (schemaCol.data_type === 'boolean') {
                value = value.toLowerCase() === 'true' || value === '1' ? true : false;
              } else if (schemaCol.data_type === 'numeric' || schemaCol.data_type === 'integer' || schemaCol.data_type === 'bigint') {
                // 빈 문자열이나 공백문자열을 null로 변환
                value = (value && value.trim() !== '') ? Number(value) : null;
              } else if (schemaCol.data_type === 'timestamp') {
                // Skip timestamp fields (auto-generated)
                return;
              }
            }
            
            record[header] = value;
          });

          // Check if record exists (simplified - just try to insert, fallback to update if needed)
          try {
            // Try insert first
            const { error } = await httpQueries.insertGeneric(tableName, record);
            if (error) {
              // If insert fails, try update (assuming it's a duplicate)
              const updateError = await httpQueries.updateGeneric(tableName, record.id || record.part_number, record);
              if (updateError.error) throw updateError.error;
              results.updated++;
            } else {
              results.inserted++;
            }
          } catch (insertUpdateError) {
            throw insertUpdateError;
          }

          setUploadProgress(prev => ({ ...prev, processed: i + 1 }));
        } catch (error) {
          console.error(`Error processing row ${i + 2}:`, error);
          results.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Show results
      let message = `Upload complete: ${results.inserted} added, ${results.updated} updated`;
      if (results.errors.length > 0) {
        message += `, ${results.errors.length} errors`;
        console.error('CSV upload errors:', results.errors);
      }

      setSnackbar({
        open: true,
        message,
        severity: results.errors.length > 0 ? 'warning' : 'success',
      });

      // Refresh data
      fetchData();
      
    } catch (error) {
      console.error('CSV upload error:', error);
      setSnackbar({
        open: true,
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    } finally {
      setUploadProgress({ isUploading: false, processed: 0, total: 0 });
      // Reset file input
      event.target.value = '';
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      // Show loading message
      setSnackbar({
        open: true,
        message: 'Exporting all data...',
        severity: 'info',
      });

      // Fetch all data without pagination
      const allDataResult = await httpQueries.getGenericData(tableName, {
        limit: 10000, // Large limit to get all data
        orderBy: 'id',
        orderDirection: 'asc'
      });

      if (allDataResult.error) {
        console.error('Export fetch error:', allDataResult.error);
        throw allDataResult.error;
      }

      const allData = allDataResult.data || [];
      if (allData.length === 0) {
        setSnackbar({
          open: true,
          message: 'No data to export',
          severity: 'warning',
        });
        return;
      }

      const headers = columns
        .filter(col => col.field !== 'actions')
        .map(col => col.field);
      
      const csvContent = [
        headers.join(','),
        ...allData.map(row => 
          headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value ?? '';
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tableName}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: `Successfully exported ${allData.length} records!`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({
        open: true,
        message: `Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Render form field based on column type
  const renderFormField = (col: TableSchema, value: any, onChange: (field: string, value: any) => void) => {
    // Skip auto-generated fields
    if (['id', 'created_at', 'updated_at'].includes(col.column_name)) {
      return null;
    }

    // Special handling for series_id - use SeriesDropdown
    if (col.column_name === 'series_id') {
      return (
        <SeriesDropdown
          key={col.column_name}
          value={value || null}
          onChange={(seriesId) => onChange(col.column_name, seriesId)}
          label="Series"
          disabled={false}
        />
      );
    }

    // Special handling for image_url - use ImageUploadField
    if (col.column_name === 'image_url') {
      return (
        <ImageUploadField
          key={col.column_name}
          value={value || ''}
          onChange={(imageUrl) => onChange(col.column_name, imageUrl)}
          label="Image"
          categoryName={categoryName.toLowerCase()}
        />
      );
    }

    // Special handling for file ID fields - use EnhancedFileSelector
    if (col.column_name.endsWith('_file_id')) {
      const fileType = col.column_name.replace('_file_id', '') as 'catalog' | 'datasheet' | 'manual' | 'drawing';
      return (
        <EnhancedFileSelector
          key={col.column_name}
          value={value || null}
          onChange={(fileId) => onChange(col.column_name, fileId)}
          fileType={fileType}
          categoryName={categoryName.toLowerCase()}
        />
      );
    }

    // Standard field types
    if (col.data_type === 'boolean') {
      return (
        <FormControlLabel
          key={col.column_name}
          control={
            <Checkbox
              checked={value || false}
              onChange={(e) => onChange(col.column_name, e.target.checked)}
            />
          }
          label={col.column_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          sx={{ mb: 2 }}
        />
      );
    } else if (col.data_type === 'numeric' || col.data_type === 'integer' || col.data_type === 'bigint') {
      return (
        <TextField
          key={col.column_name}
          margin="dense"
          label={col.column_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          type="number"
          fullWidth
          variant="outlined"
          value={value ?? ''}
          onChange={(e) => onChange(col.column_name, e.target.value ? Number(e.target.value) : null)}
          sx={{ mb: 2 }}
        />
      );
    } else {
      return (
        <TextField
          key={col.column_name}
          margin="dense"
          label={col.column_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          fullWidth
          variant="outlined"
          value={value || ''}
          onChange={(e) => onChange(col.column_name, e.target.value)}
          sx={{ mb: 2 }}
          multiline={col.column_name.includes('description') || col.column_name.includes('text')}
          rows={col.column_name.includes('description') || col.column_name.includes('text') ? 3 : 1}
        />
      );
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
      }}>
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            {categoryName} Products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage products in the {tableName} table
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleCSVUpload}
          />
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadProgress.isUploading || loading}
          >
            Upload CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={loading || error !== null}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            disabled={loading || error !== null}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? 'Retrying...' : 'Retry'}
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Upload Progress */}
      {uploadProgress.isUploading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Uploading CSV: {uploadProgress.processed} / {uploadProgress.total} rows processed
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress.total > 0 ? (uploadProgress.processed / uploadProgress.total) * 100 : 0} 
          />
        </Box>
      )}

      {/* Data Grid */}
      <Box sx={{ 
        height: '600px',
        minHeight: '600px', 
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={totalRows}
          paginationMode="server"
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#F8F9FB',
              borderBottom: '1px solid #E8ECEF',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#F8F9FB',
            },
            '& .MuiDataGrid-cell': {
              lineHeight: 'auto !important',
            },
          }}
        />
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, record: null, data: {} })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent sx={{ pt: 2, maxHeight: '60vh', overflowY: 'auto' }}>
          {schema.map(col => renderFormField(
            col,
            editDialog.data[col.column_name],
            (field, value) => setEditDialog(prev => ({
              ...prev,
              data: { ...prev.data, [field]: value }
            }))
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, record: null, data: {} })}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Dialog */}
      <Dialog
        open={addDialog.open}
        onClose={() => setAddDialog({ open: false, data: {} })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent sx={{ pt: 2, maxHeight: '60vh', overflowY: 'auto' }}>
          {schema.map(col => renderFormField(
            col,
            addDialog.data[col.column_name],
            (field, value) => setAddDialog(prev => ({
              ...prev,
              data: { ...prev.data, [field]: value }
            }))
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog({ open: false, data: {} })}>
            Cancel
          </Button>
          <Button onClick={handleSaveAdd} variant="contained">
            Add Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}