
// FIX: Replaced manual and incorrect ImportMeta definitions with the standard Vite client types reference.
/// <reference types="vite/client" />

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/functions';

// Your web app's Firebase configuration will now be loaded from environment variables
// To set these up, create a .env.local file in the root of your project and add your keys:
// VITE_FIREBASE_API_KEY="your-api-key"
// VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
// VITE_FIREBASE_PROJECT_ID="your-project-id"
// VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
// VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
// VITE_FIREBASE_APP_ID="your-app-id"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
export const functions = firebase.functions();

export default firebase;