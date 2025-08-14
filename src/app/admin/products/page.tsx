'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
} from '@mui/material';
import {
  Category as CategoryIcon,
  CameraAlt,
  Scanner,
  Visibility,
  Science,
  Sensors,
  ThreeDRotation,
  Cable,
  Memory,
  Settings,
  Lens,
  Computer,
  Storage,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const productCategories = [
  { name: 'CIS', path: '/admin/products/cis', icon: <Scanner />, color: '#566BDA', count: 'products_cis' },
  { name: 'TDI', path: '/admin/products/tdi', icon: <Sensors />, color: '#10B981', count: 'products_tdi' },
  { name: 'Line', path: '/admin/products/line', icon: <Scanner />, color: '#F59E0B', count: 'products_line' },
  { name: 'Area', path: '/admin/products/area', icon: <CameraAlt />, color: '#EF4444', count: 'products_area' },
  { name: 'Scientific', path: '/admin/products/scientific', icon: <Science />, color: '#8B5CF6', count: 'products_scientific' },
  { name: 'Invisible', path: '/admin/products/invisible', icon: <Visibility />, color: '#EC4899', count: 'products_invisible' },
  { name: '3D Laser Profiler', path: '/admin/products/3d-laser-profiler', icon: <ThreeDRotation />, color: '#14B8A6', count: 'products_3d_laser_profiler' },
  { name: '3D Stereo Camera', path: '/admin/products/3d-stereo-camera', icon: <ThreeDRotation />, color: '#F97316', count: 'products_3d_stereo_camera' },
  { name: 'Accessory', path: '/admin/products/accessory', icon: <Settings />, color: '#06B6D4', count: 'products_accessory' },
  { name: 'AF Module', path: '/admin/products/af-module', icon: <Lens />, color: '#84CC16', count: 'products_af_module' },
  { name: 'Cable', path: '/admin/products/cable', icon: <Cable />, color: '#6366F1', count: 'products_cable' },
  { name: 'Controller', path: '/admin/products/controller', icon: <Settings />, color: '#A855F7', count: 'products_controller' },
  { name: 'FA Lens', path: '/admin/products/fa-lens', icon: <Lens />, color: '#3B82F6', count: 'products_fa_lens' },
  { name: 'Frame Grabber', path: '/admin/products/frame-grabber', icon: <Memory />, color: '#10B981', count: 'products_frame_grabber' },
  { name: 'GigE LAN Card', path: '/admin/products/gige-lan-card', icon: <Memory />, color: '#F59E0B', count: 'products_gige_lan_card' },
  { name: 'Large Format Lens', path: '/admin/products/large-format-lens', icon: <Lens />, color: '#EF4444', count: 'products_large_format_lens' },
  { name: 'Light', path: '/admin/products/light', icon: <Visibility />, color: '#8B5CF6', count: 'products_light' },
  { name: 'Software', path: '/admin/products/software', icon: <Computer />, color: '#EC4899', count: 'products_software' },
  { name: 'Telecentric', path: '/admin/products/telecentric', icon: <Lens />, color: '#14B8A6', count: 'products_telecentric' },
  { name: 'USB Card', path: '/admin/products/usb-card', icon: <Storage />, color: '#F97316', count: 'products_usb_card' },
];

export default function ProductsPage() {
  const router = useRouter();

  return (
    <Box>
      {/* Page Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Products Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a product category to manage its items
        </Typography>
      </Box>

      {/* Product Categories Grid */}
      <Grid container spacing={2}>
        {productCategories.map((category) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={category.path}>
            <Card
              sx={{
                height: '100%',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                border: '1px solid #E8ECEF',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  borderColor: category.color,
                },
              }}
              onClick={() => router.push(category.path)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '8px',
                      backgroundColor: `${category.color}15`,
                      color: category.color,
                      mr: 2,
                    }}
                  >
                    {category.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {category.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mb: 1 }}>
                  Table: {category.count}
                </Typography>
                <Chip
                  label="Manage"
                  size="small"
                  sx={{
                    backgroundColor: `${category.color}10`,
                    color: category.color,
                    fontWeight: 500,
                    fontSize: '0.75rem',
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}