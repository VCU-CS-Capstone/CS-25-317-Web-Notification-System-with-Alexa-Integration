"use client";
import React, { useEffect } from "react";

// Firebase Compat
import firebase from "firebase/compat/app";
import "firebase/compat/messaging";

// Optional: Move to firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyA1lMW1D2wtXDHsuFJKvuerRbRjK39y0YM",
  authDomain: "cs-25-317.firebaseapp.com",
  projectId: "cs-25-317",
  storageBucket: "cs-25-317.appspot.com",
  messagingSenderId: "920068607900",
  appId: "1:920068607900:web:e02406c989697efeec0259",
  vapidKey: "BAloxObNIPRr9QujTLBgmGOQn_kVDcPlm9VXPXYOkJm3WVJLVcb2_SDJLMnw-JF3nYpdOwPtK2NO1hN0QrR30X8"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

export default function NotificationSetupCompat({ userId = 1 }) {
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistration("/firebase-messaging-sw.js")
        .then((registration) => {
          if (!registration) {
            return navigator.serviceWorker.register("/firebase-messaging-sw.js");
          }
          console.log("Service Worker already registered:", registration.scope);
          return registration;
        })
        .then((registration) => {
          if (registration) {
            console.log("Using service worker for messaging:", registration.scope);
            messaging.useServiceWorker(registration);
          }
        })
        .catch((err) => console.error("Service Worker registration failed:", err));
    }

    // Handle incoming messages
    messaging.onMessage((payload) => {
      console.log("📬 Message received in foreground:", payload);
      const { title, body } = payload.notification;

      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/icon.png",
          badge: "/badge.png",
        });
      }
    });
  }, []);

  const handleEnableNotifications = () => {
    Notification.requestPermission()
      .then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
          getTokenAndSendToBackend();
        } else {
          console.warn("Notification permission denied.");
          alert("Notifications blocked!");
        }
      })
      .catch((err) => console.error("Error requesting permission:", err));
  };

  const getTokenAndSendToBackend = () => {
    navigator.serviceWorker.ready.then((registration) => {
      messaging
        .getToken({
          vapidKey: firebaseConfig.vapidKey,
          serviceWorkerRegistration: registration,
        })
        .then((token) => {
          if (token) {
            console.log("FCM Token:", token);
            sendTokenToBackend(token);
          } else {
            console.warn("No registration token available.");
          }
        })
        .catch((err) => console.error("Error getting FCM token:", err));
    });
  };

  const sendTokenToBackend = (token) => {
    fetch("http://localhost:3002/save-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, userId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
        return res.json();
      })
      .then((data) => console.log("✅ Token saved:", data))
      .catch((err) => {
        console.error("❌ Error saving token:", err);
        alert(`Error saving token: ${err.message}`);
      });
  };

  return (
    <button
      onClick={handleEnableNotifications}
      className="fixed bottom-6 right-6 px-5 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition duration-200"
    >
      Enable Notifications
    </button>
  );
}
