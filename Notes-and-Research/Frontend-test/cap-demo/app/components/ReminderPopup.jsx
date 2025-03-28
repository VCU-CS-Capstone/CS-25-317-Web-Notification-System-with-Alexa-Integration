import React from "react";

const ReminderPopup = ({ closeForm, loading, handleFormSubmit }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#73FF00] p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-xl text-black font-bold mb-4">Create a Reminder</h3>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black">
              Title
            </label>
            <input
              type="text"
              name="title"
              required
              className="w-full border rounded p-2 bg-white text-black" // Added bg-white and text-black for better visibility
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Time</label>
            <input
              type="time"
              name="time"
              required
              className="w-full border rounded p-2 bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black">Date</label>
            <input
              type="date"
              name="date"
              required
              className="w-full border rounded p-2 bg-white text-black"
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
  );
};

export default ReminderPopup;
