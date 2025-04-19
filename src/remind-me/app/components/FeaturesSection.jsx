"use client";
import { useState } from 'react';

const FeaturesSection = () => {
  const [activeTab, setActiveTab] = useState(0);
  
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
  
  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 text-center text-[var(--text-primary)]">
        Key Features
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {features.map((feature, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              activeTab === index
                ? "bg-[var(--accent-color)] text-[var(--text-on-accent)]"
                : "bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary-hover)]"
            }`}
          >
            {feature.icon} {feature.title}
          </button>
        ))}
      </div>
      
      <div className="bg-[var(--bg-primary)] p-4 rounded-lg">
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
