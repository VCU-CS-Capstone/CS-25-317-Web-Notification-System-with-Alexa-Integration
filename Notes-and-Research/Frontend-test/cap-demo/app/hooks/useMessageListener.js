"use client";

import { useEffect } from "react";
import { messaging } from "../config/firebase";
import { onMessage } from "firebase/messaging";

export const useMessageListener = () => {
  useEffect(() => {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      const { title, body } = payload.notification;
      new Notification(title, {
        body,
        icon: "/icon.png",
        badge: "/badge.png",
      });
    });
  }, []);
};
