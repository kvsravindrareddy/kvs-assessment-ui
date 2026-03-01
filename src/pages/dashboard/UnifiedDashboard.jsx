import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SuperAdminDashboard from './roles/SuperAdminDashboard';
import TeacherDashboard from './roles/TeacherDashboard';
import ParentDashboard from './roles/ParentDashboard';
import StudentDashboard from './roles/StudentDashboard';
import CounselorDashboard from './roles/CounselorDashboard';
import ContentCreatorDashboard from './roles/ContentCreatorDashboard';
import './UnifiedDashboard.css';

const UnifiedDashboard = ({ children }) => {
  const { user, activeRole, switchRole, getAccessibleRoles, ROLES } = useAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const accessibleRoles = getAccessibleRoles();
  const navigate = useNavigate();
  const location = useLocation();

  const isProfileView = location.pathname === '/profile';

  const dashboardComponents = {
    [ROLES.SUPER_ADMIN]: SuperAdminDashboard,
    [ROLES.DISTRICT_ADMIN]: SuperAdminDashboard,
    [ROLES.SCHOOL_ADMIN]: SuperAdminDashboard,
    [ROLES.TEACHER]: TeacherDashboard,
    [ROLES.PARENT]: ParentDashboard,
    [ROLES.STUDENT]: StudentDashboard,
    [ROLES.COUNSELOR]: CounselorDashboard,
    [ROLES.CONTENT_CREATOR]: ContentCreatorDashboard,
    [ROLES.LIBRARIAN]: StudentDashboard,
    [ROLES.OBSERVER]: StudentDashboard,
    [ROLES.SUPPORT_STAFF]: StudentDashboard,
    [ROLES.AI_ASSISTANT]: StudentDashboard
  };

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
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1 className="dashboard-title">
            <span className="dashboard-icon">{isProfileView ? '👤' : '📊'}</span>
            {isProfileView ? 'My Profile' : 'Dashboard'}
          </h1>
          <p className="dashboard-subtitle">
            {isProfileView ? 'Manage your account settings and security' : `Welcome back, ${user.firstName}!`}
          </p>
        </div>

        <div className="dashboard-header-right">
          
          {/* UPDATED: Changed to Home and fixed UI alignment */}
          {isProfileView ? (
            <button className="profile-action-button" onClick={() => navigate('/')} title="Back to Home">
              <span className="profile-icon">🏠</span>
              <span className="profile-text">Home</span>
            </button>
          ) : (
            <button className="profile-action-button" onClick={() => navigate('/profile')} title="View Profile & Settings">
              <span className="profile-icon">👤</span>
              <span className="profile-text">My Profile</span>
            </button>
          )}

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
                  <div className="role-switcher-backdrop" onClick={() => setShowRoleSwitcher(false)} />
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
                            {activeRole === role && <span className="role-option-badge">Current</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {accessibleRoles.length === 1 && (
            <div className="current-role-badge">
              <span className="role-icon">{roleIcons[activeRole]}</span>
              <span className="role-name">{roleNames[activeRole]}</span>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        {children ? children : <DashboardComponent />}
      </div>
    </div>
  );
};

export default UnifiedDashboard;