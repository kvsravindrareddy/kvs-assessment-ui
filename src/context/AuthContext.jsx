import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Comprehensive role definitions for educational institution management
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',           // Platform owner, all permissions
  DISTRICT_ADMIN: 'DISTRICT_ADMIN',     // Manages multiple schools
  SCHOOL_ADMIN: 'SCHOOL_ADMIN',         // School owner, manages single school
  TEACHER: 'TEACHER',                   // Classroom management
  PARENT: 'PARENT',                     // Monitor children
  STUDENT: 'STUDENT',                   // Primary learner
  COUNSELOR: 'COUNSELOR',               // Student guidance
  CONTENT_CREATOR: 'CONTENT_CREATOR',   // Create educational materials
  LIBRARIAN: 'LIBRARIAN',               // Manage resources
  OBSERVER: 'OBSERVER',                 // Read-only (researcher/auditor)
  SUPPORT_STAFF: 'SUPPORT_STAFF',       // Technical support
  AI_ASSISTANT: 'AI_ASSISTANT'          // Automated system user
};

// Role hierarchy - defines which roles can access which dashboards
const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: [ROLES.DISTRICT_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.PARENT, ROLES.STUDENT, ROLES.COUNSELOR, ROLES.CONTENT_CREATOR, ROLES.LIBRARIAN, ROLES.OBSERVER, ROLES.SUPPORT_STAFF],
  [ROLES.DISTRICT_ADMIN]: [ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.PARENT, ROLES.STUDENT],
  [ROLES.SCHOOL_ADMIN]: [ROLES.TEACHER, ROLES.PARENT, ROLES.STUDENT],
  [ROLES.TEACHER]: [ROLES.STUDENT],
  [ROLES.COUNSELOR]: [ROLES.STUDENT],
  [ROLES.CONTENT_CREATOR]: [ROLES.STUDENT],
  [ROLES.PARENT]: [ROLES.STUDENT], // Can view their children's dashboard
  [ROLES.STUDENT]: [],
  [ROLES.LIBRARIAN]: [],
  [ROLES.OBSERVER]: [],
  [ROLES.SUPPORT_STAFF]: [],
  [ROLES.AI_ASSISTANT]: []
};

// Authentication methods enum
export const AUTH_METHODS = {
  PASSWORD: 'PASSWORD',
  GOOGLE: 'GOOGLE',
  MICROSOFT: 'MICROSOFT',
  BIOMETRIC: 'BIOMETRIC',
  MAGIC_LINK: 'MAGIC_LINK'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState(null); // Current role being used
  const [authMethod, setAuthMethod] = useState(null);
  const [theme, setTheme] = useState('light'); // light, dark, high-contrast
  const [language, setLanguage] = useState('en'); // i18n support

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const storedActiveRole = localStorage.getItem('activeRole');
    const storedTheme = localStorage.getItem('theme') || 'light';
    const storedLanguage = localStorage.getItem('language') || 'en';

    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setActiveRole(storedActiveRole || userData.role);
      setTheme(storedTheme);
      setLanguage(storedLanguage);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  // Traditional username/password login
  const login = async (credentials, isAdmin = false) => {
    try {
      const endpoint = isAdmin ? '/auth/admin/login' : '/auth/login';
      console.log('Login attempt:', { endpoint, username: credentials.username, isAdmin });

      const response = await axios.post(`http://localhost:9000${endpoint}`, credentials);
      console.log('Login response:', response.status, response.data);

      if (response.data.token) {
        const userData = {
          id: response.data.id, // Add user ID
          username: response.data.username,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
          roles: response.data.roles || [response.data.role], // Support multiple roles
          status: response.data.status,
          permissions: response.data.permissions,
          linkedAccounts: response.data.linkedAccounts || [] // For parents linked to children
        };

        setUser(userData);
        setActiveRole(userData.role);
        setAuthMethod(AUTH_METHODS.PASSWORD);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('activeRole', userData.role);
        localStorage.setItem('authMethod', AUTH_METHODS.PASSWORD);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        return response.data;
      }
      throw new Error('No token in response');
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

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

  // Social login (Google, Microsoft)
  const loginWithSocial = async (provider, tokenResponse) => {
    try {
      const endpoint = `/auth/social/${provider.toLowerCase()}`;
      const response = await axios.post(`http://localhost:9000${endpoint}`, {
        token: tokenResponse.credential || tokenResponse.access_token,
        provider: provider
      });

      if (response.data.token) {
        const userData = {
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
          roles: response.data.roles || [response.data.role],
          status: response.data.status,
          permissions: response.data.permissions,
          linkedAccounts: response.data.linkedAccounts || [],
          profilePicture: response.data.profilePicture
        };

        setUser(userData);
        setActiveRole(userData.role);
        setAuthMethod(provider === 'GOOGLE' ? AUTH_METHODS.GOOGLE : AUTH_METHODS.MICROSOFT);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('activeRole', userData.role);
        localStorage.setItem('authMethod', provider);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        return response.data;
      }
      throw new Error('No token in response');
    } catch (error) {
      console.error('Social login error:', error);
      throw new Error(error.response?.data?.message || 'Social login failed');
    }
  };

  // WebAuthn/Biometric login
  const loginWithBiometric = async (credential) => {
    try {
      const response = await axios.post('http://localhost:9000/auth/webauthn/authenticate', {
        credential: credential
      });

      if (response.data.token) {
        const userData = {
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
          roles: response.data.roles || [response.data.role],
          status: response.data.status,
          permissions: response.data.permissions,
          linkedAccounts: response.data.linkedAccounts || []
        };

        setUser(userData);
        setActiveRole(userData.role);
        setAuthMethod(AUTH_METHODS.BIOMETRIC);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('activeRole', userData.role);
        localStorage.setItem('authMethod', AUTH_METHODS.BIOMETRIC);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        return response.data;
      }
      throw new Error('No token in response');
    } catch (error) {
      console.error('Biometric login error:', error);
      throw new Error('Biometric authentication failed');
    }
  };

  // Magic link verification
  const verifyMagicLink = async (token) => {
    try {
      const response = await axios.post('http://localhost:9000/auth/magic-link/verify', { token });

      if (response.data.token) {
        const userData = {
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
          roles: response.data.roles || [response.data.role],
          status: response.data.status,
          permissions: response.data.permissions,
          linkedAccounts: response.data.linkedAccounts || []
        };

        setUser(userData);
        setActiveRole(userData.role);
        setAuthMethod(AUTH_METHODS.MAGIC_LINK);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('activeRole', userData.role);
        localStorage.setItem('authMethod', AUTH_METHODS.MAGIC_LINK);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        return response.data;
      }
      throw new Error('Invalid magic link');
    } catch (error) {
      console.error('Magic link verification error:', error);
      throw new Error('Magic link verification failed');
    }
  };

  // Request magic link
  const requestMagicLink = async (email) => {
    try {
      await axios.post('http://localhost:9000/auth/magic-link/request', { email });
      return { success: true, message: 'Magic link sent to your email' };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send magic link');
    }
  };

  const signup = async (signupData) => {
    const response = await axios.post('http://localhost:9000/auth/signup', signupData);
    return response.data;
  };

  const logout = () => {
    setUser(null);
    setActiveRole(null);
    setAuthMethod(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('activeRole');
    localStorage.removeItem('authMethod');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Switch active role (for users with multiple roles or admin impersonation)
  const switchRole = (newRole) => {
    if (!user) return false;

    // Check if user can access this role
    if (canAccessRole(newRole)) {
      setActiveRole(newRole);
      localStorage.setItem('activeRole', newRole);
      return true;
    }
    return false;
  };

  // Check if current user can access a specific role's dashboard
  const canAccessRole = (targetRole) => {
    if (!user) return false;

    // User's primary role
    if (user.role === targetRole) return true;

    // Check if user has multiple roles
    if (user.roles && user.roles.includes(targetRole)) return true;

    // Check role hierarchy - can user impersonate this role?
    const accessibleRoles = ROLE_HIERARCHY[user.role] || [];
    return accessibleRoles.includes(targetRole);
  };

  // Get list of roles the current user can access
  const getAccessibleRoles = () => {
    if (!user) return [];

    const roles = new Set([user.role]);

    // Add additional roles if user has multiple
    if (user.roles) {
      user.roles.forEach(role => roles.add(role));
    }

    // Add roles from hierarchy
    const hierarchyRoles = ROLE_HIERARCHY[user.role] || [];
    hierarchyRoles.forEach(role => roles.add(role));

    return Array.from(roles);
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const isAdmin = () => {
    return user && (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.DISTRICT_ADMIN || user.role === ROLES.SCHOOL_ADMIN);
  };

  const hasRole = (requiredRole) => {
    if (!user) return false;

    // SUPER_ADMIN has access to everything
    if (user.role === ROLES.SUPER_ADMIN) return true;

    // Check if user has the specific role
    if (Array.isArray(requiredRole)) {
      return requiredRole.some(role => user.role === role || (user.roles && user.roles.includes(role)));
    }

    return user.role === requiredRole || (user.roles && user.roles.includes(requiredRole));
  };

  // Theme management
  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Language management
  const updateLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const value = {
    user,
    activeRole,
    authMethod,
    theme,
    language,
    login,
    loginWithSocial,
    loginWithBiometric,
    verifyMagicLink,
    requestMagicLink,
    signup,
    logout,
    switchRole,
    canAccessRole,
    getAccessibleRoles,
    isAuthenticated,
    isAdmin,
    hasRole,
    updateTheme,
    updateLanguage,
    loading,
    ROLES,
    AUTH_METHODS
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
