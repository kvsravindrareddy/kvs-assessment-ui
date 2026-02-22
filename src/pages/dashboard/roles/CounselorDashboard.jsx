import React from 'react';
import './RoleDashboard.css';

const CounselorDashboard = () => {
  const stats = [
    { label: 'Students Assigned', value: '45', icon: '🎓', color: '#667eea' },
    { label: 'Active Cases', value: '8', icon: '📋', color: '#ed8936' },
    { label: 'Sessions This Week', value: '12', icon: '🤝', color: '#48bb78' },
    { label: 'Pending Reviews', value: '5', icon: '⏰', color: '#9f7aea' }
  ];

  return (
    <div className="role-dashboard counselor-dashboard">
      <h2 className="dashboard-welcome">
        <span className="welcome-icon">🤝</span>
        Counselor Dashboard
      </h2>
      <p className="dashboard-description">Support student well-being and academic success</p>

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
            <span className="action-icon">👥</span>
            <span>View Students</span>
          </button>
          <button className="action-card">
            <span className="action-icon">📝</span>
            <span>Add Session Notes</span>
          </button>
          <button className="action-card">
            <span className="action-icon">📊</span>
            <span>View Reports</span>
          </button>
          <button className="action-card">
            <span className="action-icon">📅</span>
            <span>Schedule Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CounselorDashboard;
