'use client';
import React, { useState } from 'react';

/**
 * A tabbed interface component for organizing settings into logical groups
 */
const SettingsTabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="mb-6">
      {/* Tab navigation */}
      <div className="flex flex-wrap border-b border-gray-300 mb-6">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`px-4 py-2 font-medium text-sm md:text-base transition-colors duration-200 
              ${activeTab === index 
                ? 'border-b-2 border-[var(--accent-color)] text-[var(--accent-color)]' 
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default SettingsTabs;
