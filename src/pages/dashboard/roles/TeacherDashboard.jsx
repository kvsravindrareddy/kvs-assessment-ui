import React, { useState } from 'react';
import TeacherGroups from '../components/TeacherGroups';
import './RoleDashboard.css';

const TeacherDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const stats = [
    { label: 'My Classes', value: '5', icon: '📚', color: '#48bb78' },
    { label: 'Total Students', value: '127', icon: '🎓', color: '#667eea' },
    { label: 'Assessments Created', value: '24', icon: '📝', color: '#ed8936' },
    { label: 'Pending Grading', value: '12', icon: '✏️', color: '#e53e3e' }
  ];

  const renderOverview = () => (
    <>
      <h2 className="dashboard-welcome">
        <span className="welcome-icon">👨‍🏫</span>
        Teacher Dashboard
      </h2>
      <p className="dashboard-description">Manage your classes, create assessments, and track student progress</p>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderTop: `4px solid ${stat.color}` }}>
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="action-grid">
          <button className="action-card" onClick={() => setActiveSection('classes')}>
            <span className="action-icon">👥</span>
            <span>Manage Classes</span>
          </button>
          <button className="action-card">
            <span className="action-icon">➕</span>
            <span>Create Assessment</span>
          </button>
          <button className="action-card">
            <span className="action-icon">📊</span>
            <span>View Class Progress</span>
          </button>
          <button className="action-card">
            <span className="action-icon">✏️</span>
            <span>Grade Submissions</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="role-dashboard teacher-dashboard">
      {activeSection === 'overview' && (
        <div className="dashboard-nav-tabs">
          <button
            className="nav-tab active"
            onClick={() => setActiveSection('overview')}
          >
            📊 Overview
          </button>
          <button
            className="nav-tab"
            onClick={() => setActiveSection('classes')}
          >
            📚 My Classes
          </button>
          <button className="nav-tab">
            📝 Assessments
          </button>
          <button className="nav-tab">
            ✏️ Grading
          </button>
          <button className="nav-tab">
            📈 Reports
          </button>
        </div>
      )}

      {activeSection === 'overview' && renderOverview()}
      {activeSection === 'classes' && (
        <>
          <button
            className="back-to-overview-btn"
            onClick={() => setActiveSection('overview')}
          >
            ← Back to Overview
          </button>
          <TeacherGroups />
        </>
      )}
    </div>
  );
};

export default TeacherDashboard;
