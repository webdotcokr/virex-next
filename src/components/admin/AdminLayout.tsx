'use client';

import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { adminTheme } from '@/lib/mui-theme';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminBreadcrumb from './AdminBreadcrumb';

const DRAWER_WIDTH = 280;

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  showExportButton?: boolean;
  onExport?: () => void;
}

export default function AdminLayout({ 
  children, 
  title, 
  showExportButton, 
  onExport 
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider theme={adminTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        
        {/* Header */}
        <AdminHeader 
          title={title}
          showExportButton={showExportButton}
          onExport={onExport}
          onMenuClick={handleSidebarToggle}
          isMobile={isMobile}
        />
        
        {/* Sidebar */}
        <AdminSidebar 
          open={sidebarOpen} 
          onClose={handleSidebarClose}
          isMobile={isMobile}
        />
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: {
              xs: '100%',
              md: `calc(100% - ${DRAWER_WIDTH}px)`,
            },
            backgroundColor: '#F8F9FB',
            minHeight: '100vh',
          }}
        >
          {/* Spacer for fixed header */}
          <Toolbar />
          
          {/* Content Container */}
          <Box sx={{ 
            p: { xs: 2, md: 3 },
          }}>
            {/* Breadcrumb */}
            <AdminBreadcrumb />
            
            {/* Page Content */}
            <Box
              sx={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                p: { xs: 2, md: 3 },
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                minHeight: 'calc(100vh - 120px)',
              }}
            >
              {children}
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}