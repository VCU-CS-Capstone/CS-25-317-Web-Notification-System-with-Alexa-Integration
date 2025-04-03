import React from "react";

export const ReminderCard = ({ title, description, time, date, onClick }) => (
  <div
    className="w-64 h-64 p-6 shadow-lg rounded-2xl flex flex-col justify-between cursor-pointer hover:scale-105 transition-transform duration-300 ease-in-out btn btn-primary  text-white"
    onClick={onClick}
  >
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    <p className="text-sm mb-4">{description}</p>
    <div className="mt-auto">
      <p className="text-lg font-medium">
        {date} at {time}
      </p>
    </div>
  </div>
);
