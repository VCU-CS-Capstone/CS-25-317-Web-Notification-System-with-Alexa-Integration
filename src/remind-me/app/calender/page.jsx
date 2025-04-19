"use client";
import React from "react";
import { useRouter } from "next/navigation";
import DateRangeSelector from "../components/DateRangeSelector";
import Calendar from "../components/Calendar";

const CalendarPage = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Format the date for the dashboard URL
    const formattedDate = formatDateForDB(date);
    router.push(`/dashboard?date=${formattedDate}`);
  };

  const handleRangeSelect = (startDate, endDate) => {
    router.push(`/date-range?start=${startDate}&end=${endDate}`);
  };

  // Format date as YYYY-MM-DD for database queries
  const formatDateForDB = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Calendar</h1>
        
        <DateRangeSelector onRangeSelect={handleRangeSelect} />
        
        <Calendar selectedDate={selectedDate} onDateSelect={handleDateSelect} />
      </div>
    </div>
  );
};

export default CalendarPage;
