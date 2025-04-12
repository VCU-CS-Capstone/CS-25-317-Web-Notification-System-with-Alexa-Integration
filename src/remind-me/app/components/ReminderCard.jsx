import React from "react";

export const ReminderCard = ({ title, description, startTime, date, onClick }) => (
  <div
    onClick={onClick}
    className="
      bg-primary text-white p-3 shadow-lg rounded-2xl cursor-pointer 
      hover:scale-105 transition-transform duration-300 ease-in-out 
      flex flex-row items-center justify-between
      sm:flex-col sm:items-start sm:justify-between 
      w-full sm:w-60 sm:h-60 
      mb-4 ml-4 mr-4
    "
  >
    <div className="flex-1 sm:w-full">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="hidden sm:block text-base mt-1">{description}</p>
    </div>

    {/* Right section: Date and Time */}
    <div className="text-right text-base sm:text-left mt-0 sm:mt-auto sm:pt-4">
      <p className="text-2xl sm:text-2xl font-medium whitespace-nowrap">
        {date} at {startTime}
      </p>
    </div>
  </div>
);
