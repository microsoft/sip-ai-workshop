import React from 'react';
import { useUser } from '../hooks/useUser.js';
import { Button } from './Button.jsx';
import { formatDate } from '../utils/helpers.js';

export const UserProfile = ({ userId }) => {
  const { user, loading, error } = useUser(userId);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>User not found</div>;
  
  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Joined: {formatDate(user.createdAt)}</p>
      <Button onClick={() => console.log('Edit profile')}>
        Edit Profile
      </Button>
    </div>
  );
};

// This import creates a circular dependency for testing
import { App } from '../App.jsx';
