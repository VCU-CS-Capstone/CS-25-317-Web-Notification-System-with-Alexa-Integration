import React, { useState } from "react";
import ReminderPopup from "./ReminderPopup"; 
import { supabase } from "../lib/supabaseClient";

const BottomNavbar = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const sessionId = 1; // Temporary session ID


  const handleCreateClick = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const newReminder = {
      event_name: event.target.title.value,
      event_date: event.target.date.value,
      start_time: event.target.time.value,
      end_time: null, // Assuming no end time is provided
      interval: 30,
      userid: sessionId, 
    };

    try {
      const {data, error } = await supabase
      .from("events")
      .insert([newReminder]);

      if (error){
        throw new Error(error.message); 
      }
    
      console.log("Reminder added:", data)
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error adding reminder:", error.message);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-[#73FF00]  shadow-lg text-black">
        <div className="flex justify-around items-center p-3">
          <button className="btn btn-outline btn-sm hover:bg-slate-700 text-black">
            Prev
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleCreateClick}
          >
            Create
          </button>
          <button className="btn btn-outline btn-sm hover:bg-slate-700 text-black">
            Next
          </button>
        </div>
      </div>

      {isFormOpen && (
        <ReminderPopup
          closeForm={closeForm}
          loading={loading}
          handleFormSubmit={handleFormSubmit}
        />
      )}
    </>
  );
};

export default BottomNavbar;
