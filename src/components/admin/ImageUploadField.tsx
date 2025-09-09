'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import {
  Image as ImageIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import FileUploadComponent from './FileUploadComponent';

interface ImageUploadFieldProps {
  value: string;
  onChange: (imageUrl: string) => void;
  label?: string;
  disabled?: boolean;
  categoryName?: string;
}

export default function ImageUploadField({
  value,
  onChange,
  label = 'Image URL',
  disabled = false,
  categoryName = 'products',
}: ImageUploadFieldProps) {
  const [showUpload, setShowUpload] = useState(false);

  const handleUpload = (fileUrl: string, fileName: string) => {
    onChange(fileUrl);
    setShowUpload(false);
  };

  const handleUploadError = (error: string) => {
    console.error('Image upload error:', error);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      
      {/* Current image URL field */}
      <TextField
        fullWidth
        variant="outlined"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://example.com/image.jpg"
        disabled={disabled}
        size="small"
        sx={{ mb: 2 }}
      />

      {/* Current image preview */}
      {value && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Current image:
          </Typography>
          <Box
            sx={{
              width: '100%',
              maxWidth: 200,
              height: 120,
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
            }}
          >
            <img
              src={value}
              alt="Product"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `
                  <div style="display: flex; flex-direction: column; align-items: center; color: #666;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </svg>
                    <span style="font-size: 12px; margin-top: 4px;">Invalid image</span>
                  </div>
                `;
              }}
            />
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Upload section toggle */}
      {!showUpload ? (
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => setShowUpload(true)}
          disabled={disabled}
          fullWidth
          size="small"
        >
          Upload New Image
        </Button>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2">
              Upload New Image
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
            accept={['.jpg', '.jpeg', '.png', '.webp', '.gif']}
            maxSize={5} // 5MB for images
            category={categoryName}
            disabled={disabled}
          />
        </Box>
      )}
    </Box>
  );
}