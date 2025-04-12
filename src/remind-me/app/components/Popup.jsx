import React, { useState, useEffect } from "react";
import ReminderPopup from "./ReminderPopup"; 
import { supabase } from "../lib/supabaseClient";

const Popup = ({ selectedReminder, closePopup, handleDelete, fetchReminders }) => {
  const { title, startTime, endTime, interval, date } = selectedReminder;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateClick = () => {
    setIsFormOpen(true);
  };
  
  const closeForm = () => {
    setIsFormOpen(false);
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
      userid: 1, 
    };

    try {
      if (source === 'create'){
        const newReminder = {
          event_name: event.target.title.value,
          event_date: event.target.date.value,
          start_time: event.target.startTime.value,
          end_time: event.target.endTime.value,
          interval: event.target.interval.value,
          userid: 1, 
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
      <div className="p-6 rounded-2xl shadow-lg max-w-md w-full bg-blue-600 font-semibold">
        <p className="text-2xl mb-4 text-white">
          {title}
        </p>
        <p className="text-base text-white mb-2">
          Date: {date}
        </p>
        <p className="text-base text-white mb-2">
          Time: {startTime} - {endTime}
        </p>
        <p className="text-base text-white mb-4">
          Notification Time: {interval} min.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 rounded-md bg-blue-800 text-white font-medium hover:bg-blue-900 transition-colors"
            onClick={closePopup}
          >
            Close
          </button>

          <button
            className="px-4 py-2 rounded-md bg-blue-800 text-white font-medium hover:bg-blue-900 transition-colors"
            onClick={handleCreateClick}
          >
            Edit
          </button>

          <button
            className="px-4 py-2 rounded-md bg-red-700 text-white font-medium hover:bg-red-800 transition-colors"
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
