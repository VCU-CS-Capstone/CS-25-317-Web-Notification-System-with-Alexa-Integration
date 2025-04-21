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
  // State for font size
  const [fontSize, setFontSize] = useState('medium');  
  
  // Get font size from localStorage
  useEffect(() => {
    const storedFontSize = localStorage.getItem('fontSize');
    if (storedFontSize) {
      setFontSize(storedFontSize);
    }
  }, []);
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

  // Format time to be more readable based on user preference
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      // Check user's time format preference from localStorage
      const timeFormat = localStorage.getItem('timeFormat') || '12hour';
      const [hours, minutes] = timeString.split(':');
      const h = parseInt(hours, 10);
      
      if (timeFormat === '24hour') {
        // 24-hour format (military time)
        return `${hours.padStart(2, '0')}:${minutes}`;
      } else {
        // 12-hour format with AM/PM
        const period = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 || 12; // Convert 0 to 12 for 12 AM
        return `${hour}:${minutes} ${period}`;
      }
    } catch (e) {
      console.error('Error formatting time:', e);
      return timeString;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${isPast 
          ? 'bg-gray-700' // Darker gray for past-time cards
          : isHighContrast 
            ? 'bg-blue-600' // Darker blue for better contrast in high contrast mode
            : 'bg-[var(--bg-secondary)]'
        }
        ${fontSize === 'large' ? 'p-3' : fontSize === 'small' ? 'p-2' : 'p-2.5'} 
        shadow-md border-2 rounded-lg cursor-pointer 
        hover:shadow-lg transition-all duration-200 ease-in-out 
        flex flex-col justify-between
        w-full max-w-full overflow-hidden
        ${fontSize === 'large' ? 'aspect-square' : fontSize === 'small' ? 'aspect-[4/3]' : 'aspect-[4/3]'}
        mb-3 mx-auto
        ${isHighContrast ? 'border-black' : 'border-[var(--accent-color)]'} 
      `}
    >
      {/* Title and status indicator */}
      <div className="flex items-center justify-between w-full mb-2">
        <h2 className={`${fontSize === 'large' ? 'text-2xl' : fontSize === 'small' ? 'text-lg' : 'text-xl'} font-bold ${statusTextColor} truncate max-w-[80%]`}>{title}</h2>
        <div className={`w-3 h-3 rounded-full ${is_complete ? 'bg-green-500' : isPast ? 'bg-red-500' : 'bg-blue-400'}`}></div>
      </div>
      
      {/* Description */}
      <p className={`${fontSize === 'large' ? 'text-lg' : fontSize === 'small' ? 'text-sm' : 'text-base'} font-medium mb-3 ${isPast ? 'text-white' : isHighContrast ? 'text-yellow-300' : 'text-[var(--text-secondary)]'} line-clamp-2 ${fontSize === 'large' ? 'min-h-[3.5rem]' : fontSize === 'small' ? 'min-h-[2rem]' : 'min-h-[2.5rem]'}`}>
        {event_description || "No description"}
      </p>

      {/* Date and Time */}
      <div className="mt-auto pt-2 border-t border-gray-500 w-full">
        <div className="flex justify-between items-center">
          <p className={`${fontSize === 'large' ? 'text-base' : fontSize === 'small' ? 'text-xs' : 'text-sm'} font-medium ${isPast ? 'text-white' : isHighContrast ? 'text-yellow-300' : 'text-[var(--text-secondary)]'}`}>
            {formatDate(date)}
          </p>
          <p className={`${fontSize === 'large' ? 'text-base' : fontSize === 'small' ? 'text-xs' : 'text-sm'} font-medium ${isPast ? 'text-white' : isHighContrast ? 'text-yellow-300' : 'text-[var(--text-secondary)]'}`}>
            {formatTime(startTime)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReminderCard;