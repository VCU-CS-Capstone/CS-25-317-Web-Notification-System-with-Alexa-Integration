"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

function MonthlyViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [monthData, setMonthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get the month and year from URL parameters
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return {
      month: now.getMonth(),
      year: now.getFullYear()
    };
  });

  // Month names for header
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    // Get month and year from URL parameters
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');
    
    if (monthParam && yearParam) {
      const month = parseInt(monthParam, 10);
      const year = parseInt(yearParam, 10);
      
      if (!isNaN(month) && !isNaN(year) && month >= 0 && month <= 11) {
        setCurrentMonth({ month, year });
      }
    }
  }, [searchParams]);

  useEffect(() => {
    // Check if user is logged in
    const storedUsername = localStorage.getItem("username");
    const storedUserId = localStorage.getItem("userId");
    
    if (!storedUsername || !storedUserId) {
      router.push("/");
      return;
    }
    
    setUsername(storedUsername);
    setUserId(storedUserId);
  }, [router]);

  // Fetch reminders for the entire month
  useEffect(() => {
    if (userId) {
      fetchMonthReminders();
    }
  }, [userId, currentMonth]);

  const fetchMonthReminders = async () => {
    setLoading(true);
    try {
      // First day of the month in YYYY-MM-DD format
      const firstDay = new Date(currentMonth.year, currentMonth.month, 1).toISOString().split('T')[0];
      // Last day of the month in YYYY-MM-DD format
      const lastDay = new Date(currentMonth.year, currentMonth.month + 1, 0).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("userid", userId)
        .gte("event_date", firstDay)
        .lte("event_date", lastDay)
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true });
      
      if (error) throw error;
      
      // Group reminders by date
      const remindersByDate = {};
      data.forEach(reminder => {
        if (!remindersByDate[reminder.event_date]) {
          remindersByDate[reminder.event_date] = [];
        }
        remindersByDate[reminder.event_date].push({
          id: reminder.id,
          title: reminder.event_name,
          startTime: removeSeconds(reminder.start_time),
          date: reminder.event_date,
          description: reminder.event_description,
          isComplete: reminder.is_complete
        });
      });
      
      // Convert to array for easier rendering
      const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
      const monthDataArray = [];
      
      for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = formatDateForDB(new Date(currentMonth.year, currentMonth.month, i));
        const reminders = remindersByDate[dateStr] || [];
        
        monthDataArray.push({
          date: dateStr,
          dayOfMonth: i,
          reminders: reminders,
          hasReminders: reminders.length > 0
        });
      }
      
      setMonthData(monthDataArray);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching month reminders:", err);
    } finally {
      setLoading(false);
    }
  };

  function removeSeconds(time) {
    if (!time) return null;
    const parts = time.split(":");
    if (parts.length < 2) return time;
    return `${parts[0]}:${parts[1]}`;
  }

  // Format date as YYYY-MM-DD for database queries
  const formatDateForDB = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date as MM-DD-YY for display
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
    return `${month}/${day}/${year.toString().slice(-2)}`;
  };

  const navigateToPreviousMonth = () => {
    let newMonth, newYear;
    
    if (currentMonth.month === 0) {
      newMonth = 11;
      newYear = currentMonth.year - 1;
    } else {
      newMonth = currentMonth.month - 1;
      newYear = currentMonth.year;
    }
    
    router.push(`/monthly-view?month=${newMonth}&year=${newYear}`);
  };

  const navigateToNextMonth = () => {
    let newMonth, newYear;
    
    if (currentMonth.month === 11) {
      newMonth = 0;
      newYear = currentMonth.year + 1;
    } else {
      newMonth = currentMonth.month + 1;
      newYear = currentMonth.year;
    }
    
    router.push(`/monthly-view?month=${newMonth}&year=${newYear}`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pt-20 px-4">
      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={navigateToPreviousMonth}
          className="flex items-center px-3 py-2 rounded-lg hover:bg-[var(--accent-color)] hover:text-[var(--text-on-accent)] transition-colors border border-gray-300"
          aria-label="Previous Month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </button>
        
        <h1 className="text-3xl font-bold text-center">
          {monthNames[currentMonth.month]} {currentMonth.year}
        </h1>
        
        <button 
          onClick={navigateToNextMonth}
          className="flex items-center px-3 py-2 rounded-lg hover:bg-[var(--accent-color)] hover:text-[var(--text-on-accent)] transition-colors border border-gray-300"
          aria-label="Next Month"
        >
          <span className="hidden sm:inline">Next</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10">
          <p className="text-[var(--text-secondary)]">Loading monthly view...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-10">
          <p className="text-red-500">Error: {error}</p>
        </div>
      )}

      {/* Month Data */}
      {!loading && !error && (
        <div className="max-w-4xl mx-auto">
          {monthData.map((day) => (
            <div 
              key={day.date} 
              className={`mb-6 p-4 rounded-lg ${day.hasReminders ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--bg-primary)] border border-[var(--text-secondary)] border-opacity-20'}`}
            >
              <Link href={`/dashboard?date=${day.date}`} className="block">
                <h2 className="text-xl font-bold mb-2 flex justify-between items-center">
                  <span>{formatDateForDisplay(day.date)}</span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {day.reminders.length} {day.reminders.length === 1 ? 'reminder' : 'reminders'}
                  </span>
                </h2>
                
                {day.hasReminders ? (
                  <ul className="space-y-2">
                    {day.reminders.map((reminder) => (
                      <li 
                        key={reminder.id} 
                        className={`p-3 rounded ${reminder.isComplete ? 'bg-green-100 dark:bg-green-900' : 'bg-[var(--bg-primary)]'} border border-[var(--text-secondary)] border-opacity-30`}
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">{reminder.title}</span>
                          <span className="text-[var(--text-secondary)]">{reminder.startTime}</span>
                        </div>
                        {reminder.description && (
                          <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-1">{reminder.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[var(--text-secondary)] italic">No reminders for this day</p>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MonthlyView() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <p className="text-[var(--text-primary)] text-xl">Loading monthly view...</p>
      </div>
    }>
      <MonthlyViewContent />
    </Suspense>
  );
}
