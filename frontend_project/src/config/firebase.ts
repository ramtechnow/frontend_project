import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Environment variables configuration with production fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAbhOjpXJb88Dan3-tWS9rkBUOX0ND_6kI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ecommerce-website-dfd55.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ecommerce-website-dfd55",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ecommerce-website-dfd55.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "128549464864",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:128549464864:web:f6d80c86bf13ccdd30c545",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-L194PK372N"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
