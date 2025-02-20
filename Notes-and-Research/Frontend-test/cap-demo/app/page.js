"use client";

import React, { useState, useEffect } from "react";
import { ReminderCard } from "./components/ReminderCard";
import BottomNavbar from "./components/BottomNavbar";

const apiUrl = "http://localhost:5001/users/events?userid=1";

const Home = () => {
  const [reminders, setReminders] = useState([]);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, []);

  const handleCardClick = (reminder) => {
    setSelectedReminder(reminder);
  };

  const closePopup = () => {
    setSelectedReminder(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-800">
      <div className="flex-grow p-4">
        <h2 className="text-xl font-bold mb-4 text-center text-white">
          Reminders
        </h2>
        {loading && (
          <p className="text-center text-white">Loading reminders...</p>
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-2 text-white">
              {selectedReminder.title}
            </h3>
            <p className="mb-4 text-white">{selectedReminder.description}</p>
            <div className="flex justify-end space-x-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={closePopup}
              >
                Close
              </button>
              <button className="bg-green-500 text-white px-4 py-2 rounded">
                Option 1
              </button>
              <button className="bg-yellow-500 text-white px-4 py-2 rounded">
                Option 2
              </button>
              <button className="bg-red-500 text-white px-4 py-2 rounded">
                Option 3
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavbar reminders={reminders} setReminders={setReminders} />
    </div>
  );
};

export default Home;
