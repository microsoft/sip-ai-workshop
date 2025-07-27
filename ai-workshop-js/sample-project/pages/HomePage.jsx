import React from 'react';
import { UserProfile } from '../components/UserProfile.jsx';
import { SearchInput } from '../components/SearchInput.jsx';
import { ROUTES } from '../constants/routes.js';

export const HomePage = () => {
  const handleSearch = (query) => {
    console.log('Searching for:', query);
  };
  
  return (
    <div className="home-page">
      <h1>Welcome Home</h1>
      <SearchInput onSearch={handleSearch} />
      <UserProfile userId="123" />
      <nav>
        <a href={ROUTES.PROFILE}>Profile</a>
        <a href={ROUTES.SETTINGS}>Settings</a>
      </nav>
    </div>
  );
};
