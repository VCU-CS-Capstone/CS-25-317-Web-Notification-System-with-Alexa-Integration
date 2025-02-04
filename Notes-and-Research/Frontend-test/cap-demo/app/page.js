"use client";

import React, { useState } from "react";
import { ReminderCard } from "./components/ReminderCard";
import BottomNavbar from "./components/BottomNavbar";
import { title } from "process";

const reminders = [
  {
    id: 1,
    title: "Buy Groceries",
    time: "4:00 PM",
    date: "2024-11-17",
    description: "Milk, Bread, Eggs, and more.",
  },
  {
    id: 2,
    title: "Workout",
    time: "2:00 PM",
    date: "2024-11-17",
    description: "Go to the gym and complete your routine.",
  },
  {
    id: 3,
    title: "Doctor's Appointment",
    time: "11:00 AM",
    date: "2024-11-18",
    description: "Visit Dr. Smith for the annual check-up.",
  },
  {
    id: 4,
    title: "Meeting",
    time: "5:00 PM",
    date: "2024-11-18",
    description: "Project team meeting in the conference room.",
  },
  {
    id: 5,
    title: "Morning Yoga",
    time: "7:00 AM",
    date: "2024-11-19",
    description: "Attend yoga class at the park.",
  },
  {
    id: 6,
    title: "Call Mom",
    time: "8:00 PM",
    date: "2024-11-19",
    description: "Catch up with Mom on the phone.",
  },
  {
    id: 7,
    title: "Homework",
    time: "3:00 PM",
    date: "2024-11-20",
    description: "Complete math and science assignments.",
  },
  {
    id: 8,
    title: "Dinner Reservation",
    time: "6:30 PM",
    date: "2024-11-20",
    description: "Dinner with Sarah at Olive Garden.",
  },
];

const Home = () => {
  const [selectedReminder, setSelectedReminder] = useState(null);

  const handleCardClick = (reminder) => {
    setSelectedReminder(reminder);
  };

  const closePopup = () => {
    setSelectedReminder(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-800">
      <div className="flex-grow p-4">
        <h2 className="text-xl font-bold mb-4 text-center">Reminders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-2">{selectedReminder.title}</h3>
            <p className="mb-4">{selectedReminder.description}</p>
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

      <BottomNavbar />
    </div>
  );
};

export default Home;
