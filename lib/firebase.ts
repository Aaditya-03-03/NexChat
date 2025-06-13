// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBwyrEf-f1BbvfGtp25UGeKVSUVPs9rFys",
  authDomain: "nexchat-86e4c.firebaseapp.com",
  projectId: "nexchat-86e4c",
  storageBucket: "nexchat-86e4c.firebasestorage.app",
  messagingSenderId: "396988116917",
  appId: "1:396988116917:web:b9e8a49f19e5df2d1eb3fc",
  measurementId: "G-97284Y9XML"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics and export it
// Note: Analytics only works in the browser, so we need to check if we're in a browser environment
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export { app, analytics }; 