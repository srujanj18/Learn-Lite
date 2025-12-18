# Fix Saved Chats Deletion Error

## Tasks
- [x] Add delete functions to firestoreService.js
  - [x] `deleteFirestoreChat(userId, chatId)`: Delete a specific chat document from Firestore
  - [x] `deleteAllFirestoreChats(userId)`: Delete all chat documents for a user from Firestore
- [x] Update chatStorage.js
  - [x] Make `deleteChat` and `deleteAllChats` async
  - [x] Add Firestore deletion logic when user is authenticated
  - [x] Add error handling and fallbacks
  - [x] Ensure localStorage is updated only after successful operations
- [x] Fix SavedChats.jsx
  - [x] Make `handleDelete` and `handleDeleteAll` async and await the delete operations
  - [x] Add proper error handling with user feedback (toast notifications)
  - [x] Update state correctly after deletion

## Followup Steps
- [x] Test deletion functionality after changes
- [x] Verify that chats are removed from both localStorage and Firestore
- [x] Ensure error messages are user-friendly if deletion fails
