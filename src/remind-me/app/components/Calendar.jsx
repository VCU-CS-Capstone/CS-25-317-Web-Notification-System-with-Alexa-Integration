"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

const Calendar = ({ selectedDate, onDateSelect }) => {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [reminders, setReminders] = useState({});
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Month names for header
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Day names for header
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    // Get userId from localStorage
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // Generate calendar days for the current month
  useEffect(() => {
    generateCalendarDays(currentMonth);
  }, [currentMonth, selectedDate]); // Added selectedDate as dependency to update selected state

  // Fetch reminders for the current month when userId or month changes
  useEffect(() => {
    if (userId) {
      fetchRemindersForMonth(currentMonth);
    }
  }, [userId, currentMonth]);

  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0-6, where 0 is Sunday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Calculate total days to show (previous month + current month + next month)
    const totalDays = 42; // 6 rows of 7 days
    
    // Generate array of calendar days
    const days = [];
    
    // Add days from previous month
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = prevMonthDays - daysFromPrevMonth + 1; i <= prevMonthDays; i++) {
      const prevMonthDate = new Date(year, month - 1, i);
      days.push({
        date: prevMonthDate,
        day: i,
        isCurrentMonth: false,
        isPrevMonth: true,
        isSelected: isSameDay(prevMonthDate, selectedDate)
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentMonthDate = new Date(year, month, i);
      days.push({
        date: currentMonthDate,
        day: i,
        isCurrentMonth: true,
        isToday: isToday(currentMonthDate),
        isSelected: isSameDay(currentMonthDate, selectedDate),
      });
    }
    
    // Add days from next month
    const remainingDays = totalDays - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDate = new Date(year, month + 1, i);
      days.push({
        date: nextMonthDate,
        day: i,
        isCurrentMonth: false,
        isNextMonth: true,
        isSelected: isSameDay(nextMonthDate, selectedDate)
      });
    }
    
    setCalendarDays(days);
  };

  const fetchRemindersForMonth = async (date) => {
    setLoading(true);
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.error("Invalid date for fetching reminders:", date);
        setLoading(false);
        return;
      }
      
      const year = date.getFullYear();
      const month = date.getMonth();
      
      // Create clean date objects to avoid timezone issues
      // First day of the month in YYYY-MM-DD format
      const firstDayDate = new Date(year, month, 1);
      const firstDay = formatDateForDB(firstDayDate);
      
      // Last day of the month in YYYY-MM-DD format
      const lastDayDate = new Date(year, month + 1, 0);
      const lastDay = formatDateForDB(lastDayDate);
      
      console.log(`Fetching reminders for month from ${firstDay} to ${lastDay}`);
      
      const { data, error } = await supabase
        .from("events")
        .select("event_date, id")
        .eq("userid", userId)
        .gte("event_date", firstDay)
        .lte("event_date", lastDay);
      
      if (error) throw error;
      
      // Group reminders by date
      const remindersByDate = {};
      data.forEach(reminder => {
        if (!remindersByDate[reminder.event_date]) {
          remindersByDate[reminder.event_date] = [];
        }
        remindersByDate[reminder.event_date].push(reminder.id);
      });
      
      console.log(`Found reminders for ${Object.keys(remindersByDate).length} days this month`);
      setReminders(remindersByDate);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const navigateToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const navigateToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    onDateSelect(today);
  };

  // Helper function to check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Helper function to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    
    // Ensure both are Date objects
    const d1 = date1 instanceof Date ? date1 : new Date(date1);
    const d2 = date2 instanceof Date ? date2 : new Date(date2);
    
    // Check for invalid dates
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false;
    
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  };

  // Format date as YYYY-MM-DD for checking reminders
  const formatDateForDB = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.error("Invalid date for formatting:", date);
      return null;
    }
    
    // Create a clean date object to avoid timezone issues
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // Check if a date has reminders
  const hasReminders = (date) => {
    const formattedDate = formatDateForDB(date);
    if (!formattedDate) return false;
    
    return reminders[formattedDate] && reminders[formattedDate].length > 0;
  };

  // Handle date selection without redirect
  const handleDateClick = (day) => {
    if (!day || !day.date || isNaN(day.date.getTime())) {
      console.error("Invalid day clicked in calendar:", day);
      return;
    }
    
    // Create a clean date object to avoid timezone issues
    const localDate = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
    console.log("Calendar: Date selected:", localDate.toISOString());
    
    if (onDateSelect) {
      onDateSelect(localDate);
    }
    
    // Update the calendar days to reflect the new selection
    const updatedDays = calendarDays.map(d => ({
      ...d,
      isSelected: isSameDay(d.date, localDate)
    }));
    setCalendarDays(updatedDays);
  };

  // Navigate to monthly view
  const navigateToMonthlyView = () => {
    // Since we already show the monthly view in the calendar component,
    // we'll just log this action for now
    console.log("Monthly view clicked for:", currentMonth.toISOString());
    // If you want to add a dedicated monthly view page later, uncomment this:
    // router.push(`/calendar?month=${currentMonth.getMonth()}&year=${currentMonth.getFullYear()}`);
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg shadow-lg p-6">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 
          onClick={navigateToMonthlyView}
          className="text-2xl font-bold cursor-pointer hover:text-[var(--accent-color)] transition-colors flex items-center"
          title="View full month"
        >
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={navigateToPreviousMonth}
            className="flex items-center px-2 py-1 rounded-lg hover:bg-[var(--accent-color)] hover:text-[var(--text-on-accent)] transition-colors border border-gray-300"
            aria-label="Previous Month"
            title="Previous Month"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="sr-only">Previous</span>
          </button>
          <button
            onClick={navigateToToday}
            className="px-4 py-1 rounded-md bg-[var(--accent-color)] text-[var(--text-on-accent)] font-medium"
          >
            Today
          </button>
          <button
            onClick={navigateToNextMonth}
            className="flex items-center px-2 py-1 rounded-lg hover:bg-[var(--accent-color)] hover:text-[var(--text-on-accent)] transition-colors border border-gray-300"
            aria-label="Next Month"
            title="Next Month"
          >
            <span className="sr-only">Next</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Days of the Week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day, index) => (
          <div
            key={index}
            className="text-center font-semibold py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() => handleDateClick(day)}
            className={`
              relative h-16 p-1 border rounded-md cursor-pointer transition-colors
              ${day.isCurrentMonth 
                ? 'border-[var(--text-secondary)] bg-[var(--bg-primary)]' 
                : 'border-gray-200 bg-gray-100 text-gray-400'
              }
              ${day.isToday ? 'border-[var(--accent-color)] border-2' : ''}
              ${day.isSelected ? 'bg-[var(--accent-color)] text-[var(--text-on-accent)]' : ''}
              hover:border-[var(--accent-color)]
            `}
          >
            <div className="flex justify-between">
              <span className={`text-sm ${day.isSelected ? 'text-[var(--text-on-accent)]' : ''}`}>
                {day.day}
              </span>
              {hasReminders(day.date) && (
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center mt-4 text-[var(--text-secondary)]">
          Loading reminders...
        </div>
      )}
    </div>
  );
};

export default Calendar;
