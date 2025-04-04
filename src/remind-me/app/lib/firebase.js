// lib/firebase.js
import { initializeApp } from "firebase/app";

const API_KEY = process.env.FIREBASE_API_KEY;
const APP_ID = process.env.FIREBASE_APP_ID;

import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";

// Firebase client config
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: "cs-25-317.firebaseapp.com",
  projectId: "cs-25-317",
  storageBucket: "cs-25-317.firebasestorage.app",
  messagingSenderId: "920068607900",
  appId: APP_ID,
};

// Initialize Firebase app (only once)
const app = initializeApp(firebaseConfig);

// Async-safe messaging getter
export const getFirebaseMessaging = async () => {
  if (typeof window === "undefined") return null;

  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

// Named exports for use in NotificationSetup
export { getToken, onMessage };
