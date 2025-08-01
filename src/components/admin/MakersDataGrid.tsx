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
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type Maker = Database['public']['Tables']['makers']['Row'];

export default function MakersDataGrid() {
  const [rows, setRows] = useState<Maker[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  
  // Edit dialog state
  const [editDialog, setEditDialog] = useState({
    open: false,
    maker: null as Maker | null,
    name: '',
  });

  // Add dialog state
  const [addDialog, setAddDialog] = useState({
    open: false,
    name: '',
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
    },
    {
      field: 'name',
      headerName: 'Maker Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </Typography>
      ),
    },
    {
      field: 'updated_at',
      headerName: 'Updated',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {new Date(params.value).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
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
      console.log('🔄 Fetching makers...', { paginationModel });
      
      const { data, error, count } = await supabase
        .from('makers')
        .select('*', { count: 'exact' })
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
        console.log(`✅ Successfully loaded ${data.length} makers out of ${count} total`);
        setSnackbar({
          open: true,
          message: `Loaded ${data.length} makers`,
          severity: 'success',
        });
      } else {
        console.log('ℹ️ No makers found');
        setSnackbar({
          open: true,
          message: 'No makers found',
          severity: 'info',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching makers:', error);
      setSnackbar({
        open: true,
        message: `Failed to load makers: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
  const handleEdit = (maker: Maker) => {
    setEditDialog({
      open: true,
      maker,
      name: maker.name,
    });
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editDialog.maker || !editDialog.name.trim()) {
      setSnackbar({
        open: true,
        message: 'Maker name is required',
        severity: 'error',
      });
      return;
    }

    try {
      console.log('Updating maker:', editDialog.maker.id, {
        name: editDialog.name.trim(),
      });

      const { data, error } = await supabase
        .from('makers')
        .update({
          name: editDialog.name.trim(),
        })
        .eq('id', editDialog.maker.id)
        .select()
        .single();

      console.log('Update response:', { data, error });

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      setSnackbar({
        open: true,
        message: 'Maker updated successfully!',
        severity: 'success',
      });

      setEditDialog({ open: false, maker: null, name: '' });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating maker:', error);
      setSnackbar({
        open: true,
        message: `Failed to update maker: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle add new
  const handleAdd = () => {
    setAddDialog({
      open: true,
      name: '',
    });
  };

  // Handle save add
  const handleSaveAdd = async () => {
    if (!addDialog.name.trim()) {
      setSnackbar({
        open: true,
        message: 'Maker name is required',
        severity: 'error',
      });
      return;
    }

    try {
      console.log('Adding new maker:', {
        name: addDialog.name.trim(),
      });

      const { data, error } = await supabase
        .from('makers')
        .insert({
          name: addDialog.name.trim(),
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
        message: 'Maker added successfully!',
        severity: 'success',
      });

      setAddDialog({ open: false, name: '' });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error adding maker:', error);
      setSnackbar({
        open: true,
        message: `Failed to add maker: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: GridRowId) => {
    try {
      // First, check if this maker is being used by any products
      const { data: productsUsingMaker, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('maker_id', id)
        .limit(1);

      if (checkError) {
        console.error('Error checking maker usage:', checkError);
        throw checkError;
      }

      if (productsUsingMaker && productsUsingMaker.length > 0) {
        setSnackbar({
          open: true,
          message: 'Cannot delete maker that is being used by products',
          severity: 'warning',
        });
        return;
      }

      if (!confirm('Are you sure you want to delete this maker?')) return;

      console.log('Deleting maker:', id);

      const { data, error } = await supabase
        .from('makers')
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
        message: 'Maker deleted successfully!',
        severity: 'success',
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting maker:', error);
      setSnackbar({
        open: true,
        message: `Failed to delete maker: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      ['ID', 'Name', 'Created Date', 'Updated Date'],
      ...rows.map(row => [
        row.id,
        row.name,
        new Date(row.created_at || '').toLocaleDateString('ko-KR'),
        new Date(row.updated_at || '').toLocaleDateString('ko-KR')
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `makers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: `Successfully exported ${rows.length} makers!`,
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
            Makers Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage product manufacturers and brands.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add Maker
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
        onClose={() => setEditDialog({ open: false, maker: null, name: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Maker</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Maker Name"
            fullWidth
            variant="outlined"
            value={editDialog.name}
            onChange={(e) => setEditDialog(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter maker name"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialog({ open: false, maker: null, name: '' })}
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
        onClose={() => setAddDialog({ open: false, name: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Maker</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Maker Name"
            fullWidth
            variant="outlined"
            value={addDialog.name}
            onChange={(e) => setAddDialog(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter maker name"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setAddDialog({ open: false, name: '' })}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveAdd} variant="contained">
            Add Maker
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