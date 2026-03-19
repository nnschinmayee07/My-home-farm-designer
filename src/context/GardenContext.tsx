import { createContext, useContext, useState, ReactNode } from 'react';

export interface PlantEntry {
  id: number;
  name: string;
  planted_date: string;
  next_watering: string | null;
  harvest_date: string | null;
  watered: boolean;
}

interface GardenContextType {
  plants: PlantEntry[];
  addPlant: (p: PlantEntry) => void;
  removePlant: (id: number) => void;
  updatePlant: (id: number, patch: Partial<PlantEntry>) => void;
  setPlants: (plants: PlantEntry[]) => void;
}

const GardenContext = createContext<GardenContextType | null>(null);

export function GardenProvider({ children }: { children: ReactNode }) {
  const [plants, setPlants] = useState<PlantEntry[]>([]);

  const addPlant = (p: PlantEntry) => setPlants(prev => [p, ...prev.filter(x => x.id !== p.id)]);
  const removePlant = (id: number) => setPlants(prev => prev.filter(p => p.id !== id));
  const updatePlant = (id: number, patch: Partial<PlantEntry>) =>
    setPlants(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));

  return (
    <GardenContext.Provider value={{ plants, addPlant, removePlant, updatePlant, setPlants }}>
      {children}
    </GardenContext.Provider>
  );
}

export function useGarden() {
  const ctx = useContext(GardenContext);
  if (!ctx) throw new Error('useGarden must be used within GardenProvider');
  return ctx;
}
