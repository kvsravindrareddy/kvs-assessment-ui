import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protected Route Component
 * Ensures users are authenticated. Optionally checks for specific roles.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, hasRole } = useAuth();

  // 1. Check if user is authenticated (Applies to ALL protected routes)
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check if user has required role (Applies ONLY if requiredRole is passed)
  if (requiredRole && !hasRole(requiredRole)) {
    // Format the role for display (handles both single strings and arrays of roles)
    const requiredRoleDisplay = Array.isArray(requiredRole) 
        ? requiredRole.join(' or ') 
        : requiredRole;

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Required role: {requiredRoleDisplay}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;