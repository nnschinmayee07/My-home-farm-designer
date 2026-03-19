import { useState } from 'react';
import { Box, Typography, Paper, Grid, Chip, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

interface PlantSeason {
  name: string; emoji: string; sow: number[]; harvest: number[]; tag: string; tip: string;
}

const CALENDAR: PlantSeason[] = [
  { name: 'Tomatoes', emoji: '🍅', sow: [2,3,4], harvest: [6,7,8,9], tag: 'Vegetable', tip: 'Start indoors 6-8 weeks before last frost' },
  { name: 'Basil', emoji: '🌿', sow: [3,4,5], harvest: [5,6,7,8,9], tag: 'Herb', tip: 'Pinch flowers to keep leaves coming' },
  { name: 'Lettuce', emoji: '🥬', sow: [2,3,4,8,9], harvest: [4,5,6,9,10,11], tag: 'Leafy', tip: 'Grows in cool weather, bolt-resistant varieties for summer' },
  { name: 'Spinach', emoji: '🥗', sow: [2,3,8,9], harvest: [4,5,9,10,11], tag: 'Leafy', tip: 'Harvest outer leaves to extend the season' },
  { name: 'Peppers', emoji: '🫑', sow: [2,3], harvest: [7,8,9,10], tag: 'Vegetable', tip: 'Needs warm soil — wait until after last frost' },
  { name: 'Mint', emoji: '🌿', sow: [3,4,5], harvest: [5,6,7,8,9,10], tag: 'Herb', tip: 'Grow in containers to prevent spreading' },
  { name: 'Strawberries', emoji: '🍓', sow: [2,3,4], harvest: [5,6,7], tag: 'Fruit', tip: 'Remove runners for bigger berries' },
  { name: 'Kale', emoji: '🥦', sow: [2,3,7,8], harvest: [4,5,6,9,10,11,12], tag: 'Leafy', tip: 'Frost improves the flavour' },
  { name: 'Zucchini', emoji: '🥒', sow: [4,5], harvest: [6,7,8,9], tag: 'Vegetable', tip: 'Harvest small for best taste' },
  { name: 'Sunflower', emoji: '🌻', sow: [4,5,6], harvest: [8,9,10], tag: 'Flower', tip: 'Plant in full sun, faces east in morning' },
  { name: 'Rosemary', emoji: '🌱', sow: [2,3,4], harvest: [4,5,6,7,8,9,10,11], tag: 'Herb', tip: 'Drought tolerant once established' },
  { name: 'Chives', emoji: '🌱', sow: [2,3,4], harvest: [4,5,6,7,8,9,10], tag: 'Herb', tip: 'Cut to 2cm above soil to regrow' },
  { name: 'Cilantro', emoji: '🌿', sow: [3,4,5,8,9], harvest: [5,6,7,9,10,11], tag: 'Herb', tip: 'Sow every 3 weeks for continuous harvest' },
  { name: 'Microgreens', emoji: '🌱', sow: [0,1,2,3,4,5,6,7,8,9,10,11], harvest: [0,1,2,3,4,5,6,7,8,9,10,11], tag: 'Leafy', tip: 'Ready in 7-14 days, grow year-round indoors' },
  { name: 'Thyme', emoji: '🌿', sow: [2,3,4], harvest: [4,5,6,7,8,9,10], tag: 'Herb', tip: 'Harvest before flowering for best flavour' },
];

const TAG_COLORS: Record<string, string> = {
  Vegetable: '#e8f5e9', Herb: '#f3e5f5', Leafy: '#e3f2fd', Fruit: '#fff3e0', Flower: '#fce4ec',
};

const currentMonth = new Date().getMonth();

const SeasonalCalendar = () => {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [filter, setFilter] = useState('all');

  const tags = ['all', ...Array.from(new Set(CALENDAR.map(p => p.tag)))];

  const sowNow = CALENDAR.filter(p =>
    p.sow.includes(selectedMonth) && (filter === 'all' || p.tag === filter)
  );
  const harvestNow = CALENDAR.filter(p =>
    p.harvest.includes(selectedMonth) && (filter === 'all' || p.tag === filter)
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>Seasonal Planting Calendar 📅</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Know exactly what to sow and harvest each month.
      </Typography>

      {/* Month selector */}
      <Paper sx={{ p: 2, mb: 3, overflowX: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 1, minWidth: 'max-content' }}>
          {MONTHS.map((m, i) => (
            <Box key={m} onClick={() => setSelectedMonth(i)}
              sx={{
                px: 2, py: 1, borderRadius: 2, cursor: 'pointer', fontWeight: 600,
                fontSize: '0.85rem', transition: 'all 0.2s',
                background: selectedMonth === i
                  ? 'linear-gradient(135deg, #2e7d32, #60ad5e)'
                  : i === currentMonth ? 'rgba(46,125,50,0.1)' : 'transparent',
                color: selectedMonth === i ? 'white' : i === currentMonth ? 'primary.dark' : 'text.secondary',
                border: i === currentMonth && selectedMonth !== i ? '1px solid rgba(46,125,50,0.3)' : '1px solid transparent',
                '&:hover': { background: selectedMonth === i ? undefined : 'rgba(46,125,50,0.08)' },
              }}>
              {m}
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Tag filter */}
      <ToggleButtonGroup value={filter} exclusive sx={{ mb: 3, flexWrap: 'wrap', gap: 0.5 }}
        onChange={(_e, v) => v && setFilter(v)}>
        {tags.map(t => (
          <ToggleButton key={t} value={t} sx={{ borderRadius: '20px !important', px: 2, py: 0.5,
            fontSize: '0.8rem', textTransform: 'capitalize', border: '1px solid rgba(0,0,0,0.12) !important' }}>
            {t}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Grid container spacing={3}>
        {/* Sow now */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            🌱 Sow in {MONTHS[selectedMonth]} ({sowNow.length})
          </Typography>
          {sowNow.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              Nothing to sow this month for this filter
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {sowNow.map((plant, i) => (
                <MotionPaper key={plant.name}
                  initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  sx={{ p: 2, background: TAG_COLORS[plant.tag] ?? 'rgba(255,255,255,0.72)' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography fontSize={28}>{plant.emoji}</Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight={700}>{plant.name}</Typography>
                        <Chip label={plant.tag} size="small" sx={{ fontSize: '0.65rem', height: 18 }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">💡 {plant.tip}</Typography>
                    </Box>
                    {/* Harvest months indicator */}
                    <Box sx={{ display: 'flex', gap: 0.3, flexWrap: 'wrap', maxWidth: 100 }}>
                      {plant.harvest.map(m => (
                        <Box key={m} sx={{ fontSize: '0.6rem', px: 0.5, py: 0.2, borderRadius: 1,
                          background: 'rgba(245,127,23,0.15)', color: '#bc5100', fontWeight: 600 }}>
                          {MONTHS[m]}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </MotionPaper>
              ))}
            </Box>
          )}
        </Grid>

        {/* Harvest now */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            🌾 Harvest in {MONTHS[selectedMonth]} ({harvestNow.length})
          </Typography>
          {harvestNow.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              Nothing to harvest this month for this filter
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {harvestNow.map((plant, i) => (
                <MotionPaper key={plant.name}
                  initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  sx={{ p: 2, background: TAG_COLORS[plant.tag] ?? 'rgba(255,255,255,0.72)' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography fontSize={28}>{plant.emoji}</Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight={700}>{plant.name}</Typography>
                        <Chip label={plant.tag} size="small" sx={{ fontSize: '0.65rem', height: 18 }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">💡 {plant.tip}</Typography>
                    </Box>
                  </Box>
                </MotionPaper>
              ))}
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Year overview strip */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography fontWeight={700} sx={{ mb: 2 }}>Year at a Glance</Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: `120px repeat(12, 1fr)`, gap: 0.5, minWidth: 700 }}>
            <Box />
            {MONTHS.map(m => (
              <Typography key={m} variant="caption" fontWeight={700} textAlign="center"
                sx={{ color: MONTHS.indexOf(m) === currentMonth ? 'primary.main' : 'text.secondary' }}>
                {m}
              </Typography>
            ))}
            {CALENDAR.slice(0, 8).map(plant => (
              <>
                <Box key={plant.name + '-label'} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography fontSize={14}>{plant.emoji}</Typography>
                  <Typography variant="caption" noWrap>{plant.name}</Typography>
                </Box>
                {MONTHS.map((_, mi) => (
                  <Box key={mi} sx={{
                    height: 20, borderRadius: 1,
                    background: plant.sow.includes(mi)
                      ? 'rgba(46,125,50,0.5)'
                      : plant.harvest.includes(mi)
                      ? 'rgba(245,127,23,0.5)'
                      : 'rgba(0,0,0,0.04)',
                  }} />
                ))}
              </>
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 16, height: 16, borderRadius: 0.5, background: 'rgba(46,125,50,0.5)' }} />
              <Typography variant="caption">Sow</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 16, height: 16, borderRadius: 0.5, background: 'rgba(245,127,23,0.5)' }} />
              <Typography variant="caption">Harvest</Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SeasonalCalendar;
