import React, { useState } from "react";
import Popup from "./Popup";

const BottomNavbar = ({ reminders, setReminders }) => {
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800 text-white shadow-lg">
        <div className="flex justify-around items-center p-3">
          <button className="btn btn-outline btn-sm hover:bg-slate-700">
            Prev
          </button>
          <button className="btn btn-primary btn-sm">Create</button>
          <button className="btn btn-outline btn-sm hover:bg-slate-700">
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default BottomNavbar;
