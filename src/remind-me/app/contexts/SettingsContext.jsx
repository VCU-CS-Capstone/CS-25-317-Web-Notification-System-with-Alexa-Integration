"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Create the context
const SettingsContext = createContext(null);

// Hook to use the settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Provider component
export function SettingsProvider({ children }) {
  // Settings states with default values to match server-side rendering
  const [fontSize, setFontSize] = useState('medium');
  const [timeFormat, setTimeFormat] = useState('12hour');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check if we're on client-side
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Load settings from localStorage and apply them immediately
  useEffect(() => {
    if (typeof window !== 'undefined' && isClient) {
      // Set userId first as other settings might depend on it
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
      }

      // Font size
      const storedFontSize = localStorage.getItem('fontSize');
      if (storedFontSize) {
        setFontSize(storedFontSize);
        document.documentElement.setAttribute('data-font-size', storedFontSize);
      }

      // Time format
      const storedTimeFormat = localStorage.getItem('timeFormat');
      if (storedTimeFormat) {
        setTimeFormat(storedTimeFormat);
        document.documentElement.setAttribute('data-time-format', storedTimeFormat);
      }

      // Color mode
      const storedColorMode = localStorage.getItem('colorMode');
      if (storedColorMode) {
        setIsDarkMode(storedColorMode === 'dark');
        setIsHighContrast(storedColorMode === 'high-contrast');
        document.documentElement.classList.remove('light', 'dark', 'high-contrast');
        document.documentElement.classList.add(storedColorMode);
      }

      setIsLoaded(true);
    }
  }, []);

  // Save font size to localStorage and apply it immediately
  const updateFontSize = (newSize) => {
    setFontSize(newSize);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fontSize', newSize);
      document.documentElement.setAttribute('data-font-size', newSize);
    
      // Also update in database if user is logged in
      if (userId) {
        updateUserSetting('font_size', newSize);
      }
      
      // Dispatch a custom event that other components can listen for
      window.dispatchEvent(new CustomEvent('fontSizeChanged', { detail: { fontSize: newSize } }));
    }
  };

  // Save time format to localStorage and apply it immediately
  const updateTimeFormat = (newFormat) => {
    setTimeFormat(newFormat);
    if (typeof window !== 'undefined') {
      localStorage.setItem('timeFormat', newFormat);
      document.documentElement.setAttribute('data-time-format', newFormat);
      
      // Also update in database if user is logged in
      if (userId) {
        updateUserSetting('time_format', newFormat);
      }
      
      // Dispatch a custom event
      window.dispatchEvent(new CustomEvent('timeFormatChanged', { detail: { timeFormat: newFormat } }));
    }
  };

  // Update color mode
  const updateColorMode = (mode) => {
    setIsDarkMode(mode === 'dark');
    setIsHighContrast(mode === 'high-contrast');
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('colorMode', mode);
      document.documentElement.classList.remove('light', 'dark', 'high-contrast');
      document.documentElement.classList.add(mode);
      
      // Also update in database if user is logged in
      if (userId) {
        updateUserSetting('color_mode', mode);
      }
      
      // Dispatch a custom event
      window.dispatchEvent(new CustomEvent('colorModeChanged', { detail: { colorMode: mode } }));
    }
  };

  // Helper function to update user settings in the database
  const updateUserSetting = async (setting, value) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({ 
          user_id: userId,
          [setting]: value,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id',
          returning: 'minimal'
        });
        
      if (error) {
        console.error(`Error updating ${setting}:`, error);
      }
    } catch (err) {
      console.error(`Failed to update ${setting} in database:`, err);
    }
  };

  // Value object with all settings and update functions
  const value = {
    fontSize,
    timeFormat,
    isDarkMode,
    isHighContrast,
    userId,
    isLoaded,
    isClient,
    updateFontSize,
    updateTimeFormat,
    updateColorMode,
    setUserId,
  };

  // Use a loading state to prevent hydration mismatch
  if (!isClient) {
    // Return a minimal UI while loading client-side settings
    return (
      <SettingsContext.Provider value={value}>
        {children}
      </SettingsContext.Provider>
    );
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export default SettingsContext;
