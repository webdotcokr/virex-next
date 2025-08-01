'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { listFiles, getPublicUrl, getFileIcon, formatFileSize } from '@/lib/supabase-storage';
import type { StorageFile } from '@/lib/supabase-storage';

interface MediaLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (fileUrl: string, fileName: string) => void;
  bucket?: string;
  folder?: string;
}

interface ExtendedStorageFile extends StorageFile {
  publicUrl: string;
  isImage: boolean;
}

export default function MediaLibraryModal({
  open,
  onClose,
  onSelect,
  bucket = 'downloads',
  folder = 'files',
}: MediaLibraryModalProps) {
  const [files, setFiles] = useState<ExtendedStorageFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<ExtendedStorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<ExtendedStorageFile | null>(null);

  // Load files from storage
  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📁 Loading files from storage:', { bucket, folder });
      
      const storageFiles = await listFiles(bucket, folder);
      
      // Extend files with additional properties
      const extendedFiles: ExtendedStorageFile[] = storageFiles
        .filter(file => file.name !== '.emptyFolderPlaceholder') // Filter out placeholder files
        .map(file => {
          const filePath = folder ? `${folder}/${file.name}` : file.name;
          const publicUrl = getPublicUrl(bucket, filePath);
          const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name);
          
          return {
            ...file,
            publicUrl,
            isImage,
          };
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log('✅ Files loaded:', extendedFiles.length);
      setFiles(extendedFiles);
      setFilteredFiles(extendedFiles);
    } catch (error) {
      console.error('❌ Error loading files:', error);
      setError(error instanceof Error ? error.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [bucket, folder]);

  // Load files when modal opens
  useEffect(() => {
    if (open) {
      loadFiles();
    }
  }, [open, loadFiles]);

  // Filter files based on search and type
  useEffect(() => {
    let filtered = files;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(term)
      );
    }

    // File type filter
    if (fileTypeFilter !== 'all') {
      switch (fileTypeFilter) {
        case 'images':
          filtered = filtered.filter(file => file.isImage);
          break;
        case 'documents':
          filtered = filtered.filter(file => 
            /\.(pdf|doc|docx|txt|rtf)$/i.test(file.name)
          );
          break;
        case 'archives':
          filtered = filtered.filter(file => 
            /\.(zip|rar|7z|tar|gz)$/i.test(file.name)
          );
          break;
        case 'others':
          filtered = filtered.filter(file => 
            !file.isImage && 
            !/\.(pdf|doc|docx|txt|rtf|zip|rar|7z|tar|gz)$/i.test(file.name)
          );
          break;
      }
    }

    setFilteredFiles(filtered);
  }, [files, searchTerm, fileTypeFilter]);

  // Handle file selection
  const handleFileSelect = useCallback((file: ExtendedStorageFile) => {
    setSelectedFile(selectedFile?.name === file.name ? null : file);
  }, [selectedFile]);

  // Handle confirm selection
  const handleConfirmSelection = useCallback(() => {
    if (selectedFile) {
      onSelect(selectedFile.publicUrl, selectedFile.name);
      handleClose();
    }
  }, [selectedFile, onSelect]);

  // Handle modal close
  const handleClose = useCallback(() => {
    setSelectedFile(null);
    setSearchTerm('');
    setFileTypeFilter('all');
    onClose();
  }, [onClose]);

  // Get file type counts
  const getFileTypeCounts = useCallback(() => {
    const counts = {
      all: files.length,
      images: files.filter(f => f.isImage).length,
      documents: files.filter(f => /\.(pdf|doc|docx|txt|rtf)$/i.test(f.name)).length,
      archives: files.filter(f => /\.(zip|rar|7z|tar|gz)$/i.test(f.name)).length,
      others: files.filter(f => 
        !f.isImage && 
        !/\.(pdf|doc|docx|txt|rtf|zip|rar|7z|tar|gz)$/i.test(f.name)
      ).length,
    };
    return counts;
  }, [files]);

  const typeCounts = getFileTypeCounts();

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{ sx: { height: '80vh' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">
          Media Library
        </Typography>
        <IconButton onClick={loadFiles} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Search and Filter Controls */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ flex: 1 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>File Type</InputLabel>
            <Select
              value={fileTypeFilter}
              label="File Type"
              onChange={(e) => setFileTypeFilter(e.target.value)}
            >
              <MenuItem value="all">All ({typeCounts.all})</MenuItem>
              <MenuItem value="images">Images ({typeCounts.images})</MenuItem>
              <MenuItem value="documents">Documents ({typeCounts.documents})</MenuItem>
              <MenuItem value="archives">Archives ({typeCounts.archives})</MenuItem>
              <MenuItem value="others">Others ({typeCounts.others})</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Files Grid */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : filteredFiles.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <FolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {files.length === 0 ? 'No files found' : 'No files match your search'}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredFiles.map((file) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={file.name}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedFile?.name === file.name ? 2 : 1,
                      borderColor: selectedFile?.name === file.name ? 'primary.main' : 'divider',
                      '&:hover': {
                        boxShadow: 2,
                      },
                    }}
                    onClick={() => handleFileSelect(file)}
                  >
                    <CardActionArea>
                      {file.isImage ? (
                        <CardMedia
                          component="img"
                          height="120"
                          image={file.publicUrl}
                          alt={file.name}
                          sx={{ objectFit: 'cover' }}
                          onError={(e) => {
                            // Fallback to file icon if image fails to load
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 120,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'grey.100',
                            fontSize: '3rem',
                          }}
                        >
                          {getFileIcon(file.name)}
                        </Box>
                      )}
                      
                      <CardContent sx={{ p: 1.5 }}>
                        <Typography 
                          variant="body2" 
                          noWrap 
                          title={file.name}
                          sx={{ fontWeight: selectedFile?.name === file.name ? 600 : 400 }}
                        >
                          {file.name}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(file.metadata?.size || 0)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(file.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Selected File Info */}
        {selectedFile && (
          <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected File:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">
                {getFileIcon(selectedFile.name)} {selectedFile.name}
              </Typography>
              <Chip 
                label={formatFileSize(selectedFile.metadata?.size || 0)} 
                size="small" 
                variant="outlined" 
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              URL: {selectedFile.publicUrl}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleConfirmSelection}
          disabled={!selectedFile}
        >
          Select File
        </Button>
      </DialogActions>
    </Dialog>
  );
}