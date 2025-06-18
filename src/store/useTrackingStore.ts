import {create} from 'zustand';

type TrackingState = {
  isTracking: boolean;
  routeDocId: string | null;
  autoRouteName: string;
  watchId: number | null;

  setTracking: (isTracking: boolean) => void;
  setRouteInfo: (routeDocId: string | null, autoRouteName: string) => void;
  setWatchId: (watchId: number | null) => void;
  clearTracking: () => void;
};

export const useTrackingStore = create<TrackingState>(set => ({
  isTracking: false,
  routeDocId: null,
  autoRouteName: '',
  watchId: null,

  setTracking: isTracking => set({isTracking}),
  setRouteInfo: (routeDocId, autoRouteName) => set({routeDocId, autoRouteName}),
  setWatchId: watchId => set({watchId}),
  clearTracking: () =>
    set({
      isTracking: false,
      routeDocId: null,
      autoRouteName: '',
      watchId: null,
    }),
}));
