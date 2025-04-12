"use client";

import React, { useState, useEffect } from "react";
import { ReminderCard } from "../components/ReminderCard";
import BottomNavbar from "../components/BottomNavbar";
import  Popup from "../components/Popup";
import { supabase } from "../lib/supabaseClient";
import dynamic from "next/dynamic";

const NotificationSetup = dynamic(() => import("../components/NotificationSetup"), {
  ssr: false,
});

const Dashboard = () => {
  const [reminders, setReminders] = useState([]);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());

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
          .single();

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

  function removeSeconds(time) {
    if (!time) return null;
  
    const parts = time.split(":");
    if (parts.length < 2) return time; // if time is not properly formatted
  
    return `${parts[0]}:${parts[1]}`;
  }

  const fetchReminders = async (date = new Date()) => {
    localStorage.setItem('userId', userId);
    setLoading(true);
    setError(null);
    try {
      let formattedDate; 
      if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        formattedDate = date; 
      } else {
        const dateObj = new Date(date);
        formattedDate = dateObj.toISOString().split("T")[0];
      }

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("userid", userId)
        .eq("event_date", formattedDate)
        .order("start_time", {ascending: true});

      if (error) throw error;

      const formattedData = data.map((event) => ({
        id: event.id,
        title: event.event_name,
        startTime: removeSeconds(event.start_time),
        endTime: removeSeconds(event.end_time),
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

  useEffect(() => {
    if (userId) {
      fetchReminders();
    }
  }, [userId]);

  const handleDelete = async () => {
    if (!selectedReminder) return;
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", selectedReminder.id);

      if (error) throw error;

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
                startTime={removeSeconds(reminder.startTime)}
                date={reminder.date}
                onClick={() => handleCardClick(reminder)}
              />
            ))}
          </div>
        </div>

        {selectedReminder && selectedReminder.startTime && (
          <Popup
            selectedReminder={selectedReminder}
            closePopup={closePopup}
            handleDelete={handleDelete}
            fetchReminders={fetchReminders}
          />
        )}

        {/* Notification Setup Component */}
        <NotificationSetup userId={userId} />

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