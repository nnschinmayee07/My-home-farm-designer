import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Paper, Chip, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  LinearProgress, Tooltip, Alert, Skeleton, Divider,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import { useGarden } from '../context/GardenContext';

const MotionPaper = motion(Paper);

interface Plant {
  id: number;
  name: string;
  planted_date: string;
  next_watering: string | null;
  harvest_date: string | null;
  watered: boolean;
}

const PLANT_EMOJIS: Record<string, string> = {
  'Cherry Tomatoes': '🍅', 'Basil': '🌿', 'Mint': '🌿', 'Lettuce': '🥬',
  'Spinach': '🥗', 'Peppers': '🫑', 'Zucchini': '🥒', 'Kale': '🥦',
  'Strawberries': '🍓', 'Rosemary': '🌱', 'Parsley': '🌿', 'Chives': '🌱',
  'Cilantro': '🌿', 'Sunflower': '🌻', 'Ferns': '🌿', 'Hostas': '🍃',
  'Watercress': '🥗',
};

function getEmoji(name: string) {
  return PLANT_EMOJIS[name] ?? '🌱';
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

function harvestProgress(plantedDate: string, harvestDate: string | null): number {
  if (!harvestDate) return 0;
  const total = new Date(harvestDate).getTime() - new Date(plantedDate).getTime();
  const elapsed = Date.now() - new Date(plantedDate).getTime();
  return Math.min(Math.max((elapsed / total) * 100, 0), 100);
}

// Fallback mock data when API is unavailable
const MOCK_PLANTS: Plant[] = [
  { id: 1, name: 'Cherry Tomatoes', planted_date: '2026-02-01', next_watering: '2026-03-21', harvest_date: '2026-05-01', watered: false },
  { id: 2, name: 'Basil', planted_date: '2026-02-15', next_watering: '2026-03-20', harvest_date: null, watered: true },
  { id: 3, name: 'Mint', planted_date: '2026-01-20', next_watering: '2026-03-22', harvest_date: null, watered: false },
];

const MyGarden = () => {
  const { plants, addPlant, removePlant, updatePlant, setPlants } = useGarden();
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPlant, setNewPlant] = useState({ name: '', planted_date: '', harvest_date: '' });
  const [confettiPlant, setConfettiPlant] = useState<string | null>(null);

  const fetchPlants = useCallback(async () => {
    // Only fetch from API if context is empty (first load)
    if (plants.length > 0) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/plants');
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      setPlants(data);
      setUsingMock(false);
    } catch {
      setPlants(MOCK_PLANTS);
      setUsingMock(true);
    }
    setLoading(false);
  }, [plants.length, setPlants]);

  useEffect(() => { fetchPlants(); }, [fetchPlants]);

  const handleWater = async (plant: Plant) => {
    updatePlant(plant.id, { watered: true });
    try {
      await fetch(`/api/plants?id=${plant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watered: true }),
      });
    } catch { /* local update already applied */ }
  };

  const handleDelete = async (id: number) => {
    removePlant(id);
    try {
      await fetch(`/api/plants?id=${id}`, { method: 'DELETE' });
    } catch { /* local update already applied */ }
  };

  const handleHarvest = (name: string) => {
    setConfettiPlant(name);
    setTimeout(() => setConfettiPlant(null), 4000);
  };

  const handleAddPlant = async () => {
    if (!newPlant.name || !newPlant.planted_date) return;
    const nextWater = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
    const payload = {
      name: newPlant.name,
      planted_date: newPlant.planted_date,
      next_watering: nextWater,
      harvest_date: newPlant.harvest_date || null,
    };
    let entry = { id: Date.now(), ...payload, watered: false };
    try {
      const res = await fetch('/api/plants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        entry = { ...entry, id: created.id };
      }
    } catch { /* use local entry */ }
    addPlant(entry);
    setDialogOpen(false);
    setNewPlant({ name: '', planted_date: '', harvest_date: '' });
  };

  const needsWater = plants.filter(p => !p.watered);
  const readyToHarvest = plants.filter(p => {
    const d = daysUntil(p.harvest_date);
    return d !== null && d <= 7;
  });

  return (
    <Box>
      {/* Harvest celebration */}
      <AnimatePresence>
        {confettiPlant && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }} style={{ position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)', zIndex: 9999, textAlign: 'center',
              background: 'rgba(255,255,255,0.95)', padding: 32, borderRadius: 24,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <Typography fontSize={72}>🎉</Typography>
            <Typography variant="h5" fontWeight={800}>Harvest Time!</Typography>
            <Typography color="text.secondary">{confettiPlant} is ready to pick!</Typography>
          </motion.div>
        )}
      </AnimatePresence>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>My Garden 🌻</Typography>
          <Typography color="text.secondary">Track your plants, watering, and harvests</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Add Plant
        </Button>
      </Box>

      {usingMock && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Running with demo data — connect your NeonDB to persist plants.
        </Alert>
      )}

      {/* Alert banners */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {needsWater.length > 0 && (
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2, background: 'rgba(21,101,192,0.08)', border: '1px solid rgba(21,101,192,0.2)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WaterDropIcon sx={{ color: '#1565c0' }} />
                <Typography fontWeight={600}>{needsWater.length} plant{needsWater.length > 1 ? 's' : ''} need watering</Typography>
              </Box>
            </Paper>
          </Grid>
        )}
        {readyToHarvest.length > 0 && (
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2, background: 'rgba(245,127,23,0.08)', border: '1px solid rgba(245,127,23,0.2)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AgricultureIcon sx={{ color: '#f57f17' }} />
                <Typography fontWeight={600}>{readyToHarvest.length} plant{readyToHarvest.length > 1 ? 's' : ''} ready to harvest soon!</Typography>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Grid container spacing={3}>
        {/* Plant cards */}
        <Grid item xs={12} md={8}>
          {loading ? (
            <Grid container spacing={2}>
              {[1, 2, 3].map(i => <Grid item xs={12} key={i}><Skeleton variant="rounded" height={140} /></Grid>)}
            </Grid>
          ) : plants.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <EmojiNatureIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No plants yet</Typography>
              <Typography color="text.disabled" sx={{ mb: 3 }}>Add your first plant or use the Garden Planner</Typography>
              <Button variant="outlined" onClick={() => setDialogOpen(true)} startIcon={<AddIcon />}>Add Plant</Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              <AnimatePresence>
                {plants.map((plant, i) => {
                  const waterDays = daysUntil(plant.next_watering);
                  const harvestDays = daysUntil(plant.harvest_date);
                  const progress = harvestProgress(plant.planted_date, plant.harvest_date);
                  const isHarvestSoon = harvestDays !== null && harvestDays <= 7;

                  return (
                    <Grid item xs={12} key={plant.id}>
                      <MotionPaper
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -2 }}
                        sx={{ p: 2.5, border: isHarvestSoon ? '1px solid rgba(245,127,23,0.4)' : undefined }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <Typography fontSize={40}>{getEmoji(plant.name)}</Typography>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography fontWeight={700} fontSize="1.1rem">{plant.name}</Typography>
                              {plant.watered && <Chip label="Watered ✓" size="small" color="success" />}
                              {isHarvestSoon && <Chip label="🌾 Harvest soon!" size="small" color="warning" />}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Planted {new Date(plant.planted_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Typography>
                            {plant.harvest_date && (
                              <Box sx={{ mt: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">Growth progress</Typography>
                                  <Typography variant="caption" color="text.secondary">{Math.round(progress)}%</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={progress}
                                  color={progress >= 90 ? 'warning' : 'primary'}
                                  sx={{ borderRadius: 4, height: 6 }} />
                                <Typography variant="caption" color="text.secondary">
                                  {harvestDays !== null && harvestDays > 0
                                    ? `Harvest in ${harvestDays} days`
                                    : harvestDays !== null && harvestDays <= 0
                                    ? '🌾 Ready to harvest!'
                                    : ''}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            {waterDays !== null && (
                              <Chip
                                icon={<WaterDropIcon />}
                                label={waterDays <= 0 ? 'Water now!' : `Water in ${waterDays}d`}
                                color={waterDays <= 0 ? 'error' : waterDays <= 2 ? 'warning' : 'default'}
                                size="small"
                              />
                            )}
                            {!plant.watered && (
                              <Tooltip title="Mark as watered">
                                <IconButton size="small" color="primary" onClick={() => handleWater(plant)}>
                                  <WaterDropIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            {isHarvestSoon && (
                              <Tooltip title="Celebrate harvest!">
                                <IconButton size="small" color="warning" onClick={() => handleHarvest(plant.name)}>
                                  <AgricultureIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Remove plant">
                              <IconButton size="small" color="error" onClick={() => handleDelete(plant.id)}>
                                <DeleteOutlineIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </MotionPaper>
                    </Grid>
                  );
                })}
              </AnimatePresence>
            </Grid>
          )}
        </Grid>

        {/* Stats sidebar */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2} direction="column">
            {[
              { icon: <LocalFloristIcon sx={{ color: 'primary.main' }} />, label: 'Total Plants', value: plants.length, color: 'rgba(46,125,50,0.08)' },
              { icon: <WaterDropIcon sx={{ color: '#1565c0' }} />, label: 'Need Watering', value: needsWater.length, color: 'rgba(21,101,192,0.08)' },
              { icon: <AgricultureIcon sx={{ color: '#f57f17' }} />, label: 'Harvest Soon', value: readyToHarvest.length, color: 'rgba(245,127,23,0.08)' },
              { icon: <CheckCircleIcon sx={{ color: 'success.main' }} />, label: 'Watered Today', value: plants.filter(p => p.watered).length, color: 'rgba(46,125,50,0.06)' },
            ].map(({ icon, label, value, color }) => (
              <Grid item key={label}>
                <Paper sx={{ p: 2.5, background: color, border: 'none' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {icon}
                    <Box>
                      <Typography variant="h4" fontWeight={800}>{value}</Typography>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}

            <Grid item>
              <Paper sx={{ p: 2.5 }}>
                <Typography fontWeight={700} sx={{ mb: 1.5 }}>🌿 Quick Tips</Typography>
                <Divider sx={{ mb: 1.5 }} />
                {[
                  'Water in the morning to reduce evaporation',
                  'Check soil moisture before watering',
                  'Rotate pots for even sunlight exposure',
                ].map((tip, i) => (
                  <Typography key={i} variant="body2" color="text.secondary" sx={{ mb: 1, pl: 1,
                    borderLeft: '2px solid', borderColor: 'primary.light' }}>
                    {tip}
                  </Typography>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Add plant dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>🌱 Add a New Plant</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Plant Name" value={newPlant.name}
                onChange={e => setNewPlant(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Cherry Tomatoes" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Date Planted" type="date" value={newPlant.planted_date}
                onChange={e => setNewPlant(p => ({ ...p, planted_date: e.target.value }))}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Expected Harvest (optional)" type="date" value={newPlant.harvest_date}
                onChange={e => setNewPlant(p => ({ ...p, harvest_date: e.target.value }))}
                InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleAddPlant}
            disabled={!newPlant.name || !newPlant.planted_date}>
            Add Plant
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyGarden;
