import React, { useState, useEffect } from "react";
import ReminderPopup from "./ReminderPopup"; 
import { supabase } from "../lib/supabaseClient";


const Popup = ({ selectedReminder, closePopup, handleDelete, fetchReminders }) => {
  const { title, startTime, endTime, interval, date, event_description, is_complete } = selectedReminder;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  
  // Function to check if a reminder is past due
  const isPastDue = () => {
    if (!date || !endTime) return false;
    
    try {
      const now = new Date();
      
      // Parse the date and time correctly
      const [year, month, day] = date.split('-').map(Number);
      const [hours, minutes] = endTime.split(':').map(Number);
      
      // Create date object with local timezone
      const reminderEndDate = new Date(year, month - 1, day, hours, minutes);
      
      // For today's reminders, check if the end time has passed
      if (now.toDateString() === reminderEndDate.toDateString()) {
        // Same day - compare only the time
        const nowTime = now.getHours() * 60 + now.getMinutes();
        const reminderTime = hours * 60 + minutes;
        return nowTime > reminderTime;
      }
      
      // For other days, compare the full dates
      return now > reminderEndDate;
    } catch (e) {
      console.error('Error checking if reminder is past due:', e);
      return false;
    }
  };

  useEffect(() => {
    // Ensure we are on the client side before accessing localStorage
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem('userId');
     
      if (userId) {
        setUserId(userId);
      }
    }
  }, []);

  const handleCreateClick = () => {
    setIsFormOpen(true);
  };
  
  const closeForm = () => {
    setIsFormOpen(false);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      // Ensure we're working with the date in local timezone
      // The date string is in YYYY-MM-DD format
      const [year, month, day] = dateString.split('-').map(Number);
      
      // Create a date object using local timezone (months are 0-indexed in JS)
      const d = new Date(year, month - 1, day);
      
      // Format the date
      const formattedDay = String(d.getDate()).padStart(2, '0');
      const formattedMonth = String(d.getMonth() + 1).padStart(2, '0');
      const formattedYear = String(d.getFullYear()).slice(-2);
      
      return `${formattedMonth}-${formattedDay}-${formattedYear}`; // Format as MM-DD-YY
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  const toggleCompleteStatus = async () => {
    try {
      setLoading(true);
      const updatedStatus = !is_complete; 
  
      const { error } = await supabase
        .from("events")
        .update({ is_complete: updatedStatus })
        .eq("id", selectedReminder.id);
  
      if (error) throw new Error(error.message);
  
      await fetchReminders(date); // Refresh data
      closePopup(); 
    } catch (error) {
      console.error("Error toggling complete status:", error.message);
    } finally {
      setLoading(false);
    }
  };  

  const handleFormSubmit = async (event, source, selectedDate, id) => {
    event.preventDefault();
    setLoading(true);

    // Get the event date and times
    const eventDate = event.target.date.value;
    const startTime = event.target.startTime.value;
    const endTime = event.target.endTime.value;
    
    // Check if the event is in the past
    const now = new Date();
    const eventDateTime = new Date(`${eventDate}T${endTime}:00`);
    const isPastEvent = eventDateTime < now;
    
    console.log('Event date/time:', eventDateTime);
    console.log('Current date/time:', now);
    console.log('Is past event:', isPastEvent);

    const updatedReminder = {
      event_name: event.target.title.value,
      event_description: event.target.description ? event.target.description.value : '',
      event_date: eventDate,
      start_time: startTime,
      end_time: endTime,
      interval: event.target.interval.value,
      userid: userId,
      is_complete: isPastEvent, // Automatically mark as complete if in the past
    };

    try {
      if (source === 'create'){
        // For consistency, use the same logic for new reminders
        const newReminder = {
          event_name: event.target.title.value,
          event_description: event.target.description ? event.target.description.value : '',
          event_date: eventDate,
          start_time: startTime,
          end_time: endTime,
          interval: event.target.interval.value,
          userid: userId,
          is_complete: isPastEvent, // Automatically mark as complete if in the past
        };
        const {data, error} = await supabase
          .from("events")
          .insert([newReminder]);
        if (error) throw new Error(error.message); 
      } else {
        const {data, error} = await supabase
          .from("events")
          .update(updatedReminder)
          .eq("id", id); 

          if (error) throw new Error(error.message); 
      }
      setIsFormOpen(false); 
      closePopup();
      fetchReminders(selectedDate); 
    } catch (error) {
      console.error(`Error ${source === 'create' ? 'adding' : 'updating'} reminder:`, error.message);
    }
    setLoading(false);
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

  // Format time to be more readable based on user preference
  const formatTime = (timeString) => {
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
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className={`p-5 rounded-2xl shadow-lg max-w-md w-full ${isHighContrast ? 'bg-blue-600 border-2 border-black' : 'bg-[var(--bg-secondary)]'} font-semibold`}>
        {/* Header with title and date */}
        <div className="border-b border-gray-500 pb-3 mb-4">
          <h2 className={`text-2xl font-bold ${isHighContrast ? 'text-yellow-300' : 'text-[var(--text-primary)]'} mb-1`}>
            {title}
          </h2>
          <div className="flex justify-between items-center">
            <p className={`text-sm ${isHighContrast ? 'text-yellow-300' : 'text-[var(--text-primary)]'}`}>
              {formatDate(date)}
            </p>
            <div className={`px-2 py-1 rounded text-xs ${is_complete ? 'bg-green-500 text-white' : isPastDue() ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
              {is_complete ? "Completed" : isPastDue() ? "Incomplete" : "Active"}
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div className="mb-4">
          <h3 className={`text-lg font-medium ${isHighContrast ? 'text-yellow-300' : 'text-[var(--text-primary)]'} mb-1`}>Description</h3>
          <p className={`text-base ${isHighContrast ? 'text-yellow-300' : 'text-[var(--text-primary)]'} bg-black bg-opacity-10 p-2 rounded min-h-[3rem]`}>
            {event_description || "No description provided."}
          </p>
        </div>
        
        {/* Time details */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <h3 className={`text-sm font-medium ${isHighContrast ? 'text-yellow-300' : 'text-[var(--text-primary)]'}`}>Start Time</h3>
            <p className={`text-base ${isHighContrast ? 'text-yellow-300' : 'text-[var(--text-primary)]'}`}>
              {formatTime(startTime)}
            </p>
          </div>
          <div>
            <h3 className={`text-sm font-medium ${isHighContrast ? 'text-yellow-300' : 'text-[var(--text-primary)]'}`}>End Time</h3>
            <p className={`text-base ${isHighContrast ? 'text-yellow-300' : 'text-[var(--text-primary)]'}`}>
              {formatTime(endTime)}
            </p>
          </div>
          <div className="col-span-2">
            <h3 className={`text-sm font-medium ${isHighContrast ? 'text-yellow-300' : 'text-[var(--text-primary)]'}`}>Notification</h3>
            <p className={`text-base ${isHighContrast ? 'text-yellow-300' : 'text-[var(--text-primary)]'}`}>
              {interval} minutes before
            </p>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4 sm:flex sm:justify-end sm:space-x-3 sm:space-y-0">
          <button
            className={`px-3 py-2 rounded-md ${isHighContrast ? 'bg-green-500 text-black' : 'bg-[var(--accent-color)] text-[var(--text-on-accent)]'} text-base hover:${isHighContrast ? 'bg-green-600' : 'bg-[var(--accent-color-hover)]'} transition-colors border ${isHighContrast ? 'border-black' : 'border-transparent'}`}
            onClick={toggleCompleteStatus}
          >
            {is_complete ? "Mark Incomplete" : "Mark Complete"}
          </button>
          <button
            className={`px-3 py-2 rounded-md ${isHighContrast ? 'bg-green-500 text-black' : 'bg-[var(--accent-color)] text-[var(--text-on-accent)]'} text-base hover:${isHighContrast ? 'bg-green-600' : 'bg-[var(--accent-color-hover)]'} transition-colors border ${isHighContrast ? 'border-black' : 'border-transparent'}`}
            onClick={handleCreateClick}
          >
            Edit
          </button>
          <button
            className={`px-3 py-2 rounded-md ${isHighContrast ? 'bg-red-600 text-white' : 'bg-[var(--cancel-color)] text-[var(--text-on-cancel)]'} text-base hover:${isHighContrast ? 'bg-red-700' : 'bg-[var(--cancel-color-hover)]'} transition-colors border ${isHighContrast ? 'border-black' : 'border-transparent'}`}
            onClick={handleDelete}
          >
            Delete
          </button>
          <button
            className={`px-3 py-2 rounded-md bg-gray-500 text-white text-base hover:bg-gray-600 transition-colors border ${isHighContrast ? 'border-black' : 'border-transparent'}`}
            onClick={closePopup}
          >
            Close
          </button>
        </div>
      </div>

      {isFormOpen && (
      <ReminderPopup
        source="edit"
        closeForm={closeForm}
        loading={loading}
        handleFormSubmit={handleFormSubmit}
        selectedDate={date}
        selectedReminder={selectedReminder}
      />
    )}
    </div>
  );
};

export default Popup;
