'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

const dashboardStats = [
  {
    title: 'Total Products',
    value: '234',
    icon: <InventoryIcon sx={{ fontSize: 40, color: '#566BDA' }} />,
    change: '+12%',
    changeType: 'positive' as const,
  },
  {
    title: 'Newsletter Subscribers',
    value: '1,247',
    icon: <EmailIcon sx={{ fontSize: 40, color: '#10B981' }} />,
    change: '+8%',
    changeType: 'positive' as const,
  },
  {
    title: 'Active Categories',
    value: '28',
    icon: <DashboardIcon sx={{ fontSize: 40, color: '#F59E0B' }} />,
    change: '+2',
    changeType: 'positive' as const,
  },
  {
    title: 'Total Users',
    value: '89',
    icon: <PeopleIcon sx={{ fontSize: 40, color: '#EF4444' }} />,
    change: '+15%',
    changeType: 'positive' as const,
  },
];

export default function AdminDashboard() {
  return (
    <Box>
      {/* Page Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to the Virex Admin Panel. Here's what's happening with your business today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {dashboardStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                p: 2,
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ mr: 2 }}>{stat.icon}</Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Chip
                    label={stat.change}
                    size="small"
                    sx={{
                      backgroundColor: '#F0F9FF',
                      color: '#10B981',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: '12px' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: '#F8F9FB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#F0F4FF' },
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  📧 View Newsletter Subscribers
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage your email subscriber list
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: '#F8F9FB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#F0F4FF' },
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  📦 Manage Products
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add, edit, or remove products
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: '#F8F9FB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#F0F4FF' },
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  📊 View Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Check your website performance
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: '12px' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Recent Activity
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                  }}
                />
                <Typography variant="body2">
                  New newsletter subscription: contact@webdot.co.kr
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#566BDA',
                  }}
                />
                <Typography variant="body2">
                  Product ARL-22CH-12D was updated
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#F59E0B',
                  }}
                />
                <Typography variant="body2">
                  New category added: Scientific Cameras
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}