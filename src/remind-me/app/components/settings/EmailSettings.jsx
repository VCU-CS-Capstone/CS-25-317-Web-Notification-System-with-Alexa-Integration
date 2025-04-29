'use client';
import React from 'react';
import SettingsContainer from './SettingsContainer';

const EmailSettings = ({ 
  currentEmail, 
  newEmail, 
  setNewEmail, 
  password, 
  setPassword, 
  isUpdatingEmail, 
  emailUpdateMessage, 
  updateEmail 
}) => {
  return (
    <SettingsContainer
      title="Email Settings"
      description="Update your email address for notifications and account recovery."
    >
      
      <form onSubmit={updateEmail} className="space-y-4">
        <div>
          <label htmlFor="currentEmail" className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
            Current Email
          </label>
          <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600 overflow-x-auto whitespace-nowrap">
            {currentEmail && currentEmail !== "" ? 
              currentEmail : 
              <span className="text-red-500 font-medium">No email set</span>
            }
          </div>
        </div>
        
        <div>
          <label htmlFor="newEmail" className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
            New Email
          </label>
          <input
            type="email"
            id="newEmail"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-[var(--bg-primary)] text-[var(--text-primary)]"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
            Confirm with Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-[var(--bg-primary)] text-[var(--text-primary)]"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUpdatingEmail}
            className="px-4 py-2 bg-[var(--accent-color)] text-[var(--text-on-accent)] rounded-md hover:bg-[var(--accent-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] disabled:opacity-50"
          >
            {isUpdatingEmail ? "Updating..." : "Update Email"}
          </button>
        </div>
        
        {emailUpdateMessage && (
          <div className={`mt-4 p-3 rounded-md ${
            emailUpdateMessage.includes("Error") || emailUpdateMessage.includes("Incorrect")
              ? "bg-red-100 text-red-700" 
              : "bg-green-100 text-green-700"
          }`}>
            {emailUpdateMessage}
          </div>
        )}
      </form>
    </SettingsContainer>
  );
};

export default EmailSettings;
