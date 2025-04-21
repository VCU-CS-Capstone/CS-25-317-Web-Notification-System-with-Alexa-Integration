"use client";
import { useState, useEffect } from 'react';

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [colorMode, setColorMode] = useState("");
  
  // Get color mode from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedColorMode = localStorage.getItem('colorMode');
      if (storedColorMode) {
        setColorMode(storedColorMode);
      }
    }
  }, []);
  
  const testimonials = [
    {
      quote: "This app has completely changed how I manage my schedule. The Alexa integration is seamless!",
      author: "Aryan G.",
      role: "Notification Manager"
    },
    {
      quote: "I never miss an important event anymore. The notification system is reliable and customizable.",
      author: "Rebecca B.",
      role: "Alexa Specialist"
    },
    {
      quote: "The calendar view makes it easy to see all my upcoming events at a glance. Highly recommended!",
      author: "Parker D.",
      role: "Calendar Manager"
    }
  ];
  
  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);
  
  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg shadow-lg p-6 border border-[var(--accent-color)] backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-4 text-center text-[var(--text-primary)]">
        What Users Say
      </h3>
      
      <div className="relative h-32">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="flex flex-col h-full justify-between">
              <p className="text-[var(--text-primary)] italic">
                "{testimonial.quote}"
              </p>
              
              <div className="mt-2">
                <p className="font-medium text-[var(--text-primary)]">{testimonial.author}</p>
                <p className="text-sm text-[var(--text-secondary)]">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center mt-4">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 w-2 rounded-full mx-1 ${
              index === currentIndex
                ? "bg-[var(--accent-color)]"
                : "bg-gray-300"
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSection;
