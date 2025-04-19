"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import DateRangeSelector from "../components/DateRangeSelector";

function DateRangeViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });

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

    // Get start and end dates from URL parameters
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    
    if (startParam && endParam) {
      setDateRange({
        startDate: startParam,
        endDate: endParam
      });
    }
  }, [router, searchParams]);

  // Fetch reminders when userId or date range changes
  useEffect(() => {
    if (userId && dateRange.startDate && dateRange.endDate) {
      fetchRemindersForDateRange();
    }
  }, [userId, dateRange]);

  const fetchRemindersForDateRange = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("userid", userId)
        .gte("event_date", dateRange.startDate)
        .lte("event_date", dateRange.endDate)
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true });
      
      if (error) throw error;
      
      // Process reminders
      const processedReminders = data.map(reminder => ({
        id: reminder.id,
        title: reminder.event_name,
        startTime: removeSeconds(reminder.start_time),
        date: reminder.event_date,
        description: reminder.event_description,
        isComplete: reminder.is_complete
      }));
      
      // Group reminders by date
      const remindersByDate = {};
      processedReminders.forEach(reminder => {
        if (!remindersByDate[reminder.date]) {
          remindersByDate[reminder.date] = [];
        }
        remindersByDate[reminder.date].push(reminder);
      });
      
      // Convert to array for easier rendering
      const remindersList = Object.keys(remindersByDate).map(date => ({
        date,
        reminders: remindersByDate[date],
        hasReminders: remindersByDate[date].length > 0
      }));
      
      setReminders(remindersList);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching reminders for date range:", err);
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

  // Format date as MM-DD-YY for display
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
    return `${month}/${day}/${year.toString()}`;
  };

  const handleRangeSelect = (startDate, endDate) => {
    router.push(`/date-range?start=${startDate}&end=${endDate}`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Reminders by Date Range</h1>
        
        <DateRangeSelector onRangeSelect={handleRangeSelect} />
        
        {dateRange.startDate && dateRange.endDate && (
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold">
              Viewing reminders from {formatDateForDisplay(dateRange.startDate)} to {formatDateForDisplay(dateRange.endDate)}
            </h2>
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-10">
            <p className="text-[var(--text-secondary)]">Loading reminders...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="text-center py-10">
            <p className="text-red-500">Error: {error}</p>
          </div>
        )}
        
        {/* No reminders state */}
        {!loading && !error && reminders.length === 0 && dateRange.startDate && dateRange.endDate && (
          <div className="text-center py-10">
            <p className="text-[var(--text-secondary)]">No reminders found for this date range.</p>
          </div>
        )}
        
        {/* Reminders List */}
        {!loading && !error && reminders.length > 0 && (
          <div className="space-y-6">
            {reminders.map((day) => (
              <div 
                key={day.date} 
                className="bg-[var(--bg-secondary)] shadow-lg rounded-lg p-6"
              >
                <Link href={`/dashboard?date=${day.date}`} className="block">
                  <h3 className="text-xl font-bold mb-4 flex justify-between items-center">
                    <span>{formatDateForDisplay(day.date)}</span>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {day.reminders.length} {day.reminders.length === 1 ? 'reminder' : 'reminders'}
                    </span>
                  </h3>
                  
                  <ul className="space-y-3">
                    {day.reminders.map((reminder) => (
                      <li 
                        key={reminder.id} 
                        className={`p-4 rounded ${reminder.isComplete ? 'bg-green-100 dark:bg-green-900' : 'bg-[var(--bg-primary)]'} border border-[var(--text-secondary)] border-opacity-30`}
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">{reminder.title}</span>
                          <span className="text-[var(--text-secondary)]">{reminder.startTime}</span>
                        </div>
                        {reminder.description && (
                          <p className="text-sm text-[var(--text-secondary)] mt-2">{reminder.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DateRangeView() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <p className="text-[var(--text-primary)] text-xl">Loading date range view...</p>
      </div>
    }>
      <DateRangeViewContent />
    </Suspense>
  );
}
