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
import { getFileIcon, formatFileSize } from '@/lib/supabase-storage';

interface MediaLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (fileUrl: string, fileName: string) => void;
  bucket?: string; // Deprecated: kept for compatibility
  folder?: string; // Deprecated: kept for compatibility
  category?: string; // New: category for file listing
}

interface LocalFile {
  name: string;
  url: string;
  size: number;
  created: string;
  modified: string;
  isImage: boolean;
}

export default function MediaLibraryModal({
  open,
  onClose,
  onSelect,
  bucket = 'downloads', // Deprecated but kept for compatibility
  folder = 'files', // Deprecated but kept for compatibility
  category = 'admin-uploads', // Default category
}: MediaLibraryModalProps) {
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<LocalFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<LocalFile | null>(null);

  // Load files from local upload directory
  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const listUrl = `/api/upload/list?category=${encodeURIComponent(category)}`;
      console.log('📁 Loading files from local uploads:', listUrl);
      
      const response = await fetch(listUrl);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load files');
      }
      
      const localFiles: LocalFile[] = result.files || [];

      console.log('✅ Files loaded:', localFiles.length);
      setFiles(localFiles);
      setFilteredFiles(localFiles);
    } catch (error) {
      console.error('❌ Error loading files:', error);
      setError(error instanceof Error ? error.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [category]);

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
  const handleFileSelect = useCallback((file: LocalFile) => {
    setSelectedFile(selectedFile?.name === file.name ? null : file);
  }, [selectedFile]);

  // Handle confirm selection
  const handleConfirmSelection = useCallback(() => {
    if (selectedFile) {
      onSelect(selectedFile.url, selectedFile.name);
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
                          image={file.url}
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
                            {formatFileSize(file.size)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(file.created).toLocaleDateString()}
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
                label={formatFileSize(selectedFile.size)} 
                size="small" 
                variant="outlined" 
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              URL: {selectedFile.url}
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