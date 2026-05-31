import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { entityConfig } from '../entityConfig';
import { useAuth } from '../auth/AuthContext';

const drawerWidth = 260;

export function AppShell({
  title,
  activeEntity,
  children
}: {
  title: string;
  activeEntity: string;
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const navItems = useMemo(() => Object.values(entityConfig), []);

  const drawerContent = (
    <Box>
      <Toolbar>
        <Typography variant='h6' component='div'>Entities</Typography>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((entry) => (
          <ListItemButton
            key={entry.key}
            component={RouterLink}
            to={`/entities/${entry.key}`}
            selected={entry.key === activeEntity}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemText primary={entry.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position='fixed' color='inherit' elevation={1}>
        <Toolbar>
          {!isDesktop ? (
            <IconButton edge='start' onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          ) : null}
          <Typography variant='h6' sx={{ flexGrow: 1 }}>{title}</Typography>
          <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ width: 30, height: 30 }}>{user?.username?.slice(0, 1).toUpperCase()}</Avatar>
            <Typography variant='body2'>{user?.username}</Typography>
            <IconButton aria-label='logout' onClick={() => void logout()}>
              <LogoutIcon fontSize='small' />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {isDesktop ? (
        <Drawer
          variant='permanent'
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' }
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant='temporary'
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box component='main' sx={{ flexGrow: 1, p: 3, mt: '64px', maxWidth: '100%' }}>
        {children}
      </Box>
    </Box>
  );
}
