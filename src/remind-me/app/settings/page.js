"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import bcrypt from "bcryptjs";

export default function SettingsPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [timeFormat, setTimeFormat] = useState("12hour"); // Default to 12-hour time format
  const [colorMode, setColorMode] = useState(""); // Default is empty, will be set to root (high contrast) in useEffect
  const [fontSize, setFontSize] = useState("medium"); // Default font size
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  
  // Notification settings
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  
  // Email settings
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailUpdateMessage, setEmailUpdateMessage] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  
  // Google connection status
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  // List of common timezones
  const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "America/Anchorage", label: "Alaska Time (AKT)" },
    { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
    { value: "America/Phoenix", label: "Arizona (MST)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Paris (CET)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
    { value: "Australia/Sydney", label: "Sydney (AEST)" },
  ];

  // Color mode options
  const colorModes = [
    { value: "", label: "High Contrast (Default)", description: "Original color scheme with green accent" },
    { value: "light", label: "Purple & Cream", description: "Velvet purple with creamy white background" },
    { value: "dark", label: "Dark Mode", description: "Black background with cream text" },
  ];

  // Font size options
  const fontSizes = [
    { value: "small", label: "Small", description: "Smaller text for more content on screen" },
    { value: "medium", label: "Medium (Default)", description: "Standard text size" },
    { value: "large", label: "Large", description: "Larger text for better readability" }
  ];

  useEffect(() => {
    // Get username from localStorage
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      router.push("/");
      return;
    }
    setUsername(storedUsername);
    
    // Get color mode from localStorage first to prevent flicker
    const storedColorMode = localStorage.getItem("colorMode");
    if (storedColorMode !== null) {
      setColorMode(storedColorMode);
    }

    // Load user settings from database
    const loadSettings = async () => {
      try {
        // Fetch user data from database
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, email, google_connected")
          .eq("username", storedUsername)
          .single();
          
        if (userError) throw userError;
        
        if (userData) {
          // Set email with fallback for null/undefined values
          console.log("User data from database:", userData);
          console.log("Email from database:", userData.email);
          console.log("Email type:", typeof userData.email);
          // Force convert to string and trim
          const emailValue = userData.email ? String(userData.email).trim() : "";
          console.log("Processed email value:", emailValue);
          setCurrentEmail(emailValue);
          if (userData.google_connected) {
            setIsGoogleConnected(true);
            localStorage.setItem("googleConnected", "true");
          }
          
          // Fetch user settings from the new user_settings table
          console.log("Fetching settings for user ID:", userData.id);
          const { data: settingsData, error: settingsError } = await supabase
            .from("user_settings")
            .select("*")
            .eq("user_id", userData.id);
          
          console.log("Settings data array:", settingsData);
          
          // Check if we have any settings records
          if (settingsData && settingsData.length > 0) {
            const userSettings = settingsData[0];
            console.log("Found user settings:", userSettings);
            // Set timezone from database (now stored as text)
            if (userSettings.timezone) {
              setTimezone(userSettings.timezone);
            }
            
            // Set color mode from database only if different from localStorage
            const storedColorMode = localStorage.getItem("colorMode");
            if (userSettings.color !== null && userSettings.color !== undefined) {
              // Make sure we're setting a valid color mode value
              const validColorModes = ["", "light", "dark"];
              if (validColorModes.includes(userSettings.color)) {
                // Only update if different from current localStorage value
                if (userSettings.color !== storedColorMode) {
                  console.log("Setting color mode from database:", userSettings.color);
                  setColorMode(userSettings.color);
                }
              } else {
                console.warn("Invalid color mode from database:", userSettings.color);
                // Don't change the color mode if invalid
              }
            }
            
            // Set font size from database
            if (userSettings.font_size) {
              setFontSize(userSettings.font_size);
            }
            
            if (userSettings.time_type) {
              setTimeFormat(userSettings.time_type);
            }
            
            if (userSettings.notifications_enabled !== undefined && userSettings.notifications_enabled !== null) {
              setNotificationEnabled(userSettings.notifications_enabled);
            }
          } else {
            // If no settings found, use defaults or localStorage as fallback
            const storedTimezone = localStorage.getItem("timezone");
            const storedColorMode = localStorage.getItem("colorMode");
            const storedFontSize = localStorage.getItem("fontSize");
            
            if (storedTimezone) setTimezone(storedTimezone);
            if (storedColorMode !== null) setColorMode(storedColorMode);
            if (storedFontSize) setFontSize(storedFontSize);
          }
          
          const googleConnected = localStorage.getItem("googleConnected");
          if (googleConnected === "true") setIsGoogleConnected(true);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, [router]);

  // Apply color mode to the document
  useEffect(() => {
    // Skip if colorMode is null or undefined (initial state)
    if (colorMode === null || colorMode === undefined) {
      return;
    }
    
    // Ensure we have a valid color mode value
    const validColorModes = ["", "light", "dark"];
    const validColorMode = validColorModes.includes(colorMode) ? colorMode : "";
    
    // Remove all possible classes first
    document.documentElement.classList.remove("light", "dark");
    
    // Add the new class if it's not the default (empty string)
    if (validColorMode) {
      document.documentElement.classList.add(validColorMode);
    }
    
    console.log("Applied color mode to document:", validColorMode || "default");
    
    // Save to localStorage
    localStorage.setItem("colorMode", validColorMode);
  }, [colorMode]);
  
  // Apply font size to the document
  useEffect(() => {
    if (!fontSize) return;
    
    // Remove all possible font size classes first
    document.documentElement.classList.remove("text-small", "text-medium", "text-large");
    
    // Add the new font size class
    document.documentElement.classList.add(`text-${fontSize}`);
    
    // Save to localStorage
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);
  
  // Save time format to localStorage when it changes
  useEffect(() => {
    if (!timeFormat) return;
    
    // Save to localStorage
    localStorage.setItem("timeFormat", timeFormat);
  }, [timeFormat]);

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      // Get user ID from database
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();
      
      if (userError) throw userError;
      
      // Check if user settings already exist
      const { data: existingSettingsArray, error: checkError } = await supabase
        .from("user_settings")
        .select("id")
        .eq("user_id", userData.id);
      
      const existingSettings = existingSettingsArray && existingSettingsArray.length > 0 ? existingSettingsArray[0] : null;
      console.log("Existing settings check:", existingSettings, checkError);
      
      let upsertError;
      
      // Ensure we have a valid color mode value
      const validColorModes = ["", "light", "dark"];
      // If colorMode is null or undefined, use empty string (default)
      const validColorMode = colorMode !== null && colorMode !== undefined && validColorModes.includes(colorMode) ? colorMode : "";
      
      // Ensure we have a valid font size value
      const validFontSizes = ["small", "medium", "large"];
      const validFontSize = fontSize !== null && fontSize !== undefined && validFontSizes.includes(fontSize) ? fontSize : "medium";
      
      console.log("Saving color mode to database:", validColorMode || "default");
      console.log("Saving font size to database:", validFontSize);
      
      if (existingSettings) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from("user_settings")
          .update({
            timezone: timezone,
            color: validColorMode,
            font_size: validFontSize,
            time_type: timeFormat,
            notifications_enabled: notificationEnabled
          })
          .eq("user_id", userData.id);
        
        upsertError = updateError;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from("user_settings")
          .insert([
            {
              user_id: userData.id,
              timezone: timezone,
              color: validColorMode,
              font_size: validFontSize
            }
          ]);
        
        upsertError = error;
      }
      
      if (upsertError) throw upsertError;
      
      // Also save to localStorage as fallback
      localStorage.setItem("timezone", timezone);
      localStorage.setItem("colorMode", colorMode);
      localStorage.setItem("fontSize", fontSize);
      
      setSaveMessage("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveMessage("Error saving settings. Please try again.");
    } finally {
      setIsSaving(false);
      
      // Clear success message after 3 seconds
      if (saveMessage === "Settings saved successfully!") {
        setTimeout(() => {
          setSaveMessage("");
        }, 3000);
      }
    }
  };

  const updateEmail = async (e) => {
    e.preventDefault();
    setIsUpdatingEmail(true);
    setEmailUpdateMessage("");
    
    try {
      // Verify password
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("password")
        .eq("username", username)
        .single();
      
      if (userError) throw userError;
      
      // Check if password is correct
      const isPasswordCorrect = await bcrypt.compare(password, userData.password);
      
      if (!isPasswordCorrect) {
        setEmailUpdateMessage("Incorrect password. Please try again.");
        return;
      }
      
      // Update email in database
      const { error: updateError } = await supabase
        .from("users")
        .update({ email: newEmail })
        .eq("username", username);
      
      if (updateError) {
        throw updateError;
      }
      
      setCurrentEmail(newEmail);
      setNewEmail("");
      setPassword("");
      setEmailUpdateMessage("Email updated successfully!");
    } catch (error) {
      console.error("Error updating email:", error);
      setEmailUpdateMessage("Error updating email. Please try again.");
    } finally {
      setIsUpdatingEmail(false);
      
      // Clear success message after 3 seconds
      if (emailUpdateMessage === "Email updated successfully!") {
        setTimeout(() => {
          setEmailUpdateMessage("");
        }, 3000);
      }
    }
  };

  // Handle Google connection
  const handleGoogleConnect = () => {
    if (isGoogleConnected) {
      // Disconnect Google account
      disconnectGoogle();
    } else {
      // Connect Google account
      connectGoogle();
    }
  };

  const connectGoogle = () => {
    // Store current URL to return after authentication
    localStorage.setItem("returnUrl", window.location.href);
    // Redirect to Google auth page
    window.location.href = "/google";
  };

  const disconnectGoogle = async () => {
    try {
      // Update database to remove Google connection
      const { error } = await supabase
        .from("users")
        .update({ google_connected: false })
        .eq("username", username);
      
      if (error) throw error;
      
      // Update local state
      setIsGoogleConnected(false);
      localStorage.removeItem("googleConnected");
      
      // Show success message
      setSaveMessage("Google account disconnected successfully!");
      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error disconnecting Google account:", error);
      setSaveMessage("Error disconnecting Google account. Please try again.");
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[var(--bg-primary)]">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-[var(--text-primary)]">Settings</h1>
        
        <div className="bg-[var(--bg-secondary)] shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">Time Zone</h2>
          <p className="mb-4 text-[var(--text-secondary)]">
            Select your preferred time zone for reminders and notifications.
          </p>
          
          <div className="mb-6">
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
        </div>
        
        <div className="bg-[var(--bg-secondary)] shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">Email Settings</h2>
          <p className="mb-4 text-[var(--text-secondary)]">
            Update your email address for notifications and account recovery.
          </p>
          
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
        </div>
        
        {/* Google Connect Box */}
        {/* Font Size Settings */}
        <div className="bg-[var(--bg-secondary)] shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
            Font Size
          </h2>
          <p className="mb-4 text-[var(--text-secondary)]">
            Choose your preferred font size for better readability.
          </p>
          
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
        </div>

        <div className="bg-[var(--bg-secondary)] shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
            Connect with Google
          </h2>
          <p className="mb-4 text-[var(--text-secondary)]">
            Connect your Google Calendar to sync your reminders and events.
          </p>
          
          <div className="flex items-center justify-between p-4 border rounded-lg bg-[var(--bg-primary)]">
            <div className="flex items-center">
              <div className="w-10 h-10 mr-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-[var(--text-primary)]">Google Calendar</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {isGoogleConnected 
                    ? "Your Google account is connected" 
                    : "Connect to sync your events with Google Calendar"}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleGoogleConnect}
              className={`px-4 py-2 rounded-md transition-colors ${
                isGoogleConnected
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-[#4285F4] hover:bg-[#3367D6] text-white"
              }`}
            >
              {isGoogleConnected ? "Disconnect" : "Connect"}
            </button>
          </div>
        </div>
        
        <div className="bg-[var(--bg-secondary)] shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">Appearance</h2>
          <p className="mb-4 text-[var(--text-secondary)]">
            Choose your preferred color mode for the application.
          </p>
          
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
        </div>

        {/* Time Format Settings */}
        <div className="mb-8">
          <h3 className="text-xl font-medium mb-3 text-[var(--text-primary)]">
            Time Format
          </h3>
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
        </div>

        {/* Notification Settings */}
        <div className="mb-8">
          <h3 className="text-xl font-medium mb-3 text-[var(--text-primary)]">
            Notification Settings
          </h3>
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
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="px-4 py-2 bg-[var(--accent-color)] text-[var(--text-on-accent)] rounded-md hover:bg-[var(--accent-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
        
        {saveMessage && (
          <div className={`mt-4 p-3 rounded-md ${
            saveMessage.includes("Error") 
              ? "bg-red-100 text-red-700" 
              : "bg-green-100 text-green-700"
          }`}>
            {saveMessage}
          </div>
        )}
      </div>
    </div>
  );
}
