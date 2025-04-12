"use client";
import React, { useEffect } from "react";
import firebase from "firebase/app";
import "firebase/messaging";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA1lMW1D2wtXDHsuFJKvuerRbRjK39y0YM",
  authDomain: "cs-25-317.firebaseapp.com",
  projectId: "cs-25-317",
  storageBucket: "cs-25-317.appspot.com",
  messagingSenderId: "920068607900",
  appId: "1:920068607900:web:e02406c989697efeec0259",
};

const vapidKey = "BAloxObNIPRr9QujTLBgmGOQn_kVDcPlm9VXPXYOkJm3WVJLVcb2_SDJLMnw-JF3nYpdOwPtK2NO1hN0QrR30X8";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

export default function NotificationSetupCompat({ userId = 1 }) {
  useEffect(() => {
    // Register service worker if not already registered
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration.scope);

          // Handle foreground messages
          messaging.onMessage((payload) => {
            console.log(" Foreground message received:", payload);
            const { title, body } = payload.notification;

            if (Notification.permission === "granted") {
              new Notification(title, {
                body,
                icon: "/icon.png",
                badge: "/badge.png",
              });
            }
          });
        })
        .catch((err) => console.error("Service Worker registration failed:", err));
    }
  }, []);

  const handleEnableNotifications = () => {
    Notification.requestPermission()
      .then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
          getTokenAndSendToBackend();
        } else {
          console.warn("Notification permission denied.");
        }
      })
      .catch((err) => console.error("Permission error:", err));
  };

  const getTokenAndSendToBackend = () => {
    messaging
      .getToken({ vapidKey }) // Just pass the VAPID key
      .then((token) => {
        if (token) {
          console.log("📲 FCM Token:", token);
          sendTokenToBackend(token);
        } else {
          console.warn("⚠️ No registration token available.");
        }
      })
      .catch((err) => console.error("Token error:", err));
  };

  const sendTokenToBackend = (token) => {
    fetch("http://localhost:3002/save-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, userId }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((data) => console.log("Token saved:", data))
      .catch((err) => {
        console.error("Backend error:", err);
        alert(`Error saving token: ${err}`);
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

