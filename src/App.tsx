import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createTheme } from '@mui/material/styles';
import Layout from './components/Layout';
import { GardenProvider } from './context/GardenContext';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import GardenPlanner from './pages/GardenPlanner';
import MyGarden from './pages/MyGarden';
import SeasonalCalendar from './pages/SeasonalCalendar';
import Auth from './pages/Auth';

const theme = createTheme({
  palette: {
    primary: { main: '#2e7d32', light: '#60ad5e', dark: '#005005' },
    secondary: { main: '#f57f17', light: '#ffb04c', dark: '#bc5100' },
    background: { default: 'transparent', paper: 'rgba(255,255,255,0.75)' },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    h3: { fontWeight: 800 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(12px)',
          background: 'rgba(255,255,255,0.72)',
          border: '1px solid rgba(255,255,255,0.5)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12, textTransform: 'none', fontWeight: 600 },
        containedPrimary: {
          background: 'linear-gradient(135deg, #2e7d32 0%, #60ad5e 100%)',
          boxShadow: '0 4px 15px rgba(46,125,50,0.4)',
          '&:hover': { boxShadow: '0 6px 20px rgba(46,125,50,0.5)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <GardenProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/planner" element={<GardenPlanner />} />
                <Route path="/my-garden" element={<MyGarden />} />
                <Route path="/calendar" element={<SeasonalCalendar />} />
                <Route path="/auth" element={<Auth />} />
              </Routes>
            </Layout>
          </GardenProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
