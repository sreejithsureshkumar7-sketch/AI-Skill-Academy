// Firebase setup file
// 1. Create Firebase Project
// 2. Enable Authentication > Google Provider
// 3. Create Firestore Database
// 4. Replace below config with your Firebase config

export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Gemini API key is optional. Keep empty for offline demo mode.
export const GEMINI_API_KEY = "";
