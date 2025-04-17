import React, { useState, useEffect } from "react";
import ReminderPopup from "./ReminderPopup"; 
import { supabase } from "../lib/supabaseClient";


const BottomNavbar = ({reminders, setReminders, selectedDate, setSelectedDate, fetchReminders, selectedReminder}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Ensure we are on the client side before accessing localStorage
    if (typeof window !== "undefined") {
      const userId = localStorage.getItem('userId');
     
      if (userId) {
        setUserId(userId);
        console.log('userId:', userId)
      }
    }
  }, []);

  const handleCreateClick = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Make sure we have a userId
    if (!userId) {
      console.error("No userId found in localStorage");
      alert("Please log in again to create reminders");
      setLoading(false);
      return;
    }

    try {
      const newReminder = {
        event_name: event.target.title.value,
        event_date: event.target.date.value,
        start_time: event.target.startTime.value,
        end_time: event.target.endTime.value, // Assuming no end time is provided
        interval: event.target.interval.value,
        userid: userId,
      };

      const {data, error } = await supabase
      .from("events")
      .insert([newReminder]);

      if (error){
        throw new Error(error.message); 
      }
    
      console.log("Reminder added:", data)
      setIsFormOpen(false);
      fetchReminders();

    } catch (error) {
      console.error("Error adding reminder:", error.message);
    }
    setLoading(false);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };
  
  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };
  

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--navbar-bg)] shadow-lg text-[var(--navbar-text)]">
        <div className="flex justify-around items-center p-3">
          <button className="btn btn-outline border-[var(--navbar-text)] hover:bg-blue-800 hover:text-white text-[var(--navbar-text)] px-2 py-1 text-2xl"
            onClick={handlePrevDay}
          >
            Prev
          </button>
          <button
            className="btn bg-[var(--bg-secondary)] px-3 py-1 text-2xl hover:bg-blue-800 text-[var(--text-primary)]"
            onClick={handleCreateClick}
          >
            Create
          </button>
          <button className="btn btn-outline border-[var(--navbar-text)] hover:bg-blue-800 hover:text-white text-[var(--navbar-text)] px-1 py-1 text-2xl"
            onClick={handleNextDay}
          >
            Next
          </button>
        </div>
      </div>

      {isFormOpen && (
        <ReminderPopup
          source="create"
          closeForm={closeForm}
          loading={loading}
          handleFormSubmit={handleFormSubmit}
          selectedDate={selectedDate}
          selectedReminder={selectedReminder}
        />
      )}
    </>
  );
};

export default BottomNavbar;
