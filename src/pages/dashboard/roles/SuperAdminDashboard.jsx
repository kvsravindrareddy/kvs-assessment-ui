import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { getConfig } from '../../../Config';
import UserRoleManagement from '../components/UserRoleManagement';
import UserApprovals from '../components/UserApprovals';
import ContentManagement from '../components/ContentManagement';
import SystemAnalytics from '../components/SystemAnalytics';
import BulkRegistration from '../components/BulkRegistration';
import SessionManagement from '../components/SessionManagement';
import GradesManagement from '../components/GradesManagement';
import IncidentManagement from '../components/IncidentManagement';
import FlashMessageManager from '../../admin/FlashMessageManager';
import FeatureAccessControl from '../../admin/FeatureAccessControl';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const config = getConfig();
  const [activeSection, setActiveSection] = useState('overview');
  
  // 1. Updated state to match your StatsController payload
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    totalAssessments: 0,
    totalWorksheets: 0,
    totalGamesPlayed: 0,
    totalStoriesRead: 0,
    loading: true
  });

  useEffect(() => {
    loadDashboardStatistics();
  }, []);

  const loadDashboardStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 2. Use Promise.allSettled so if one fails, it doesn't crash the whole dashboard
      const [usersRes, pendingRes, platformStatsRes] = await Promise.allSettled([
        axios.get(`${config.GATEWAY_URL || config.ADMIN_BASE_URL}/auth/admin/users`, { headers }),
        axios.get(`${config.GATEWAY_URL || config.ADMIN_BASE_URL}/auth/admin/pending-users`, { headers }),
        // 3. FIX: Call your new StatsController instead of downloading all questions!
        axios.get(`${config.GATEWAY_URL || config.ADMIN_BASE_URL}/admin-assessment/api/stats/platform`, { headers })
      ]);

      const users = usersRes.status === 'fulfilled' ? (usersRes.value.data || []) : [];
      const pending = pendingRes.status === 'fulfilled' ? (pendingRes.value.data || []) : [];
      const platformStats = platformStatsRes.status === 'fulfilled' ? (platformStatsRes.value.data || {}) : {};

      // 4. Map the new StatsController data securely
      setStatistics({
        totalUsers: users.length || (platformStats.totalStudents + platformStats.totalTeachers + platformStats.totalParents) || 0,
        activeUsers: users.filter(u => u.status === 'ACTIVE').length,
        pendingApprovals: pending.length,
        totalAssessments: platformStats.totalAssessments || 0,
        totalWorksheets: platformStats.totalWorksheets || 0,
        totalGamesPlayed: platformStats.totalGamesPlayed || 0,
        totalStoriesRead: platformStats.totalStoriesRead || 0,
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
        <div className="nav-section-title">📊 Dashboard</div>
        <button className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`} onClick={() => setActiveSection('overview')}>
          <span className="nav-icon">🏠</span><span className="nav-label">Overview</span>
        </button>
        <button className={`nav-item ${activeSection === 'analytics' ? 'active' : ''}`} onClick={() => setActiveSection('analytics')}>
          <span className="nav-icon">📊</span><span className="nav-label">Analytics</span>
        </button>

        <div className="nav-section-title">👥 Users</div>
        <button className={`nav-item ${activeSection === 'users' ? 'active' : ''}`} onClick={() => setActiveSection('users')}>
          <span className="nav-icon">👤</span><span className="nav-label">Manage Users</span>
        </button>
        <button className={`nav-item ${activeSection === 'approvals' ? 'active' : ''}`} onClick={() => setActiveSection('approvals')}>
          <span className="nav-icon">✔️</span><span className="nav-label">User Approvals</span>
          {statistics.pendingApprovals > 0 && <span className="nav-badge">{statistics.pendingApprovals}</span>}
        </button>
        <button className={`nav-item ${activeSection === 'bulk-registration' ? 'active' : ''}`} onClick={() => setActiveSection('bulk-registration')}>
          <span className="nav-icon">📥</span><span className="nav-label">Bulk Registration</span>
        </button>

        <div className="nav-section-title">📚 Content</div>
        <button className={`nav-item ${activeSection === 'content' ? 'active' : ''}`} onClick={() => setActiveSection('content')}>
          <span className="nav-icon">📖</span><span className="nav-label">Content Library</span>
        </button>
        <button className={`nav-item ${activeSection === 'grades' ? 'active' : ''}`} onClick={() => setActiveSection('grades')}>
          <span className="nav-icon">🎓</span><span className="nav-label">Grades</span>
        </button>

        <div className="nav-section-title">⚙️ System</div>
        <button className={`nav-item ${activeSection === 'access-control' ? 'active' : ''}`} onClick={() => setActiveSection('access-control')}>
          <span className="nav-icon">🔐</span><span className="nav-label">Access Control</span>
        </button>
        <button className={`nav-item ${activeSection === 'flash-alerts' ? 'active' : ''}`} onClick={() => setActiveSection('flash-alerts')}>
          <span className="nav-icon">⚡</span><span className="nav-label">Flash Alerts</span>
        </button>
        <button className={`nav-item ${activeSection === 'sessions' ? 'active' : ''}`} onClick={() => setActiveSection('sessions')}>
          <span className="nav-icon">💻</span><span className="nav-label">Active Sessions</span>
        </button>
        <button className={`nav-item ${activeSection === 'incidents' ? 'active' : ''}`} onClick={() => setActiveSection('incidents')}>
          <span className="nav-icon">🐛</span><span className="nav-label">Incident Reports</span>
        </button>
        <button className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`} onClick={() => setActiveSection('settings')}>
          <span className="nav-icon">🔧</span><span className="nav-label">Settings</span>
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

      {/* 5. FIX: Displaying REAL aggregated stats instead of fetching millions of rows */}
      <div className="content-stats-grid">
        <div className="content-stat-card">
          <div className="stat-header"><span className="stat-icon">🎯</span><h3>Assessments</h3></div>
          <div className="stat-value">{statistics.loading ? '...' : statistics.totalAssessments.toLocaleString()}</div>
          <div className="stat-footer">Completed platform-wide</div>
        </div>
        <div className="content-stat-card">
          <div className="stat-header"><span className="stat-icon">📄</span><h3>Worksheets</h3></div>
          <div className="stat-value">{statistics.loading ? '...' : statistics.totalWorksheets.toLocaleString()}</div>
          <div className="stat-footer">Generated & downloaded</div>
        </div>
        <div className="content-stat-card">
          <div className="stat-header"><span className="stat-icon">🎮</span><h3>Games Played</h3></div>
          <div className="stat-value">{statistics.loading ? '...' : statistics.totalGamesPlayed.toLocaleString()}</div>
          <div className="stat-footer">Educational games completed</div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="settings-container">
      <h2 className="section-title">System Settings</h2>
      <div className="settings-sections">
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
            {activeSection === 'grades' && '🎓 Grades Management'}
            {activeSection === 'access-control' && '🔐 Access Control & Permissions'}
            {activeSection === 'flash-alerts' && '⚡ Flash Alerts & Messages'}
            {activeSection === 'sessions' && '🔄 Active Sessions Management'}
            {activeSection === 'incidents' && '🐛 Incident Reports & Tracking'}
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
          {activeSection === 'grades' && <GradesManagement />}
          {activeSection === 'access-control' && <FeatureAccessControl />}
          {activeSection === 'flash-alerts' && <FlashMessageManager />}
          {activeSection === 'sessions' && <SessionManagement />}
          {activeSection === 'incidents' && <IncidentManagement />}
          {activeSection === 'analytics' && <SystemAnalytics />}
          {activeSection === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;