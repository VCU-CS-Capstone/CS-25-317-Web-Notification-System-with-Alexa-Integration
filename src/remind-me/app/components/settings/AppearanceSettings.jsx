'use client';
import React from 'react';
import SettingsContainer from './SettingsContainer';

const AppearanceSettings = ({ colorMode, setColorMode, colorModes }) => {
  // Function to determine if a theme is light or dark for screen readers and metadata
  const getThemeType = (mode) => {
    if (mode === 'dark') return 'dark';
    return 'light'; // Both default and 'light' (purple & cream) are light themes
  };
  return (
    <SettingsContainer
      title="Appearance"
      description="Choose your preferred color mode for the application."
    >
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {colorModes.map((mode) => (
          <div 
            key={mode.value}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              colorMode === mode.value 
                ? "border-[var(--accent-color)] bg-opacity-10 bg-[var(--accent-color)]" 
                : "border-gray-300 hover:border-gray-400"
            }`}
            onClick={() => setColorMode(mode.value)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                id={`mode-${mode.value || 'default'}`}
                name="colorMode"
                value={mode.value}
                checked={colorMode === mode.value}
                onChange={() => setColorMode(mode.value)}
                className="h-4 w-4 text-[var(--accent-color)] focus:ring-[var(--accent-color)] border-gray-300"
              />
              <label 
                htmlFor={`mode-${mode.value || 'default'}`}
                className="ml-3 block text-sm font-medium text-[var(--text-primary)]"
              >
                {mode.label}
                <span className="ml-2 text-xs text-[var(--text-secondary)]">
                  ({getThemeType(mode.value) === 'dark' ? 'Dark Mode' : 'Light Mode'})
                </span>
              </label>
            </div>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{mode.description}</p>
            <div className={`mt-3 h-10 rounded border ${
              mode.value === "light" 
                ? "bg-[#f5f5f0] border-[#4a235a]" 
                : mode.value === "dark" 
                ? "bg-[#121212] border-[#f5f5f0]" 
                : "bg-white border-[#73FF00]"
            }`}>
              <div className={`h-full w-1/3 ${
                mode.value === "light" 
                  ? "bg-[#4a235a]" 
                  : mode.value === "dark" 
                  ? "bg-[#000000]" 
                  : "bg-[#73FF00]"
              }`}></div>
            </div>
          </div>
        ))}
      </div>
    </SettingsContainer>
  );
};

export default AppearanceSettings;
