import { ReactNode, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Box, Button,
  IconButton, Drawer, List, ListItemButton, ListItemText,
  useMediaQuery, useTheme, Avatar, Menu, MenuItem, Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

interface LayoutProps { children: ReactNode }

const NAV = [
  { label: 'Home', path: '/' },
  { label: 'Planner', path: '/planner' },
  { label: 'My Garden', path: '/my-garden' },
  { label: 'Calendar', path: '/calendar' },
];

const Leaf = ({ style }: { style: React.CSSProperties }) => (
  <svg style={{ position: 'absolute', opacity: 0.08, pointerEvents: 'none', ...style }}
    viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 5 C20 20, 5 50, 50 95 C95 50, 80 20, 50 5Z" fill="#2e7d32" />
    <line x1="50" y1="5" x2="50" y2="95" stroke="#2e7d32" strokeWidth="2" />
  </svg>
);

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const { permission, supported, requestPermission } = useNotifications();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'fixed', inset: 0, zIndex: -1,
        background: 'linear-gradient(160deg, #e8f5e9 0%, #f1f8e9 40%, #fff8e1 100%)' }} />
      <Leaf style={{ width: 300, height: 300, top: -80, right: -60, transform: 'rotate(30deg)' }} />
      <Leaf style={{ width: 200, height: 200, bottom: 100, left: -50, transform: 'rotate(-20deg)' }} />
      <Leaf style={{ width: 150, height: 150, top: '40%', right: '5%', transform: 'rotate(60deg)' }} />
      <Leaf style={{ width: 120, height: 120, top: '20%', left: '3%', transform: 'rotate(-45deg)' }} />

      <AppBar position="sticky" elevation={0} sx={{
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(46,125,50,0.15)', color: 'text.primary',
      }}>
        <Toolbar>
          <LocalFloristIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800, color: 'primary.dark',
            cursor: 'pointer', letterSpacing: '-0.5px' }} onClick={() => navigate('/')}>
            HomeFarm
          </Typography>

          {isMobile ? (
            <IconButton onClick={() => setDrawerOpen(true)}><MenuIcon /></IconButton>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {NAV.map(({ label, path }) => (
                <Button key={path} onClick={() => navigate(path)} sx={{
                  color: location.pathname === path ? 'primary.main' : 'text.secondary',
                  fontWeight: location.pathname === path ? 700 : 500,
                  borderBottom: location.pathname === path ? '2px solid' : '2px solid transparent',
                  borderRadius: 0, pb: 0.5,
                }}>
                  {label}
                </Button>
              ))}

              {/* Notification bell */}
              {supported && permission !== 'granted' && (
                <IconButton size="small" onClick={requestPermission} title="Enable watering reminders">
                  <NotificationsIcon sx={{ color: 'text.disabled' }} />
                </IconButton>
              )}
              {supported && permission === 'granted' && (
                <IconButton size="small" title="Notifications enabled">
                  <NotificationsIcon sx={{ color: 'primary.main' }} />
                </IconButton>
              )}

              {/* Auth */}
              {user ? (
                <>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', cursor: 'pointer',
                    fontSize: '0.85rem', ml: 1 }}
                    onClick={e => setAnchorEl(e.currentTarget)}>
                    {user.email[0].toUpperCase()}
                  </Avatar>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                    <MenuItem disabled sx={{ fontSize: '0.8rem' }}>{user.email}</MenuItem>
                    <Divider />
                    <MenuItem onClick={() => { logout(); setAnchorEl(null); navigate('/'); }}>
                      Sign Out
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button variant="outlined" size="small" sx={{ ml: 1 }} onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ width: 220, pt: 2 }}>
          {NAV.map(({ label, path }) => (
            <ListItemButton key={path} onClick={() => { navigate(path); setDrawerOpen(false); }}
              selected={location.pathname === path}>
              <ListItemText primary={label} />
            </ListItemButton>
          ))}
          <Divider />
          {user ? (
            <ListItemButton onClick={() => { logout(); setDrawerOpen(false); }}>
              <ListItemText primary="Sign Out" />
            </ListItemButton>
          ) : (
            <ListItemButton onClick={() => { navigate('/auth'); setDrawerOpen(false); }}>
              <ListItemText primary="Sign In" />
            </ListItemButton>
          )}
        </List>
      </Drawer>

      <Container component="main" sx={{ mt: 4, mb: 6, flexGrow: 1 }}>
        {children}
      </Container>

      <Box component="footer" sx={{ py: 2.5, textAlign: 'center',
        background: 'rgba(46,125,50,0.08)', borderTop: '1px solid rgba(46,125,50,0.12)' }}>
        <Typography variant="body2" color="text.secondary">
          🌱 HomeFarm Planner — grow something beautiful
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;
