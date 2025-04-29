'use client';
import React from 'react';
import SettingsContainer from './SettingsContainer';

const FontSizeSettings = ({ fontSize, setFontSize, fontSizes }) => {
  return (
    <SettingsContainer
      title="Font Size"
      description="Choose your preferred font size for better readability."
    >
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fontSizes.map((size) => (
          <div 
            key={size.value}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              fontSize === size.value 
                ? "border-[var(--accent-color)] bg-opacity-10 bg-[var(--accent-color)]" 
                : "border-gray-300 hover:border-gray-400"
            }`}
            onClick={() => setFontSize(size.value)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                id={`size-${size.value}`}
                name="fontSize"
                value={size.value}
                checked={fontSize === size.value}
                onChange={() => setFontSize(size.value)}
                className="h-4 w-4 text-[var(--accent-color)] focus:ring-[var(--accent-color)] border-gray-300"
              />
              <label 
                htmlFor={`size-${size.value}`}
                className={`ml-3 block font-medium text-[var(--text-primary)] ${
                  size.value === "small" ? "text-sm" : 
                  size.value === "large" ? "text-lg" : 
                  "text-base"
                }`}
              >
                {size.label}
              </label>
            </div>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{size.description}</p>
            <div className="mt-3 flex items-center justify-center h-10 rounded border border-[var(--text-secondary)] bg-[var(--bg-primary)]">
              <span className={`${
                size.value === "small" ? "text-sm" : 
                size.value === "large" ? "text-lg" : 
                "text-base"
              }`}>Sample Text</span>
            </div>
          </div>
        ))}
      </div>
    </SettingsContainer>
  );
};

export default FontSizeSettings;
