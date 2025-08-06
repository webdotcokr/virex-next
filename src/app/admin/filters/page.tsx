'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  Alert,
  Snackbar,
  Paper,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type FilterConfig = Database['public']['Tables']['filter_configs']['Row']
type FilterOption = Database['public']['Tables']['filter_options']['Row']
type FilterSliderConfig = Database['public']['Tables']['filter_slider_configs']['Row']
type Category = Database['public']['Tables']['categories']['Row']

export default function AdminFiltersPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [filterConfigs, setFilterConfigs] = useState<FilterConfig[]>([])
  const [filterOptions, setFilterOptions] = useState<Record<number, FilterOption[]>>({})
  const [sliderConfigs, setSliderConfigs] = useState<Record<number, FilterSliderConfig>>({})
  const [loading, setLoading] = useState(true)
  const [editingFilter, setEditingFilter] = useState<FilterConfig | null>(null)
  const [newFilter, setNewFilter] = useState({
    filter_name: '',
    filter_label: '',
    filter_type: 'checkbox' as 'checkbox' | 'slider',
    filter_unit: '',
    sort_order: 0,
    default_expanded: true
  })
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  })
  const [expandedFilters, setExpandedFilters] = useState<Record<number, boolean>>({})
  const [deleteDialog, setDeleteDialog] = useState({ open: false, filterId: null as number | null })

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      loadFilterConfigs()
    }
  }, [selectedCategory])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
      if (data && data.length > 0) {
        setSelectedCategory(data[0].id)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFilterConfigs = async () => {
    try {
      setLoading(true)
      const { data: configs, error: configError } = await supabase
        .from('filter_configs')
        .select('*')
        .eq('category_id', selectedCategory!)
        .order('sort_order')

      if (configError) throw configError
      setFilterConfigs(configs || [])

      // Load options for each filter
      const optionsMap: Record<number, FilterOption[]> = {}
      const sliderMap: Record<number, FilterSliderConfig> = {}
      
      for (const config of configs || []) {
        if (config.filter_type === 'checkbox') {
          const { data: options, error: optionsError } = await supabase
            .from('filter_options')
            .select('*')
            .eq('filter_config_id', config.id)
            .order('sort_order')

          if (!optionsError && options) {
            optionsMap[config.id] = options
          }
        } else if (config.filter_type === 'slider') {
          const { data: sliderConfig, error: sliderError } = await supabase
            .from('filter_slider_configs')
            .select('*')
            .eq('filter_config_id', config.id)
            .single()

          if (!sliderError && sliderConfig) {
            sliderMap[config.id] = sliderConfig
          }
        }
      }
      setFilterOptions(optionsMap)
      setSliderConfigs(sliderMap)
    } catch (error) {
      console.error('Error loading filter configs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFilter = async () => {
    if (!selectedCategory || !newFilter.filter_name || !newFilter.filter_label) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'warning',
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from('filter_configs')
        .insert({
          category_id: selectedCategory,
          ...newFilter,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error
      
      // If it's a slider type, automatically create slider config
      if (data.filter_type === 'slider') {
        const { data: sliderData, error: sliderError } = await supabase
          .from('filter_slider_configs')
          .insert({
            filter_config_id: data.id,
            min_value: 0,
            max_value: 100,
            step_value: 1
          })
          .select()
          .single()

        if (!sliderError && sliderData) {
          setSliderConfigs({
            ...sliderConfigs,
            [data.id]: sliderData
          })
        }
      }
      
      setFilterConfigs([...filterConfigs, data])
      setNewFilter({
        filter_name: '',
        filter_label: '',
        filter_type: 'checkbox',
        filter_unit: '',
        sort_order: 0,
        default_expanded: true
      })
      
      setSnackbar({
        open: true,
        message: 'Filter added successfully!',
        severity: 'success',
      })
    } catch (error) {
      console.error('Error adding filter:', error)
      setSnackbar({
        open: true,
        message: 'Failed to add filter',
        severity: 'error',
      })
    }
  }

  const handleUpdateFilter = async (filter: FilterConfig) => {
    try {
      const { error } = await supabase
        .from('filter_configs')
        .update({
          filter_label: filter.filter_label,
          filter_unit: filter.filter_unit,
          is_active: filter.is_active,
          sort_order: filter.sort_order,
          default_expanded: filter.default_expanded
        })
        .eq('id', filter.id)

      if (error) throw error
      
      loadFilterConfigs()
      setEditingFilter(null)
      setSnackbar({
        open: true,
        message: 'Filter updated successfully!',
        severity: 'success',
      })
    } catch (error) {
      console.error('Error updating filter:', error)
      setSnackbar({
        open: true,
        message: 'Failed to update filter',
        severity: 'error',
      })
    }
  }

  const handleDeleteFilter = async (filterId: number) => {
    try {
      const { error } = await supabase
        .from('filter_configs')
        .delete()
        .eq('id', filterId)

      if (error) throw error
      
      setFilterConfigs(filterConfigs.filter(f => f.id !== filterId))
      setSnackbar({
        open: true,
        message: 'Filter deleted successfully!',
        severity: 'success',
      })
    } catch (error) {
      console.error('Error deleting filter:', error)
      setSnackbar({
        open: true,
        message: 'Failed to delete filter',
        severity: 'error',
      })
    }
  }

  const confirmDeleteFilter = (filterId: number) => {
    setDeleteDialog({ open: true, filterId })
  }

  const handleAddOption = async (filterId: number, value: string, label: string) => {
    try {
      const { data, error } = await supabase
        .from('filter_options')
        .insert({
          filter_config_id: filterId,
          option_value: value,
          option_label: label,
          sort_order: (filterOptions[filterId]?.length || 0) + 1,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error
      
      setFilterOptions({
        ...filterOptions,
        [filterId]: [...(filterOptions[filterId] || []), data]
      })
    } catch (error) {
      console.error('Error adding option:', error)
      setSnackbar({
        open: true,
        message: 'Failed to add option',
        severity: 'error',
      })
    }
  }

  const handleDeleteOption = async (optionId: number, filterId: number) => {
    try {
      const { error } = await supabase
        .from('filter_options')
        .delete()
        .eq('id', optionId)

      if (error) throw error
      
      setFilterOptions({
        ...filterOptions,
        [filterId]: filterOptions[filterId].filter(o => o.id !== optionId)
      })
    } catch (error) {
      console.error('Error deleting option:', error)
      setSnackbar({
        open: true,
        message: 'Failed to delete option',
        severity: 'error',
      })
    }
  }

  const handleAddSliderConfig = async (filterId: number) => {
    try {
      const { data, error } = await supabase
        .from('filter_slider_configs')
        .insert({
          filter_config_id: filterId,
          min_value: 0,
          max_value: 100,
          step_value: 1
        })
        .select()
        .single()

      if (error) throw error
      
      setSliderConfigs({
        ...sliderConfigs,
        [filterId]: data
      })
    } catch (error) {
      console.error('Error adding slider config:', error)
      setSnackbar({
        open: true,
        message: 'Failed to initialize slider settings',
        severity: 'error',
      })
    }
  }

  const handleUpdateSliderConfig = async (filterId: number, field: 'min_value' | 'max_value' | 'step_value', value: number) => {
    const currentConfig = sliderConfigs[filterId]
    if (!currentConfig) return

    try {
      const { error } = await supabase
        .from('filter_slider_configs')
        .update({ [field]: value })
        .eq('id', currentConfig.id)

      if (error) throw error
      
      setSliderConfigs({
        ...sliderConfigs,
        [filterId]: {
          ...currentConfig,
          [field]: value
        }
      })
    } catch (error) {
      console.error('Error updating slider config:', error)
      setSnackbar({
        open: true,
        message: 'Failed to update slider settings',
        severity: 'error',
      })
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4, backgroundColor: '#F8F9FB', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Filter Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure filters for each product category
          </Typography>
        </Box>

        {/* Category Selection */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Select Category
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={selectedCategory || ''}
                label="Category"
                onChange={(e) => setSelectedCategory(Number(e.target.value))}
              >
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* Add New Filter */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Add New Filter
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Filter Name"
                  placeholder="e.g., scan_width"
                  value={newFilter.filter_name}
                  onChange={(e) => setNewFilter({ ...newFilter, filter_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Display Label"
                  placeholder="e.g., Scan Width"
                  value={newFilter.filter_label}
                  onChange={(e) => setNewFilter({ ...newFilter, filter_label: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Filter Type</InputLabel>
                  <Select
                    value={newFilter.filter_type}
                    label="Filter Type"
                    onChange={(e) => setNewFilter({ ...newFilter, filter_type: e.target.value as 'checkbox' | 'slider' })}
                  >
                    <MenuItem value="checkbox">Checkbox</MenuItem>
                    <MenuItem value="slider">Slider</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Unit"
                  placeholder="e.g., mm, dpi"
                  value={newFilter.filter_unit}
                  onChange={(e) => setNewFilter({ ...newFilter, filter_unit: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Sort Order"
                  value={newFilter.sort_order}
                  onChange={(e) => setNewFilter({ ...newFilter, sort_order: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newFilter.default_expanded}
                      onChange={(e) => setNewFilter({ ...newFilter, default_expanded: e.target.checked })}
                    />
                  }
                  label="Default Expanded"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleAddFilter}
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                >
                  Add Filter
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Filter List */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Filters
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filterConfigs.map(filter => (
              <Paper key={filter.id} sx={{ p: 3, border: '1px solid #E8ECEF' }}>
                {editingFilter?.id === filter.id ? (
                  // Edit Mode
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Filter Label"
                      value={editingFilter.filter_label}
                      onChange={(e) => setEditingFilter({ ...editingFilter, filter_label: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      label="Unit"
                      placeholder="Unit"
                      value={editingFilter.filter_unit || ''}
                      onChange={(e) => setEditingFilter({ ...editingFilter, filter_unit: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Sort Order"
                      value={editingFilter.sort_order}
                      onChange={(e) => setEditingFilter({ ...editingFilter, sort_order: Number(e.target.value) })}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editingFilter.is_active}
                          onChange={(e) => setEditingFilter({ ...editingFilter, is_active: e.target.checked })}
                        />
                      }
                      label="Active"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editingFilter.default_expanded}
                          onChange={(e) => setEditingFilter({ ...editingFilter, default_expanded: e.target.checked })}
                        />
                      }
                      label="Default Expanded"
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleUpdateFilter(editingFilter)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setEditingFilter(null)}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  // View Mode
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {filter.filter_label}
                          {filter.filter_unit && (
                            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                              ({filter.filter_unit})
                            </Typography>
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Name: {filter.filter_name} | Type: {filter.filter_type} | Order: {filter.sort_order}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={filter.is_active ? 'Active' : 'Inactive'}
                            color={filter.is_active ? 'success' : 'default'}
                            size="small"
                          />
                          <Chip
                            label={filter.default_expanded ? 'Default Expanded' : 'Default Collapsed'}
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => setEditingFilter(filter)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => confirmDeleteFilter(filter.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Filter Options (for checkbox type) */}
                    {filter.filter_type === 'checkbox' && (
                      <Box sx={{ mt: 3, pl: 2, borderLeft: '3px solid #566BDA' }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                          Options:
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                          {filterOptions[filter.id]?.map(option => (
                            <Box key={option.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, backgroundColor: '#F8F9FB', borderRadius: 1 }}>
                              <Typography variant="body2">
                                {option.option_label} (value: {option.option_value})
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteOption(option.id, filter.id)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            size="small"
                            placeholder="Value"
                            id={`value-${filter.id}`}
                            sx={{ flex: 1 }}
                          />
                          <TextField
                            size="small"
                            placeholder="Label"
                            id={`label-${filter.id}`}
                            sx={{ flex: 1 }}
                          />
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => {
                              const valueInput = document.getElementById(`value-${filter.id}`) as HTMLInputElement
                              const labelInput = document.getElementById(`label-${filter.id}`) as HTMLInputElement
                              if (valueInput.value && labelInput.value) {
                                handleAddOption(filter.id, valueInput.value, labelInput.value)
                                valueInput.value = ''
                                labelInput.value = ''
                              }
                            }}
                          >
                            Add
                          </Button>
                        </Box>
                      </Box>
                    )}

                    {/* Slider Settings (for slider type) */}
                    {filter.filter_type === 'slider' && (
                      <Box sx={{ mt: 3, pl: 2, borderLeft: '3px solid #566BDA' }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                          Slider Settings:
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label="Min Value"
                              placeholder="0"
                              value={sliderConfigs[filter.id]?.min_value || ''}
                              onChange={(e) => handleUpdateSliderConfig(filter.id, 'min_value', Number(e.target.value))}
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label="Max Value"
                              placeholder="100"
                              value={sliderConfigs[filter.id]?.max_value || ''}
                              onChange={(e) => handleUpdateSliderConfig(filter.id, 'max_value', Number(e.target.value))}
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              label="Step"
                              placeholder="1"
                              value={sliderConfigs[filter.id]?.step_value || ''}
                              onChange={(e) => handleUpdateSliderConfig(filter.id, 'step_value', Number(e.target.value))}
                            />
                          </Grid>
                        </Grid>
                        {!sliderConfigs[filter.id] && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleAddSliderConfig(filter.id)}
                            sx={{ mt: 2 }}
                          >
                            Initialize Slider Settings
                          </Button>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            ))}
            </Box>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, filterId: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this filter? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialog({ open: false, filterId: null })}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (deleteDialog.filterId) {
                  handleDeleteFilter(deleteDialog.filterId)
                }
                setDeleteDialog({ open: false, filterId: null })
              }}
              variant="contained"
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert 
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  )
}