import { Box, Typography, Button, Grid, Paper, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import YardIcon from '@mui/icons-material/Yard';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import SpaIcon from '@mui/icons-material/Spa';
import WaterDropIcon from '@mui/icons-material/WaterDrop';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const features = [
  {
    icon: <YardIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Space Optimizer',
    desc: 'Enter your dimensions and get smart layout suggestions that maximize every square meter.',
    tag: 'Planner',
  },
  {
    icon: <WbSunnyIcon sx={{ fontSize: 40, color: '#f57f17' }} />,
    title: 'Sunlight Matching',
    desc: 'Plants recommended based on your exact sunlight conditions — full sun, partial, or shade.',
    tag: 'Smart',
  },
  {
    icon: <WaterDropIcon sx={{ fontSize: 40, color: '#1565c0' }} />,
    title: 'Watering Tracker',
    desc: 'Never forget to water again. Track schedules and mark plants as watered with one tap.',
    tag: 'Tracker',
  },
  {
    icon: <SpaIcon sx={{ fontSize: 40, color: '#2e7d32' }} />,
    title: 'Harvest Calendar',
    desc: 'Know exactly when your plants are ready to harvest based on planting dates.',
    tag: 'Calendar',
  },
];

const stats = [
  { value: '50+', label: 'Plant varieties' },
  { value: '3', label: 'Sunlight modes' },
  { value: '100%', label: 'Free to use' },
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.email?.split('@')[0] ?? '';

  return (
    <Box>
      {/* Hero */}
      <MotionBox
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        sx={{ textAlign: 'center', mb: 8, pt: 4 }}
      >
        <Chip label="🌿 Urban Gardening Made Simple" sx={{ mb: 3, px: 1, fontWeight: 600,
          background: 'rgba(46,125,50,0.1)', color: 'primary.dark' }} />
        <Typography variant="h3" component="h1" gutterBottom
          sx={{ background: 'linear-gradient(135deg, #1b5e20, #60ad5e)', WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
          {user ? `Welcome back, ${firstName}! 🌿` : 'Grow Your Perfect'}<br />
          {user ? 'Your garden awaits.' : 'Urban Garden'}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 520, mx: 'auto', fontWeight: 400 }}>
          Plan, track, and harvest — all in one place. No garden too small.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="contained" size="large" onClick={() => navigate('/planner')}
            sx={{ px: 4, py: 1.5, fontSize: '1rem' }}>
            Start Planning 🌱
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate('/my-garden')}
            sx={{ px: 4, py: 1.5, fontSize: '1rem', borderColor: 'primary.main', color: 'primary.main' }}>
            My Garden 🪴
          </Button>
        </Box>

        {/* Stats row */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 5, mt: 6, flexWrap: 'wrap' }}>
          {stats.map(({ value, label }) => (
            <Box key={label} sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.dark' }}>{value}</Typography>
              <Typography variant="body2" color="text.secondary">{label}</Typography>
            </Box>
          ))}
        </Box>
      </MotionBox>

      {/* Feature cards */}
      <Grid container spacing={3}>
        {features.map(({ icon, title, desc, tag }, i) => (
          <Grid item xs={12} sm={6} md={3} key={title}>
            <MotionPaper
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(46,125,50,0.18)' }}
              sx={{ p: 3, height: '100%', cursor: 'default' }}
            >
              <Box sx={{ mb: 2 }}>{icon}</Box>
              <Chip label={tag} size="small" sx={{ mb: 1.5, fontSize: '0.7rem',
                background: 'rgba(46,125,50,0.1)', color: 'primary.dark' }} />
              <Typography variant="h6" gutterBottom>{title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{desc}</Typography>
            </MotionPaper>
          </Grid>
        ))}
      </Grid>

      {/* CTA banner */}
      <MotionPaper
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        sx={{
          mt: 6, p: 5, textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(46,125,50,0.15) 0%, rgba(96,173,94,0.1) 100%)',
          border: '1px solid rgba(46,125,50,0.2)',
        }}
      >
        <Typography variant="h5" gutterBottom fontWeight={700}>Ready to start growing?</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Tell us about your space and we'll suggest the perfect plants for you.
        </Typography>
        <Button variant="contained" size="large" onClick={() => navigate('/planner')} sx={{ px: 5 }}>
          Design My Garden
        </Button>
      </MotionPaper>
    </Box>
  );
};

export default Home;
