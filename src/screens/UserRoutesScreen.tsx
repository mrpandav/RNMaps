import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MapView, {Polyline, Marker, Region} from 'react-native-maps';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {commonStyles} from '../styles/commonStyles';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  LATITUDE_DELTA_DEFAULT,
  LONGITUDE_DELTA_DEFAULT,
} from '../components/constant';

interface Route {
  id: string;
  name: string;
  startedAt: FirebaseFirestoreTypes.Timestamp;
  path: {latitude: number; longitude: number}[];
  isActive: boolean;
}

interface UserRoutesScreenProps {
  route: {
    params: {
      userEmail: string;
      userName: string;
    };
  };
}

const UserRoutesScreen = ({route}: UserRoutesScreenProps) => {
  const {userEmail, userName} = route.params;
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(
    null,
  );
  const navigation = useNavigation();
  // const route =useRoute();

  useEffect(() => {
    navigation.setOptions({title: `${userName}'s Routes`});

    const unsubscribe = firestore()
      .collection('locationHistory')
      .doc(userEmail)
      .collection('routes')
      .onSnapshot(handleSnapshot, handleSnapshotError);

    return () => unsubscribe();
  }, [userEmail, userName, navigation]);

  const handleSnapshot = (
    querySnapshot: FirebaseFirestoreTypes.QuerySnapshot,
  ) => {
    const routeList: Route[] = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      routeList.push({
        id: doc.id,
        name: data.name,
        startedAt: data.startedAt,
        path: data.path,
        isActive: data.isActive,
      });
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

  const selectedRoute =
    selectedRouteIndex !== null ? routes[selectedRouteIndex] : null;

  const handleSelectRoute = useCallback((index: number) => {
    setSelectedRouteIndex(index);
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleBackToList = () => {
    setSelectedRouteIndex(null);
  };

  const routeCoordinates = useMemo(() => {
    return (
      selectedRoute?.path?.map(p => ({
        latitude: p.latitude,
        longitude: p.longitude,
      })) || []
    );
  }, [selectedRoute]);

  const initialMapRegion = useMemo(() => {
    console.log(selectedRoute)
    if (!selectedRoute)
      return {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: LATITUDE_DELTA_DEFAULT,
        longitudeDelta: LONGITUDE_DELTA_DEFAULT,
      };
    return {
      latitude: selectedRoute.path[selectedRoute.path.length-1]?.latitude || 37.78825,
      longitude: selectedRoute.path[selectedRoute.path.length-1]?.longitude || -122.4324,
      latitudeDelta: LATITUDE_DELTA_DEFAULT,
      longitudeDelta: LONGITUDE_DELTA_DEFAULT,
    };
  }, [selectedRoute]);

const renderRouteItem = (routeItem: Route, index: number) => {
  const isMostRecent = index === 0;
  const isLive =
    isMostRecent && (routeItem.path?.length ?? 0) > 0 && routeItem.isActive;

  return (
    <TouchableOpacity
      key={routeItem.id}
      style={commonStyles.routeItem}
      onPress={() => navigation.navigate('RouteDetail', { userEmail, routeId: routeItem.id })} // Updated navigation
    >
      <Text style={commonStyles.routeName}>
        {routeItem.name || 'Unnamed Route'}
      </Text>
      <Text style={commonStyles.timestamp}>
        {routeItem.startedAt?.toDate().toLocaleString() ?? 'Unknown time'}
      </Text>
      <Text style={commonStyles.timestamp}>
        {routeItem.path?.length || 0} points recorded
      </Text>

      {isLive && (
        <View style={styles.liveTag}>
          <Text style={styles.liveText}>Live</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};


  // const getRoutePressHandler = (index: number) => () => {
  //   handleSelectRoute(index);
  // };

  const BackButton = ({onPress}: {onPress: () => void}) => (
    <TouchableOpacity style={commonStyles.backButton} onPress={onPress}>
      <Ionicons name="arrow-back" size={35} color="#007bff" />
    </TouchableOpacity>
  );

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
      <View style={commonStyles.topBar}>
        <TouchableOpacity
          style={commonStyles.backButton}
          onPress={navigation.goBack}>
          <Ionicons name="arrow-back" size={35} color="#007bff" />
        </TouchableOpacity>
        <Text style={commonStyles.title}>No routes recorded .</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.topBar}>
        <BackButton onPress={handleGoBack} />
        <Text style={commonStyles.title}>Routes</Text>
      </View>

      {selectedRoute ? (
        <>
          <View style={commonStyles.flex}>
            <MapView style={commonStyles.map}
              showsUserLocation={true}
              region={initialMapRegion}
            >
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="blue"
                strokeWidth={4}
              />
              {selectedRoute.path?.[0] && (
                <Marker
                  coordinate={selectedRoute.path[0]}
                  title="Start"
                  pinColor="green"
                />
              )}
              {selectedRoute.path?.[selectedRoute.path.length - 1] && (
                <Marker
                  coordinate={selectedRoute.path[selectedRoute.path.length - 1]}
                  title="End"
                  pinColor="red"
                />
              )}
            </MapView>
          </View>
          <TouchableOpacity
            style={commonStyles.closeButton}
            onPress={handleBackToList}>
            <Text style={commonStyles.closeButtonText}>
              Back to Routes List
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <ScrollView contentContainerStyle={commonStyles.listContainer}>
          <Text style={commonStyles.listTitle}>Routes of {userName}</Text>
          {routes.map(renderRouteItem)}
        </ScrollView>
      )}
    </View>
  );
};

export default UserRoutesScreen;
const styles = StyleSheet.create({
  liveTag: {
    marginTop: 5,
    backgroundColor: 'red',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    alignSelf: 'flex-start',
    borderRightColor: 'green',
  },
  liveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
