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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Visibility as VisibleIcon,
  VisibilityOff as HiddenIcon,
} from '@mui/icons-material'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type TableColumnConfig = Database['public']['Tables']['table_column_configs']['Row']
type Category = Database['public']['Tables']['categories']['Row']

export default function AdminTableColumnsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [columnConfigs, setColumnConfigs] = useState<TableColumnConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [editingColumn, setEditingColumn] = useState<TableColumnConfig | null>(null)
  const [newColumn, setNewColumn] = useState({
    column_name: '',
    column_label: '',
    column_type: 'specification' as 'basic' | 'specification',
    is_visible: true,
    is_sortable: true,
    sort_order: 0,
    column_width: ''
  })
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, columnId: null as number | null })

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      loadColumnConfigs()
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

  const loadColumnConfigs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('table_column_configs')
        .select('*')
        .eq('category_id', selectedCategory!)
        .order('sort_order')

      if (error) throw error
      setColumnConfigs(data || [])
    } catch (error) {
      console.error('Error loading column configs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddColumn = async () => {
    if (!selectedCategory || !newColumn.column_name || !newColumn.column_label) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'warning',
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from('table_column_configs')
        .insert({
          category_id: selectedCategory,
          ...newColumn,
          column_width: newColumn.column_width || null
        })
        .select()
        .single()

      if (error) throw error
      
      setColumnConfigs([...columnConfigs, data])
      setNewColumn({
        column_name: '',
        column_label: '',
        column_type: 'specification',
        is_visible: true,
        is_sortable: true,
        sort_order: 0,
        column_width: ''
      })
      
      setSnackbar({
        open: true,
        message: 'Column added successfully!',
        severity: 'success',
      })
    } catch (error) {
      console.error('Error adding column:', error)
      setSnackbar({
        open: true,
        message: 'Failed to add column',
        severity: 'error',
      })
    }
  }

  const handleUpdateColumn = async (column: TableColumnConfig) => {
    try {
      const { error } = await supabase
        .from('table_column_configs')
        .update({
          column_label: column.column_label,
          is_visible: column.is_visible,
          is_sortable: column.is_sortable,
          sort_order: column.sort_order,
          column_width: column.column_width
        })
        .eq('id', column.id)

      if (error) throw error
      
      loadColumnConfigs()
      setEditingColumn(null)
      setSnackbar({
        open: true,
        message: 'Column updated successfully!',
        severity: 'success',
      })
    } catch (error) {
      console.error('Error updating column:', error)
      setSnackbar({
        open: true,
        message: 'Failed to update column',
        severity: 'error',
      })
    }
  }

  const handleDeleteColumn = async (columnId: number) => {
    try {
      const { error } = await supabase
        .from('table_column_configs')
        .delete()
        .eq('id', columnId)

      if (error) throw error
      
      setColumnConfigs(columnConfigs.filter(c => c.id !== columnId))
      setSnackbar({
        open: true,
        message: 'Column deleted successfully!',
        severity: 'success',
      })
    } catch (error) {
      console.error('Error deleting column:', error)
      setSnackbar({
        open: true,
        message: 'Failed to delete column',
        severity: 'error',
      })
    }
  }

  const confirmDeleteColumn = (columnId: number) => {
    setDeleteDialog({ open: true, columnId })
  }

  const moveColumn = async (columnId: number, direction: 'up' | 'down') => {
    const currentIndex = columnConfigs.findIndex(c => c.id === columnId)
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === columnConfigs.length - 1)
    ) {
      return
    }

    const newConfigs = [...columnConfigs]
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    // Swap sort orders
    const currentOrder = newConfigs[currentIndex].sort_order
    const targetOrder = newConfigs[targetIndex].sort_order
    
    newConfigs[currentIndex].sort_order = targetOrder
    newConfigs[targetIndex].sort_order = currentOrder
    
    // Swap positions in array
    ;[newConfigs[currentIndex], newConfigs[targetIndex]] = [newConfigs[targetIndex], newConfigs[currentIndex]]
    
    setColumnConfigs(newConfigs)

    // Update both columns in database
    try {
      await Promise.all([
        supabase
          .from('table_column_configs')
          .update({ sort_order: targetOrder })
          .eq('id', columnId),
        supabase
          .from('table_column_configs')
          .update({ sort_order: currentOrder })
          .eq('id', newConfigs[targetIndex].id)
      ])
    } catch (error) {
      console.error('Error updating sort order:', error)
      loadColumnConfigs() // Reload to ensure consistency
    }
  }

  const basicColumns = ['maker_name', 'series', 'part_number']

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
            Table Column Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure table columns for each product category
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

        {/* Add New Column */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Add New Column
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Column Name"
                  placeholder="e.g., scan_width"
                  value={newColumn.column_name}
                  onChange={(e) => setNewColumn({ ...newColumn, column_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Display Label"
                  placeholder="e.g., Scan Width"
                  value={newColumn.column_label}
                  onChange={(e) => setNewColumn({ ...newColumn, column_label: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Column Type</InputLabel>
                  <Select
                    value={newColumn.column_type}
                    label="Column Type"
                    onChange={(e) => setNewColumn({ ...newColumn, column_type: e.target.value as 'basic' | 'specification' })}
                  >
                    <MenuItem value="basic">Basic Field</MenuItem>
                    <MenuItem value="specification">Specification Field</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Width"
                  placeholder="e.g., 150px, 20%"
                  value={newColumn.column_width}
                  onChange={(e) => setNewColumn({ ...newColumn, column_width: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Sort Order"
                  value={newColumn.sort_order}
                  onChange={(e) => setNewColumn({ ...newColumn, sort_order: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newColumn.is_visible}
                        onChange={(e) => setNewColumn({ ...newColumn, is_visible: e.target.checked })}
                      />
                    }
                    label="Visible"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newColumn.is_sortable}
                        onChange={(e) => setNewColumn({ ...newColumn, is_sortable: e.target.checked })}
                      />
                    }
                    label="Sortable"
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleAddColumn}
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                >
                  Add Column
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Column List */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Table Columns
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {columnConfigs.map((column, index) => (
              <Paper key={column.id} sx={{ p: 3, border: '1px solid #E8ECEF' }}>
                {editingColumn?.id === column.id ? (
                  // Edit Mode
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Column Label"
                      value={editingColumn.column_label}
                      onChange={(e) => setEditingColumn({ ...editingColumn, column_label: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      label="Width"
                      placeholder="e.g., 150px"
                      value={editingColumn.column_width || ''}
                      onChange={(e) => setEditingColumn({ ...editingColumn, column_width: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      type="number"
                      label="Sort Order"
                      value={editingColumn.sort_order}
                      onChange={(e) => setEditingColumn({ ...editingColumn, sort_order: Number(e.target.value) })}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={editingColumn.is_visible}
                            onChange={(e) => setEditingColumn({ ...editingColumn, is_visible: e.target.checked })}
                          />
                        }
                        label="Visible"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={editingColumn.is_sortable}
                            onChange={(e) => setEditingColumn({ ...editingColumn, is_sortable: e.target.checked })}
                          />
                        }
                        label="Sortable"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleUpdateColumn(editingColumn)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setEditingColumn(null)}
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 500 }}>
                            {column.column_label}
                          </Typography>
                          {!column.is_visible && (
                            <Chip
                              icon={<HiddenIcon />}
                              label="Hidden"
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {basicColumns.includes(column.column_name) && (
                            <Chip
                              label="Basic"
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Name: {column.column_name} | Type: {column.column_type} | Width: {column.column_width || 'auto'} | Order: {column.sort_order}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            icon={column.is_visible ? <VisibleIcon /> : <HiddenIcon />}
                            label={column.is_visible ? 'Visible' : 'Hidden'}
                            color={column.is_visible ? 'success' : 'default'}
                            size="small"
                          />
                          <Chip
                            label={column.is_sortable ? 'Sortable' : 'Not Sortable'}
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => moveColumn(column.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUpIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => moveColumn(column.id, 'down')}
                          disabled={index === columnConfigs.length - 1}
                        >
                          <ArrowDownIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setEditingColumn(column)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => confirmDeleteColumn(column.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Paper>
            ))}
            </Box>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Table Preview
            </Typography>
            <TableContainer component={Paper} sx={{ border: '1px solid #E8ECEF' }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#F8F9FB' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>비교</TableCell>
                    {columnConfigs
                      .filter(col => col.is_visible)
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map(col => (
                        <TableCell 
                          key={col.id}
                          sx={{ 
                            fontWeight: 600,
                            width: col.column_width || 'auto',
                          }}
                        >
                          {col.column_label}
                          {col.is_sortable && <Typography component="span" sx={{ ml: 1 }}>↕</Typography>}
                        </TableCell>
                      ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <input type="checkbox" />
                    </TableCell>
                    {columnConfigs
                      .filter(col => col.is_visible)
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map(col => (
                        <TableCell key={col.id}>
                          <Typography variant="body2" color="text.secondary">
                            Sample Data
                          </Typography>
                        </TableCell>
                      ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, columnId: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this column configuration? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialog({ open: false, columnId: null })}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (deleteDialog.columnId) {
                  handleDeleteColumn(deleteDialog.columnId)
                }
                setDeleteDialog({ open: false, columnId: null })
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