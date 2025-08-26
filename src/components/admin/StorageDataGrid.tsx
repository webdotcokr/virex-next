'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  Avatar,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowId,
  GridRowSelectionModel
} from '@mui/x-data-grid';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  DriveFileMove as MoveIcon,
  Folder as FolderIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  CloudUpload as UploadIcon,
  CreateNewFolder as CreateFolderIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

// Types
interface StorageFile {
  name: string;
  id?: string;
  size: number;
  contentType: string;
  lastModified: string;
  isFolder: boolean;
  publicUrl?: string;
}

interface BucketInfo {
  name: string;
  label: string;
}

const AVAILABLE_BUCKETS: BucketInfo[] = [
  { name: 'downloads', label: 'Downloads' },
  { name: 'files', label: 'Files' }
];

interface StorageDataGridProps {
  onBucketChange?: (bucket: string) => void;
  onFolderChange?: (folder: string) => void;
  currentBucket?: string;
  currentFolder?: string;
}

export default function StorageDataGrid({
  onBucketChange,
  onFolderChange,
  currentBucket: initialBucket = 'downloads',
  currentFolder: initialFolder = ''
}: StorageDataGridProps = {}) {
  // State
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentBucket, setCurrentBucket] = useState(initialBucket);
  const [currentFolder, setCurrentFolder] = useState(initialFolder);
  const [selectedFiles, setSelectedFiles] = useState<GridRowSelectionModel>([]);
  
  // Dialogs
  const [moveDialog, setMoveDialog] = useState({
    open: false,
    fromPath: '',
    toPath: ''
  });
  
  const [createFolderDialog, setCreateFolderDialog] = useState({
    open: false,
    folderName: ''
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // Load files
  const loadFiles = useCallback(async () => {
    setLoading(true);
    // 새로운 데이터 로딩 시 선택 상태 리셋
    setSelectedFiles([]);
    
    try {
      const params = new URLSearchParams({
        bucket: currentBucket,
        folder: currentFolder,
        limit: '100'
      });

      const response = await fetch(`/api/admin/storage/list?${params}`);
      const result = await response.json();

      if (result.success) {
        console.log('📋 API Response:', result);
        console.log('📋 Files data:', result.files);
        
        // 데이터 검증 및 안전한 변환
        const safeFiles = (result.files || []).map((file: any, index: number) => ({
          name: (file.name || `unknown-${index}`).trim(),
          id: file.id || file.name || `file-${index}`,
          size: typeof file.size === 'number' ? file.size : 0,
          contentType: file.contentType || 'application/octet-stream',
          lastModified: file.lastModified || new Date().toISOString(),
          isFolder: Boolean(file.isFolder),
          publicUrl: file.publicUrl || null
        }));
        
        console.log('📋 Processed files:', safeFiles);
        setFiles(safeFiles);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
      setSnackbar({
        open: true,
        message: `Failed to load files: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [currentBucket, currentFolder]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Utility functions
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: StorageFile) => {
    if (file.isFolder) {
      return <FolderIcon color="primary" />;
    }
    if (file.contentType.startsWith('image/')) {
      return file.publicUrl ? (
        <Avatar src={file.publicUrl} alt={file.name} sx={{ width: 32, height: 32 }}>
          <ImageIcon />
        </Avatar>
      ) : <ImageIcon color="action" />;
    }
    return <FileIcon color="action" />;
  };

  // Actions
  const handleFolderClick = (folderName: string) => {
    let newPath = '';
    if (folderName === '..') {
      // Go back to parent folder
      const pathParts = currentFolder.split('/').filter(Boolean);
      pathParts.pop();
      newPath = pathParts.join('/');
    } else {
      // Enter folder
      newPath = currentFolder ? `${currentFolder}/${folderName}` : folderName;
    }
    setCurrentFolder(newPath);
    onFolderChange?.(newPath);
  };

  const handleDeleteFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedFiles.length} file(s)?`)) return;

    try {
      const filePaths = selectedFiles.map(fileId => {
        const file = files.find(f => f.name === fileId);
        return currentFolder ? `${currentFolder}/${file?.name}` : file?.name;
      }).filter(Boolean);

      const params = new URLSearchParams({
        bucket: currentBucket,
        paths: filePaths.join(',')
      });

      const response = await fetch(`/api/admin/storage/delete?${params}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: `Successfully deleted ${result.summary.success} file(s)`,
          severity: 'success'
        });
        setSelectedFiles([]);
        loadFiles();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    }
  };

  const handleMoveFile = async () => {
    if (!moveDialog.fromPath || !moveDialog.toPath) return;

    try {
      const response = await fetch('/api/admin/storage/move', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucket: currentBucket,
          fromPath: moveDialog.fromPath,
          toPath: moveDialog.toPath
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'File moved successfully',
          severity: 'success'
        });
        setMoveDialog({ open: false, fromPath: '', toPath: '' });
        loadFiles();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Move failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    }
  };

  // Define columns
  const columns: GridColDef<StorageFile>[] = [
    {
      field: 'select',
      headerName: '',
      width: 50,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            const fileName = params.row.name;
            const isSelected = selectedFiles.includes(fileName);
            
            if (isSelected) {
              setSelectedFiles(prev => prev.filter(f => f !== fileName));
            } else {
              setSelectedFiles(prev => [...prev, fileName]);
            }
          }}
          sx={{
            color: selectedFiles.includes(params.row.name) ? 'primary.main' : 'action.disabled'
          }}
        >
          {selectedFiles.includes(params.row.name) ? '☑️' : '☐'}
        </IconButton>
      ),
      renderHeader: () => (
        <IconButton
          size="small"
          onClick={() => {
            const validFiles = files.filter(file => file && file.name && file.name.trim());
            const allSelected = validFiles.length > 0 && 
              validFiles.every(file => selectedFiles.includes(file.name));
            
            if (allSelected) {
              setSelectedFiles([]);
            } else {
              setSelectedFiles(validFiles.map(file => file.name));
            }
          }}
        >
          {files.length > 0 && files.every(file => selectedFiles.includes(file.name)) ? '☑️' : '☐'}
        </IconButton>
      )
    },
    {
      field: 'icon',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: (params) => getFileIcon(params.row)
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: params.row.isFolder ? 'pointer' : 'default',
            '&:hover': params.row.isFolder ? { textDecoration: 'underline' } : {}
          }}
          onClick={() => params.row.isFolder && handleFolderClick(params.row.name)}
        >
          <Typography variant="body2" sx={{ fontWeight: params.row.isFolder ? 600 : 400 }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'size',
      headerName: 'Size',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.isFolder ? '-' : formatFileSize(params.value || 0)}
        </Typography>
      )
    },
    {
      field: 'contentType',
      headerName: 'Type',
      width: 140,
      renderCell: (params) => (
        <Chip 
          label={params.row.isFolder ? 'Folder' : (params.value || 'unknown').split('/')[0]} 
          size="small" 
          variant="outlined" 
        />
      )
    },
    {
      field: 'lastModified',
      headerName: 'Modified',
      width: 160,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleDateString('ko-KR', {
            year: '2-digit',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : '-'}
        </Typography>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        ...(params.row.publicUrl ? [
          <GridActionsCellItem
            key="download"
            icon={<DownloadIcon />}
            label="Download"
            onClick={() => window.open(params.row.publicUrl, '_blank')}
          />
        ] : []),
        <GridActionsCellItem
          key="move"
          icon={<MoveIcon />}
          label="Move"
          onClick={() => {
            const filePath = currentFolder ? `${currentFolder}/${params.row.name}` : params.row.name;
            setMoveDialog({ 
              open: true, 
              fromPath: filePath, 
              toPath: filePath 
            });
          }}
        />
      ]
    }
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2 
      }}>
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Storage Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage files across Supabase Storage buckets with drag & drop upload.
          </Typography>
        </Box>
      </Box>

      {/* Controls */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Bucket</InputLabel>
          <Select
            value={currentBucket}
            onChange={(e) => {
              setCurrentBucket(e.target.value);
              setCurrentFolder('');
              onBucketChange?.(e.target.value);
              onFolderChange?.('');
            }}
            label="Bucket"
          >
            {AVAILABLE_BUCKETS.map((bucket) => (
              <MenuItem key={bucket.name} value={bucket.name}>
                {bucket.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Chip
          label={currentFolder || '/'}
          variant="outlined"
          size="small"
          onDelete={currentFolder ? () => setCurrentFolder('') : undefined}
        />

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadFiles}
          disabled={loading}
          size="small"
        >
          Refresh
        </Button>

        {selectedFiles.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteFiles}
            size="small"
          >
            Delete ({selectedFiles.length})
          </Button>
        )}
      </Box>

      {/* Breadcrumb */}
      {currentFolder && (
        <Box sx={{ mb: 2 }}>
          <Button
            size="small"
            startIcon={<FolderIcon />}
            onClick={() => handleFolderClick('..')}
            sx={{ textTransform: 'none' }}
          >
            .. (Back)
          </Button>
        </Box>
      )}

      {/* Data Grid */}
      <Box sx={{ height: 600, width: '100%' }}>
        {!loading && Array.isArray(files) && files.length >= 0 ? (
          <DataGrid
            key={`datagrid-${currentBucket}-${currentFolder}`} // Force re-render on location change
            rows={files.filter(file => file && typeof file === 'object' && file.name && file.name.trim())}
            columns={columns}
            loading={false} // Never pass loading=true to avoid internal state issues
            getRowId={(row) => row?.name || `fallback-${Date.now()}-${Math.random()}`}
            checkboxSelection={false}
            disableRowSelectionOnClick
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } }
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            density="compact"
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
        ) : loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column' 
          }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Loading files...
            </Typography>
            <Box sx={{ width: '50%' }}>
              <LinearProgress />
            </Box>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column' 
          }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No data available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Unable to load file list. Please refresh the page.
            </Typography>
            <Button 
              variant="contained" 
              onClick={loadFiles} 
              sx={{ mt: 2 }}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          </Box>
        )}
      </Box>

      {/* Move Dialog */}
      <Dialog open={moveDialog.open} onClose={() => setMoveDialog({ open: false, fromPath: '', toPath: '' })}>
        <DialogTitle>Move File</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="From Path"
            fullWidth
            value={moveDialog.fromPath}
            disabled
            sx={{ mb: 2 }}
          />
          <TextField
            label="To Path"
            fullWidth
            value={moveDialog.toPath}
            onChange={(e) => setMoveDialog(prev => ({ ...prev, toPath: e.target.value }))}
            placeholder="Enter new path..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveDialog({ open: false, fromPath: '', toPath: '' })}>
            Cancel
          </Button>
          <Button onClick={handleMoveFile} variant="contained">
            Move
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