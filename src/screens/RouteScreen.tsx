import React, {useCallback, useEffect, useState, useRef, useMemo} from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import MapView, {Polyline, Marker, Region} from 'react-native-maps';
import auth from '@react-native-firebase/auth';
import firestore, {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import Geolocation from '@react-native-community/geolocation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {commonStyles} from '../styles/commonStyles';
import {
  distanceFilter,
  fastestInterval,
  interval,
  LATITUDE_DELTA_DEFAULT,
  LONGITUDE_DELTA_DEFAULT,
} from '../components/constant';
import {NavigationProp, useNavigation} from '@react-navigation/native';

interface Route {
  id: string;
  name?: string;
  startedAt?: FirebaseFirestoreTypes.Timestamp;
  path?: {latitude: number; longitude: number}[];
   isActive?: boolean; 
}

interface LiveLocation {
  latitude: number;
  longitude: number;
}

interface RouteItemProps {
  item: Route;
  onPress: (route: Route) => void;
  isLive: boolean;
}

const RouteItem: React.FC<RouteItemProps> = ({item, onPress, isLive}) => {
   
  return (
    <TouchableOpacity style={commonStyles.routeItem} onPress={onPress.bind(this,item)}>
      //! inline, bind
      <Text style={commonStyles.routeName}>{item.name || 'Unnamed Route'}</Text>
      <Text style={commonStyles.timestamp}>
        {item.startedAt?.toDate().toLocaleString() ?? 'Unknown time'}
      </Text>
      <Text style={commonStyles.timestamp}>
        {item.path?.length || 0} points recorded
      </Text>
      {isLive && (
        <View style={commonStyles.liveTag}>
          <Text style={commonStyles.liveText}>Live</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const RouteScreen = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [liveLocation, setLiveLocation] = useState<LiveLocation | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const navigation = useNavigation<NavigationProp<any>>();
  const locationWatchId = useRef<number | null>(null);

 const isLiveRoute = (route: Route): boolean => {
  // return !!route.isActive && !!liveLocation;
  return route.isActive === true;
};

  const BackButton: React.FC<{onPress: () => void}> = ({onPress}) => (
    <TouchableOpacity style={commonStyles.backButton} onPress={onPress}>
      <Ionicons name="arrow-back" size={35} color="#007bff" />
    </TouchableOpacity>
  );

  useEffect(() => {
    requestLocationPermission();
    fetchRoutes();

    const user = auth().currentUser;
    if (!user) return;

    const unsubscribe = firestore()
      .collection('locationHistory')
      .doc(user.email || '')
      .onSnapshot(docSnapshot => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data?.liveLocation) {
            setLiveLocation(data.liveLocation);
          }
        }
      });

    return () => {
      unsubscribe();
      if (locationWatchId.current !== null) {
        Geolocation.clearWatch(locationWatchId.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      setMapRegion(getInitialRegion());
    }
  }, [selectedRoute, liveLocation]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'App needs access to your location for live tracking.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          startWatchingLocation();
        } else {
          console.warn('Location permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      startWatchingLocation();
    }
  };

  const startWatchingLocation = () => {
    locationWatchId.current = Geolocation.watchPosition(
      async position => {
        const {latitude, longitude} = position.coords;
        setLiveLocation({latitude, longitude});

        const user = auth().currentUser;
        if (!user) return;

        try {
          await firestore()
            .collection('locationHistory')
            .doc(user.email || '')
            .set(
              {
                liveLocation: {latitude, longitude},
                lastUpdated: firestore.FieldValue.serverTimestamp(),
              },
              {merge: true},
            );
        } catch (error) {
          console.warn('Error updating live location:', error);
        }
      },
      error => {
        console.warn('Location watch error:', error);
      },
      {
        enableHighAccuracy: true,
        // distanceFilter: 10,
         distanceFilter: distanceFilter,
        //!const
        interval,
        fastestInterval,
      },
    );
  };

  const handleSnapshot = (
    querySnapshot: FirebaseFirestoreTypes.QuerySnapshot,
  ) => {
    const routeList: Route[] = [];
    querySnapshot.forEach(doc => {
      routeList.push({id: doc.id, ...doc.data()} as Route);
    });

    const sorted = [...routeList].sort((a, b) => {
      const aTime = a.startedAt?.toDate()?.getTime() || 0;
      const bTime = b.startedAt?.toDate()?.getTime() || 0;
      return bTime - aTime;
    });

    setRoutes(sorted);
    setLoading(false);
  };

  const handleSnapshotError = (error: Error) => {
    console.warn('Error fetching routes:', error);
    setLoading(false);
  };

  const fetchRoutes = async () => {
    const user = auth().currentUser;
    if (!user) return;

    try {
      const unsubscribe = firestore()
        .collection('locationHistory')
        .doc(user.email || '')
        .collection('routes')
        .orderBy('startedAt', 'desc')
        .onSnapshot(handleSnapshot, handleSnapshotError);
      return () => unsubscribe();
    } catch (error) {
      console.warn('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRouteSelect = useCallback((route: Route) => {
    if (isLiveRoute(route)) {
      navigation.navigate('ShareScreen', {routeData: route});
    } else {
      setSelectedRoute(route);
    }
  }, [isLiveRoute, navigation]);

  const handleCloseModal = useCallback(() => {
    setSelectedRoute(null);
  }, []);

  const getInitialRegion = (): Region => {
    if (selectedRoute?.path?.length) {
      return {
        latitude: selectedRoute.path[0].latitude,
        longitude: selectedRoute.path[0].longitude,
        latitudeDelta: LATITUDE_DELTA_DEFAULT,
        longitudeDelta: LONGITUDE_DELTA_DEFAULT,
      };
    }
    if (liveLocation) {
      return {
        latitude: liveLocation.latitude,
        longitude: liveLocation.longitude,
        latitudeDelta: LATITUDE_DELTA_DEFAULT,
        longitudeDelta: LONGITUDE_DELTA_DEFAULT,
      };
    }

    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: LATITUDE_DELTA_DEFAULT,
      longitudeDelta: LONGITUDE_DELTA_DEFAULT,
    };
  };

  const polylineCoordinates = useMemo(() => {
    if (!selectedRoute?.path) return [];

    const filteredPath = selectedRoute.path
      .filter(p => {
        if (!liveLocation) return true;
        return !(
          p.latitude === liveLocation.latitude &&
          p.longitude === liveLocation.longitude
        );
      })
      .map(p => ({
        latitude: p.latitude,
        longitude: p.longitude,
      }));

    // if (liveLocation) {
    //   filteredPath.push(liveLocation);
    // }
    if (selectedRoute?.isActive && liveLocation) {
  filteredPath.push(liveLocation);
}

    return filteredPath;
  }, [selectedRoute, liveLocation]);

  const renderRouteItem = useCallback(
    ({item}: {item: Route}) => (
      <RouteItem
        item={item}
        onPress={handleRouteSelect}
        isLive={isLiveRoute(item)}
      />
    ),
    [handleRouteSelect, routes, liveLocation],
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={commonStyles.centered}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>Loading routes...</Text>
        </View>
      );
    }

    if (routes.length === 0) {
      return (
        <View style={commonStyles.centered}>
          <Text>No routes recorded yet.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={routes}
        keyExtractor={item => item.id}
        renderItem={renderRouteItem}
        contentContainerStyle={commonStyles.listContainer}
      />
    );
  };

  const onRegionChangeComplete = (region: Region) => {
    setMapRegion(region);
  };

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.topBar}>
        <BackButton onPress={navigation.goBack.bind(this)} />
          //! inline
        <Text style={commonStyles.title}>Registered Users</Text>
      </View>
      {renderContent()}

      <Modal visible={!!selectedRoute} animationType="slide">
        <View style={commonStyles.flex}>
          {mapRegion && (
            <MapView
              style={commonStyles.map}
              region={mapRegion}
              onRegionChangeComplete={onRegionChangeComplete}>
              <Polyline
                coordinates={polylineCoordinates}
                strokeColor="blue"
                strokeWidth={5}
              />
              {selectedRoute?.path?.[0] && (
                <Marker
                  coordinate={selectedRoute.path[0]}
                  title="Start"
                  pinColor="green"
                />
              )}
              {/* {liveLocation && ( */}
                {selectedRoute?.isActive && liveLocation && (
                <Marker
                  coordinate={liveLocation}
                  title="Live Location"
                  pinColor="purple"
                />
              )}
            </MapView>
          )}
          <TouchableOpacity
            style={commonStyles.closeButton}
            onPress={handleCloseModal}>
            <Text style={commonStyles.closeButtonText}>Close Map</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default RouteScreen;
