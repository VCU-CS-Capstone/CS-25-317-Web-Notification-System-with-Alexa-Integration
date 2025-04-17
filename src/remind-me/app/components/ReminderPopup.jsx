import React, { useState, useEffect } from "react";

const ReminderPopup = ({ closeForm, loading, handleFormSubmit, selectedDate, source, selectedReminder }) => {

  const formatDateForInput = (dateObj) => {
    let date;
    if (typeof dateObj === "string") {
      const [year, month, day] = dateObj.split("-");
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateObj);
    }
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  

  // fallback destructuring
  let { id, title, interval } = selectedReminder || {};

  // States
  const [titleState, setTitleState] = useState(title || "");
  const [startTimeState, setStartTimeState] = useState("");
  const [endTimeState, setEndTimeState] = useState("");
  const [intervalState, setIntervalState] = useState(interval || 60);
  const [userChangedEnd, setUserChangedEnd] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [dateState, setDateState] = useState(() => {
    if (source === 'create') return selectedDate;
    if (source === 'edit') {
      const [year, month, day] = selectedDate.split("-");
      const d = new Date(year, month - 1, day);
      return d;
    }
    return new Date();
  });

  // Autofill times on edit
  useEffect(() => {
    if (source === "edit" && selectedReminder) {
      const start = selectedReminder.startTime;
      const end = selectedReminder.endTime;
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
      <div className="bg-[var(--bg-secondary)] p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-2xl text-[var(--text-primary)] font-bold mb-4">
          {source === "edit" ? "Edit a Reminder" : "Create a Reminder"}
        </h3>
        <form onSubmit={(e) => handleFormSubmit(e, source, selectedDate, id)}className="space-y-2 text-xl" lang="en-GB">
          <div>
            <label className="block text-lg font-medium text-[var(--text-primary)]">Title</label>
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
            <label className="block text-lg font-medium text-[var(--text-primary)]">Start Time</label>
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
            <label className="block text-lg font-medium text-[var(--text-primary)]">End Time</label>
            <input
              type="time"
              name="endTime"
              value={endTimeState}
              onChange={handleEndTimeChange}
              className="w-full border rounded p-2 bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-[var(--text-primary)]">Date</label>
            <input
              type="date"
              name="date"
              value={formatDateForInput(dateState)}
              onChange={(e) => {
                const [year, month, day] = e.target.value.split("-");
                const localDate = new Date(year, month - 1, day); // No timezone shift
                setDateState(localDate);
              }}              
              required
              className="w-full border rounded p-2 bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-[var(--text-primary)]">Interval (minutes)</label>
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
              className="bg-[var(--cancel-color)] hover:bg-[var(--cancel-color-hover)] text-[var(--text-on-cancel)] font-semibold px-4 py-2 rounded"
              onClick={closeForm}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-[var(--text-on-accent)] px-4 py-2 rounded"
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
