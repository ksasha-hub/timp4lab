import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import {
  Alert, Box, Button, Chip,
  Dialog, DialogContent, DialogTitle, IconButton,
  InputAdornment, Paper, Snackbar, Stack,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Tooltip, Typography
} from '@mui/material';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { entityConfig } from '../entityConfig';
import { ErrorNotice } from '../components/ErrorNotice';
import { EntityForm } from '../components/EntityForm';
import { usePaginatedEntity } from '../hooks/usePaginatedEntity';
import { AppShell } from '../layout/AppShell';

const statusColor: Record<string, string> = {
  LOW:'#16a34a', MEDIUM:'#d97706', HIGH:'#dc2626', CRITICAL:'#7c2d12',
  OPEN:'#dc2626', MITIGATED:'#16a34a',
  PLANNED:'#2563eb', IN_PROGRESS:'#d97706', DONE:'#16a34a',
  ADMIN:'#7c3aed', USER:'#475569',
};
const statusBg: Record<string, string> = {
  LOW:'#f0fdf4', MEDIUM:'#fffbeb', HIGH:'#fef2f2', CRITICAL:'#fdf4ff',
  OPEN:'#fef2f2', MITIGATED:'#f0fdf4',
  PLANNED:'#eff6ff', IN_PROGRESS:'#fffbeb', DONE:'#f0fdf4',
  ADMIN:'#faf5ff', USER:'#f8fafc',
};

function CellValue({ col, value }: { col: string; value: unknown }) {
  const v = String(value ?? '');
  if (['severity','status','role'].includes(col) && statusColor[v]) {
    return <Chip label={v} size="small" sx={{ bgcolor: statusBg[v]||'#f1f5f9', color: statusColor[v]||'#475569', fontWeight:600, fontSize:'0.7rem', height:20 }}/>;
  }
  if (col.includes('At') || col === 'date' || col === 'dueDate') {
    if (!v || v === 'null') return <span style={{color:'#94a3b8'}}>—</span>;
    return <>{new Date(v).toLocaleDateString('ru-RU')}</>;
  }
  if (!v || v === 'null') return <span style={{color:'#94a3b8'}}>—</span>;
  if (v.length > 40) return <Tooltip title={v}><span>{v.slice(0,40)}…</span></Tooltip>;
  return <>{v}</>;
}

export function EntityListPage() {
  const { user } = useAuth();
  const { entity = 'departments' } = useParams();
  const config = entityConfig[entity] ?? entityConfig.departments;
  const hasValidEntity = Boolean(entityConfig[entity]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null);
  const [deleteItem, setDeleteItem] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [snackbar, setSnackbar] = useState({ open:false, text:'', severity:'success' as 'success'|'error' });

  const { items, total, limit, loading, error: listError, reload } = usePaginatedEntity<Record<string, unknown>>(
    config.endpoint, page, 10, search
  );

  if (!user) return <Navigate to='/login' replace state={{ from: `/entities/${entity}` }} />;
  if (!hasValidEntity) return <Navigate to='/entities/departments' replace />;

  const showSuccess = (text: string) => setSnackbar({ open:true, text, severity:'success' });
  const showError = (err: unknown) => { setError(err); setSnackbar({ open:true, text:'Operation failed', severity:'error' }); };

  const onCreate = async (values: Record<string, unknown>) => {
    try { await api.post(config.endpoint, values); await reload(); setCreateOpen(false); showSuccess('Created'); }
    catch (err) { showError(err); }
  };
  const onUpdate = async (values: Record<string, unknown>) => {
    if (!editItem?.id) return;
    try { await api.put(`${config.endpoint}/${String(editItem.id)}`, values); setEditItem(null); await reload(); showSuccess('Updated'); }
    catch (err) { showError(err); }
  };
  const onDelete = async () => {
    if (!deleteItem) return;
    if (entity === 'users' && Number(deleteItem.id) === user.id) { showError(new Error('Cannot delete self')); setDeleteItem(null); return; }
    try { await api.delete(`${config.endpoint}/${String(deleteItem.id)}`); setDeleteItem(null); await reload(); showSuccess('Deleted'); }
    catch (err) { showError(err); setDeleteItem(null); }
  };

  const pageCount = Math.max(Math.ceil(total / limit), 1);
  const columns = Object.keys(items[0] ?? { id: '' });

  return (
    <AppShell title='SecureLab' activeEntity={entity}>
      <Stack spacing={2}>
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Box>
            <Typography variant='h4' sx={{ fontWeight:700, color:'#1e293b' }}>{config.label}</Typography>
            <Typography color='text.secondary' variant="body2">Total: {total} records</Typography>
          </Box>
          <Button variant='contained' startIcon={<AddIcon/>} disableElevation onClick={() => setCreateOpen(true)}>
            Add
          </Button>
        </Box>

        <TextField
          placeholder={`Search ${config.label.toLowerCase()}...`}
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          size="small"
          slotProps={{ input: { startAdornment: <InputAdornment position='start'><SearchIcon fontSize='small'/></InputAdornment> }}}
          sx={{ maxWidth: 360 }}
        />

        {error ? <ErrorNotice error={error} onRetry={() => setError(null)} /> : null}
        {listError ? <ErrorNotice error={listError} onRetry={() => void reload()} /> : null}

        <Paper variant='outlined' sx={{ borderRadius:2, overflow:'hidden' }}>
          {loading ? <Typography sx={{ p:2 }}>Loading...</Typography> : null}
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  {columns.map(key => <TableCell key={key} sx={{ whiteSpace:'nowrap' }}>{key}</TableCell>)}
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map(item => (
                  <TableRow key={String(item.id)} hover>
                    {columns.map(key => <TableCell key={key}><CellValue col={key} value={item[key]}/></TableCell>)}
                    <TableCell align='right' sx={{ whiteSpace:'nowrap' }}>
                      <Tooltip title='View'><IconButton component={Link} to={`/entities/${entity}/${String(item.id)}`} size='small'><VisibilityOutlinedIcon fontSize='small'/></IconButton></Tooltip>
                      <Tooltip title='Edit'><IconButton size='small' onClick={() => setEditItem(item)}><EditOutlinedIcon fontSize='small'/></IconButton></Tooltip>
                      <Tooltip title='Delete'><IconButton size='small' color='error' onClick={() => setDeleteItem(item)}><DeleteOutlineIcon fontSize='small'/></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && items.length === 0 && (
                  <TableRow><TableCell colSpan={columns.length+1} align="center" sx={{ py:4, color:'#94a3b8' }}>No records found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
          <Button variant='outlined' size="small" onClick={() => setPage(p => Math.max(1,p-1))} disabled={page<=1}>Prev</Button>
          <Typography variant="body2" color="text.secondary">Page {page} / {pageCount}</Typography>
          <Button variant='outlined' size="small" onClick={() => setPage(p => p+1)} disabled={page*limit>=total}>Next</Button>
        </Box>
      </Stack>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Typography variant="h6" sx={{ fontWeight:600 }}>Add {config.label.slice(0,-1)}</Typography>
          <IconButton size="small" onClick={() => setCreateOpen(false)}><CloseIcon fontSize="small"/></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt:1 }}>
            <EntityForm key={`create-${entity}`} config={config} onSubmit={onCreate} submitLabel='Create'/>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editItem)} onClose={() => setEditItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Typography variant="h6" sx={{ fontWeight:600 }}>Edit {config.label.slice(0,-1)}</Typography>
          <IconButton size="small" onClick={() => setEditItem(null)}><CloseIcon fontSize="small"/></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt:1 }}>
            <EntityForm key={`edit-${entity}-${String(editItem?.id)}`} config={config} initial={editItem ?? undefined} onSubmit={onUpdate} submitLabel='Save changes'/>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteItem)} onClose={() => setDeleteItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete {config.label.slice(0,-1)}?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Record #{String(deleteItem?.id)} will be permanently deleted.
          </Typography>
          <Box sx={{ display:'flex', gap:1, mt:2, justifyContent:'flex-end' }}>
            <Button variant="outlined" onClick={() => setDeleteItem(null)}>Cancel</Button>
            <Button variant="contained" color="error" disableElevation onClick={onDelete}>Delete</Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={2800} onClose={() => setSnackbar(s => ({ ...s, open:false }))} anchorOrigin={{ vertical:'bottom', horizontal:'right' }}>
        <Alert severity={snackbar.severity} variant='filled'>{snackbar.text}</Alert>
      </Snackbar>
    </AppShell>
  );
}
