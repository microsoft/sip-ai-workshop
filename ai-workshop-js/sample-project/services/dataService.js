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
