import React from 'react';
import { UserProfile } from '../components/UserProfile.jsx';
import { Button } from '../components/Button.jsx';
import { userService } from '../services/userService.js';

export const ProfilePage = () => {
  const handleSave = async () => {
    try {
      await userService.createUser({
        name: 'New User',
        email: 'user@example.com'
      });
      console.log('User saved');
    } catch (error) {
      console.error('Save failed:', error);
    }
  };
  
  return (
    <div className="profile-page">
      <UserProfile userId="123" />
      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  );
};
