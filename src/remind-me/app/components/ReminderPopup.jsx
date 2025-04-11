import React, {useState} from "react";

const ReminderPopup = ({ closeForm, loading, handleFormSubmit, selectedDate }) => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [interval, setInterval] = useState(30); 
  const [userChangedEnd, setUserChangedEnd] = useState(false);
  const [date, setDate] = useState(selectedDate ? new Date(selectedDate).toISOString().split("T")[0] : "");
  const [errorMsg, setErrorMsg] = useState("");

  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value; 
    setStartTime(newStartTime); 

    if (!userChangedEnd && newStartTime){
      const [hours, minutes] = newStartTime.split(":").map(Number); 
      const date = new Date(); 
      date.setHours(hours); 
      date.setMinutes(minutes + 30); 

      const endHours = String(date.getHours()).padStart(2,"0"); 
      const endMinutes = String(date.getMinutes()).padStart(2,"0"); 

      setEndTime(`${endHours}:${endMinutes}`);
    }
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value); 
    setUserChangedEnd(true); 
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-blue-600  p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-xl text-white font-bold mb-4">Create a Reminder</h3>
        <form onSubmit={handleFormSubmit} className="space-y-3 text-lg">
          <div>
            <label className="block text-sm font-medium text-white">
              Title
            </label>
            <input
              type="text"
              name="title"
              required
              className="w-full border rounded p-2 bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={startTime}
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
              value={endTime}
              onChange={handleEndTimeChange}
              className="w-full border rounded p-2 bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white">Date</label>
            <input
              type="date"
              name="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded p-2 bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white">Interval</label>
            <input
              type="number"
              min={1}
              name="interval"
              value={interval}
              onChange={(e) => {
                const value = e.target.value; 
                const num = parseInt(value, 10)

                if (value === "" || isNaN(num)){
                  setErrorMsg("Please enter a valid number");
                  setInterval(""); 
                } else {
                  setErrorMsg(""); 
                  setInterval(num); 
                }
              }}
              required
              className="w-full border rounded p-2 bg-white text-black"
            />
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


