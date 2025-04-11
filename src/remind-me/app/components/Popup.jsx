export const Popup = ({ selectedReminder, closePopup, handleDelete, handleEdit }) => {
  const { title, startTime, endTime, interval, date } = selectedReminder;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
      <div className="p-6 rounded-2xl shadow-lg max-w-md w-full bg-blue-600 font-semibold">
        <p className="text-2xl mb-4 text-white">
          {title}
        </p>
        <p className="text-base text-white mb-2">
          <strong>Date:</strong> {date}
        </p>
        <p className="text-base text-white mb-2">
          <strong>Time:</strong> {startTime} - {endTime}
        </p>
        <p className="text-base text-white mb-4">
          <strong>Notification Time:</strong> {interval} min.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 rounded-md bg-blue-800 text-white font-medium hover:bg-blue-900 transition-colors"
            onClick={closePopup}
          >
            Close
          </button>

          <button
            className="px-4 py-2 rounded-md bg-blue-800 text-white font-medium hover:bg-blue-900 transition-colors"
            //onClick={handleEdit}
          >
            Edit
          </button>

          <button
            className="px-4 py-2 rounded-md bg-red-700 text-white font-medium hover:bg-red-800 transition-colors"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
