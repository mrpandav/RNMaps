import {create} from 'zustand';

type PathType = {
  latitude: number;
  longitude: number;
};

type PathStore = {
  path: PathType[];
  setPath: (newPath: PathType[]) => void;
  addPoint: (point: PathType) => void;
  clearPath: () => void;
};

export const usePathStore = create<PathStore>((set) => ({
  path: [],
  setPath: (newPath) => set({ path: newPath }),
  addPoint: (point) => set((state) => ({ path: [...state.path, point] })),
  clearPath: () => set({ path: [] }),
}));
