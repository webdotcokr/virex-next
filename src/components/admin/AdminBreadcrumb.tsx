'use client';

import React from 'react';
import { Breadcrumbs, Typography, Link, Box } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminBreadcrumbProps {
  items?: BreadcrumbItem[];
}

const pathToLabel: Record<string, string> = {
  admin: 'Dashboard',
  products: 'Products',
  newsletter: 'Newsletter',
  all: 'All Products',
};

export default function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname if not provided
  const breadcrumbItems = items || generateBreadcrumbItems(pathname);

  return (
    <Box sx={{ mb: 3 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="admin breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: '#9CA3AF',
          },
        }}
      >
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          if (isLast || !item.href) {
            return (
              <Typography
                key={index}
                color="text.primary"
                sx={{ 
                  fontSize: '0.875rem',
                  fontWeight: isLast ? 600 : 400,
                }}
              >
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={index}
              underline="hover"
              color="text.secondary"
              href={item.href}
              sx={{ 
                fontSize: '0.875rem',
                '&:hover': {
                  color: '#566BDA',
                },
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}

function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  // Always start with Dashboard
  items.push({ label: 'Dashboard', href: '/admin' });

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip the first 'admin' segment as it's already handled
    if (segment === 'admin') return;

    const label = pathToLabel[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === segments.length - 1;
    
    items.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  });

  return items;
}