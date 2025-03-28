"use client";

import React, { useState, useEffect } from "react";
import { ReminderCard } from "./components/ReminderCard";
import BottomNavbar from "./components/BottomNavbar";
import Popup from "./components/Popup";

const apiUrl = "http://localhost:5001/users/events?userid=1";

const Home = () => {
  const [reminders, setReminders] = useState([]);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleCardClick = (reminder) => {
    setSelectedReminder(reminder);
  };

  const closePopup = () => {
    setSelectedReminder(null);
  };

  const handleDelete = async () => {
    const deleteUrl = `http://localhost:5001/users/events/${selectedReminder.id}`;
    try {
      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("API Response Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("API Response Data:", result);

      // Refresh the page
      closePopup(); // Close the popup
    } catch (error) {
      console.error("Error deleting reminder:", error.message);
    }
  };

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(
            `API Error: ${response.status} - ${response.statusText}`
          );
        }
        const data = await response.json();
        const formattedData = data.map((event) => ({
          id: event.id,
          title: event.event_name,
          time: event.start_time,
          date: event.event_date,
          description: `Interval: ${event.interval} minutes`,
        }));
        setReminders(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReminders();
  }, [handleDelete]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-grow p-4">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
          Reminders
        </h2>
        {loading && (
          <p className="text-center text-gray-800">Loading reminders...</p>
        )}
        {error && <p className="text-center text-red-500">Error: {error}</p>}
        <div className="grid place-items-center grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              description={reminder.description}
              title={reminder.title}
              time={reminder.time}
              date={reminder.date}
              onClick={() => handleCardClick(reminder)}
            />
          ))}
        </div>
      </div>

      {selectedReminder && (
        <Popup
          selectedReminder={selectedReminder}
          closePopup={closePopup}
          handleDelete={handleDelete}
        />
      )}

      <BottomNavbar reminders={reminders} setReminders={setReminders} />
    </div>
  );
};

export default Home;
