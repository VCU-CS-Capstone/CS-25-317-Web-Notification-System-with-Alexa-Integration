import React, { useState } from "react";

const BottomNavbar = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const sessionId = 1; // Temporary session ID
  const apiUrl = "http://localhost:5001/users/events";

  const handleCreateClick = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const newReminder = {
      name: event.target.title.value,
      date: event.target.date.value,
      start_time: event.target.time.value,
      end_time: "", // Assuming no end time is provided
      interval: 30, // Default interval
      sessionId: sessionId,
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReminder),
      });

      console.log("API Response Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("API Response Data:", result);

      // setReminders([...reminders, result]);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error adding reminder:", error.message);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800 text-white shadow-lg">
        <div className="flex justify-around items-center p-3">
          <button className="btn btn-outline btn-sm hover:bg-slate-700">
            Prev
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleCreateClick}
          >
            Create
          </button>
          <button className="btn btn-outline btn-sm hover:bg-slate-700">
            Next
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Create a Reminder</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Time</label>
                <input
                  type="time"
                  name="time"
                  required
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={closeForm}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNavbar;
