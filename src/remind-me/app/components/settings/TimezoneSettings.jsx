'use client';
import React from 'react';
import SettingsContainer from './SettingsContainer';

const TimezoneSettings = ({ timezone, setTimezone, timezones }) => {
  return (
    <SettingsContainer 
      title="Time Zone"
      description="Select your preferred time zone for reminders and notifications."
    >
      <div className="mb-2">
        <label htmlFor="timezone" className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
          Time Zone
        </label>
        <select
          id="timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-[var(--bg-primary)] text-[var(--text-primary)]"
        >
          {timezones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>
    </SettingsContainer>
  );
};

export default TimezoneSettings;
