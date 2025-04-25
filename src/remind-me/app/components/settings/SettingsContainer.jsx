'use client';
import React from 'react';

/**
 * A container component for settings sections that provides consistent styling
 * and containerization for better organization and mobile compatibility.
 */
const SettingsContainer = ({ title, description, children }) => {
  return (
    <div className="bg-[var(--bg-secondary)] shadow-lg rounded-lg p-6 mb-6 transition-all duration-300 hover:shadow-xl">
      {title && (
        <h2 className="text-2xl font-semibold mb-2 text-[var(--text-primary)]">
          {title}
        </h2>
      )}
      
      {description && (
        <p className="mb-4 text-[var(--text-secondary)]">
          {description}
        </p>
      )}
      
      <div className="settings-content">
        {children}
      </div>
    </div>
  );
};

export default SettingsContainer;
