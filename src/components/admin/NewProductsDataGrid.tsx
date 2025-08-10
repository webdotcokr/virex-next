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
import { supabase } from '@/lib/supabase';
import FileUploadComponent from './FileUploadComponent';
import type { Database } from '@/lib/supabase';

type NewProduct = Database['public']['Tables']['new_products']['Row'];

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
      console.log('🔄 Fetching new products...', { paginationModel });
      
      const { data, error, count } = await supabase
        .from('new_products')
        .select('*', { count: 'exact' })
        .range(
          paginationModel.page * paginationModel.pageSize,
          (paginationModel.page + 1) * paginationModel.pageSize - 1
        )
        .order('sort_order', { ascending: true });

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
        console.log(`✅ Successfully loaded ${data.length} new products out of ${count} total`);
        setSnackbar({
          open: true,
          message: `Loaded ${data.length} new products`,
          severity: 'success',
        });
      } else {
        console.log('ℹ️ No new products found');
        setSnackbar({
          open: true,
          message: 'No new products found',
          severity: 'info',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching new products:', error);
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
      console.log('Updating new product:', editDialog.product.id, {
        title: editDialog.title.trim(),
        description: editDialog.description,
        img_url: editDialog.imgUrl,
        link_url: editDialog.linkUrl,
        sort_order: editDialog.sortOrder,
      });

      const { data, error } = await supabase
        .from('new_products')
        .update({
          title: editDialog.title.trim(),
          description: editDialog.description,
          img_url: editDialog.imgUrl,
          link_url: editDialog.linkUrl,
          sort_order: editDialog.sortOrder,
        })
        .eq('id', editDialog.product.id)
        .select()
        .single();

      console.log('Update response:', { data, error });

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      setSnackbar({
        open: true,
        message: 'New product updated successfully!',
        severity: 'success',
      });

      setEditDialog({ open: false, product: null, title: '', description: '', imgUrl: '', linkUrl: '', sortOrder: 0 });
      fetchData(); // Refresh data
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
      // Get next sort order
      const { data: existingProducts } = await supabase
        .from('new_products')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);

      const nextSortOrder = existingProducts && existingProducts.length > 0 
        ? (existingProducts[0].sort_order || 0) + 1 
        : 1;

      console.log('Adding new product:', {
        title: addDialog.title.trim(),
        description: addDialog.description,
        img_url: addDialog.imgUrl,
        link_url: addDialog.linkUrl,
        sort_order: nextSortOrder,
      });

      const { data, error } = await supabase
        .from('new_products')
        .insert({
          title: addDialog.title.trim(),
          description: addDialog.description,
          img_url: addDialog.imgUrl,
          link_url: addDialog.linkUrl,
          sort_order: nextSortOrder,
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
        message: 'New product added successfully!',
        severity: 'success',
      });

      setAddDialog({ open: false, title: '', description: '', imgUrl: '', linkUrl: '' });
      fetchData(); // Refresh data
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
      console.log('Deleting new product:', id);

      const { data, error } = await supabase
        .from('new_products')
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
        message: 'New product deleted successfully!',
        severity: 'success',
      });

      fetchData(); // Refresh data
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
      const { error } = await supabase
        .from('new_products')
        .update({ sort_order: newSortOrder })
        .eq('id', productId);

      if (error) throw error;

      fetchData(); // Refresh data
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