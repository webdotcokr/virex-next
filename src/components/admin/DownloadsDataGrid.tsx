'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Link,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowId,
} from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  OpenInNew as OpenInNewIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type Download = Database['public']['Tables']['downloads']['Row'];
type DownloadCategory = Database['public']['Tables']['download_categories']['Row'];

export default function DownloadsDataGrid() {
  const [rows, setRows] = useState<Download[]>([]);
  const [categories, setCategories] = useState<DownloadCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  
  // Edit dialog state
  const [editDialog, setEditDialog] = useState({
    open: false,
    download: null as Download | null,
    title: '',
    fileName: '',
    fileUrl: '',
    categoryId: 1,
  });

  // Add dialog state
  const [addDialog, setAddDialog] = useState({
    open: false,
    title: '',
    fileName: '',
    fileUrl: '',
    categoryId: 1,
  });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Get category name helper
  const getCategoryName = useCallback((categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown';
  }, [categories]);

  // Define columns
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
    },
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 300,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'file_name',
      headerName: 'File Name',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'category_id',
      headerName: 'Category',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={getCategoryName(params.value)}
          size="small"
          variant="outlined"
          sx={{ fontSize: '0.75rem' }}
        />
      ),
    },
    {
      field: 'hit_count',
      headerName: 'Downloads',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <DownloadIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">
            {params.value || 0}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'file_url',
      headerName: 'File',
      width: 80,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => window.open(params.value, '_blank')}
          title="Open file"
        >
          <OpenInNewIcon fontSize="small" />
        </IconButton>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
            year: '2-digit',
          })}
        </Typography>
      ),
    },
    {
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
    },
  ];

  // Callback to fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('download_categories')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setSnackbar({
        open: true,
        message: `Failed to load categories: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  }, []);

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching downloads...', { 
        paginationModel,
        selectedCategory,
      });
      
      let query = supabase
        .from('downloads')
        .select('*', { count: 'exact' });

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error, count } = await query
        .range(
          paginationModel.page * paginationModel.pageSize,
          (paginationModel.page + 1) * paginationModel.pageSize - 1
        )
        .order('created_at', { ascending: false });

      console.log('✅ Supabase response:', { 
        dataCount: data?.length, 
        totalCount: count, 
        error,
      });

      if (error) {
        console.error('❌ Supabase error details:', error);
        throw error;
      }

      setRows(data || []);
      setTotalRows(count || 0);
      
      if (data && data.length > 0) {
        console.log(`✅ Successfully loaded ${data.length} downloads out of ${count} total`);
        setSnackbar({
          open: true,
          message: `Loaded ${data.length} downloads`,
          severity: 'success',
        });
      } else {
        console.log('ℹ️ No downloads found');
        setSnackbar({
          open: true,
          message: 'No downloads found',
          severity: 'info',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching downloads:', error);
      setSnackbar({
        open: true,
        message: `Failed to load downloads: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
      setRows([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, selectedCategory]);

  // Load data when component mounts or filters change
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      fetchData();
    }
  }, [fetchData, categories]);

  // Handle category filter change
  const handleCategoryChange = (categoryId: number | 'all') => {
    setSelectedCategory(categoryId);
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page
  };

  // Handle edit
  const handleEdit = (download: Download) => {
    setEditDialog({
      open: true,
      download,
      title: download.title,
      fileName: download.file_name || '',
      fileUrl: download.file_url,
      categoryId: download.category_id || 1,
    });
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editDialog.download) return;

    try {
      console.log('Updating download:', editDialog.download.id, {
        title: editDialog.title,
        file_name: editDialog.fileName,
        file_url: editDialog.fileUrl,
        category_id: editDialog.categoryId,
      });

      const { data, error } = await supabase
        .from('downloads')
        .update({
          title: editDialog.title,
          file_name: editDialog.fileName,
          file_url: editDialog.fileUrl,
          category_id: editDialog.categoryId,
        })
        .eq('id', editDialog.download.id)
        .select()
        .single();

      console.log('Update response:', { data, error });

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      setSnackbar({
        open: true,
        message: 'Download updated successfully!',
        severity: 'success',
      });

      setEditDialog({ open: false, download: null, title: '', fileName: '', fileUrl: '', categoryId: 1 });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating download:', error);
      setSnackbar({
        open: true,
        message: `Failed to update download: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle add new
  const handleAdd = () => {
    setAddDialog({
      open: true,
      title: '',
      fileName: '',
      fileUrl: '',
      categoryId: 1,
    });
  };

  // Handle save add
  const handleSaveAdd = async () => {
    try {
      console.log('Adding new download:', {
        title: addDialog.title,
        file_name: addDialog.fileName,
        file_url: addDialog.fileUrl,
        category_id: addDialog.categoryId,
      });

      const { data, error } = await supabase
        .from('downloads')
        .insert({
          title: addDialog.title,
          file_name: addDialog.fileName,
          file_url: addDialog.fileUrl,
          category_id: addDialog.categoryId,
          hit_count: 0,
        })
        .select()
        .single();

      console.log('Insert response:', { data, error });

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      setSnackbar({
        open: true,
        message: 'Download added successfully!',
        severity: 'success',
      });

      setAddDialog({ open: false, title: '', fileName: '', fileUrl: '', categoryId: 1 });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error adding download:', error);
      setSnackbar({
        open: true,
        message: `Failed to add download: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: GridRowId) => {
    if (!confirm('Are you sure you want to delete this download?')) return;

    try {
      console.log('Deleting download:', id);

      const { data, error } = await supabase
        .from('downloads')
        .delete()
        .eq('id', id)
        .select();

      console.log('Delete response:', { data, error });

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      setSnackbar({
        open: true,
        message: 'Download deleted successfully!',
        severity: 'success',
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting download:', error);
      setSnackbar({
        open: true,
        message: `Failed to delete download: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle export
  const handleExport = () => {
    if (rows.length === 0) {
      setSnackbar({
        open: true,
        message: 'No data to export',
        severity: 'warning',
      });
      return;
    }

    const csvContent = [
      ['ID', 'Title', 'File Name', 'Category', 'Downloads', 'Created Date', 'File URL'],
      ...rows.map(row => [
        row.id,
        row.title,
        row.file_name || '',
        getCategoryName(row.category_id || 1),
        row.hit_count || 0,
        new Date(row.created_at || '').toLocaleDateString('ko-KR'),
        row.file_url
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `downloads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: `Successfully exported ${rows.length} downloads!`,
      severity: 'success',
    });
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
            Downloads Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage download files and organize by categories.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add Download
          </Button>
          <Button
            variant="contained"
            onClick={handleExport}
            sx={{ minWidth: 120 }}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Category Filter */}
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Category Filter</InputLabel>
          <Select
            value={selectedCategory}
            label="Category Filter"
            onChange={(e) => handleCategoryChange(e.target.value as number | 'all')}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

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
        onClose={() => setEditDialog({ open: false, download: null, title: '', fileName: '', fileUrl: '', categoryId: 1 })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Download</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={editDialog.title}
            onChange={(e) => setEditDialog(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="File Name"
            fullWidth
            variant="outlined"
            value={editDialog.fileName}
            onChange={(e) => setEditDialog(prev => ({ ...prev, fileName: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="File URL"
            fullWidth
            variant="outlined"
            value={editDialog.fileUrl}
            onChange={(e) => setEditDialog(prev => ({ ...prev, fileUrl: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={editDialog.categoryId}
              label="Category"
              onChange={(e) => setEditDialog(prev => ({ ...prev, categoryId: e.target.value as number }))}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialog({ open: false, download: null, title: '', fileName: '', fileUrl: '', categoryId: 1 })}
          >
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
        onClose={() => setAddDialog({ open: false, title: '', fileName: '', fileUrl: '', categoryId: 1 })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Download</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={addDialog.title}
            onChange={(e) => setAddDialog(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="File Name"
            fullWidth
            variant="outlined"
            value={addDialog.fileName}
            onChange={(e) => setAddDialog(prev => ({ ...prev, fileName: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="File URL"
            fullWidth
            variant="outlined"
            value={addDialog.fileUrl}
            onChange={(e) => setAddDialog(prev => ({ ...prev, fileUrl: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={addDialog.categoryId}
              label="Category"
              onChange={(e) => setAddDialog(prev => ({ ...prev, categoryId: e.target.value as number }))}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setAddDialog({ open: false, title: '', fileName: '', fileUrl: '', categoryId: 1 })}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveAdd} variant="contained">
            Add Download
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