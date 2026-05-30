import { Link, Navigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { entityConfig } from '../entityConfig';
import { ErrorNotice } from '../components/ErrorNotice';
import { EntityForm } from '../components/EntityForm';
import { usePaginatedEntity } from '../hooks/usePaginatedEntity';

export function EntityListPage() {
  const { user, logout } = useAuth();
  const { entity = 'departments' } = useParams();
  const config = entityConfig[entity] ?? entityConfig.departments;
  const hasValidEntity = Boolean(entityConfig[entity]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<unknown>(null);

  const { items, total, limit, loading, error: listError, reload } = usePaginatedEntity<Record<string, unknown>>(
    config.endpoint,
    page,
    10,
    search
  );

  if (!user) {
    return <Navigate to='/login' replace state={{ from: `/entities/${entity}` }} />;
  }
  if (!hasValidEntity) {
    return <Navigate to='/entities/departments' replace />;
  }

  const onCreate = async (values: Record<string, unknown>) => {
    try {
      await api.post(config.endpoint, values);
      await reload();
    } catch (err) {
      setError(err);
    }
  };

  const onUpdate = async (values: Record<string, unknown>) => {
    if (!editing?.id) return;
    try {
      await api.put(`${config.endpoint}/${String(editing.id)}`, values);
      setEditing(null);
      await reload();
    } catch (err) {
      setError(err);
    }
  };

  const onDelete = async (item: Record<string, unknown>) => {
    if (entity === 'users' && Number(item.id) === user.id) {
      setError(new Error('Admin cannot delete self'));
      return;
    }
    try {
      await api.delete(`${config.endpoint}/${String(item.id)}`);
      await reload();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <main style={{ padding: 16 }}>
      <header style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <h1>{config.label}</h1>
        <button onClick={() => void logout()}>Logout</button>
      </header>
      <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Object.values(entityConfig).map((entry) => (
          <Link key={entry.key} to={`/entities/${entry.key}`}>{entry.label}</Link>
        ))}
      </nav>

      <p>
        Access token is stored in localStorage for demo simplicity (XSS risk). Refresh token stays in httpOnly cookie.
      </p>

      <input
        placeholder='Search'
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
      />

      {error ? <ErrorNotice error={error} onRetry={() => setError(null)} /> : null}
      {listError ? <ErrorNotice error={listError} onRetry={() => void reload()} /> : null}

      <h2>{editing ? 'Edit entity' : 'Create entity'}</h2>
      <EntityForm
        key={`${entity}-${editing ? 'edit' : 'create'}`}
        config={config}
        initial={editing ?? undefined}
        onSubmit={editing ? onUpdate : onCreate}
        submitLabel={editing ? 'Update' : 'Create'}
      />

      {loading ? <p>Loading...</p> : null}
      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            {Object.keys(items[0] ?? { id: '' }).map((key) => <th key={key}>{key}</th>)}
            <th>actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={String(item.id)}>
              {Object.keys(items[0] ?? { id: '' }).map((key) => <td key={key}>{String(item[key])}</td>)}
              <td>
                <Link to={`/entities/${entity}/${String(item.id)}`}>Details</Link>{' '}
                <button onClick={() => setEditing(item)}>Edit</button>{' '}
                <button onClick={() => void onDelete(item)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer style={{ marginTop: 12 }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
        <span> Page {page} / {Math.max(Math.ceil(total / limit), 1)} </span>
        <button onClick={() => setPage((p) => p + 1)} disabled={page * limit >= total}>Next</button>
      </footer>
    </main>
  );
}
