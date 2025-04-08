import React, { useState } from "react";
import ReminderPopup from "./ReminderPopup"; // Assuming you have a ReminderPopup component for the form

const BottomNavbar = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const sessionId = 1; // Temporary session ID
  const apiUrl = "http://localhost:5001/users/events";

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
      name: event.target.title.value,
      date: event.target.date.value,
      start_time: event.target.time.value,
      end_time: "", // Assuming no end time is provided
      interval: 30, // Default interval
      sessionId: sessionId,
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReminder),
      });

      console.log("API Response Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("API Response Data:", result);

      // setReminders([...reminders, result]);
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
