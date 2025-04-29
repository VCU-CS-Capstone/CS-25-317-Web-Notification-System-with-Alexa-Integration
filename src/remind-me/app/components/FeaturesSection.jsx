"use client";
import { useState, useEffect } from 'react';

const FeaturesSection = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [colorMode, setColorMode] = useState("");
  
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const storedColorMode = localStorage.getItem('colorMode');
      if (storedColorMode) {
        setColorMode(storedColorMode);
      }
    }
  }, []);
  
  const features = [
    {
      title: "Smart Reminders",
      description: "Set reminders with customizable notifications that sync across all your devices.",
      icon: "🔔"
    },
    {
      title: "Calendar Integration",
      description: "Seamlessly integrates with Google Calendar to keep all your events in one place.",
      icon: "📅"
    },
    {
      title: "Alexa Support",
      description: "Ask Alexa to set, check, or manage your reminders with voice commands.",
      icon: "🔊"
    },
    {
      title: "Mobile Friendly",
      description: "Works on any device with a responsive design that adapts to your screen.",
      icon: "📱"
    }
  ];
  
  // Check if user has large font setting
  const checkLargeFontSettings = () => {
    if (typeof window === 'undefined') return false;
    const fontSize = localStorage.getItem('fontSize');
    return fontSize === 'large' || fontSize === 'x-large';
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg shadow-lg p-6 mb-6 border border-[var(--accent-color)] backdrop-blur-sm overflow-hidden">
      <h3 className="text-xl font-bold mb-4 text-center text-[var(--text-primary)]">
        Key Features
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 overflow-hidden">
        {features.map((feature, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-3 py-2 rounded-md transition-colors overflow-hidden break-words ${
              activeTab === index
                ? "bg-[var(--accent-color)] text-[var(--text-on-accent)]"
                : "bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary-hover)]"
            }`}
            style={{ fontSize: checkLargeFontSettings() ? '12px' : '0.875rem' }}
          >
            <span className="inline-block mr-1">{feature.icon}</span>
            <span className="inline-block">{feature.title}</span>
          </button>
        ))}
      </div>
      
      <div className="bg-[var(--bg-primary)] p-4 rounded-lg overflow-hidden">
        <div className="flex items-center mb-2">
          <span className="text-3xl mr-3">{features[activeTab].icon}</span>
          <h4 className="text-lg font-medium text-[var(--text-primary)]">
            {features[activeTab].title}
          </h4>
        </div>
        <p className="text-[var(--text-secondary)]">
          {features[activeTab].description}
        </p>
      </div>
    </div>
  );
};

export default FeaturesSection;
