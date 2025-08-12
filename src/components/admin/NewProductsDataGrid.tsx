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
  DragIndicator as DragIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { httpQueries } from '@/lib/http-supabase';
import FileUploadComponent from './FileUploadComponent';

interface NewProduct {
  id: number
  title: string
  description?: string
  img_url: string
  link_url: string
  sort_order?: number
  created_at?: string
  updated_at?: string
}

export default function NewProductsDataGrid() {
  const [rows, setRows] = useState<NewProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  
  // Edit dialog state
  const [editDialog, setEditDialog] = useState({
    open: false,
    product: null as NewProduct | null,
    title: '',
    description: '',
    imgUrl: '',
    linkUrl: '',
    sortOrder: 0,
  });

  // Add dialog state
  const [addDialog, setAddDialog] = useState({
    open: false,
    title: '',
    description: '',
    imgUrl: '',
    linkUrl: '',
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
      field: 'sort_order',
      headerName: 'Order',
      width: 80,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DragIcon sx={{ color: 'text.secondary', cursor: 'grab' }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'img_url',
      headerName: 'Image',
      width: 80,
      renderCell: (params) => (
        params.value ? (
          <Avatar
            src={params.value.startsWith('http') ? params.value : `/images/new-products/${params.value}`}
            alt="Product"
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
      field: 'description',
      headerName: 'Description',
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
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'link_url',
      headerName: 'Link',
      width: 100,
      renderCell: (params) => (
        params.value ? (
          <Button
            size="small"
            variant="outlined"
            onClick={() => window.open(params.value, '_blank')}
            sx={{ fontSize: '0.75rem' }}
          >
            Open
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
        httpQueries.getGenericData('new_products', {
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          orderBy: 'sort_order',
          orderDirection: 'asc'
        }),
        httpQueries.getGenericCount('new_products')
      ]);

      if (dataResult.error) throw dataResult.error;

      setRows(dataResult.data as NewProduct[]);
      setTotalRows(countResult.count || 0);
      
    } catch (error) {
      console.error('Error fetching new products:', error);
      setSnackbar({
        open: true,
        message: `Failed to load new products: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
  const handleEdit = (product: NewProduct) => {
    setEditDialog({
      open: true,
      product,
      title: product.title,
      description: product.description || '',
      imgUrl: product.img_url,
      linkUrl: product.link_url,
      sortOrder: product.sort_order || 0,
    });
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editDialog.product || !editDialog.title.trim()) {
      setSnackbar({
        open: true,
        message: 'Title is required',
        severity: 'error',
      });
      return;
    }

    try {
      const { error } = await httpQueries.updateGeneric('new_products', editDialog.product.id, {
        title: editDialog.title.trim(),
        description: editDialog.description,
        img_url: editDialog.imgUrl,
        link_url: editDialog.linkUrl,
        sort_order: editDialog.sortOrder,
      });

      if (error) throw error;

      setSnackbar({
        open: true,
        message: 'New product updated successfully!',
        severity: 'success',
      });

      setEditDialog({ open: false, product: null, title: '', description: '', imgUrl: '', linkUrl: '', sortOrder: 0 });
      fetchData();
    } catch (error) {
      console.error('Error updating new product:', error);
      setSnackbar({
        open: true,
        message: `Failed to update new product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle add new
  const handleAdd = () => {
    // Get next sort order
    const maxSortOrder = Math.max(...rows.map(r => r.sort_order || 0), 0);
    setAddDialog({
      open: true,
      title: '',
      description: '',
      imgUrl: '',
      linkUrl: '',
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
      // Get next sort order from current rows
      const nextSortOrder = Math.max(...rows.map(r => r.sort_order || 0), 0) + 1;

      const { error } = await httpQueries.insertGeneric('new_products', {
        title: addDialog.title.trim(),
        description: addDialog.description,
        img_url: addDialog.imgUrl,
        link_url: addDialog.linkUrl,
        sort_order: nextSortOrder,
      });

      if (error) throw error;

      setSnackbar({
        open: true,
        message: 'New product added successfully!',
        severity: 'success',
      });

      setAddDialog({ open: false, title: '', description: '', imgUrl: '', linkUrl: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding new product:', error);
      setSnackbar({
        open: true,
        message: `Failed to add new product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: GridRowId) => {
    if (!confirm('Are you sure you want to delete this new product?')) return;

    try {
      const { error } = await httpQueries.deleteGeneric('new_products', id);

      if (error) throw error;

      setSnackbar({
        open: true,
        message: 'New product deleted successfully!',
        severity: 'success',
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting new product:', error);
      setSnackbar({
        open: true,
        message: `Failed to delete new product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle sort order change
  const handleSortOrderChange = async (productId: number, newSortOrder: number) => {
    try {
      const { error } = await httpQueries.updateGeneric('new_products', productId, {
        sort_order: newSortOrder
      });

      if (error) throw error;

      fetchData();
    } catch (error) {
      console.error('Error updating sort order:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update sort order',
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
      ['ID', 'Sort Order', 'Title', 'Description', 'Image URL', 'Link URL', 'Created Date'],
      ...rows.map(row => [
        row.id,
        row.sort_order || 0,
        row.title,
        row.description || '',
        row.img_url,
        row.link_url,
        row.created_at ? new Date(row.created_at).toLocaleDateString('ko-KR') : ''
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `new-products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: `Successfully exported ${rows.length} new products!`,
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
            New Products Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage featured new products with image upload and custom ordering.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add Product
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
        onClose={() => setEditDialog({ open: false, product: null, title: '', description: '', imgUrl: '', linkUrl: '', sortOrder: 0 })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit New Product</DialogTitle>
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
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={editDialog.description}
            onChange={(e) => setEditDialog(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Link URL"
            fullWidth
            variant="outlined"
            value={editDialog.linkUrl}
            onChange={(e) => setEditDialog(prev => ({ ...prev, linkUrl: e.target.value }))}
            sx={{ mb: 2 }}
            placeholder="https://example.com/product-page"
          />

          <TextField
            margin="dense"
            label="Sort Order"
            type="number"
            variant="outlined"
            value={editDialog.sortOrder}
            onChange={(e) => setEditDialog(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
            sx={{ mb: 2, width: 150 }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Product Image
            </Typography>
            <FileUploadComponent
              onUpload={(fileUrl, fileName) => {
                setEditDialog(prev => ({ ...prev, imgUrl: fileUrl }));
              }}
              accept={['.jpg', '.jpeg', '.png', '.gif', '.webp']}
              maxSize={5} // 5MB
              currentFile={editDialog.imgUrl}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialog({ open: false, product: null, title: '', description: '', imgUrl: '', linkUrl: '', sortOrder: 0 })}
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
        onClose={() => setAddDialog({ open: false, title: '', description: '', imgUrl: '', linkUrl: '' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Product</DialogTitle>
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
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={addDialog.description}
            onChange={(e) => setAddDialog(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Link URL"
            fullWidth
            variant="outlined"
            value={addDialog.linkUrl}
            onChange={(e) => setAddDialog(prev => ({ ...prev, linkUrl: e.target.value }))}
            sx={{ mb: 2 }}
            placeholder="https://example.com/product-page"
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Product Image
            </Typography>
            <FileUploadComponent
              onUpload={(fileUrl, fileName) => {
                setAddDialog(prev => ({ ...prev, imgUrl: fileUrl }));
              }}
              accept={['.jpg', '.jpeg', '.png', '.gif', '.webp']}
              maxSize={5} // 5MB
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setAddDialog({ open: false, title: '', description: '', imgUrl: '', linkUrl: '' })}
          >
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