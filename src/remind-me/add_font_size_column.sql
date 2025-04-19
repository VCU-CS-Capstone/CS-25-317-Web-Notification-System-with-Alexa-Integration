-- SQL script to add font_size column to user_settings table
ALTER TABLE user_settings 
ADD COLUMN font_size VARCHAR(10) DEFAULT 'medium';

-- Update existing rows to have the default 'medium' value
UPDATE user_settings 
SET font_size = 'medium' 
WHERE font_size IS NULL;
