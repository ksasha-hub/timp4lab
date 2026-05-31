import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
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
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 460 }}>
        <CardHeader title='Internet Security Lab 4' subheader='Sign in or create an account' />
        <CardContent>
          <Stack spacing={2}>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(_, value) => {
                if (value) setMode(value);
              }}
              fullWidth
              size='small'
            >
              <ToggleButton value='login'>Login</ToggleButton>
              <ToggleButton value='register'>Register</ToggleButton>
            </ToggleButtonGroup>

            {error ? <ErrorNotice error={error} /> : null}

            <Box component='form' onSubmit={submit}>
              <Stack spacing={2}>
                {mode === 'login' ? (
                  <TextField
                    label='Username or email'
                    value={form.login}
                    onChange={(e) => setForm((s) => ({ ...s, login: e.target.value }))}
                    required
                    fullWidth
                  />
                ) : (
                  <>
                    <TextField
                      label='Username'
                      value={form.username}
                      onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
                      required
                      fullWidth
                    />
                    <TextField
                      label='Email'
                      type='email'
                      value={form.email}
                      onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                      required
                      fullWidth
                    />
                  </>
                )}
                <TextField
                  label='Password'
                  type='password'
                  value={form.password}
                  onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                  required
                  fullWidth
                />
                <Button type='submit' variant='contained' fullWidth>
                  {mode === 'login' ? 'Login' : 'Register'}
                </Button>
              </Stack>
            </Box>
            <Typography variant='caption' color='text.secondary'>
              Demo credentials: admin / Admin123!
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
