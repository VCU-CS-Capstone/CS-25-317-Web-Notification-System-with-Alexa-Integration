'use client';
import React from 'react';
import SettingsContainer from './SettingsContainer';

const TimeFormatSettings = ({ timeFormat, setTimeFormat }) => {
  return (
    <SettingsContainer
      title="Time Format"
      description="Choose how you want time to be displayed throughout the application."
    >
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className={`border rounded-lg p-4 cursor-pointer transition-all ${timeFormat === '12hour' ? 'border-[var(--accent-color)] bg-opacity-10 bg-[var(--accent-color)]' : 'border-gray-300 hover:border-gray-400'}`}
          onClick={() => setTimeFormat('12hour')}
        >
          <div className="flex items-center">
            <input
              type="radio"
              id="time-12hour"
              name="timeFormat"
              value="12hour"
              checked={timeFormat === '12hour'}
              onChange={() => setTimeFormat('12hour')}
              className="h-4 w-4 text-[var(--accent-color)] focus:ring-[var(--accent-color)] border-gray-300"
            />
            <label htmlFor="time-12hour" className="ml-3 block font-medium text-[var(--text-primary)]">
              12-Hour (AM/PM)
            </label>
          </div>
          <p className="mt-2 text-center text-[var(--text-primary)]">3:30 PM</p>
        </div>
        
        <div 
          className={`border rounded-lg p-4 cursor-pointer transition-all ${timeFormat === '24hour' ? 'border-[var(--accent-color)] bg-opacity-10 bg-[var(--accent-color)]' : 'border-gray-300 hover:border-gray-400'}`}
          onClick={() => setTimeFormat('24hour')}
        >
          <div className="flex items-center">
            <input
              type="radio"
              id="time-24hour"
              name="timeFormat"
              value="24hour"
              checked={timeFormat === '24hour'}
              onChange={() => setTimeFormat('24hour')}
              className="h-4 w-4 text-[var(--accent-color)] focus:ring-[var(--accent-color)] border-gray-300"
            />
            <label htmlFor="time-24hour" className="ml-3 block font-medium text-[var(--text-primary)]">
              24-Hour (Military)
            </label>
          </div>
          <p className="mt-2 text-center text-[var(--text-primary)]">15:30</p>
        </div>
      </div>
    </SettingsContainer>
  );
};

export default TimeFormatSettings;
