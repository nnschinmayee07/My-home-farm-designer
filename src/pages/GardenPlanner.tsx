import { useState } from 'react';
import {
  Box, TextField, Button, Typography, Paper, Grid, Chip,
  Divider, Alert, ToggleButtonGroup, ToggleButton, LinearProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import NightlightIcon from '@mui/icons-material/Nightlight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BalconyIcon from '@mui/icons-material/Balcony';
import RoofingIcon from '@mui/icons-material/Roofing';
import WindowIcon from '@mui/icons-material/Window';
import YardIcon from '@mui/icons-material/Yard';
import { useGarden } from '../context/GardenContext';

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

interface GardenSpace { width: number; length: number; sunlight: string; location: string }

interface Plant {
  name: string; emoji: string; spacing: number;
  daysToHarvest: number; waterFrequency: string;
  difficulty: 'Easy' | 'Medium' | 'Hard'; tags: string[];
  locations: string[]; // which location types this plant suits
}

const ALL_PLANTS: Plant[] = [
  { name: 'Cherry Tomatoes', emoji: '🍅', spacing: 50, daysToHarvest: 65, waterFrequency: 'Every 2 days', difficulty: 'Easy', tags: ['Vegetable', 'Fruiting'], locations: ['balcony', 'terrace', 'rooftop'] },
  { name: 'Basil', emoji: '🌿', spacing: 20, daysToHarvest: 30, waterFrequency: 'Every 2 days', difficulty: 'Easy', tags: ['Herb'], locations: ['balcony', 'terrace', 'rooftop', 'windowsill'] },
  { name: 'Peppers', emoji: '🫑', spacing: 45, daysToHarvest: 75, waterFrequency: 'Every 2 days', difficulty: 'Medium', tags: ['Vegetable'], locations: ['balcony', 'terrace', 'rooftop'] },
  { name: 'Zucchini', emoji: '🥒', spacing: 60, daysToHarvest: 55, waterFrequency: 'Every 2 days', difficulty: 'Easy', tags: ['Vegetable'], locations: ['terrace', 'rooftop'] },
  { name: 'Sunflower', emoji: '🌻', spacing: 30, daysToHarvest: 80, waterFrequency: 'Every 3 days', difficulty: 'Easy', tags: ['Flower'], locations: ['balcony', 'terrace', 'rooftop'] },
  { name: 'Rosemary', emoji: '🌱', spacing: 40, daysToHarvest: 90, waterFrequency: 'Weekly', difficulty: 'Easy', tags: ['Herb'], locations: ['balcony', 'terrace', 'rooftop', 'windowsill'] },
  { name: 'Lettuce', emoji: '🥬', spacing: 25, daysToHarvest: 45, waterFrequency: 'Daily', difficulty: 'Easy', tags: ['Vegetable', 'Leafy'], locations: ['balcony', 'terrace', 'rooftop', 'windowsill'] },
  { name: 'Spinach', emoji: '🥗', spacing: 15, daysToHarvest: 40, waterFrequency: 'Daily', difficulty: 'Easy', tags: ['Vegetable', 'Leafy'], locations: ['balcony', 'terrace', 'windowsill'] },
  { name: 'Mint', emoji: '🌿', spacing: 30, daysToHarvest: 30, waterFrequency: 'Every 2 days', difficulty: 'Easy', tags: ['Herb'], locations: ['balcony', 'terrace', 'rooftop', 'windowsill'] },
  { name: 'Kale', emoji: '🥦', spacing: 35, daysToHarvest: 55, waterFrequency: 'Every 2 days', difficulty: 'Easy', tags: ['Vegetable', 'Leafy'], locations: ['balcony', 'terrace', 'rooftop'] },
  { name: 'Parsley', emoji: '🌿', spacing: 20, daysToHarvest: 70, waterFrequency: 'Every 2 days', difficulty: 'Medium', tags: ['Herb'], locations: ['balcony', 'windowsill'] },
  { name: 'Strawberries', emoji: '🍓', spacing: 30, daysToHarvest: 60, waterFrequency: 'Every 2 days', difficulty: 'Medium', tags: ['Fruit'], locations: ['balcony', 'terrace', 'rooftop'] },
  { name: 'Chives', emoji: '🌱', spacing: 15, daysToHarvest: 30, waterFrequency: 'Every 3 days', difficulty: 'Easy', tags: ['Herb'], locations: ['balcony', 'windowsill'] },
  { name: 'Cilantro', emoji: '🌿', spacing: 15, daysToHarvest: 45, waterFrequency: 'Every 2 days', difficulty: 'Easy', tags: ['Herb'], locations: ['balcony', 'terrace', 'windowsill'] },
  { name: 'Watercress', emoji: '🥗', spacing: 20, daysToHarvest: 40, waterFrequency: 'Daily', difficulty: 'Medium', tags: ['Vegetable'], locations: ['balcony', 'terrace'] },
  { name: 'Ferns', emoji: '🌿', spacing: 40, daysToHarvest: 0, waterFrequency: 'Every 3 days', difficulty: 'Easy', tags: ['Ornamental'], locations: ['balcony', 'windowsill'] },
  { name: 'Hostas', emoji: '🍃', spacing: 50, daysToHarvest: 0, waterFrequency: 'Weekly', difficulty: 'Easy', tags: ['Ornamental'], locations: ['terrace', 'rooftop'] },
  { name: 'Microgreens', emoji: '🌱', spacing: 5, daysToHarvest: 14, waterFrequency: 'Daily', difficulty: 'Easy', tags: ['Vegetable', 'Leafy'], locations: ['windowsill'] },
  { name: 'Thyme', emoji: '🌿', spacing: 25, daysToHarvest: 60, waterFrequency: 'Weekly', difficulty: 'Easy', tags: ['Herb'], locations: ['balcony', 'windowsill', 'terrace'] },
];

const SUNLIGHT_FILTER: Record<string, string[]> = {
  full: ['Cherry Tomatoes', 'Basil', 'Peppers', 'Zucchini', 'Sunflower', 'Rosemary', 'Strawberries', 'Thyme'],
  partial: ['Lettuce', 'Spinach', 'Mint', 'Kale', 'Parsley', 'Strawberries', 'Cilantro', 'Chives', 'Microgreens', 'Thyme'],
  shade: ['Ferns', 'Chives', 'Cilantro', 'Hostas', 'Watercress', 'Mint', 'Parsley', 'Microgreens'],
};

const LOCATIONS = [
  { value: 'balcony', label: 'Balcony', icon: <BalconyIcon /> },
  { value: 'terrace', label: 'Terrace', icon: <YardIcon /> },
  { value: 'rooftop', label: 'Rooftop', icon: <RoofingIcon /> },
  { value: 'windowsill', label: 'Windowsill', icon: <WindowIcon /> },
];

const difficultyColor: Record<string, 'success' | 'warning' | 'error'> = {
  Easy: 'success', Medium: 'warning', Hard: 'error',
};

function calcPlantCount(areaSqM: number, spacingCm: number): number {
  const spacingM = spacingCm / 100;
  return Math.max(1, Math.floor(areaSqM / (spacingM * spacingM)));
}

const GardenPlanner = () => {
  const navigate = useNavigate();
  const { addPlant } = useGarden();
  const [space, setSpace] = useState<GardenSpace>({ width: 0, length: 0, sunlight: '', location: '' });
  const [recommendations, setRecommendations] = useState<Plant[]>([]);
  const [generated, setGenerated] = useState(false);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const area = space.width * space.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bySunlight = new Set(SUNLIGHT_FILTER[space.sunlight] ?? []);
    const filtered = ALL_PLANTS.filter(p =>
      bySunlight.has(p.name) &&
      (space.location === '' || p.locations.includes(space.location))
    );
    setRecommendations(filtered);
    setGenerated(true);
    setAdded(new Set());
  };

  const handleAddToGarden = async (plant: Plant) => {
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    const harvest = plant.daysToHarvest > 0
      ? new Date(Date.now() + plant.daysToHarvest * 86400000).toISOString().split('T')[0]
      : null;
    const nextWater = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

    let newEntry = { id: Date.now(), name: plant.name, planted_date: today, next_watering: nextWater, harvest_date: harvest, watered: false };

    try {
      const res = await fetch('/api/plants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: plant.name, planted_date: today, next_watering: nextWater, harvest_date: harvest }),
      });
      if (res.ok) {
        const created = await res.json();
        newEntry = { ...newEntry, id: created.id };
      }
    } catch { /* use local entry */ }

    addPlant(newEntry);
    setAdded(prev => new Set(prev).add(plant.name));
    setSaveMsg(`${plant.emoji} ${plant.name} added!`);
    setTimeout(() => setSaveMsg(''), 2500);
    setSaving(false);
  };

  const addedCount = added.size;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
        Design Your Garden Space 🌿
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Tell us about your space and we'll find the perfect plants for you.
      </Typography>

      <Grid container spacing={4}>
        {/* Form */}
        <Grid item xs={12} md={5}>
          <MotionPaper initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>

                {/* Location type */}
                <Grid item xs={12}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>Space Type</Typography>
                  <ToggleButtonGroup value={space.location} exclusive fullWidth
                    onChange={(_e: React.MouseEvent<HTMLElement>, val: string) =>
                      val !== null && setSpace(p => ({ ...p, location: val }))}>
                    {LOCATIONS.map(({ value, label, icon }) => (
                      <ToggleButton key={value} value={value} sx={{ flexDirection: 'column', py: 1.5, gap: 0.5, flex: 1 }}>
                        {icon}
                        <Typography variant="caption">{label}</Typography>
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Grid>

                {/* Dimensions */}
                <Grid item xs={6}>
                  <TextField fullWidth label="Width (m)" type="number"
                    value={space.width || ''}
                    onChange={e => setSpace(p => ({ ...p, width: +e.target.value }))}
                    inputProps={{ min: 0.1, step: 0.1 }} required />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Length (m)" type="number"
                    value={space.length || ''}
                    onChange={e => setSpace(p => ({ ...p, length: +e.target.value }))}
                    inputProps={{ min: 0.1, step: 0.1 }} required />
                </Grid>

                {area > 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, borderRadius: 2, background: 'rgba(46,125,50,0.08)', textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={700} color="primary.dark">{area.toFixed(1)} m²</Typography>
                      <Typography variant="body2" color="text.secondary">Total garden area</Typography>
                    </Box>
                  </Grid>
                )}

                {/* Sunlight */}
                <Grid item xs={12}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>Sunlight</Typography>
                  <ToggleButtonGroup value={space.sunlight} exclusive fullWidth
                    onChange={(_e: React.MouseEvent<HTMLElement>, val: string) =>
                      val !== null && setSpace(p => ({ ...p, sunlight: val }))}>
                    <ToggleButton value="full" sx={{ flexDirection: 'column', py: 1.5, gap: 0.5 }}>
                      <WbSunnyIcon sx={{ color: '#f57f17' }} />
                      <Typography variant="caption">Full Sun</Typography>
                    </ToggleButton>
                    <ToggleButton value="partial" sx={{ flexDirection: 'column', py: 1.5, gap: 0.5 }}>
                      <FilterDramaIcon sx={{ color: '#78909c' }} />
                      <Typography variant="caption">Partial</Typography>
                    </ToggleButton>
                    <ToggleButton value="shade" sx={{ flexDirection: 'column', py: 1.5, gap: 0.5 }}>
                      <NightlightIcon sx={{ color: '#5c6bc0' }} />
                      <Typography variant="caption">Shade</Typography>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>

                <Grid item xs={12}>
                  <Button type="submit" variant="contained" fullWidth size="large"
                    disabled={!space.sunlight || !space.location || area <= 0}>
                    Generate Recommendations ✨
                  </Button>
                </Grid>
              </Grid>
            </form>
          </MotionPaper>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={7}>
          <AnimatePresence>
            {saveMsg && (
              <MotionBox initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} sx={{ mb: 2 }}>
                <Alert severity="success" icon={<CheckCircleIcon />}>{saveMsg}</Alert>
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Go to My Garden CTA — shows once at least one plant is added */}
          <AnimatePresence>
            {addedCount > 0 && (
              <MotionBox
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                sx={{ mb: 2 }}
              >
                <Paper sx={{
                  p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'linear-gradient(135deg, rgba(46,125,50,0.12), rgba(96,173,94,0.08))',
                  border: '1px solid rgba(46,125,50,0.25)', flexWrap: 'wrap', gap: 1,
                }}>
                  <Typography fontWeight={600}>
                    🌱 {addedCount} plant{addedCount > 1 ? 's' : ''} added to your garden
                  </Typography>
                  <Button variant="contained" endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/my-garden')} size="small">
                    Go to My Garden
                  </Button>
                </Paper>
              </MotionBox>
            )}
          </AnimatePresence>

          {!generated ? (
            <Paper sx={{ p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
              <Typography fontSize={64}>🌱</Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                Select your space type, dimensions, and sunlight to get recommendations
              </Typography>
            </Paper>
          ) : recommendations.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', minHeight: 200, display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography fontSize={48}>🤔</Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                No exact matches — try a different sunlight or location combo
              </Typography>
            </Paper>
          ) : (
            <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                {recommendations.length} plants for your{' '}
                {space.sunlight === 'full' ? '☀️' : space.sunlight === 'partial' ? '⛅' : '🌙'}{' '}
                {LOCATIONS.find(l => l.value === space.location)?.label} ({area.toFixed(1)}m²)
              </Typography>
              <Grid container spacing={2}>
                {recommendations.map((plant, i) => {
                  const count = calcPlantCount(area, plant.spacing);
                  const isAdded = added.has(plant.name);
                  return (
                    <Grid item xs={12} sm={6} key={plant.name}>
                      <MotionPaper
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }} whileHover={{ y: -3 }}
                        sx={{ p: 2.5 }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography fontSize={32}>{plant.emoji}</Typography>
                            <Typography fontWeight={700}>{plant.name}</Typography>
                          </Box>
                          <Chip label={plant.difficulty} color={difficultyColor[plant.difficulty]} size="small" />
                        </Box>
                        <Divider sx={{ my: 1.5 }} />
                        <Grid container spacing={1} sx={{ mb: 1.5 }}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Fits in space</Typography>
                            <Typography fontWeight={700} color="primary.dark">{count} plants</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">Watering</Typography>
                            <Typography fontWeight={600} fontSize="0.85rem">{plant.waterFrequency}</Typography>
                          </Grid>
                          {plant.daysToHarvest > 0 && (
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary">Days to harvest</Typography>
                              <LinearProgress variant="determinate"
                                value={Math.min((plant.daysToHarvest / 90) * 100, 100)}
                                sx={{ mt: 0.5, borderRadius: 4, height: 6 }} />
                              <Typography variant="caption" color="text.secondary">{plant.daysToHarvest} days</Typography>
                            </Grid>
                          )}
                        </Grid>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                          {plant.tags.map(t => (
                            <Chip key={t} label={t} size="small" variant="outlined"
                              sx={{ fontSize: '0.65rem', height: 20 }} />
                          ))}
                        </Box>
                        <Button fullWidth variant={isAdded ? 'outlined' : 'contained'}
                          color={isAdded ? 'success' : 'primary'}
                          startIcon={isAdded ? <CheckCircleIcon /> : <AddCircleOutlineIcon />}
                          onClick={() => !isAdded && handleAddToGarden(plant)}
                          disabled={saving || isAdded} size="small">
                          {isAdded ? 'Added ✓' : 'Add to My Garden'}
                        </Button>
                      </MotionPaper>
                    </Grid>
                  );
                })}
              </Grid>
            </MotionBox>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default GardenPlanner;
