'use client';

import React, { useState, useCallback, useMemo } from 'react';
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
  Switch,
  FormControlLabel,
  Chip,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridFilterModel,
} from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import { useTableMetadata, getVisibleColumns, getParameterLabel, getParameterUnit } from '@/lib/hooks/useTableMetadata';

// 카테고리 ID to 테이블명 매핑 (CSV 업로드 API와 동일)
const CATEGORY_TABLE_MAPPING: Record<number, string> = {
  9: 'products_cis',        // CIS
  10: 'products_tdi',       // TDI
  11: 'products_line',      // Line
  12: 'products_area',      // Area
  13: 'products_invisible', // Invisible
  14: 'products_scientific',// Scientific
  15: 'products_large_format_lens', // Large Format Lens
  16: 'products_telecentric',       // Telecentric
  17: 'products_fa_lens',           // FA Lens
  18: 'products_3d_laser_profiler', // 3D Laser Profiler
  19: 'products_3d_stereo_camera',  // 3D Stereo Camera
  20: 'products_light',             // Light
  22: 'products_controller',        // Controller
  23: 'products_frame_grabber',     // Frame Grabber
  24: 'products_gige_lan_card',     // GigE LAN Card
  25: 'products_usb_card',          // USB Card
  7: 'products_software',           // Software
  26: 'products_cable',             // Cable
  27: 'products_accessory'          // Accessory
};

// 카테고리 이름 매핑
const CATEGORY_NAMES: Record<number, string> = {
  9: 'CIS',
  10: 'TDI',
  11: 'Line',
  12: 'Area',
  13: 'Invisible',
  14: 'Scientific',
  15: 'Large Format Lens',
  16: 'Telecentric',
  17: 'FA Lens',
  18: '3D Laser Profiler',
  19: '3D Stereo Camera',
  20: 'Light',
  22: 'Controller',
  23: 'Frame Grabber',
  24: 'GigE LAN Card',
  25: 'USB Card',
  7: 'Software',
  26: 'Cable',
  27: 'Accessory'
};

interface CategoryProduct {
  id: number;
  part_number: string;
  series_id?: number;
  is_active: boolean;
  is_new: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
  series?: { series_name: string };
  [key: string]: any; // For specifications
}

interface CategoryProductWithMeta extends CategoryProduct {
  category_name: string;
  series_name: string;
  specifications: Record<string, any>;
}

// 기존 인터페이스들은 useTableMetadata 훅에서 제공됨

export default function CategoryProductsDataGrid() {
  const [rows, setRows] = useState<CategoryProductWithMeta[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [dynamicColumns, setDynamicColumns] = useState<GridColDef[]>([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  // 공유 메타데이터 훅 사용
  const { metadata: categoryMetadata } = useTableMetadata(selectedCategory);

  // Edit dialog state
  const [editDialog, setEditDialog] = useState({
    open: false,
    product: null as CategoryProduct | null,
    formData: {} as Record<string, any>,
  });

  // Add dialog state
  const [addDialog, setAddDialog] = useState({
    open: false,
    formData: {} as Record<string, any>,
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // 메타데이터 관련 함수들은 useTableMetadata 훅으로 대체됨

  // 파라미터별 컬럼 너비 결정
  const getColumnWidth = (parameterName: string): number => {
    const widthMap: Record<string, number> = {
      'part_number': 180,
      'series_id': 120,
      'scan_width': 100,
      'dpi': 80,
      'resolution': 120,
      'line_rate': 100,
      'speed': 80,
      'interface': 120,
      'spectrum': 100,
      'mount': 100,
      'mega_pixel': 100,
      'frame_rate': 100,
      'pixel_size': 100,
      'is_new': 80,
      'is_active': 80,
      'focal_length': 100,
      'image_circle': 100,
      'power': 80,
      'wavelength': 100,
      'channel': 80
    };
    return widthMap[parameterName] || 100;
  };

  // 파라미터별 렌더링 함수 (인터페이스 수정)
  const renderParameterCell = (params: any, config: any, labelInfo?: { unit?: string }) => {
    const value = params.value;
    const parameterName = config.parameter_name;
    
    if (value === null || value === undefined || value === '') {
      return <Typography variant="body2" color="text.disabled">-</Typography>;
    }

    // 특별한 렌더링이 필요한 파라미터들
    switch (parameterName) {
      case 'is_new':
        return value ? (
          <Chip label="NEW" size="small" color="info" variant="filled" />
        ) : null;
        
      case 'is_active':
        return (
          <Chip 
            label={value ? 'Active' : 'Inactive'} 
            size="small" 
            color={value ? 'success' : 'default'}
            variant="filled"
          />
        );
        
      case 'interface':
      case 'spectrum':
      case 'mount':
        return (
          <Chip 
            label={value} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        );
        
      case 'part_number':
        return (
          <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
            {value}
          </Typography>
        );
        
      default:
        // 숫자 파라미터에 단위 추가
        if (typeof value === 'number' && labelInfo?.unit) {
          return (
            <Typography variant="body2">
              {value} {labelInfo.unit}
            </Typography>
          );
        }
        
        return (
          <Typography variant="body2">
            {value}
          </Typography>
        );
    }
  };

  // 동적 컬럼 생성 함수 (공유 훅 사용)
  const generateDynamicColumns = useMemo((): GridColDef[] => {
    if (!categoryMetadata) return [];

    const visibleColumns = getVisibleColumns(categoryMetadata);

    // 동적 컬럼들 생성
    const dynamicCols: GridColDef[] = visibleColumns.map(config => {
      const headerName = getParameterLabel(config.parameter_name, categoryMetadata);
      const unit = getParameterUnit(config.parameter_name, categoryMetadata);
      
      return {
        field: config.parameter_name,
        headerName,
        width: getColumnWidth(config.parameter_name),
        renderCell: (params) => renderParameterCell(params, config, { unit }),
        sortable: true,
        filterable: true,
      };
    });

    // 기본 액션 컬럼 추가
    const actionsColumn: GridColDef = {
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
          onClick={() => handleDelete(params.row)}
        />,
      ],
    };

    return [...dynamicCols, actionsColumn];
  }, [categoryMetadata]);

  // 동적 컬럼을 상태에 설정 (의존성이 변경될 때만)
  React.useEffect(() => {
    setDynamicColumns(generateDynamicColumns);
  }, [generateDynamicColumns]);

  // Fetch series data
  const fetchSeriesData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('series')
        .select('*')
        .order('series_name');

      if (error) {
        console.error('Error fetching series:', error);
      } else {
        setSeries(data || []);
      }
    } catch (error) {
      console.error('Error fetching series data:', error);
    }
  }, []);

  // Fetch products from category-specific table
  const fetchData = useCallback(async () => {
    if (!selectedCategory) return;

    setLoading(true);
    try {
      const tableName = CATEGORY_TABLE_MAPPING[selectedCategory];
      const categoryName = CATEGORY_NAMES[selectedCategory];
      
      console.log('🔄 Fetching products from table:', tableName);
      
      let query = supabase
        .from(tableName)
        .select(`
          *,
          series(series_name)
        `, { count: 'exact' });

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

      // Transform data - 이제 specifications을 분리하지 않고 모든 컬럼을 직접 사용
      const transformedData: CategoryProductWithMeta[] = (data || []).map(product => {
        return {
          ...product, // 모든 컬럼 데이터를 직접 포함
          category_name: categoryName,
          series_name: product.series?.series_name || '-',
          specifications: {} // 하위 호환성을 위해 빈 객체 유지
        };
      });

      setRows(transformedData);
      setTotalRows(count || 0);
      
      if (data && data.length > 0) {
        console.log(`✅ Successfully loaded ${data.length} products from ${tableName}`);
        setSnackbar({
          open: true,
          message: `Loaded ${data.length} ${categoryName} products`,
          severity: 'success',
        });
      } else {
        console.log(`ℹ️ No products found in ${tableName}`);
        setSnackbar({
          open: true,
          message: `No ${categoryName} products found`,
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
    fetchSeriesData();
  }, [fetchSeriesData]);

  useEffect(() => {
    if (selectedCategory) {
      fetchData();
    }
  }, [fetchData, selectedCategory]);

  // Handle category change
  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page
    setRows([]); // Clear existing data
  };

  // Handle edit
  const handleEdit = (product: CategoryProductWithMeta) => {
    // 제품의 모든 데이터를 formData로 복사 (series 제외)
    const { series, category_name, series_name, specifications, ...formData } = product;
    
    setEditDialog({
      open: true,
      product: product,
      formData: { ...formData }
    });
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editDialog.product || !editDialog.formData.part_number?.trim() || !selectedCategory) {
      setSnackbar({
        open: true,
        message: 'Part number is required',
        severity: 'error',
      });
      return;
    }

    try {
      const tableName = CATEGORY_TABLE_MAPPING[selectedCategory];
      
      // 업데이트 데이터 준비 (id, created_at 제외)
      const { id, created_at, ...updateData } = editDialog.formData;
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', editDialog.product.id)
        .select()
        .single();

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

  // Handle delete
  const handleDelete = async (product: CategoryProductWithMeta) => {
    if (!selectedCategory) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete product "${product.part_number}"?`);
    if (!confirmed) return;

    try {
      const tableName = CATEGORY_TABLE_MAPPING[selectedCategory];
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', product.id);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      setSnackbar({
        open: true,
        message: 'Product deleted successfully!',
        severity: 'success',
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbar({
        open: true,
        message: `Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle add new
  const handleAdd = () => {
    // 기본값들 설정
    const defaultFormData = {
      part_number: '',
      series_id: null,
      is_active: true,
      is_new: false,
      image_url: null,
    };

    setAddDialog({
      open: true,
      formData: defaultFormData
    });
  };

  // Handle save add
  const handleSaveAdd = async () => {
    if (!addDialog.formData.part_number?.trim() || !selectedCategory) {
      setSnackbar({
        open: true,
        message: 'Part number is required',
        severity: 'error',
      });
      return;
    }

    try {
      const tableName = CATEGORY_TABLE_MAPPING[selectedCategory];

      const { data, error } = await supabase
        .from(tableName)
        .insert(addDialog.formData)
        .select()
        .single();

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

  // Handle export
  const handleExport = () => {
    if (rows.length === 0 || !selectedCategory) {
      setSnackbar({
        open: true,
        message: 'No data to export',
        severity: 'warning',
      });
      return;
    }

    const categoryName = CATEGORY_NAMES[selectedCategory];
    const csvContent = [
      ['ID', 'Part Number', 'Category', 'Series', 'Specifications', 'Active', 'New', 'Created Date'],
      ...rows.map(row => [
        row.id,
        row.part_number,
        row.category_name,
        row.series_name,
        JSON.stringify(row.specifications),
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
    a.download = `${categoryName.toLowerCase()}-products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: `Successfully exported ${rows.length} ${categoryName} products!`,
      severity: 'success',
    });
  };

  const resetEditDialog = () => {
    setEditDialog({
      open: false,
      product: null,
      formData: {}
    });
  };

  const resetAddDialog = () => {
    setAddDialog({
      open: false,
      formData: {}
    });
  };

  // 동적 폼 필드 렌더링
  const renderFormFields = (formData: Record<string, any>, onChange: (data: Record<string, any>) => void) => {
    if (!categoryMetadata) return null;

    const { displayConfig, parameterLabels } = categoryMetadata;
    
    // 편집 가능한 필드들만 표시 (created_at, updated_at 등 제외)
    const editableFields = displayConfig.filter(config => 
      !['created_at', 'updated_at'].includes(config.parameter_name)
    ).sort((a, b) => a.display_order - b.display_order);

    return (
      <Box>
        {editableFields.map((config) => {
          const label = parameterLabels[config.parameter_name];
          const fieldName = config.parameter_name;
          const fieldLabel = label?.label_ko || fieldName;
          const value = formData[fieldName] || '';

          // Boolean 필드들
          if (fieldName === 'is_active' || fieldName === 'is_new') {
            return (
              <FormControlLabel
                key={fieldName}
                control={
                  <Switch
                    checked={Boolean(value)}
                    onChange={(e) => onChange({ ...formData, [fieldName]: e.target.checked })}
                  />
                }
                label={fieldLabel}
                sx={{ mb: 1, display: 'block' }}
              />
            );
          }

          // Series 선택 필드
          if (fieldName === 'series_id') {
            return (
              <FormControl fullWidth key={fieldName} sx={{ mb: 2 }}>
                <InputLabel>{fieldLabel}</InputLabel>
                <Select
                  value={value || ''}
                  onChange={(e) => onChange({ ...formData, [fieldName]: e.target.value || null })}
                  label={fieldLabel}
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
            );
          }

          // 숫자 필드들
          const isNumericField = ['scan_width', 'dpi', 'line_rate', 'speed', 'resolution', 'pixel_size', 'frame_rate', 'mega_pixel', 'power', 'wavelength', 'focal_length', 'channel'].includes(fieldName);
          
          return (
            <TextField
              key={fieldName}
              margin="dense"
              label={`${fieldLabel}${label?.unit ? ` (${label.unit})` : ''}`}
              fullWidth
              variant="outlined"
              type={isNumericField ? 'number' : 'text'}
              value={value}
              onChange={(e) => {
                const newValue = isNumericField 
                  ? (e.target.value === '' ? null : parseFloat(e.target.value) || e.target.value)
                  : e.target.value;
                onChange({ ...formData, [fieldName]: newValue });
              }}
              sx={{ mb: 2 }}
            />
          );
        })}
      </Box>
    );
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
            Category Products Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage products from category-specific tables. Select a category to view and manage its products.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            disabled={!selectedCategory}
          >
            Add Product
          </Button>
          <Button
            variant="contained"
            onClick={handleExport}
            startIcon={<DownloadIcon />}
            disabled={!selectedCategory || rows.length === 0}
            sx={{ minWidth: 120 }}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Category Selector */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Select Category</InputLabel>
          <Select
            value={selectedCategory || ''}
            onChange={(e) => handleCategoryChange(Number(e.target.value))}
            label="Select Category"
          >
            {Object.entries(CATEGORY_NAMES).map(([id, name]) => (
              <MenuItem key={id} value={Number(id)}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedCategory && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Viewing products from table: <code>{CATEGORY_TABLE_MAPPING[selectedCategory]}</code>
          </Typography>
        )}
      </Box>

      {/* Data Grid */}
      {selectedCategory ? (
        <Box sx={{ height: { xs: 400, md: 600 }, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={dynamicColumns}
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
      ) : (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8, 
          border: '2px dashed #E8ECEF', 
          borderRadius: 2,
          backgroundColor: '#F8F9FB'
        }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No Category Selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please select a category from the dropdown above to view products.
          </Typography>
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={resetEditDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh' }
        }}
      >
        <DialogTitle>
          Edit Product
          {editDialog.formData.part_number && (
            <Typography variant="body2" color="text.secondary">
              {editDialog.formData.part_number}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {renderFormFields(
            editDialog.formData,
            (newFormData) => setEditDialog(prev => ({ ...prev, formData: newFormData }))
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
        PaperProps={{
          sx: { maxHeight: '90vh' }
        }}
      >
        <DialogTitle>
          Add Product
          {selectedCategory && (
            <Typography variant="body2" color="text.secondary">
              Category: {CATEGORY_NAMES[selectedCategory]}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {renderFormFields(
            addDialog.formData,
            (newFormData) => setAddDialog(prev => ({ ...prev, formData: newFormData }))
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