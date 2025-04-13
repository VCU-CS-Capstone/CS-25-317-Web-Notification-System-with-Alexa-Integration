import React, { useState, useEffect } from "react";

const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0'); // Day with leading zero
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Month with leading zero
  const year = String(d.getFullYear()).slice(-2); // Get last two digits of the year

  return `${month}-${day}-${year}`; // Format as MM-DD-YY
};

export const ReminderCard = ({ title, event_description, startTime, date, is_complete, onClick}) => {
  // Combine date and startTime into a single Date object
  const reminderDateTime = new Date(`${date}T${startTime}:00`);
  
  // Get the current time
  const currentDateTime = new Date();

  // Check if the reminder is in the past
  const isPast = reminderDateTime < currentDateTime;

  // Set color based on status 
  const textClass = is_complete
  ? 'text-[#73FF00]'              // Completed: green
  : isPast
  ? 'text-red-600'               // Incomplete + past: red
  : 'text-white';                // Upcoming + incomplete: white

  return (
    <div
      onClick={onClick}
      className={`
        ${isPast ? 'bg-gray-400' : 'bg-primary'}
        p-3 shadow-lg rounded-2xl cursor-pointer 
        hover:scale-105 transition-transform duration-300 ease-in-out 
        flex flex-row items-center justify-between
        sm:flex-col sm:items-start sm:justify-between 
        w-full sm:w-60 sm:h-60 
        mb-4 ml-4 mr-4
      `}
    >
      <div className="flex-1 sm:w-full">
        <h2 className={`text-2xl font-semibold ${textClass}`}>{title}</h2>
        <p className={`sm:block text-lg font-semibold mt-1 ${textClass}`}>{event_description}</p>
      </div>

      {/* Right section: Date and Time */}
      <div className={`text-right text-base sm:text-left mt-0 sm:mt-auto sm:pt-4 ${textClass}`}>
        <p className={`text-2xl sm:text-2xl font-medium whitespace-nowrap ${textClass}`}>
          {formatDate(date)} at {startTime}
        </p>
      </div>
    </div>
  );
};

export default ReminderCard; 