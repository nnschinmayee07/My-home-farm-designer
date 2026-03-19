import { useState, useRef, useCallback } from 'react';
import { Box, Typography, Paper, Chip, Button, Tooltip, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import UndoIcon from '@mui/icons-material/Undo';
import BrushIcon from '@mui/icons-material/Brush';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export interface GridPlant {
  name: string;
  emoji: string;
  spacing: number;
  color: string;
}

interface PlacedPlant {
  id: string;
  plant: GridPlant;
  x: number;
  y: number;
}

interface GardenGridProps {
  width: number;
  length: number;
  availablePlants: GridPlant[];
}

const CELL_PX = 52;
const COLORS = ['#e8f5e9','#f3e5f5','#e3f2fd','#fff3e0','#fce4ec','#e0f7fa','#f9fbe7','#ede7f6','#fbe9e7','#e8eaf6'];

function metersToCells(m: number) {
  return Math.max(2, Math.min(20, Math.round(m / 0.25)));
}

type Mode = 'single' | 'paint';

const GardenGrid = ({ width, length, availablePlants }: GardenGridProps) => {
  const cols = metersToCells(width);
  const rows = metersToCells(length);

  const [placed, setPlaced] = useState<PlacedPlant[]>([]);
  const [history, setHistory] = useState<PlacedPlant[][]>([]);
  const [mode, setMode] = useState<Mode>('single');
  const [selectedPlant, setSelectedPlant] = useState<GridPlant | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ x: number; y: number } | null>(null);

  // Paint mode state
  const isPainting = useRef(false);
  const paintedCells = useRef<Set<string>>(new Set());

  // Single mode drag state
  const dragPlantRef = useRef<GridPlant | null>(null);
  const draggingId = useRef<string | null>(null);

  const getPlantAt = (x: number, y: number) => placed.find(p => p.x === x && p.y === y);

  const saveHistory = useCallback((current: PlacedPlant[]) => {
    setHistory(h => [...h.slice(-20), [...current]]);
  }, []);

  // ── PAINT MODE ──────────────────────────────────────────────
  const paintCell = useCallback((x: number, y: number) => {
    if (!selectedPlant) return;
    const key = `${x}-${y}`;
    if (paintedCells.current.has(key)) return;
    paintedCells.current.add(key);
    setPlaced(prev => {
      if (prev.some(p => p.x === x && p.y === y)) return prev;
      return [...prev, { id: `${Date.now()}-${key}`, plant: selectedPlant, x, y }];
    });
  }, [selectedPlant]);

  const handlePaintStart = (x: number, y: number) => {
    if (mode !== 'paint' || !selectedPlant) return;
    saveHistory(placed);
    isPainting.current = true;
    paintedCells.current = new Set();
    paintCell(x, y);
  };

  const handlePaintMove = (x: number, y: number) => {
    if (mode !== 'paint' || !isPainting.current) return;
    setDragOverCell({ x, y });
    paintCell(x, y);
  };

  const handlePaintEnd = () => {
    isPainting.current = false;
    paintedCells.current = new Set();
    setDragOverCell(null);
  };

  // ── SINGLE MODE (HTML5 drag-and-drop) ───────────────────────
  const handlePaletteDragStart = (plant: GridPlant) => {
    dragPlantRef.current = plant;
    draggingId.current = null;
  };

  const handlePlacedDragStart = (id: string, plant: GridPlant) => {
    dragPlantRef.current = plant;
    draggingId.current = id;
  };

  const handleCellDragOver = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCell({ x, y });
  };

  const handleCellDrop = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    setDragOverCell(null);
    if (!dragPlantRef.current) return;
    const existing = getPlantAt(x, y);
    if (existing && existing.id !== draggingId.current) return;
    saveHistory(placed);
    if (draggingId.current) {
      const id = draggingId.current;
      setPlaced(prev => prev.map(p => p.id === id ? { ...p, x, y } : p));
    } else {
      setPlaced(prev => [...prev, {
        id: `${Date.now()}-${Math.random()}`,
        plant: dragPlantRef.current!,
        x, y,
      }]);
    }
    dragPlantRef.current = null;
    draggingId.current = null;
  };

  // ── SHARED ───────────────────────────────────────────────────
  const handleRemove = (id: string) => {
    saveHistory(placed);
    setPlaced(prev => prev.filter(p => p.id !== id));
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    setPlaced(history[history.length - 1]);
    setHistory(h => h.slice(0, -1));
  };

  const plantCounts = availablePlants.reduce<Record<string, number>>((acc, p) => {
    acc[p.name] = placed.filter(pl => pl.plant.name === p.name).length;
    return acc;
  }, {});

  const colorOf = (p: GridPlant) => {
    const idx = availablePlants.findIndex(ap => ap.name === p.name);
    return COLORS[idx % COLORS.length];
  };

  return (
    <Box>
      {/* Mode switcher + instructions */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <ToggleButtonGroup value={mode} exclusive size="small"
          onChange={(_e, v) => v && setMode(v)}>
          <ToggleButton value="single" sx={{ gap: 0.5, px: 2 }}>
            <TouchAppIcon fontSize="small" />
            <Typography variant="caption" fontWeight={600}>Single</Typography>
          </ToggleButton>
          <ToggleButton value="paint" sx={{ gap: 0.5, px: 2 }}>
            <BrushIcon fontSize="small" />
            <Typography variant="caption" fontWeight={600}>Paint</Typography>
          </ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.75,
          borderRadius: 2, background: 'rgba(46,125,50,0.06)', border: '1px solid rgba(46,125,50,0.15)', flex: 1 }}>
          <InfoOutlinedIcon sx={{ color: 'primary.main', fontSize: 16 }} />
          <Typography variant="caption" color="text.secondary">
            {mode === 'paint'
              ? selectedPlant
                ? `Painting ${selectedPlant.emoji} ${selectedPlant.name} — click & drag across cells`
                : 'Select a plant below, then click & drag across the grid to fill multiple cells'
              : 'Drag a plant card onto a cell · Drag placed plants to move · Double-click to remove'}
          </Typography>
        </Box>
      </Box>

      {/* Plant palette */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5 }}>
          {mode === 'paint' ? 'Select plant to paint with:' : 'Plant Palette — drag onto grid:'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {availablePlants.map((p, i) => {
            const color = COLORS[i % COLORS.length];
            const isSelected = selectedPlant?.name === p.name;
            return (
              <Box
                key={p.name}
                draggable={mode === 'single'}
                onDragStart={() => mode === 'single' && handlePaletteDragStart({ ...p, color })}
                onClick={() => mode === 'paint' && setSelectedPlant(isSelected ? null : { ...p, color })}
                sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 0.5, p: 1.5, borderRadius: 2, minWidth: 64,
                  cursor: mode === 'paint' ? 'pointer' : 'grab',
                  background: color,
                  border: isSelected && mode === 'paint'
                    ? '2.5px solid #2e7d32'
                    : '2px solid rgba(0,0,0,0.06)',
                  boxShadow: isSelected && mode === 'paint'
                    ? '0 0 0 3px rgba(46,125,50,0.25)'
                    : 'none',
                  userSelect: 'none', transition: 'all 0.15s',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: isSelected && mode === 'paint'
                    ? '0 0 0 3px rgba(46,125,50,0.25), 0 6px 16px rgba(0,0,0,0.1)'
                    : '0 6px 16px rgba(0,0,0,0.1)' },
                  '&:active': { transform: 'scale(0.95)' },
                }}
              >
                <Typography fontSize={28} lineHeight={1}>{p.emoji}</Typography>
                <Typography variant="caption" fontWeight={700} textAlign="center" sx={{ lineHeight: 1.2 }}>
                  {p.name.split(' ')[0]}
                </Typography>
                {plantCounts[p.name] > 0 && (
                  <Chip label={`×${plantCounts[p.name]}`} size="small"
                    sx={{ height: 18, fontSize: '0.65rem', background: 'rgba(46,125,50,0.2)' }} />
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Grid */}
      <Paper
        sx={{
          p: 2, overflowX: 'auto',
          background: 'linear-gradient(135deg, rgba(232,245,233,0.6), rgba(241,248,233,0.6))',
          border: '2px dashed rgba(46,125,50,0.2)',
          cursor: mode === 'paint' && selectedPlant ? 'crosshair' : 'default',
          userSelect: 'none',
        }}
        onMouseUp={handlePaintEnd}
        onMouseLeave={handlePaintEnd}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, px: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {width}m × {length}m
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {cols} × {rows} cells · each = 0.25m
          </Typography>
        </Box>

        <Box sx={{ display: 'inline-block' }} onDragLeave={() => setDragOverCell(null)}>
          {/* Col headers */}
          <Box sx={{ display: 'flex', ml: '32px' }}>
            {Array.from({ length: cols }).map((_, x) => (
              <Box key={x} sx={{ width: CELL_PX, textAlign: 'center' }}>
                <Typography variant="caption" color="text.disabled" fontSize="0.6rem">
                  {(x * 0.25).toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex' }}>
            {/* Row headers */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {Array.from({ length: rows }).map((_, y) => (
                <Box key={y} sx={{ height: CELL_PX, display: 'flex', alignItems: 'center', width: 32 }}>
                  <Typography variant="caption" color="text.disabled" fontSize="0.6rem">
                    {(y * 0.25).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Cells */}
            <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${CELL_PX}px)` }}>
              {Array.from({ length: rows }).map((_, y) =>
                Array.from({ length: cols }).map((_, x) => {
                  const occupant = getPlantAt(x, y);
                  const isOver = dragOverCell?.x === x && dragOverCell?.y === y;
                  const isMoving = occupant && occupant.id === draggingId.current;

                  return (
                    <Box
                      key={`${x}-${y}`}
                      // Paint mode events
                      onMouseDown={() => handlePaintStart(x, y)}
                      onMouseEnter={() => handlePaintMove(x, y)}
                      // Single mode drag events
                      onDragOver={e => mode === 'single' && handleCellDragOver(e, x, y)}
                      onDrop={e => mode === 'single' && handleCellDrop(e, x, y)}
                      sx={{
                        width: CELL_PX, height: CELL_PX,
                        border: isOver
                          ? '2px solid rgba(46,125,50,0.8)'
                          : '1px solid rgba(46,125,50,0.15)',
                        borderRadius: 1.5,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isOver && !occupant
                          ? 'rgba(46,125,50,0.18)'
                          : occupant
                          ? colorOf(occupant.plant)
                          : 'rgba(255,255,255,0.5)',
                        transition: 'background 0.08s, border 0.08s',
                        position: 'relative',
                      }}
                    >
                      <AnimatePresence>
                        {occupant && (
                          <Tooltip
                            title={mode === 'single'
                              ? `${occupant.plant.name} — drag to move · double-click to remove`
                              : `${occupant.plant.name} — double-click to remove`}
                            arrow disableInteractive>
                            <motion.div
                              key={occupant.id}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: isMoving ? 0.5 : 1, opacity: isMoving ? 0.3 : 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                              draggable={mode === 'single'}
                              onDragStart={() => mode === 'single' && handlePlacedDragStart(occupant.id, occupant.plant)}
                              onDragEnd={() => { draggingId.current = null; }}
                              onDoubleClick={() => handleRemove(occupant.id)}
                              style={{
                                fontSize: 26, cursor: mode === 'single' ? 'grab' : 'crosshair',
                                userSelect: 'none', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                width: '100%', height: '100%',
                              }}
                            >
                              {occupant.plant.emoji}
                            </motion.div>
                          </Tooltip>
                        )}
                      </AnimatePresence>

                      {/* Ghost preview on hover */}
                      {isOver && !occupant && (
                        <Typography fontSize={20} sx={{ opacity: 0.35, pointerEvents: 'none', position: 'absolute' }}>
                          {mode === 'paint' ? selectedPlant?.emoji : dragPlantRef.current?.emoji}
                        </Typography>
                      )}
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Footer */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          {placed.length > 0 ? (
            <>
              <Typography variant="body2" color="text.secondary">{placed.length} plants placed:</Typography>
              {Object.entries(plantCounts).filter(([, c]) => c > 0).map(([name, count]) => {
                const p = availablePlants.find(pl => pl.name === name)!;
                const idx = availablePlants.indexOf(p);
                return (
                  <Chip key={name} size="small"
                    label={`${p.emoji} ${name} ×${count}`}
                    sx={{ background: COLORS[idx % COLORS.length], fontWeight: 600, fontSize: '0.72rem' }} />
                );
              })}
            </>
          ) : (
            <Typography variant="body2" color="text.disabled">
              {mode === 'paint' ? 'Select a plant above, then drag across cells' : 'Drag plants from the palette onto the grid'}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" startIcon={<UndoIcon />} onClick={handleUndo} disabled={history.length === 0}>
            Undo
          </Button>
          <Button size="small" color="error" startIcon={<DeleteOutlineIcon />}
            onClick={() => { saveHistory(placed); setPlaced([]); }} disabled={placed.length === 0}>
            Clear
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default GardenGrid;
