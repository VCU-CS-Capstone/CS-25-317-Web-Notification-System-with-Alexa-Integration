"use client";

import { useState, useEffect } from "react";
import Calendar from "../components/Calendar";
import { supabase } from "../lib/supabaseClient";
import { ReminderCard } from "../components/ReminderCard";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [username, setUsername]       = useState("");
  const [reminders, setReminders]     = useState([]);
  const [loading, setLoading]         = useState(false);

  // Month names for header
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  // Redirect if not logged in
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      window.location.href = "/";   // or router.push("/")
      return;
    }
    setUsername(storedUsername);
  }, []);

  // Fetch reminders whenever selectedDate changes
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      
      // Get userId from localStorage
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.warn("No user ID found in localStorage");
        setReminders([]);
        setLoading(false);
        return;
      }
      
      // Format date properly to avoid timezone issues
      const formatDate = (date) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
          console.error("Invalid date for formatting:", date);
          return null;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const formattedDate = formatDate(selectedDate);
      console.log(`Fetching reminders for date: ${formattedDate} and user: ${userId}`);
      
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("event_date", formattedDate)
        .eq("userid", userId)
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Error loading reminders:", error);
        setReminders([]);
      } else {
        console.log(`Found ${data.length} reminders for ${formattedDate}`);
        setReminders(data);
      }
      setLoading(false);
    };

    if (selectedDate) {
      load();
    }
  }, [selectedDate]);

  const handleDateSelect = (date) => {
    if (!date || isNaN(date.getTime())) {
      console.error("Invalid date selected in calendar page:", date);
      return;
    }
    
    // Create a clean date object to avoid timezone issues
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    console.log("Calendar page: Date selected:", localDate.toISOString());
    
    setSelectedDate(localDate);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pt-20 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {monthNames[selectedDate.getMonth()]}{" "}
        {selectedDate.getFullYear()} Calendar
      </h1>

      <div className="flex flex-col md:flex-row max-w-5xl mx-auto md:space-x-4 space-y-4 md:space-y-0">
        {/* Calendar */}
        <div className="w-full md:w-1/2">
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>

        {/* Sidebar/Bottom section for reminders */}
        <aside className="w-full md:w-1/2 bg-[var(--bg-secondary)] p-4 md:p-6 rounded-lg shadow-lg" style={{ minHeight: '300px', md: { minHeight: '520px' }, display: 'flex', flexDirection: 'column' }}>
          <div className="flex-1 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-2">
            Reminders for{" "}
            {selectedDate.toLocaleDateString(undefined, {
              weekday: "long",
              month:   "short",
              day:     "numeric",
              year:    "numeric",
            })}
          </h2>

          {loading ? (
            <p>Loading…</p>
          ) : reminders.length > 0 ? (
            <div className="mt-4 border-2 border-[var(--accent-color)] rounded-lg overflow-hidden">
              <ul className="divide-y divide-[var(--accent-color-hover)]">
                {reminders.map((r) => (
                  <li key={r.id} className="py-3 flex items-start hover:bg-[var(--bg-primary-hover)] transition-colors px-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-[var(--text-primary)]">{r.event_name}</h3>
                        <span className="text-sm text-[var(--text-secondary)]">{r.start_time}</span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Notification {r.interval} minutes before
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No reminders for this date</p>
            </div>
          )}
          </div>
        </aside>
      </div>
    </div>
  );
}
