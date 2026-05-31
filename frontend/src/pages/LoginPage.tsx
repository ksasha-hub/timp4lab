import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  Box, Button, Card, CardContent,
  Stack, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import { useAuth } from '../auth/AuthContext';
import { ErrorNotice } from '../components/ErrorNotice';

export function LoginPage() {
  const { user, login, register } = useAuth();
  const location = useLocation();
  const [tab, setTab] = useState(0);
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
      if (tab === 0) await login(form.login, form.password);
      else await register(form.username, form.email, form.password);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#f1f5f9', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack sx={{ alignItems: 'center' }} spacing={1}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <SecurityIcon sx={{ color: '#2563eb', fontSize: 26 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>SecureLab</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Internet Security </Typography>
          </Stack>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ mb: 3, '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 } }}>
            <Tab label="Sign in" />
            <Tab label="Register" />
          </Tabs>

          {error ? <ErrorNotice error={error} /> : null}

          <Box component="form" onSubmit={submit}>
            <Stack spacing={2}>
              {tab === 0 ? (
                <TextField label="Username or email" value={form.login}
                  onChange={(e) => setForm((s) => ({ ...s, login: e.target.value }))} required fullWidth size="small" />
              ) : (
                <>
                  <TextField label="Username" value={form.username}
                    onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))} required fullWidth size="small" />
                  <TextField label="Email" type="email" value={form.email}
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} required fullWidth size="small" />
                </>
              )}
              <TextField label="Password" type="password" value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} required fullWidth size="small" />
              <Button type="submit" variant="contained" fullWidth size="large" disableElevation>
                {tab === 0 ? 'Sign in' : 'Create account'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
