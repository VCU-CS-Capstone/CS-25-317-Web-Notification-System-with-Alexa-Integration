import React from "react";

export const ReminderCard = ({ title, description, time, date, onClick }) => (
  <div className="p-4 bg-slate-900 shadow-md rounded-md" onClick={onClick}>
    <h2 className="text-lg font-bold text-white">{title}</h2>
    <p className="text-sm text-gray-300">{description}</p>
    <p className="text-sm text-gray-400">
      {date} at {time}
    </p>
  </div>
);
