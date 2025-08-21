'use client';

import React, { useState } from 'react';
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
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  ContactSupport as InquiriesIcon,
  Article as NewsIcon,
  NewReleases as NewProductsIcon,
  Category as SeriesIcon,
  AttachFile as AttachFileIcon,
  ExpandLess,
  ExpandMore,
  ChevronRight,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

const DRAWER_WIDTH = 280;

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

// Product categories configuration
const productCategories = [
  { text: 'CIS', path: '/admin/products/cis', table: 'products_cis' },
  { text: 'TDI', path: '/admin/products/tdi', table: 'products_tdi' },
  { text: 'Line', path: '/admin/products/line', table: 'products_line' },
  { text: 'Area', path: '/admin/products/area', table: 'products_area' },
  { text: 'Scientific', path: '/admin/products/scientific', table: 'products_scientific' },
  { text: 'Invisible', path: '/admin/products/invisible', table: 'products_invisible' },
  { text: '3D Laser Profiler', path: '/admin/products/3d-laser-profiler', table: 'products_3d_laser_profiler' },
  { text: '3D Stereo Camera', path: '/admin/products/3d-stereo-camera', table: 'products_3d_stereo_camera' },
  { text: 'Accessory', path: '/admin/products/accessory', table: 'products_accessory' },
  { text: 'AF Module', path: '/admin/products/af-module', table: 'products_af_module' },
  { text: 'Cable', path: '/admin/products/cable', table: 'products_cable' },
  { text: 'Controller', path: '/admin/products/controller', table: 'products_controller' },
  { text: 'FA Lens', path: '/admin/products/fa-lens', table: 'products_fa_lens' },
  { text: 'Frame Grabber', path: '/admin/products/frame-grabber', table: 'products_frame_grabber' },
  { text: 'GigE LAN Card', path: '/admin/products/gige-lan-card', table: 'products_gige_lan_card' },
  { text: 'Large Format Lens', path: '/admin/products/large-format-lens', table: 'products_large_format_lens' },
  { text: 'Light', path: '/admin/products/light', table: 'products_light' },
  { text: 'Software', path: '/admin/products/software', table: 'products_software' },
  { text: 'Telecentric', path: '/admin/products/telecentric', table: 'products_telecentric' },
  { text: 'USB Card', path: '/admin/products/usb-card', table: 'products_usb_card' },
];

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { 
    text: 'Products', 
    icon: <ProductsIcon />, 
    path: '/admin/products',
    hasSubmenu: true,
    submenu: productCategories 
  },
  { text: 'Product Files Management', icon: <AttachFileIcon />, path: '/admin/product-files' },
  { text: 'Series', icon: <SeriesIcon />, path: '/admin/series' },
  { text: 'Newsletter', icon: <EmailIcon />, path: '/admin/newsletter' },
  { text: 'Downloads', icon: <DownloadIcon />, path: '/admin/downloads' },
  { text: 'Inquiries', icon: <InquiriesIcon />, path: '/admin/inquiries' },
  { text: 'News & Media', icon: <NewsIcon />, path: '/admin/news' },
  { text: 'New Products', icon: <NewProductsIcon />, path: '/admin/new-products' },
];

export default function AdminSidebar({ open, onClose, isMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [productsOpen, setProductsOpen] = useState(pathname.startsWith('/admin/products'));

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleProductsToggle = () => {
    setProductsOpen(!productsOpen);
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
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List sx={{ pt: 2 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path || 
              (item.hasSubmenu && pathname.startsWith(item.path));
            
            return (
              <React.Fragment key={item.text}>
                <ListItem disablePadding sx={{ px: 2, mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => {
                      if (item.hasSubmenu) {
                        handleProductsToggle();
                      } else {
                        handleNavigation(item.path);
                      }
                    }}
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
                    {item.hasSubmenu && (
                      productsOpen ? <ExpandLess /> : <ExpandMore />
                    )}
                  </ListItemButton>
                </ListItem>
                
                {/* Submenu for Products */}
                {item.hasSubmenu && (
                  <Collapse in={productsOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.submenu?.map((subItem) => {
                        const isSubActive = pathname === subItem.path;
                        
                        return (
                          <ListItem key={subItem.text} disablePadding sx={{ px: 2 }}>
                            <ListItemButton
                              onClick={() => handleNavigation(subItem.path)}
                              sx={{
                                borderRadius: '8px',
                                py: 1,
                                pl: 6,
                                pr: 2,
                                mb: 0.25,
                                backgroundColor: isSubActive ? '#F0F4FF' : 'transparent',
                                color: isSubActive ? '#566BDA' : '#666666',
                                '&:hover': {
                                  backgroundColor: isSubActive ? '#F0F4FF' : '#F8F9FB',
                                },
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  color: isSubActive ? '#566BDA' : '#999999',
                                  minWidth: 24,
                                }}
                              >
                                <ChevronRight fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={subItem.text}
                                primaryTypographyProps={{
                                  fontSize: '0.8125rem',
                                  fontWeight: isSubActive ? 500 : 400,
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
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