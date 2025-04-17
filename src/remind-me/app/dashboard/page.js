"use client";

import React, { useState, useEffect, Suspense } from "react";
import { ReminderCard } from "../components/ReminderCard";
import BottomNavbar from "../components/BottomNavbar";
import Popup from "../components/Popup";
import { supabase } from "../lib/supabaseClient";
import dynamic from "next/dynamic";

const NotificationSetup = dynamic(() => import("../components/NotificationSetup"), {
  ssr: false,
});

if (typeof window !== "undefined") {
  window.onerror = function (message, source, lineno, colno, error) {
    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        source,
        lineno,
        colno,
        stack: error?.stack,
        userAgent: navigator.userAgent,
        time: new Date().toISOString(),
      }),
    });
  };
}

// Create a separate component that uses useSearchParams
import { useSearchParams } from "next/navigation";

function DashboardContent() {
  const searchParams = useSearchParams();
  const [reminders, setReminders] = useState([]);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Parse date from URL parameter
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      try {
        // Create a date from the YYYY-MM-DD format
        const [year, month, day] = dateParam.split('-').map(num => parseInt(num, 10));
        const newDate = new Date(year, month - 1, day);
        
        // Check if the date is valid
        if (!isNaN(newDate.getTime())) {
          setSelectedDate(newDate);
          console.log(`Date set from URL: ${dateParam}`);
        }
      } catch (err) {
        console.error("Error parsing date from URL:", err);
      }
    }
  }, [searchParams]);

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
          // Save userId to localStorage for other components to use
          localStorage.setItem('userId', data.id);
          console.log("Set userId in localStorage:", data.id);
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

  // Format date as MM-DD-YY without timezone conversion
  const formatDate = (date) => {
    let d;
    if (typeof date === 'string') {
      // Handle string date format (YYYY-MM-DD)
      if (date.includes('-')) {
        const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
        d = new Date(year, month - 1, day);
      } else {
        // Handle other string formats
        d = new Date(date);
      }
    } else {
      // Handle Date object
      d = new Date(date);
    }
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
  
    return `${month}-${day}-${year}`;
  };

  // Convert date to YYYY-MM-DD format for database queries without timezone issues
  const formatDateForDB = (date) => {
    let d;
    
    if (date instanceof Date) {
      d = date;
    } else if (typeof date === 'string') {
      // If it's already in YYYY-MM-DD format, return it
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      
      // Otherwise parse it
      d = new Date(date);
    } else {
      d = new Date();
    }
    
    // Use local date methods to prevent timezone issues
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const fetchReminders = async (date = new Date()) => {
    // Don't attempt to fetch if userId is not available yet
    if (!userId) {
      console.log("Cannot fetch reminders: No userId available");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Format the date for database query, preventing timezone issues
      const formattedDate = formatDateForDB(date);
      
      console.log(`Fetching reminders for userId: ${userId} on date: ${formattedDate}`);

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
        event_description: event.event_description, 
        is_complete: event.is_complete
      }));
      setReminders(formattedData);
      console.log(`Found ${formattedData.length} reminders for user ${userId}`);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching reminders:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchReminders(selectedDate);
    }
  }, [userId]);

  // Update when selected date changes
  useEffect(() => {
    if (userId) {
      fetchReminders(selectedDate);
    }
  }, [selectedDate]);

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

  return (
    <>
      <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
        <div className="flex-grow p-4">
          <h2 className="text-3xl font-bold mb-4 text-center text-[var(--text-primary)]">
            {formatDate(selectedDate)}
          </h2>
          {loading && (
            <p className="text-center text-[var(--text-secondary)]">Loading reminders...</p>
          )}
          {error && <p className="text-center text-red-500">Error: {error}</p>}
          <div className="grid place-items-center grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {reminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                title={reminder.title}
                startTime={removeSeconds(reminder.startTime)}
                date={reminder.date}
                event_description={reminder.event_description}
                is_complete={reminder.is_complete}
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
}

// Main Dashboard component with Suspense boundary
const Dashboard = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <p className="text-[var(--text-primary)] text-xl">Loading dashboard...</p>
    </div>}>
      <DashboardContent />
    </Suspense>
  );
};

export default Dashboard;