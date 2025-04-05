// public/firebase-messaging-sw.js

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

importScripts(
  "https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: API_KEY,
  authDomain: "cs-25-317.firebaseapp.com",
  projectId: "cs-25-317",
  storageBucket: "cs-25-317.firebasestorage.app",
  messagingSenderId: "920068607900",
  appId: APP_ID,
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message",
    payload
  );

  const notificationTitle = payload?.notification?.title || "Notification";
  const notificationOptions = {
    body: payload?.notification?.body || "You have a new message.",
    icon: "/icon.png", // Optional: Replace with your logo
    data: payload?.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
