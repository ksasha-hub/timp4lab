import LogoutIcon from '@mui/icons-material/Logout';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import DevicesIcon from '@mui/icons-material/Devices';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import BugReportIcon from '@mui/icons-material/BugReport';
import ShieldIcon from '@mui/icons-material/Shield';
import DashboardIcon from '@mui/icons-material/Dashboard';
import {
  Avatar, Box, Chip, Divider, Drawer, IconButton,
  List, ListItemButton, ListItemIcon, ListItemText,
  Stack, Tooltip, Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { entityConfig } from '../entityConfig';
import { useAuth } from '../auth/AuthContext';

const drawerWidth = 240;

const entityIcons: Record<string, React.ReactNode> = {
  dashboard: <DashboardIcon fontSize="small" />,
  users: <PeopleIcon fontSize="small" />,
  departments: <BusinessIcon fontSize="small" />,
  assets: <DevicesIcon fontSize="small" />,
  incidents: <WarningAmberIcon fontSize="small" />,
  audits: <FactCheckIcon fontSize="small" />,
  vulnerabilities: <BugReportIcon fontSize="small" />,
  mitigations: <ShieldIcon fontSize="small" />,
};

export function AppShell({ activeEntity, children }: {
  title: string; activeEntity: string; children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const navItems = useMemo(() => Object.values(entityConfig), []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer variant="permanent" sx={{
        width: drawerWidth, flexShrink: 0,
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', border: 'none', borderRight: '1px solid #e2e8f0', bgcolor: '#ffffff' },
      }}>
        <Box sx={{ p: 2.5, pb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <SecurityIcon sx={{ color: '#2563eb', fontSize: 22 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>SecureLab</Typography>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: '#e2e8f0' }} />

        <List sx={{ px: 0.5, pt: 1, flexGrow: 1 }}>
          <ListItemButton
            component={RouterLink}
            to="/dashboard"
            selected={activeEntity === 'dashboard'}
          >
            <ListItemIcon sx={{ minWidth: 36, color: activeEntity === 'dashboard' ? '#2563eb' : '#64748b' }}>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Dashboard" slotProps={{ primary: { style: { fontSize: '0.875rem' } } }} />
          </ListItemButton>

          <Divider sx={{ my: 1, borderColor: '#e2e8f0' }} />

          {navItems.map((entry) => (
            <ListItemButton
              key={entry.key}
              component={RouterLink}
              to={`/entities/${entry.key}`}
              selected={entry.key === activeEntity}
            >
              <ListItemIcon sx={{ minWidth: 36, color: entry.key === activeEntity ? '#2563eb' : '#64748b' }}>
                {entityIcons[entry.key]}
              </ListItemIcon>
              <ListItemText primary={entry.label} slotProps={{ primary: { style: { fontSize: '0.875rem' } } }} />
            </ListItemButton>
          ))}
        </List>

        <Divider sx={{ borderColor: '#e2e8f0' }} />
        <Box sx={{ p: 2 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#eff6ff', color: '#2563eb', fontSize: 13, fontWeight: 600 }}>
              {user?.username?.slice(0, 1).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>{user?.username}</Typography>
              <Chip label={user?.role} size="small" sx={{ height: 16, fontSize: '0.65rem', bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 600 }} />
            </Box>
            <Tooltip title="Logout">
              <IconButton size="small" onClick={() => void logout()} sx={{ color: '#94a3b8' }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, maxWidth: '100%', minHeight: '100vh' }}>
        {children}
      </Box>
    </Box>
  );
}
