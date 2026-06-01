import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardContent, Chip, Typography, Stack } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import DevicesIcon from '@mui/icons-material/Devices';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import BugReportIcon from '@mui/icons-material/BugReport';
import ShieldIcon from '@mui/icons-material/Shield';
import { api } from '../api/client';
import { AppShell } from '../layout/AppShell';
import { useAuth } from '../auth/AuthContext';
import { Navigate } from 'react-router-dom';

const sections = [
  { key: 'departments',     label: 'Departments',     icon: <BusinessIcon/>,     color: '#2563eb', bg: '#eff6ff' },
  { key: 'assets',          label: 'Assets',          icon: <DevicesIcon/>,      color: '#0891b2', bg: '#ecfeff' },
  { key: 'incidents',       label: 'Incidents',       icon: <WarningAmberIcon/>, color: '#d97706', bg: '#fffbeb' },
  { key: 'vulnerabilities', label: 'Vulnerabilities', icon: <BugReportIcon/>,    color: '#dc2626', bg: '#fef2f2' },
  { key: 'mitigations',     label: 'Mitigations',     icon: <ShieldIcon/>,       color: '#16a34a', bg: '#f0fdf4' },
  { key: 'audits',          label: 'Audits',          icon: <FactCheckIcon/>,    color: '#7c3aed', bg: '#faf5ff' },
  { key: 'users',           label: 'Users',           icon: <PeopleIcon/>,       color: '#475569', bg: '#f8fafc' },
];

export function DashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    sections.forEach(s => {
      api.get(`/${s.key}?page=1&limit=1`).then(r => {
        setCounts(prev => ({ ...prev, [s.key]: r.data.total ?? 0 }));
      }).catch(() => {});
    });
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <AppShell title="SecureLab" activeEntity="dashboard">
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Welcome, {user.username}
          </Typography>
          <Typography color="text.secondary">Security management dashboard</Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
          {sections.map(s => (
            <Card
              key={s.key}
              component={RouterLink}
              to={`/${s.key}`}
              sx={{
                textDecoration: 'none',
                transition: 'transform 0.15s, box-shadow 0.15s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
                cursor: 'pointer'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: s.bg, color: s.color, display: 'flex' }}>
                    {s.icon}
                  </Box>
                  <Chip label={counts[s.key] ?? '—'} size="small" sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600 }} />
                </Box>
                <Typography variant="h6" sx={{ mt: 1.5, fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                  {s.label}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Stack>
    </AppShell>
  );
}
