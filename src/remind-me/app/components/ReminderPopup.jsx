import React, { useState, useEffect } from "react";

const ReminderPopup = ({ closeForm, loading, handleFormSubmit, selectedDate, source, selectedReminder }) => {
  // Get user's time format preference
  const [timeFormat, setTimeFormat] = useState('12hour');
  
  useEffect(() => {
    // Get time format from localStorage
    const storedTimeFormat = localStorage.getItem('timeFormat');
    if (storedTimeFormat) {
      setTimeFormat(storedTimeFormat);
      
      // Apply time format to the page
      if (storedTimeFormat === '24hour') {
        // Force browser to use 24-hour format for time inputs
        document.documentElement.setAttribute('data-time-format', '24hour');
      } else {
        document.documentElement.setAttribute('data-time-format', '12hour');
      }
    }
  }, []);
  // Check if we're in high contrast mode
  const [isHighContrast, setIsHighContrast] = useState(true);
  
  useEffect(() => {
    // Check if any color mode class is applied to html element
    const htmlElement = document.documentElement;
    const hasLightClass = htmlElement.classList.contains('light');
    const hasDarkClass = htmlElement.classList.contains('dark');
    
    // If neither light nor dark class is present, we're in high contrast mode
    setIsHighContrast(!hasLightClass && !hasDarkClass);
    
    // Set up a mutation observer to detect class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const hasLightClass = htmlElement.classList.contains('light');
          const hasDarkClass = htmlElement.classList.contains('dark');
          setIsHighContrast(!hasLightClass && !hasDarkClass);
        }
      });
    });
    
    observer.observe(htmlElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  const formatDateForInput = (dateObj) => {
    // Handle different date input formats
    let date;
    
    if (typeof dateObj === "string") {
      // If it's already in YYYY-MM-DD format, parse it without timezone issues
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateObj)) {
        const [year, month, day] = dateObj.split("-").map(num => parseInt(num, 10));
        // Create local date without using UTC to prevent timezone issues
        date = new Date(year, month - 1, day);
      } else {
        // For other string formats, try to parse normally
        date = new Date(dateObj);
      }
    } else if (dateObj instanceof Date) {
      date = new Date(dateObj);
    } else {
      // Default to today
      date = new Date();
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date for formatting:", dateObj);
      date = new Date(); // Fallback to today
    }
  
    // Format as YYYY-MM-DD without timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  

  // fallback destructuring
  let { id, title, interval, event_description } = selectedReminder || {};

  // States
  const [titleState, setTitleState] = useState(title || "");
  const [descriptionState, setDescriptionState] = useState(event_description || "");
  const [startTimeState, setStartTimeState] = useState("");
  const [endTimeState, setEndTimeState] = useState("");
  const [intervalState, setIntervalState] = useState(interval || 60);
  const [userChangedEnd, setUserChangedEnd] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Check if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const [dateState, setDateState] = useState(() => {
    if (source === 'create') {
      // For create mode, use the selected date
      if (selectedDate instanceof Date) {
        return selectedDate;
      } else if (typeof selectedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
        // Parse YYYY-MM-DD format without timezone issues
        const [year, month, day] = selectedDate.split("-").map(num => parseInt(num, 10));
        // Use local date (not UTC) to prevent date shifting
        return new Date(year, month - 1, day);
      }
    } else if (source === 'edit' && typeof selectedDate === 'string') {
      // For edit mode with string date
      const [year, month, day] = selectedDate.split("-").map(num => parseInt(num, 10));
      // Use local date constructor to prevent timezone issues
      return new Date(year, month - 1, day);
    }
    // Default to today
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

  // We're using the handleFormSubmit passed as a prop, so we don't need to define it here

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className={`${isHighContrast ? 'bg-blue-600 border-2 border-black' : 'bg-[var(--bg-secondary)]'} p-5 rounded-lg shadow-lg w-full max-w-xl mx-auto`}>
        <h3 className={`text-2xl ${isHighContrast ? 'text-yellow-300' : 'text-[var(--text-primary)]'} font-bold mb-4`}>
          {source === "edit" ? "Edit a Reminder" : "Create a Reminder"}
        </h3>
        <form onSubmit={(e) => handleFormSubmit(e, source, formatDateForInput(dateState), id)} className="space-y-4" lang="en-GB">
          {/* Main form layout - responsive grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column - always visible */}
            <div className="space-y-4">
              <div>
                <label className={`block text-base font-medium ${isHighContrast ? 'text-yellow-300' : 'text-[var(--text-primary)]'}`}>Title</label>
                <input
                  type="text"
                  name="title"
                  value={titleState}
                  onChange={(e) => setTitleState(e.target.value)}
                  required
                  placeholder="Enter reminder title"
                  className="w-full border rounded p-2 bg-white text-black text-base h-10"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-base font-medium ${isHighContrast ? 'text-yellow-300' : 'text-[var(--text-primary)]'}`}>Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={startTimeState}
                    onChange={handleStartTimeChange}
                    step="60"
                    required
                    className="w-full border rounded p-2 bg-white text-black text-base h-10"
                  />
                </div>
                <div>
                  <label className={`block text-base font-medium ${isHighContrast ? 'text-yellow-300' : 'text-[var(--text-primary)]'}`}>End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={endTimeState}
                    onChange={handleEndTimeChange}
                    step="60"
                    required
                    className="w-full border rounded p-2 bg-white text-black text-base h-10"
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-base font-medium ${isHighContrast ? 'text-yellow-300' : 'text-[var(--text-primary)]'}`}>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formatDateForInput(dateState)}
                  onChange={(e) => {
                    if (e.target.value) {
                      const [year, month, day] = e.target.value.split('-').map(Number);
                      // Create a date object using local time to avoid timezone issues
                      setDateState(new Date(year, month - 1, day));
                    }
                  }}
                  required
                  className="w-full border rounded p-2 bg-white text-black text-base h-10"
                />
              </div>
              
              <div>
                <label className={`block text-base font-medium ${isHighContrast ? 'text-yellow-300' : 'text-[var(--text-primary)]'}`}>Notification (minutes before)</label>
                <select
                  name="interval"
                  value={intervalState}
                  onChange={(e) => setIntervalState(e.target.value)}
                  className="w-full border rounded p-2 bg-white text-black text-base h-10"
                >
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                </select>
                {errorMsg && <p className="text-red-200 text-sm mt-1">{errorMsg}</p>}
              </div>
            </div>
            
            {/* Description field - unified for both mobile and desktop */}
            <div className="w-full">
              <label className={`block text-base font-medium ${isHighContrast ? 'text-yellow-300' : 'text-[var(--text-primary)]'} mb-2`}>
                Description (optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={descriptionState}
                onChange={(e) => setDescriptionState(e.target.value)}
                placeholder="Add details about this reminder"
                className="w-full border rounded p-2 bg-white text-black text-base min-h-[100px] resize-y"
                rows={isMobile ? 4 : 6}
              />
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-500">
            <button
              type="button"
              className={`${isHighContrast ? 'bg-red-600 hover:bg-red-700 text-white border border-black' : 'bg-[var(--cancel-color)] hover:bg-[var(--cancel-color-hover)] text-[var(--text-on-cancel)]'} font-semibold px-4 py-2 rounded text-base`}
              onClick={closeForm}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${isHighContrast ? 'bg-green-500 hover:bg-green-600 text-black border border-black' : 'bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-[var(--text-on-accent)]'} px-4 py-2 rounded text-base`}
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
