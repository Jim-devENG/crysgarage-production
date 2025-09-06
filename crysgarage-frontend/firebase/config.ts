import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQ-9yzghDHlRpJV8dJvMK6nSqzq9Q6sYU",
  authDomain: "crys-garage-61dd7.firebaseapp.com",
  projectId: "crys-garage-61dd7",
  storageBucket: "crys-garage-61dd7.firebasestorage.app",
  messagingSenderId: "279106325167",
  appId: "1:279106325167:web:ec15af67f7811771e6225a",
  measurementId: "G-0FVPVPEVP4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});


export default app;
