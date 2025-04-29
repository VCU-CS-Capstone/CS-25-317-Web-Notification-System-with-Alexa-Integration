'use client';
import React from 'react';
import SettingsContainer from './SettingsContainer';

const NotificationSettings = ({ notificationEnabled, setNotificationEnabled }) => {
  return (
    <SettingsContainer
      title="Notification Settings"
      description="Control how and when you receive notifications for your reminders."
    >
      
      <div className="flex items-center justify-between p-4 border rounded-lg bg-[var(--bg-primary)]">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-[var(--accent-color)] bg-opacity-20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--accent-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <label htmlFor="notification-toggle" className="block text-lg font-medium text-[var(--text-primary)]">
              Enable Notifications
            </label>
            <p className="text-sm text-[var(--text-secondary)]">
              {notificationEnabled 
                ? "Notifications are currently enabled" 
                : "Notifications are currently disabled"}
            </p>
          </div>
        </div>
        <div className="relative inline-block w-14 h-7 transition duration-200 ease-in-out rounded-full">
          <input 
            type="checkbox" 
            id="notification-toggle" 
            className="absolute w-7 h-7 opacity-0 cursor-pointer z-10" 
            checked={notificationEnabled}
            onChange={(e) => setNotificationEnabled(e.target.checked)}
          />
          <label 
            htmlFor="notification-toggle" 
            className={`block h-7 overflow-hidden rounded-full cursor-pointer border ${notificationEnabled ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'bg-gray-200 border-gray-300'}`}
          >
            <span 
              className={`block h-7 w-7 rounded-full transform transition-transform duration-200 ease-in-out bg-white shadow-md ${notificationEnabled ? 'translate-x-7' : 'translate-x-0'}`} 
            />
          </label>
        </div>
      </div>
    </SettingsContainer>
  );
};

export default NotificationSettings;
