'use client'

import { useState, useEffect } from 'react'
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
      alert('Please fill in all required fields')
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
      
      alert('Filter added successfully')
    } catch (error) {
      console.error('Error adding filter:', error)
      alert('Failed to add filter')
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
      alert('Filter updated successfully')
    } catch (error) {
      console.error('Error updating filter:', error)
      alert('Failed to update filter')
    }
  }

  const handleDeleteFilter = async (filterId: number) => {
    if (!confirm('Are you sure you want to delete this filter?')) return

    try {
      const { error } = await supabase
        .from('filter_configs')
        .delete()
        .eq('id', filterId)

      if (error) throw error
      
      setFilterConfigs(filterConfigs.filter(f => f.id !== filterId))
      alert('Filter deleted successfully')
    } catch (error) {
      console.error('Error deleting filter:', error)
      alert('Failed to delete filter')
    }
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
      alert('Failed to add option')
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
      alert('Failed to delete option')
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
      alert('Failed to initialize slider settings')
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
      alert('Failed to update slider settings')
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Filter Management</h1>

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

        {/* Add New Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Filter</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Filter Name (e.g., scan_width)"
              value={newFilter.filter_name}
              onChange={(e) => setNewFilter({ ...newFilter, filter_name: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Display Label (e.g., Scan Width)"
              value={newFilter.filter_label}
              onChange={(e) => setNewFilter({ ...newFilter, filter_label: e.target.value })}
              className="p-2 border rounded"
            />
            <select
              value={newFilter.filter_type}
              onChange={(e) => setNewFilter({ ...newFilter, filter_type: e.target.value as 'checkbox' | 'slider' })}
              className="p-2 border rounded"
            >
              <option value="checkbox">Checkbox</option>
              <option value="slider">Slider</option>
            </select>
            <input
              type="text"
              placeholder="Unit (e.g., mm, dpi)"
              value={newFilter.filter_unit}
              onChange={(e) => setNewFilter({ ...newFilter, filter_unit: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Sort Order"
              value={newFilter.sort_order}
              onChange={(e) => setNewFilter({ ...newFilter, sort_order: Number(e.target.value) })}
              className="p-2 border rounded"
            />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newFilter.default_expanded}
                onChange={(e) => setNewFilter({ ...newFilter, default_expanded: e.target.checked })}
                className="mr-2"
              />
              Default Expanded
            </label>
          </div>
          <button
            onClick={handleAddFilter}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Filter
          </button>
        </div>

        {/* Filter List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="space-y-4">
            {filterConfigs.map(filter => (
              <div key={filter.id} className="border rounded-lg p-4">
                {editingFilter?.id === filter.id ? (
                  // Edit Mode
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editingFilter.filter_label}
                      onChange={(e) => setEditingFilter({ ...editingFilter, filter_label: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      value={editingFilter.filter_unit || ''}
                      onChange={(e) => setEditingFilter({ ...editingFilter, filter_unit: e.target.value })}
                      placeholder="Unit"
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="number"
                      value={editingFilter.sort_order}
                      onChange={(e) => setEditingFilter({ ...editingFilter, sort_order: Number(e.target.value) })}
                      className="w-full p-2 border rounded"
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingFilter.is_active}
                        onChange={(e) => setEditingFilter({ ...editingFilter, is_active: e.target.checked })}
                        className="mr-2"
                      />
                      Active
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingFilter.default_expanded}
                        onChange={(e) => setEditingFilter({ ...editingFilter, default_expanded: e.target.checked })}
                        className="mr-2"
                      />
                      Default Expanded
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateFilter(editingFilter)}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingFilter(null)}
                        className="bg-gray-600 text-white px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">
                          {filter.filter_label} 
                          {filter.filter_unit && <span className="text-gray-500 ml-2">({filter.filter_unit})</span>}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Name: {filter.filter_name} | Type: {filter.filter_type} | Order: {filter.sort_order}
                        </p>
                        <p className="text-sm text-gray-600">
                          {filter.is_active ? '✓ Active' : '✗ Inactive'} | 
                          {filter.default_expanded ? ' ✓ Default Expanded' : ' ✗ Default Collapsed'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingFilter(filter)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFilter(filter.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Filter Options (for checkbox type) */}
                    {filter.filter_type === 'checkbox' && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                        <h4 className="font-medium mb-2">Options:</h4>
                        <div className="space-y-1">
                          {filterOptions[filter.id]?.map(option => (
                            <div key={option.id} className="flex justify-between items-center text-sm">
                              <span>{option.option_label} (value: {option.option_value})</span>
                              <button
                                onClick={() => handleDeleteOption(option.id, filter.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            placeholder="Value"
                            className="flex-1 p-1 border rounded text-sm"
                            id={`value-${filter.id}`}
                          />
                          <input
                            type="text"
                            placeholder="Label"
                            className="flex-1 p-1 border rounded text-sm"
                            id={`label-${filter.id}`}
                          />
                          <button
                            onClick={() => {
                              const valueInput = document.getElementById(`value-${filter.id}`) as HTMLInputElement
                              const labelInput = document.getElementById(`label-${filter.id}`) as HTMLInputElement
                              if (valueInput.value && labelInput.value) {
                                handleAddOption(filter.id, valueInput.value, labelInput.value)
                                valueInput.value = ''
                                labelInput.value = ''
                              }
                            }}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Slider Settings (for slider type) */}
                    {filter.filter_type === 'slider' && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                        <h4 className="font-medium mb-2">Slider Settings:</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs text-gray-600">Min Value</label>
                            <input
                              type="number"
                              placeholder="0"
                              value={sliderConfigs[filter.id]?.min_value || ''}
                              onChange={(e) => handleUpdateSliderConfig(filter.id, 'min_value', Number(e.target.value))}
                              className="w-full p-1 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Max Value</label>
                            <input
                              type="number"
                              placeholder="100"
                              value={sliderConfigs[filter.id]?.max_value || ''}
                              onChange={(e) => handleUpdateSliderConfig(filter.id, 'max_value', Number(e.target.value))}
                              className="w-full p-1 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Step</label>
                            <input
                              type="number"
                              placeholder="1"
                              value={sliderConfigs[filter.id]?.step_value || ''}
                              onChange={(e) => handleUpdateSliderConfig(filter.id, 'step_value', Number(e.target.value))}
                              className="w-full p-1 border rounded text-sm"
                            />
                          </div>
                        </div>
                        {!sliderConfigs[filter.id] && (
                          <button
                            onClick={() => handleAddSliderConfig(filter.id)}
                            className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Initialize Slider Settings
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}