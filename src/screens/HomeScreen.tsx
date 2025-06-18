import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {logout} from '../firebase/auth';
import {commonStyles} from '../styles/commonStyles';
import {useNavigation, NavigationProp} from '@react-navigation/native';

type RootStackParamList = {
  ShareScreen: undefined;
  ViewScreen: undefined;
  RouteScreen: undefined;
};

type NavBoxProps = {
  title: string;
  onPress: () => void;
};

const NavBox: React.FC<NavBoxProps> = ({title, onPress}) => (
  <TouchableOpacity style={commonStyles.box} onPress={onPress}>
    <Text style={commonStyles.boxText}>{title}</Text>
  </TouchableOpacity>
);

//! remove this func and directly use navigation.navigate with bind
// const handleNavigate = (
//   navigation: NavigationProp<RootStackParamList>,
//   screenName: keyof RootStackParamList,
// ) => {
//   navigation.navigate(screenName);
// };

const HomeScreen = () => {
  const user = auth().currentUser;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.navigate('LoginScreen');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
      {cancelable: true},
    );
  };
  const handleNavigate = useCallback(
    (screenName: keyof RootStackParamList) => () => {
      navigation.navigate(screenName);
    },
    [navigation]
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Welcome!</Text>

      <View style={styles.userInfo}>
        <Text style={styles.userText}>
          👤 User Name:{' '}
          <Text style={styles.userValue}>{user?.displayName || 'N/A'}</Text>
        </Text>
        <Text style={styles.userText}>
          📧 Email: <Text style={styles.userValue}>{user?.email || 'N/A'}</Text>
        </Text>
      </View>

        <View style={styles.boxContainer}>
        <NavBox title="Share" onPress={handleNavigate('ShareScreen')} />
        <NavBox title="View" onPress={handleNavigate('ViewScreen')} />
        <NavBox title="Route" onPress={handleNavigate('RouteScreen')} />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 50,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#007bff',
  },
  userInfo: {
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  userText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  userValue: {
    fontWeight: 'normal',
    color: '#000',
  },
  boxContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
