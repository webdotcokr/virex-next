'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  InputBase,
  Avatar,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  AccountCircle as AccountCircleIcon,
  FileDownload as ExportIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

const DRAWER_WIDTH = 280;

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.04),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.06),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '25ch',
      },
    },
  },
}));

interface AdminHeaderProps {
  title?: string;
  showExportButton?: boolean;
  onExport?: () => void;
  onMenuClick?: () => void;
  isMobile?: boolean;
}

export default function AdminHeader({ title, showExportButton, onExport, onMenuClick, isMobile }: AdminHeaderProps) {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: {
          xs: '100%',
          md: `calc(100% - ${DRAWER_WIDTH}px)`,
        },
        ml: {
          xs: 0,
          md: `${DRAWER_WIDTH}px`,
        },
        backgroundColor: '#FFFFFF',
        color: '#1A1A1A',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left side - Menu & Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={onMenuClick}
              edge="start"
            >
              <MenuIcon />
            </IconButton>
          )}
          {title && (
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
              }}
            >
              {title}
            </Typography>
          )}
        </Box>

        {/* Center - Search (hidden on mobile) */}
        <Box sx={{ 
          flexGrow: 1, 
          display: { xs: 'none', md: 'flex' }, 
          justifyContent: 'center', 
          mx: 4 
        }}>
          <Search sx={{ maxWidth: 400, width: '100%' }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search..."
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
        </Box>

        {/* Right side - Export button and Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {showExportButton && (
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => {
                if (onExport) {
                  onExport();
                } else {
                  // Fallback: dispatch custom event
                  window.dispatchEvent(new CustomEvent('admin-export'));
                }
              }}
              sx={{
                borderColor: '#E8ECEF',
                color: '#666666',
                '&:hover': {
                  borderColor: '#566BDA',
                  backgroundColor: '#F0F4FF',
                },
              }}
            >
              Export
            </Button>
          )}
          
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#566BDA' }}>
              <AccountCircleIcon />
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}