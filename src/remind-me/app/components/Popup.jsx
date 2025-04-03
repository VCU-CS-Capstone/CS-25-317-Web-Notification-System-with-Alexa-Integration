export const Popup = ({ selectedReminder, closePopup, handleDelete }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
      <div className=" p-6 rounded-lg shadow-lg max-w-md w-full   bg-blue-600 ">
        <h3 className="text-2xl font-semibold mb-4 text-white">
          {selectedReminder?.title || "No Title"}
        </h3>

        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            onClick={closePopup}
          >
            Close
          </button>

          <button
            className="px-4 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
