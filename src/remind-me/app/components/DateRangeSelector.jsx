"use client";
import React, { useState, useEffect } from "react";

const DateRangeSelector = ({ onRangeSelect }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Set default dates when component mounts
  useEffect(() => {
    // Set start date to today
    const today = new Date();
    const formattedToday = formatDateForInput(today);
    setStartDate(formattedToday);
    
    // Set end date to 7 days from today
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const formattedNextWeek = formatDateForInput(nextWeek);
    setEndDate(formattedNextWeek);
  }, []);
  
  // Format date as YYYY-MM-DD for input fields
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate dates
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      setError("Start date cannot be after end date");
      return;
    }
    
    setError("");
    onRangeSelect(startDate, endDate);
    setIsExpanded(false); // Collapse after submission
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Quick select options
  const selectThisWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
    startOfWeek.setDate(diff);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    
    setStartDate(formatDateForInput(startOfWeek));
    setEndDate(formatDateForInput(endOfWeek));
  };
  
  const selectThisMonth = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(formatDateForInput(startOfMonth));
    setEndDate(formatDateForInput(endOfMonth));
  };
  
  const selectNextWeek = () => {
    const today = new Date();
    const nextMonday = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = (dayOfWeek === 0 ? 1 : 8 - dayOfWeek); // Next Monday
    nextMonday.setDate(today.getDate() + diff);
    
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    
    setStartDate(formatDateForInput(nextMonday));
    setEndDate(formatDateForInput(nextSunday));
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg shadow-lg mb-6 overflow-hidden">
      {/* Header with toggle button */}
      <div 
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-opacity-80 transition-colors"
        onClick={toggleExpand}
      >
        <h3 className="text-xl font-semibold text-[var(--text-primary)] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          View Reminders by Date Range
        </h3>
        <button className="text-[var(--text-primary)]">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {/* Expandable content */}
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-gray-200">
          {/* Quick select buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button 
              type="button" 
              onClick={selectThisWeek}
              className="px-3 py-1 text-sm bg-[var(--bg-primary)] border border-[var(--text-secondary)] rounded-md hover:bg-[var(--accent-color)] hover:text-[var(--text-on-accent)] transition-colors"
            >
              This Week
            </button>
            <button 
              type="button" 
              onClick={selectThisMonth}
              className="px-3 py-1 text-sm bg-[var(--bg-primary)] border border-[var(--text-secondary)] rounded-md hover:bg-[var(--accent-color)] hover:text-[var(--text-on-accent)] transition-colors"
            >
              This Month
            </button>
            <button 
              type="button" 
              onClick={selectNextWeek}
              className="px-3 py-1 text-sm bg-[var(--bg-primary)] border border-[var(--text-secondary)] rounded-md hover:bg-[var(--accent-color)] hover:text-[var(--text-on-accent)] transition-colors"
            >
              Next Week
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="startDate" className="block text-sm font-medium mb-1 text-[var(--text-primary)]">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-[var(--bg-primary)] text-[var(--text-primary)]"
              />
            </div>
            
            <div className="flex-1">
              <label htmlFor="endDate" className="block text-sm font-medium mb-1 text-[var(--text-primary)]">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-[var(--bg-primary)] text-[var(--text-primary)]"
              />
            </div>
            
            <div className="self-end">
              <button
                type="submit"
                className="px-4 py-2 bg-[var(--accent-color)] text-[var(--text-on-accent)] rounded-md hover:bg-[var(--accent-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)]"
              >
                View Reminders
              </button>
            </div>
          </form>
          
          {error && (
            <div className="mt-2 text-red-500 text-sm">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
