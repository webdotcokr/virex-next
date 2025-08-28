'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Snackbar, Alert, MenuItem, Select, FormControl, InputLabel, IconButton,
  Tabs, Tab, Grid, Card, CardContent, CardHeader
} from '@mui/material';
import { GridRowId } from '@mui/x-data-grid';
import { Edit, Delete, Add, OpenInNew, Download as DownloadIcon, CloudUpload, Description, Build, Engineering, Memory, Computer, Cable, DeleteForever } from '@mui/icons-material';
import { httpQueries } from '@/lib/http-supabase';
import FileDropzone from './FileDropzone';
import MultiFileDropzone from './MultiFileDropzone';
import CSVImportDialog from './CSVImportDialog';

// Type definitions
interface Download {
  id: number
  title: string
  file_name?: string
  file_url: string
  category_id?: number
  hit_count?: number
  created_at?: string
}

interface DownloadCategory {
  id: number
  name: string
  is_member_only?: boolean
  created_at?: string
}

type CategoryFilter = number | 'all';

function useCategories() {
  const [categories, setCategories] = useState<DownloadCategory[]>([]);
  useEffect(() => {
    httpQueries.getGenericData('download_categories', {
      orderBy: 'id',
      orderDirection: 'asc'
    }).then(({ data }) => setCategories(data as DownloadCategory[]));
  }, []);
  return categories;
}

function useDownloads(page: number, pageSize: number, category: CategoryFilter) {
  const [rows, setRows] = useState<Download[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    
    try {
      const filters = category !== 'all' ? { category_id: category } : {}
      
      // Get data and count simultaneously
      const [dataResult, countResult] = await Promise.all([
        httpQueries.getGenericData('downloads', {
          page: page + 1, // HTTP queries use 1-based page
          limit: pageSize,
          orderBy: 'created_at',
          orderDirection: 'desc',
          filters
        }),
        httpQueries.getGenericCount('downloads', { filters })
      ])
      
      // 안전한 데이터 처리 - undefined 체크 추가
      setRows(Array.isArray(dataResult.data) ? dataResult.data as Download[] : [])
      setTotal(countResult.count || 0)
    } catch (error) {
      console.error('Downloads data fetch error:', error);
      setRows([]); // 오류 시 빈 배열로 설정
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, category]);

  useEffect(() => { refresh(); }, [refresh]);
  return { rows, total, loading, refresh };
}

function DownloadFormDialog({
  open, onClose, onSubmit,
  categories, initial
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { title: string; file_name: string; file_url: string; category_id: number }) => void;
  categories: DownloadCategory[];
  initial?: Partial<Download>; // for edit
}) {
  const [values, setValues] = useState({
    title: initial?.title ?? '',
    file_name: initial?.file_name ?? '',
    file_url: initial?.file_url ?? '',
    category_id: initial?.category_id ?? (categories[0]?.id ?? 1),
  });

  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    setValues({
      title: initial?.title ?? '',
      file_name: initial?.file_name ?? '',
      file_url: initial?.file_url ?? '',
      category_id: initial?.category_id ?? (categories[0]?.id ?? 1),
    });
    setShowManualInput(false);
  }, [initial, categories]);

  const handle = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement> | any) =>
    setValues(v => ({ ...v, [k]: e.target.value }));

  const handleFileUploaded = useCallback((fileUrl: string, fileName: string) => {
    setValues(v => ({ 
      ...v, 
      file_url: fileUrl,
      file_name: v.file_name || fileName,
      title: v.title || fileName.replace(/\.[^/.]+$/, '') // 확장자 제거한 파일명을 제목으로
    }));
  }, []);

  const isFormValid = values.title && values.file_name && values.file_url && values.category_id;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{initial?.id ? 'Edit Download' : 'Add Download'}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <TextField 
          label="Title" 
          fullWidth 
          sx={{ mb: 2 }} 
          value={values.title} 
          onChange={handle('title')}
          required
        />
        
        <TextField 
          label="File Name" 
          fullWidth 
          sx={{ mb: 2 }} 
          value={values.file_name} 
          onChange={handle('file_name')}
          required
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select label="Category" value={values.category_id} onChange={handle('category_id')}>
            {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>

        {/* 파일 업로드 섹션 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            파일 업로드
          </Typography>
          
          {!showManualInput ? (
            <Box>
              <FileDropzone
                onFileUploaded={handleFileUploaded}
                categoryId={values.category_id}
                accept="*/*"
              />
              
              {values.file_url && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  파일이 업로드되었습니다: {values.file_name}
                </Alert>
              )}
              
              <Button 
                variant="text" 
                size="small" 
                onClick={() => setShowManualInput(true)}
                sx={{ mt: 1 }}
              >
                또는 URL 직접 입력
              </Button>
            </Box>
          ) : (
            <Box>
              <TextField 
                label="File URL" 
                fullWidth 
                value={values.file_url} 
                onChange={handle('file_url')}
                placeholder="https://example.com/file.pdf"
              />
              <Button 
                variant="text" 
                size="small" 
                onClick={() => setShowManualInput(false)}
                sx={{ mt: 1 }}
              >
                파일 업로드로 돌아가기
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={() => onSubmit(values)}
          disabled={!isFormValid}
        >
          {initial?.id ? 'Save Changes' : 'Add Download'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function DownloadsDataGrid() {
  const categories = useCategories();
  
  // 모든 상태를 먼저 정의 (Hook 규칙 준수)
  const [activeTab, setActiveTab] = useState(0); // 0: 데이터 관리, 1: 일괄 업로드, 2: CSV 임포트
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [pagination, setPagination] = useState({ page: 0, pageSize: 25 });
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<GridRowId[]>([]);
  
  // selectedRows 상태 변화 추적
  useEffect(() => {
    console.log('🔍 selectedRows 상태 변화:', {
      selectedRows,
      type: typeof selectedRows,
      isArray: Array.isArray(selectedRows),
      length: selectedRows?.length
    });
  }, [selectedRows]);
  
  // 데이터 관리 탭에서만 데이터를 로드하도록 조건부 처리
  const { rows, total, loading, refresh } = useDownloads(
    activeTab === 0 ? pagination.page : 0, 
    activeTab === 0 ? pagination.pageSize : 25, 
    activeTab === 0 ? category : 'all'
  );

  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' | 'info' | 'warning' }>({
    open: false, msg: '', sev: 'success'
  });

  const [dialog, setDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; target?: Download }>({
    open: false, mode: 'add'
  });

  const catName = useCallback((id?: number) => categories.find(c => c.id === id)?.name ?? 'Unknown', [categories]);

  // 페이지/카테고리/탭 변경 시 선택 초기화 (selectedRows를 의존성에서 제거)
  useEffect(() => {
    console.log('🔍 선택 초기화 트리거:', {
      page: pagination.page,
      category,
      activeTab
    });
    setSelectedRows([]);
  }, [pagination.page, category, activeTab]);

  // 데이터 로딩 시 선택 상태 안전성 보장
  useEffect(() => {
    if (!Array.isArray(selectedRows)) {
      setSelectedRows([]);
    }
  }, [selectedRows]);

  // 카테고리별 아이콘 및 색상 매핑
  const getCategoryIcon = useCallback((categoryId: number) => {
    switch (categoryId) {
      case 1: return <Description />; // 바이렉스 제품 카달로그
      case 2: return <Description />; // 데이터 시트
      case 3: return <Build />; // 메뉴얼
      case 4: return <Engineering />; // 도면
      case 5: return <Memory />; // 카메라 펌웨어
      case 6: return <Computer />; // 소프트웨어
      case 7: return <Cable />; // 장치 드라이버
      default: return <CloudUpload />;
    }
  }, []);

  const getCategoryColor = useCallback((categoryId: number): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
    switch (categoryId) {
      case 1: return 'primary';
      case 2: return 'info';
      case 3: return 'success';
      case 4: return 'warning';
      case 5: return 'error';
      case 6: return 'secondary';
      case 7: return 'primary';
      default: return 'primary';
    }
  }, []);

  // 다중 파일 업로드 핸들러
  const handleMultipleFilesUploaded = useCallback(async (
    categoryId: number, 
    results: Array<{ fileUrl: string; fileName: string; originalFile: File }>
  ) => {
    try {
      const insertPromises = results.map(result => 
        httpQueries.insertGeneric('downloads', {
          title: result.fileName.replace(/\.[^/.]+$/, ''), // 확장자 제거한 파일명
          file_name: result.fileName,
          file_url: result.fileUrl,
          category_id: categoryId,
          hit_count: 0
        })
      );

      const insertResults = await Promise.all(insertPromises);
      const errorCount = insertResults.filter(r => r.error).length;
      const successCount = results.length - errorCount;

      if (successCount > 0) {
        setSnack({ 
          open: true, 
          msg: `${successCount}개 파일이 성공적으로 업로드되었습니다.${errorCount > 0 ? ` (실패: ${errorCount}개)` : ''}`, 
          sev: errorCount > 0 ? 'warning' : 'success' 
        });
        refresh();
      } else {
        setSnack({ 
          open: true, 
          msg: '모든 파일 업로드가 실패했습니다.', 
          sev: 'error' 
        });
      }
    } catch (error) {
      setSnack({ 
        open: true, 
        msg: `업로드 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        sev: 'error' 
      });
    }
  }, [refresh]);

  // CSV 임포트 완료 핸들러
  const handleCSVImportComplete = useCallback((results: { success: number; failed: number; total: number }) => {
    setCsvImportOpen(false);
    refresh();
    
    const { success, failed, total } = results;
    if (failed === 0) {
      setSnack({ 
        open: true, 
        msg: `CSV 임포트 완료: ${success}개 레코드가 성공적으로 처리되었습니다.`, 
        sev: 'success' 
      });
    } else if (success === 0) {
      setSnack({ 
        open: true, 
        msg: `CSV 임포트 실패: 모든 ${failed}개 레코드가 실패했습니다.`, 
        sev: 'error' 
      });
    } else {
      setSnack({ 
        open: true, 
        msg: `CSV 임포트 완료: ${success}개 성공, ${failed}개 실패 (총 ${total}개)`, 
        sev: 'warning' 
      });
    }
  }, [refresh]);

  // 일괄 삭제 핸들러
  const handleBulkDelete = useCallback(async () => {
    if (!Array.isArray(selectedRows) || selectedRows.length === 0) {
      setSnack({ open: true, msg: '삭제할 항목을 선택해주세요.', sev: 'warning' });
      return;
    }

    const confirmMessage = `선택한 ${selectedRows.length}개 항목을 삭제하시겠습니까?\n\n관련된 파일들도 함께 삭제됩니다.`;
    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch('/api/admin/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table: 'downloads',
          ids: selectedRows.map(id => Number(id))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      const { success, failed, errors } = result;

      if (failed === 0) {
        setSnack({ 
          open: true, 
          msg: `${success}개 항목이 성공적으로 삭제되었습니다.`, 
          sev: 'success' 
        });
      } else if (success === 0) {
        setSnack({ 
          open: true, 
          msg: `모든 ${failed}개 항목 삭제가 실패했습니다.`, 
          sev: 'error' 
        });
      } else {
        setSnack({ 
          open: true, 
          msg: `${success}개 성공, ${failed}개 실패로 삭제되었습니다.`, 
          sev: 'warning' 
        });
      }

      // 오류 세부사항이 있으면 콘솔에 출력
      if (errors && errors.length > 0) {
        console.warn('Bulk delete errors:', errors);
      }

      // 선택 초기화 및 데이터 새로고침
      setSelectedRows([]);
      refresh();

    } catch (error) {
      setSnack({ 
        open: true, 
        msg: `일괄 삭제 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`, 
        sev: 'error' 
      });
    }
  }, [selectedRows, refresh]);

  // columns는 커스텀 테이블로 대체되어 더 이상 사용하지 않음

  const handleDelete = async (id: GridRowId) => {
    if (!confirm('Delete this item?')) return;
    
    // Find the download record to get the file URL
    const downloadRecord = rows.find(row => row.id === id);
    
    try {
      // Delete from database first
      const { error: dbError } = await httpQueries.deleteGeneric('downloads', id);
      
      if (dbError) {
        throw new Error(dbError.message);
      }

      // Delete from storage if file URL exists and is from Supabase Storage
      if (downloadRecord?.file_url?.includes('/storage/v1/object/public/downloads/')) {
        try {
          const response = await fetch(`/api/admin/file-delete?fileUrl=${encodeURIComponent(downloadRecord.file_url)}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            console.warn('Failed to delete file from storage, but database record was deleted');
          }
        } catch (storageError) {
          console.warn('Storage deletion failed:', storageError);
        }
      }

      setSnack({ open: true, msg: 'Deleted successfully', sev: 'success' });
      refresh();
    } catch (error) {
      setSnack({ 
        open: true, 
        msg: `Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        sev: 'error' 
      });
    }
  };

  const handleSubmit = async (values: { title: string; file_name: string; file_url: string; category_id: number }) => {
    const isEdit = dialog.mode === 'edit' && dialog.target?.id;
    const { error } = isEdit
      ? await httpQueries.updateGeneric('downloads', dialog.target!.id, values)
      : await httpQueries.insertGeneric('downloads', { ...values, hit_count: 0 });

    setSnack({ open: true, msg: error ? (isEdit ? `Update failed: ${error.message}` : `Create failed: ${error.message}`) : (isEdit ? 'Updated' : 'Created'), sev: error ? 'error' : 'success' });
    setDialog({ open: false, mode: 'add', target: undefined });
    refresh();
  };

  const exportCSV = () => {
    if (rows.length === 0) return setSnack({ open: true, msg: 'No data to export', sev: 'warning' });
    const csv = [
      ['ID', 'Title', 'File Name', 'Category', 'Downloads', 'Created', 'File URL'],
      ...rows.map(r => [r.id, r.title, r.file_name ?? '', catName(r.category_id ?? undefined), r.hit_count ?? 0, new Date(r.created_at ?? '').toLocaleDateString('ko-KR'), r.file_url])
    ].map(a => a.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a'); a.href = url; a.download = `downloads-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
    setSnack({ open: true, msg: `Exported ${rows.length} rows`, sev: 'success' });
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: .5 }}>Downloads Management</Typography>
          <Typography variant="body2" color="text.secondary">Manage download files and organize by categories.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Add />} onClick={() => setDialog({ open: true, mode: 'add' })}>Add</Button>
          <Button variant="contained" onClick={exportCSV}>Export CSV</Button>
        </Box>
      </Box>

      {/* 탭 네비게이션 */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, newValue) => {
          console.log('🔍 탭 변경:', {
            from: activeTab,
            to: newValue,
            selectedRowsBeforeChange: selectedRows
          });
          setActiveTab(newValue);
        }}>
          <Tab label="데이터 관리" />
          <Tab label="일괄 업로드" />
          <Tab label="CSV 임포트" />
        </Tabs>
      </Box>

      {/* 탭 내용 */}
      {activeTab === 0 && (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Category Filter</InputLabel>
              <Select label="Category Filter" value={category} onChange={(e) => { setCategory(e.target.value as CategoryFilter); setPagination(p => ({ ...p, page: 0 })); }}>
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>

            {Array.isArray(selectedRows) && selectedRows.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="body2" color="primary">
                  {selectedRows.length}개 선택됨
                </Typography>
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  startIcon={<DeleteForever />}
                  onClick={handleBulkDelete}
                  disabled={loading}
                >
                  일괄 삭제
                </Button>
              </Box>
            )}
          </Box>

          <Box sx={{ 
            height: '600px',
            minHeight: '600px', 
            width: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
{/* 커스텀 테이블로 DataGrid 대체 */}
            <div style={{ 
              border: '1px solid #E8ECEF', 
              borderRadius: '4px',
              backgroundColor: 'white',
              overflow: 'hidden'
            }}>
              {/* 테이블 헤더 */}
              <div style={{
                display: 'flex',
                backgroundColor: '#F8F9FB',
                borderBottom: '1px solid #E8ECEF',
                fontWeight: 'bold',
                fontSize: '14px',
                padding: '12px 0'
              }}>
                <div style={{ width: '48px', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.length === rows.length && rows.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(rows.map(row => row.id));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                    style={{ transform: 'scale(1.2)' }}
                  />
                </div>
                <div style={{ width: '80px', padding: '0 8px' }}>ID</div>
                <div style={{ flex: 1, minWidth: '260px', padding: '0 8px' }}>Title</div>
                <div style={{ width: '200px', padding: '0 8px' }}>File Name</div>
                <div style={{ width: '150px', padding: '0 8px' }}>Category</div>
                <div style={{ width: '110px', padding: '0 8px' }}>Downloads</div>
                <div style={{ width: '80px', padding: '0 8px' }}>File</div>
                <div style={{ width: '120px', padding: '0 8px' }}>Created</div>
                <div style={{ width: '100px', padding: '0 8px' }}>Actions</div>
              </div>

              {/* 로딩 상태 */}
              {loading && (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: '#666' 
                }}>
                  Loading...
                </div>
              )}

              {/* 데이터 없음 */}
              {!loading && (!rows || rows.length === 0) && (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: '#666' 
                }}>
                  No data available
                </div>
              )}

              {/* 테이블 행들 */}
              {!loading && rows && rows.length > 0 && rows.map((row) => (
                <div
                  key={row.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid #E8ECEF',
                    fontSize: '14px',
                    padding: '12px 0',
                    backgroundColor: selectedRows.includes(row.id) ? '#E3F2FD' : 'white'
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedRows.includes(row.id)) {
                      e.currentTarget.style.backgroundColor = '#F8F9FB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedRows.includes(row.id)) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  {/* 체크박스 */}
                  <div style={{ width: '48px', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows([...selectedRows, row.id]);
                        } else {
                          setSelectedRows(selectedRows.filter(id => id !== row.id));
                        }
                      }}
                      style={{ transform: 'scale(1.2)' }}
                    />
                  </div>
                  
                  {/* ID */}
                  <div style={{ width: '80px', padding: '0 8px' }}>{row.id}</div>
                  
                  {/* Title */}
                  <div style={{ flex: 1, minWidth: '260px', padding: '0 8px' }}>
                    {row.title}
                  </div>
                  
                  {/* File Name */}
                  <div style={{ width: '200px', padding: '0 8px' }}>
                    {row.file_name || '-'}
                  </div>
                  
                  {/* Category */}
                  <div style={{ width: '150px', padding: '0 8px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#E0E7FF',
                      border: '1px solid #C7D2FE',
                      fontSize: '12px'
                    }}>
                      {catName(row.category_id)}
                    </span>
                  </div>
                  
                  {/* Downloads */}
                  <div style={{ width: '110px', padding: '0 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <DownloadIcon style={{ fontSize: '16px' }} />
                    {row.hit_count ?? 0}
                  </div>
                  
                  {/* File Link */}
                  <div style={{ width: '80px', padding: '0 8px' }}>
                    <IconButton 
                      size="small" 
                      onClick={() => window.open(row.file_url, '_blank')}
                      style={{ padding: '4px' }}
                    >
                      <OpenInNew style={{ fontSize: '16px' }} />
                    </IconButton>
                  </div>
                  
                  {/* Created Date */}
                  <div style={{ width: '120px', padding: '0 8px', fontSize: '12px', color: '#666' }}>
                    {row.created_at ? new Date(row.created_at).toLocaleDateString('ko-KR', { 
                      year: '2-digit', 
                      month: 'short', 
                      day: 'numeric' 
                    }) : '-'}
                  </div>
                  
                  {/* Actions */}
                  <div style={{ width: '100px', padding: '0 8px', display: 'flex', gap: '4px' }}>
                    <IconButton 
                      size="small"
                      onClick={() => setDialog({ open: true, mode: 'edit', target: row })}
                      style={{ padding: '4px' }}
                    >
                      <Edit style={{ fontSize: '16px' }} />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => handleDelete(row.id)}
                      style={{ padding: '4px' }}
                    >
                      <Delete style={{ fontSize: '16px', color: '#f44336' }} />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>

            {/* 커스텀 페이지네이션 */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '16px',
              padding: '0 16px'
            }}>
              {/* 좌측: 페이지 크기 선택 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Rows per page:</span>
                <select 
                  value={pagination.pageSize} 
                  onChange={(e) => setPagination(p => ({ ...p, pageSize: parseInt(e.target.value), page: 0 }))}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* 중앙: 페이지 정보 */}
              <div style={{ fontSize: '14px', color: '#666' }}>
                {total > 0 ? (
                  `${pagination.page * pagination.pageSize + 1}-${Math.min((pagination.page + 1) * pagination.pageSize, total)} of ${total}`
                ) : '0 items'}
              </div>

              {/* 우측: 페이지 네비게이션 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: Math.max(0, p.page - 1) }))}
                  disabled={pagination.page === 0}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: pagination.page === 0 ? '#f5f5f5' : 'white',
                    cursor: pagination.page === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: '14px', minWidth: '60px', textAlign: 'center' }}>
                  Page {pagination.page + 1} of {Math.ceil(total / pagination.pageSize) || 1}
                </span>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page >= Math.ceil(total / pagination.pageSize) - 1}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: pagination.page >= Math.ceil(total / pagination.pageSize) - 1 ? '#f5f5f5' : 'white',
                    cursor: pagination.page >= Math.ceil(total / pagination.pageSize) - 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </Box>
        </>
      )}

      {/* 일괄 업로드 탭 */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            카테고리별 파일 일괄 업로드
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            각 카테고리별로 여러 파일을 한번에 업로드할 수 있습니다. 파일은 Supabase Storage에 저장되고 자동으로 데이터베이스에 등록됩니다.
          </Typography>

          <Grid container spacing={3}>
            {categories.map(cat => (
              <Grid item xs={12} md={6} lg={4} key={cat.id}>
                <Card
                  sx={{
                    height: '100%',
                    border: `2px solid`,
                    borderColor: `${getCategoryColor(cat.id)}.main`,
                    '&:hover': {
                      boxShadow: theme => `0 4px 20px ${theme.palette[getCategoryColor(cat.id)].main}30`
                    }
                  }}
                >
                  <CardHeader
                    avatar={React.cloneElement(getCategoryIcon(cat.id), { 
                      color: getCategoryColor(cat.id),
                      sx: { fontSize: 32 }
                    })}
                    title={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">{cat.name}</Typography>
                        {cat.is_member_only && (
                          <Chip size="small" color="warning" label="회원전용" />
                        )}
                      </Box>
                    }
                    sx={{ pb: 1 }}
                  />
                  <CardContent sx={{ pt: 0 }}>
                    <MultiFileDropzone
                      categoryId={cat.id}
                      onFilesUploaded={(results) => handleMultipleFilesUploaded(cat.id, results)}
                      accept="*/*"
                      maxSize={100 * 1024 * 1024} // 100MB
                      maxFiles={20}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* CSV 임포트 탭 */}
      {activeTab === 2 && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            CSV 대량 임포트
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            CSV 파일을 통해 다운로드 데이터를 대량으로 임포트할 수 있습니다.
            <br />
            컬럼 매핑을 통해 데이터를 정확하게 가져올 수 있습니다.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={() => {
                // CSV 템플릿 다운로드
                const link = document.createElement('a');
                link.href = '/api/admin/downloads-csv-import';
                link.download = 'downloads_template.csv';
                link.click();
              }}
            >
              템플릿 다운로드
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<CloudUpload />}
              onClick={() => setCsvImportOpen(true)}
            >
              CSV 파일 임포트
            </Button>
          </Box>
          
          <Alert severity="info" sx={{ mt: 3, textAlign: 'left', maxWidth: 600, mx: 'auto' }}>
            <Typography variant="subtitle2" gutterBottom>CSV 파일 요구사항:</Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li><strong>필수 컬럼:</strong> title, file_name, file_url, category_id</li>
              <li><strong>선택 컬럼:</strong> hit_count (기본값: 0)</li>
              <li><strong>category_id:</strong> 1-7 사이의 숫자 (다운로드 카테고리 ID)</li>
              <li><strong>중복 처리:</strong> file_url이 같은 경우 업데이트됩니다</li>
            </ul>
          </Alert>
        </Box>
      )}

      <DownloadFormDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, mode: 'add' })}
        onSubmit={handleSubmit}
        categories={categories}
        initial={dialog.mode === 'edit' ? dialog.target : undefined}
      />

      <CSVImportDialog
        open={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        onImportComplete={handleCSVImportComplete}
      />

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.sev} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}