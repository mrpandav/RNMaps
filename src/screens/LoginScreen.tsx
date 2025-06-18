import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {login} from '../firebase/auth';
import {commonStyles} from '../styles/commonStyles';
import {useNavigation, NavigationProp} from '@react-navigation/native';

type RootStackParamList = {
  HomeScreen: undefined;
  SignupScreen: undefined;
};

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [secureText, setSecureText] = useState<boolean>(true);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  //! use common function for alert
  const showAlert = (message: string, title = 'Validation Error') => {
    Alert.alert(title, message);
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      return showAlert('Please enter your email.');
    }
    if (!validateEmail(email)) {
      return showAlert('Please enter a valid email address.');
      //! use common function for alert
    }
    if (!password) {
      return showAlert('Please enter your password.');
      //! use common function for alert
    }
    if (password.length < 6) {
      return showAlert('Password must be at least 6 characters long.');
      //! use common function for alert
    }

    try {
      await login(email, password);
      Alert.alert('Login Successful', `Welcome back, ${email}`);
      navigation.reset({
        index: 0,
        routes: [{name: 'HomeScreen'}],
      });
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Login Error',
        'Incorrect email or password. Please try again.',
      );
    }
  };

  const togglePasswordVisibility = () => setSecureText(!secureText);

  const navigateToSignupScreen = () => {
    navigation.navigate('SignupScreen');
  };

  //! Formate all documents properly
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={commonStyles.input}
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
      />a

      <View style={commonStyles.passwordContainer}>
        <TextInput
          style={commonStyles.passwordInput}
          placeholder="Password"
          secureTextEntry={secureText}
          onChangeText={setPassword}
          value={password}
        />
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <Icon
            name={secureText ? 'visibility-off' : 'visibility'}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={commonStyles.buttonPrimary}
        onPress={handleLogin}>
        <Text style={commonStyles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={navigateToSignupScreen}>
        <Text style={commonStyles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default LoginScreen;
