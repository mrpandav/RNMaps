import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { commonStyles } from '../styles/commonStyles';
import { LATITUDE_DELTA_DEFAULT, LONGITUDE_DELTA_DEFAULT } from '../components/constant';

interface Route {
  id: string;
  name: string;
  startedAt: FirebaseFirestoreTypes.Timestamp;
  path: { latitude: number; longitude: number }[];
  isActive: boolean;
}

interface RouteDetailScreenProps {
  route: {
    params: {
      userEmail: string;
      routeId: string;
    };
  };
}

const RouteDetail = ({ route }: RouteDetailScreenProps) => {
  const { userEmail, routeId } = route.params;
  const [routeData, setRouteData] = useState<Route | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('locationHistory')
      .doc(userEmail)
      .collection('routes')
      .doc(routeId)
      .onSnapshot(handleSnapshot, handleSnapshotError);

    return () => unsubscribe();
  }, [userEmail, routeId]);

  const handleSnapshot = (doc: FirebaseFirestoreTypes.DocumentSnapshot) => {
    const data = doc.data();
    if (data) {
      setRouteData({
        id: doc.id,
        name: data.name,
        startedAt: data.startedAt,
        path: data.path,
        isActive: data.isActive,
      });
      setLoading(false);
    }
  };

  const handleSnapshotError = (error: Error) => {
    console.warn('Error fetching route:', error);
    setLoading(false);
  };

  const initialMapRegion = useMemo(() => {
    if (!routeData || routeData.path.length === 0) {
      return {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: LATITUDE_DELTA_DEFAULT,
        longitudeDelta: LONGITUDE_DELTA_DEFAULT,
      };
    }

    const lastPoint = routeData.path[routeData.path.length - 1];
    return {
      latitude: lastPoint.latitude,
      longitude: lastPoint.longitude,
      latitudeDelta: LATITUDE_DELTA_DEFAULT,
      longitudeDelta: LONGITUDE_DELTA_DEFAULT,
    };
  }, [routeData]);

  const routeCoordinates = useMemo(() => {
    return routeData?.path?.map(p => ({
      latitude: p.latitude,
      longitude: p.longitude,
    })) || [];
  }, [routeData]);

  const BackButton = ({ onPress }: { onPress: () => void }) => (
    <TouchableOpacity style={commonStyles.backButton} onPress={onPress}>
      <Ionicons name="arrow-back" size={35} color="#007bff" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={commonStyles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading route details...</Text>
      </View>
    );
  }

  if (!routeData) {
    return (
      <View style={commonStyles.centered}>
        <Text>No route found.</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.topBar}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={commonStyles.title}>{routeData.name || 'Unnamed Route'}</Text>
      </View>

      <View style={commonStyles.flex}>
        <MapView style={commonStyles.map} region={initialMapRegion} showsUserLocation={true}>
          <Polyline coordinates={routeCoordinates} strokeColor="blue" strokeWidth={4} />
          {routeData.path?.[0] && (
            <Marker coordinate={routeData.path[0]} title="Start" pinColor="green" />
          )}
          {routeData.path?.[routeData.path.length - 1] && (
            <Marker coordinate={routeData.path[routeData.path.length - 1]} title="End" pinColor="red" />
          )}
        </MapView>
      </View>

      <TouchableOpacity style={commonStyles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={commonStyles.closeButtonText}>Back to Routes List</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RouteDetail;
