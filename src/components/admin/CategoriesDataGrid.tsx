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
  GridTreeNodeWithRender,
} from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import DeleteConfirmModal from './DeleteConfirmModal';
import type { Database } from '@/lib/supabase';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
  level?: number;
}

interface ReferenceInfo {
  table: string;
  count: number;
  description: string;
}

export default function CategoriesDataGrid() {
  const [rows, setRows] = useState<CategoryWithChildren[]>([]);
  const [flatRows, setFlatRows] = useState<CategoryWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit dialog state
  const [editDialog, setEditDialog] = useState({
    open: false,
    category: null as Category | null,
    name: '',
    parentId: null as number | null,
  });

  // Add dialog state
  const [addDialog, setAddDialog] = useState({
    open: false,
    name: '',
    parentId: null as number | null,
  });

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    category: null as Category | null,
    references: [] as ReferenceInfo[],
    loading: false,
  });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Build hierarchical tree structure
  const buildTree = useCallback((categories: Category[]): CategoryWithChildren[] => {
    const categoryMap = new Map<number, CategoryWithChildren>();
    const rootCategories: CategoryWithChildren[] = [];

    // Create a map of all categories
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Build the tree structure
    categories.forEach(cat => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        const parent = categoryMap.get(cat.parent_id)!;
        if (!parent.children) parent.children = [];
        parent.children.push(category);
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories;
  }, []);

  // Flatten tree structure for DataGrid
  const flattenTree = useCallback((tree: CategoryWithChildren[], level = 0): CategoryWithChildren[] => {
    const result: CategoryWithChildren[] = [];
    
    tree.forEach(node => {
      result.push({ ...node, level });
      if (node.children && node.children.length > 0) {
        result.push(...flattenTree(node.children, level + 1));
      }
    });
    
    return result;
  }, []);

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
      field: 'name',
      headerName: 'Category Name',
      flex: 1,
      minWidth: 300,
      renderCell: (params) => {
        const level = params.row.level || 0;
        const hasChildren = params.row.children && params.row.children.length > 0;
        
        return (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            pl: level * 3, // Indentation based on level
          }}>
            {hasChildren && (
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              </Box>
            )}
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: level === 0 ? 600 : 400,
                color: level === 0 ? 'text.primary' : 'text.secondary',
              }}
            >
              {params.value}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'parent_id',
      headerName: 'Parent Category',
      width: 200,
      renderCell: (params) => {
        if (!params.value) {
          return (
            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500 }}>
              Root Category
            </Typography>
          );
        }
        
        const parent = flatRows.find(cat => cat.id === params.value);
        return (
          <Typography variant="body2" color="text.secondary">
            {parent?.name || 'Unknown'}
          </Typography>
        );
      },
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
          onClick={() => handleDeleteCheck(params.row)}
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
      console.log('🔄 Fetching categories...', {
        timestamp: new Date().toISOString(),
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      });
      
      const query = supabase
        .from('categories')
        .select('*')
        .order('parent_id', { ascending: true, nullsFirst: true })
        .order('name', { ascending: true });

      console.log('📡 Sending Supabase request...', {
        table: 'categories',
        orderBy: 'parent_id ASC, name ASC'
      });

      const { data, error, status, statusText } = await query;

      const responseTime = Date.now() - startTime;
      console.log('📊 Supabase response received:', { 
        responseTime: `${responseTime}ms`,
        status,
        statusText,
        dataCount: data?.length, 
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
        let errorMessage = '카테고리 로드 실패: ';
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

      const hierarchicalData = buildTree(data || []);
      const flatData = flattenTree(hierarchicalData);
      
      setRows(hierarchicalData);
      setFlatRows(flatData);
      
      if (data && data.length > 0) {
        console.log(`✅ Successfully loaded ${data.length} categories`);
        setSnackbar({
          open: true,
          message: `${data.length}개 카테고리 로드 완료`,
          severity: 'success',
        });
      } else {
        console.log('ℹ️ No categories found in database');
        setSnackbar({
          open: true,
          message: '등록된 카테고리가 없습니다.',
          severity: 'info',
        });
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('❌ Error fetching categories:', {
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
          message: `카테고리 로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
          severity: 'error',
        });
      }
      
      setRows([]);
      setFlatRows([]);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [buildTree, flattenTree, loading]);

  // Load data when component mounts
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle edit
  const handleEdit = (category: Category) => {
    setEditDialog({
      open: true,
      category,
      name: category.name,
      parentId: category.parent_id,
    });
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editDialog.category || !editDialog.name.trim()) {
      setSnackbar({
        open: true,
        message: 'Category name is required',
        severity: 'error',
      });
      return;
    }

    try {
      console.log('Updating category:', editDialog.category.id, {
        name: editDialog.name.trim(),
        parent_id: editDialog.parentId,
      });

      const { data, error } = await supabase
        .from('categories')
        .update({
          name: editDialog.name.trim(),
          parent_id: editDialog.parentId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editDialog.category.id)
        .select()
        .single();

      console.log('Update response:', { data, error });

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      setSnackbar({
        open: true,
        message: 'Category updated successfully!',
        severity: 'success',
      });

      setEditDialog({ open: false, category: null, name: '', parentId: null });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating category:', error);
      setSnackbar({
        open: true,
        message: `Failed to update category: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle add new
  const handleAdd = () => {
    setAddDialog({
      open: true,
      name: '',
      parentId: null,
    });
  };

  // Handle save add
  const handleSaveAdd = async () => {
    if (!addDialog.name.trim()) {
      setSnackbar({
        open: true,
        message: 'Category name is required',
        severity: 'error',
      });
      return;
    }

    try {
      console.log('Adding category:', {
        name: addDialog.name.trim(),
        parent_id: addDialog.parentId,
      });

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: addDialog.name.trim(),
          parent_id: addDialog.parentId,
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
        message: 'Category added successfully!',
        severity: 'success',
      });

      setAddDialog({ open: false, name: '', parentId: null });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error adding category:', error);
      setSnackbar({
        open: true,
        message: `Failed to add category: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Check references before delete
  const handleDeleteCheck = async (category: Category) => {
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    
    try {
      const references: ReferenceInfo[] = [];

      // Check products referencing this category
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id);

      if (productsCount && productsCount > 0) {
        references.push({
          table: 'products',
          count: productsCount,
          description: 'Products using this category',
        });
      }

      // Check child categories
      const { count: childrenCount } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', category.id);

      if (childrenCount && childrenCount > 0) {
        references.push({
          table: 'categories',
          count: childrenCount,
          description: 'Child categories under this category',
        });
      }

      // Check series referencing this category
      const { count: seriesCount } = await supabase
        .from('series')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id);

      if (seriesCount && seriesCount > 0) {
        references.push({
          table: 'series',
          count: seriesCount,
          description: 'Series using this category',
        });
      }

      setDeleteDialog({
        open: true,
        category,
        references,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking references:', error);
      setSnackbar({
        open: true,
        message: 'Failed to check category references',
        severity: 'error',
      });
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteDialog.category) return;

    setDeleteDialog(prev => ({ ...prev, loading: true }));

    try {
      console.log('Deleting category:', deleteDialog.category.id);

      const { data, error } = await supabase
        .from('categories')
        .delete()
        .eq('id', deleteDialog.category.id)
        .select();

      console.log('Delete response:', { data, error });

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      setSnackbar({
        open: true,
        message: 'Category deleted successfully!',
        severity: 'success',
      });

      setDeleteDialog({ open: false, category: null, references: [], loading: false });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting category:', error);
      setSnackbar({
        open: true,
        message: `Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle export
  const handleExport = () => {
    if (flatRows.length === 0) {
      setSnackbar({
        open: true,
        message: 'No data to export',
        severity: 'warning',
      });
      return;
    }

    const csvContent = [
      ['ID', 'Name', 'Parent ID', 'Parent Name', 'Level', 'Created Date'],
      ...flatRows.map(row => [
        row.id,
        row.name,
        row.parent_id || '',
        row.parent_id ? (flatRows.find(cat => cat.id === row.parent_id)?.name || '') : 'Root',
        row.level || 0,
        row.created_at ? new Date(row.created_at).toLocaleDateString('ko-KR') : ''
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categories-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: `Successfully exported ${flatRows.length} categories!`,
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
            Categories Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Organize products into hierarchical categories with parent-child relationships.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add Category
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
          rows={flatRows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
          }}
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
        onClose={() => setEditDialog({ open: false, category: null, name: '', parentId: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={editDialog.name}
            onChange={(e) => setEditDialog(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth>
            <InputLabel>Parent Category</InputLabel>
            <Select
              value={editDialog.parentId || ''}
              onChange={(e) => setEditDialog(prev => ({ 
                ...prev, 
                parentId: e.target.value ? Number(e.target.value) : null 
              }))}
              label="Parent Category"
            >
              <MenuItem value="">
                <em>Root Category (No Parent)</em>
              </MenuItem>
              {flatRows
                .filter(cat => cat.id !== editDialog.category?.id) // Don't allow self as parent
                .map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {'—'.repeat(category.level || 0)} {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, category: null, name: '', parentId: null })}>
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
        onClose={() => setAddDialog({ open: false, name: '', parentId: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={addDialog.name}
            onChange={(e) => setAddDialog(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth>
            <InputLabel>Parent Category</InputLabel>
            <Select
              value={addDialog.parentId || ''}
              onChange={(e) => setAddDialog(prev => ({ 
                ...prev, 
                parentId: e.target.value ? Number(e.target.value) : null 
              }))}
              label="Parent Category"
            >
              <MenuItem value="">
                <em>Root Category (No Parent)</em>
              </MenuItem>
              {flatRows.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {'—'.repeat(category.level || 0)} {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog({ open: false, name: '', parentId: null })}>
            Cancel
          </Button>
          <Button onClick={handleSaveAdd} variant="contained">
            Add Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, category: null, references: [], loading: false })}
        onConfirm={handleDelete}
        title="Delete Category"
        itemName={deleteDialog.category?.name || ''}
        itemType="category"
        references={deleteDialog.references}
        loading={deleteDialog.loading}
      />

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