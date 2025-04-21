-- Add notification settings columns to user_settings table
ALTER TABLE user_settings 
ADD COLUMN notification_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN notification_sound VARCHAR(50) DEFAULT 'default',
ADD COLUMN notification_advance INTEGER DEFAULT 5;

-- Comment on columns
COMMENT ON COLUMN user_settings.notification_enabled IS 'Whether notifications are enabled for this user';
COMMENT ON COLUMN user_settings.notification_sound IS 'The notification sound preference (default, chime, bell, none)';
COMMENT ON COLUMN user_settings.notification_advance IS 'Default minutes before event to send notification';
