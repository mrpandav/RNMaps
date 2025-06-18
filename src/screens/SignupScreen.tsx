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
import {signUp} from '../firebase/auth';
import {commonStyles} from '../styles/commonStyles';
import {useNavigation, NavigationProp} from '@react-navigation/native';

interface FormData {
  name: string;
  email: string;
  password: string;
}

const SignupScreen = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
  });
  const [secureText, setSecureText] = useState<boolean>(true);
  const navigation = useNavigation<NavigationProp<any>>();

  const showValidationAlert = (message: string) => {
    Alert.alert('Validation Error', message);
  };

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const validateEmail = (email: string): boolean => /\S+@\S+\.\S+/.test(email);

  const updateField = (key: keyof FormData, value: string) => {
    setFormData(prev => ({...prev, [key]: value}));
  };

  const validateFields = (): boolean => {
    const {name, email, password} = formData;

    if (!name.trim()) {
      showValidationAlert('Please enter your name');
      //! use common function for alert
      return false;
    }
    if (!email.trim()) {
      showValidationAlert('Please enter your email');
      //! use common function for alert
      return false;
    }
    if (!validateEmail(email)) {
      showValidationAlert('Please enter a valid email');
      //! use common function for alert
      return false;
    }
    if (!password) {
      showValidationAlert('Please enter your password');
      //! use common function for alert
      return false;
    }
    if (password.length < 6) {
      showValidationAlert('Password must be at least 6 characters');
      //! use common function for alert
      return false;
    }
    return true;
  };

  const togglePasswordVisibility = () => {
    setSecureText(prev => !prev);
  };

  const handleSignup = async () => {
    if (!validateFields()) return;

    try {
      await signUp(formData.email, formData.password, formData.name);
      showAlert('Signup Successful', `Welcome, ${formData.name}!`);
      navigation.reset({
        index: 0,
        routes: [{name: 'HomeScreen'}],
      });
    } catch (error: any) {
      showAlert('Signup Error', error.message);
    }
  };

  const navigateToLoginScreen = () => {
    navigation.navigate('LoginScreen');
  };

  return (
    <View style={commonStyles.main}>
      <Text style={commonStyles.title}>Sign Up</Text>

      <TextInput
        style={commonStyles.input}
        placeholder="Name"
        value={formData.name}
        onChangeText={updateField.bind(this, 'name')}
        //! remove handleNameChange and use bind
      />
      <TextInput
        style={commonStyles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={updateField.bind(this, 'email')}
        //! remove handleEmailChange and use bind
      />

      <View style={commonStyles.passwordContainer}>
        <TextInput
          style={commonStyles.passwordInput}
          placeholder="Password"
          secureTextEntry={secureText}
          value={formData.password}
          onChangeText={updateField.bind(this, 'password')}
          //! remove handlePasswordChange and use bind
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
        style={commonStyles.buttonSuccess}
        onPress={handleSignup}>
        <Text style={commonStyles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={navigateToLoginScreen}>
        <Text style={commonStyles.linkSuccess}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignupScreen;

 
//! unused