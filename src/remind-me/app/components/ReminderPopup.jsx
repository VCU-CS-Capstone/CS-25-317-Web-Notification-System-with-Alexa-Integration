import React, { useState, useEffect } from "react";

const ReminderPopup = ({ closeForm, loading, handleFormSubmit, selectedDate, source, selectedReminder }) => {

  const formatDateForInput = (dateObj) => {
    const date = new Date(dateObj); 
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };  

  const convertTo24HourFormat = (time) => {
    const [hours, minutes, secondsPeriod] = time.split(':');
    const seconds = secondsPeriod.slice(0, 2);
    const period = secondsPeriod.slice(2); // AM/PM
  
    let hour = parseInt(hours, 10);
  
    // Convert hour based on AM/PM
    if (period === "AM" && hour === 12) {
      hour = 0; // 12 AM is midnight (00:00)
    } else if (period === "PM" && hour !== 12) {
      hour += 12; // Convert PM hour to 24-hour format
    }
    // Format hour and return in 24-hour format
    const formattedHour = String(hour).padStart(2, "0");
    return `${formattedHour}:${minutes}:${seconds}`;
  };

  // fallback destructuring
  let { id, title, interval, dateState } = selectedReminder || {};
  if (source === 'create') {
    dateState = selectedDate;
    console.log("date", dateState);
    interval = 30;
  }
  else if (source === 'edit'){
    dateState = new Date(selectedDate);
    dateState.setDate(dateState.getDate() + 1);
  }

  // States
  const [titleState, setTitleState] = useState(title || "");
  const [startTimeState, setStartTimeState] = useState("");
  const [endTimeState, setEndTimeState] = useState("");
  const [intervalState, setIntervalState] = useState(interval || 30);
  const [userChangedEnd, setUserChangedEnd] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Autofill times on edit
  useEffect(() => {
    if (source === "edit" && selectedReminder) {
      const start = convertTo24HourFormat(selectedReminder.startTime?.trim() || "");
      const end = convertTo24HourFormat(selectedReminder.endTime?.trim() || "");
      setStartTimeState(start); 
      setEndTimeState(end); 
    }
  }, [source, selectedReminder]);

  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    setStartTimeState(newStartTime);

    if (!userChangedEnd && newStartTime) {
      const [hours, minutes] = newStartTime.split(":").map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes + 30);

      const endHours = String(date.getHours()).padStart(2, "0");
      const endMinutes = String(date.getMinutes()).padStart(2, "0");

      setEndTimeState(`${endHours}:${endMinutes}`);
    }
  };

  const handleEndTimeChange = (e) => {
    setEndTimeState(e.target.value);
    setUserChangedEnd(true);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-blue-600 p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-xl text-white font-bold mb-4">
          {source === "edit" ? "Edit a Reminder" : "Create a Reminder"}
        </h3>
        <form onSubmit={(e) => handleFormSubmit(e, source, selectedDate, id)}className="space-y-3 text-lg">
          <div>
            <label className="block text-sm font-medium text-white">Title</label>
            <input
              type="text"
              name="title"
              value={titleState}
              onChange={(e) => setTitleState(e.target.value)}
              required
              className="w-full border rounded p-2 bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={startTimeState}
              onChange={handleStartTimeChange}
              required
              className="w-full border rounded p-2 bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white">End Time</label>
            <input
              type="time"
              name="endTime"
              value={endTimeState}
              onChange={handleEndTimeChange}
              className="w-full border rounded p-2 bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white">Date</label>
            <input
              type="date"
              name="date"
              value={formatDateForInput(dateState)}
              onChange={(e) => setDateState(new Date(e.target.value))}
              required
              className="w-full border rounded p-2 bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white">Interval</label>
            <input
              type="number"
              min={5}
              step={5}
              name="interval"
              value={intervalState}
              onChange={(e) => {
                const value = e.target.value;
                const num = parseInt(value, 10);

                if (value === "" || isNaN(num)) {
                  setErrorMsg("Please enter a valid number");
                  setIntervalState("");
                } else if (num % 5 !== 0) {
                  setErrorMsg("Interval must be in increments of 5");
                  setIntervalState(num); // still lets them see what they typed
                } else {
                  setErrorMsg("");
                  setIntervalState(num);
                }
              }}
              required
              className="w-full border rounded p-2 bg-white text-black"
            />
            {errorMsg && <p className="text-red-200 text-sm mt-1">{errorMsg}</p>}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded"
              onClick={closeForm}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderPopup;



