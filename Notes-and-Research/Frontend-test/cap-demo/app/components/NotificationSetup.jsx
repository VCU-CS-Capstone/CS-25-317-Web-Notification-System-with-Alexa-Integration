"use client";
import React, { useState, useEffect } from "react";
import { getFirebaseMessaging, getToken, onMessage } from "../lib/firebase";
import { Popup } from "./Popup";

const NotificationSetup = ({
  userId = 1,
  handleDelete,
  selectedReminderFromPage,
}) => {
  const [notification, setNotification] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    let messaging;
    (async () => {
      messaging = await getFirebaseMessaging();
      if (!messaging) {
        console.error("Firebase messaging is not supported in this browser.");
        return;
      }

      try {
        const currentToken = await getToken(messaging, {
          vapidKey:
            "BAloxObNIPRr9QujTLBgmGOQn_kVDcPlm9VXPXYOkJm3WVJLVcb2_SDJLMnw-JF3nYpdOwPtK2NO1hN0QrR30X8",
        });

        console.log("🔑 FCM Token: ", currentToken);

        if (currentToken && currentToken.startsWith("d")) {
          setToken(currentToken);

          const response = await fetch("http://localhost:3002/save-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: currentToken, userId }),
          });

          const data = await response.json();
          console.log("Token saved on backend:", data);
        } else {
          console.log("No registration token available.");
        }
      } catch (error) {
        console.error("An error occurred while retrieving token.", error);
      }

      onMessage(messaging, (payload) => {
        console.log("📬 Message received in foreground:", payload);
        setNotification(payload);
        setLocalSelectedReminder({
          title: payload.notification?.title || "No Title",
          description: payload.notification?.body || "No description",
        });
      });
    })();
  }, []);

  return (
    <div className="bg-gray-50 flex flex-col items-center justify-center p-4">
      {notification && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg relative max-w-md w-full border border-gray-300 transition-transform transform hover:scale-105">
            <button
              onClick={() => setNotification(null)}
              className="absolute top-3 right-3 text-gray-500 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-all"
            >
              ✖
            </button>
            <h4 className="font-bold text-2xl text-gray-900 mb-3">
              {notification.notification?.title || "No Title"}
            </h4>
            <p className="text-gray-700 text-base leading-relaxed">
              {notification.notification?.body || "No message body available."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSetup;
