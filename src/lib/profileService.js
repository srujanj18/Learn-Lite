import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { db, auth } from './firebase';

const PROFILE_COLLECTION = 'userSettings';

const defaultProfile = {
  displayName: '',
  photoURL: '',
  bio: '',
  email: '',
  createdAt: null,
  lastUpdated: null
};

export const getProfile = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }

  try {
    const profileRef = doc(db, PROFILE_COLLECTION, user.uid);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      return profileSnap.data();
    }
    
    // If no profile exists, create default profile
    const newProfile = {
      ...defaultProfile,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      email: user.email || '',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    await setDoc(profileRef, newProfile);
    return newProfile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to access this profile. Please ensure you are signed in.');
    }
    throw new Error(error.message || 'Failed to fetch user profile. Please try again later.');
  }
};

export const updateUserProfile = async (profileData) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be logged in to update your profile. Please sign in and try again.');
  }

  // Verify user's authentication state
  if (!user.uid) {
    throw new Error('Invalid authentication state. Please sign in again.');
  }

  try {
    // Check if profile exists first
    const profileRef = doc(db, PROFILE_COLLECTION, user.uid);
    const profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) {
      // Create default profile if it doesn't exist
      const newProfile = {
        ...defaultProfile,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        email: user.email || '',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      await setDoc(profileRef, newProfile);
    }
    const updates = {};
    
    // Update Firebase Auth profile
    if (profileData.displayName || profileData.photoURL) {
      await updateProfile(user, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL
      });
    }

    // Update email if provided and verified
    if (profileData.email && profileData.email !== user.email) {
      if (!user.emailVerified) {
        throw new Error('Please verify your current email before changing to a new one');
      }
      await updateEmail(user, profileData.email);
    }

    // Update password if provided
    if (profileData.newPassword) {
      await updatePassword(user, profileData.newPassword);
    }

    // Update Firestore profile
    const allowedFields = {
      displayName: profileData.displayName,
      phone: profileData.phone,
      location: profileData.location,
      bio: profileData.bio,
      lastUpdated: new Date().toISOString()
    };

    // Remove undefined fields
    Object.keys(allowedFields).forEach(key => {
      if (allowedFields[key] === undefined) {
        delete allowedFields[key];
      }
    });

    // Update the Firestore document
    await updateDoc(profileRef, allowedFields);

    // Fetch and return the updated profile
    const updatedProfileSnap = await getDoc(profileRef);
    return updatedProfileSnap.data();
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.code === 'permission-denied') {
      console.error('Permission denied error details:', error);
      throw new Error('Access denied. Please sign out and sign in again to refresh your session.');
    } else if (error.code === 'not-found') {
      throw new Error('Profile not found. Please try refreshing the page.');
    } else if (error.code === 'unauthenticated' || error.code === 'auth/invalid-user-token') {
      // Force sign out on invalid token
      await signOut(auth);
      throw new Error('Your session has expired. Please sign in again.');
    }
    console.error('Profile update error details:', error);
    throw new Error(error.message || 'Failed to update user profile. Please try again later.');
  }
};