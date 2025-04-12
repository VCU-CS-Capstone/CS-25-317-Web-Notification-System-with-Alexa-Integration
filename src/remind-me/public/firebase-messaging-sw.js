// public/firebase-messaging-sw.js

importScripts(
  "https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyA1lMW1D2wtXDHsuFJKvuerRbRjK39y0YM",
  authDomain: "cs-25-317.firebaseapp.com",
  projectId: "cs-25-317",
  storageBucket: "cs-25-317.firebasestorage.app",
  messagingSenderId: "920068607900",
  appId: "1:920068607900:web:e02406c989697efeec0259",
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
