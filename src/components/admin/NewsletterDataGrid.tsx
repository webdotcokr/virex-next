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
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type NewsletterSubscription = Database['public']['Tables']['newsletter_subscriptions']['Row'];

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
          {new Date(params.value).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
            year: '2-digit',
          })}
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
      width: 80,
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
      console.log('🔄 Fetching newsletter subscriptions...', { 
        paginationModel,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      });
      
      const { data, error, count } = await supabase
        .from('newsletter_subscriptions')
        .select('*', { count: 'exact' })
        .range(
          paginationModel.page * paginationModel.pageSize,
          (paginationModel.page + 1) * paginationModel.pageSize - 1
        )
        .order('subscribed_at', { ascending: false });

      console.log('✅ Supabase response:', { 
        dataCount: data?.length, 
        totalCount: count, 
        error,
        sampleData: data?.[0] 
      });

      if (error) {
        console.error('❌ Supabase error details:', error);
        throw error;
      }

      setRows(data || []);
      setTotalRows(count || 0);
      
      if (data && data.length > 0) {
        console.log(`✅ Successfully loaded ${data.length} newsletter subscriptions out of ${count} total`);
        setSnackbar({
          open: true,
          message: `Loaded ${data.length} subscriptions`,
          severity: 'success',
        });
      } else {
        console.log('ℹ️ No newsletter subscriptions found');
        setSnackbar({
          open: true,
          message: 'No newsletter subscriptions found',
          severity: 'info',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching newsletter subscriptions:', error);
      setSnackbar({
        open: true,
        message: `Failed to load newsletter subscriptions: ${error instanceof Error ? error.message : 'Unknown error'}`,
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

  // Test Supabase connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🔗 Testing Supabase connection...');
        console.log('📊 Environment check:', {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
          keyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          keyStart: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
        });

        const { data, error } = await supabase
          .from('newsletter_subscriptions')
          .select('id')
          .limit(1);
        
        console.log('🔗 Supabase connection test result:', { 
          hasData: !!data, 
          recordCount: data?.length || 0, 
          error: error?.message || null 
        });
        
        if (error) {
          console.error('❌ Supabase connection test failed:', error);
        } else {
          console.log('✅ Supabase connection successful! Found records:', data?.length || 0);
        }
      } catch (err) {
        console.error('❌ Supabase connection test error:', err);
      }
    };

    testConnection();
  }, []);

  // Listen for header export button clicks
  useEffect(() => {
    const handleExportEvent = () => {
      handleExport();
    };

    window.addEventListener('admin-export', handleExportEvent);
    
    return () => {
      window.removeEventListener('admin-export', handleExportEvent);
    };
  }, [rows]); // Re-bind when rows change

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
    if (!editDialog.subscription) return;

    try {
      console.log('Updating subscription:', editDialog.subscription.id, {
        email: editDialog.email,
        is_active: !editDialog.subscription.is_active
      });

      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .update({
          email: editDialog.email,
          is_active: !editDialog.subscription.is_active, // Toggle status
        })
        .eq('id', editDialog.subscription.id)
        .select()
        .single();

      console.log('Update response:', { data, error });

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

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
        message: `Failed to update subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: GridRowId) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;

    try {
      console.log('Deleting subscription:', id);

      const { data, error } = await supabase
        .from('newsletter_subscriptions')
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
        message: 'Subscription deleted successfully!',
        severity: 'success',
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting subscription:', error);
      setSnackbar({
        open: true,
        message: `Failed to delete subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      ['Email', 'Subscribed Date', 'Status'],
      ...rows.map(row => [
        row.email,
        new Date(row.subscribed_at).toLocaleDateString('ko-KR'),
        row.is_active ? 'Active' : 'Inactive'
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: `Successfully exported ${rows.length} newsletter subscriptions!`,
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
            Newsletter Subscriptions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your newsletter subscriber list and view subscription analytics.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleExport}
          sx={{ 
            minWidth: 120,
            alignSelf: { xs: 'flex-end', sm: 'auto' },
          }}
        >
          Export CSV
        </Button>
      </Box>

      {/* Data Grid */}
      <Box sx={{ height: { xs: 400, md: 600 }, width: '100%' }}>
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
        onClose={() => setEditDialog({ open: false, subscription: null, email: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Newsletter Subscription</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={editDialog.email}
            onChange={(e) => setEditDialog(prev => ({ ...prev, email: e.target.value }))}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialog({ open: false, subscription: null, email: '' })}
          >
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