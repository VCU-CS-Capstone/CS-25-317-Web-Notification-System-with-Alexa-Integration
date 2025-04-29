'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SettingsContainer from './SettingsContainer';
import { supabase } from '../../lib/supabaseClient';
import bcrypt from 'bcryptjs';

const DeleteAccountSettings = ({ username }) => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleInitiateDelete = () => {
    setError('');
    setShowConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
    setPassword('');
    setConfirmText('');
    setError('');
  };

  const handleDeleteAccount = async () => {
    setError('');
    
    // Validate inputs
    if (!password) {
      setError('Please enter your password');
      return;
    }
    
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }
    
    try {
      setIsDeleting(true);
      
      // 1. Verify password
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
      
      if (userError || !user) {
        throw new Error('User not found');
      }
      
      const passwordMatch = bcrypt.compareSync(password, user.password);
      if (!passwordMatch) {
        setError('Incorrect password');
        setIsDeleting(false);
        return;
      }
      
      // 2. Begin deletion process
      console.log('Starting account deletion process for user:', user.id);
      
      // 3. Delete all map entries related to user's events
      const { data: userEvents, error: eventsError } = await supabase
        .from('events')
        .select('id')
        .eq('userid', user.id);
      
      if (eventsError) {
        console.error('Error fetching user events:', eventsError);
        throw eventsError;
      }
      
      if (userEvents && userEvents.length > 0) {
        const eventIds = userEvents.map(event => event.id);
        
        // Delete map entries for these events
        const { error: mapDeleteError } = await supabase
          .from('map')
          .delete()
          .in('event_id', eventIds);
        
        if (mapDeleteError) {
          console.error('Error deleting map entries:', mapDeleteError);
          throw mapDeleteError;
        }
        
        console.log('Deleted map entries for user events');
      }
      
      // 4. Delete all user events
      const { error: deleteEventsError } = await supabase
        .from('events')
        .delete()
        .eq('userid', user.id);
      
      if (deleteEventsError) {
        console.error('Error deleting user events:', deleteEventsError);
        throw deleteEventsError;
      }
      
      console.log('Deleted all user events');
      
      // 5. Delete user settings
      const { error: settingsDeleteError } = await supabase
        .from('user_settings')
        .delete()
        .eq('user_id', user.id);
      
      if (settingsDeleteError) {
        console.error('Error deleting user settings:', settingsDeleteError);
        throw settingsDeleteError;
      }
      
      console.log('Deleted user settings');
      
      // 6. Delete user devices (if such a table exists)
      try {
        const { error: devicesDeleteError } = await supabase
          .from('user_devices')
          .delete()
          .eq('user_id', user.id);
        
        if (devicesDeleteError) {
          console.error('Error deleting user devices:', devicesDeleteError);
          // Don't throw here, as the table might not exist
        } else {
          console.log('Deleted user devices');
        }
      } catch (deviceError) {
        console.log('User devices table might not exist, continuing deletion process');
      }
      
      // 7. Finally, delete the user account
      const { error: userDeleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);
      
      if (userDeleteError) {
        console.error('Error deleting user account:', userDeleteError);
        throw userDeleteError;
      }
      
      console.log('User account deleted successfully');
      
      // 8. Clear local storage and redirect to login
      localStorage.removeItem('username');
      localStorage.removeItem('colorMode');
      localStorage.removeItem('fontSize');
      localStorage.removeItem('timezone');
      localStorage.removeItem('googleConnected');
      
      // Redirect to login page
      router.push('/');
      
    } catch (err) {
      console.error('Account deletion error:', err);
      setError(`Failed to delete account: ${err.message}`);
      setIsDeleting(false);
    }
  };

  return (
    <SettingsContainer
      title="Delete Account"
      description="Permanently delete your account and all associated data."
    >
      <div className="bg-[var(--bg-primary)] border border-red-300 rounded-lg p-6">
        {!showConfirmation ? (
          <div>
            <p className="text-[var(--text-primary)] mb-4">
              Deleting your account will permanently remove all your data, including:
            </p>
            <ul className="list-disc pl-5 mb-6 text-[var(--text-primary)]">
              <li>All your reminders and events</li>
              <li>Account information and preferences</li>
              <li>Connected device information</li>
              <li>All settings and customizations</li>
            </ul>
            <p className="text-red-500 font-semibold mb-6">
              This action cannot be undone.
            </p>
            <button
              onClick={handleInitiateDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete My Account
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-red-600 mb-4">Confirm Account Deletion</h3>
            
            <div className="mb-4">
              <label className="block text-[var(--text-primary)] mb-1">
                Enter your password:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                placeholder="Your current password"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-[var(--text-primary)] mb-1">
                Type DELETE to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full p-2 border rounded-md bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                placeholder="DELETE"
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
                {error}
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
              </button>
              
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </SettingsContainer>
  );
};

export default DeleteAccountSettings;
