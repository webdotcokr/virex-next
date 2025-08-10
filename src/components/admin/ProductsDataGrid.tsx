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
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowId,
  GridFilterModel,
} from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  FileUpload as FileUploadIcon,
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import DeleteConfirmModal from './DeleteConfirmModal';
import CSVSyncModal from './CSVSyncModal';
import type { Database } from '@/lib/supabase';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Maker = Database['public']['Tables']['makers']['Row'];
type Series = Database['public']['Tables']['series']['Row'];

interface ProductWithRelations extends Product {
  category_name?: string;
  maker_name?: string;
  series_name?: string;
}

interface ReferenceInfo {
  table: string;
  count: number;
  description: string;
}

interface SpecificationField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean';
  required?: boolean;
}

// Define specification fields by category
const getSpecificationFields = (categoryName: string): SpecificationField[] => {
  const lowerCategoryName = categoryName.toLowerCase();
  
  if (lowerCategoryName.includes('cis')) {
    return [
      { key: 'scan_width', label: 'Scan Width (mm)', type: 'number' },
      { key: 'dpi', label: 'DPI', type: 'number' },
      { key: 'line_rate', label: 'Line Rate (kHz)', type: 'number' },
      { key: 'wd', label: 'Working Distance (mm)', type: 'number' },
      { key: 'speed', label: 'Speed', type: 'number' },
      { key: 'spectrum', label: 'Spectrum', type: 'string' },
      { key: 'resolution', label: 'Resolution (mm)', type: 'number' },
      { key: 'no_of_pixels', label: 'Number of Pixels', type: 'number' },
      { key: 'interface', label: 'Interface', type: 'string' },
    ];
  } else if (lowerCategoryName.includes('tdi')) {
    return [
      { key: 'stages', label: 'TDI Stages', type: 'number' },
      { key: 'pixel_size', label: 'Pixel Size (μm)', type: 'number' },
      { key: 'line_frequency', label: 'Line Frequency (kHz)', type: 'number' },
      { key: 'sensor_model', label: 'Sensor Model', type: 'string' },
      { key: 'interface', label: 'Interface', type: 'string' },
    ];
  } else if (lowerCategoryName.includes('line')) {
    return [
      { key: 'resolution', label: 'Resolution', type: 'string' },
      { key: 'pixel_size', label: 'Pixel Size (μm)', type: 'number' },
      { key: 'line_rate', label: 'Line Rate (kHz)', type: 'number' },
      { key: 'sensor_type', label: 'Sensor Type', type: 'string' },
      { key: 'interface', label: 'Interface', type: 'string' },
    ];
  } else if (lowerCategoryName.includes('area')) {
    return [
      { key: 'resolution', label: 'Resolution', type: 'string' },
      { key: 'frame_rate', label: 'Frame Rate (fps)', type: 'number' },
      { key: 'pixel_size', label: 'Pixel Size (μm)', type: 'number' },
      { key: 'sensor_type', label: 'Sensor Type', type: 'string' },
      { key: 'interface', label: 'Interface', type: 'string' },
    ];
  }
  
  return [
    { key: 'model', label: 'Model', type: 'string' },
    { key: 'specification', label: 'Specification', type: 'string' },
  ];
};

export default function ProductsDataGrid() {
  const [rows, setRows] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [makers, setMakers] = useState<Maker[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  
  // Edit dialog state
  const [editDialog, setEditDialog] = useState({
    open: false,
    product: null as Product | null,
    partNumber: '',
    categoryId: null as number | null,
    makerId: null as number | null,
    seriesId: null as number | null,
    specifications: {} as Record<string, any>,
    isActive: true,
    isNew: false,
  });

  // Add dialog state
  const [addDialog, setAddDialog] = useState({
    open: false,
    partNumber: '',
    categoryId: null as number | null,
    makerId: null as number | null,
    seriesId: null as number | null,
    specifications: {} as Record<string, any>,
    isActive: true,
    isNew: false,
  });

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    product: null as Product | null,
    references: [] as ReferenceInfo[],
    loading: false,
  });

  // CSV Upload dialog state
  const [csvDialog, setCsvDialog] = useState({
    open: false,
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
      field: 'part_number',
      headerName: 'Part Number',
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'category_name',
      headerName: 'Category',
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'Unknown'} 
          size="small" 
          color="primary" 
          variant="outlined"
        />
      ),
    },
    {
      field: 'maker_name',
      headerName: 'Maker',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || 'Unknown'}
        </Typography>
      ),
    },
    {
      field: 'series_name',
      headerName: 'Series',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'specifications',
      headerName: 'Key Specs',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        const specs = params.value as Record<string, any>;
        if (!specs || Object.keys(specs).length === 0) {
          return <Typography variant="body2" color="text.disabled">No specs</Typography>;
        }
        
        const keySpecs = Object.entries(specs)
          .slice(0, 2)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
          
        return (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {keySpecs}
            {Object.keys(specs).length > 2 && '...'}
          </Typography>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const isActive = params.row.is_active;
        const isNew = params.row.is_new;
        
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Chip 
              label={isActive ? 'Active' : 'Inactive'} 
              size="small" 
              color={isActive ? 'success' : 'default'}
              variant="filled"
            />
            {isNew && (
              <Chip 
                label="New" 
                size="small" 
                color="info"
                variant="filled"
              />
            )}
          </Box>
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

  // Fetch reference data
  const fetchReferenceData = useCallback(async () => {
    try {
      const [categoriesResult, makersResult, seriesResult] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('makers').select('*').order('name'),
        supabase.from('series').select('*').order('series_name'),
      ]);

      if (categoriesResult.data) setCategories(categoriesResult.data);
      if (makersResult.data) setMakers(makersResult.data);
      if (seriesResult.data) setSeries(seriesResult.data);
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  }, []);

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching products...', { paginationModel, selectedCategory });
      
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(name),
          makers(name)
        `, { count: 'exact' });

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error, count } = await query
        .range(
          paginationModel.page * paginationModel.pageSize,
          (paginationModel.page + 1) * paginationModel.pageSize - 1
        )
        .order('id', { ascending: true });

      console.log('✅ Supabase response:', { 
        dataCount: data?.length, 
        totalCount: count, 
        error,
      });

      if (error) {
        console.error('❌ Supabase error details:', error);
        throw error;
      }

      // Transform data to include relation names
      const transformedData = (data || []).map(product => ({
        ...product,
        category_name: product.categories?.name || 'Unknown',
        maker_name: product.makers?.name || 'Unknown',
        series_name: null, // We'll fetch series separately if needed
      }));

      setRows(transformedData);
      setTotalRows(count || 0);
      
      if (data && data.length > 0) {
        console.log(`✅ Successfully loaded ${data.length} products out of ${count} total`);
        setSnackbar({
          open: true,
          message: `Loaded ${data.length} products`,
          severity: 'success',
        });
      } else {
        console.log('ℹ️ No products found');
        setSnackbar({
          open: true,
          message: 'No products found',
          severity: 'info',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setSnackbar({
        open: true,
        message: `Failed to load products: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
      setRows([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [paginationModel, selectedCategory]);

  // Load data when component mounts or dependencies change
  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle category change
  const handleCategoryChange = (categoryId: number | 'all') => {
    setSelectedCategory(categoryId);
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page
  };

  // Handle edit
  const handleEdit = (product: ProductWithRelations) => {
    setEditDialog({
      open: true,
      product,
      partNumber: product.part_number,
      categoryId: product.category_id,
      makerId: product.maker_id,
      seriesId: product.series_id,
      specifications: product.specifications || {},
      isActive: product.is_active ?? true,
      isNew: product.is_new ?? false,
    });
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editDialog.product || !editDialog.partNumber.trim()) {
      setSnackbar({
        open: true,
        message: 'Part number is required',
        severity: 'error',
      });
      return;
    }

    if (!editDialog.categoryId || !editDialog.makerId) {
      setSnackbar({
        open: true,
        message: 'Category and maker are required',
        severity: 'error',
      });
      return;
    }

    try {
      console.log('Updating product:', editDialog.product.id, {
        part_number: editDialog.partNumber.trim(),
        category_id: editDialog.categoryId,
        maker_id: editDialog.makerId,
        series_id: editDialog.seriesId,
        specifications: editDialog.specifications,
        is_active: editDialog.isActive,
        is_new: editDialog.isNew,
      });

      const { data, error } = await supabase
        .from('products')
        .update({
          part_number: editDialog.partNumber.trim(),
          category_id: editDialog.categoryId,
          maker_id: editDialog.makerId,
          series_id: editDialog.seriesId,
          specifications: editDialog.specifications,
          is_active: editDialog.isActive,
          is_new: editDialog.isNew,
          updated_at: new Date().toISOString(),
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
        message: 'Product updated successfully!',
        severity: 'success',
      });

      resetEditDialog();
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating product:', error);
      setSnackbar({
        open: true,
        message: `Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle add new
  const handleAdd = () => {
    setAddDialog({
      open: true,
      partNumber: '',
      categoryId: null,
      makerId: null,
      seriesId: null,
      specifications: {},
      isActive: true,
      isNew: false,
    });
  };

  // Handle save add
  const handleSaveAdd = async () => {
    if (!addDialog.partNumber.trim()) {
      setSnackbar({
        open: true,
        message: 'Part number is required',
        severity: 'error',
      });
      return;
    }

    if (!addDialog.categoryId || !addDialog.makerId) {
      setSnackbar({
        open: true,
        message: 'Category and maker are required',
        severity: 'error',
      });
      return;
    }

    try {
      console.log('Adding product:', {
        part_number: addDialog.partNumber.trim(),
        category_id: addDialog.categoryId,
        maker_id: addDialog.makerId,
        series_id: addDialog.seriesId,
        specifications: addDialog.specifications,
        is_active: addDialog.isActive,
        is_new: addDialog.isNew,
      });

      const { data, error } = await supabase
        .from('products')
        .insert({
          part_number: addDialog.partNumber.trim(),
          category_id: addDialog.categoryId,
          maker_id: addDialog.makerId,
          series_id: addDialog.seriesId,
          specifications: addDialog.specifications,
          is_active: addDialog.isActive,
          is_new: addDialog.isNew,
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
        message: 'Product added successfully!',
        severity: 'success',
      });

      resetAddDialog();
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error adding product:', error);
      setSnackbar({
        open: true,
        message: `Failed to add product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Check references before delete
  const handleDeleteCheck = async (product: ProductWithRelations) => {
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    
    try {
      const references: ReferenceInfo[] = [];

      // Check product_media referencing this product
      const { count: mediaCount } = await supabase
        .from('product_media')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', product.id);

      if (mediaCount && mediaCount > 0) {
        references.push({
          table: 'product_media',
          count: mediaCount,
          description: 'Media files associated with this product',
        });
      }

      setDeleteDialog({
        open: true,
        product,
        references,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking references:', error);
      setSnackbar({
        open: true,
        message: 'Failed to check product references',
        severity: 'error',
      });
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteDialog.product) return;

    setDeleteDialog(prev => ({ ...prev, loading: true }));

    try {
      console.log('Deleting product:', deleteDialog.product.id);

      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteDialog.product.id)
        .select();

      console.log('Delete response:', { data, error });

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      setSnackbar({
        open: true,
        message: 'Product deleted successfully!',
        severity: 'success',
      });

      setDeleteDialog({ open: false, product: null, references: [], loading: false });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbar({
        open: true,
        message: `Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle CSV sync
  const handleCSVSync = async (operations: any[]) => {
    try {
      // Operations are handled by the CSVSyncModal itself
      // Just refresh the data and show success message
      await fetchData();
      setSnackbar({
        open: true,
        message: `Successfully processed ${operations.length} operations`,
        severity: 'success',
      });
    } catch (error) {
      console.error('CSV sync error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to sync CSV data',
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
      ['ID', 'Part Number', 'Category', 'Maker', 'Series', 'Specifications', 'Active', 'New', 'Created Date'],
      ...rows.map(row => [
        row.id,
        row.part_number,
        row.category_name || '',
        row.maker_name || '',
        row.series_name || '',
        JSON.stringify(row.specifications || {}),
        row.is_active ? 'Yes' : 'No',
        row.is_new ? 'Yes' : 'No',
        row.created_at ? new Date(row.created_at).toLocaleDateString('ko-KR') : ''
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${selectedCategory === 'all' ? 'all' : selectedCategory}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: `Successfully exported ${rows.length} products!`,
      severity: 'success',
    });
  };

  // Render specifications form
  const renderSpecificationsForm = (
    specifications: Record<string, any>,
    onChange: (specs: Record<string, any>) => void,
    categoryId: number | null
  ) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return null;

    const fields = getSpecificationFields(category.name);

    return (
      <Box>
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
          Specifications ({category.name})
        </Typography>
        {fields.map((field) => (
          <TextField
            key={field.key}
            margin="dense"
            label={field.label}
            fullWidth
            variant="outlined"
            type={field.type === 'number' ? 'number' : 'text'}
            value={specifications[field.key] || ''}
            onChange={(e) => {
              const newSpecs = { ...specifications };
              if (e.target.value === '') {
                delete newSpecs[field.key];
              } else {
                newSpecs[field.key] = field.type === 'number' 
                  ? parseFloat(e.target.value) || e.target.value
                  : e.target.value;
              }
              onChange(newSpecs);
            }}
            sx={{ mb: 1 }}
          />
        ))}
      </Box>
    );
  };

  const resetEditDialog = () => {
    setEditDialog({
      open: false,
      product: null,
      partNumber: '',
      categoryId: null,
      makerId: null,
      seriesId: null,
      specifications: {},
      isActive: true,
      isNew: false,
    });
  };

  const resetAddDialog = () => {
    setAddDialog({
      open: false,
      partNumber: '',
      categoryId: null,
      makerId: null,
      seriesId: null,
      specifications: {},
      isActive: true,
      isNew: false,
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
            Products Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your complete product catalog with dynamic specifications and category filtering.
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
            variant="outlined"
            startIcon={<UploadIcon />}
            disabled
          >
            CSV Import
          </Button>
          <Button
            variant="outlined"
            onClick={() => setCsvDialog({ open: true })}
            startIcon={<FileUploadIcon />}
            sx={{ minWidth: 120 }}
          >
            CSV Upload
          </Button>
          <Button
            variant="contained"
            onClick={handleExport}
            startIcon={<DownloadIcon />}
            sx={{ minWidth: 120 }}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Category Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Filter by Category
        </Typography>
        <Tabs
          value={selectedCategory}
          onChange={(_, newValue) => handleCategoryChange(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
            },
          }}
        >
          <Tab label="All Categories" value="all" />
          {categories.map((category) => (
            <Tab 
              key={category.id} 
              label={category.name} 
              value={category.id}
            />
          ))}
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
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
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
        onClose={resetEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Part Number"
            fullWidth
            variant="outlined"
            value={editDialog.partNumber}
            onChange={(e) => setEditDialog(prev => ({ ...prev, partNumber: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Category *</InputLabel>
              <Select
                value={editDialog.categoryId || ''}
                onChange={(e) => {
                  const categoryId = e.target.value ? Number(e.target.value) : null;
                  setEditDialog(prev => ({ 
                    ...prev, 
                    categoryId,
                    specifications: {} // Reset specs when category changes
                  }));
                }}
                label="Category *"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Maker *</InputLabel>
              <Select
                value={editDialog.makerId || ''}
                onChange={(e) => setEditDialog(prev => ({ 
                  ...prev, 
                  makerId: e.target.value ? Number(e.target.value) : null 
                }))}
                label="Maker *"
              >
                {makers.map((maker) => (
                  <MenuItem key={maker.id} value={maker.id}>
                    {maker.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Series (Optional)</InputLabel>
            <Select
              value={editDialog.seriesId || ''}
              onChange={(e) => setEditDialog(prev => ({ 
                ...prev, 
                seriesId: e.target.value ? Number(e.target.value) : null 
              }))}
              label="Series (Optional)"
            >
              <MenuItem value="">
                <em>No Series</em>
              </MenuItem>
              {series.map((seriesItem) => (
                <MenuItem key={seriesItem.id} value={seriesItem.id}>
                  {seriesItem.series_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={editDialog.isActive}
                  onChange={(e) => setEditDialog(prev => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label="Active"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editDialog.isNew}
                  onChange={(e) => setEditDialog(prev => ({ ...prev, isNew: e.target.checked }))}
                />
              }
              label="New Product"
            />
          </Box>

          {renderSpecificationsForm(
            editDialog.specifications,
            (specs) => setEditDialog(prev => ({ ...prev, specifications: specs })),
            editDialog.categoryId
          )}
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
        <DialogTitle>Add Product</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Part Number"
            fullWidth
            variant="outlined"
            value={addDialog.partNumber}
            onChange={(e) => setAddDialog(prev => ({ ...prev, partNumber: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Category *</InputLabel>
              <Select
                value={addDialog.categoryId || ''}
                onChange={(e) => {
                  const categoryId = e.target.value ? Number(e.target.value) : null;
                  setAddDialog(prev => ({ 
                    ...prev, 
                    categoryId,
                    specifications: {} // Reset specs when category changes
                  }));
                }}
                label="Category *"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Maker *</InputLabel>
              <Select
                value={addDialog.makerId || ''}
                onChange={(e) => setAddDialog(prev => ({ 
                  ...prev, 
                  makerId: e.target.value ? Number(e.target.value) : null 
                }))}
                label="Maker *"
              >
                {makers.map((maker) => (
                  <MenuItem key={maker.id} value={maker.id}>
                    {maker.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Series (Optional)</InputLabel>
            <Select
              value={addDialog.seriesId || ''}
              onChange={(e) => setAddDialog(prev => ({ 
                ...prev, 
                seriesId: e.target.value ? Number(e.target.value) : null 
              }))}
              label="Series (Optional)"
            >
              <MenuItem value="">
                <em>No Series</em>
              </MenuItem>
              {series.map((seriesItem) => (
                <MenuItem key={seriesItem.id} value={seriesItem.id}>
                  {seriesItem.series_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={addDialog.isActive}
                  onChange={(e) => setAddDialog(prev => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label="Active"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={addDialog.isNew}
                  onChange={(e) => setAddDialog(prev => ({ ...prev, isNew: e.target.checked }))}
                />
              }
              label="New Product"
            />
          </Box>

          {renderSpecificationsForm(
            addDialog.specifications,
            (specs) => setAddDialog(prev => ({ ...prev, specifications: specs })),
            addDialog.categoryId
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={resetAddDialog}>
            Cancel
          </Button>
          <Button onClick={handleSaveAdd} variant="contained">
            Add Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, product: null, references: [], loading: false })}
        onConfirm={handleDelete}
        title="Delete Product"
        itemName={deleteDialog.product?.part_number || ''}
        itemType="product"
        references={deleteDialog.references}
        loading={deleteDialog.loading}
      />

      {/* CSV Upload Modal */}
      <CSVSyncModal
        open={csvDialog.open}
        onClose={() => setCsvDialog({ open: false })}
        onSync={handleCSVSync}
        tableName="products"
        title="Upload Products"
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