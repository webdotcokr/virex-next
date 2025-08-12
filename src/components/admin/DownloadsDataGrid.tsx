'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Snackbar, Alert, MenuItem, Select, FormControl, InputLabel, IconButton
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem, GridRowId } from '@mui/x-data-grid';
import { Edit, Delete, Add, OpenInNew, Download as DownloadIcon } from '@mui/icons-material';
import { httpQueries } from '@/lib/http-supabase';

// Type definitions
interface Download {
  id: number
  title: string
  file_name?: string
  file_url: string
  category_id?: number
  hit_count?: number
  created_at?: string
}

interface DownloadCategory {
  id: number
  name: string
  is_member_only?: boolean
  created_at?: string
}

type CategoryFilter = number | 'all';

function useCategories() {
  const [categories, setCategories] = useState<DownloadCategory[]>([]);
  useEffect(() => {
    httpQueries.getGenericData('download_categories', {
      orderBy: 'id',
      orderDirection: 'asc'
    }).then(({ data }) => setCategories(data as DownloadCategory[]));
  }, []);
  return categories;
}

function useDownloads(page: number, pageSize: number, category: CategoryFilter) {
  const [rows, setRows] = useState<Download[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    
    const filters = category !== 'all' ? { category_id: category } : {}
    
    // Get data and count simultaneously
    const [dataResult, countResult] = await Promise.all([
      httpQueries.getGenericData('downloads', {
        page: page + 1, // HTTP queries use 1-based page
        limit: pageSize,
        orderBy: 'created_at',
        orderDirection: 'desc',
        filters
      }),
      httpQueries.getGenericCount('downloads', { filters })
    ])
    
    setRows(dataResult.data as Download[])
    setTotal(countResult.count || 0)
    setLoading(false)
  }, [page, pageSize, category]);

  useEffect(() => { refresh(); }, [refresh]);
  return { rows, total, loading, refresh };
}

function DownloadFormDialog({
  open, onClose, onSubmit,
  categories, initial
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { title: string; file_name: string; file_url: string; category_id: number }) => void;
  categories: DownloadCategory[];
  initial?: Partial<Download>; // for edit
}) {
  const [values, setValues] = useState({
    title: initial?.title ?? '',
    file_name: initial?.file_name ?? '',
    file_url: initial?.file_url ?? '',
    category_id: initial?.category_id ?? (categories[0]?.id ?? 1),
  });

  useEffect(() => {
    setValues({
      title: initial?.title ?? '',
      file_name: initial?.file_name ?? '',
      file_url: initial?.file_url ?? '',
      category_id: initial?.category_id ?? (categories[0]?.id ?? 1),
    });
  }, [initial, categories]);

  const handle = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement> | any) =>
    setValues(v => ({ ...v, [k]: e.target.value }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{initial?.id ? 'Edit Download' : 'Add Download'}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <TextField label="Title" fullWidth sx={{ mb: 2 }} value={values.title} onChange={handle('title')} />
        <TextField label="File Name" fullWidth sx={{ mb: 2 }} value={values.file_name} onChange={handle('file_name')} />
        <TextField label="File URL" fullWidth sx={{ mb: 2 }} value={values.file_url} onChange={handle('file_url')} />
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select label="Category" value={values.category_id} onChange={handle('category_id')}>
            {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onSubmit(values)}>
          {initial?.id ? 'Save Changes' : 'Add Download'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function DownloadsDataGrid() {
  const categories = useCategories();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [pagination, setPagination] = useState({ page: 0, pageSize: 25 });
  const { rows, total, loading, refresh } = useDownloads(pagination.page, pagination.pageSize, category);

  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: 'success' | 'error' | 'info' | 'warning' }>({
    open: false, msg: '', sev: 'success'
  });

  const [dialog, setDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; target?: Download }>({
    open: false, mode: 'add'
  });

  const catName = useCallback((id?: number) => categories.find(c => c.id === id)?.name ?? 'Unknown', [categories]);

  const columns = useMemo<GridColDef<Download>[]>(() => [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 260 },
    { field: 'file_name', headerName: 'File Name', width: 200 },
    {
      field: 'category_id', headerName: 'Category', width: 150,
      renderCell: p => <Chip label={catName(p.value)} size="small" variant="outlined" />
    },
    {
      field: 'hit_count', headerName: 'Downloads', width: 110,
      renderCell: p => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: .5 }}>
          <DownloadIcon sx={{ fontSize: 16 }} />
          {p.value ?? 0}
        </Box>
      )
    },
    {
      field: 'file_url', headerName: 'File', width: 80,
      renderCell: p => (
        <IconButton size="small" onClick={() => window.open(p.value, '_blank')}>
          <OpenInNew fontSize="small" />
        </IconButton>
      )
    },
    {
      field: 'created_at', headerName: 'Created', width: 120,
      valueGetter: v => new Date(v).toLocaleDateString('ko-KR', { year: '2-digit', month: 'short', day: 'numeric' })
    },
    {
      field: 'actions', type: 'actions', headerName: 'Actions', width: 100,
      getActions: params => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => setDialog({ open: true, mode: 'edit', target: params.row })} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => handleDelete(params.id)} />
      ]
    }
  ], [catName]);

  const handleDelete = async (id: GridRowId) => {
    if (!confirm('Delete this item?')) return;
    const { error } = await httpQueries.deleteGeneric('downloads', id);
    setSnack({ open: true, msg: error ? `Delete failed: ${error.message}` : 'Deleted', sev: error ? 'error' : 'success' });
    refresh();
  };

  const handleSubmit = async (values: { title: string; file_name: string; file_url: string; category_id: number }) => {
    const isEdit = dialog.mode === 'edit' && dialog.target?.id;
    const { error } = isEdit
      ? await httpQueries.updateGeneric('downloads', dialog.target!.id, values)
      : await httpQueries.insertGeneric('downloads', { ...values, hit_count: 0 });

    setSnack({ open: true, msg: error ? (isEdit ? `Update failed: ${error.message}` : `Create failed: ${error.message}`) : (isEdit ? 'Updated' : 'Created'), sev: error ? 'error' : 'success' });
    setDialog({ open: false, mode: 'add', target: undefined });
    refresh();
  };

  const exportCSV = () => {
    if (rows.length === 0) return setSnack({ open: true, msg: 'No data to export', sev: 'warning' });
    const csv = [
      ['ID', 'Title', 'File Name', 'Category', 'Downloads', 'Created', 'File URL'],
      ...rows.map(r => [r.id, r.title, r.file_name ?? '', catName(r.category_id ?? undefined), r.hit_count ?? 0, new Date(r.created_at ?? '').toLocaleDateString('ko-KR'), r.file_url])
    ].map(a => a.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a'); a.href = url; a.download = `downloads-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
    setSnack({ open: true, msg: `Exported ${rows.length} rows`, sev: 'success' });
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: .5 }}>Downloads Management</Typography>
          <Typography variant="body2" color="text.secondary">Manage download files and organize by categories.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Add />} onClick={() => setDialog({ open: true, mode: 'add' })}>Add</Button>
          <Button variant="contained" onClick={exportCSV}>Export CSV</Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Category Filter</InputLabel>
          <Select label="Category Filter" value={category} onChange={(e) => { setCategory(e.target.value as CategoryFilter); setPagination(p => ({ ...p, page: 0 })); }}>
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ 
        height: '600px',
        minHeight: '600px', 
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
          rowCount={total}
          paginationMode="server"
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': { background: '#F8F9FB', borderBottom: '1px solid #E8ECEF' },
            '& .MuiDataGrid-row:hover': { background: '#F8F9FB' },
            '& .MuiDataGrid-cell': { lineHeight: 'auto !important' },
          }}
        />
      </Box>

      <DownloadFormDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, mode: 'add' })}
        onSubmit={handleSubmit}
        categories={categories}
        initial={dialog.mode === 'edit' ? dialog.target : undefined}
      />

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.sev} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}