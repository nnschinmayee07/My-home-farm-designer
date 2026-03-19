import { useState } from 'react';
import { Box, Typography, Paper, Tooltip, Chip, Button } from '@mui/material';
import { motion } from 'framer-motion';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

interface GridPlant {
  name: string;
  emoji: string;
  spacing: number; // cm — determines cell size
  color: string;
}

interface PlacedPlant {
  id: string;
  plant: GridPlant;
  x: number;
  y: number;
}

interface GardenGridProps {
  width: number;   // meters
  length: number;  // meters
  availablePlants: GridPlant[];
}

const CELL_PX = 48; // each cell = 0.25m

function metersToCells(m: number) {
  return Math.max(1, Math.round(m / 0.25));
}

const PLANT_COLORS = [
  '#e8f5e9', '#f3e5f5', '#e3f2fd', '#fff3e0', '#fce4ec',
  '#e0f7fa', '#f9fbe7', '#ede7f6',
];

const GardenGrid = ({ width, length, availablePlants }: GardenGridProps) => {
  const cols = metersToCells(width);
  const rows = metersToCells(length);
  const [placed, setPlaced] = useState<PlacedPlant[]>([]);
  const [selected, setSelected] = useState<GridPlant | null>(null);
  const [dragOver, setDragOver] = useState<{ x: number; y: number } | null>(null);

  const isOccupied = (x: number, y: number) =>
    placed.some(p => p.x === x && p.y === y);

  const handleCellClick = (x: number, y: number) => {
    if (!selected) return;
    if (isOccupied(x, y)) return;
    setPlaced(prev => [...prev, {
      id: `${Date.now()}`,
      plant: selected,
      x, y,
    }]);
  };

  const handleRemove = (id: string) => {
    setPlaced(prev => prev.filter(p => p.id !== id));
  };

  const getPlantAt = (x: number, y: number) =>
    placed.find(p => p.x === x && p.y === y);

  return (
    <Box>
      {/* Plant palette */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
          Select a plant, then click a cell to place it
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {availablePlants.map((p, i) => (
            <Chip
              key={p.name}
              label={`${p.emoji} ${p.name}`}
              onClick={() => setSelected(selected?.name === p.name ? null : { ...p, color: PLANT_COLORS[i % PLANT_COLORS.length] })}
              variant={selected?.name === p.name ? 'filled' : 'outlined'}
              color={selected?.name === p.name ? 'primary' : 'default'}
              sx={{ cursor: 'pointer', fontWeight: 600 }}
            />
          ))}
        </Box>
      </Box>

      {/* Grid */}
      <Paper sx={{ p: 2, overflowX: 'auto', background: 'rgba(232,245,233,0.5)' }}>
        <Box sx={{ display: 'inline-block', position: 'relative' }}>
          {/* Column labels */}
          <Box sx={{ display: 'flex', ml: `${CELL_PX}px` }}>
            {Array.from({ length: cols }).map((_, x) => (
              <Box key={x} sx={{ width: CELL_PX, textAlign: 'center' }}>
                <Typography variant="caption" color="text.disabled">{(x * 0.25).toFixed(2)}m</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex' }}>
            {/* Row labels */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {Array.from({ length: rows }).map((_, y) => (
                <Box key={y} sx={{ height: CELL_PX, display: 'flex', alignItems: 'center', pr: 0.5 }}>
                  <Typography variant="caption" color="text.disabled">{(y * 0.25).toFixed(2)}m</Typography>
                </Box>
              ))}
            </Box>

            {/* Cells */}
            <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${CELL_PX}px)` }}>
              {Array.from({ length: rows }).map((_, y) =>
                Array.from({ length: cols }).map((_, x) => {
                  const occupant = getPlantAt(x, y);
                  const isHover = dragOver?.x === x && dragOver?.y === y;
                  return (
                    <Tooltip key={`${x}-${y}`}
                      title={occupant ? `${occupant.plant.name} — click to remove` : selected ? `Place ${selected.name}` : ''}>
                      <Box
                        component={motion.div}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => occupant ? handleRemove(occupant.id) : handleCellClick(x, y)}
                        onMouseEnter={() => setDragOver({ x, y })}
                        onMouseLeave={() => setDragOver(null)}
                        sx={{
                          width: CELL_PX, height: CELL_PX,
                          border: '1px solid rgba(46,125,50,0.2)',
                          borderRadius: 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: selected || occupant ? 'pointer' : 'default',
                          background: occupant
                            ? occupant.plant.color
                            : isHover && selected
                            ? 'rgba(46,125,50,0.12)'
                            : 'rgba(255,255,255,0.4)',
                          transition: 'background 0.15s',
                          fontSize: 22,
                          userSelect: 'none',
                        }}
                      >
                        {occupant ? occupant.plant.emoji : ''}
                      </Box>
                    </Tooltip>
                  );
                })
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Legend */}
      {placed.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">Placed:</Typography>
          {Array.from(new Set(placed.map(p => p.plant.name))).map(name => {
            const p = placed.find(pl => pl.plant.name === name)!;
            const count = placed.filter(pl => pl.plant.name === name).length;
            return (
              <Chip key={name} size="small"
                label={`${p.plant.emoji} ${name} ×${count}`}
                sx={{ background: p.plant.color, fontWeight: 600 }} />
            );
          })}
          <Button size="small" color="error" startIcon={<DeleteOutlineIcon />}
            onClick={() => setPlaced([])}>
            Clear all
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default GardenGrid;
