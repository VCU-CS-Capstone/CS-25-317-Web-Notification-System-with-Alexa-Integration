import React from "react";

export const ReminderCard = ({ title, description, time, date, onClick }) => (
  <div
    className="w-60 h-60 p-6 shadow-lg rounded-2xl flex flex-col justify-between cursor-pointer hover:scale-105 transition-transform duration-300 ease-in-out btn btn-primary text-white ml-4 nr-4 mb-4" // Added mb-4 for bottom margin
    onClick={onClick}
  >
    <h2 className="text-2xl font-semibold mb-2">{title}</h2>
    <p className="text-medium mb-4">{description}</p>
    <div className="mt-auto">
      <p className="text-lg font-medium">
        {date} at {time}
      </p>
    </div>
  </div>
);
