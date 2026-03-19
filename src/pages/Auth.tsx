import { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert, Tabs, Tab, InputAdornment, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import { useAuth } from '../context/AuthContext';

const MotionPaper = motion(Paper);

const Auth = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (tab === 0) await login(email, password);
      else await signup(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <MotionPaper
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        sx={{ p: 4, width: '100%', maxWidth: 420 }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <LocalFloristIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" fontWeight={800}>Welcome to HomeFarm</Typography>
          <Typography variant="body2" color="text.secondary">Sign in to save your garden</Typography>
        </Box>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 3 }}>
          <Tab label="Sign In" />
          <Tab label="Sign Up" />
        </Tabs>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField fullWidth label="Email" type="email" value={email}
              onChange={e => setEmail(e.target.value)} required />
            <TextField fullWidth label="Password" type={showPass ? 'text' : 'password'}
              value={password} onChange={e => setPassword(e.target.value)} required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(p => !p)} edge="end">
                      {showPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }} />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
              {loading ? 'Please wait...' : tab === 0 ? 'Sign In' : 'Create Account'}
            </Button>
          </Box>
        </form>
      </MotionPaper>
    </Box>
  );
};

export default Auth;
