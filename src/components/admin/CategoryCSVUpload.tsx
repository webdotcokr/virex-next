'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  LinearProgress,
  Paper,
  Chip,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface CategoryCSVUploadProps {
  onUploadComplete?: () => void;
}

interface UploadResult {
  success: boolean;
  summary: {
    totalRows: number;
    inserted: number;
    updated: number;
    errors: number;
  };
  errors?: Array<{
    row: number;
    part_number?: string;
    error: string;
  }>;
}

export default function CategoryCSVUpload({ onUploadComplete }: CategoryCSVUploadProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 카테고리 매핑
  const categories = [
    { id: 9, name: 'CIS', table: 'products_cis' },
    { id: 10, name: 'TDI', table: 'products_tdi' },
    { id: 11, name: 'Line', table: 'products_line' },
    { id: 12, name: 'Area', table: 'products_area' },
    { id: 13, name: 'Invisible', table: 'products_invisible' },
    { id: 14, name: 'Scientific', table: 'products_scientific' },
    { id: 15, name: 'Large Format Lens', table: 'products_large_format_lens' },
    { id: 16, name: 'Telecentric', table: 'products_telecentric' },
    { id: 17, name: 'FA Lens', table: 'products_fa_lens' },
    { id: 18, name: '3D Laser Profiler', table: 'products_3d_laser_profiler' },
    { id: 19, name: '3D Stereo Camera', table: 'products_3d_stereo_camera' },
    { id: 20, name: 'Light', table: 'products_light' },
    { id: 22, name: 'Controller', table: 'products_controller' },
    { id: 23, name: 'Frame Grabber', table: 'products_frame_grabber' },
    { id: 24, name: 'GigE LAN Card', table: 'products_gige_lan_card' },
    { id: 25, name: 'USB Card', table: 'products_usb_card' },
    { id: 7, name: 'Software', table: 'products_software' },
    { id: 26, name: 'Cable', table: 'products_cable' },
    { id: 27, name: 'Accessory', table: 'products_accessory' }
  ];

  const handleFileSelect = () => {
    if (!selectedCategory) {
      setSnackbar({ open: true, message: '먼저 카테고리를 선택하세요.', severity: 'error' });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedCategory) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('categoryId', selectedCategory.toString());

      const response = await fetch('/api/admin/csv-category-upload', {
        method: 'POST',
        body: formData,
      });

      const result: UploadResult = await response.json();

      if (result.success) {
        setUploadResult(result);
        setSnackbar({ 
          open: true, 
          message: `업로드 완료: ${result.summary.inserted}개 추가, ${result.summary.updated}개 업데이트`, 
          severity: 'success' 
        });
        onUploadComplete?.();
      } else {
        throw new Error('업로드 실패');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setSnackbar({ open: true, message: '업로드 중 오류가 발생했습니다.', severity: 'error' });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const generateCSVTemplate = () => {
    if (!selectedCategory) return;

    const category = categories.find(c => c.id === selectedCategory);
    if (!category) return;

    // 카테고리별 템플릿 헤더 정의 (SQL 테이블 정의와 100% 매칭)
    const getTemplateHeaders = (categoryName: string): string[] => {
      const commonHeaders = ['part_number', 'series', 'is_active', 'is_new', 'image_url'];
      
      switch (categoryName.toLowerCase()) {
        case 'cis':
          return [...commonHeaders, 'scan_width', 'dpi', 'resolution', 'line_rate', 'speed', 'wd', 'no_of_pixels', 'spectrum', 'interface'];
        
        case 'tdi':
          return [...commonHeaders, 'mount', 'spectrum', 'interface', 'line_rate', 'pixel_size', 'resolution', 'dynamic_range', 'number_of_line'];
        
        case 'area':
          return [...commonHeaders, 'mega_pixel', 'resolution', 'sensor_model', 'frame_rate', 'pixel_size', 'image_circle', 'interface', 'spectrum', 'dynamic_range', 'mount'];
        
        case 'invisible':
          return [...commonHeaders, 'type', 'mega_pixel', 'resolution', 'pixel_size', 'spectrum', 'dynamic_range', 'sensor_model', 'frame_rate', 'interface', 'mount', 'image_circle', 'number_of_line'];
        
        case 'line':
          return [...commonHeaders, 'resolution', 'number_of_line', 'line_rate', 'line_rate_turbo', 'pixel_size', 'interface', 'spectrum', 'dynamic_range', 'mount'];
        
        case 'scientific':
          return [...commonHeaders, 'mega_pixel', 'resolution', 'pixel_size', 'dynamic_range', 'peak_qe', 'sensor_model', 'frame_rate', 'spectrum', 'interface', 'mount'];
        
        case 'large format lens':
          return [...commonHeaders, 'mag_range', 'central_mag', 'image_circle', 'focal_length', 'image_resolution', 'f_number', 'coaxial', 'mount'];
        
        case 'telecentric':
          return [...commonHeaders, 'mag', 'wd', 'na', 'f_number', 'image_circle', 'coaxial', 'mount', 'mtf30', 'optical_resolution', 'distortion', 'dof', 'length_of_io', 'telecentricity'];
        
        case 'fa lens':
          return [...commonHeaders, 'focal_length', 'image_circle', 'image_resolution', 'mag_range', 'f_number', 'mount', 'mod', 'optical_distortion', 'wd'];
        
        case '3d laser profiler':
          return [...commonHeaders, 'point', 'z_range', 'z_resolution', 'x_resolution', 'fov', 'profile_rate', 'wd', 'linearity', 'laser_option'];
        
        case '3d stereo camera':
          return [...commonHeaders, 'mega_pixel', 'pixel_size', 'fov', 'focal_length', 'depth_accuracy', 'spectrum', 'shutter_type', 'interface'];
        
        case 'light':
          return [...commonHeaders, 'color', 'wavelength', 'power', 'controller', 'current', 'focal_length'];
        
        case 'controller':
          return [...commonHeaders, 'channel', 'max_continuous_current', 'max_pulse_current', 'led_voltage_range', 'min_pulse_width', 'max_frequency', 'max_power_output_total'];
        
        case 'frame grabber':
          return [...commonHeaders, 'model', 'pc_slot', 'max_pixel_clock', 'acquisition_rate', 'onboard_memory', 'input', 'cables'];
        
        case 'gige lan card':
          return [...commonHeaders, 'chipset', 'interface', 'pc_slot', 'port', 'connector', 'poe'];
        
        case 'usb card':
          return [...commonHeaders, 'chipset', 'interface', 'pc_slot', 'port', 'connector', 'trans_speed'];
        
        case 'software':
          return [...commonHeaders, 'type', 'description', 'device'];
        
        case 'cable':
          return [...commonHeaders, 'description'];
        
        case 'accessory':
          return [...commonHeaders, 'description'];
        
        default:
          return [...commonHeaders, 'description'];
      }
    };

    const headers = getTemplateHeaders(category.name);
    const csvContent = headers.join(',') + '\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${category.name.toLowerCase()}_products_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CloudUploadIcon sx={{ mr: 1 }} />
          카테고리별 CSV 업로드
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="category-select-label">카테고리 선택</InputLabel>
              <Select
                labelId="category-select-label"
                value={selectedCategory || ''}
                label="카테고리 선택"
                onChange={(e) => setSelectedCategory(Number(e.target.value))}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'end' }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={generateCSVTemplate}
                disabled={!selectedCategory}
                size="large"
              >
                템플릿 다운로드
              </Button>
              <Tooltip title="선택한 카테고리의 CSV 템플릿을 다운로드합니다">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={handleFileSelect}
            disabled={uploading || !selectedCategory}
            size="large"
            fullWidth
            sx={{ height: 56 }}
          >
            {uploading ? '업로드 중...' : 'CSV 파일 업로드'}
          </Button>
          {uploading && (
            <LinearProgress sx={{ mt: 2 }} />
          )}
        </Box>
      </Paper>

      {/* Upload Results */}
      {uploadResult && (
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              업로드 결과
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6} sm={3}>
                <Chip 
                  label={`전체: ${uploadResult.summary.totalRows}`} 
                  color="default" 
                  variant="outlined" 
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Chip 
                  label={`추가: ${uploadResult.summary.inserted}`} 
                  color="success" 
                  variant="outlined" 
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Chip 
                  label={`업데이트: ${uploadResult.summary.updated}`} 
                  color="info" 
                  variant="outlined" 
                  size="small"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Chip 
                  label={`오류: ${uploadResult.summary.errors}`} 
                  color={uploadResult.summary.errors > 0 ? "error" : "default"} 
                  variant="outlined" 
                  size="small"
                />
              </Grid>
            </Grid>

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                  <ErrorIcon sx={{ mr: 1 }} />
                  오류 상세내역
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {uploadResult.errors.slice(0, 10).map((error, index) => (
                    <Alert key={index} severity="error" sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        <strong>행 {error.row}:</strong> {error.part_number && `(${error.part_number}) `}{error.error}
                      </Typography>
                    </Alert>
                  ))}
                  {uploadResult.errors.length > 10 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      ... 및 {uploadResult.errors.length - 10}개의 추가 오류
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}