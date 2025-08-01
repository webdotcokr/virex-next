'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  Chip,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowId,
} from '@mui/x-data-grid';
import {
  Upload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type Download = Database['public']['Tables']['downloads']['Row'];
type DownloadInsert = Database['public']['Tables']['downloads']['Insert'];

interface BulkUploadData {
  id: string; // temporary ID for grid
  title: string;
  file_name: string;
  file_url: string;
  category_id: number;
  status: 'new' | 'duplicate' | 'error';
  error?: string;
  selected: boolean;
}

interface BulkUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
  categories: Array<{ id: number; name: string }>;
}

export default function BulkUploadModal({
  open,
  onClose,
  onSuccess,
  categories,
}: BulkUploadModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'processing' | 'complete'>('upload');
  const [csvData, setCsvData] = useState<BulkUploadData[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    added: number;
    duplicates: number;
    errors: number;
  }>({ added: 0, duplicates: 0, errors: 0 });
  const [error, setError] = useState<string | null>(null);

  // Parse CSV content
  const parseCSV = useCallback((content: string): BulkUploadData[] => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Validate required headers
    const requiredHeaders = ['title', 'file_name', 'file_url', 'category_id'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    const data: BulkUploadData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      if (values.length !== headers.length) {
        console.warn(`Row ${i + 1}: Column count mismatch, skipping`);
        continue;
      }

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      // Validate required fields
      if (!row.title || !row.file_url) {
        data.push({
          id: `temp-${i}`,
          title: row.title || '',
          file_name: row.file_name || '',
          file_url: row.file_url || '',
          category_id: parseInt(row.category_id) || 1,
          status: 'error',
          error: 'Missing required fields (title, file_url)',
          selected: false,
        });
        continue;
      }

      // Validate category_id
      const categoryId = parseInt(row.category_id);
      if (isNaN(categoryId) || !categories.find(c => c.id === categoryId)) {
        data.push({
          id: `temp-${i}`,
          title: row.title,
          file_name: row.file_name || '',
          file_url: row.file_url,
          category_id: categoryId || 1,
          status: 'error',
          error: 'Invalid category_id',
          selected: false,
        });
        continue;
      }

      data.push({
        id: `temp-${i}`,
        title: row.title,
        file_name: row.file_name || row.title,
        file_url: row.file_url,
        category_id: categoryId,
        status: 'new',
        selected: true,
      });
    }

    return data;
  }, [categories]);

  // Check for duplicates
  const checkDuplicates = useCallback(async (data: BulkUploadData[]) => {
    try {
      // Get existing downloads to check for duplicates
      const { data: existingDownloads, error } = await supabase
        .from('downloads')
        .select('title, file_name, file_url');

      if (error) {
        console.error('Error fetching existing downloads:', error);
        return data; // Return original data if can't check duplicates
      }

      return data.map(item => {
        if (item.status === 'error') return item;

        // Check for duplicates by title or file_name
        const isDuplicate = existingDownloads.some(existing => 
          existing.title === item.title || 
          (existing.file_name && item.file_name && existing.file_name === item.file_name) ||
          existing.file_url === item.file_url
        );

        if (isDuplicate) {
          return {
            ...item,
            status: 'duplicate' as const,
            selected: false,
          };
        }

        return item;
      });
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return data;
    }
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      const content = await file.text();
      const parsedData = parseCSV(content);
      const checkedData = await checkDuplicates(parsedData);
      
      setCsvData(checkedData);
      setStep('preview');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to parse CSV');
    }

    // Reset input
    event.target.value = '';
  }, [parseCSV, checkDuplicates]);

  // Toggle row selection
  const handleToggleSelection = useCallback((id: GridRowId) => {
    setCsvData(prev => prev.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  }, []);

  // Toggle all selection
  const handleToggleAll = useCallback((checked: boolean) => {
    setCsvData(prev => prev.map(item => 
      item.status === 'new' ? { ...item, selected: checked } : item
    ));
  }, []);

  // Process bulk upload
  const handleBulkUpload = useCallback(async () => {
    const selectedItems = csvData.filter(item => item.selected && item.status === 'new');
    if (selectedItems.length === 0) return;

    setStep('processing');
    setProcessing(true);
    setProgress(0);

    let added = 0;
    let errors = 0;

    try {
      for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i];
        
        try {
          const insertData: DownloadInsert = {
            title: item.title,
            file_name: item.file_name,
            file_url: item.file_url,
            category_id: item.category_id,
            hit_count: 0,
          };

          const { error } = await supabase
            .from('downloads')
            .insert(insertData);

          if (error) throw error;
          added++;
        } catch (error) {
          console.error(`Error adding item ${i + 1}:`, error);
          errors++;
        }

        setProgress(((i + 1) / selectedItems.length) * 100);
      }

      const duplicates = csvData.filter(item => item.status === 'duplicate').length;
      
      setResults({ added, duplicates, errors });
      setStep('complete');
      
      if (added > 0) {
        onSuccess(added);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bulk upload failed');
      setStep('preview');
    } finally {
      setProcessing(false);
    }
  }, [csvData, onSuccess]);

  // Reset modal
  const handleClose = useCallback(() => {
    setStep('upload');
    setCsvData([]);
    setError(null);
    setProgress(0);
    setResults({ added: 0, duplicates: 0, errors: 0 });
    onClose();
  }, [onClose]);

  // Data grid columns
  const columns: GridColDef[] = [
    {
      field: 'selected',
      headerName: '',
      width: 50,
      renderCell: (params) => (
        <Checkbox
          checked={params.row.selected}
          onChange={() => handleToggleSelection(params.row.id)}
          disabled={params.row.status !== 'new'}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const { status, error } = params.row;
        const config = {
          new: { color: 'success', icon: <CheckIcon />, label: 'New' },
          duplicate: { color: 'warning', icon: <WarningIcon />, label: 'Duplicate' },
          error: { color: 'error', icon: <ErrorIcon />, label: 'Error' },
        };
        
        const { color, icon, label } = config[status];
        
        return (
          <Chip
            icon={icon}
            label={label}
            color={color as any}
            size="small"
            title={error}
          />
        );
      },
    },
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'file_name',
      headerName: 'File Name',
      width: 150,
    },
    {
      field: 'category_id',
      headerName: 'Category',
      width: 120,
      renderCell: (params) => {
        const category = categories.find(c => c.id === params.value);
        return category?.name || 'Unknown';
      },
    },
    {
      field: 'error',
      headerName: 'Error',
      width: 200,
      renderCell: (params) => (
        params.value ? (
          <Typography variant="caption" color="error">
            {params.value}
          </Typography>
        ) : null
      ),
    },
  ];

  const selectedCount = csvData.filter(item => item.selected).length;
  const newCount = csvData.filter(item => item.status === 'new').length;
  const duplicateCount = csvData.filter(item => item.status === 'duplicate').length;
  const errorCount = csvData.filter(item => item.status === 'error').length;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{ sx: { height: '80vh' } }}
    >
      <DialogTitle>
        Bulk Upload Downloads
      </DialogTitle>
      
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {step === 'upload' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <UploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Upload CSV File
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              CSV should have columns: title, file_name, file_url, category_id
            </Typography>
            
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="csv-upload-input"
            />
            <label htmlFor="csv-upload-input">
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadIcon />}
                sx={{ mt: 2 }}
              >
                Select CSV File
              </Button>
            </label>

            <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                CSV Format Example:
              </Typography>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
{`title,file_name,file_url,category_id
"Product Manual","manual.pdf","http://example.com/manual.pdf",1
"Datasheet","datasheet.pdf","http://example.com/datasheet.pdf",2`}
              </Typography>
            </Alert>
          </Box>
        )}

        {step === 'preview' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Preview Data ({csvData.length} rows)
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  label={`${newCount} New`} 
                  color="success" 
                  size="small" 
                />
                <Chip 
                  label={`${duplicateCount} Duplicates`} 
                  color="warning" 
                  size="small" 
                />
                <Chip 
                  label={`${errorCount} Errors`} 
                  color="error" 
                  size="small" 
                />
              </Box>

              {newCount > 0 && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedCount === newCount}
                      indeterminate={selectedCount > 0 && selectedCount < newCount}
                      onChange={(e) => handleToggleAll(e.target.checked)}
                    />
                  }
                  label={`Select all new items (${selectedCount}/${newCount} selected)`}
                />
              )}
            </Box>

            <Box sx={{ flex: 1, minHeight: 400 }}>
              <DataGrid
                rows={csvData}
                columns={columns}
                disableRowSelectionOnClick
                hideFooterSelectedRowCount
                sx={{
                  '& .MuiDataGrid-row': {
                    '&.duplicate': { backgroundColor: '#fff3e0' },
                    '&.error': { backgroundColor: '#ffebee' },
                  },
                }}
                getRowClassName={(params) => params.row.status}
              />
            </Box>
          </Box>
        )}

        {step === 'processing' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Processing Upload...
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ mb: 2, width: '100%' }}
            />
            <Typography variant="body2" color="text.secondary">
              {progress.toFixed(0)}% complete
            </Typography>
          </Box>
        )}

        {step === 'complete' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Upload Complete!
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
              <Chip 
                label={`${results.added} Added`} 
                color="success" 
              />
              <Chip 
                label={`${results.duplicates} Duplicates Skipped`} 
                color="warning" 
              />
              {results.errors > 0 && (
                <Chip 
                  label={`${results.errors} Errors`} 
                  color="error" 
                />
              )}
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {step === 'complete' ? 'Close' : 'Cancel'}
        </Button>
        
        {step === 'preview' && (
          <Button
            variant="contained"
            onClick={handleBulkUpload}
            disabled={selectedCount === 0 || processing}
          >
            Upload {selectedCount} Items
          </Button>
        )}
        
        {step === 'upload' && (
          <Button onClick={handleClose} variant="outlined">
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}