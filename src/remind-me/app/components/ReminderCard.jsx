import React, { useState, useEffect } from "react";

const formatDate = (date) => {
  // Parse the date string without timezone conversion
  let d;
  
  if (typeof date === 'string' && date.includes('-')) {
    // Handle YYYY-MM-DD format
    const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
    // Create date using local timezone (no timezone conversion)
    d = new Date(year, month - 1, day);
  } else {
    // Fallback for other formats
    d = new Date(date);
  }
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);

  return `${month}-${day}-${year}`;
};

export const ReminderCard = ({ title, event_description, startTime, date, is_complete, onClick}) => {
  // Parse date parts directly to avoid timezone issues
  let reminderDateTime;
  
  if (typeof date === 'string' && date.includes('-')) {
    const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
    const [hours, minutes] = startTime ? startTime.split(':').map(num => parseInt(num, 10)) : [0, 0];
    
    // Create date in local timezone
    reminderDateTime = new Date(year, month - 1, day, hours, minutes);
  } else {
    // Fallback for other formats
    reminderDateTime = new Date(`${date}T${startTime || '00:00'}:00`);
  }
  
  // Get the current time
  const currentDateTime = new Date();

  // Check if the reminder is in the past
  const isPast = reminderDateTime < currentDateTime;

  // Determine text color based on completion status and time
  // Green for complete, white for incomplete and not past, red for incomplete and past
  const statusTextColor = is_complete 
    ? 'text-green-500' 
    : (isPast ? 'text-red-500' : 'text-white');

  // Add a useEffect to detect if we're in high contrast mode
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

  return (
    <div
      onClick={onClick}
      className={`
        ${isPast 
          ? 'bg-gray-700' // Darker gray for past-time cards
          : isHighContrast 
            ? 'bg-blue-400' // Much brighter blue color for high contrast mode
            : 'bg-[var(--bg-secondary)]'
        }
        p-3 shadow-lg rounded-2xl cursor-pointer 
        hover:scale-105 transition-transform duration-300 ease-in-out 
        flex flex-row items-center justify-between
        sm:flex-col sm:items-start sm:justify-between 
        w-full sm:w-60 sm:h-60 
        mb-4 ml-4 mr-4
      `}
    >
      <div className="flex-1 sm:w-full overflow-hidden">
        <h2 className={`text-2xl font-semibold ${statusTextColor} truncate`}>{title}</h2>
        <p className={`sm:block text-lg font-semibold mt-1 ${isPast || isHighContrast ? 'text-white' : 'text-[var(--text-secondary)]'} line-clamp-2`}>{event_description}</p>
      </div>

      {/* Right section: Date and Time */}
      <div className={`text-right text-base sm:text-left mt-0 sm:mt-auto sm:pt-4 ${isPast || isHighContrast ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
        <p className={`text-xl sm:text-xl font-medium whitespace-nowrap`}>
          {formatDate(date)} at {startTime}
        </p>
      </div>
    </div>
  );
};

export default ReminderCard;