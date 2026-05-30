import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { entityConfig } from '../entityConfig';
import { ErrorNotice } from '../components/ErrorNotice';

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
    <main style={{ padding: 16 }}>
      <Link to={`/entities/${entity}`}>Back</Link>
      <h1>{config.label} details</h1>
      {error ? <ErrorNotice error={error} /> : null}
      <pre>{JSON.stringify(item, null, 2)}</pre>
    </main>
  );
}
