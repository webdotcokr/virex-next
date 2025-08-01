'use client';

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  ViewList as AllProductsIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  ContactSupport as InquiriesIcon,
  Business as MakersIcon,
  Article as NewsIcon,
  NewReleases as NewProductsIcon,
  Category as SeriesIcon,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

const DRAWER_WIDTH = 280;

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { text: 'Products', icon: <ProductsIcon />, path: '/admin/products' },
  { text: 'All Products', icon: <AllProductsIcon />, path: '/admin/products/all' },
  { text: 'Series', icon: <SeriesIcon />, path: '/admin/series' },
  { text: 'Newsletter', icon: <EmailIcon />, path: '/admin/newsletter' },
  { text: 'Downloads', icon: <DownloadIcon />, path: '/admin/downloads' },
  { text: 'Inquiries', icon: <InquiriesIcon />, path: '/admin/inquiries' },
  { text: 'Makers', icon: <MakersIcon />, path: '/admin/makers' },
  { text: 'News & Media', icon: <NewsIcon />, path: '/admin/news' },
  { text: 'New Products', icon: <NewProductsIcon />, path: '/admin/new-products' },
];

export default function AdminSidebar({ open, onClose, isMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      onClose();
    }
  };

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? open : true}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E8ECEF',
        },
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid #E8ECEF',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Image
          src="/common/virex-logo-color.png"
          alt="Virex Logo"
          width={120}
          height={40}
          style={{ objectFit: 'contain' }}
        />
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1 }}>
        <List sx={{ pt: 2 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <ListItem key={item.text} disablePadding sx={{ px: 2, mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: '8px',
                    py: 1.5,
                    px: 2,
                    backgroundColor: isActive ? '#F0F4FF' : 'transparent',
                    color: isActive ? '#566BDA' : '#666666',
                    '&:hover': {
                      backgroundColor: isActive ? '#F0F4FF' : '#F8F9FB',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? '#566BDA' : '#666666',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 3, borderTop: '1px solid #E8ECEF' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Admin Panel v1.0
        </Typography>
      </Box>
    </Drawer>
  );
}