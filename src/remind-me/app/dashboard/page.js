"use client";

import React, { useState, useEffect } from "react";
import { ReminderCard } from "../components/ReminderCard";
import BottomNavbar from "../components/BottomNavbar";
import { Popup } from "../components/Popup";
import { supabase } from "../lib/supabaseClient"; // Import Supabase client
import dynamic from "next/dynamic";
import { getFirebaseMessaging, getToken, onMessage} from "../lib/firebase"; 

// Dynamically import NotificationSetup with explicit default export
const NotificationSetup = dynamic(
  () => import("../components/NotificationSetup").then((mod) => mod.default),
  { ssr: false }
);


const Dashboard = () => {
  const [reminders, setReminders] = useState([]);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [userId, setUserId] = useState(0);

  useEffect(() => {

    const setupMessaging = async () => {
      try {
        const messaging = await getFirebaseMessaging();
        if (!messaging) {
          console.error('Firebase messaging is not supported in this environment');
          return;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('Notification permission not granted');
          return;
        }

        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: 'BAloxObNIPRr9QujTLBgmGOQn_kVDcPlm9VXPXYOkJm3WVJLVcb2_SDJLMnw-JF3nYpdOwPtK2NO1hN0QrR30X8',
        });
        console.log('FCM Token:', token);

        // Handle foreground messages
        onMessage(messaging, (payload) => {
          console.log('Foreground message received:', payload);
          const { title, body } = payload.notification;
          new Notification(title, { body });
        });
      } catch (err) {
        console.error('Error setting up messaging:', err);
      }
    };

    setupMessaging();
  }, []);

  // Function to retrieve the token from Firebase
  async function getTokenFromFirebase() {
    const messaging = await getFirebaseMessaging();
    if (messaging) {
      const currentToken = await getToken(messaging, {
        vapidKey: "BAloxObNIPRr9QujTLBgmGOQn_kVDcPlm9VXPXYOkJm3WVJLVcb2_SDJLMnw-JF3nYpdOwPtK2NO1hN0QrR30X8", 
      });
      return currentToken;
    }
    return null;
  }

  // Function to save token to your backend (e.g., Express server)
  async function saveTokenToBackend(token, userId) {
    const response = await fetch("http://localhost:3000/save-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, userId }),
    });
    const data = await response.json();
    if (data.message) {
      console.log("Token saved successfully:", data.message);
    }
  }

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    }
  }, []);

  const handleCardClick = (reminder) => {
    setSelectedReminder(reminder);
  };

  const closePopup = () => {
    setSelectedReminder(null);
  };

  // Fetch userId on component mount
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');

    if (storedUsername && storedUsername !== "null" && storedUsername.trim() !== "") {
      const fetchUserId = async () => {
        const { data, error } = await supabase
          .from("users")
          .select("id")
          .eq("username", storedUsername)
          .single(); // Ensure single user result

        if (error || !data) {
          setError("User not found or error occurred");
          console.error("Error:", error);
        } else {
          setUserId(data.id);
        }
      };

      fetchUserId();
    } else {
      setError("No valid username found in localStorage.");
      console.log("Username is invalid or null");
    }
  }, []); 

  function tConvert(time) {
    // Convert 24-hour time to 12-hour format with AM/PM
    if (time === null) return null;
    time = time
      .toString()
      .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
    if (time.length > 1) {
      time = time.slice(1);
      time[5] = +time[0] < 12 ? "AM" : "PM";
      time[0] = +time[0] % 12 || 12;
    }
    return time.join("");
  }

  // Use Supabase to fetch reminders
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchReminders = async (date = new Date()) => {
    localStorage.setItem('userId', userId);
    setLoading(true);
    setError(null);
    try {
      const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("userid", userId)
        .eq("event_date", formattedDate) // Filter by selected date
        .order("start_time", {ascending: true});

      if (error) throw error;

      const formattedData = data.map((event) => ({
        id: event.id,
        title: event.event_name,
        startTime: tConvert(event.start_time),
        endTime: tConvert(event.end_time),
        interval: event.interval,
        date: event.event_date,
      }));
      setReminders(formattedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reminders when userId is set
  useEffect(() => {
    if (userId) {
      fetchReminders(); // Call fetchReminders after setting userId
    }
  }, [userId]); // Runs whenever userId changes


  // Use Supabase to delete reminders
  const handleDelete = async () => {
    if (!selectedReminder) return;
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", selectedReminder.id);

      if (error) throw error;

      // Refresh reminders after deletion
      closePopup();
      fetchReminders(selectedDate);
    } catch (err) {
      console.error("Error deleting reminder:", err.message);
    }
  };

  useEffect(() => {
    fetchReminders(selectedDate);
  }, [selectedDate]);

  return (
    <>
      {/* NotificationSetup will handle Firebase notifications */}
      <NotificationSetup
        userId={1}
        handleDelete={handleDelete}
        selectedReminder={selectedReminder}
      />
      <div className="min-h-screen flex flex-col bg-white">
        <div className="flex-grow p-4">
          <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">
            {selectedDate.toLocaleDateString()}
          </h2>
          {loading && (
            <p className="text-center text-gray-800">Loading reminders...</p>
          )}
          {error && <p className="text-center text-red-500">Error: {error}</p>}
          <div className="grid place-items-center grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {reminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                title={reminder.title}
                startTime={tConvert(reminder.startTime)}
                date={reminder.date}
                onClick={() => handleCardClick(reminder)}
              />
            ))}
          </div>
        </div>

        {selectedReminder && selectedReminder.startTime &&(
          <Popup
            selectedReminder={selectedReminder}
            closePopup={closePopup}
            handleDelete={handleDelete}
          />
        )}

        <BottomNavbar
          reminders={reminders}
          setReminders={setReminders}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          fetchReminders={fetchReminders}
          selectedReminder={selectedReminder}
        />
      </div>
    </>
  );
};

export default Dashboard;

