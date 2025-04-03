"use client";

import React, { useState, useEffect } from "react";
import { ReminderCard } from "./components/ReminderCard";
import BottomNavbar from "./components/BottomNavbar";
import { Popup } from "./components/Popup";
import { supabase } from "./lib/supabaseClient"; // Import Supabase client
import dynamic from "next/dynamic";

// Dynamically import NotificationSetup with explicit default export
const NotificationSetup = dynamic(
  () => import("./components/NotificationSetup").then((mod) => mod.default),
  { ssr: false }
);

const Home = () => {
  const [reminders, setReminders] = useState([]);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

   // Use Supabase to fetch reminders
   const fetchReminders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("events") 
        .select("*")
        .eq("userid", 1); // Filter by user ID

      if (error) throw error;

      const formattedData = data.map((event) => ({
        id: event.id,
        title: event.event_name,
        time: event.start_time,
        date: event.event_date,
      }));
      setReminders(formattedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Use Supabase to delete reminders
  const handleDelete = async () => {
    if (!selectedReminder) return;
    try {
      const { error } = await supabase
        .from("events") // Change to your actual table name
        .delete()
        .eq("id", selectedReminder.id);

      if (error) throw error;

      // Refresh reminders after deletion
      closePopup();
      fetchReminders();
    } catch (err) {
      console.error("Error deleting reminder:", err.message);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  function tConvert(time) {
    // Convert 24-hour time to 12-hour format with AM/PM
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
            Reminders
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
                time={tConvert(reminder.time)}
                date={reminder.date}
                onClick={() => handleCardClick(reminder)}
              />
            ))}
          </div>
        </div>

        {selectedReminder && (
          <Popup
            selectedReminder={selectedReminder}
            closePopup={closePopup}
            handleDelete={handleDelete}
          />
        )}

        <BottomNavbar reminders={reminders} setReminders={setReminders} />
      </div>
    </>
  );
};

export default Home;