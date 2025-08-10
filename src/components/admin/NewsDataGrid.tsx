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
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
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
  Visibility as VisibilityIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import FileUploadComponent from './FileUploadComponent';
import type { Database } from '@/lib/supabase';

type News = Database['public']['Tables']['news']['Row'];

export default function NewsDataGrid() {
  const [rows, setRows] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedTab, setSelectedTab] = useState(0); // 0: News, 1: Media
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  
  // Edit dialog state
  const [editDialog, setEditDialog] = useState({
    open: false,
    news: null as News | null,
    title: '',
    content: '',
    thumbnailUrl: '',
    isFeatured: false,
  });

  // Add dialog state
  const [addDialog, setAddDialog] = useState({
    open: false,
    title: '',
    content: '',
    thumbnailUrl: '',
    isFeatured: false,
  });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Get current category ID based on selected tab
  const getCurrentCategoryId = useCallback(() => {
    return selectedTab === 0 ? 1 : 2; // 1: News, 2: Media
  }, [selectedTab]);

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
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value === 1 ? 'News' : 'Media'}
          color={params.value === 1 ? 'primary' : 'secondary'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'view_count',
      headerName: 'Views',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <VisibilityIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="body2">
            {params.value || 0}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'is_featured',
      headerName: 'Featured',
      width: 100,
      renderCell: (params) => (
        params.value ? (
          <StarIcon sx={{ color: 'orange', fontSize: 20 }} />
        ) : (
          <StarBorderIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
        )
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

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const categoryId = getCurrentCategoryId();
      console.log('🔄 Fetching news...', { 
        paginationModel,
        categoryId,
        tab: selectedTab === 0 ? 'News' : 'Media'
      });
      
      const { data, error, count } = await supabase
        .from('news')
        .select('*', { count: 'exact' })
        .eq('category_id', categoryId)
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
        console.log(`✅ Successfully loaded ${data.length} ${selectedTab === 0 ? 'news' : 'media'} out of ${count} total`);
        setSnackbar({
          open: true,
          message: `Loaded ${data.length} ${selectedTab === 0 ? 'news' : 'media'} items`,
          severity: 'success',
        });
      } else {
        console.log(`ℹ️ No ${selectedTab === 0 ? 'news' : 'media'} found`);
        setSnackbar({
          open: true,
          message: `No ${selectedTab === 0 ? 'news' : 'media'} found`,
          severity: 'info',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching news:', error);
      setSnackbar({
        open: true,
        message: `Failed to load ${selectedTab === 0 ? 'news' : 'media'}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
      setRows([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, selectedTab, getCurrentCategoryId]);

  // Load data when component mounts or tab/pagination changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page
  };

  // Handle edit
  const handleEdit = (news: News) => {
    setEditDialog({
      open: true,
      news,
      title: news.title,
      content: news.content,
      thumbnailUrl: news.thumbnail_url || '',
      isFeatured: news.is_featured || false,
    });
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editDialog.news || !editDialog.title.trim()) {
      setSnackbar({
        open: true,
        message: 'Title is required',
        severity: 'error',
      });
      return;
    }

    try {
      console.log('Updating news:', editDialog.news.id, {
        title: editDialog.title.trim(),
        content: editDialog.content,
        thumbnail_url: editDialog.thumbnailUrl || null,
        is_featured: editDialog.isFeatured,
      });

      const { data, error } = await supabase
        .from('news')
        .update({
          title: editDialog.title.trim(),
          content: editDialog.content,
          thumbnail_url: editDialog.thumbnailUrl || null,
          is_featured: editDialog.isFeatured,
        })
        .eq('id', editDialog.news.id)
        .select()
        .single();

      console.log('Update response:', { data, error });

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      setSnackbar({
        open: true,
        message: 'News updated successfully!',
        severity: 'success',
      });

      setEditDialog({ open: false, news: null, title: '', content: '', thumbnailUrl: '', isFeatured: false });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating news:', error);
      setSnackbar({
        open: true,
        message: `Failed to update news: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle add new
  const handleAdd = () => {
    setAddDialog({
      open: true,
      title: '',
      content: '',
      thumbnailUrl: '',
      isFeatured: false,
    });
  };

  // Handle save add
  const handleSaveAdd = async () => {
    if (!addDialog.title.trim()) {
      setSnackbar({
        open: true,
        message: 'Title is required',
        severity: 'error',
      });
      return;
    }

    try {
      const categoryId = getCurrentCategoryId();
      console.log('Adding new news:', {
        title: addDialog.title.trim(),
        content: addDialog.content,
        thumbnail_url: addDialog.thumbnailUrl || null,
        is_featured: addDialog.isFeatured,
        category_id: categoryId,
      });

      const { data, error } = await supabase
        .from('news')
        .insert({
          title: addDialog.title.trim(),
          content: addDialog.content,
          thumbnail_url: addDialog.thumbnailUrl || null,
          is_featured: addDialog.isFeatured,
          category_id: categoryId,
          view_count: 0,
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
        message: `${selectedTab === 0 ? 'News' : 'Media'} added successfully!`,
        severity: 'success',
      });

      setAddDialog({ open: false, title: '', content: '', thumbnailUrl: '', isFeatured: false });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error adding news:', error);
      setSnackbar({
        open: true,
        message: `Failed to add ${selectedTab === 0 ? 'news' : 'media'}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: GridRowId) => {
    if (!confirm(`Are you sure you want to delete this ${selectedTab === 0 ? 'news' : 'media'} item?`)) return;

    try {
      console.log('Deleting news:', id);

      const { data, error } = await supabase
        .from('news')
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
        message: `${selectedTab === 0 ? 'News' : 'Media'} deleted successfully!`,
        severity: 'success',
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting news:', error);
      setSnackbar({
        open: true,
        message: `Failed to delete ${selectedTab === 0 ? 'news' : 'media'}: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      ['ID', 'Title', 'Category', 'View Count', 'Featured', 'Created Date', 'Content'],
      ...rows.map(row => [
        row.id,
        row.title,
        row.category_id === 1 ? 'News' : 'Media',
        row.view_count || 0,
        row.is_featured ? 'Yes' : 'No',
        new Date(row.created_at || '').toLocaleDateString('ko-KR'),
        row.content.replace(/,/g, ';').replace(/"/g, '""') // Escape commas and quotes
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTab === 0 ? 'news' : 'media'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: `Successfully exported ${rows.length} ${selectedTab === 0 ? 'news' : 'media'} items!`,
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
            News & Media Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage news articles and media content with category separation.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add {selectedTab === 0 ? 'News' : 'Media'}
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

      {/* Category Tabs */}
      <Box sx={{ mb: 2 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label={`News (${selectedTab === 0 ? totalRows : ''})`} />
          <Tab label={`Media (${selectedTab === 1 ? totalRows : ''})`} />
        </Tabs>
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
          }}
        />
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, news: null, title: '', content: '', thumbnailUrl: '', isFeatured: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit {selectedTab === 0 ? 'News' : 'Media'}</DialogTitle>
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
            label="Content"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={editDialog.content}
            onChange={(e) => setEditDialog(prev => ({ ...prev, content: e.target.value }))}
            sx={{ mb: 2 }}
            placeholder="Enter HTML content or plain text"
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Thumbnail Image
            </Typography>
            <FileUploadComponent
              onUpload={(fileUrl, fileName) => {
                setEditDialog(prev => ({ ...prev, thumbnailUrl: fileUrl }));
              }}
              accept={['.jpg', '.jpeg', '.png', '.gif', '.webp']}
              maxSize={5} // 5MB
              currentFile={editDialog.thumbnailUrl}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={editDialog.isFeatured}
                onChange={(e) => setEditDialog(prev => ({ ...prev, isFeatured: e.target.checked }))}
              />
            }
            label="Featured Item"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialog({ open: false, news: null, title: '', content: '', thumbnailUrl: '', isFeatured: false })}
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
        onClose={() => setAddDialog({ open: false, title: '', content: '', thumbnailUrl: '', isFeatured: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New {selectedTab === 0 ? 'News' : 'Media'}</DialogTitle>
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
            label="Content"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={addDialog.content}
            onChange={(e) => setAddDialog(prev => ({ ...prev, content: e.target.value }))}
            sx={{ mb: 2 }}
            placeholder="Enter HTML content or plain text"
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Thumbnail Image
            </Typography>
            <FileUploadComponent
              onUpload={(fileUrl, fileName) => {
                setAddDialog(prev => ({ ...prev, thumbnailUrl: fileUrl }));
              }}
              accept={['.jpg', '.jpeg', '.png', '.gif', '.webp']}
              maxSize={5} // 5MB
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={addDialog.isFeatured}
                onChange={(e) => setAddDialog(prev => ({ ...prev, isFeatured: e.target.checked }))}
              />
            }
            label="Featured Item"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setAddDialog({ open: false, title: '', content: '', thumbnailUrl: '', isFeatured: false })}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveAdd} variant="contained">
            Add {selectedTab === 0 ? 'News' : 'Media'}
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