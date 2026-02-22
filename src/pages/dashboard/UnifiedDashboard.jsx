import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import SuperAdminDashboard from './roles/SuperAdminDashboard';
import TeacherDashboard from './roles/TeacherDashboard';
import ParentDashboard from './roles/ParentDashboard';
import StudentDashboard from './roles/StudentDashboard';
import CounselorDashboard from './roles/CounselorDashboard';
import ContentCreatorDashboard from './roles/ContentCreatorDashboard';
import './UnifiedDashboard.css';

const UnifiedDashboard = () => {
  const { user, activeRole, switchRole, getAccessibleRoles, ROLES } = useAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const accessibleRoles = getAccessibleRoles();

  // Role-specific dashboard components
  const dashboardComponents = {
    [ROLES.SUPER_ADMIN]: SuperAdminDashboard,
    [ROLES.DISTRICT_ADMIN]: SuperAdminDashboard, // Share same admin dashboard
    [ROLES.SCHOOL_ADMIN]: SuperAdminDashboard,
    [ROLES.TEACHER]: TeacherDashboard,
    [ROLES.PARENT]: ParentDashboard,
    [ROLES.STUDENT]: StudentDashboard,
    [ROLES.COUNSELOR]: CounselorDashboard,
    [ROLES.CONTENT_CREATOR]: ContentCreatorDashboard,
    [ROLES.LIBRARIAN]: StudentDashboard, // Basic dashboard
    [ROLES.OBSERVER]: StudentDashboard,
    [ROLES.SUPPORT_STAFF]: StudentDashboard,
    [ROLES.AI_ASSISTANT]: StudentDashboard
  };

  // Role display names
  const roleNames = {
    [ROLES.SUPER_ADMIN]: 'Super Administrator',
    [ROLES.DISTRICT_ADMIN]: 'District Administrator',
    [ROLES.SCHOOL_ADMIN]: 'School Administrator',
    [ROLES.TEACHER]: 'Teacher',
    [ROLES.PARENT]: 'Parent',
    [ROLES.STUDENT]: 'Student',
    [ROLES.COUNSELOR]: 'Counselor',
    [ROLES.CONTENT_CREATOR]: 'Content Creator',
    [ROLES.LIBRARIAN]: 'Librarian',
    [ROLES.OBSERVER]: 'Observer',
    [ROLES.SUPPORT_STAFF]: 'Support Staff',
    [ROLES.AI_ASSISTANT]: 'AI Assistant'
  };

  // Role icons
  const roleIcons = {
    [ROLES.SUPER_ADMIN]: '👑',
    [ROLES.DISTRICT_ADMIN]: '🏛️',
    [ROLES.SCHOOL_ADMIN]: '🏫',
    [ROLES.TEACHER]: '👨‍🏫',
    [ROLES.PARENT]: '👪',
    [ROLES.STUDENT]: '🎓',
    [ROLES.COUNSELOR]: '🤝',
    [ROLES.CONTENT_CREATOR]: '✍️',
    [ROLES.LIBRARIAN]: '📚',
    [ROLES.OBSERVER]: '👀',
    [ROLES.SUPPORT_STAFF]: '🛠️',
    [ROLES.AI_ASSISTANT]: '🤖'
  };

  const handleRoleSwitch = (newRole) => {
    if (switchRole(newRole)) {
      setShowRoleSwitcher(false);
    }
  };

  // Get the appropriate dashboard component for current role
  const DashboardComponent = dashboardComponents[activeRole] || StudentDashboard;

  if (!user) {
    return (
      <div className="unified-dashboard-container">
        <div className="dashboard-error">
          <h2>⚠️ Not Authenticated</h2>
          <p>Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="unified-dashboard-container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1 className="dashboard-title">
            <span className="dashboard-icon">📊</span>
            Dashboard
          </h1>
          <p className="dashboard-subtitle">Welcome back, {user.firstName}!</p>
        </div>

        <div className="dashboard-header-right">
          {/* Role Switcher (if user has multiple accessible roles) */}
          {accessibleRoles.length > 1 && (
            <div className="role-switcher-container">
              <button
                className="current-role-button"
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              >
                <span className="role-icon">{roleIcons[activeRole]}</span>
                <span className="role-name">{roleNames[activeRole]}</span>
                <span className="dropdown-arrow">{showRoleSwitcher ? '▲' : '▼'}</span>
              </button>

              {showRoleSwitcher && (
                <>
                  <div
                    className="role-switcher-backdrop"
                    onClick={() => setShowRoleSwitcher(false)}
                  />
                  <div className="role-switcher-dropdown">
                    <div className="role-switcher-header">
                      <span>Switch View</span>
                      <small>{accessibleRoles.length} roles available</small>
                    </div>
                    <div className="role-switcher-options">
                      {accessibleRoles.map((role) => (
                        <button
                          key={role}
                          className={`role-option ${activeRole === role ? 'active' : ''}`}
                          onClick={() => handleRoleSwitch(role)}
                          disabled={activeRole === role}
                        >
                          <span className="role-option-icon">{roleIcons[role]}</span>
                          <div className="role-option-info">
                            <span className="role-option-name">{roleNames[role]}</span>
                            {activeRole === role && (
                              <span className="role-option-badge">Current</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Current Role Badge (for single role users) */}
          {accessibleRoles.length === 1 && (
            <div className="current-role-badge">
              <span className="role-icon">{roleIcons[activeRole]}</span>
              <span className="role-name">{roleNames[activeRole]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Role-Specific Dashboard Content */}
      <div className="dashboard-content">
        <DashboardComponent />
      </div>
    </div>
  );
};

export default UnifiedDashboard;
