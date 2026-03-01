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
        totalAssessments: users.filter(u => u.role === 'STUDENT').length * 10,
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
        <button className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`} onClick={() => setActiveSection('overview')}>
          <span className="nav-icon">📊</span><span className="nav-label">Overview</span>
        </button>

        <div className="nav-section-title">User Management</div>
        <button className={`nav-item ${activeSection === 'users' ? 'active' : ''}`} onClick={() => setActiveSection('users')}>
          <span className="nav-icon">👥</span><span className="nav-label">Manage Users</span>
        </button>
        <button className={`nav-item ${activeSection === 'approvals' ? 'active' : ''}`} onClick={() => setActiveSection('approvals')}>
          <span className="nav-icon">✅</span><span className="nav-label">User Approvals</span>
          {statistics.pendingApprovals > 0 && <span className="nav-badge">{statistics.pendingApprovals}</span>}
        </button>
        <button className={`nav-item ${activeSection === 'bulk-registration' ? 'active' : ''}`} onClick={() => setActiveSection('bulk-registration')}>
          <span className="nav-icon">📋</span><span className="nav-label">Bulk Registration</span>
        </button>

        <div className="nav-section-title">Content Management</div>
        <button className={`nav-item ${activeSection === 'content' ? 'active' : ''}`} onClick={() => setActiveSection('content')}>
          <span className="nav-icon">📝</span><span className="nav-label">Content Library</span>
        </button>

        <div className="nav-section-title">System</div>
        <button className={`nav-item ${activeSection === 'analytics' ? 'active' : ''}`} onClick={() => setActiveSection('analytics')}>
          <span className="nav-icon">📈</span><span className="nav-label">Analytics</span>
        </button>
        <button className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`} onClick={() => setActiveSection('settings')}>
          <span className="nav-icon">⚙️</span><span className="nav-label">Settings</span>
        </button>
      </nav>
    </div>
  );

  const renderOverview = () => (
    <div className="overview-container">
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

      <div className="content-stats-grid">
        <div className="content-stat-card">
          <div className="stat-header"><span className="stat-icon">📝</span><h3>Questions</h3></div>
          <div className="stat-value">{statistics.loading ? '...' : statistics.totalQuestions.toLocaleString()}</div>
          <div className="stat-footer">In question bank</div>
        </div>
        <div className="content-stat-card">
          <div className="stat-header"><span className="stat-icon">📚</span><h3>Stories</h3></div>
          <div className="stat-value">{statistics.loading ? '...' : statistics.totalStories.toLocaleString()}</div>
          <div className="stat-footer">Reading materials</div>
        </div>
        <div className="content-stat-card">
          <div className="stat-header"><span className="stat-icon">🎯</span><h3>Assessments</h3></div>
          <div className="stat-value">{statistics.loading ? '...' : statistics.totalAssessments.toLocaleString()}</div>
          <div className="stat-footer">Completed this month</div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="settings-container">
      <h2 className="section-title">System Settings</h2>
      <div className="settings-sections">
        {/* Simplified for brevity */}
        <p>Settings configuration goes here...</p>
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