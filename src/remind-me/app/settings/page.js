"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import bcrypt from "bcryptjs";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../contexts/SettingsContext";

// Import settings components
import TimezoneSettings from "../components/settings/TimezoneSettings";
import EmailSettings from "../components/settings/EmailSettings";
import GoogleConnect from "../components/settings/GoogleConnect";
import FontSizeSettings from "../components/settings/FontSizeSettings";
import AppearanceSettings from "../components/settings/AppearanceSettings";
import TimeFormatSettings from "../components/settings/TimeFormatSettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import DeleteAccountSettings from "../components/settings/DeleteAccountSettings";

export default function SettingsPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  
  // Use the global settings context to prevent resetting to defaults
  const { 
    fontSize, updateFontSize, 
    timeFormat, updateTimeFormat, 
    isDarkMode, isHighContrast, updateColorMode, 
    isClient 
  } = useSettings();
  
  // Convert the isDarkMode/isHighContrast values to the colorMode string
  const [colorMode, setColorMode] = useState(() => {
    if (isHighContrast) return "";
    if (isDarkMode) return "dark";
    return "light";
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [activeTab, setActiveTab] = useState("account");
  
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
        // Fetch all users to find by username (case-insensitive)
        const { data: allUsers, error: usersError } = await supabase
          .from("users")
          .select("id, email, google_connected, username");
          
        if (usersError) throw usersError;
        
        // Find user with case-insensitive match
        const userData = allUsers.find(u => 
          u.username && u.username.toLowerCase() === storedUsername.toLowerCase()
        );
        
        if (!userData) {
          console.error("User not found with username:", storedUsername);
          return;
        }
        
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
              updateFontSize(userSettings.font_size);
            }
            
            if (userSettings.time_type) {
              updateTimeFormat(userSettings.time_type);
            }
            
            if (userSettings.notification_enabled !== undefined && userSettings.notification_enabled !== null) {
              setNotificationEnabled(userSettings.notification_enabled);
            }
          } else {
            // If no settings found, use defaults or localStorage as fallback
            const storedTimezone = localStorage.getItem("timezone");
            const storedColorMode = localStorage.getItem("colorMode");
            const storedFontSize = localStorage.getItem("fontSize");
            
            if (storedTimezone) setTimezone(storedTimezone);
            if (storedColorMode !== null) setColorMode(storedColorMode);
            if (storedFontSize) updateFontSize(storedFontSize);
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

  // Update local colorMode state when global settings change
  useEffect(() => {
    if (!isClient) return;
    
    // Convert global state to local colorMode string
    let newColorMode = "light";
    if (isHighContrast) newColorMode = "";
    else if (isDarkMode) newColorMode = "dark";
    
    // Update local state if different
    if (newColorMode !== colorMode) {
      setColorMode(newColorMode);
    }
  }, [isClient, isDarkMode, isHighContrast, colorMode]);

  // These effects are no longer needed since the SettingsContext handles them
  // The global settings context takes care of updating the DOM and localStorage
  
  // Handler functions for settings changes
  const handleChangeFontSize = (size) => {
    console.log("Changing font size to:", size);
    updateFontSize(size);
  };
  
  const handleChangeColor = (value) => {
    console.log("Changing color mode to:", value);
    // Use the global settings context to update color mode
    if (value === "") {
      // High contrast mode
      updateColorMode("high-contrast");
    } else {
      // Light or dark mode
      updateColorMode(value);
    }
    setColorMode(value);
  };

  const handleChangeTimeFormat = (format) => {
    console.log("Changing time format to:", format);
    updateTimeFormat(format);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      // Get user ID from database using case-insensitive match
      const { data: allUsers, error: usersError } = await supabase
        .from("users")
        .select("id, username");
      
      if (usersError) throw usersError;
      
      // Find user with case-insensitive match
      const userData = allUsers.find(u => 
        u.username && u.username.toLowerCase() === username.toLowerCase()
      );
      
      if (!userData) {
        throw new Error("User not found with username: " + username);
      }
      
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
            notification_enabled: notificationEnabled
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
              font_size: validFontSize,
              time_type: timeFormat,
              notification_enabled: notificationEnabled
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
      // Verify password using case-insensitive match
      const { data: allUsers, error: usersError } = await supabase
        .from("users")
        .select("password, username");
      
      if (usersError) throw usersError;
      
      // Find user with case-insensitive match
      const userData = allUsers.find(u => 
        u.username && u.username.toLowerCase() === username.toLowerCase()
      );
      
      if (!userData) {
        throw new Error("User not found with username: " + username);
      }
      
      // Check if password is correct
      const isPasswordCorrect = await bcrypt.compare(password, userData.password);
      
      if (!isPasswordCorrect) {
        setEmailUpdateMessage("Incorrect password. Please try again.");
        return;
      }
      
      // We already have the user data from the password verification step
      // Just use it directly for the update
      
      // Update email in database
      const { error: updateError } = await supabase
        .from("users")
        .update({ email: newEmail })
        .eq("id", userData.id);
      
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
      // Get all users to find the target user first
      const { data: allUsers, error: userLookupError } = await supabase
        .from("users")
        .select("id, username");
      
      if (userLookupError) {
        console.error("Error looking up user:", userLookupError);
        throw userLookupError;
      }
      
      // Find user with case-insensitive match
      const userRecord = allUsers.find(u => 
        u.username && u.username.toLowerCase() === username.toLowerCase()
      );
      
      if (!userRecord) {
        console.error("User not found with username:", username);
        throw new Error("User not found");
      }
      
      // Update database to remove Google connection
      const { error } = await supabase
        .from("users")
        .update({ google_connected: false })
        .eq("id", userRecord.id);
      
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

  // Handle tab switching
  const switchTab = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[var(--bg-primary)]">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-[var(--text-primary)]">Settings</h1>
        
        <div className="mb-8">
          <div className="mb-6 border-b border-gray-200">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
              <li className="mr-2" role="presentation">
                <button 
                  className={`inline-block p-4 border-b-2 rounded-t-lg hover:text-[var(--accent-color)] ${activeTab === 'account' ? 'border-[var(--accent-color)] text-[var(--accent-color)]' : 'border-transparent'}`}
                  onClick={() => switchTab('account')}
                >
                  Account
                </button>
              </li>
              <li className="mr-2" role="presentation">
                <button 
                  className={`inline-block p-4 border-b-2 rounded-t-lg hover:text-[var(--accent-color)] ${activeTab === 'appearance' ? 'border-[var(--accent-color)] text-[var(--accent-color)]' : 'border-transparent'}`}
                  onClick={() => switchTab('appearance')}
                >
                  Appearance
                </button>
              </li>
              <li role="presentation">
                <button 
                  className={`inline-block p-4 border-b-2 rounded-t-lg hover:text-[var(--accent-color)] ${activeTab === 'preferences' ? 'border-[var(--accent-color)] text-[var(--accent-color)]' : 'border-transparent'}`}
                  onClick={() => switchTab('preferences')}
                >
                  Preferences
                </button>
              </li>
            </ul>
          </div>
          
          <div className="tab-content relative overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'account' && (
                <motion.div 
                  key="account"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <TimezoneSettings 
                    timezone={timezone}
                    setTimezone={setTimezone}
                    timezones={timezones}
                  />
                  
                  <EmailSettings 
                    currentEmail={currentEmail}
                    newEmail={newEmail}
                    setNewEmail={setNewEmail}
                    password={password}
                    setPassword={setPassword}
                    handleUpdateEmail={updateEmail}
                    emailUpdateMessage={emailUpdateMessage}
                    isUpdatingEmail={isUpdatingEmail}
                  />
                  
                  <GoogleConnect 
                    isGoogleConnected={isGoogleConnected}
                    setIsGoogleConnected={setIsGoogleConnected}
                  />
                  
                  <DeleteAccountSettings 
                    username={username}
                  />
                </motion.div>
              )}
              
              {activeTab === 'appearance' && (
                <motion.div 
                  key="appearance"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <AppearanceSettings 
                    colorMode={colorMode}
                    setColorMode={handleChangeColor}
                    colorModes={colorModes}
                  />
                  
                  <FontSizeSettings 
                    fontSize={fontSize}
                    setFontSize={handleChangeFontSize}
                    fontSizes={fontSizes}
                  />
                </motion.div>
              )}
              
              {activeTab === 'preferences' && (
                <motion.div 
                  key="preferences"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <TimeFormatSettings 
                    timeFormat={timeFormat}
                    setTimeFormat={handleChangeTimeFormat}
                  />
                  
                  <NotificationSettings 
                    notificationEnabled={notificationEnabled}
                    setNotificationEnabled={setNotificationEnabled}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="flex justify-end mb-6">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md hover:bg-[var(--accent-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
        
        {saveMessage && (
          <div className={`mt-4 p-3 rounded-md mb-6 ${saveMessage.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {saveMessage}
          </div>
        )}
      </div>
    </div>
  );
}
