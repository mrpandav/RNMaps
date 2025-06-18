import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {commonStyles} from '../styles/commonStyles';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { getAuth } from '@react-native-firebase/auth';

interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
}

const ViewScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const navigation = useNavigation<NavigationProp<any>>();
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('users')
      .orderBy('createdAt', 'desc')
      .onSnapshot(handleUsersSnapshot);

    return () => unsubscribe();
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleUsersSnapshot = (
    snapshot: FirebaseFirestoreTypes.QuerySnapshot,
  ) => {
    const allUsers = snapshot.docs
      .map(mapUserDoc)
      .filter(user => user.id !== getAuth().currentUser?.uid);

    setUsers(allUsers);
  };

  const mapUserDoc = (doc: FirebaseFirestoreTypes.DocumentSnapshot) =>
    ({
      id: doc.id,
      ...doc.data(),
    } as User);

  const handleUserPress = (user: User) => {
    navigation.navigate('UserRoutesScreen', {
      userEmail: user.email,
      userName: user.displayName,
    });
  };

  // const renderUserItem = renderUser.bind(this, handleUserPress);
  //! Identify what's the issue here with renderUserItem

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.topBar}>
        <BackButton onPress={handleGoBack} />
        <Text style={commonStyles.title}>Registered Users</Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={extractUserKey}
        renderItem={renderUser.bind(this, handleUserPress)}
        ListEmptyComponent={<Text>No users found.</Text>}
      />
    </View>
  );
};

const extractUserKey = (item: User) => item.id;

const renderUser = (
  onUserPress: (user: User) => void,
  {item}: {item: User},
) => {
  return <UserRow user={item} onPress={onUserPress} />;
};

interface UserRowProps {
  user: User;
  onPress: (user: User) => void;
}

const UserRow: React.FC<UserRowProps> = React.memo(({user, onPress}) => {
  return (
    <TouchableOpacity
      style={commonStyles.userRow}
      onPress={onPress.bind(this, user)}>
      <Text style={commonStyles.name}>{user.displayName || 'N/A'}</Text>
      <Text style={commonStyles.email}>{user.email || 'N/A'}</Text>
    </TouchableOpacity>
  );
});

const BackButton = ({onPress}: {onPress: () => void}) => (
  <TouchableOpacity style={commonStyles.backButton} onPress={onPress}>
    <Ionicons name="arrow-back" size={35} color="#007bff" />
  </TouchableOpacity>
);
 

export default ViewScreen;
