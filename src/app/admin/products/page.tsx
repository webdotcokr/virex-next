'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Business as MakerIcon,
} from '@mui/icons-material';

export default function ProductsPage() {
  return (
    <Box>
      {/* Page Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Products Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your product catalog, categories, and inventory.
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            sx={{
              p: 2,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <InventoryIcon sx={{ fontSize: 48, color: '#566BDA', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                All Products
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                View and manage all products in your catalog
              </Typography>
              <Button variant="contained" fullWidth>
                View Products
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            sx={{
              p: 2,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <CategoryIcon sx={{ fontSize: 48, color: '#10B981', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Categories
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Organize products into categories
              </Typography>
              <Button variant="contained" fullWidth>
                Manage Categories
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            sx={{
              p: 2,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <MakerIcon sx={{ fontSize: 48, color: '#F59E0B', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Makers
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Manage product manufacturers
              </Typography>
              <Button variant="contained" fullWidth>
                View Makers
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add New Product */}
      <Card sx={{ p: 3, borderRadius: '12px', textAlign: 'center' }}>
        <AddIcon sx={{ fontSize: 64, color: '#566BDA', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Add New Product
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Create a new product entry in your catalog with specifications and media.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          sx={{ minWidth: 200 }}
        >
          Add Product
        </Button>
      </Card>
    </Box>
  );
}