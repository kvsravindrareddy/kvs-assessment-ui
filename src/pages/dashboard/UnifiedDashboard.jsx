import React, { useState, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './UnifiedDashboard.css';

const SuperAdminDashboard = lazy(() => import('./roles/SuperAdminDashboard'));
const TeacherDashboard = lazy(() => import('./roles/TeacherDashboard'));
const ParentDashboard = lazy(() => import('./roles/ParentDashboard'));
const StudentDashboard = lazy(() => import('./roles/StudentDashboard'));
const CounselorDashboard = lazy(() => import('./roles/CounselorDashboard'));
const ContentCreatorDashboard = lazy(() => import('./roles/ContentCreatorDashboard'));

const UnifiedDashboard = ({ children }) => {
  const { user, activeRole, switchRole, getAccessibleRoles, ROLES, loading } = useAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  
  const accessibleRoles = user && getAccessibleRoles ? getAccessibleRoles() : [];
  
  const navigate = useNavigate();
  const location = useLocation();

  const isProfileView = location.pathname === '/profile';

  if (loading) {
    return (
      <div className="unified-dashboard-container">
        <div className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', padding: '3rem', alignItems: 'center' }}>
          <div className="spinner"></div>
          <p style={{ marginLeft: '1rem', color: '#666' }}>Loading workspace...</p>
        </div>
      </div>
    );
  }

  // --- GUEST VIEW ---
  if (!user) {
    return (
      <div className="unified-dashboard-container">
        {/* 🚀 PRINT FIX: Added print-overrides to completely strip the dashboard wrapper during PDF generation */}
        <style>
          {`
            @media print {
              .dashboard-header { display: none !important; }
              .unified-dashboard-container { padding: 0 !important; margin: 0 !important; background: white !important; min-height: auto !important; }
              .dashboard-content { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
            }
          `}
        </style>

        <div className="dashboard-header no-print">
          <div className="dashboard-header-left">
            <h1 className="dashboard-title">
              <span className="dashboard-icon">⚡</span>
              Guest Access
            </h1>
            <p className="dashboard-subtitle">
              Create a free account to save your progress and earn rewards!
            </p>
          </div>

          <div className="dashboard-header-right">
            <button className="profile-action-button" onClick={() => navigate('/login')} title="Login">
              <span className="profile-icon">🔑</span>
              <span className="profile-text">Login</span>
            </button>
            <button className="profile-action-button" onClick={() => navigate('/')} title="Back to Home">
              <span className="profile-icon">🏠</span>
              <span className="profile-text">Home</span>
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          {children ? children : (
            <div className="dashboard-error no-print">
              <h2>⚠️ Dashboard Access Restricted</h2>
              <p>Please log in to access your personalized dashboard.</p>
              <button 
                onClick={() => navigate('/login')} 
                style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- LOGGED IN USER VIEW ---

  const dashboardComponents = {
    [ROLES?.SUPER_ADMIN]: SuperAdminDashboard,
    [ROLES?.DISTRICT_ADMIN]: SuperAdminDashboard,
    [ROLES?.SCHOOL_ADMIN]: SuperAdminDashboard,
    [ROLES?.TEACHER]: TeacherDashboard,
    [ROLES?.PARENT]: ParentDashboard,
    [ROLES?.STUDENT]: StudentDashboard,
    [ROLES?.COUNSELOR]: CounselorDashboard,
    [ROLES?.CONTENT_CREATOR]: ContentCreatorDashboard,
    [ROLES?.LIBRARIAN]: StudentDashboard,
    [ROLES?.OBSERVER]: StudentDashboard,
    [ROLES?.SUPPORT_STAFF]: StudentDashboard,
    [ROLES?.AI_ASSISTANT]: StudentDashboard
  };

  const roleNames = {
    [ROLES?.SUPER_ADMIN]: 'Super Administrator',
    [ROLES?.DISTRICT_ADMIN]: 'District Administrator',
    [ROLES?.SCHOOL_ADMIN]: 'School Administrator',
    [ROLES?.TEACHER]: 'Teacher',
    [ROLES?.PARENT]: 'Parent',
    [ROLES?.STUDENT]: 'Student',
    [ROLES?.COUNSELOR]: 'Counselor',
    [ROLES?.CONTENT_CREATOR]: 'Content Creator',
    [ROLES?.LIBRARIAN]: 'Librarian',
    [ROLES?.OBSERVER]: 'Observer',
    [ROLES?.SUPPORT_STAFF]: 'Support Staff',
    [ROLES?.AI_ASSISTANT]: 'AI Assistant'
  };

  const roleIcons = {
    [ROLES?.SUPER_ADMIN]: '👑',
    [ROLES?.DISTRICT_ADMIN]: '🏛️',
    [ROLES?.SCHOOL_ADMIN]: '🏫',
    [ROLES?.TEACHER]: '👨‍🏫',
    [ROLES?.PARENT]: '👪',
    [ROLES?.STUDENT]: '🎓',
    [ROLES?.COUNSELOR]: '🤝',
    [ROLES?.CONTENT_CREATOR]: '✍️',
    [ROLES?.LIBRARIAN]: '📚',
    [ROLES?.OBSERVER]: '👀',
    [ROLES?.SUPPORT_STAFF]: '🛠️',
    [ROLES?.AI_ASSISTANT]: '🤖'
  };

  const handleRoleSwitch = (newRole) => {
    if (switchRole(newRole)) {
      setShowRoleSwitcher(false);
    }
  };

  const DashboardComponent = dashboardComponents[activeRole] || StudentDashboard;

  return (
    <div className="unified-dashboard-container">
      {/* 🚀 PRINT FIX: Added print-overrides to completely strip the dashboard wrapper during PDF generation */}
      <style>
        {`
          @media print {
            .dashboard-header { display: none !important; }
            .unified-dashboard-container { padding: 0 !important; margin: 0 !important; background: white !important; min-height: auto !important; }
            .dashboard-content { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
          }
        `}
      </style>

      {/* Added no-print class here to ensure header never prints */}
      <div className="dashboard-header no-print">
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
        {children ? children : (
          <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: '#666' }}><div className="spinner"></div><p style={{ marginLeft: '1rem' }}>Loading dashboard...</p></div>}>
            <DashboardComponent />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default UnifiedDashboard;