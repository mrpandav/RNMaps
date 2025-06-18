import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import ShareScreen from './src/screens/ShareScreen';
import ViewScreen from './src/screens/ViewScreen';
import RouteScreen from './src/screens/RouteScreen';
import UserRoutesScreen from './src/screens/UserRoutesScreen';

import {hideSplash} from 'react-native-splash-view';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import RouteDetailScreen from './src/screens/RouteDetail';
import RouteDetail from './src/screens/RouteDetail';

const Stack = createNativeStackNavigator();

const App = () => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const splashTimeout = setTimeout(() => {
      hideSplash();
    }, 2000);

    const unsubscribe = auth().onAuthStateChanged(currentUser => {
      setUser(currentUser);
      //fix type errors
      setLoading(false);
    });

    return () => {
      clearTimeout(splashTimeout);
      unsubscribe();
    };
  }, []);

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? 'HomeScreen' : 'LoginScreen'}
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />

        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="ShareScreen" component={ShareScreen} />
        <Stack.Screen name="ViewScreen" component={ViewScreen} />
        <Stack.Screen
          name="UserRoutesScreen"
          component={UserRoutesScreen}
          options={{title: 'User Routes'}}
        />

        <Stack.Screen name="RouteScreen" component={RouteScreen} />
        <Stack.Screen name="RouteDetail" component={RouteDetail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
//RouteDetailScreen
export default App;
