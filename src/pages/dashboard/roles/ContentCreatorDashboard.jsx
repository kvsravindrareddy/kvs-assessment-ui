import React from 'react';
import './RoleDashboard.css';

const ContentCreatorDashboard = () => {
  const stats = [
    { label: 'Assessments Created', value: '42', icon: '📝', color: '#667eea' },
    { label: 'Questions Written', value: '386', icon: '❓', color: '#48bb78' },
    { label: 'Stories Published', value: '28', icon: '📚', color: '#ed8936' },
    { label: 'Pending Review', value: '7', icon: '⏰', color: '#9f7aea' }
  ];

  return (
    <div className="role-dashboard content-creator-dashboard">
      <h2 className="dashboard-welcome">
        <span className="welcome-icon">✍️</span>
        Content Creator Dashboard
      </h2>
      <p className="dashboard-description">Create and manage educational content and assessments</p>

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
          <button className="action-card">
            <span className="action-icon">➕</span>
            <span>Create Assessment</span>
          </button>
          <button className="action-card">
            <span className="action-icon">📝</span>
            <span>Write Questions</span>
          </button>
          <button className="action-card">
            <span className="action-icon">📚</span>
            <span>Create Story</span>
          </button>
          <button className="action-card">
            <span className="action-icon">📊</span>
            <span>View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentCreatorDashboard;
