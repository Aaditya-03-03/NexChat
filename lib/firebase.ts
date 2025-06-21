// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBwyrEf-f1BbvfGtp25UGeKVSUVPs9rFys",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "nexchat-86e4c.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nexchat-86e4c",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "nexchat-86e4c.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "396988116917",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:396988116917:web:b9e8a49f19e5df2d1eb3fc",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-97284Y9XML"
};

// Debug: Log environment variables (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase Config:', {
    apiKey: firebaseConfig.apiKey ? 'Set' : 'Missing',
    authDomain: firebaseConfig.authDomain ? 'Set' : 'Missing',
    projectId: firebaseConfig.projectId ? 'Set' : 'Missing',
    storageBucket: firebaseConfig.storageBucket ? 'Set' : 'Missing',
    messagingSenderId: firebaseConfig.messagingSenderId ? 'Set' : 'Missing',
    appId: firebaseConfig.appId ? 'Set' : 'Missing',
    measurementId: firebaseConfig.measurementId ? 'Set' : 'Missing',
  });
}

// Initialize Firebase with error handling
let app: FirebaseApp;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  // Create a fallback app with minimal config
  app = initializeApp({
    apiKey: "demo-key",
    authDomain: "demo.firebaseapp.com",
    projectId: "demo",
    storageBucket: "demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:demo"
  });
}

// Initialize Analytics and export it
// Note: Analytics only works in the browser, so we need to check if we're in a browser environment
let analytics: Analytics | undefined;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Failed to initialize Analytics:', error);
  }
}

// Initialize Firebase services with error handling
let auth: Auth | undefined, 
    db: Firestore | undefined, 
    storage: FirebaseStorage | undefined;

try {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log('Firebase services initialized successfully:', {
    auth: !!auth,
    db: !!db,
    storage: !!storage
  });
} catch (error) {
  console.error('Failed to initialize Firebase services:', error);
  // These will be undefined if initialization fails
}

export { app, analytics, auth, db, storage }; 