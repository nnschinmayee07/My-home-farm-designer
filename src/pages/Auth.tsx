import { useState } from 'react';
import {
  Box, Typography, TextField, Button, Alert,
  InputAdornment, IconButton, Divider,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';

const MotionBox = motion(Box);

const LEAVES = [
  { top: '8%',  left: '10%', size: 60, rotate: -20, delay: 0 },
  { top: '20%', left: '75%', size: 44, rotate: 30,  delay: 0.3 },
  { top: '55%', left: '5%',  size: 52, rotate: 15,  delay: 0.6 },
  { top: '70%', left: '80%', size: 38, rotate: -35, delay: 0.2 },
  { top: '85%', left: '40%', size: 48, rotate: 10,  delay: 0.5 },
  { top: '40%', left: '60%', size: 34, rotate: -10, delay: 0.8 },
];

const Leaf = ({ top, left, size, rotate, delay }: typeof LEAVES[0]) => (
  <motion.svg
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 0.18, scale: 1, rotate: [rotate, rotate + 8, rotate] }}
    transition={{ delay, duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
    style={{ position: 'absolute', top, left, width: size, height: size, pointerEvents: 'none' }}
    viewBox="0 0 64 64"
  >
    <path d="M32 4 C32 4 8 20 8 40 C8 54 20 60 32 60 C44 60 56 54 56 40 C56 20 32 4 32 4Z" fill="#fff" />
    <line x1="32" y1="10" x2="32" y2="58" stroke="#a5d6a7" strokeWidth="2" />
    <line x1="32" y1="28" x2="20" y2="20" stroke="#a5d6a7" strokeWidth="1.5" />
    <line x1="32" y1="36" x2="44" y2="28" stroke="#a5d6a7" strokeWidth="1.5" />
    <line x1="32" y1="44" x2="22" y2="38" stroke="#a5d6a7" strokeWidth="1.5" />
  </motion.svg>
);

const Auth = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'signin') await login(email, password);
      else await signup(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      position: 'fixed',
      inset: 0,
      zIndex: 1200,
      background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 40%, #388e3c 70%, #66bb6a 100%)',
    }}>
      {/* Left branding panel */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flex: '0 0 48%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        px: 6,
      }}>
        {LEAVES.map((l, i) => <Leaf key={i} {...l} />)}

        <MotionBox
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          sx={{ textAlign: 'center', zIndex: 1 }}
        >
          {/* Logo mark */}
          <Box sx={{ mb: 3 }}>
            <svg width="90" height="90" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r="44" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
              <path d="M45 15 C45 15 20 32 20 52 C20 66 32 74 45 74 C58 74 70 66 70 52 C70 32 45 15 45 15Z" fill="rgba(255,255,255,0.9)" />
              <line x1="45" y1="22" x2="45" y2="72" stroke="#2e7d32" strokeWidth="2.5" />
              <line x1="45" y1="40" x2="33" y2="32" stroke="#2e7d32" strokeWidth="2" />
              <line x1="45" y1="50" x2="57" y2="42" stroke="#2e7d32" strokeWidth="2" />
              <line x1="45" y1="60" x2="35" y2="54" stroke="#2e7d32" strokeWidth="2" />
            </svg>
          </Box>

          <Typography variant="h3" fontWeight={900} sx={{ color: '#fff', lineHeight: 1.1, mb: 1.5 }}>
            HomeFarm
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400, mb: 4 }}>
            Planner
          </Typography>

          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', maxWidth: 320, lineHeight: 1.8 }}>
            Plan your urban garden, track your plants, and grow something beautiful — right from your balcony.
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, mt: 5, justifyContent: 'center' }}>
            {[['🌿', 'Plan'], ['💧', 'Track'], ['🌱', 'Grow']].map(([icon, label]) => (
              <Box key={label} sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: 28 }}>{icon}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        </MotionBox>
      </Box>

      {/* Right form panel */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.97)',
        borderRadius: { md: '32px 0 0 32px' },
        px: { xs: 3, sm: 6 },
        py: 6,
        overflowY: 'auto',
      }}>
        <MotionBox
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          sx={{ width: '100%', maxWidth: 400 }}
        >
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
            <svg width="36" height="36" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r="44" fill="#e8f5e9" />
              <path d="M45 15 C45 15 20 32 20 52 C20 66 32 74 45 74 C58 74 70 66 70 52 C70 32 45 15 45 15Z" fill="#2e7d32" />
              <line x1="45" y1="22" x2="45" y2="72" stroke="#fff" strokeWidth="2.5" />
              <line x1="45" y1="40" x2="33" y2="32" stroke="#fff" strokeWidth="2" />
              <line x1="45" y1="50" x2="57" y2="42" stroke="#fff" strokeWidth="2" />
            </svg>
            <Typography variant="h6" fontWeight={800} color="primary.dark">HomeFarm Planner</Typography>
          </Box>

          <AnimatePresence mode="wait">
            <MotionBox
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5, color: '#1b5e20' }}>
                {mode === 'signin' ? 'Welcome back' : 'Create account'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                {mode === 'signin'
                  ? 'Sign in to continue to your garden'
                  : 'Start planning your urban garden today'}
              </Typography>

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

                  {mode === 'signup' && (
                    <TextField
                      fullWidth label="Your name" value={name}
                      onChange={e => setName(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  )}

                  <TextField
                    fullWidth label="Email address" type="email" value={email}
                    onChange={e => setEmail(e.target.value)} required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  <TextField
                    fullWidth label="Password"
                    type={showPass ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)} required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPass(p => !p)} edge="end" size="small">
                            {showPass ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit" variant="contained" fullWidth size="large"
                    disabled={loading}
                    sx={{
                      mt: 0.5, py: 1.5, borderRadius: 2, fontSize: '1rem',
                      background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                      boxShadow: '0 4px 20px rgba(46,125,50,0.35)',
                      '&:hover': { boxShadow: '0 6px 24px rgba(46,125,50,0.5)' },
                    }}
                  >
                    {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                  </Button>
                </Box>
              </form>

              <Divider sx={{ my: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                </Typography>
              </Divider>

              <Button
                fullWidth variant="outlined" size="large"
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
                sx={{ borderRadius: 2, borderColor: '#2e7d32', color: '#2e7d32',
                  '&:hover': { borderColor: '#1b5e20', background: '#f1f8e9' } }}
              >
                {mode === 'signin' ? 'Create an account' : 'Sign in instead'}
              </Button>
            </MotionBox>
          </AnimatePresence>
        </MotionBox>
      </Box>
    </Box>
  );
};

export default Auth;
