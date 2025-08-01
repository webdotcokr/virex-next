'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Straighten as StraightenIcon,
  CameraAlt as CameraIcon,
  Cable as CableIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface SpecificationRendererProps {
  specifications: Record<string, any>;
  categoryName?: string;
  variant?: 'compact' | 'detailed' | 'table';
  maxItems?: number;
}

interface SpecField {
  key: string;
  label: string;
  value: any;
  unit?: string;
  icon?: React.ReactNode;
  category?: string;
}

export default function SpecificationRenderer({
  specifications,
  categoryName = '',
  variant = 'detailed',
  maxItems,
}: SpecificationRendererProps) {
  if (!specifications || Object.keys(specifications).length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No specifications available
        </Typography>
      </Box>
    );
  }

  // Get icon for specification field
  const getFieldIcon = (key: string): React.ReactNode => {
    const lowerKey = key.toLowerCase();
    
    if (lowerKey.includes('resolution') || lowerKey.includes('pixel')) {
      return <MemoryIcon sx={{ fontSize: 16 }} />;
    } else if (lowerKey.includes('rate') || lowerKey.includes('frequency') || lowerKey.includes('fps')) {
      return <SpeedIcon sx={{ fontSize: 16 }} />;
    } else if (lowerKey.includes('width') || lowerKey.includes('size') || lowerKey.includes('length')) {
      return <StraightenIcon sx={{ fontSize: 16 }} />;
    } else if (lowerKey.includes('sensor') || lowerKey.includes('camera')) {
      return <CameraIcon sx={{ fontSize: 16 }} />;
    } else if (lowerKey.includes('interface') || lowerKey.includes('connection')) {
      return <CableIcon sx={{ fontSize: 16 }} />;
    }
    
    return <SettingsIcon sx={{ fontSize: 16 }} />;
  };

  // Format field label
  const formatLabel = (key: string): string => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get unit for specification
  const getUnit = (key: string, value: any): string | undefined => {
    const lowerKey = key.toLowerCase();
    
    if (typeof value !== 'number') return undefined;
    
    if (lowerKey.includes('width') || lowerKey.includes('size')) {
      return lowerKey.includes('pixel') ? 'μm' : 'mm';
    } else if (lowerKey.includes('rate') || lowerKey.includes('frequency')) {
      return value > 1000 ? 'kHz' : 'Hz';
    } else if (lowerKey.includes('fps')) {
      return 'fps';
    } else if (lowerKey.includes('dpi')) {
      return 'DPI';
    }
    
    return undefined;
  };

  // Categorize specifications based on category type
  const categorizeSpecs = (specs: Record<string, any>): Record<string, SpecField[]> => {
    const categories: Record<string, SpecField[]> = {
      'Sensor': [],
      'Performance': [],
      'Physical': [],
      'Interface': [],
      'Other': [],
    };

    Object.entries(specs).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      let category = 'Other';

      if (lowerKey.includes('sensor') || lowerKey.includes('pixel') || lowerKey.includes('resolution')) {
        category = 'Sensor';
      } else if (lowerKey.includes('rate') || lowerKey.includes('frequency') || lowerKey.includes('fps') || lowerKey.includes('speed')) {
        category = 'Performance';
      } else if (lowerKey.includes('width') || lowerKey.includes('size') || lowerKey.includes('dimension')) {
        category = 'Physical';
      } else if (lowerKey.includes('interface') || lowerKey.includes('connection') || lowerKey.includes('cable')) {
        category = 'Interface';
      }

      categories[category].push({
        key,
        label: formatLabel(key),
        value,
        unit: getUnit(key, value),
        icon: getFieldIcon(key),
        category,
      });
    });

    // Remove empty categories
    return Object.fromEntries(
      Object.entries(categories).filter(([_, fields]) => fields.length > 0)
    );
  };

  // Format value for display
  const formatValue = (value: any, unit?: string): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (typeof value === 'number') {
      // Format large numbers with commas
      const formatted = value.toLocaleString();
      return unit ? `${formatted} ${unit}` : formatted;
    }

    return String(value);
  };

  // Compact variant - show as chips
  if (variant === 'compact') {
    const entries = Object.entries(specifications);
    const displayEntries = maxItems ? entries.slice(0, maxItems) : entries;

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {displayEntries.map(([key, value]) => (
          <Chip
            key={key}
            label={`${formatLabel(key)}: ${formatValue(value, getUnit(key, value))}`}
            size="small"
            variant="outlined"
            icon={getFieldIcon(key)}
          />
        ))}
        {maxItems && entries.length > maxItems && (
          <Chip
            label={`+${entries.length - maxItems} more`}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
      </Box>
    );
  }

  // Table variant - simple table layout
  if (variant === 'table') {
    const entries = Object.entries(specifications);
    const displayEntries = maxItems ? entries.slice(0, maxItems) : entries;

    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableBody>
            {displayEntries.map(([key, value]) => (
              <TableRow key={key}>
                <TableCell sx={{ fontWeight: 500, minWidth: 120 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getFieldIcon(key)}
                    {formatLabel(key)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatValue(value, getUnit(key, value))}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  // Detailed variant - organized by categories
  const categorizedSpecs = categorizeSpecs(specifications);

  return (
    <Box>
      {categoryName && (
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Specifications - {categoryName}
        </Typography>
      )}

      <Grid container spacing={2}>
        {Object.entries(categorizedSpecs).map(([categoryName, fields]) => (
          <Grid key={categoryName} xs={12} md={6}>
            <Accordion defaultExpanded variant="outlined">
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {categoryName}
                  <Chip
                    label={fields.length}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {fields.map((field, index) => (
                    <Box key={field.key}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 0.5,
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {field.icon}
                          <Typography variant="body2" color="text.secondary">
                            {field.label}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatValue(field.value, field.unit)}
                        </Typography>
                      </Box>
                      {index < fields.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>

      {/* Summary footer */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Total: {Object.keys(specifications).length} specifications
        </Typography>
      </Box>
    </Box>
  );
}