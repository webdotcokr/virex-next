'use client';

import React, { useState, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

interface FileDropzoneProps {
  onFileUploaded: (fileUrl: string, fileName: string) => void;
  categoryId?: number;
  accept?: string;
  maxSize?: number; // in bytes
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  success: string | null;
}

export default function FileDropzone({ 
  onFileUploaded, 
  categoryId, 
  accept = "*/*",
  maxSize = 100 * 1024 * 1024 // 100MB
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    success: null
  });

  const handleFileUpload = useCallback(async (file: File) => {
    if (file.size > maxSize) {
      setUploadState(prev => ({ 
        ...prev, 
        error: `파일 크기가 너무 큽니다. 최대 ${Math.round(maxSize / 1024 / 1024)}MB까지 가능합니다.` 
      }));
      return;
    }

    setUploadState({
      uploading: true,
      progress: 0,
      error: null,
      success: null
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
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
      
      setUploadState({
        uploading: false,
        progress: 100,
        error: null,
        success: `파일이 성공적으로 업로드되었습니다: ${result.fileName}`
      });

      onFileUploaded(result.fileUrl, result.fileName);

    } catch (error) {
      setUploadState({
        uploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.',
        success: null
      });
    }
  }, [categoryId, maxSize, onFileUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

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
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  return (
    <Box>
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
        onClick={() => document.getElementById('file-input')?.click()}
      >
        {uploadState.uploading ? (
          <Box>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body1">파일 업로드 중...</Typography>
            <Typography variant="body2" color="text.secondary">
              {uploadState.progress}%
            </Typography>
          </Box>
        ) : (
          <Box>
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              파일을 드래그하여 놓거나 클릭하여 선택하세요
            </Typography>
            <Typography variant="body2" color="text.secondary">
              최대 {Math.round(maxSize / 1024 / 1024)}MB까지 업로드 가능
            </Typography>
          </Box>
        )}
      </Box>

      <input
        id="file-input"
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={uploadState.uploading}
      />

      {uploadState.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {uploadState.error}
        </Alert>
      )}

      {uploadState.success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {uploadState.success}
        </Alert>
      )}
    </Box>
  );
}