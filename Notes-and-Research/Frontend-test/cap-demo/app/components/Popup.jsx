import React from "react";

const Popup = ({ selectedReminder, closePopup, handleDelete }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-xl font-bold mb-2 text-white">
          {selectedReminder.title}
        </h3>
        <p className="mb-4 text-white">{selectedReminder.description}</p>
        <div className="flex justify-end space-x-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={closePopup}
          >
            Close
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded">
            Done
          </button>
          <button className="bg-yellow-500 text-white px-4 py-2 rounded">
            Edit
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
