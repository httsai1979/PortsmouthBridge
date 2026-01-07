import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Firebase configuration
// For production, consider using environment variables via a build system
const firebaseConfig = {
  apiKey: "AIzaSyBn65frWFbl1tKGFA0kliY7Btj9QtG2-7c",
  authDomain: "portsmouthbridge.firebaseapp.com",
  projectId: "portsmouthbridge",
  storageBucket: "portsmouthbridge.firebasestorage.app",
  messagingSenderId: "488637125012",
  appId: "1:488637125012:web:d964265b4d7241f9aeff81",
  measurementId: "G-LPBHXSSYP9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence for PWA support
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time
    console.warn('Firestore persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // The current browser does not support all features required
    console.warn('Firestore persistence not available in this browser');
  }
});

export default app;
