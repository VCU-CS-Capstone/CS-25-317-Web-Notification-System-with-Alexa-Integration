"use client";

import { useEffect } from "react";
import { messaging, firebaseConfig } from "../config/firebase";
import { getToken } from "firebase/messaging";

export const useFirebaseNotifications = () => {
  useEffect(() => {
    if (typeof window === "undefined" || !messaging) return;

    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            getToken(messaging, {
              vapidKey: firebaseConfig.vapidKey,
              serviceWorkerRegistration: registration,
            })
              .then((token) => {
                console.log("FCM Token:", token);
                saveToken(token); // Replace this with actual backend logic
              })
              .catch((err) => console.error("Token error:", err));
          } else {
            alert("Notifications denied.");
          }
        });
      })
      .catch((err) => console.error("SW registration error:", err));
  }, []);
};

const saveToken = (token) => {
  fetch("http://localhost:5001/save-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, userId: 1 }),
  })
    .then((res) => res.json())
    .then((data) => console.log("Token saved:", data))
    .catch((err) => console.error("Save token error:", err));
};
