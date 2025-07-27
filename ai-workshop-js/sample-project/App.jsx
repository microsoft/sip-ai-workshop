import React from 'react';
import { HomePage } from './pages/HomePage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { UserService } from './services/userService.js';

// This creates a circular dependency for testing
import './components/UserProfile.jsx';

export const App = () => {
  return (
    <div className="app">
      <HomePage />
      <ProfilePage />
    </div>
  );
};
