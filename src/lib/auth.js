import { auth } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';


export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Email sign-in error:', error);
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    }
    throw error;
  }
};

export const signUpWithEmail = async (email, password, username, phoneNumber, profilePicture) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    let photoURL = null;
    if (profilePicture) {
      const storage = getStorage();
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      await uploadBytes(storageRef, profilePicture);
      photoURL = await getDownloadURL(storageRef);
    }

    await updateProfile(user, {
      displayName: username,
      photoURL: photoURL
    });

    const db = getFirestore();
    await setDoc(doc(db, 'users', user.uid), {
      username,
      phoneNumber,
      email,
      photoURL,
      createdAt: new Date().toISOString()
    });

    await sendEmailVerification(user);
    return user;
  } catch (error) {
    console.error('Email sign-up error:', error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email address is already registered. Please try signing in instead, or use a different email address.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters long.');
    }
    throw error;
  }
};

export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address.');
    }
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};