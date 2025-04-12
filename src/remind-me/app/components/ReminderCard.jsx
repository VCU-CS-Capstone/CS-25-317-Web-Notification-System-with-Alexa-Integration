import React from "react";

const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0'); // Day with leading zero
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Month with leading zero
  const year = String(d.getFullYear()).slice(-2); // Get last two digits of the year

  return `${month}-${day}-${year}`; // Format as MM-DD-YY
};

export const ReminderCard = ({ title, description, startTime, date, onClick }) => {
  // Combine date and startTime into a single Date object
  const reminderDateTime = new Date(`${date}T${startTime}:00`);
  
  // Get the current time
  const currentDateTime = new Date();

  // Check if the reminder is in the past
  const isPast = reminderDateTime < currentDateTime;

  return (
    <div
      onClick={onClick}
      className={`
        ${isPast ? 'bg-gray-500' : 'bg-primary'} // Conditional background color
        text-white p-3 shadow-lg rounded-2xl cursor-pointer 
        hover:scale-105 transition-transform duration-300 ease-in-out 
        flex flex-row items-center justify-between
        sm:flex-col sm:items-start sm:justify-between 
        w-full sm:w-60 sm:h-60 
        mb-4 ml-4 mr-4
      `}
    >
      <div className="flex-1 sm:w-full">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="hidden sm:block text-base mt-1">{description}</p>
      </div>

      {/* Right section: Date and Time */}
      <div className="text-right text-base sm:text-left mt-0 sm:mt-auto sm:pt-4">
        <p className="text-2xl sm:text-2xl font-medium whitespace-nowrap">
          {formatDate(date)} at {startTime}
        </p>
      </div>
    </div>
  );
};
