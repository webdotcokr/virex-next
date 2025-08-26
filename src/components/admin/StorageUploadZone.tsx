'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon
} from '@mui/icons-material';

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  result?: {
    fileName: string;
    publicUrl: string;
    filePath: string;
  };
}

interface StorageUploadZoneProps {
  bucket: string;
  folder: string;
  onUploadComplete: () => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: string[];
}

export default function StorageUploadZone({
  bucket,
  folder,
  onUploadComplete,
  maxFiles = 10,
  maxSize = 50,
  accept = ['*/*']
}: StorageUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Drag handlers
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
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, []);

  // File handlers
  const addFiles = (files: File[]) => {
    if (!files.length) return;

    const newFiles: UploadFile[] = files.slice(0, maxFiles - uploadFiles.length).map(file => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      status: 'pending',
      progress: 0
    }));

    // Validate files
    const validFiles: UploadFile[] = [];
    const errors: string[] = [];

    newFiles.forEach(uploadFile => {
      const { file } = uploadFile;
      
      // Size check
      if (file.size > maxSize * 1024 * 1024) {
        errors.push(`${file.name}: File too large (max ${maxSize}MB)`);
        return;
      }

      // Type check (if specific types are required)
      if (accept.length && !accept.includes('*/*')) {
        const fileType = file.type || file.name.split('.').pop()?.toLowerCase();
        const isValid = accept.some(acceptType => {
          if (acceptType.startsWith('.')) {
            return file.name.toLowerCase().endsWith(acceptType);
          }
          return fileType?.includes(acceptType.replace('*', ''));
        });
        
        if (!isValid) {
          errors.push(`${file.name}: File type not allowed`);
          return;
        }
      }

      validFiles.push(uploadFile);
    });

    if (errors.length) {
      alert(`Some files were skipped:\n${errors.join('\n')}`);
    }

    setUploadFiles(prev => [...prev, ...validFiles]);
    if (validFiles.length) {
      setShowDialog(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    e.target.value = ''; // Reset input
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setUploadFiles([]);
    setShowDialog(false);
  };

  // Upload handler
  const handleUpload = async () => {
    if (!uploadFiles.length) return;

    setIsUploading(true);
    const formData = new FormData();
    
    formData.append('bucket', bucket);
    formData.append('folder', folder);
    
    uploadFiles.forEach(uploadFile => {
      formData.append('files', uploadFile.file);
    });

    // Update all files to uploading status
    setUploadFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const, progress: 10 })));

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadFiles(prev => prev.map(f => 
          f.status === 'uploading' 
            ? { ...f, progress: Math.min(f.progress + 15, 85) }
            : f
        ));
      }, 200);

      const response = await fetch('/api/admin/storage/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      const result = await response.json();

      if (result.success || result.results) {
        // Update status based on individual results
        setUploadFiles(prev => prev.map((uploadFile, index) => {
          const uploadResult = result.results[index];
          return {
            ...uploadFile,
            status: uploadResult.success ? 'success' : 'error',
            progress: 100,
            error: uploadResult.error,
            result: uploadResult.success ? {
              fileName: uploadResult.fileName,
              publicUrl: uploadResult.publicUrl,
              filePath: uploadResult.filePath
            } : undefined
          };
        }));

        // Show summary
        const { success, failed } = result.summary;
        if (success > 0) {
          setTimeout(() => {
            onUploadComplete();
            if (failed === 0) {
              clearAll(); // Clear all if all succeeded
            }
          }, 2000);
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      // Mark all as error
      setUploadFiles(prev => prev.map(f => ({
        ...f,
        status: 'error' as const,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed'
      })));
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: UploadFile['status'], file: File) => {
    switch (status) {
      case 'success':
        return <CheckIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'uploading':
        return file.type.startsWith('image/') ? <ImageIcon color="primary" /> : <FileIcon color="primary" />;
      default:
        return file.type.startsWith('image/') ? <ImageIcon /> : <FileIcon />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
  const hasErrors = uploadFiles.some(f => f.status === 'error');
  const hasSuccess = uploadFiles.some(f => f.status === 'success');

  return (
    <>
      {/* Drop Zone */}
      <Box
        sx={{
          border: `2px dashed ${dragActive ? '#1976d2' : '#e0e0e0'}`,
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          backgroundColor: dragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: '#1976d2',
            backgroundColor: 'action.hover',
          },
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('storage-file-input')?.click()}
      >
        <input
          id="storage-file-input"
          type="file"
          multiple
          accept={accept.join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Drop files here or click to upload
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Maximum {maxFiles} files, {maxSize}MB each
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
          {accept.slice(0, 5).map((type) => (
            <Chip
              key={type}
              label={type === '*/*' ? 'Any' : type.toUpperCase()}
              size="small"
              variant="outlined"
            />
          ))}
          {accept.length > 5 && <Chip label="..." size="small" variant="outlined" />}
        </Box>
      </Box>

      {/* Upload Progress Summary */}
      {uploadFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">
              {uploadFiles.length} file(s) ready
            </Typography>
            <Button
              variant="text"
              size="small"
              onClick={() => setShowDialog(true)}
            >
              View Details
            </Button>
          </Box>
          
          {hasSuccess && (
            <Alert severity="success" sx={{ mb: 1 }}>
              {uploadFiles.filter(f => f.status === 'success').length} file(s) uploaded successfully
            </Alert>
          )}
          
          {hasErrors && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {uploadFiles.filter(f => f.status === 'error').length} file(s) failed to upload
            </Alert>
          )}
        </Box>
      )}

      {/* Upload Dialog */}
      <Dialog 
        open={showDialog} 
        onClose={() => !isUploading && setShowDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Upload Files to {bucket}/{folder || 'root'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <List>
            {uploadFiles.map((uploadFile) => (
              <ListItem key={uploadFile.id}>
                <ListItemIcon>
                  {getStatusIcon(uploadFile.status, uploadFile.file)}
                </ListItemIcon>
                <ListItemText
                  primary={uploadFile.file.name}
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(uploadFile.file.size)}
                        {uploadFile.status === 'error' && uploadFile.error && 
                          ` • Error: ${uploadFile.error}`
                        }
                      </Typography>
                      {uploadFile.status === 'uploading' && (
                        <LinearProgress 
                          variant="determinate" 
                          value={uploadFile.progress} 
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  {uploadFile.status === 'pending' && (
                    <IconButton
                      edge="end"
                      onClick={() => removeFile(uploadFile.id)}
                      disabled={isUploading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                  {uploadFile.status !== 'pending' && (
                    <Chip
                      size="small"
                      label={uploadFile.status}
                      color={
                        uploadFile.status === 'success' ? 'success' :
                        uploadFile.status === 'error' ? 'error' : 'default'
                      }
                    />
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={clearAll} disabled={isUploading}>
            Clear All
          </Button>
          <Button onClick={() => setShowDialog(false)} disabled={isUploading}>
            Close
          </Button>
          {pendingFiles.length > 0 && (
            <Button
              onClick={handleUpload}
              variant="contained"
              disabled={isUploading || pendingFiles.length === 0}
              startIcon={<UploadIcon />}
            >
              Upload {pendingFiles.length} file(s)
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}