'use client';

import React, { useCallback, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { uploadFile, validateFile, getFileIcon, formatFileSize } from '@/lib/supabase-storage';

interface FileUploadComponentProps {
  onUpload: (fileUrl: string, fileName: string) => void;
  onError?: (error: string) => void;
  accept?: string[];
  maxSize?: number; // in MB
  bucket?: string;
  folder?: string;
  disabled?: boolean;
  currentFile?: string; // current file URL if editing
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
  fileName: string | null;
}

export default function FileUploadComponent({
  onUpload,
  onError,
  accept = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.zip'],
  maxSize = 10, // 10MB default
  bucket = 'downloads',
  folder = 'files',
  disabled = false,
  currentFile,
}: FileUploadComponentProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    success: false,
    fileName: null,
  });

  const [dragActive, setDragActive] = useState(false);

  // Handle file selection
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Validate file
    const validation = validateFile(file, {
      maxSize: maxSize * 1024 * 1024,
      allowedTypes: accept,
    });

    if (!validation.valid) {
      setUploadState(prev => ({ ...prev, error: validation.error || 'Invalid file' }));
      onError?.(validation.error || 'Invalid file');
      return;
    }

    // Reset state
    setUploadState({
      uploading: true,
      progress: 0,
      error: null,
      success: false,
      fileName: file.name,
    });

    try {
      // Simulate progress (Supabase doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 200);

      // Upload file
      const result = await uploadFile(file, bucket, folder);

      clearInterval(progressInterval);

      if (result.success && result.url) {
        setUploadState({
          uploading: false,
          progress: 100,
          error: null,
          success: true,
          fileName: result.fileName || file.name,
        });

        // Call parent callback
        onUpload(result.url, result.fileName || file.name);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState({
        uploading: false,
        progress: 0,
        error: errorMessage,
        success: false,
        fileName: null,
      });
      onError?.(errorMessage);
    }
  }, [accept, maxSize, bucket, folder, onUpload, onError]);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || uploadState.uploading) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, uploadState.uploading, handleFiles]);

  // Handle file input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled || uploadState.uploading) return;
    
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [disabled, uploadState.uploading, handleFiles]);

  // Clear upload state
  const handleClear = useCallback(() => {
    setUploadState({
      uploading: false,
      progress: 0,
      error: null,
      success: false,
      fileName: null,
    });
  }, []);

  // Get current file name from URL
  const getCurrentFileName = useCallback(() => {
    if (!currentFile) return null;
    return currentFile.split('/').pop() || 'Current file';
  }, [currentFile]);

  return (
    <Box>
      {/* Current file display */}
      {currentFile && !uploadState.success && (
        <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Current file:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
              {getFileIcon(getCurrentFileName() || '')} {getCurrentFileName()}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => window.open(currentFile, '_blank')}
            >
              Open
            </Button>
          </Box>
        </Box>
      )}

      {/* Upload area */}
      <Box
        sx={{
          border: `2px dashed ${dragActive ? '#1976d2' : '#e0e0e0'}`,
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          backgroundColor: dragActive ? 'action.hover' : 'background.paper',
          cursor: disabled || uploadState.uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: disabled || uploadState.uploading ? '#e0e0e0' : '#1976d2',
            backgroundColor: disabled || uploadState.uploading ? 'background.paper' : 'action.hover',
          },
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !uploadState.uploading) {
            document.getElementById('file-upload-input')?.click();
          }
        }}
      >
        <input
          id="file-upload-input"
          type="file"
          accept={accept.join(',')}
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={disabled || uploadState.uploading}
        />

        {uploadState.uploading ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              Uploading {uploadState.fileName}...
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={uploadState.progress} 
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              {uploadState.progress}% complete
            </Typography>
          </Box>
        ) : uploadState.success ? (
          <Box>
            <CheckIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h6" color="success.main" gutterBottom>
              Upload Successful!
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
              <Typography variant="body2">
                {getFileIcon(uploadState.fileName || '')} {uploadState.fileName}
              </Typography>
              <IconButton size="small" onClick={handleClear} title="Clear">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box>
            <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Drop files here or click to upload
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Maximum file size: {maxSize}MB
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {accept.map((type) => (
                <Chip
                  key={type}
                  label={type.toUpperCase()}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Error display */}
      {uploadState.error && (
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          onClose={handleClear}
        >
          {uploadState.error}
        </Alert>
      )}

      {/* Helper text */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Supported formats: {accept.join(', ')} • Max size: {maxSize}MB
      </Typography>
    </Box>
  );
}