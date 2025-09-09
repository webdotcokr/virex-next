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
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { httpQueries } from '@/lib/http-supabase';
import FileUploadComponent from './FileUploadComponent';

interface Series {
  id: number
  series_name: string
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
  strength_1?: string
  strength_2?: string
  strength_3?: string
  strength_4?: string
  strength_5?: string
  strength_6?: string
  app_title_1?: string
  app_image_1?: string
  app_title_2?: string
  app_image_2?: string
  app_title_3?: string
  app_image_3?: string
  app_title_4?: string
  app_image_4?: string
  text_title_1?: string
  text_desc_1?: string
  text_image_url_1?: string
  text_title_2?: string
  text_desc_2?: string
  text_image_url_2?: string
  text_title_3?: string
  text_desc_3?: string
  text_image_url_3?: string
  text_title_4?: string
  text_desc_4?: string
  text_image_url_4?: string
  text_title_5?: string
  text_desc_5?: string
  text_image_url_5?: string
  created_at?: string
  updated_at?: string
}


export default function SeriesDataGrid() {
  const [rows, setRows] = useState<Series[]>([]);
  
  // Image preview handler
  const handleImagePreview = (imageUrl: string) => {
    if (imageUrl) {
      window.open(imageUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    }
  };
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
    strength1: '',
    strength2: '',
    strength3: '',
    strength4: '',
    strength5: '',
    strength6: '',
    appTitle1: '',
    appImage1: '',
    appTitle2: '',
    appImage2: '',
    appTitle3: '',
    appImage3: '',
    appTitle4: '',
    appImage4: '',
    textTitle1: '',
    textDesc1: '',
    textImageUrl1: '',
    textTitle2: '',
    textDesc2: '',
    textImageUrl2: '',
    textTitle3: '',
    textDesc3: '',
    textImageUrl3: '',
    textTitle4: '',
    textDesc4: '',
    textImageUrl4: '',
    textTitle5: '',
    textDesc5: '',
    textImageUrl5: '',
  });

  // Add dialog state
  const [addDialog, setAddDialog] = useState({
    open: false,
    seriesName: '',
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
    strength1: '',
    strength2: '',
    strength3: '',
    strength4: '',
    strength5: '',
    strength6: '',
    appTitle1: '',
    appImage1: '',
    appTitle2: '',
    appImage2: '',
    appTitle3: '',
    appImage3: '',
    appTitle4: '',
    appImage4: '',
    textTitle1: '',
    textDesc1: '',
    textImageUrl1: '',
    textTitle2: '',
    textDesc2: '',
    textImageUrl2: '',
    textTitle3: '',
    textDesc3: '',
    textImageUrl3: '',
    textTitle4: '',
    textDesc4: '',
    textImageUrl4: '',
    textTitle5: '',
    textDesc5: '',
    textImageUrl5: '',
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
    fetchData();
  }, [fetchData]);

  // Handle edit
  const handleEdit = (series: Series) => {
    setEditDialog({
      open: true,
      series,
      seriesName: series.series_name || '',
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
      strength1: series.strength_1 || '',
      strength2: series.strength_2 || '',
      strength3: series.strength_3 || '',
      strength4: series.strength_4 || '',
      strength5: series.strength_5 || '',
      strength6: series.strength_6 || '',
      appTitle1: series.app_title_1 || '',
      appImage1: series.app_image_1 || '',
      appTitle2: series.app_title_2 || '',
      appImage2: series.app_image_2 || '',
      appTitle3: series.app_title_3 || '',
      appImage3: series.app_image_3 || '',
      appTitle4: series.app_title_4 || '',
      appImage4: series.app_image_4 || '',
      textTitle1: series.text_title_1 || '',
      textDesc1: series.text_desc_1 || '',
      textImageUrl1: series.text_image_url_1 || '',
      textTitle2: series.text_title_2 || '',
      textDesc2: series.text_desc_2 || '',
      textImageUrl2: series.text_image_url_2 || '',
      textTitle3: series.text_title_3 || '',
      textDesc3: series.text_desc_3 || '',
      textImageUrl3: series.text_image_url_3 || '',
      textTitle4: series.text_title_4 || '',
      textDesc4: series.text_desc_4 || '',
      textImageUrl4: series.text_image_url_4 || '',
      textTitle5: series.text_title_5 || '',
      textDesc5: series.text_desc_5 || '',
      textImageUrl5: series.text_image_url_5 || '',
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
        strength_1: editDialog.strength1,
        strength_2: editDialog.strength2,
        strength_3: editDialog.strength3,
        strength_4: editDialog.strength4,
        strength_5: editDialog.strength5,
        strength_6: editDialog.strength6,
        app_title_1: editDialog.appTitle1,
        app_image_1: editDialog.appImage1,
        app_title_2: editDialog.appTitle2,
        app_image_2: editDialog.appImage2,
        app_title_3: editDialog.appTitle3,
        app_image_3: editDialog.appImage3,
        app_title_4: editDialog.appTitle4,
        app_image_4: editDialog.appImage4,
        text_title_1: editDialog.textTitle1,
        text_desc_1: editDialog.textDesc1,
        text_image_url_1: editDialog.textImageUrl1,
        text_title_2: editDialog.textTitle2,
        text_desc_2: editDialog.textDesc2,
        text_image_url_2: editDialog.textImageUrl2,
        text_title_3: editDialog.textTitle3,
        text_desc_3: editDialog.textDesc3,
        text_image_url_3: editDialog.textImageUrl3,
        text_title_4: editDialog.textTitle4,
        text_desc_4: editDialog.textDesc4,
        text_image_url_4: editDialog.textImageUrl4,
        text_title_5: editDialog.textTitle5,
        text_desc_5: editDialog.textDesc5,
        text_image_url_5: editDialog.textImageUrl5,
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
        strength_1: addDialog.strength1,
        strength_2: addDialog.strength2,
        strength_3: addDialog.strength3,
        strength_4: addDialog.strength4,
        strength_5: addDialog.strength5,
        strength_6: addDialog.strength6,
        app_title_1: addDialog.appTitle1,
        app_image_1: addDialog.appImage1,
        app_title_2: addDialog.appTitle2,
        app_image_2: addDialog.appImage2,
        app_title_3: addDialog.appTitle3,
        app_image_3: addDialog.appImage3,
        app_title_4: addDialog.appTitle4,
        app_image_4: addDialog.appImage4,
        text_title_1: addDialog.textTitle1,
        text_desc_1: addDialog.textDesc1,
        text_image_url_1: addDialog.textImageUrl1,
        text_title_2: addDialog.textTitle2,
        text_desc_2: addDialog.textDesc2,
        text_image_url_2: addDialog.textImageUrl2,
        text_title_3: addDialog.textTitle3,
        text_desc_3: addDialog.textDesc3,
        text_image_url_3: addDialog.textImageUrl3,
        text_title_4: addDialog.textTitle4,
        text_desc_4: addDialog.textDesc4,
        text_image_url_4: addDialog.textImageUrl4,
        text_title_5: addDialog.textTitle5,
        text_desc_5: addDialog.textDesc5,
        text_image_url_5: addDialog.textImageUrl5,
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
      [
        'ID', 'Series Name', 'Intro Text', 'Short Text', 'YouTube URL', 'Feature Image URL',
        'Feature Title 1', 'Feature Desc 1', 'Feature Title 2', 'Feature Desc 2', 'Feature Title 3', 'Feature Desc 3', 'Feature Title 4', 'Feature Desc 4',
        'Strength 1', 'Strength 2', 'Strength 3', 'Strength 4', 'Strength 5', 'Strength 6',
        'App Title 1', 'App Image 1', 'App Title 2', 'App Image 2', 'App Title 3', 'App Image 3', 'App Title 4', 'App Image 4',
        'Text Title 1', 'Text Desc 1', 'Text Image URL 1', 'Text Title 2', 'Text Desc 2', 'Text Image URL 2',
        'Text Title 3', 'Text Desc 3', 'Text Image URL 3', 'Text Title 4', 'Text Desc 4', 'Text Image URL 4',
        'Text Title 5', 'Text Desc 5', 'Text Image URL 5', 'Created Date'
      ],
      ...rows.map(row => [
        row.id,
        row.series_name || '',
        row.intro_text || '',
        row.short_text || '',
        row.youtube_url || '',
        row.feature_image_url || '',
        row.feature_title_1 || '',
        row.feature_desc_1 || '',
        row.feature_title_2 || '',
        row.feature_desc_2 || '',
        row.feature_title_3 || '',
        row.feature_desc_3 || '',
        row.feature_title_4 || '',
        row.feature_desc_4 || '',
        row.strength_1 || '',
        row.strength_2 || '',
        row.strength_3 || '',
        row.strength_4 || '',
        row.strength_5 || '',
        row.strength_6 || '',
        row.app_title_1 || '',
        row.app_image_1 || '',
        row.app_title_2 || '',
        row.app_image_2 || '',
        row.app_title_3 || '',
        row.app_image_3 || '',
        row.app_title_4 || '',
        row.app_image_4 || '',
        row.text_title_1 || '',
        row.text_desc_1 || '',
        row.text_image_url_1 || '',
        row.text_title_2 || '',
        row.text_desc_2 || '',
        row.text_image_url_2 || '',
        row.text_title_3 || '',
        row.text_desc_3 || '',
        row.text_image_url_3 || '',
        row.text_title_4 || '',
        row.text_desc_4 || '',
        row.text_image_url_4 || '',
        row.text_title_5 || '',
        row.text_desc_5 || '',
        row.text_image_url_5 || '',
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
      strength1: '',
      strength2: '',
      strength3: '',
      strength4: '',
      strength5: '',
      strength6: '',
      appTitle1: '',
      appImage1: '',
      appTitle2: '',
      appImage2: '',
      appTitle3: '',
      appImage3: '',
      appTitle4: '',
      appImage4: '',
      textTitle1: '',
      textDesc1: '',
      textImageUrl1: '',
      textTitle2: '',
      textDesc2: '',
      textImageUrl2: '',
      textTitle3: '',
      textDesc3: '',
      textImageUrl3: '',
      textTitle4: '',
      textDesc4: '',
      textImageUrl4: '',
      textTitle5: '',
      textDesc5: '',
      textImageUrl5: '',
    });
  };

  const resetAddDialog = () => {
    setAddDialog({ 
      open: false, 
      seriesName: '', 
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
      strength1: '',
      strength2: '',
      strength3: '',
      strength4: '',
      strength5: '',
      strength6: '',
      appTitle1: '',
      appImage1: '',
      appTitle2: '',
      appImage2: '',
      appTitle3: '',
      appImage3: '',
      appTitle4: '',
      appImage4: '',
      textTitle1: '',
      textDesc1: '',
      textImageUrl1: '',
      textTitle2: '',
      textDesc2: '',
      textImageUrl2: '',
      textTitle3: '',
      textDesc3: '',
      textImageUrl3: '',
      textTitle4: '',
      textDesc4: '',
      textImageUrl4: '',
      textTitle5: '',
      textDesc5: '',
      textImageUrl5: '',
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
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh', maxHeight: '90vh' }
        }}
      >
        <DialogTitle>Edit Series</DialogTitle>
        <DialogContent sx={{ pt: 2, overflow: 'auto' }}>
          {/* Basic Information Section */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
            기본 정보
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, 
            gap: 2, 
            mb: 3 
          }}>
            <TextField
              autoFocus
              label="Series Name"
              variant="outlined"
              value={editDialog.seriesName}
              onChange={(e) => setEditDialog(prev => ({ ...prev, seriesName: e.target.value }))}
              size="small"
              required
            />


            <TextField
              label="YouTube URL"
              variant="outlined"
              value={editDialog.youtubeUrl}
              onChange={(e) => setEditDialog(prev => ({ ...prev, youtubeUrl: e.target.value }))}
              size="small"
              placeholder="https://youtube.com/watch?v=..."
            />
          </Box>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 2, 
            mb: 3 
          }}>
            <TextField
              label="Introduction Text"
              multiline
              rows={3}
              variant="outlined"
              value={editDialog.introText}
              onChange={(e) => setEditDialog(prev => ({ ...prev, introText: e.target.value }))}
              size="small"
            />

            <TextField
              label="Short Text"
              multiline
              rows={3}
              variant="outlined"
              value={editDialog.shortText}
              onChange={(e) => setEditDialog(prev => ({ ...prev, shortText: e.target.value }))}
              size="small"
            />
          </Box>

          {/* Features Section */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
            주요 특징 (Features)
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 2, 
            mb: 3 
          }}>
            {[1, 2, 3, 4].map((num) => (
              <Box key={num} sx={{ border: '1px solid #e0e0e0', p: 2, borderRadius: 1, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle2" gutterBottom color="primary">Feature {num}</Typography>
                <TextField
                  label={`Title`}
                  fullWidth
                  variant="outlined"
                  value={editDialog[`featureTitle${num}` as keyof typeof editDialog] as string || ''}
                  onChange={(e) => setEditDialog(prev => ({ ...prev, [`featureTitle${num}`]: e.target.value }))}
                  sx={{ mb: 1 }}
                  size="small"
                />
                <TextField
                  label={`Description`}
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  value={editDialog[`featureDesc${num}` as keyof typeof editDialog] as string || ''}
                  onChange={(e) => setEditDialog(prev => ({ ...prev, [`featureDesc${num}`]: e.target.value }))}
                  size="small"
                />
              </Box>
            ))}
          </Box>


          {/* Text Content Section */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
            텍스트 콘텐츠 (Text Content)
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, 
            gap: 2, 
            mb: 3 
          }}>
            {[1, 2, 3, 4, 5].map((num) => (
              <Box key={num} sx={{ border: '1px solid #e0e0e0', p: 2, borderRadius: 1, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle2" gutterBottom color="primary">Text Content {num}</Typography>
                <TextField
                  label={`Title`}
                  fullWidth
                  variant="outlined"
                  value={editDialog[`textTitle${num}` as keyof typeof editDialog] as string || ''}
                  onChange={(e) => setEditDialog(prev => ({ ...prev, [`textTitle${num}`]: e.target.value }))}
                  sx={{ mb: 1 }}
                  size="small"
                />
                <TextField
                  label={`Description`}
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  value={editDialog[`textDesc${num}` as keyof typeof editDialog] as string || ''}
                  onChange={(e) => setEditDialog(prev => ({ ...prev, [`textDesc${num}`]: e.target.value }))}
                  sx={{ mb: 1 }}
                  size="small"
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    label={`Image URL`}
                    fullWidth
                    variant="outlined"
                    value={editDialog[`textImageUrl${num}` as keyof typeof editDialog] as string || ''}
                    onChange={(e) => setEditDialog(prev => ({ ...prev, [`textImageUrl${num}`]: e.target.value }))}
                    size="small"
                    placeholder="Image URL or upload file"
                  />
                  {editDialog[`textImageUrl${num}` as keyof typeof editDialog] && (
                    <IconButton
                      size="small"
                      onClick={() => handleImagePreview(editDialog[`textImageUrl${num}` as keyof typeof editDialog] as string)}
                      title="Preview Image"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Box sx={{ minWidth: 100 }}>
                    <FileUploadComponent
                      category="series"
                      onUpload={(fileUrl) => {
                        setEditDialog(prev => ({ ...prev, [`textImageUrl${num}`]: fileUrl }));
                      }}
                      accept={['.jpg', '.jpeg', '.png', '.gif', '.webp']}
                      maxSize={5}
                      currentFile={editDialog[`textImageUrl${num}` as keyof typeof editDialog] as string || ''}
                    />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Strengths Section */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
            강점 (Strengths)
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, 
            gap: 2, 
            mb: 3 
          }}>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <TextField
                key={num}
                label={`Strength ${num}`}
                variant="outlined"
                value={editDialog[`strength${num}` as keyof typeof editDialog] as string || ''}
                onChange={(e) => setEditDialog(prev => ({ ...prev, [`strength${num}`]: e.target.value }))}
                size="small"
              />
            ))}
          </Box>

          {/* Applications Section */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
           응용 분야 (Applications)
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 2, 
            mb: 3 
          }}>
            {[1, 2, 3, 4].map((num) => (
              <Box key={num} sx={{ border: '1px solid #e0e0e0', p: 2, borderRadius: 1, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle2" gutterBottom color="primary">Application {num}</Typography>
                <TextField
                  label={`App Title`}
                  fullWidth
                  variant="outlined"
                  value={editDialog[`appTitle${num}` as keyof typeof editDialog] as string || ''}
                  onChange={(e) => setEditDialog(prev => ({ ...prev, [`appTitle${num}`]: e.target.value }))}
                  sx={{ mb: 1 }}
                  size="small"
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    label={`App Image URL`}
                    fullWidth
                    variant="outlined"
                    value={editDialog[`appImage${num}` as keyof typeof editDialog] as string || ''}
                    onChange={(e) => setEditDialog(prev => ({ ...prev, [`appImage${num}`]: e.target.value }))}
                    size="small"
                    placeholder="Image URL or upload file"
                  />
                  {editDialog[`appImage${num}` as keyof typeof editDialog] && (
                    <IconButton
                      size="small"
                      onClick={() => handleImagePreview(editDialog[`appImage${num}` as keyof typeof editDialog] as string)}
                      title="Preview Image"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Box sx={{ minWidth: 100 }}>
                    <FileUploadComponent
                      category="series"
                      onUpload={(fileUrl) => {
                        setEditDialog(prev => ({ ...prev, [`appImage${num}`]: fileUrl }));
                      }}
                      accept={['.jpg', '.jpeg', '.png', '.gif', '.webp']}
                      maxSize={5}
                      currentFile={editDialog[`appImage${num}` as keyof typeof editDialog] as string || ''}
                    />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Feature Image Upload */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
           대표 이미지 (Feature Image)
          </Typography>
          <Box sx={{ mb: 2 }}>
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
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh', maxHeight: '90vh' }
        }}
      >
        <DialogTitle>Add Series</DialogTitle>
        <DialogContent sx={{ pt: 2, overflow: 'auto' }}>
          {/* Basic Information Section */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
            📋 기본 정보
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, 
            gap: 2, 
            mb: 3 
          }}>
            <TextField
              autoFocus
              label="Series Name"
              variant="outlined"
              value={addDialog.seriesName}
              onChange={(e) => setAddDialog(prev => ({ ...prev, seriesName: e.target.value }))}
              size="small"
              required
            />


            <TextField
              label="YouTube URL"
              variant="outlined"
              value={addDialog.youtubeUrl}
              onChange={(e) => setAddDialog(prev => ({ ...prev, youtubeUrl: e.target.value }))}
              size="small"
              placeholder="https://youtube.com/watch?v=..."
            />
          </Box>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 2, 
            mb: 3 
          }}>
            <TextField
              label="Introduction Text"
              multiline
              rows={3}
              variant="outlined"
              value={addDialog.introText}
              onChange={(e) => setAddDialog(prev => ({ ...prev, introText: e.target.value }))}
              size="small"
            />

            <TextField
              label="Short Text"
              multiline
              rows={3}
              variant="outlined"
              value={addDialog.shortText}
              onChange={(e) => setAddDialog(prev => ({ ...prev, shortText: e.target.value }))}
              size="small"
            />
          </Box>

          {/* Features Section */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
            ⭐ 주요 특징 (Features)
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 2, 
            mb: 3 
          }}>
            {[1, 2, 3, 4].map((num) => (
              <Box key={num} sx={{ border: '1px solid #e0e0e0', p: 2, borderRadius: 1, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle2" gutterBottom color="primary">Feature {num}</Typography>
                <TextField
                  label={`Title`}
                  fullWidth
                  variant="outlined"
                  value={addDialog[`featureTitle${num}` as keyof typeof addDialog] as string || ''}
                  onChange={(e) => setAddDialog(prev => ({ ...prev, [`featureTitle${num}`]: e.target.value }))}
                  sx={{ mb: 1 }}
                  size="small"
                />
                <TextField
                  label={`Description`}
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  value={addDialog[`featureDesc${num}` as keyof typeof addDialog] as string || ''}
                  onChange={(e) => setAddDialog(prev => ({ ...prev, [`featureDesc${num}`]: e.target.value }))}
                  size="small"
                />
              </Box>
            ))}
          </Box>

          {/* Strengths Section */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
            💪 강점 (Strengths)
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, 
            gap: 2, 
            mb: 3 
          }}>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <TextField
                key={num}
                label={`Strength ${num}`}
                variant="outlined"
                value={addDialog[`strength${num}` as keyof typeof addDialog] as string || ''}
                onChange={(e) => setAddDialog(prev => ({ ...prev, [`strength${num}`]: e.target.value }))}
                size="small"
              />
            ))}
          </Box>

          {/* Applications Section */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
            🎯 응용 분야 (Applications)
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 2, 
            mb: 3 
          }}>
            {[1, 2, 3, 4].map((num) => (
              <Box key={num} sx={{ border: '1px solid #e0e0e0', p: 2, borderRadius: 1, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle2" gutterBottom color="primary">Application {num}</Typography>
                <TextField
                  label={`App Title`}
                  fullWidth
                  variant="outlined"
                  value={addDialog[`appTitle${num}` as keyof typeof addDialog] as string || ''}
                  onChange={(e) => setAddDialog(prev => ({ ...prev, [`appTitle${num}`]: e.target.value }))}
                  sx={{ mb: 1 }}
                  size="small"
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    label={`App Image URL`}
                    fullWidth
                    variant="outlined"
                    value={addDialog[`appImage${num}` as keyof typeof addDialog] as string || ''}
                    onChange={(e) => setAddDialog(prev => ({ ...prev, [`appImage${num}`]: e.target.value }))}
                    size="small"
                    placeholder="Image URL or upload file"
                  />
                  {addDialog[`appImage${num}` as keyof typeof addDialog] && (
                    <IconButton
                      size="small"
                      onClick={() => handleImagePreview(addDialog[`appImage${num}` as keyof typeof addDialog] as string)}
                      title="Preview Image"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Box sx={{ minWidth: 100 }}>
                    <FileUploadComponent
                      category="series"
                      onUpload={(fileUrl) => {
                        setAddDialog(prev => ({ ...prev, [`appImage${num}`]: fileUrl }));
                      }}
                      accept={['.jpg', '.jpeg', '.png', '.gif', '.webp']}
                      maxSize={5}
                      currentFile={addDialog[`appImage${num}` as keyof typeof addDialog] as string || ''}
                    />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Text Content Section */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
            📝 텍스트 콘텐츠 (Text Content)
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, 
            gap: 2, 
            mb: 3 
          }}>
            {[1, 2, 3, 4, 5].map((num) => (
              <Box key={num} sx={{ border: '1px solid #e0e0e0', p: 2, borderRadius: 1, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle2" gutterBottom color="primary">Text Content {num}</Typography>
                <TextField
                  label={`Title`}
                  fullWidth
                  variant="outlined"
                  value={addDialog[`textTitle${num}` as keyof typeof addDialog] as string || ''}
                  onChange={(e) => setAddDialog(prev => ({ ...prev, [`textTitle${num}`]: e.target.value }))}
                  sx={{ mb: 1 }}
                  size="small"
                />
                <TextField
                  label={`Description`}
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  value={addDialog[`textDesc${num}` as keyof typeof addDialog] as string || ''}
                  onChange={(e) => setAddDialog(prev => ({ ...prev, [`textDesc${num}`]: e.target.value }))}
                  sx={{ mb: 1 }}
                  size="small"
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    label={`Image URL`}
                    fullWidth
                    variant="outlined"
                    value={addDialog[`textImageUrl${num}` as keyof typeof addDialog] as string || ''}
                    onChange={(e) => setAddDialog(prev => ({ ...prev, [`textImageUrl${num}`]: e.target.value }))}
                    size="small"
                    placeholder="Image URL or upload file"
                  />
                  {addDialog[`textImageUrl${num}` as keyof typeof addDialog] && (
                    <IconButton
                      size="small"
                      onClick={() => handleImagePreview(addDialog[`textImageUrl${num}` as keyof typeof addDialog] as string)}
                      title="Preview Image"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Box sx={{ minWidth: 100 }}>
                    <FileUploadComponent
                      category="series"
                      onUpload={(fileUrl) => {
                        setAddDialog(prev => ({ ...prev, [`textImageUrl${num}`]: fileUrl }));
                      }}
                      accept={['.jpg', '.jpeg', '.png', '.gif', '.webp']}
                      maxSize={5}
                      currentFile={addDialog[`textImageUrl${num}` as keyof typeof addDialog] as string || ''}
                    />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Feature Image Upload */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
            🖼️ 대표 이미지 (Feature Image)
          </Typography>
          <Box sx={{ mb: 2 }}>
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