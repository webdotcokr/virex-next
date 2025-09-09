'use client';

import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';

interface Series {
  id: number;
  series_name: string;
}

interface SeriesDropdownProps {
  value: number | null;
  onChange: (seriesId: number | null) => void;
  label?: string;
  disabled?: boolean;
}

export default function SeriesDropdown({
  value,
  onChange,
  label = 'Series',
  disabled = false,
}: SeriesDropdownProps) {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch series data
  const fetchSeries = async (search?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/series?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch series');
      }

      const result = await response.json();
      setSeries(result.data || []);
    } catch (error) {
      console.error('Error fetching series:', error);
      setSeries([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSeries();
  }, []);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        fetchSeries(searchTerm);
      } else {
        fetchSeries();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Find selected series
  const selectedSeries = series.find(s => s.id === value) || null;

  return (
    <Autocomplete
      value={selectedSeries}
      onChange={(_, newValue) => {
        onChange(newValue?.id || null);
      }}
      onInputChange={(_, newInputValue) => {
        setSearchTerm(newInputValue);
      }}
      options={series}
      getOptionLabel={(option) => option.series_name}
      loading={loading}
      disabled={disabled}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          fullWidth
          margin="dense"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props;
        return (
          <Box component="li" key={option.id} {...otherProps}>
            <Box>
              <Typography variant="body2">
                {option.series_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: {option.id}
              </Typography>
            </Box>
          </Box>
        );
      }}
      noOptionsText={
        searchTerm 
          ? `No series found for "${searchTerm}"` 
          : 'No series available'
      }
      sx={{ mb: 2 }}
    />
  );
}