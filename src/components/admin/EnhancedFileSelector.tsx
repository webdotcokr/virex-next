'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Chip,
  Link,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import FileUploadComponent from './FileUploadComponent';

interface FileRecord {
  id: number;
  filename: string;
  file_url: string;
  category_id: number;
  category_name: string;
}

interface EnhancedFileSelectorProps {
  value: number | null;
  onChange: (fileId: number | null) => void;
  fileType: 'catalog' | 'datasheet' | 'manual' | 'drawing';
  label?: string;
  disabled?: boolean;
  categoryName?: string;
}

export default function EnhancedFileSelector({
  value,
  onChange,
  fileType,
  label,
  disabled = false,
  categoryName = 'products',
}: EnhancedFileSelectorProps) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get proper label if not provided
  const getLabel = () => {
    if (label) return label;
    const labels = {
      catalog: 'Catalog File',
      datasheet: 'Datasheet File',
      manual: 'Manual File',
      drawing: 'Drawing File',
    };
    return labels[fileType];
  };

  // Get category ID for file type
  const getCategoryIdForFileType = async (fileType: string): Promise<number | null> => {
    try {
      const response = await fetch('/api/downloads/category/by-name?' + new URLSearchParams({
        name: fileType.charAt(0).toUpperCase() + fileType.slice(1),
      }));
      
      if (response.ok) {
        const result = await response.json();
        return result.data?.id || null;
      }
    } catch (error) {
      console.error('Error getting category ID:', error);
    }
    // Fallback: return a default category ID or null
    return 1; // assuming category 1 exists, or we can return null
  };

  // Fetch files data
  const fetchFiles = async (search?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('fileType', fileType);
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/files?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const result = await response.json();
      setFiles(result.data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchFiles();
  }, [fileType]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        fetchFiles(searchTerm);
      } else {
        fetchFiles();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Find selected file
  const selectedFile = files.find(f => f.id === value) || null;

  // Handle file upload success
  const handleUpload = async (fileUrl: string, fileName: string) => {
    try {
      // Get category ID for this file type
      const categoryId = await getCategoryIdForFileType(fileType);
      
      if (!categoryId) {
        console.error('Could not determine category ID for file type:', fileType);
        return;
      }

      // Create file record in database
      const response = await fetch('/api/admin/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: fileName,
          file_url: fileUrl,
          file_type: fileType,
          category_id: categoryId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newFile = result.data;
        
        // Add to files list
        setFiles(prev => [newFile, ...prev]);
        
        // Select the newly uploaded file
        onChange(newFile.id);
        
        // Hide upload section
        setShowUpload(false);
      } else {
        console.error('Failed to create file record');
      }
    } catch (error) {
      console.error('Error handling upload:', error);
    }
  };

  const handleUploadError = (error: string) => {
    console.error('File upload error:', error);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {getLabel()}
      </Typography>
      
      {/* File selector */}
      <Autocomplete
        value={selectedFile}
        onChange={(_, newValue) => {
          if (newValue?.id === -1) {
            // "Upload New" option selected
            setShowUpload(true);
          } else {
            onChange(newValue?.id || null);
          }
        }}
        onInputChange={(_, newInputValue) => {
          setSearchTerm(newInputValue);
        }}
        options={[
          ...files,
          { id: -1, filename: '+ Upload New File', file_url: '', category_id: 0, category_name: '' }
        ]}
        getOptionLabel={(option) => option.filename}
        loading={loading}
        disabled={disabled}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            fullWidth
            size="small"
            placeholder="Select existing file or upload new..."
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          
          if (option.id === -1) {
            return (
              <Box component="li" key={option.id} {...otherProps} sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                <AddIcon sx={{ mr: 1, fontSize: 16 }} />
                {option.filename}
              </Box>
            );
          }
          
          return (
            <Box component="li" key={option.id} {...otherProps}>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FileIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {option.filename}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip 
                    label={option.category_name} 
                    size="small" 
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: '20px' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    ID: {option.id}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        }}
        noOptionsText={
          searchTerm 
            ? `No ${fileType} files found for "${searchTerm}"` 
            : `No ${fileType} files available`
        }
        sx={{ mb: 2 }}
      />

      {/* Selected file info */}
      {selectedFile && selectedFile.id !== -1 && (
        <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Selected file:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FileIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2">
              {selectedFile.filename}
            </Typography>
            <Link
              href={selectedFile.file_url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ ml: 'auto' }}
            >
              <Button size="small" variant="outlined">
                Open
              </Button>
            </Link>
          </Box>
        </Box>
      )}

      {/* Upload section */}
      {showUpload && (
        <Box>
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2">
              Upload New {getLabel()}
            </Typography>
            <Button
              size="small"
              onClick={() => setShowUpload(false)}
            >
              Cancel
            </Button>
          </Box>
          
          <FileUploadComponent
            onUpload={handleUpload}
            onError={handleUploadError}
            accept={['.pdf', '.doc', '.docx', '.zip']}
            maxSize={50} // 50MB for documents
            category={fileType}
            disabled={disabled}
          />
        </Box>
      )}
    </Box>
  );
}