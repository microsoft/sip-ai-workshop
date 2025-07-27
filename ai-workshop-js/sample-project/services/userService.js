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
