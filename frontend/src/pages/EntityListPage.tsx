import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { entityConfig } from '../entityConfig';
import { ErrorNotice } from '../components/ErrorNotice';
import { EntityForm } from '../components/EntityForm';
import { usePaginatedEntity } from '../hooks/usePaginatedEntity';
import { AppShell } from '../layout/AppShell';

export function EntityListPage() {
  const { user } = useAuth();
  const { entity = 'departments' } = useParams();
  const config = entityConfig[entity] ?? entityConfig.departments;
  const hasValidEntity = Boolean(entityConfig[entity]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; text: string; severity: 'success' | 'error' }>({
    open: false,
    text: '',
    severity: 'success'
  });

  const { items, total, limit, loading, error: listError, reload } = usePaginatedEntity<Record<string, unknown>>(
    config.endpoint,
    page,
    10,
    search
  );

  if (!user) return <Navigate to='/login' replace state={{ from: `/entities/${entity}` }} />;
  if (!hasValidEntity) return <Navigate to='/entities/departments' replace />;

  const showSuccess = (text: string) => setSnackbar({ open: true, text, severity: 'success' });
  const showError = (err: unknown) => {
    setError(err);
    setSnackbar({ open: true, text: 'Operation failed', severity: 'error' });
  };

  const onCreate = async (values: Record<string, unknown>) => {
    try {
      await api.post(config.endpoint, values);
      await reload();
      showSuccess(`${config.label.slice(0, -1)} created`);
    } catch (err) {
      showError(err);
    }
  };

  const onUpdate = async (values: Record<string, unknown>) => {
    if (!editing?.id) return;
    try {
      await api.put(`${config.endpoint}/${String(editing.id)}`, values);
      setEditing(null);
      await reload();
      showSuccess(`${config.label.slice(0, -1)} updated`);
    } catch (err) {
      showError(err);
    }
  };

  const onDelete = async (item: Record<string, unknown>) => {
    if (entity === 'users' && Number(item.id) === user.id) {
      showError(new Error('Admin cannot delete self'));
      return;
    }
    try {
      await api.delete(`${config.endpoint}/${String(item.id)}`);
      await reload();
      showSuccess(`${config.label.slice(0, -1)} deleted`);
    } catch (err) {
      showError(err);
    }
  };

  const pageCount = Math.max(Math.ceil(total / limit), 1);
  const columns = Object.keys(items[0] ?? { id: '' });

  return (
    <AppShell title='Internet Security Lab 4' activeEntity={entity}>
      <Stack spacing={2}>
        <Box>
          <Typography variant='h4' gutterBottom>{config.label}</Typography>
          <Typography color='text.secondary'>Manage {config.label.toLowerCase()} with generic CRUD forms and tables.</Typography>
        </Box>

        <TextField
          placeholder='Search'
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon fontSize='small' />
                </InputAdornment>
              )
            }
          }}
          fullWidth
        />

        {error ? <ErrorNotice error={error} onRetry={() => setError(null)} /> : null}
        {listError ? <ErrorNotice error={listError} onRetry={() => void reload()} /> : null}

        <Card>
          <CardContent>
            <Stack direction='row' spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
              <AddIcon fontSize='small' />
              <Typography variant='h6'>{editing ? 'Edit record' : 'Create record'}</Typography>
              {editing ? <Button size='small' onClick={() => setEditing(null)}>Cancel edit</Button> : null}
            </Stack>
            <EntityForm
              key={`${entity}-${editing ? 'edit' : 'create'}`}
              config={config}
              initial={editing ?? undefined}
              onSubmit={editing ? onUpdate : onCreate}
              submitLabel={editing ? 'Update' : 'Create'}
            />
          </CardContent>
        </Card>

        <Paper variant='outlined'>
          {loading ? <Typography sx={{ p: 2 }}>Loading...</Typography> : null}
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  {columns.map((key) => <TableCell key={key}>{key}</TableCell>)}
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={String(item.id)} hover>
                    {columns.map((key) => <TableCell key={key}>{String(item[key] ?? '')}</TableCell>)}
                    <TableCell align='right'>
                      <Tooltip title='View'>
                        <IconButton component={Link} to={`/entities/${entity}/${String(item.id)}`} size='small'>
                          <VisibilityOutlinedIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Edit'>
                        <IconButton size='small' onClick={() => setEditing(item)}>
                          <EditOutlinedIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Delete'>
                        <IconButton size='small' color='error' onClick={() => void onDelete(item)}>
                          <DeleteOutlineIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Stack direction='row' spacing={2} sx={{ alignItems: 'center' }}>
          <Button variant='outlined' onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</Button>
          <Typography>Page {page} / {pageCount}</Typography>
          <Button variant='outlined' onClick={() => setPage((p) => p + 1)} disabled={page * limit >= total}>Next</Button>
        </Stack>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2800}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant='filled'>{snackbar.text}</Alert>
      </Snackbar>
    </AppShell>
  );
}
