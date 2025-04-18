"use client";
import React, { useEffect, useState } from "react";
import firebase from "firebase/app";
import "firebase/messaging";

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
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration.scope);

          // Set up foreground notification handler
          // We'll use a flag to prevent duplicate notifications
          window.lastNotificationId = window.lastNotificationId || null;
          
          messaging.onMessage((payload) => {
            console.log("Foreground message received:", payload);
            
            // Generate a notification ID based on content and timestamp
            const notificationId = `${payload.notification?.title}-${Date.now()}`;
            
            // Check if this is a duplicate notification (received within last 2 seconds)
            if (window.lastNotificationId && 
                window.lastNotificationId.split('-')[0] === notificationId.split('-')[0] && 
                Date.now() - parseInt(window.lastNotificationId.split('-')[1]) < 2000) {
              console.log("Duplicate notification detected, ignoring");
              return;
            }
            
            // Store this notification ID
            window.lastNotificationId = notificationId;
            
            // Only show notification in foreground if we're not already showing it in the background
            // This prevents duplicate notifications
            if (document.visibilityState === "visible" && Notification.permission === "granted") {
              const { title, body } = payload.notification;
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

    // Check permission on mount
    if (Notification.permission === "granted") {
      setPermissionGranted(true);
    }
  }, []);

  const handleEnableNotifications = () => {
    Notification.requestPermission()
      .then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
          setPermissionGranted(true);
          getTokenAndSendToBackend();
        } else {
          console.warn("Notification permission denied.");
        }
      })
      .catch((err) => console.error("Permission error:", err));
  };

  const getTokenAndSendToBackend = () => {
    messaging
      .getToken({ vapidKey })
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
    fetch("/api/save-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, userId }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)))
      .then((data) => console.log("Token saved:", data))
      .catch((err) => {
        console.error("Backend error:", err);
        alert(`Error saving token: ${err}`);
        setPermissionGranted(false);
      });
  };

  return (
    <>
      {!permissionGranted && (
        <button
          onClick={handleEnableNotifications}
          className="fixed bottom-[80px] right-6 px-5 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition duration-200 border-2 border-black"
        >
          Enable Notifications
        </button>
      )}
    </>
  );
}
