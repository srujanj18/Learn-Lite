import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, orderBy } from 'firebase/firestore';

// Chat Operations
export const saveFirestoreChat = async (userId, chat) => {
  try {
    if (!userId) throw new Error('User ID is required');
    const chatsRef = collection(db, 'chats', userId, 'messages');
    const retryCount = 3;
    let lastError;

    for (let i = 0; i < retryCount; i++) {
      try {
        await addDoc(chatsRef, {
          ...chat,
          timestamp: new Date().toISOString()
        });
        return;
      } catch (err) {
        lastError = err;
        if (err.code === 'permission-denied') break;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    
    console.error('Failed to save chat to Firestore:', lastError);
    throw lastError;
  } catch (error) {
    console.error('Failed to save chat to Firestore:', error);
    throw error;
  }
};

export const getFirestoreChats = async (userId) => {
  try {
    const chatsRef = collection(db, 'chats', userId, 'messages');
    const q = query(chatsRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Failed to get chats from Firestore:', error);
    throw error;
  }
};

export const deleteFirestoreChat = async (userId, chatId) => {
  try {
    if (!userId || !chatId) throw new Error('User ID and Chat ID are required');
    const chatDocRef = doc(db, 'chats', userId, 'messages', chatId);
    await deleteDoc(chatDocRef);
  } catch (error) {
    console.error('Failed to delete chat from Firestore:', error);
    throw error;
  }
};

export const deleteAllFirestoreChats = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required');
    const chatsRef = collection(db, 'chats', userId, 'messages');
    const querySnapshot = await getDocs(chatsRef);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Failed to delete all chats from Firestore:', error);
    throw error;
  }
};

// Image Generation Operations
export const saveImageGeneration = async (userId, imageData) => {
  try {
    const imageRef = collection(db, 'imageGeneration', userId, 'images');
    await addDoc(imageRef, {
      ...imageData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to save image generation to Firestore:', error);
    throw error;
  }
};

export const getImageGenerations = async (userId) => {
  try {
    const imageRef = collection(db, 'imageGeneration', userId, 'images');
    const q = query(imageRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Failed to get image generations from Firestore:', error);
    throw error;
  }
};

// Document Analysis Operations
export const saveDocumentAnalysis = async (userId, analysisData) => {
  try {
    const analysisRef = collection(db, 'documentAnalysis', userId, 'analyses');
    await addDoc(analysisRef, {
      ...analysisData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to save document analysis to Firestore:', error);
    throw error;
  }
};

export const getDocumentAnalyses = async (userId) => {
  try {
    const analysisRef = collection(db, 'documentAnalysis', userId, 'analyses');
    const q = query(analysisRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Failed to get document analyses from Firestore:', error);
    throw error;
  }
};

// Document Mining Operations
export const saveDocumentMining = async (userId, miningData) => {
  try {
    const miningRef = collection(db, 'documentMining', userId, 'minings');
    await addDoc(miningRef, {
      ...miningData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to save document mining to Firestore:', error);
    throw error;
  }
};

export const getDocumentMinings = async (userId) => {
  try {
    const miningRef = collection(db, 'documentMining', userId, 'minings');
    const q = query(miningRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Failed to get document minings from Firestore:', error);
    throw error;
  }
};