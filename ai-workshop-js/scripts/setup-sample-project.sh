#!/bin/bash

# Sample Project Setup Script
# Creates a realistic JavaScript project structure for testing the dependency visualizer

echo "Setting up sample project for dependency visualization..."

# Create sample project directory
mkdir -p sample-project/{components,utils,services,hooks,pages,constants}

# Create package.json for the sample project
cat > sample-project/package.json << 'EOF'
{
  "name": "sample-react-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "lodash": "^4.17.21"
  }
}
EOF

# Create constants
cat > sample-project/constants/config.js << 'EOF'
export const API_BASE_URL = 'https://api.example.com';
export const APP_VERSION = '1.0.0';
export const TIMEOUT = 5000;
EOF

cat > sample-project/constants/routes.js << 'EOF'
export const ROUTES = {
  HOME: '/',
  PROFILE: '/profile',
  SETTINGS: '/settings'
};
EOF

# Create utility functions
cat > sample-project/utils/helpers.js << 'EOF'
import { format } from 'date-fns';

export const formatDate = (date) => {
  return format(date, 'yyyy-MM-dd');
};

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
EOF

cat > sample-project/utils/validation.js << 'EOF'
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};
EOF

cat > sample-project/utils/api.js << 'EOF'
import { API_BASE_URL, TIMEOUT } from '../constants/config.js';

export const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
  
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};
EOF

# Create services
cat > sample-project/services/userService.js << 'EOF'
import { fetchWithTimeout } from '../utils/api.js';
import { validateEmail } from '../utils/validation.js';

export class UserService {
  async getUser(id) {
    if (!id) throw new Error('User ID is required');
    
    const response = await fetchWithTimeout(`/users/${id}`);
    return response.json();
  }
  
  async createUser(userData) {
    if (!validateEmail(userData.email)) {
      throw new Error('Invalid email');
    }
    
    const response = await fetchWithTimeout('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    return response.json();
  }
}

export const userService = new UserService();
EOF

cat > sample-project/services/dataService.js << 'EOF'
import { fetchWithTimeout } from '../utils/api.js';
import { userService } from './userService.js';

export const fetchUserData = async (userId) => {
  const user = await userService.getUser(userId);
  const response = await fetchWithTimeout(`/data/${userId}`);
  const data = await response.json();
  
  return { user, data };
};

export const saveUserPreferences = async (userId, preferences) => {
  return fetchWithTimeout(`/users/${userId}/preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences)
  });
};
EOF

# Create hooks
cat > sample-project/hooks/useUser.js << 'EOF'
import { useState, useEffect } from 'react';
import { userService } from '../services/userService.js';

export const useUser = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!userId) return;
    
    userService.getUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);
  
  return { user, loading, error };
};
EOF

cat > sample-project/hooks/useDebounce.js << 'EOF'
import { useState, useEffect } from 'react';
import { debounce } from '../utils/helpers.js';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedValue(value);
    }, delay);
    
    handler();
    
    return () => {
      // Cleanup handled by debounce function
    };
  }, [value, delay]);
  
  return debouncedValue;
};
EOF

# Create components
cat > sample-project/components/Button.jsx << 'EOF'
import React from 'react';

export const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  ...props 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      {...props}
    >
      {children}
    </button>
  );
};
EOF

cat > sample-project/components/UserProfile.jsx << 'EOF'
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
EOF

cat > sample-project/components/SearchInput.jsx << 'EOF'
import React, { useState } from 'react';
import { useDebounce } from '../hooks/useDebounce.js';
import { validateEmail } from '../utils/validation.js';

export const SearchInput = ({ onSearch, placeholder = "Search..." }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  React.useEffect(() => {
    if (debouncedQuery) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);
  
  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={placeholder}
      className="search-input"
    />
  );
};
EOF

# Create pages
cat > sample-project/pages/HomePage.jsx << 'EOF'
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
EOF

cat > sample-project/pages/ProfilePage.jsx << 'EOF'
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
EOF

# Create a main app file
cat > sample-project/App.jsx << 'EOF'
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
EOF

# Create index file
cat > sample-project/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App.jsx';
import { userService } from './services/userService.js';

// Initialize app
userService.getUser('default').then(() => {
  ReactDOM.render(<App />, document.getElementById('root'));
});
EOF

# Add circular dependency to UserProfile (for testing circular dependency detection)
cat >> sample-project/components/UserProfile.jsx << 'EOF'

// This import creates a circular dependency for testing
import { App } from '../App.jsx';
EOF

echo "✅ Sample project created successfully!"
echo "📁 Files created in: sample-project/"
echo "🔍 Run the visualizer on this directory to see complex dependencies"
echo ""
echo "Example usage:"
echo "  1. Start the dependency visualizer: npm start"
echo "  2. Enter path: ./sample-project"
echo "  3. Click 'Analyze Dependencies'"
echo ""
echo "Features to test:"
echo "  - Multiple directories (components, services, utils, etc.)"
echo "  - Various import patterns (named, default, destructured)"
echo "  - Circular dependencies (UserProfile ↔ App)"
echo "  - File types (.js, .jsx)"
echo "  - Complex dependency chains"