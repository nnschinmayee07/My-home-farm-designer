import { ReactNode, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Box, Button,
  IconButton, Drawer, List, ListItemButton, ListItemText, useMediaQuery, useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps { children: ReactNode }

const NAV = [
  { label: 'Home', path: '/' },
  { label: 'Garden Planner', path: '/planner' },
  { label: 'My Garden', path: '/my-garden' },
];

// Floating leaf SVG for background decoration
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Nature background */}
      <Box sx={{
        position: 'fixed', inset: 0, zIndex: -1,
        background: 'linear-gradient(160deg, #e8f5e9 0%, #f1f8e9 40%, #fff8e1 100%)',
      }} />
      {/* Decorative leaves */}
      <Leaf style={{ width: 300, height: 300, top: -80, right: -60, transform: 'rotate(30deg)' }} />
      <Leaf style={{ width: 200, height: 200, bottom: 100, left: -50, transform: 'rotate(-20deg)' }} />
      <Leaf style={{ width: 150, height: 150, top: '40%', right: '5%', transform: 'rotate(60deg)' }} />
      <Leaf style={{ width: 120, height: 120, top: '20%', left: '3%', transform: 'rotate(-45deg)' }} />

      {/* Navbar */}
      <AppBar position="sticky" elevation={0} sx={{
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(46,125,50,0.15)',
        color: 'text.primary',
      }}>
        <Toolbar>
          <LocalFloristIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800, color: 'primary.dark',
            cursor: 'pointer', letterSpacing: '-0.5px' }}
            onClick={() => navigate('/')}>
            HomeFarm
          </Typography>
          {isMobile ? (
            <IconButton onClick={() => setDrawerOpen(true)} color="inherit">
              <MenuIcon />
            </IconButton>
          ) : (
            NAV.map(({ label, path }) => (
              <Button key={path} onClick={() => navigate(path)}
                sx={{
                  mx: 0.5, color: location.pathname === path ? 'primary.main' : 'text.secondary',
                  fontWeight: location.pathname === path ? 700 : 500,
                  borderBottom: location.pathname === path ? '2px solid' : '2px solid transparent',
                  borderRadius: 0, pb: 0.5,
                }}>
                {label}
              </Button>
            ))
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ width: 220, pt: 2 }}>
          {NAV.map(({ label, path }) => (
            <ListItemButton key={path} onClick={() => { navigate(path); setDrawerOpen(false); }}
              selected={location.pathname === path}>
              <ListItemText primary={label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Container component="main" sx={{ mt: 4, mb: 6, flexGrow: 1 }}>
        {children}
      </Container>

      <Box component="footer" sx={{
        py: 2.5, textAlign: 'center',
        background: 'rgba(46,125,50,0.08)',
        borderTop: '1px solid rgba(46,125,50,0.12)',
      }}>
        <Typography variant="body2" color="text.secondary">
          🌱 HomeFarm Planner — grow something beautiful
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;
