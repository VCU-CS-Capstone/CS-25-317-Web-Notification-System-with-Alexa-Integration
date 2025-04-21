"use client";
import React, { useEffect, useState } from "react";
import firebase from "firebase/app";
import "firebase/messaging";
import { supabase } from "../lib/supabaseClient";

// Helper functions for formatting date and time
function formatTime(timeString) {
  if (!timeString) return '';
  
  try {
    // Check user's time format preference from localStorage
    const timeFormat = localStorage.getItem('timeFormat') || '12hour';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    
    if (timeFormat === '24hour') {
      // 24-hour format (military time)
      return `${hours.padStart(2, '0')}:${minutes}`;
    } else {
      // 12-hour format with AM/PM
      const period = h >= 12 ? 'PM' : 'AM';
      const hour = h % 12 || 12; // Convert 0 to 12 for 12 AM
      return `${hour}:${minutes} ${period}`;
    }
  } catch (e) {
    console.error('Error formatting time:', e);
    return timeString;
  }
}

function formatDate(dateString) {
  if (!dateString) return '';
  
  try {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString;
  }
}

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
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [timeFormat, setTimeFormat] = useState('12hour');

  // Load user notification settings from database
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        // Get username from localStorage
        const username = localStorage.getItem("username");
        if (!username) return;
        
        // Get user ID from database
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("username", username)
          .single();
        
        if (userError) throw userError;
        
        // Get user settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("user_settings")
          .select("notification_enabled, time_type")
          .eq("user_id", userData.id);
        
        if (settingsError) throw settingsError;
        
        // Apply settings if available
        if (settingsData && settingsData.length > 0) {
          const settings = settingsData[0];
          if (settings.notification_enabled !== null && settings.notification_enabled !== undefined) {
            setNotificationEnabled(settings.notification_enabled);
          }
          
          // Set time format if available
          if (settings.time_type) {
            setTimeFormat(settings.time_type);
          }
        }
      } catch (error) {
        console.error("Error loading notification settings:", error);
      }
    };
    
    loadNotificationSettings();
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator && notificationEnabled) {
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
              
              // Format the event time for display
              const eventData = payload.data || {};
              const eventTime = eventData.eventTime ? formatTime(eventData.eventTime) : '';
              const eventDate = eventData.eventDate ? formatDate(eventData.eventDate) : '';
              
              // Create a more professional notification
              const enhancedBody = eventTime ? 
                `${body}\n\nScheduled for: ${eventDate} at ${eventTime}` : 
                body;
              
              // Create notification with enhanced settings
              const notification = new Notification(title, {
                body: enhancedBody,
                icon: "/logo192.png", // Use a higher quality icon
                badge: "/badge.png",
                tag: eventData.id || 'reminder', // Group similar notifications
                renotify: true, // Notify even if a notification with the same tag exists
                requireInteraction: true, // Don't auto-close on desktop
                vibrate: [200, 100, 200], // Vibration pattern for mobile
                actions: [
                  {
                    action: 'view',
                    title: 'View Details'
                  },
                  {
                    action: 'dismiss',
                    title: 'Dismiss'
                  }
                ]
              });
              
              // Handle notification clicks
              notification.onclick = function() {
                // Focus on the window if it's open
                window.focus();
                // Navigate to the dashboard or specific reminder
                if (eventData.id) {
                  window.location.href = `/dashboard?reminder=${eventData.id}`;
                } else {
                  window.location.href = '/dashboard';
                }
                notification.close();
              };
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

  // Check if we're in high contrast mode
  const [isHighContrast, setIsHighContrast] = useState(true);
  
  useEffect(() => {
    // Check if any color mode class is applied to html element
    const htmlElement = document.documentElement;
    const hasLightClass = htmlElement.classList.contains('light');
    const hasDarkClass = htmlElement.classList.contains('dark');
    
    // If neither light nor dark class is present, we're in high contrast mode
    setIsHighContrast(!hasLightClass && !hasDarkClass);
    
    // Set up a mutation observer to detect class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const hasLightClass = htmlElement.classList.contains('light');
          const hasDarkClass = htmlElement.classList.contains('dark');
          setIsHighContrast(!hasLightClass && !hasDarkClass);
        }
      });
    });
    
    observer.observe(htmlElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {!permissionGranted && notificationEnabled && (
        <button
          onClick={handleEnableNotifications}
          className={`
            fixed bottom-[80px] right-6 px-5 py-3 font-semibold rounded-lg shadow-lg 
            transition duration-200 flex items-center gap-2
            ${isHighContrast 
              ? 'bg-green-500 text-black hover:bg-green-600 border border-black' 
              : 'bg-[var(--accent-color)] text-[var(--text-on-accent)] hover:bg-[var(--accent-color-hover)]'}
          `}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Enable Notifications
        </button>
      )}
    </>
  );
}
