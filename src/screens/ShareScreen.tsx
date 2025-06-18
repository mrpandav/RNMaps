import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, {Marker, Polyline, Region} from 'react-native-maps';
import Geolocation, {
  GeolocationResponse,
} from '@react-native-community/geolocation';
import LocationTracker from '../firebase/LocationTracker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {commonStyles} from '../styles/commonStyles';
import {useNavigation} from '@react-navigation/native';
import {usePathStore} from '../store/usePathStore';
 

const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = 0.01;
const LOCATION_TIMEOUT = 15000;
const LOCATION_MAXIMUM_AGE = 10000;
const LOCATION_HIGH_ACCURACY = true;

type pathType = {latitude: number; longitude: number};
// let path: pathType[] = [];
//! Do not declare and use variable outside of component or function

const ShareScreen = () => {
  const [region, setRegion] = useState<Region | null>(null);
  const [locationLoaded, setLocationLoaded] = useState<boolean>(false);
  const [tracking, setTracking] = useState<boolean>(false);
  const navigation = useNavigation();
  const {path, addPoint, clearPath} = usePathStore();
  // !

  const handleGoBack = () => {
    navigation.goBack();
  };

  const onLocationUpdate = useCallback((newCoord: pathType) => {
    console.log('updated locaion --->', newCoord);
    updateRegion(newCoord);
    updatePath(newCoord);
  }, []);

  useEffect(() => {
    const setup = async () => {
      await requestLocationPermission();
      getInitialLocation();

      if (LocationTracker.isCurrentlyTracking()) {
        const {autoRouteName} = LocationTracker.getCurrentRouteInfo();
        setTracking(true);
        LocationTracker.startTracking(onLocationUpdate);
      }
    };

    setup();

    return () => {
      // LocationTracker.removeSubscriber(onLocationUpdate);
    };
  }, [onLocationUpdate]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Location permission is required');
      }
    }
  };

  const getInitialLocation = () => {
    Geolocation.getCurrentPosition(
      handleInitialLocationSuccess,
      handleInitialLocationError,
      {
        enableHighAccuracy: LOCATION_HIGH_ACCURACY,
        timeout: LOCATION_TIMEOUT,
        maximumAge: LOCATION_MAXIMUM_AGE,
      },
    );
  };

  const handleInitialLocationSuccess = (position: GeolocationResponse) => {
    const {latitude, longitude} = position.coords;
    setRegion({
      latitude,
      longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });
    setLocationLoaded(true);
  };

  const handleInitialLocationError = (error: any) => {
    console.warn('Initial position error:', error);
  };

  const updateRegion = (coord: pathType) => {
    setRegion(prev => ({
      //! any
      ...prev!,
      latitude: coord.latitude,
      longitude: coord.longitude,
    }));
  };

  // const updatePath = (coord: pathType) => {
  //   path.push(coord);
  // };

  // const startTracking = async () => {
  //   console.log("runnfin start")
  //   path = [];
  //   const result = await LocationTracker.startTracking(onLocationUpdate);
  //   if (result) {
  //     setTracking(true);
  //   }
  // };

  // const stopTracking = () => {
  //   LocationTracker.stopTracking();
  //   setTracking(false);

  //   path = [];
  // };

  const updatePath = (coord: pathType) => {
    addPoint(coord);
  };
  const startTracking = async () => {
    clearPath();
    const result = await LocationTracker.startTracking(onLocationUpdate);
    if (result) {
      setTracking(true);
    }
  };

  const stopTracking = () => {
    LocationTracker.stopTracking();
    setTracking(false);
    clearPath();
    LocationTracker.removeSubscriber(onLocationUpdate);
  };

  return (
    <View style={commonStyles.flex}>
      <View style={commonStyles.topBar}>
        <TouchableOpacity
          style={commonStyles.backButton}
          onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={35} color="#007bff" />
        </TouchableOpacity>
        <Text style={commonStyles.title}>Users</Text>
      </View>

      <View style={commonStyles.flex}>
        {locationLoaded && region ? (
          <MapComponent region={region} path={path} />
        ) : (
          <LoadingView />
        )}
      </View>

      <ButtonGroup
        tracking={tracking}
        onStart={startTracking}
        onStop={stopTracking}
      />
    </View>
  );
};

export default ShareScreen;

// const MapComponent = React.memo(
//   ({region, path}: {region: Region; path: pathType[]}) => (
//     <MapView style={commonStyles.map} region={region} showsUserLocation={true}>
//       <Marker coordinate={region} title="You are here" />
//       <Polyline
//         coordinates={getPolylineCoordinates.bind(this)(path)}

//         //! --------------use proper bind--------------------------------------------------------

//         strokeColor="blue"
//         strokeWidth={4}
//       />
//     </MapView>
//   ),
// );
const MapComponent = React.memo(({region}: {region: Region}) => {
  const path = usePathStore(state => state.path);

  return (
    <MapView style={commonStyles.map} region={region} showsUserLocation={true}>
      <Marker coordinate={region} title="You are here" />
      <Polyline
        coordinates={getPolylineCoordinates(path)}
        strokeColor="blue"
        strokeWidth={4}
      />
    </MapView>
  );
});

const getPolylineCoordinates = (path: pathType[]) =>
  path.map((p: pathType) => ({
    latitude: p.latitude,
    longitude: p.longitude,
  }));

const LoadingView = () => (
  <View style={styles.loadingContainer}>
    <Text>Loading map...</Text>
  </View>
);

const ButtonGroup = ({
  tracking,
  onStart,
  onStop,
}: {
  tracking: boolean;
  onStart: () => void;
  onStop: () => void;
}) => (
  <View style={styles.buttonContainer}>
    <TouchableOpacity
      style={
        tracking
          ? [commonStyles.buttonPrimary, styles.disabledButton]
          : commonStyles.buttonPrimary
      }
      onPress={onStart}
      disabled={tracking}>
      <Text style={styles.buttonText}>Start Route</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={
        !tracking
          ? [commonStyles.buttonPrimary, styles.disabledButton]
          : commonStyles.buttonPrimary
      }
      onPress={onStop}
      disabled={!tracking}>
      <Text style={styles.buttonText}>Stop</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  //! reuse styles

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
  },

  disabledButton: {
    backgroundColor: '#aaa',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
