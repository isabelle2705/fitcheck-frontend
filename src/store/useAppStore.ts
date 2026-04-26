import { create } from 'zustand';

interface AppState {
  userId: string | null;
  soulId: string | null;
  points: number;
  setUser: (userId: string, points: number) => void;
  setSoulId: (soulId: string) => void;
  setPoints: (points: number) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  userId: null,
  soulId: null,
  points: 0,
  setUser: (userId, points) => set({ userId, points }),
  setSoulId: (soulId) => set({ soulId }),
  setPoints: (points) => set({ points }),
  reset: () => set({ userId: null, soulId: null, points: 0 }),
}));
