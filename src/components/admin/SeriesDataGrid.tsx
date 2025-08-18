'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Snackbar,
  IconButton,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Image as ImageIcon,
} from '@mui/icons-material';
import { httpQueries } from '@/lib/http-supabase';
import FileUploadComponent from './FileUploadComponent';

interface Series {
  id: number
  series_name: string
  category_id?: number | null
  intro_text?: string
  short_text?: string
  youtube_url?: string
  feature_image_url?: string
  feature_title_1?: string
  feature_desc_1?: string
  feature_title_2?: string
  feature_desc_2?: string
  feature_title_3?: string
  feature_desc_3?: string
  feature_title_4?: string
  feature_desc_4?: string
  created_at?: string
  updated_at?: string
}

interface Category {
  id: number
  name: string
}

export default function SeriesDataGrid() {
  const [rows, setRows] = useState<Series[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  
  // Edit dialog state
  const [editDialog, setEditDialog] = useState({
    open: false,
    series: null as Series | null,
    seriesName: '',
    categoryId: null as number | null,
    introText: '',
    shortText: '',
    youtubeUrl: '',
    featureImageUrl: '',
    featureTitle1: '',
    featureDesc1: '',
    featureTitle2: '',
    featureDesc2: '',
    featureTitle3: '',
    featureDesc3: '',
    featureTitle4: '',
    featureDesc4: '',
  });

  // Add dialog state
  const [addDialog, setAddDialog] = useState({
    open: false,
    seriesName: '',
    categoryId: null as number | null,
    introText: '',
    shortText: '',
    youtubeUrl: '',
    featureImageUrl: '',
    featureTitle1: '',
    featureDesc1: '',
    featureTitle2: '',
    featureDesc2: '',
    featureTitle3: '',
    featureDesc3: '',
    featureTitle4: '',
    featureDesc4: '',
  });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Define columns
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'feature_image_url',
      headerName: 'Image',
      width: 80,
      renderCell: (params) => (
        params.value ? (
          <Avatar
            src={params.value.startsWith('http') ? params.value : `/images/series/${params.value}`}
            alt="Series"
            sx={{ width: 40, height: 40 }}
          >
            <ImageIcon />
          </Avatar>
        ) : (
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.200' }}>
            <ImageIcon sx={{ color: 'grey.500' }} />
          </Avatar>
        )
      ),
    },
    {
      field: 'series_name',
      headerName: 'Series Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'category_id',
      headerName: 'Category',
      width: 150,
      renderCell: (params) => {
        const category = categories.find(cat => cat.id === params.value);
        return (
          <Typography variant="body2" color="text.secondary">
            {category?.name || '-'}
          </Typography>
        );
      },
    },
    {
      field: 'intro_text',
      headerName: 'Introduction',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'text.secondary',
          }}
        >
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'youtube_url',
      headerName: 'Video',
      width: 100,
      renderCell: (params) => (
        params.value ? (
          <Button
            size="small"
            variant="outlined"
            onClick={() => window.open(params.value, '_blank')}
            sx={{ fontSize: '0.75rem' }}
          >
            Watch
          </Button>
        ) : (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        )
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
            year: '2-digit',
          }) : '-'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
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

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await httpQueries.getGenericData('categories', {
        orderBy: 'name',
        orderDirection: 'asc'
      });

      if (error) throw error;
      setCategories(data as Category[] || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dataResult, countResult] = await Promise.all([
        httpQueries.getGenericData('series', {
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          orderBy: 'id',
          orderDirection: 'asc'
        }),
        httpQueries.getGenericCount('series')
      ]);

      if (dataResult.error) throw dataResult.error;

      setRows(dataResult.data as Series[] || []);
      setTotalRows(countResult.count || 0);
      
    } catch (error) {
      console.error('Error fetching series:', error);
      setSnackbar({
        open: true,
        message: `Failed to load series: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
      setRows([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [paginationModel]);

  // Load data when component mounts or pagination changes
  useEffect(() => {
    fetchCategories();
    fetchData();
  }, [fetchCategories, fetchData]);

  // Handle edit
  const handleEdit = (series: Series) => {
    setEditDialog({
      open: true,
      series,
      seriesName: series.series_name || '',
      categoryId: series.category_id,
      introText: series.intro_text || '',
      shortText: series.short_text || '',
      youtubeUrl: series.youtube_url || '',
      featureImageUrl: series.feature_image_url || '',
      featureTitle1: series.feature_title_1 || '',
      featureDesc1: series.feature_desc_1 || '',
      featureTitle2: series.feature_title_2 || '',
      featureDesc2: series.feature_desc_2 || '',
      featureTitle3: series.feature_title_3 || '',
      featureDesc3: series.feature_desc_3 || '',
      featureTitle4: series.feature_title_4 || '',
      featureDesc4: series.feature_desc_4 || '',
    });
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editDialog.series || !editDialog.seriesName.trim()) {
      setSnackbar({
        open: true,
        message: 'Series name is required',
        severity: 'error',
      });
      return;
    }

    try {
      console.log('Updating series:', editDialog.series.id, {
        series_name: editDialog.seriesName.trim(),
        category_id: editDialog.categoryId,
        intro_text: editDialog.introText,
        short_text: editDialog.shortText,
        youtube_url: editDialog.youtubeUrl,
        feature_image_url: editDialog.featureImageUrl,
        feature_title_1: editDialog.featureTitle1,
        feature_desc_1: editDialog.featureDesc1,
        feature_title_2: editDialog.featureTitle2,
        feature_desc_2: editDialog.featureDesc2,
        feature_title_3: editDialog.featureTitle3,
        feature_desc_3: editDialog.featureDesc3,
        feature_title_4: editDialog.featureTitle4,
        feature_desc_4: editDialog.featureDesc4,
      });

      const { error } = await httpQueries.updateGeneric('series', editDialog.series.id, {
        series_name: editDialog.seriesName.trim(),
        category_id: editDialog.categoryId,
        intro_text: editDialog.introText,
        short_text: editDialog.shortText,
        youtube_url: editDialog.youtubeUrl,
        feature_image_url: editDialog.featureImageUrl,
        feature_title_1: editDialog.featureTitle1,
        feature_desc_1: editDialog.featureDesc1,
        feature_title_2: editDialog.featureTitle2,
        feature_desc_2: editDialog.featureDesc2,
        feature_title_3: editDialog.featureTitle3,
        feature_desc_3: editDialog.featureDesc3,
        feature_title_4: editDialog.featureTitle4,
        feature_desc_4: editDialog.featureDesc4,
      });

      if (error) throw error;

      setSnackbar({
        open: true,
        message: 'Series updated successfully!',
        severity: 'success',
      });

      setEditDialog({ 
        open: false, 
        series: null, 
        seriesName: '', 
        categoryId: null,
        introText: '',
        shortText: '',
        youtubeUrl: '',
        featureImageUrl: '',
        featureTitle1: '',
        featureDesc1: '',
        featureTitle2: '',
        featureDesc2: '',
        featureTitle3: '',
        featureDesc3: '',
        featureTitle4: '',
        featureDesc4: '',
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating series:', error);
      setSnackbar({
        open: true,
        message: `Failed to update series: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle add new
  const handleAdd = () => {
    setAddDialog({
      open: true,
      seriesName: '',
      categoryId: null,
      introText: '',
      shortText: '',
      youtubeUrl: '',
      featureImageUrl: '',
      featureTitle1: '',
      featureDesc1: '',
      featureTitle2: '',
      featureDesc2: '',
      featureTitle3: '',
      featureDesc3: '',
      featureTitle4: '',
      featureDesc4: '',
    });
  };

  // Handle save add
  const handleSaveAdd = async () => {
    if (!addDialog.seriesName.trim()) {
      setSnackbar({
        open: true,
        message: 'Series name is required',
        severity: 'error',
      });
      return;
    }

    try {
      console.log('Adding series:', {
        series_name: addDialog.seriesName.trim(),
        category_id: addDialog.categoryId,
        intro_text: addDialog.introText,
        short_text: addDialog.shortText,
        youtube_url: addDialog.youtubeUrl,
        feature_image_url: addDialog.featureImageUrl,
        feature_title_1: addDialog.featureTitle1,
        feature_desc_1: addDialog.featureDesc1,
        feature_title_2: addDialog.featureTitle2,
        feature_desc_2: addDialog.featureDesc2,
        feature_title_3: addDialog.featureTitle3,
        feature_desc_3: addDialog.featureDesc3,
        feature_title_4: addDialog.featureTitle4,
        feature_desc_4: addDialog.featureDesc4,
      });

      const { error } = await httpQueries.insertGeneric('series', {
        series_name: addDialog.seriesName.trim(),
        category_id: addDialog.categoryId,
        intro_text: addDialog.introText,
        short_text: addDialog.shortText,
        youtube_url: addDialog.youtubeUrl,
        feature_image_url: addDialog.featureImageUrl,
        feature_title_1: addDialog.featureTitle1,
        feature_desc_1: addDialog.featureDesc1,
        feature_title_2: addDialog.featureTitle2,
        feature_desc_2: addDialog.featureDesc2,
        feature_title_3: addDialog.featureTitle3,
        feature_desc_3: addDialog.featureDesc3,
        feature_title_4: addDialog.featureTitle4,
        feature_desc_4: addDialog.featureDesc4,
      });

      if (error) throw error;

      setSnackbar({
        open: true,
        message: 'Series added successfully!',
        severity: 'success',
      });

      setAddDialog({ 
        open: false, 
        seriesName: '', 
        categoryId: null,
        introText: '',
        shortText: '',
        youtubeUrl: '',
        featureImageUrl: '',
        featureTitle1: '',
        featureDesc1: '',
        featureTitle2: '',
        featureDesc2: '',
        featureTitle3: '',
        featureDesc3: '',
        featureTitle4: '',
        featureDesc4: '',
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error adding series:', error);
      setSnackbar({
        open: true,
        message: `Failed to add series: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: GridRowId) => {
    if (!confirm('Are you sure you want to delete this series?')) return;

    try {
      const { error } = await httpQueries.deleteGeneric('series', id);

      if (error) throw error;

      setSnackbar({
        open: true,
        message: 'Series deleted successfully!',
        severity: 'success',
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting series:', error);
      setSnackbar({
        open: true,
        message: `Failed to delete series: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      ['ID', 'Series Name', 'Category ID', 'Intro Text', 'Short Text', 'YouTube URL', 'Feature Image URL', 'Created Date'],
      ...rows.map(row => [
        row.id,
        row.series_name || '',
        row.category_id || '',
        row.intro_text || '',
        row.short_text || '',
        row.youtube_url || '',
        row.feature_image_url || '',
        row.created_at ? new Date(row.created_at).toLocaleDateString('ko-KR') : ''
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `series-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: `Successfully exported ${rows.length} series!`,
      severity: 'success',
    });
  };

  const resetEditDialog = () => {
    setEditDialog({ 
      open: false, 
      series: null, 
      seriesName: '', 
      categoryId: null,
      introText: '',
      shortText: '',
      youtubeUrl: '',
      featureImageUrl: '',
      featureTitle1: '',
      featureDesc1: '',
      featureTitle2: '',
      featureDesc2: '',
      featureTitle3: '',
      featureDesc3: '',
      featureTitle4: '',
      featureDesc4: '',
    });
  };

  const resetAddDialog = () => {
    setAddDialog({ 
      open: false, 
      seriesName: '', 
      categoryId: null,
      introText: '',
      shortText: '',
      youtubeUrl: '',
      featureImageUrl: '',
      featureTitle1: '',
      featureDesc1: '',
      featureTitle2: '',
      featureDesc2: '',
      featureTitle3: '',
      featureDesc3: '',
      featureTitle4: '',
      featureDesc4: '',
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
            Series Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage product series with detailed information and image uploads.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add Series
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

      {/* Data Grid */}
      <Box sx={{ 
        height: '600px',
        width: '100%'
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
        onClose={resetEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Series</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Series Name"
            fullWidth
            variant="outlined"
            value={editDialog.seriesName}
            onChange={(e) => setEditDialog(prev => ({ ...prev, seriesName: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={editDialog.categoryId || ''}
              onChange={(e) => setEditDialog(prev => ({ 
                ...prev, 
                categoryId: e.target.value ? Number(e.target.value) : null 
              }))}
              label="Category"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Introduction Text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={editDialog.introText}
            onChange={(e) => setEditDialog(prev => ({ ...prev, introText: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Short Text"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={editDialog.shortText}
            onChange={(e) => setEditDialog(prev => ({ ...prev, shortText: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="YouTube URL"
            fullWidth
            variant="outlined"
            value={editDialog.youtubeUrl}
            onChange={(e) => setEditDialog(prev => ({ ...prev, youtubeUrl: e.target.value }))}
            sx={{ mb: 2 }}
            placeholder="https://youtube.com/watch?v=..."
          />

          {/* Feature 1 */}
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Feature 1
          </Typography>
          <TextField
            margin="dense"
            label="Feature 1 Title"
            fullWidth
            variant="outlined"
            value={editDialog.featureTitle1}
            onChange={(e) => setEditDialog(prev => ({ ...prev, featureTitle1: e.target.value }))}
            sx={{ mb: 1 }}
          />
          <TextField
            margin="dense"
            label="Feature 1 Description"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={editDialog.featureDesc1}
            onChange={(e) => setEditDialog(prev => ({ ...prev, featureDesc1: e.target.value }))}
            sx={{ mb: 2 }}
          />

          {/* Feature 2 */}
          <Typography variant="subtitle2" gutterBottom>
            Feature 2
          </Typography>
          <TextField
            margin="dense"
            label="Feature 2 Title"
            fullWidth
            variant="outlined"
            value={editDialog.featureTitle2}
            onChange={(e) => setEditDialog(prev => ({ ...prev, featureTitle2: e.target.value }))}
            sx={{ mb: 1 }}
          />
          <TextField
            margin="dense"
            label="Feature 2 Description"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={editDialog.featureDesc2}
            onChange={(e) => setEditDialog(prev => ({ ...prev, featureDesc2: e.target.value }))}
            sx={{ mb: 2 }}
          />

          {/* Feature 3 */}
          <Typography variant="subtitle2" gutterBottom>
            Feature 3
          </Typography>
          <TextField
            margin="dense"
            label="Feature 3 Title"
            fullWidth
            variant="outlined"
            value={editDialog.featureTitle3}
            onChange={(e) => setEditDialog(prev => ({ ...prev, featureTitle3: e.target.value }))}
            sx={{ mb: 1 }}
          />
          <TextField
            margin="dense"
            label="Feature 3 Description"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={editDialog.featureDesc3}
            onChange={(e) => setEditDialog(prev => ({ ...prev, featureDesc3: e.target.value }))}
            sx={{ mb: 2 }}
          />

          {/* Feature 4 */}
          <Typography variant="subtitle2" gutterBottom>
            Feature 4
          </Typography>
          <TextField
            margin="dense"
            label="Feature 4 Title"
            fullWidth
            variant="outlined"
            value={editDialog.featureTitle4}
            onChange={(e) => setEditDialog(prev => ({ ...prev, featureTitle4: e.target.value }))}
            sx={{ mb: 1 }}
          />
          <TextField
            margin="dense"
            label="Feature 4 Description"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={editDialog.featureDesc4}
            onChange={(e) => setEditDialog(prev => ({ ...prev, featureDesc4: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Feature Image
            </Typography>
            <FileUploadComponent
              category="series"
              onUpload={(fileUrl, fileName) => {
                setEditDialog(prev => ({ ...prev, featureImageUrl: fileUrl }));
              }}
              accept={['.jpg', '.jpeg', '.png', '.gif', '.webp']}
              maxSize={5} // 5MB
              currentFile={editDialog.featureImageUrl}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetEditDialog}>
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
        onClose={resetAddDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Series</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Series Name"
            fullWidth
            variant="outlined"
            value={addDialog.seriesName}
            onChange={(e) => setAddDialog(prev => ({ ...prev, seriesName: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={addDialog.categoryId || ''}
              onChange={(e) => setAddDialog(prev => ({ 
                ...prev, 
                categoryId: e.target.value ? Number(e.target.value) : null 
              }))}
              label="Category"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Introduction Text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={addDialog.introText}
            onChange={(e) => setAddDialog(prev => ({ ...prev, introText: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Short Text"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={addDialog.shortText}
            onChange={(e) => setAddDialog(prev => ({ ...prev, shortText: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="YouTube URL"
            fullWidth
            variant="outlined"
            value={addDialog.youtubeUrl}
            onChange={(e) => setAddDialog(prev => ({ ...prev, youtubeUrl: e.target.value }))}
            sx={{ mb: 2 }}
            placeholder="https://youtube.com/watch?v=..."
          />

          {/* Feature 1 */}
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Feature 1
          </Typography>
          <TextField
            margin="dense"
            label="Feature 1 Title"
            fullWidth
            variant="outlined"
            value={addDialog.featureTitle1}
            onChange={(e) => setAddDialog(prev => ({ ...prev, featureTitle1: e.target.value }))}
            sx={{ mb: 1 }}
          />
          <TextField
            margin="dense"
            label="Feature 1 Description"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={addDialog.featureDesc1}
            onChange={(e) => setAddDialog(prev => ({ ...prev, featureDesc1: e.target.value }))}
            sx={{ mb: 2 }}
          />

          {/* Feature 2 */}
          <Typography variant="subtitle2" gutterBottom>
            Feature 2
          </Typography>
          <TextField
            margin="dense"
            label="Feature 2 Title"
            fullWidth
            variant="outlined"
            value={addDialog.featureTitle2}
            onChange={(e) => setAddDialog(prev => ({ ...prev, featureTitle2: e.target.value }))}
            sx={{ mb: 1 }}
          />
          <TextField
            margin="dense"
            label="Feature 2 Description"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={addDialog.featureDesc2}
            onChange={(e) => setAddDialog(prev => ({ ...prev, featureDesc2: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Feature Image
            </Typography>
            <FileUploadComponent
              category="series"
              onUpload={(fileUrl, fileName) => {
                setAddDialog(prev => ({ ...prev, featureImageUrl: fileUrl }));
              }}
              accept={['.jpg', '.jpeg', '.png', '.gif', '.webp']}
              maxSize={5} // 5MB
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetAddDialog}>
            Cancel
          </Button>
          <Button onClick={handleSaveAdd} variant="contained">
            Add Series
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