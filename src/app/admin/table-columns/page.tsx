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
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material'
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Visibility as VisibleIcon,
  VisibilityOff as HiddenIcon,
  TableChart as TableIcon,
  Label as LabelIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { supabase } from '@/lib/supabase'

interface Category {
  id: number
  name: string
}

interface TableColumn {
  column_name: string
  data_type: string
  is_nullable: boolean
  column_default: string | null
  has_label: boolean
  label_ko: string | null
  label_en: string | null
  unit: string | null
  is_visible: boolean
  display_order: number
}

interface TableSchemaResponse {
  table_name: string
  category_name: string
  columns: TableColumn[]
}

export default function AdminTableColumnsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [schemaData, setSchemaData] = useState<TableSchemaResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingColumn, setEditingColumn] = useState<string | null>(null)
  const [editData, setEditData] = useState<{
    label_ko: string
    label_en: string
    unit: string
  }>({
    label_ko: '',
    label_en: '',
    unit: ''
  })
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  })

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      // Add a small delay to ensure the client is ready
      const timer = setTimeout(() => {
        loadTableSchema()
      }, 100)
      return () => clearTimeout(timer)
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
      showSnackbar('Failed to load categories', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadTableSchema = async () => {
    if (!selectedCategory) {
      console.log('⚠️ No selectedCategory, skipping load')
      return
    }

    try {
      setLoading(true)
      console.log('🔄 Loading table schema for category:', selectedCategory)

      const url = `/api/admin/table-schema/${selectedCategory}`
      console.log('📡 Fetching from URL:', url)
      console.log('🌐 Current location:', typeof window !== 'undefined' ? window.location.href : 'server-side')

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log('📥 Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error Response:', errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: TableSchemaResponse = await response.json()
      console.log('✅ Table schema loaded:', data)

      setSchemaData(data)
      showSnackbar(`Loaded ${data.columns.length} columns from ${data.table_name}`, 'success')
    } catch (error) {
      console.error('❌ Error loading table schema:', error)
      console.error('❌ Error type:', typeof error)
      console.error('❌ Error details:', error instanceof Error ? error.message : error)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      showSnackbar(`Failed to load table schema: ${errorMessage}`, 'error')
      setSchemaData(null)
    } finally {
      setLoading(false)
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleToggleVisibility = async (columnName: string, currentVisible: boolean) => {
    if (!schemaData) return

    try {
      const newVisible = !currentVisible

      // category_display_config 테이블 업데이트
      const { error } = await supabase
        .from('category_display_config')
        .upsert({
          category_name: schemaData.category_name,
          parameter_name: columnName,
          is_visible: newVisible,
          display_order: schemaData.columns.find(col => col.column_name === columnName)?.display_order || 0
        })

      if (error) throw error

      // 로컬 상태 업데이트
      setSchemaData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          columns: prev.columns.map(col =>
            col.column_name === columnName
              ? { ...col, is_visible: newVisible }
              : col
          )
        }
      })

      showSnackbar(`${columnName} visibility updated`, 'success')
    } catch (error) {
      console.error('Error updating visibility:', error)
      showSnackbar('Failed to update visibility', 'error')
    }
  }

  const handleMoveColumn = async (columnName: string, direction: 'up' | 'down') => {
    if (!schemaData) return

    const columns = [...schemaData.columns]
    const currentIndex = columns.findIndex(col => col.column_name === columnName)
    
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === columns.length - 1)
    ) {
      return
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    // 순서 교체
    const currentOrder = columns[currentIndex].display_order
    const targetOrder = columns[targetIndex].display_order
    
    columns[currentIndex].display_order = targetOrder
    columns[targetIndex].display_order = currentOrder
    
    // 배열에서 위치 교체
    ;[columns[currentIndex], columns[targetIndex]] = [columns[targetIndex], columns[currentIndex]]

    try {
      // 두 컬럼의 순서를 데이터베이스에 업데이트
      await Promise.all([
        supabase
          .from('category_display_config')
          .upsert({
            category_name: schemaData.category_name,
            parameter_name: columnName,
            display_order: targetOrder,
            is_visible: columns.find(col => col.column_name === columnName)?.is_visible || false
          }),
        supabase
          .from('category_display_config')
          .upsert({
            category_name: schemaData.category_name,
            parameter_name: columns[currentIndex].column_name,
            display_order: currentOrder,
            is_visible: columns[currentIndex].is_visible
          })
      ])

      // 로컬 상태 업데이트
      setSchemaData(prev => {
        if (!prev) return prev
        return { ...prev, columns }
      })

      showSnackbar(`Moved ${columnName} ${direction}`, 'success')
    } catch (error) {
      console.error('Error updating order:', error)
      showSnackbar('Failed to update order', 'error')
      // 원래 상태로 되돌리기
      loadTableSchema()
    }
  }

  const handleEditLabel = (column: TableColumn) => {
    setEditingColumn(column.column_name)
    setEditData({
      label_ko: column.label_ko || '',
      label_en: column.label_en || '',
      unit: column.unit || ''
    })
  }

  const handleSaveLabel = async () => {
    if (!editingColumn || !schemaData) return

    try {
      const { error } = await supabase
        .from('parameter_labels')
        .upsert({
          category_name: schemaData.category_name,
          parameter_name: editingColumn,
          label_ko: editData.label_ko.trim() || editingColumn,
          label_en: editData.label_en.trim() || editingColumn,
          unit: editData.unit.trim() || null
        })

      if (error) throw error

      // 로컬 상태 업데이트
      setSchemaData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          columns: prev.columns.map(col =>
            col.column_name === editingColumn
              ? {
                  ...col,
                  has_label: true,
                  label_ko: editData.label_ko.trim() || editingColumn,
                  label_en: editData.label_en.trim() || editingColumn,
                  unit: editData.unit.trim() || null
                }
              : col
          )
        }
      })

      setEditingColumn(null)
      showSnackbar('Label updated successfully', 'success')
    } catch (error) {
      console.error('Error updating label:', error)
      showSnackbar('Failed to update label', 'error')
    }
  }

  const handleCancelEdit = () => {
    setEditingColumn(null)
    setEditData({ label_ko: '', label_en: '', unit: '' })
  }

  const getDataTypeColor = (dataType: string) => {
    switch (dataType) {
      case 'text': return 'primary'
      case 'numeric': return 'success'
      case 'boolean': return 'warning'
      case 'timestamp with time zone': return 'info'
      case 'integer': return 'success'
      default: return 'default'
    }
  }

  if (loading && !schemaData) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4, backgroundColor: '#F8F9FB', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
              Automatic Table Column Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Automatically detects database columns and manages their display configuration
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadTableSchema}
            disabled={!selectedCategory || loading}
          >
            Refresh Schema
          </Button>
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
            {schemaData && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <strong>Database Table:</strong> <code>{schemaData.table_name}</code> • 
                <strong> Category:</strong> <code>{schemaData.category_name}</code> •
                <strong> Columns:</strong> {schemaData.columns.length}
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Column Management Table */}
        {schemaData && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TableIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Database Columns ({schemaData.columns.length})
                </Typography>
              </Box>

              <TableContainer component={Paper} sx={{ border: '1px solid #E8ECEF' }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#F8F9FB' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Column Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Data Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Korean Label</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>English Label</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                      <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Visible</TableCell>
                      <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Order</TableCell>
                      <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {schemaData.columns
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((column, index) => (
                        <TableRow key={column.column_name} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                                {column.column_name}
                              </Typography>
                              {!column.has_label && (
                                <Chip size="small" label="No Label" color="warning" variant="outlined" />
                              )}
                            </Box>
                          </TableCell>
                          
                          <TableCell>
                            <Chip
                              size="small"
                              label={column.data_type}
                              color={getDataTypeColor(column.data_type)}
                              variant="outlined"
                            />
                          </TableCell>

                          {editingColumn === column.column_name ? (
                            // Edit mode
                            <>
                              <TableCell>
                                <TextField
                                  size="small"
                                  value={editData.label_ko}
                                  onChange={(e) => setEditData({ ...editData, label_ko: e.target.value })}
                                  placeholder={column.column_name}
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  value={editData.label_en}
                                  onChange={(e) => setEditData({ ...editData, label_en: e.target.value })}
                                  placeholder={column.column_name}
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  size="small"
                                  value={editData.unit}
                                  onChange={(e) => setEditData({ ...editData, unit: e.target.value })}
                                  placeholder="mm, px, %"
                                  fullWidth
                                />
                              </TableCell>
                            </>
                          ) : (
                            // View mode
                            <>
                              <TableCell>
                                <Typography variant="body2">
                                  {column.label_ko || (
                                    <span style={{ color: '#999', fontStyle: 'italic' }}>
                                      {column.column_name}
                                    </span>
                                  )}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {column.label_en || (
                                    <span style={{ color: '#999', fontStyle: 'italic' }}>
                                      {column.column_name}
                                    </span>
                                  )}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {column.unit || '-'}
                                </Typography>
                              </TableCell>
                            </>
                          )}

                          <TableCell align="center">
                            <Switch
                              checked={column.is_visible}
                              onChange={() => handleToggleVisibility(column.column_name, column.is_visible)}
                              size="small"
                              color="primary"
                            />
                          </TableCell>

                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                              <Typography variant="body2" sx={{ minWidth: '20px' }}>
                                {column.display_order}
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleMoveColumn(column.column_name, 'up')}
                                  disabled={index === 0}
                                  sx={{ p: 0.25 }}
                                >
                                  <ArrowUpIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleMoveColumn(column.column_name, 'down')}
                                  disabled={index === schemaData.columns.length - 1}
                                  sx={{ p: 0.25 }}
                                >
                                  <ArrowDownIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell align="center">
                            {editingColumn === column.column_name ? (
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="Save">
                                  <IconButton size="small" onClick={handleSaveLabel} color="success">
                                    <SaveIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel">
                                  <IconButton size="small" onClick={handleCancelEdit}>
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            ) : (
                              <Tooltip title="Edit Labels">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditLabel(column)}
                                  color="primary"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {schemaData.columns.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No columns found in the database table.
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

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