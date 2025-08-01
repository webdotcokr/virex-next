'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';

export default function AllProductsPage() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
      }}>
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            All Products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your complete product catalog with advanced filtering and editing capabilities.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ 
            minWidth: 140,
            alignSelf: { xs: 'flex-end', sm: 'auto' },
          }}
        >
          Add Product
        </Button>
      </Box>

      {/* Placeholder for future product DataGrid */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          backgroundColor: '#F8F9FB',
          borderRadius: '12px',
          border: '2px dashed #E8ECEF',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Product DataGrid Coming Soon
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This section will contain a comprehensive product management interface
            <br />
            with features similar to the newsletter subscription grid.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}