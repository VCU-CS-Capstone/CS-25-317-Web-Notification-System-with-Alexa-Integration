"use client";

import React, { useState, useEffect, Suspense } from "react";
import { ReminderCard } from "../components/ReminderCard";
import BottomNavbar from "../components/BottomNavbar";
import Popup from "../components/Popup";
import { supabase } from "../lib/supabaseClient";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reminders, setReminders] = useState([]);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fontSize, setFontSize] = useState('medium'); // Default to medium font size

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

  const handleDateSelect = (date) => {
    if (!date || isNaN(date.getTime())) {
      console.error("Invalid date selected in dashboard:", date);
      return;
    }
    console.log("Dashboard: Date selected:", date.toISOString());
    
    // Create a new date object to avoid reference issues
    // and ensure we're using the local date without timezone issues
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    console.log("Dashboard: Using local date:", localDate.toISOString());
    
    setSelectedDate(localDate);
  };

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
        try {
          // Get user ID for querying reminders using case-insensitive match
          const { data: allUsers, error: usersError } = await supabase
            .from("users")
            .select("id, username");

          if (usersError) {
            setError("Error fetching users data");
            console.error("Error fetching users data:", usersError);
            return;
          }
          
          // Find user with case-insensitive match
          const userData = allUsers.find(u => 
            u.username && u.username.toLowerCase() === storedUsername.toLowerCase()
          );
          
          if (!userData) {
            setError("User not found");
            console.error("User not found with username:", storedUsername);
            return;
          }
          
          setUserId(userData.id);
          // Save userId to localStorage for other components to use
          localStorage.setItem('userId', userData.id);
          console.log("Set userId in localStorage:", userData.id);
        } catch (error) {
          setError("Error fetching user data");
          console.error("Error:", error);
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

  // Format date as 'Month Day, Year' (e.g., April 20th, 2025)
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
    
    // Get month name
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = months[d.getMonth()];
    
    // Get day with ordinal suffix
    const day = d.getDate();
    let dayWithSuffix;
    
    if (day > 3 && day < 21) {
      dayWithSuffix = `${day}th`;
    } else {
      switch (day % 10) {
        case 1: dayWithSuffix = `${day}st`; break;
        case 2: dayWithSuffix = `${day}nd`; break;
        case 3: dayWithSuffix = `${day}rd`; break;
        default: dayWithSuffix = `${day}th`;
      }
    }
    
    // Get full year
    const year = d.getFullYear();
  
    return `${monthName} ${dayWithSuffix}, ${year}`;
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
    
    // Check if date is valid
    if (isNaN(d.getTime())) {
      console.error("Invalid date for formatting:", date);
      d = new Date(); // Fallback to current date
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
    
    // Ensure date is valid
    let validDate;
    if (date instanceof Date && !isNaN(date.getTime())) {
      // Create a clean date object to avoid timezone issues
      validDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    } else if (typeof date === 'string') {
      try {
        // For YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
          validDate = new Date(year, month - 1, day);
        } else {
          validDate = new Date(date);
        }
        
        if (isNaN(validDate.getTime())) {
          validDate = new Date(); // Fallback to today
          console.warn("Invalid date string, using today's date instead:", date);
        }
      } catch (e) {
        validDate = new Date(); // Fallback to today
        console.warn("Error parsing date, using today's date instead:", e);
      }
    } else {
      validDate = new Date(); // Fallback to today
      console.warn("Invalid date provided, using today's date instead:", date);
    }
    
    setLoading(true);
    setError(null);
    try {
      // Format the date for database query, preventing timezone issues
      const formattedDate = formatDateForDB(validDate);
      
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
      console.log(`Found ${formattedData.length} reminders for user ${userId} on ${formattedDate}`);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching reminders:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get font size from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedFontSize = localStorage.getItem('fontSize');
      if (storedFontSize) {
        setFontSize(storedFontSize);
      }
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchReminders(selectedDate);
    }
  }, [userId]);

  // Update when selected date changes
  useEffect(() => {
    if (userId && selectedDate) {
      console.log("Selected date changed, fetching reminders for:", selectedDate);
      fetchReminders(selectedDate);
    }
  }, [selectedDate]);

  const handleDelete = async () => {
    if (!selectedReminder) return;
    try {
      console.log('Deleting reminder with ID:', selectedReminder.id);
      
      // Store the reminder ID and date before deletion for later use
      const reminderIdToDelete = selectedReminder.id;
      
      // First, delete any related records in the map table
      const { error: mapDeleteError } = await supabase
        .from("map")
        .delete()
        .eq("event_id", reminderIdToDelete);

      if (mapDeleteError) {
        console.error('Error deleting related map records:', mapDeleteError);
        throw mapDeleteError;
      }
      
      console.log('Related map records deleted successfully');
      
      // Now delete the event itself
      const { error: eventDeleteError } = await supabase
        .from("events")
        .delete()
        .eq("id", reminderIdToDelete);

      if (eventDeleteError) {
        console.error('Supabase event delete error:', eventDeleteError);
        throw eventDeleteError;
      }

      console.log('Reminder deleted successfully');
      
      // Close the popup first
      closePopup();
      
      // Update the reminders state directly instead of refetching everything
      // This prevents the page from resetting
      setReminders(prevReminders => prevReminders.filter(reminder => reminder.id !== reminderIdToDelete));
      
      // No need for background refresh - the state update above is sufficient
      // This avoids any timezone or date formatting issues
    } catch (err) {
      console.error("Error deleting reminder:", err.message);
      alert("Failed to delete reminder: " + err.message);
    }
  };

  const navigateToDateRange = () => {
    router.push('/date-range');
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
        <div className="flex-grow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">
              {formatDate(selectedDate)}
            </h2>
            <button 
              onClick={navigateToDateRange}
              className="px-4 py-2 bg-[var(--accent-color)] text-[var(--text-on-accent)] rounded-md hover:bg-[var(--accent-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Date Range
            </button>
          </div>
          {loading && (
            <p className="text-center text-[var(--text-secondary)]">Loading reminders...</p>
          )}
          {error && <p className="text-center text-red-500">Error: {error}</p>}
          <motion.div 
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`grid gap-3 pb-20 overflow-x-hidden
              ${fontSize === 'large' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 
                fontSize === 'small' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7' : 
                'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}
            `}
          >
            <AnimatePresence mode="popLayout">
              {reminders.map((reminder, index) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.05, // Staggered animation
                    ease: "easeOut" 
                  }}
                >
                  <ReminderCard
                    title={reminder.title}
                    startTime={removeSeconds(reminder.startTime)}
                    date={reminder.date}
                    event_description={reminder.event_description}
                    is_complete={reminder.is_complete}
                    onClick={() => handleCardClick(reminder)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
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