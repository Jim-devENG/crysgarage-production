import { AuthProvider } from 'react-admin';

const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    const response = await fetch('https://crysgarage.studio/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      return Promise.resolve();
    }
    return Promise.reject();
  },
  
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
  
  checkAuth: () => {
    return localStorage.getItem('token') ? Promise.resolve() : Promise.reject();
  },
  
  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      return Promise.reject();
    }
    return Promise.resolve();
  },
  
  getIdentity: () => {
    const token = localStorage.getItem('token');
    if (token) {
      return Promise.resolve({ id: 'admin', fullName: 'Admin User' });
    }
    return Promise.reject();
  },
  
  getPermissions: () => Promise.resolve('admin'),
};

