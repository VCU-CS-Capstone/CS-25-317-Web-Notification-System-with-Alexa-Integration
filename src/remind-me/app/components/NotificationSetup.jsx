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

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

function NotificationSetupCompat({ userId = 1 }) {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [timeFormat, setTimeFormat] = useState('12hour');
  
  // Track service worker registration status
  const [swRegistered, setSwRegistered] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);

  // Load user notification settings from database
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        // Get username from localStorage
        const username = localStorage.getItem("username");
        if (!username) return;
        
        // Get user ID from database
        // Fetch all users for case-insensitive matching
        const { data: allUsers, error: usersError } = await supabase
          .from("users")
          .select("id, username");
        
        if (usersError) throw usersError;
        
        // Find user with case-insensitive match
        const userData = allUsers.find(u => 
          u.username && u.username.toLowerCase() === username.toLowerCase()
        );
        
        if (!userData) {
          throw new Error("User not found with username: " + username);
        }
        
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
  
  // Register service worker only once when component mounts
  useEffect(() => {
    // Check permission on mount
    if (Notification.permission === "granted") {
      setPermissionGranted(true);
    }
    
    // Function to handle service worker registration
    const setupServiceWorker = async () => {
      if (!navigator.serviceWorker) {
        console.warn("Service workers are not supported in this browser");
        return null;
      }
      
      try {
        // Get all existing registrations
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        // Find any existing Firebase service workers
        const firebaseSWs = registrations.filter(
          reg => reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')
        );
        
        // If we have duplicates, clean them up
        if (firebaseSWs.length > 1) {
          console.log(`Found ${firebaseSWs.length} Firebase service workers, cleaning up...`);
          // Keep the first one and unregister the rest
          await Promise.all(firebaseSWs.slice(1).map(async (reg) => {
            console.log("Unregistering duplicate service worker:", reg.scope);
            await reg.unregister();
          }));
          return firebaseSWs[0];
        } 
        // If we have exactly one service worker, use it
        else if (firebaseSWs.length === 1) {
          console.log("Using existing Firebase Service Worker:", firebaseSWs[0].scope);
          return firebaseSWs[0];
        } 
        // If we have no service workers, register one - but only if allowed by our state
        else if (!swRegistered) {
          console.log("No Firebase Service Worker found, registering new one");
          const newRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
            scope: '/' // Explicitly set scope to root to prevent scope issues
          });
          setSwRegistered(true);
          return newRegistration;
        }
        
        return null;
      } catch (error) {
        console.error("Error setting up service worker:", error);
        return null;
      }
    };
    
    // Only try to setup if we haven't already registered
    if (!swRegistered && notificationEnabled) {
      setupServiceWorker().then(registration => {
        if (registration) {
          setSwRegistration(registration);
          console.log("Service Worker successfully setup:", registration.scope);
          
          // Set up foreground notification handler
          window.lastNotificationId = window.lastNotificationId || null;
        }
      });
    }
  }, [swRegistered, notificationEnabled]);
  // Set up message handler in a separate effect to avoid duplicate listeners
  useEffect(() => {
    if (notificationEnabled && swRegistration) {
      // Set up foreground notification handler
      const messageHandler = (payload) => {
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
      };
      
      // Set up the message handler
      const unsubscribe = messaging.onMessage(messageHandler);
      
      // Clean up the handler when component unmounts or dependencies change
      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
  }, [notificationEnabled, swRegistration]);

  const handleEnableNotifications = async () => {
    try {
      // First check if we already have permission to avoid duplicate requests
      if (Notification.permission === "granted") {
        console.log("Notification permission already granted.");
        setPermissionGranted(true);
        getTokenAndSendToBackend();
        return;
      }
      
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        console.log("Notification permission granted.");
        setPermissionGranted(true);
        // We already have a service worker registered from the initial setup
        // No need to register again
        getTokenAndSendToBackend();
      } else {
        console.warn("Notification permission denied.");
      }
    } catch (err) {
      console.error("Permission error:", err);
    }
  };

  const getTokenAndSendToBackend = async () => {
    try {
      // Make sure we're using the existing service worker registration
      // This ensures we don't create a new service worker when getting token
      if (!swRegistration) {
        console.error("No service worker registration available for messaging");
        return;
      }
      
      const token = await messaging.getToken({ 
        vapidKey,
        serviceWorkerRegistration: swRegistration
      });
      
      if (token) {
        console.log("📲 FCM Token:", token);
        await sendTokenToBackend(token);
      } else {
        console.warn("⚠️ No registration token available.");
      }
    } catch (err) {
      console.error("Token error:", err);
    }
  };

  const sendTokenToBackend = async (token) => {
    try {
      // First, try to save the token through the API
      const response = await fetch("/api/save-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, userId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Token saved via API:", data);
        checkDeviceRegistration(token);
        return;
      }
      
      console.warn("API route failed, falling back to direct database insertion.");
      // If API fails, fall back to direct database insertion
      await saveTokenDirectly(token);
    } catch (err) {
      console.error("Error saving token:", err);
      // Try direct database insertion as a last resort
      try {
        await saveTokenDirectly(token);
      } catch (dbError) {
        console.error("Failed to save token directly to database:", dbError);
      }
      // In any case, we'll check device registration
      checkDeviceRegistration(token);
    }
  };
  
  // Directly save token to database as a fallback
  const saveTokenDirectly = async (token) => {
    try {
      // Get user ID from database
      const username = localStorage.getItem("username");
      if (!username) throw new Error("No username found in localStorage");
      
      // Fetch all users for case-insensitive matching
      const { data: allUsers, error: usersError } = await supabase
        .from("users")
        .select("id, username");
      
      if (usersError) throw usersError;
      
      // Find user with case-insensitive match
      const userData = allUsers.find(u => 
        u.username && u.username.toLowerCase() === username.toLowerCase()
      );
      
      if (!userData) throw new Error("User not found with username: " + username);
      
      // Use upsert instead of insert to handle unique device tokens
      // This avoids duplicates and race conditions
      const { error: upsertError } = await supabase
        .from("user_devices")
        .upsert(
          {
            user_id: userData.id,
            device_token: token
          },
          {
            // The conflict target is the device_token column which is now unique
            onConflict: 'device_token',
            // Update the user_id if there's a conflict
            ignoreDuplicates: false
          }
        );
      
      if (upsertError) throw upsertError;
      
      console.log("Token saved directly to database using upsert");
    } catch (error) {
      console.error("Error in saveTokenDirectly:", error);
      throw error; // Re-throw to handle in the calling function
    }
  };
  
  // Function to check if the device is registered in the database
  const checkDeviceRegistration = async (token) => {
    try {
      // Get username from localStorage
      const username = localStorage.getItem("username");
      if (!username) return;
      
      // Get user ID from database
      // Fetch all users for case-insensitive matching
      const { data: allUsers, error: usersError } = await supabase
        .from("users")
        .select("id, username");
      
      if (usersError) throw usersError;
      
      // Find user with case-insensitive match
      const userData = allUsers.find(u => 
        u.username && u.username.toLowerCase() === username.toLowerCase()
      );
      
      if (!userData) {
        throw new Error("User not found with username: " + username);
      }
      
      // Check if device exists in user_devices table
      const { data: deviceData, error: deviceError } = await supabase
        .from("user_devices")
        .select("id")
        .eq("user_id", userData.id)
        .eq("device_token", token);
      
      if (deviceError) throw deviceError;
      
      // If device exists, set permissionGranted to true
      if (deviceData && deviceData.length > 0) {
        setPermissionGranted(true);
      } else {
        // If no device found, we'll still set permissionGranted to false
        // to ensure the notification popup shows
        console.log("No device registration found in database");
        setPermissionGranted(false);
      }
    } catch (error) {
      console.error("Error checking device registration:", error);
      // If there's an error, we'll set permissionGranted to false
      // to ensure the notification popup shows
      setPermissionGranted(false);
    }
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

export default NotificationSetupCompat;
