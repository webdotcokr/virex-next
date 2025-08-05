'use client'

import { useState, useEffect } from 'react'
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
      alert('Please fill in all required fields')
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
      
      alert('Column added successfully')
    } catch (error) {
      console.error('Error adding column:', error)
      alert('Failed to add column')
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
      alert('Column updated successfully')
    } catch (error) {
      console.error('Error updating column:', error)
      alert('Failed to update column')
    }
  }

  const handleDeleteColumn = async (columnId: number) => {
    if (!confirm('Are you sure you want to delete this column configuration?')) return

    try {
      const { error } = await supabase
        .from('table_column_configs')
        .delete()
        .eq('id', columnId)

      if (error) throw error
      
      setColumnConfigs(columnConfigs.filter(c => c.id !== columnId))
      alert('Column deleted successfully')
    } catch (error) {
      console.error('Error deleting column:', error)
      alert('Failed to delete column')
    }
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
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Table Column Management</h1>

        {/* Category Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Category</h2>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(Number(e.target.value))}
            className="w-full p-2 border rounded"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Add New Column */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Column</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Column Name (e.g., scan_width)"
              value={newColumn.column_name}
              onChange={(e) => setNewColumn({ ...newColumn, column_name: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Display Label (e.g., Scan Width)"
              value={newColumn.column_label}
              onChange={(e) => setNewColumn({ ...newColumn, column_label: e.target.value })}
              className="p-2 border rounded"
            />
            <select
              value={newColumn.column_type}
              onChange={(e) => setNewColumn({ ...newColumn, column_type: e.target.value as 'basic' | 'specification' })}
              className="p-2 border rounded"
            >
              <option value="basic">Basic Field</option>
              <option value="specification">Specification Field</option>
            </select>
            <input
              type="text"
              placeholder="Width (e.g., 150px, 20%)"
              value={newColumn.column_width}
              onChange={(e) => setNewColumn({ ...newColumn, column_width: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Sort Order"
              value={newColumn.sort_order}
              onChange={(e) => setNewColumn({ ...newColumn, sort_order: Number(e.target.value) })}
              className="p-2 border rounded"
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newColumn.is_visible}
                  onChange={(e) => setNewColumn({ ...newColumn, is_visible: e.target.checked })}
                  className="mr-2"
                />
                Visible
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newColumn.is_sortable}
                  onChange={(e) => setNewColumn({ ...newColumn, is_sortable: e.target.checked })}
                  className="mr-2"
                />
                Sortable
              </label>
            </div>
          </div>
          <button
            onClick={handleAddColumn}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Column
          </button>
        </div>

        {/* Column List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Table Columns</h2>
          <div className="space-y-2">
            {columnConfigs.map((column, index) => (
              <div key={column.id} className="border rounded-lg p-4">
                {editingColumn?.id === column.id ? (
                  // Edit Mode
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editingColumn.column_label}
                      onChange={(e) => setEditingColumn({ ...editingColumn, column_label: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      value={editingColumn.column_width || ''}
                      onChange={(e) => setEditingColumn({ ...editingColumn, column_width: e.target.value })}
                      placeholder="Width (e.g., 150px)"
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="number"
                      value={editingColumn.sort_order}
                      onChange={(e) => setEditingColumn({ ...editingColumn, sort_order: Number(e.target.value) })}
                      className="w-full p-2 border rounded"
                    />
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingColumn.is_visible}
                          onChange={(e) => setEditingColumn({ ...editingColumn, is_visible: e.target.checked })}
                          className="mr-2"
                        />
                        Visible
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingColumn.is_sortable}
                          onChange={(e) => setEditingColumn({ ...editingColumn, is_sortable: e.target.checked })}
                          className="mr-2"
                        />
                        Sortable
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateColumn(editingColumn)}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingColumn(null)}
                        className="bg-gray-600 text-white px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{column.column_label}</span>
                        {!column.is_visible && <span className="text-xs bg-gray-200 px-2 py-1 rounded">Hidden</span>}
                        {basicColumns.includes(column.column_name) && (
                          <span className="text-xs bg-blue-100 px-2 py-1 rounded">Basic</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Name: {column.column_name} | 
                        Type: {column.column_type} | 
                        Width: {column.column_width || 'auto'} | 
                        Order: {column.sort_order}
                      </p>
                      <p className="text-sm text-gray-600">
                        {column.is_visible ? '✓ Visible' : '✗ Hidden'} | 
                        {column.is_sortable ? '✓ Sortable' : '✗ Not Sortable'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveColumn(column.id, 'up')}
                        disabled={index === 0}
                        className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 px-2 py-1 rounded text-sm"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveColumn(column.id, 'down')}
                        disabled={index === columnConfigs.length - 1}
                        className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 px-2 py-1 rounded text-sm"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => setEditingColumn(column)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteColumn(column.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Table Preview</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-sm font-semibold">비교</th>
                  {columnConfigs
                    .filter(col => col.is_visible)
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map(col => (
                      <th
                        key={col.id}
                        className="text-left p-2 text-sm font-semibold"
                        style={{ width: col.column_width || 'auto' }}
                      >
                        {col.column_label}
                        {col.is_sortable && <span className="ml-1">↕</span>}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 text-sm">
                    <input type="checkbox" />
                  </td>
                  {columnConfigs
                    .filter(col => col.is_visible)
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map(col => (
                      <td key={col.id} className="p-2 text-sm text-gray-600">
                        Sample Data
                      </td>
                    ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}