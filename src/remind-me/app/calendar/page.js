"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Calendar from "../components/Calendar";

export default function CalendarPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [username, setUsername] = useState("");

  // Month names for header
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    // Check if user is logged in
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      router.push("/");
      return;
    }
    setUsername(storedUsername);
  }, [router]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Navigate to dashboard with selected date
    router.push(`/dashboard?date=${date.toISOString().split('T')[0]}`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pt-20 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()} Calendar
      </h1>
      <div className="max-w-4xl mx-auto">
        <Calendar 
          selectedDate={selectedDate} 
          onDateSelect={handleDateSelect} 
        />
      </div>
    </div>
  );
}
