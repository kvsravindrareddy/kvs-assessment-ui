import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { getConfig } from '../../../Config';
import UserRoleManagement from '../components/UserRoleManagement';
import UserApprovals from '../components/UserApprovals';
import ContentManagement from '../components/ContentManagement';
import SystemAnalytics from '../components/SystemAnalytics';
import BulkRegistration from '../components/BulkRegistration';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const config = getConfig();
  const [activeSection, setActiveSection] = useState('overview');
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    totalQuestions: 0,
    totalStories: 0,
    totalAssessments: 0,
    loading: true
  });

  useEffect(() => {
    loadDashboardStatistics();
  }, []);

  const loadDashboardStatistics = async () => {
    try {
      const [usersRes, pendingRes, questionsRes, storiesRes] = await Promise.all([
        axios.get('http://localhost:9000/auth/admin/users').catch(() => ({ data: [] })),
        axios.get('http://localhost:9000/auth/admin/pending-users').catch(() => ({ data: [] })),
        axios.get(`${config.ADMIN_BASE_URL}/listallquestions`).catch(() => ({ data: [] })),
        axios.get(`${config.ADMIN_BASE_URL}/listAllStories`).catch(() => ({ data: [] }))
      ]);

      const users = usersRes.data || [];
      setStatistics({
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'ACTIVE').length,
        pendingApprovals: (pendingRes.data || []).length,
        totalQuestions: (questionsRes.data || []).length,
        totalStories: (storiesRes.data || []).length,
        totalAssessments: users.filter(u => u.role === 'STUDENT').length * 10, // Estimated
        loading: false
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
      setStatistics(prev => ({ ...prev, loading: false }));
    }
  };

  const renderSidebar = () => (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <div className="admin-avatar">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div className="admin-info">
          <h3>{user?.firstName} {user?.lastName}</h3>
          <p>{user?.role?.replace(/_/g, ' ')}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Overview</span>
        </button>

        <div className="nav-section-title">User Management</div>
        <button
          className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
          onClick={() => setActiveSection('users')}
        >
          <span className="nav-icon">👥</span>
          <span className="nav-label">Manage Users</span>
        </button>
        <button
          className={`nav-item ${activeSection === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveSection('approvals')}
        >
          <span className="nav-icon">✅</span>
          <span className="nav-label">User Approvals</span>
          {statistics.pendingApprovals > 0 && (
            <span className="nav-badge">{statistics.pendingApprovals}</span>
          )}
        </button>
        <button
          className={`nav-item ${activeSection === 'bulk-registration' ? 'active' : ''}`}
          onClick={() => setActiveSection('bulk-registration')}
        >
          <span className="nav-icon">📋</span>
          <span className="nav-label">Bulk Registration</span>
        </button>

        <div className="nav-section-title">Content Management</div>
        <button
          className={`nav-item ${activeSection === 'content' ? 'active' : ''}`}
          onClick={() => setActiveSection('content')}
        >
          <span className="nav-icon">📝</span>
          <span className="nav-label">Content Library</span>
        </button>

        <div className="nav-section-title">System</div>
        <button
          className={`nav-item ${activeSection === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveSection('analytics')}
        >
          <span className="nav-icon">📈</span>
          <span className="nav-label">Analytics</span>
        </button>
        <button
          className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveSection('settings')}
        >
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">Settings</span>
        </button>
      </nav>
    </div>
  );

  const renderOverview = () => (
    <div className="overview-container">
      {/* Hero Stats */}
      <div className="hero-stats">
        <div className="hero-stat-card primary">
          <div className="stat-content">
            <h2>{statistics.loading ? '...' : statistics.totalUsers.toLocaleString()}</h2>
            <p>Total Users</p>
          </div>
          <div className="stat-icon">👥</div>
        </div>
        <div className="hero-stat-card success">
          <div className="stat-content">
            <h2>{statistics.loading ? '...' : statistics.activeUsers.toLocaleString()}</h2>
            <p>Active Users</p>
          </div>
          <div className="stat-icon">✅</div>
        </div>
        <div className="hero-stat-card warning">
          <div className="stat-content">
            <h2>{statistics.loading ? '...' : statistics.pendingApprovals.toLocaleString()}</h2>
            <p>Pending Approvals</p>
          </div>
          <div className="stat-icon">⏳</div>
        </div>
      </div>

      {/* Content Stats */}
      <div className="content-stats-grid">
        <div className="content-stat-card">
          <div className="stat-header">
            <span className="stat-icon">📝</span>
            <h3>Questions</h3>
          </div>
          <div className="stat-value">{statistics.loading ? '...' : statistics.totalQuestions.toLocaleString()}</div>
          <div className="stat-footer">In question bank</div>
        </div>
        <div className="content-stat-card">
          <div className="stat-header">
            <span className="stat-icon">📚</span>
            <h3>Stories</h3>
          </div>
          <div className="stat-value">{statistics.loading ? '...' : statistics.totalStories.toLocaleString()}</div>
          <div className="stat-footer">Reading materials</div>
        </div>
        <div className="content-stat-card">
          <div className="stat-header">
            <span className="stat-icon">🎯</span>
            <h3>Assessments</h3>
          </div>
          <div className="stat-value">{statistics.loading ? '...' : statistics.totalAssessments.toLocaleString()}</div>
          <div className="stat-footer">Completed this month</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="action-cards-grid">
          <div className="action-card" onClick={() => setActiveSection('users')}>
            <div className="action-card-icon">👥</div>
            <h3>Manage Users</h3>
            <p>View, search, and manage user roles</p>
            <button className="action-btn">Go to Users →</button>
          </div>

          <div className="action-card" onClick={() => setActiveSection('approvals')}>
            <div className="action-card-icon">✅</div>
            <h3>Approve Users</h3>
            <p>Review pending user registrations</p>
            {statistics.pendingApprovals > 0 && (
              <div className="action-badge">{statistics.pendingApprovals} pending</div>
            )}
            <button className="action-btn">Go to Approvals →</button>
          </div>

          <div className="action-card" onClick={() => setActiveSection('bulk-registration')}>
            <div className="action-card-icon">📋</div>
            <h3>Bulk Registration</h3>
            <p>Upload CSV to register multiple users</p>
            <button className="action-btn">Upload CSV →</button>
          </div>

          <div className="action-card" onClick={() => setActiveSection('content')}>
            <div className="action-card-icon">📝</div>
            <h3>Load Content</h3>
            <p>Generate questions and stories with AI</p>
            <button className="action-btn">Load Content →</button>
          </div>

          <div className="action-card" onClick={() => setActiveSection('analytics')}>
            <div className="action-card-icon">📈</div>
            <h3>View Analytics</h3>
            <p>System usage and performance metrics</p>
            <button className="action-btn">View Analytics →</button>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="system-health-section">
        <h2 className="section-title">System Health</h2>
        <div className="health-cards">
          <div className="health-card">
            <div className="health-indicator success"></div>
            <div className="health-info">
              <h4>Authentication Service</h4>
              <p>All systems operational</p>
            </div>
          </div>
          <div className="health-card">
            <div className="health-indicator success"></div>
            <div className="health-info">
              <h4>Assessment Service</h4>
              <p>All systems operational</p>
            </div>
          </div>
          <div className="health-card">
            <div className="health-indicator success"></div>
            <div className="health-info">
              <h4>Gateway Service</h4>
              <p>All systems operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="settings-container">
      <h2 className="section-title">System Settings</h2>

      <div className="settings-sections">
        <div className="settings-section">
          <h3>General Settings</h3>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              <span>Enable user registration</span>
            </label>
            <p className="setting-description">Allow new users to register for the platform</p>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              <span>Require email verification</span>
            </label>
            <p className="setting-description">Users must verify email before accessing</p>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" />
              <span>Enable two-factor authentication</span>
            </label>
            <p className="setting-description">Add extra security layer for user accounts</p>
          </div>
        </div>

        <div className="settings-section">
          <h3>Assessment Settings</h3>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              <span>Allow assessment retakes</span>
            </label>
            <p className="setting-description">Students can retake failed assessments</p>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              <span>Show correct answers after submission</span>
            </label>
            <p className="setting-description">Display answers after assessment completion</p>
          </div>
        </div>

        <div className="settings-section">
          <h3>Notification Settings</h3>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              <span>Email notifications for new users</span>
            </label>
            <p className="setting-description">Notify admins of new registrations</p>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              <span>Alert on system errors</span>
            </label>
            <p className="setting-description">Send alerts when system issues occur</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="super-admin-dashboard-new">
      {renderSidebar()}

      <div className="admin-main-content">
        <div className="content-header">
          <h1 className="page-title">
            {activeSection === 'overview' && '📊 Dashboard Overview'}
            {activeSection === 'users' && '👥 User Management'}
            {activeSection === 'approvals' && '✅ User Approvals'}
            {activeSection === 'bulk-registration' && '📋 Bulk User Registration'}
            {activeSection === 'content' && '📝 Content Management'}
            {activeSection === 'analytics' && '📈 Analytics & Reports'}
            {activeSection === 'settings' && '⚙️ System Settings'}
          </h1>
        </div>

        <div className="content-body">
          {activeSection === 'overview' && renderOverview()}
          {activeSection === 'users' && <UserRoleManagement />}
          {activeSection === 'approvals' && <UserApprovals />}
          {activeSection === 'bulk-registration' && <BulkRegistration />}
          {activeSection === 'content' && <ContentManagement />}
          {activeSection === 'analytics' && <SystemAnalytics />}
          {activeSection === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
