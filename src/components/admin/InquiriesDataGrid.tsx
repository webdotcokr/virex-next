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
  Alert,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowId,
} from '@mui/x-data-grid';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type Inquiry = Database['public']['Tables']['inquiries']['Row'];

export default function InquiriesDataGrid() {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  
  // View dialog state
  const [viewDialog, setViewDialog] = useState({
    open: false,
    inquiry: null as Inquiry | null,
  });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Get status color and label
  const getStatusConfig = useCallback((status: string) => {
    const configs = {
      pending: { color: 'warning', label: 'Pending' },
      contacted: { color: 'info', label: 'Contacted' },
      completed: { color: 'success', label: 'Completed' },
      cancelled: { color: 'error', label: 'Cancelled' },
    } as const;
    
    return configs[status as keyof typeof configs] || { color: 'default', label: status };
  }, []);

  // Define columns
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
          {params.value.substring(0, 8)}...
        </Typography>
      ),
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'company',
      headerName: 'Company',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 130,
      renderCell: (params) => (
        params.value ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              {params.value}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            -
          </Typography>
        )
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const config = getStatusConfig(params.value);
        return (
          <Chip
            label={config.label}
            color={config.color as any}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
        );
      },
    },
    {
      field: 'message',
      headerName: 'Message',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.75rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
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
          key="view"
          icon={<ViewIcon />}
          label="View"
          onClick={() => handleView(params.row)}
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

  // Fetch data function with enhanced error handling
  const fetchData = useCallback(async () => {
    setLoading(true);
    const startTime = Date.now();
    
    // Set a timeout for the fetch operation
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.error('⏱️ Fetch operation timed out after 10 seconds');
        setSnackbar({
          open: true,
          message: '데이터 로딩 시간 초과 (10초). 네트워크 연결을 확인하거나 페이지를 새로고침하세요.',
          severity: 'error',
        });
        setLoading(false);
      }
    }, 10000);

    try {
      console.log('🔄 Fetching inquiries...', { 
        paginationModel,
        statusFilter,
        timestamp: new Date().toISOString(),
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      });
      
      let query = supabase
        .from('inquiries')
        .select('*', { count: 'exact' });

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      console.log('📡 Sending Supabase request...', {
        table: 'inquiries',
        filter: statusFilter,
        range: `${paginationModel.page * paginationModel.pageSize}-${(paginationModel.page + 1) * paginationModel.pageSize - 1}`
      });

      const { data, error, count, status, statusText } = await query
        .range(
          paginationModel.page * paginationModel.pageSize,
          (paginationModel.page + 1) * paginationModel.pageSize - 1
        )
        .order('created_at', { ascending: false });

      const responseTime = Date.now() - startTime;
      console.log('📊 Supabase response received:', { 
        responseTime: `${responseTime}ms`,
        status,
        statusText,
        dataCount: data?.length, 
        totalCount: count, 
        error: error ? {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        } : null
      });

      if (error) {
        console.error('❌ Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        });
        
        // Provide more specific error messages
        let errorMessage = '문의 내역 로드 실패: ';
        if (error.code === 'PGRST301') {
          errorMessage += 'JWT 토큰이 만료되었습니다. 페이지를 새로고침하세요.';
        } else if (error.code === '42501') {
          errorMessage += '권한이 없습니다. RLS 정책을 확인하세요.';
        } else if (error.message.includes('network')) {
          errorMessage += '네트워크 연결을 확인하세요.';
        } else if (error.message.includes('CORS')) {
          errorMessage += 'CORS 에러. Supabase 대시보드에서 URL 설정을 확인하세요.';
        } else {
          errorMessage += error.message;
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
        throw error;
      }

      setRows(data || []);
      setTotalRows(count || 0);
      
      if (data && data.length > 0) {
        console.log(`✅ Successfully loaded ${data.length} inquiries out of ${count} total`);
        setSnackbar({
          open: true,
          message: `${data.length}개 문의 내역 로드 완료 (총 ${count}개)`,
          severity: 'success',
        });
      } else if (count === 0) {
        console.log('ℹ️ No inquiries found in database');
        setSnackbar({
          open: true,
          message: '등록된 문의 내역이 없습니다.',
          severity: 'info',
        });
      } else {
        console.log('⚠️ Data exists but not returned', { count, page: paginationModel.page });
        setSnackbar({
          open: true,
          message: '데이터가 존재하지만 로드되지 않았습니다. 페이지네이션을 확인하세요.',
          severity: 'warning',
        });
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('❌ Error fetching inquiries:', {
        error,
        responseTime: `${responseTime}ms`,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined
      });
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setSnackbar({
          open: true,
          message: '네트워크 연결 실패. 인터넷 연결과 Supabase URL을 확인하세요.',
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: `문의 내역 로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
          severity: 'error',
        });
      }
      
      setRows([]);
      setTotalRows(0);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [paginationModel, statusFilter, loading]);

  // Load data when component mounts or filters change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle status filter change
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page
  };

  // Handle view
  const handleView = (inquiry: Inquiry) => {
    setViewDialog({
      open: true,
      inquiry,
    });
  };

  // Handle delete
  const handleDelete = async (id: GridRowId) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;

    try {
      console.log('Deleting inquiry:', id);

      const { data, error } = await supabase
        .from('inquiries')
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
        message: 'Inquiry deleted successfully!',
        severity: 'success',
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      setSnackbar({
        open: true,
        message: `Failed to delete inquiry: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      ['ID', 'Name', 'Email', 'Company', 'Phone', 'Status', 'Message', 'Created Date'],
      ...rows.map(row => [
        row.id,
        row.name,
        row.email,
        row.company || '',
        row.phone || '',
        row.status || '',
        row.message.replace(/,/g, ';'), // Replace commas to avoid CSV issues
        new Date(row.created_at || '').toLocaleDateString('ko-KR')
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inquiries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: `Successfully exported ${rows.length} inquiries!`,
      severity: 'success',
    });
  };

  const statusCounts = {
    all: totalRows,
    pending: rows.filter(r => r.status === 'pending').length,
    contacted: rows.filter(r => r.status === 'contacted').length,
    completed: rows.filter(r => r.status === 'completed').length,
    cancelled: rows.filter(r => r.status === 'cancelled').length,
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
            Inquiries Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage customer inquiries and support requests.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleExport}
          sx={{ minWidth: 120 }}
        >
          Export CSV
        </Button>
      </Box>

      {/* Status Filter */}
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            label="Status Filter"
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <MenuItem value="all">All ({statusCounts.all})</MenuItem>
            <MenuItem value="pending">Pending ({statusCounts.pending})</MenuItem>
            <MenuItem value="contacted">Contacted ({statusCounts.contacted})</MenuItem>
            <MenuItem value="completed">Completed ({statusCounts.completed})</MenuItem>
            <MenuItem value="cancelled">Cancelled ({statusCounts.cancelled})</MenuItem>
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
          }}
        />
      </Box>

      {/* View Dialog */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, inquiry: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Inquiry Details</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {viewDialog.inquiry && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">
                    {viewDialog.inquiry.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {viewDialog.inquiry.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Company
                  </Typography>
                  <Typography variant="body1">
                    {viewDialog.inquiry.company || 'Not provided'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {viewDialog.inquiry.phone || 'Not provided'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={getStatusConfig(viewDialog.inquiry.status || '').label}
                      color={getStatusConfig(viewDialog.inquiry.status || '').color as any}
                      size="small"
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {new Date(viewDialog.inquiry.created_at || '').toLocaleString('ko-KR')}
                  </Typography>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Message
                </Typography>
                <Box 
                  sx={{ 
                    p: 2, 
                    border: 1, 
                    borderColor: 'divider', 
                    borderRadius: 1,
                    backgroundColor: 'grey.50',
                    maxHeight: 300,
                    overflow: 'auto',
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {viewDialog.inquiry.message}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setViewDialog({ open: false, inquiry: null })}
          >
            Close
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