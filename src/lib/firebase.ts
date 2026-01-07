import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your actual Firebase project configuration from the Firebase Console
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

export default app;
