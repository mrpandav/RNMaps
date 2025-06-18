import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export const signUp = async (
  email: string,
  password: string,
  name: string,
): Promise<FirebaseAuthTypes.UserCredential> => {
  const userCredential = await auth().createUserWithEmailAndPassword(email, password);

  const user = auth().currentUser;
  if (user) {
    await user.updateProfile({
      displayName: name,
    });

    await firestore().collection('users').doc(user.uid).set({
      displayName: name,
      email: user.email,
      createdAt: firestore.FieldValue.serverTimestamp(),
      lastLoggedIn: firestore.FieldValue.serverTimestamp(),
     
    });
  }

  return userCredential;
};

export const login = async (
  email: string,
  password: string,
): Promise<FirebaseAuthTypes.UserCredential> => {
  const userCredential = await auth().signInWithEmailAndPassword(email, password);

  const user = auth().currentUser;
  if (user) {
    await firestore().collection('users').doc(user.uid).update({
      lastLoggedIn: firestore.FieldValue.serverTimestamp(),
    });
  }

  return userCredential;
};

export const logout = (): Promise<void> => {
  return auth().signOut();
};

export const onAuthStateChanged = (
  callback: (user: FirebaseAuthTypes.User | null) => void,
): (() => void) => {
  return auth().onAuthStateChanged(callback);
};
