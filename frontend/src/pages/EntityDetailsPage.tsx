import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { entityConfig } from '../entityConfig';
import { ErrorNotice } from '../components/ErrorNotice';
import { AppShell } from '../layout/AppShell';

export function EntityDetailsPage() {
  const { user } = useAuth();
  const { entity = '', id = '' } = useParams();
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

  return (
    <AppShell title='Internet Security Lab 4' activeEntity={entity}>
      <Stack spacing={2}>
        <Stack direction='row' spacing={2} sx={{ alignItems: 'center' }}>
          <Button component={Link} variant='outlined' to={`/entities/${entity}`}>Back</Button>
          <Typography variant='h4'>{config.label} details</Typography>
        </Stack>
        {error ? <ErrorNotice error={error} /> : null}
        <Card>
          <CardContent>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(item, null, 2)}</pre>
          </CardContent>
        </Card>
      </Stack>
    </AppShell>
  );
}
