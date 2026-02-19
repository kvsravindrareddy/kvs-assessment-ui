import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (credentials, isAdmin = false) => {
    try {
      const endpoint = isAdmin ? '/auth/admin/login' : '/auth/login';
      console.log('Login attempt:', { endpoint, username: credentials.username, isAdmin });

      const response = await axios.post(`http://localhost:9000${endpoint}`, credentials);
      console.log('Login response:', response.status, response.data);

      if (response.data.token) {
        const userData = {
          username: response.data.username,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
          status: response.data.status,
          permissions: response.data.permissions
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        return response.data;
      }
      throw new Error('No token in response');
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      // Re-throw with better error message
      if (error.response?.status === 401) {
        throw new Error(error.response.data?.message || 'Invalid credentials');
      } else if (error.response?.status === 403) {
        throw new Error('Access forbidden. Please check your credentials.');
      } else if (error.message.includes('Network Error')) {
        throw new Error('Cannot connect to server. Please check if services are running.');
      } else {
        throw error;
      }
    }
  };

  const signup = async (signupData) => {
    const response = await axios.post('http://localhost:9000/auth/signup', signupData);
    return response.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const isAdmin = () => {
    return user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');
  };

  const hasRole = (requiredRole) => {
    if (!user) return false;

    // SUPER_ADMIN has access to everything
    if (user.role === 'SUPER_ADMIN') return true;

    // Check if user has the specific role
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }

    return user.role === requiredRole;
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated,
    isAdmin,
    hasRole,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
