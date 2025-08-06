'use client'

import { useState } from 'react'
import { Button, Box, Typography, Paper } from '@mui/material'

export default function TestAPIPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    setResult('Testing...')
    
    try {
      console.log('🧪 Testing API endpoint...')
      const response = await fetch('/api/admin/table-schema/9')
      console.log('📥 Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('✅ Success:', data)
      
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('❌ Error:', error)
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const testDB = async () => {
    setLoading(true)
    setResult('Testing DB...')
    
    try {
      console.log('🧪 Testing DB connection...')
      const response = await fetch('/api/test-db')
      console.log('📥 Response status:', response.status)
      
      const data = await response.json()
      console.log('✅ DB Test result:', data)
      
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('❌ DB Error:', error)
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        API Test Page
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={testAPI}
          disabled={loading}
        >
          Test Table Schema API
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={testDB}
          disabled={loading}
        >
          Test DB Connection
        </Button>
      </Box>

      <Paper sx={{ p: 2, minHeight: 200, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Result:
        </Typography>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {result || 'Click a button to test...'}
        </pre>
      </Paper>
    </Box>
  )
}