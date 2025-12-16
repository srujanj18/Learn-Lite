// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC71fAuXbEv5uDLYT6QQD8bdPL-ct8xgDY",
  authDomain: "larn-lite-2.firebaseapp.com",
  databaseURL: "https://larn-lite-2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "larn-lite-2",
  storageBucket: "larn-lite-2.firebasestorage.app",
  messagingSenderId: "190319885312",
  appId: "1:190319885312:web:21a070f1ece25e3927ece5",
  measurementId: "G-W1BGCDZMFJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let analytics = null;

if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  try {
    analytics = getAnalytics(app);
    console.log('Firebase Analytics initialized successfully');
  } catch (error) {
    console.error('Firebase Analytics initialization error:', error);
    analytics = null;
    
    // Fallback to manual measurement ID if dynamic fetch fails
    if (error.code === 'config-fetch-failed' || error.code === 'app-not-found') {
      console.log('Using measurement ID from local config:', firebaseConfig.measurementId);
    }
    
    // Additional error handling for common analytics issues
    if (error.message.includes('Failed to fetch') || error.message.includes('invalid argument')) {
      console.warn('Network or configuration issue detected, analytics may not work properly');
    }
  }
}

export { db, auth, analytics, GoogleAuthProvider };
export default app;

const googleProvider = new GoogleAuthProvider();
// Add additional scopes for better user data access
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Configure provider for better UX
googleProvider.setCustomParameters({
  prompt: 'select_account', // Force account selection
  auth_type: 'reauthenticate' // Force re-authentication
});

export { googleProvider };

// Note: The Google sign-in functionality is implemented in auth.js
// Do not use this placeholder - import the function from auth.js instead

// Verify analytics configuration
if (analytics && typeof window !== 'undefined') {
  console.log('Analytics is properly configured with measurement ID:', firebaseConfig.measurementId);
}