import React from "react";

export const ReminderCard = ({ title, description, time, date, onClick }) => (
  <div
    className="w-64 h-64 px-3 py-3 bg-slate-900 shadow-md rounded-md flex flex-col justify-between cursor-pointer hover:bg-slate-700 transition duration-300 ease-in-out"
    onClick={onClick}
  >
    <h2 className="text-lg font-bold text-white">{title}</h2>
    <p className="text-sm text-gray-300">{description}</p>
    <p className="text-sm text-gray-400">
      {date} at {time}
    </p>
  </div>
);
