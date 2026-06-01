import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { Button, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { entityConfig } from '../entityConfig';
import { ErrorNotice } from '../components/ErrorNotice';
import { AppShell } from '../layout/AppShell';

const relatedEntityMap: Record<string, string> = {
  departmentId: 'departments',
  assetId: 'assets',
  reporterId: 'users',
  vulnerabilityId: 'vulnerabilities'
};

const toLabel = (key: string) => key
  .replace(/([A-Z])/g, ' $1')
  .replace(/^./, (c) => c.toUpperCase());

const formatValue = (key: string, value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  if ((key.endsWith('At') || key === 'date' || key === 'dueDate') && typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString();
    }
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export function EntityDetailsPage() {
  const { user } = useAuth();
  const { entity = '', id = '' } = useParams();
  const location = useLocation();
  const config = entityConfig[entity];
  const [item, setItem] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!config || !id) return;
    api.get(`${config.endpoint}/${id}`)
      .then((res) => setItem(res.data as Record<string, unknown>))
      .catch(setError);
  }, [config, id]);

  if (!user) return <Navigate to='/login' replace />;
  if (!config) return <Navigate to='/' replace />;

  const backTo = ((location.state as { from?: string } | null)?.from) ?? `/${entity}${location.search}`;
  const entries = Object.entries(item ?? {});

  return (
    <AppShell title='Internet Security Lab 4' activeEntity={entity}>
      <Stack spacing={2}>
        <Stack direction='row' spacing={2} sx={{ alignItems: 'center' }}>
          <Button component={Link} variant='outlined' to={backTo}>Back</Button>
          <Typography variant='h4'>{config.label} details</Typography>
        </Stack>
        {error ? <ErrorNotice error={error} /> : null}
        <Card>
          <CardContent>
            <Stack spacing={1.5} divider={<Divider />}>
              {entries.map(([key, value]) => (
                <Stack key={key} direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography color="text.secondary">{toLabel(key)}</Typography>
                  {relatedEntityMap[key] && value ? (
                    <Button component={Link} to={`/${relatedEntityMap[key]}/${String(value)}`} size="small">
                      {String(value)}
                    </Button>
                  ) : (
                    <Typography sx={{ fontWeight: 500, textAlign: 'right' }}>{formatValue(key, value)}</Typography>
                  )}
                </Stack>
              ))}
              {!item ? <Typography color="text.secondary">Loading...</Typography> : null}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </AppShell>
  );
}
