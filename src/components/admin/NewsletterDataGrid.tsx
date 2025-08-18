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
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import { httpQueries } from '@/lib/http-supabase';

interface NewsletterSubscription {
  id: number
  email: string
  is_active: boolean
  subscribed_at?: string
}

export default function NewsletterDataGrid() {
  const [rows, setRows] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  
  // Edit dialog state
  const [editDialog, setEditDialog] = useState({
    open: false,
    subscription: null as NewsletterSubscription | null,
    email: '',
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
      field: 'email',
      headerName: 'Email Address',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'subscribed_at',
      headerName: 'Date',
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
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          icon={params.value ? <ActiveIcon /> : <InactiveIcon />}
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
          variant="outlined"
          sx={{ fontSize: '0.75rem' }}
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          key="toggle"
          icon={params.row.is_active ? <InactiveIcon /> : <ActiveIcon />}
          label={params.row.is_active ? 'Deactivate' : 'Activate'}
          onClick={() => handleToggleStatus(params.id, params.row.is_active)}
          color={params.row.is_active ? 'default' : 'success'}
        />,
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

  // Fetch data function with HTTP queries
  const fetchData = useCallback(async () => {
    setLoading(true);
    
    try {
      const [dataResult, countResult] = await Promise.all([
        httpQueries.getGenericData('newsletter_subscriptions', {
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          orderBy: 'subscribed_at',
          orderDirection: 'desc'
        }),
        httpQueries.getGenericCount('newsletter_subscriptions')
      ]);

      if (dataResult.error) throw dataResult.error;

      setRows(dataResult.data as NewsletterSubscription[]);
      setTotalRows(countResult.count || 0);
      
    } catch (error) {
      console.error('Error fetching newsletter subscriptions:', error);
      setSnackbar({
        open: true,
        message: `Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`,
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

  // Handle toggle subscription status
  const handleToggleStatus = async (id: GridRowId, currentStatus: boolean) => {
    try {
      const { error } = await httpQueries.updateGeneric('newsletter_subscriptions', id, {
        is_active: !currentStatus
      });

      if (error) throw error;

      setSnackbar({
        open: true,
        message: 'Subscription status updated successfully!',
        severity: 'success',
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating subscription status:', error);
      setSnackbar({
        open: true,
        message: `Failed to update: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle edit
  const handleEdit = (subscription: NewsletterSubscription) => {
    setEditDialog({
      open: true,
      subscription,
      email: subscription.email,
    });
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editDialog.subscription || !editDialog.email.trim()) return;

    try {
      const { error } = await httpQueries.updateGeneric('newsletter_subscriptions', editDialog.subscription.id, {
        email: editDialog.email.trim()
      });

      if (error) throw error;

      setSnackbar({
        open: true,
        message: 'Subscription updated successfully!',
        severity: 'success',
      });

      setEditDialog({ open: false, subscription: null, email: '' });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating subscription:', error);
      setSnackbar({
        open: true,
        message: `Failed to update: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: GridRowId) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;

    try {
      const { error } = await httpQueries.deleteGeneric('newsletter_subscriptions', id);

      if (error) throw error;

      setSnackbar({
        open: true,
        message: 'Subscription deleted successfully!',
        severity: 'success',
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting subscription:', error);
      setSnackbar({
        open: true,
        message: `Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Newsletter Subscriptions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage newsletter subscriptions and subscriber status
        </Typography>
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
        onClose={() => setEditDialog({ open: false, subscription: null, email: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Email Address</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={editDialog.email}
            onChange={(e) => setEditDialog(prev => ({ ...prev, email: e.target.value }))}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, subscription: null, email: '' })}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save Changes
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