import { auth } from './firebase';
import { saveFirestoreChat, getFirestoreChats } from './firestoreService';

export const saveChat = async (chat) => {
  try {
    // Save to localStorage first
    const savedChats = JSON.parse(localStorage.getItem('savedChats') || '[]');
    const existingChatIndex = savedChats.findIndex(c => c.sessionId === chat.sessionId);
    
    if (existingChatIndex !== -1) {
      savedChats[existingChatIndex] = {
        ...savedChats[existingChatIndex],
        ...chat,
        timestamp: new Date().toISOString()
      };
    } else {
      savedChats.push(chat);
    }
    
    localStorage.setItem('savedChats', JSON.stringify(savedChats));

    // Save to Firestore if user is properly authenticated
    if (auth.currentUser?.uid) {
      const retryCount = 3;
      let lastError;

      for (let i = 0; i < retryCount; i++) {
        try {
          await saveFirestoreChat(auth.currentUser.uid, chat);
          return;
        } catch (firestoreError) {
          lastError = firestoreError;
          console.error(`Firestore save attempt ${i + 1}/${retryCount} failed:`, firestoreError);

          if (firestoreError.code === 'permission-denied') {
            console.warn('Permission denied accessing Firestore. Please ensure you are properly authenticated.');
            break;
          } else if (firestoreError.code === 'not-found') {
            console.warn('Firestore collection or document not found. Check your database structure.');
            break;
          } else if (firestoreError.code?.includes('unavailable') || firestoreError.code?.includes('network-request-failed')) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            continue;
          }

          console.warn('Failed to save to Firestore, but saved to localStorage.');
          break;
        }
      }

      if (lastError) {
        console.warn('All Firestore save attempts failed. Data saved to localStorage only.');
      }
    }
  } catch (error) {
    console.error('Failed to save chat:', error);
    throw error; // Rethrow if localStorage save fails
  }
};

export const getSavedChats = async () => {
  try {
    // First get local chats as a fallback
    const localChats = JSON.parse(localStorage.getItem('savedChats') || '[]');
    
    // If user is authenticated, try to get chats from Firestore
    if (auth.currentUser?.uid) {
      try {
        const firestoreChats = await getFirestoreChats(auth.currentUser.uid);
        // Update localStorage with Firestore data to keep them in sync
        localStorage.setItem('savedChats', JSON.stringify(firestoreChats));
        return firestoreChats;
      } catch (firestoreError) {
        console.error('Firestore error:', firestoreError.code, firestoreError.message);
        if (firestoreError.code === 'permission-denied') {
          console.warn('Permission denied accessing Firestore. Please check authentication status.');
        }
        // Return local chats on Firestore error
        return localChats;
      }
    }
    // Return local chats if not authenticated
    return localChats;
  } catch (error) {
    console.error('Failed to get saved chats:', error);
    return [];
  }
};

export const deleteChat = (sessionId) => {
  try {
    const savedChats = getSavedChats();
    const updatedChats = savedChats.filter(chat => chat.sessionId !== sessionId);
    localStorage.setItem('savedChats', JSON.stringify(updatedChats));
  } catch (error) {
    console.error('Failed to delete chat:', error);
  }
};

export const deleteAllChats = () => {
  try {
    localStorage.setItem('savedChats', '[]');
  } catch (error) {
    console.error('Failed to delete all chats:', error);
  }
};