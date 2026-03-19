import { useState, useRef, useCallback, useEffect } from 'react';
import { Box, Typography, Paper, Chip, Button, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import UndoIcon from '@mui/icons-material/Undo';
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

const COLORS = ['#e8f5e9','#f3e5f5','#e3f2fd','#fff3e0','#fce4ec','#e0f7fa','#f9fbe7','#ede7f6','#fbe9e7','#e8eaf6'];

function metersToCells(m: number) {
  return Math.max(2, Math.min(16, Math.round(m / 0.25)));
}

function cellSize(cols: number): number {
  if (typeof window === 'undefined') return 52;
  const available = Math.min(window.innerWidth - 80, 900);
  const size = Math.floor((available - 40) / cols);
  return Math.max(36, Math.min(64, size));
}

const GardenGrid = ({ width, length, availablePlants }: GardenGridProps) => {
  const cols = metersToCells(width);
  const rows = metersToCells(length);
  const CELL_PX = cellSize(cols);

  const [placed, setPlaced] = useState<PlacedPlant[]>([]);
  const [history, setHistory] = useState<PlacedPlant[][]>([]);

  // Which plant from palette is "active" for placing
  const [activePalette, setActivePalette] = useState<GridPlant | null>(null);

  // Selected cell ids (for group drag)
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Drag state
  const isDragging = useRef(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const dragOffset = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const [dragDelta, setDragDelta] = useState<{ dx: number; dy: number } | null>(null);
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);

  // Box-select state
  const isBoxSelecting = useRef(false);
  const boxStart = useRef<{ x: number; y: number } | null>(null);
  const [boxEnd, setBoxEnd] = useState<{ x: number; y: number } | null>(null);

  const getPlantAt = useCallback((x: number, y: number, list = placed) =>
    list.find(p => p.x === x && p.y === y), [placed]);

  const saveHistory = useCallback((current: PlacedPlant[]) => {
    setHistory(h => [...h.slice(-20), [...current]]);
  }, []);

  const colorOf = (p: GridPlant) => {
    const idx = availablePlants.findIndex(ap => ap.name === p.name);
    return COLORS[idx % COLORS.length];
  };

  // Box selection range
  const getBoxRange = () => {
    if (!boxStart.current || !boxEnd) return null;
    return {
      x1: Math.min(boxStart.current.x, boxEnd.x),
      x2: Math.max(boxStart.current.x, boxEnd.x),
      y1: Math.min(boxStart.current.y, boxEnd.y),
      y2: Math.max(boxStart.current.y, boxEnd.y),
    };
  };

  const inBoxRange = (x: number, y: number) => {
    const r = getBoxRange();
    if (!r) return false;
    return x >= r.x1 && x <= r.x2 && y >= r.y1 && y <= r.y2;
  };

  // ── CELL MOUSE DOWN ─────────────────────────────────────────
  const handleCellMouseDown = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    const occupant = getPlantAt(x, y);

    // If palette plant active + empty cell → place it
    if (activePalette && !occupant) {
      saveHistory(placed);
      setPlaced(prev => [...prev, { id: `${Date.now()}-${x}-${y}`, plant: activePalette, x, y }]);
      return;
    }

    if (occupant) {
      const alreadySelected = selected.has(occupant.id);

      if (e.shiftKey) {
        // Shift+click: toggle individual selection
        setSelected(prev => {
          const next = new Set(prev);
          if (alreadySelected) next.delete(occupant.id);
          else next.add(occupant.id);
          return next;
        });
      } else if (alreadySelected && selected.size > 0) {
        // Start dragging the current selection
        isDragging.current = true;
        dragStart.current = { x, y };
        dragOffset.current = { dx: 0, dy: 0 };
        setDragDelta({ dx: 0, dy: 0 });
      } else {
        // Select just this one and prepare to drag
        setSelected(new Set([occupant.id]));
        isDragging.current = true;
        dragStart.current = { x, y };
        dragOffset.current = { dx: 0, dy: 0 };
        setDragDelta({ dx: 0, dy: 0 });
      }
    } else {
      // Empty cell — start box select
      isBoxSelecting.current = true;
      boxStart.current = { x, y };
      setBoxEnd({ x, y });
      if (!e.shiftKey) setSelected(new Set());
    }
  };

  // ── CELL MOUSE ENTER ────────────────────────────────────────
  const handleCellMouseEnter = (x: number, y: number) => {
    setHoverCell({ x, y });

    if (isDragging.current && dragStart.current) {
      const dx = x - dragStart.current.x;
      const dy = y - dragStart.current.y;
      dragOffset.current = { dx, dy };
      setDragDelta({ dx, dy });
    }

    if (isBoxSelecting.current) {
      setBoxEnd({ x, y });
    }
  };

  // ── MOUSE UP (global) ────────────────────────────────────────
  useEffect(() => {
    const onUp = () => {
      if (isDragging.current && dragStart.current && dragOffset.current) {
        const { dx, dy } = dragOffset.current;
        if (dx !== 0 || dy !== 0) {
          setPlaced(prev => {
            // Check all target cells are free (or occupied by selected)
            const selectedIds = selected;
            const selectedPlants = prev.filter(p => selectedIds.has(p.id));
            const targets = selectedPlants.map(p => ({ x: p.x + dx, y: p.y + dy }));
            // Bounds check
            const inBounds = targets.every(t => t.x >= 0 && t.x < cols && t.y >= 0 && t.y < rows);
            // Collision check (only against non-selected)
            const nonSelected = prev.filter(p => !selectedIds.has(p.id));
            const noCollision = targets.every(t => !nonSelected.some(p => p.x === t.x && p.y === t.y));
            if (!inBounds || !noCollision) return prev;
            saveHistory(prev);
            return prev.map(p =>
              selectedIds.has(p.id) ? { ...p, x: p.x + dx, y: p.y + dy } : p
            );
          });
        }
      }

      if (isBoxSelecting.current) {
        const range = getBoxRange();
        if (range) {
          setPlaced(prev => {
            const inRange = prev.filter(p => p.x >= range.x1 && p.x <= range.x2 && p.y >= range.y1 && p.y <= range.y2);
            setSelected(s => {
              const next = new Set(s);
              inRange.forEach(p => next.add(p.id));
              return next;
            });
            return prev;
          });
        }
      }

      isDragging.current = false;
      isBoxSelecting.current = false;
      dragStart.current = null;
      boxStart.current = null;
      setDragDelta(null);
      setBoxEnd(null);
    };

    window.addEventListener('mouseup', onUp);
    return () => window.removeEventListener('mouseup', onUp);
  }, [selected, cols, rows, saveHistory]);

  // ── DOUBLE CLICK → remove ────────────────────────────────────
  const handleDoubleClick = (x: number, y: number) => {
    const occupant = getPlantAt(x, y);
    if (!occupant) return;
    saveHistory(placed);
    setPlaced(prev => prev.filter(p => p.id !== occupant.id));
    setSelected(prev => { const n = new Set(prev); n.delete(occupant.id); return n; });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    setPlaced(history[history.length - 1]);
    setHistory(h => h.slice(0, -1));
    setSelected(new Set());
  };

  const plantCounts = availablePlants.reduce<Record<string, number>>((acc, p) => {
    acc[p.name] = placed.filter(pl => pl.plant.name === p.name).length;
    return acc;
  }, {});

  // Preview: where selected plants would land during drag
  const previewPositions = dragDelta && dragDelta.dx === 0 && dragDelta.dy === 0 ? null :
    dragDelta ? placed
      .filter(p => selected.has(p.id))
      .map(p => ({ ...p, x: p.x + dragDelta.dx, y: p.y + dragDelta.dy }))
    : null;

  const isPreview = (x: number, y: number) =>
    previewPositions?.some(p => p.x === x && p.y === y) ?? false;

  const isSelected = (id: string) => selected.has(id);
  const isDraggingSelected = (id: string) => isDragging.current && selected.has(id);

  return (
    <Box onMouseLeave={() => setHoverCell(null)}>
      {/* Hint bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.75, mb: 2,
        borderRadius: 2, background: 'rgba(46,125,50,0.06)', border: '1px solid rgba(46,125,50,0.12)' }}>
        <InfoOutlinedIcon sx={{ color: 'primary.main', fontSize: 16 }} />
        <Typography variant="caption" color="text.secondary">
          {activePalette
            ? `Placing ${activePalette.emoji} ${activePalette.name} — click any empty cell · press Esc to cancel`
            : selected.size > 0
            ? `${selected.size} plant${selected.size > 1 ? 's' : ''} selected — drag to move · Shift+click to add more · click empty to deselect`
            : 'Click a plant card to place · click placed plants to select · drag selection to move · double-click to remove'}
        </Typography>
      </Box>

      {/* Plant palette */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5 }}>Plant Palette</Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {availablePlants.map((p, i) => {
            const color = COLORS[i % COLORS.length];
            const isActive = activePalette?.name === p.name;
            return (
              <Box
                key={p.name}
                onClick={() => setActivePalette(isActive ? null : { ...p, color })}
                sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 0.5, p: 1.5, borderRadius: 2, minWidth: 64,
                  cursor: 'pointer', background: color,
                  border: isActive ? '2.5px solid #2e7d32' : '2px solid rgba(0,0,0,0.06)',
                  boxShadow: isActive ? '0 0 0 3px rgba(46,125,50,0.3)' : 'none',
                  userSelect: 'none', transition: 'all 0.15s',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: isActive
                    ? '0 0 0 3px rgba(46,125,50,0.3), 0 6px 16px rgba(0,0,0,0.1)'
                    : '0 6px 16px rgba(0,0,0,0.1)' },
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
          userSelect: 'none',
          cursor: activePalette ? 'cell' : isDragging.current ? 'grabbing' : 'default',
        }}
        onKeyDown={e => e.key === 'Escape' && setActivePalette(null)}
        tabIndex={0}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, px: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {width}m × {length}m · {cols}×{rows} cells
          </Typography>
          <Typography variant="caption" color="text.secondary">each cell = 0.25m</Typography>
        </Box>

        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          {/* Col headers */}
          <Box sx={{ display: 'flex', ml: '32px' }}>
            {Array.from({ length: cols }).map((_, x) => (
              <Box key={x} sx={{ width: CELL_PX, flexShrink: 0, textAlign: 'center' }}>
                <Typography variant="caption" color="text.disabled" fontSize="0.6rem">
                  {(x * 0.25).toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex' }}>
            {/* Row headers */}
            <Box sx={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
              {Array.from({ length: rows }).map((_, y) => (
                <Box key={y} sx={{ height: CELL_PX, display: 'flex', alignItems: 'center', width: 32 }}>
                  <Typography variant="caption" color="text.disabled" fontSize="0.6rem">
                    {(y * 0.25).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Cells */}
            <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${CELL_PX}px)`, flexShrink: 0 }}>
              {Array.from({ length: rows }).map((_, y) =>
                Array.from({ length: cols }).map((_, x) => {
                  const occupant = getPlantAt(x, y);
                  const isHover = hoverCell?.x === x && hoverCell?.y === y;
                  const preview = isPreview(x, y);
                  const inBox = inBoxRange(x, y);
                  const sel = occupant ? isSelected(occupant.id) : false;
                  const dragging = occupant ? isDraggingSelected(occupant.id) : false;

                  return (
                    <Box
                      key={`${x}-${y}`}
                      onMouseDown={e => handleCellMouseDown(e, x, y)}
                      onMouseEnter={() => handleCellMouseEnter(x, y)}
                      onDoubleClick={() => handleDoubleClick(x, y)}
                      sx={{
                        width: CELL_PX, height: CELL_PX,
                        border: sel
                          ? '2px solid #2e7d32'
                          : inBox
                          ? '2px dashed rgba(46,125,50,0.6)'
                          : isHover
                          ? '1.5px solid rgba(46,125,50,0.5)'
                          : '1px solid rgba(46,125,50,0.15)',
                        borderRadius: 1.5,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative',
                        background: preview
                          ? 'rgba(46,125,50,0.2)'
                          : sel && occupant
                          ? colorOf(occupant.plant)
                          : occupant
                          ? colorOf(occupant.plant)
                          : isHover && activePalette
                          ? 'rgba(46,125,50,0.12)'
                          : 'rgba(255,255,255,0.5)',
                        boxShadow: sel ? 'inset 0 0 0 2px rgba(46,125,50,0.3)' : 'none',
                        transition: 'background 0.08s, border 0.08s',
                        cursor: occupant
                          ? sel ? 'grab' : 'pointer'
                          : activePalette ? 'cell' : 'default',
                      }}
                    >
                      <AnimatePresence>
                        {occupant && (
                          <Tooltip title={`${occupant.plant.name} · double-click to remove`} arrow disableInteractive>
                            <motion.div
                              key={occupant.id}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: dragging ? 0.6 : 1, opacity: dragging ? 0.4 : 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                              style={{
                                fontSize: Math.max(16, CELL_PX - 18),
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

                      {/* Selection indicator */}
                      {sel && (
                        <Box sx={{
                          position: 'absolute', top: 2, right: 2,
                          width: 8, height: 8, borderRadius: '50%',
                          background: '#2e7d32', pointerEvents: 'none',
                        }} />
                      )}

                      {/* Ghost preview when placing from palette */}
                      {isHover && !occupant && activePalette && (
                        <Typography fontSize={Math.max(14, CELL_PX - 22)}
                          sx={{ opacity: 0.4, pointerEvents: 'none', position: 'absolute' }}>
                          {activePalette.emoji}
                        </Typography>
                      )}

                      {/* Drag destination preview */}
                      {preview && (
                        <Typography fontSize={Math.max(14, CELL_PX - 22)}
                          sx={{ opacity: 0.6, pointerEvents: 'none', position: 'absolute' }}>
                          {previewPositions?.find(p => p.x === x && p.y === y)?.plant.emoji}
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
              <Typography variant="body2" color="text.secondary">{placed.length} plants placed</Typography>
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
              Click a plant card above, then click cells to place
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {selected.size > 0 && (
            <Button size="small" onClick={() => setSelected(new Set())}>
              Deselect ({selected.size})
            </Button>
          )}
          <Button size="small" startIcon={<UndoIcon />} onClick={handleUndo} disabled={history.length === 0}>
            Undo
          </Button>
          <Button size="small" color="error" startIcon={<DeleteOutlineIcon />}
            onClick={() => { saveHistory(placed); setPlaced([]); setSelected(new Set()); }}
            disabled={placed.length === 0}>
            Clear
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default GardenGrid;
