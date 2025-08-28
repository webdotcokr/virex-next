'use client';

import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip
} from '@mui/material';
import { 
  CloudUpload, 
  InsertDriveFile, 
  CheckCircle, 
  Error as ErrorIcon,
  Close,
  Delete
} from '@mui/icons-material';

interface FileUploadItem {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  fileUrl?: string;
}

interface MultiFileDropzoneProps {
  onFilesUploaded: (results: Array<{ fileUrl: string; fileName: string; originalFile: File }>) => void;
  categoryId?: number;
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
}

interface UploadState {
  files: FileUploadItem[];
  isUploading: boolean;
}

export default function MultiFileDropzone({ 
  onFilesUploaded, 
  categoryId, 
  accept = "*/*",
  maxSize = 100 * 1024 * 1024, // 100MB
  maxFiles = 10
}: MultiFileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    files: [],
    isUploading: false
  });

  const generateFileId = () => Math.random().toString(36).substr(2, 9);

  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (file.size > maxSize) {
        alert(`파일 "${file.name}"이 너무 큽니다. 최대 ${Math.round(maxSize / 1024 / 1024)}MB까지 가능합니다.`);
        return false;
      }
      return true;
    });

    setUploadState(prev => {
      const currentFileCount = prev.files.length;
      const filesToAdd = validFiles.slice(0, maxFiles - currentFileCount);
      
      if (filesToAdd.length < validFiles.length) {
        alert(`최대 ${maxFiles}개 파일까지만 업로드 가능합니다.`);
      }

      const newFileItems: FileUploadItem[] = filesToAdd.map(file => ({
        file,
        id: generateFileId(),
        status: 'pending',
        progress: 0
      }));

      return {
        ...prev,
        files: [...prev.files, ...newFileItems]
      };
    });
  }, [maxSize, maxFiles]);

  const removeFile = useCallback((fileId: string) => {
    setUploadState(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== fileId)
    }));
  }, []);

  const uploadFile = useCallback(async (fileItem: FileUploadItem): Promise<{ fileUrl: string; fileName: string }> => {
    const formData = new FormData();
    formData.append('file', fileItem.file);
    if (categoryId) {
      formData.append('categoryId', categoryId.toString());
    }

    const response = await fetch('/api/admin/file-upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Upload failed (${response.status})`);
    }

    const result = await response.json();
    return result;
  }, [categoryId]);

  const startUpload = useCallback(async () => {
    const pendingFiles = uploadState.files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setUploadState(prev => ({ ...prev, isUploading: true }));

    const updateFileStatus = (fileId: string, updates: Partial<FileUploadItem>) => {
      setUploadState(prev => ({
        ...prev,
        files: prev.files.map(f => 
          f.id === fileId ? { ...f, ...updates } : f
        )
      }));
    };

    const uploadResults: Array<{ fileUrl: string; fileName: string; originalFile: File }> = [];

    // Upload files sequentially to avoid overwhelming the server
    for (const fileItem of pendingFiles) {
      try {
        updateFileStatus(fileItem.id, { 
          status: 'uploading', 
          progress: 0 
        });

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          updateFileStatus(fileItem.id, { 
            progress: Math.min(90, (uploadState.files.find(f => f.id === fileItem.id)?.progress || 0) + 10)
          });
        }, 200);

        const result = await uploadFile(fileItem);
        
        clearInterval(progressInterval);
        updateFileStatus(fileItem.id, { 
          status: 'success', 
          progress: 100,
          fileUrl: result.fileUrl
        });

        uploadResults.push({
          fileUrl: result.fileUrl,
          fileName: result.fileName,
          originalFile: fileItem.file
        });

      } catch (error) {
        updateFileStatus(fileItem.id, { 
          status: 'error', 
          progress: 0,
          error: error instanceof Error ? error.message : '업로드 실패'
        });
      }
    }

    setUploadState(prev => ({ ...prev, isUploading: false }));

    if (uploadResults.length > 0) {
      onFilesUploaded(uploadResults);
    }
  }, [uploadState.files, uploadFile, onFilesUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addFiles(files);
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      addFiles(files);
    }
    // Reset input value to allow selecting the same files again
    e.target.value = '';
  }, [addFiles]);

  const getStatusColor = (status: FileUploadItem['status']) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'uploading': return 'primary';
      default: return 'default';
    }
  };

  const getStatusIcon = (file: FileUploadItem) => {
    switch (file.status) {
      case 'success': return <CheckCircle color="success" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'uploading': return <CircularProgress size={20} />;
      default: return <InsertDriveFile />;
    }
  };

  const successCount = uploadState.files.filter(f => f.status === 'success').length;
  const errorCount = uploadState.files.filter(f => f.status === 'error').length;
  const pendingCount = uploadState.files.filter(f => f.status === 'pending').length;

  return (
    <Box>
      {/* Drop Zone */}
      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          border: '2px dashed',
          borderColor: isDragOver ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backgroundColor: isDragOver ? 'action.hover' : 'background.paper',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover'
          }
        }}
        onClick={() => document.getElementById('multi-file-input')?.click()}
      >
        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          파일들을 드래그하여 놓거나 클릭하여 선택하세요
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          최대 {maxFiles}개 파일, 각각 {Math.round(maxSize / 1024 / 1024)}MB까지 업로드 가능
        </Typography>
        
        {uploadState.files.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            {successCount > 0 && (
              <Chip 
                size="small" 
                color="success" 
                label={`완료: ${successCount}개`} 
              />
            )}
            {errorCount > 0 && (
              <Chip 
                size="small" 
                color="error" 
                label={`실패: ${errorCount}개`} 
              />
            )}
            {pendingCount > 0 && (
              <Chip 
                size="small" 
                color="warning" 
                label={`대기: ${pendingCount}개`} 
              />
            )}
          </Box>
        )}
      </Box>

      <input
        id="multi-file-input"
        type="file"
        accept={accept}
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={uploadState.isUploading}
      />

      {/* File List */}
      {uploadState.files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              선택된 파일 ({uploadState.files.length}개)
            </Typography>
            {pendingCount > 0 && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <button
                  onClick={() => setUploadState(prev => ({ ...prev, files: [] }))}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                  disabled={uploadState.isUploading}
                >
                  모두 제거
                </button>
                <button
                  onClick={startUpload}
                  disabled={uploadState.isUploading || pendingCount === 0}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    background: '#1976d2',
                    color: 'white',
                    cursor: uploadState.isUploading ? 'not-allowed' : 'pointer',
                    opacity: uploadState.isUploading ? 0.6 : 1
                  }}
                >
                  {uploadState.isUploading ? '업로드 중...' : `${pendingCount}개 파일 업로드`}
                </button>
              </Box>
            )}
          </Box>

          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {uploadState.files.map(file => (
              <ListItem
                key={file.id}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: file.status === 'error' ? '#ffebee' : 'background.paper'
                }}
                secondaryAction={
                  file.status === 'pending' && (
                    <IconButton 
                      edge="end" 
                      onClick={() => removeFile(file.id)}
                      disabled={uploadState.isUploading}
                    >
                      <Delete />
                    </IconButton>
                  )
                }
              >
                <ListItemIcon>
                  {getStatusIcon(file)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" noWrap>
                        {file.file.name}
                      </Typography>
                      <Chip 
                        size="small" 
                        color={getStatusColor(file.status)} 
                        label={file.status.toUpperCase()} 
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        크기: {(file.file.size / 1024 / 1024).toFixed(2)}MB
                      </Typography>
                      {file.status === 'uploading' && (
                        <LinearProgress 
                          variant="determinate" 
                          value={file.progress} 
                          sx={{ mt: 0.5 }}
                        />
                      )}
                      {file.error && (
                        <Alert severity="error" sx={{ mt: 0.5, p: 0.5 }}>
                          <Typography variant="caption">{file.error}</Typography>
                        </Alert>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Overall Progress */}
      {uploadState.isUploading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            전체 업로드 진행 중... ({successCount + errorCount} / {uploadState.files.length})
          </Typography>
          <LinearProgress />
        </Box>
      )}
    </Box>
  );
}