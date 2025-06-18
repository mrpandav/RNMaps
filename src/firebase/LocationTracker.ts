import Geolocation, { GeolocationResponse } from '@react-native-community/geolocation';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { collection, distanceFilter, fastestInterval, interval } from '../components/constant';
import { useTrackingStore } from '../store/useTrackingStore';

type Coord = {
  latitude: number;
  longitude: number;
  timestamp: FirebaseFirestoreTypes.Timestamp;
};

type LocationUpdateCallback = (coord: Coord) => void;

type RouteInfo = {
  routeDocId: string | null;
  autoRouteName: string;
};

let watchId: number | null = null;
let routeDocId: string | null = null;
let autoRouteName = '';
let isTracking = false;

const locationSubscribers = new Set<LocationUpdateCallback>();

const notifySubscribers = (newCoord: Coord) => {
  locationSubscribers.forEach(cb => {
    try {
      cb(newCoord);
    } catch (e) {
      console.warn('Subscriber callback error:', e);
    }
  });
};

const startTracking = async (
  onLocationUpdate?: LocationUpdateCallback,
): Promise<RouteInfo | null> => {
  if (onLocationUpdate) {
    locationSubscribers.add(onLocationUpdate);
  }

  if (isTracking) {
    return {routeDocId, autoRouteName};
  }

  const user = auth().currentUser;
  if (!user?.email) {
    console.warn('User not logged in or email missing');
    return null;
  }

  try {
    const routesSnapshot = await firestore()
      .collection(collection)
      .doc(user.email)
      .collection('routes')
      .get();

    const routeNumber = routesSnapshot.size + 1;
    autoRouteName = `Route ${routeNumber}`;

    const newDocRef = firestore()
      .collection(collection)
      .doc(user.email)
      .collection('routes')
      .doc();

    await newDocRef.set({
      name: autoRouteName,
      path: [],
      startedAt: firestore.FieldValue.serverTimestamp(),
      isActive: true,
    });

    routeDocId = newDocRef.id;
 
    watchId = Geolocation.watchPosition(
      async (position: GeolocationResponse) => {
        const {latitude, longitude} = position.coords;
        const newCoord: Coord = {
          latitude,
          longitude,
          timestamp: firestore.Timestamp.now(),
        };

        notifySubscribers(newCoord);

        await firestore()
          .collection(collection)
          .doc(user.email!)
          .collection('routes')
          .doc(routeDocId!)
          .update({
            path: firestore.FieldValue.arrayUnion(newCoord),
            lastUpdated: firestore.FieldValue.serverTimestamp(),
          });
      },
      (error: any) => {
        console.warn('Watch error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter,
        interval,
        fastestInterval,
      },
    );

    
    const setWatchId = useTrackingStore.getState().setWatchId;
    const setTrackingState = useTrackingStore.getState().setTracking;
    const setRouteInfo = useTrackingStore.getState().setRouteInfo;

    setWatchId(watchId);
    setTrackingState(true);
    setRouteInfo(routeDocId, autoRouteName);

    isTracking = true;

    return {routeDocId, autoRouteName};
  } catch (err) {
    console.error('Error starting tracking:', err);
    return null;
  }
};

const stopTracking = async (): Promise<void> => {
  const user = auth().currentUser;
  if (watchId !== null) {
    Geolocation.clearWatch(watchId);
    watchId = null;

    if (routeDocId && user?.email) {
      try {
        await firestore()
          .collection('locationHistory')
          .doc(user.email)
          .collection('routes')
          .doc(routeDocId)
          .update({isActive: false});
      } catch (e) {
        console.warn('Failed to mark route inactive:', e);
      }
    }

   
    useTrackingStore.getState().clearTracking();

    routeDocId = null;
    autoRouteName = '';
    isTracking = false;
    locationSubscribers.clear();
  }
};

const removeSubscriber = (callback: LocationUpdateCallback): void => {
  locationSubscribers.delete(callback);
};

const isCurrentlyTracking = (): boolean => isTracking;

const getCurrentRouteInfo = (): RouteInfo => {
  return { routeDocId, autoRouteName };
};

export default {
  startTracking,
  stopTracking,
  removeSubscriber,
  isCurrentlyTracking,
  getCurrentRouteInfo,
};
