import React, { useState, useEffect } from "react";
import ReminderPopup from "./ReminderPopup"; 
import { supabase } from "../lib/supabaseClient";


const Popup = ({ selectedReminder, closePopup, handleDelete, fetchReminders }) => {
  const { title, startTime, endTime, interval, date, event_description, is_complete } = selectedReminder;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

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
  
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0'); // Day with leading zero
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Month with leading zero
    const year = String(d.getFullYear()).slice(-2); // Get last two digits of the year
  
    return `${month}-${day}-${year}`; // Format as MM-DD-YY
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

    const updatedReminder = {
      event_name: event.target.title.value,
      event_date: event.target.date.value,
      start_time: event.target.startTime.value,
      end_time: event.target.endTime.value,
      interval: event.target.interval.value,
      userid: userId, 
    };

    try {
      if (source === 'create'){
        const newReminder = {
          event_name: event.target.title.value,
          event_date: event.target.date.value,
          start_time: event.target.startTime.value,
          end_time: event.target.endTime.value,
          interval: event.target.interval.value,
          userid: userId, 
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
      <div className="p-6 rounded-2xl shadow-lg max-w-md w-full bg-[var(--bg-secondary)] font-semibold">
        <div className="flex items-baseline gap-4 mb-4">
          <p className="text-3xl text-[var(--text-primary)]">
            {title}
          </p>
          <p className="text-3xl text-[var(--text-primary)]">
            {formatDate(date)}
          </p>
        </div>
        <p className="text-xl text-[var(--text-primary)] mb-2">
          {event_description}
        </p>
        <p className="text-xl text-[var(--text-primary)] mb-2">
          Time: {startTime} - {endTime}
        </p>
        <p className="text-xl text-[var(--text-primary)] mb-4">
          Notification Time: {interval} min.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-3 py-2 rounded-md bg-[var(--accent-color)] text-[var(--text-on-accent)] text-xl hover:bg-[var(--accent-color-hover)] transition-colors"
            onClick={toggleCompleteStatus}
          >
            {is_complete ? "Mark Incomplete" : "Mark Complete"}
          </button>
          <button
            className="px-3 py-2 rounded-md bg-[var(--accent-color)] text-[var(--text-on-accent)] text-xl hover:bg-[var(--accent-color-hover)] transition-colors"
            onClick={closePopup}
          >
            Close
          </button>

          <button
            className="px-3 py-2 rounded-md bg-[var(--accent-color)] text-[var(--text-on-accent)] text-xl hover:bg-[var(--accent-color-hover)] transition-colors"
            onClick={handleCreateClick}
          >
            Edit
          </button>

          <button
            className="px-3 py-2 rounded-md bg-[var(--cancel-color)] text-[var(--text-on-cancel)] text-xl hover:bg-[var(--cancel-color-hover)] transition-colors"
            onClick={handleDelete}
          >
            Delete
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
