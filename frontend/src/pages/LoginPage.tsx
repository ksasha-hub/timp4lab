import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ErrorNotice } from '../components/ErrorNotice';

export function LoginPage() {
  const { user, login, register } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ login: '', username: '', email: '', password: '' });
  const [error, setError] = useState<unknown>(null);

  if (user) {
    const redirect = (location.state as { from?: string } | null)?.from ?? '/';
    return <Navigate to={redirect} replace />;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') {
        await login(form.login, form.password);
      } else {
        await register(form.username, form.email, form.password);
      }
    } catch (err) {
      setError(err);
    }
  };

  return (
    <main style={{ maxWidth: 420, margin: '2rem auto' }}>
      <h1>Internet Security Lab 4</h1>
      <button onClick={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}>
        Switch to {mode === 'login' ? 'register' : 'login'}
      </button>
      {error ? <ErrorNotice error={error} /> : null}
      <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
        {mode === 'login' ? (
          <input placeholder='Username or email' value={form.login} onChange={(e) => setForm((s) => ({ ...s, login: e.target.value }))} required />
        ) : (
          <>
            <input placeholder='Username' value={form.username} onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))} required />
            <input placeholder='Email' type='email' value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} required />
          </>
        )}
        <input placeholder='Password' type='password' value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} required />
        <button type='submit'>{mode === 'login' ? 'Login' : 'Register'}</button>
      </form>
    </main>
  );
}
