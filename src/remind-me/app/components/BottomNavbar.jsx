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
      // Get the description value and ensure it's not undefined
      const descriptionValue = event.target.description ? event.target.description.value : '';
      console.log('Description value:', descriptionValue);
      
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
      
      const newReminder = {
        event_name: event.target.title.value,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        interval: event.target.interval.value,
        event_description: descriptionValue,
        userid: userId,
        is_complete: isPastEvent, // Automatically mark as complete if in the past
      };

      console.log('Submitting reminder with data:', newReminder);
      
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
          <button className="btn btn-outline border-[var(--navbar-text)] hover:bg-blue-800 hover:text-white text-[var(--navbar-text)] px-2 py-1 text-2xl flex items-center"
            onClick={handlePrevDay}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>
          <button
            className="btn bg-[var(--bg-secondary)] px-3 py-1 text-2xl hover:bg-blue-800 text-[var(--text-primary)]"
            onClick={handleCreateClick}
          >
            Create
          </button>
          <button className="btn btn-outline border-[var(--navbar-text)] hover:bg-blue-800 hover:text-white text-[var(--navbar-text)] px-1 py-1 text-2xl flex items-center"
            onClick={handleNextDay}
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
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
