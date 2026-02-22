import React from 'react';
import './RoleDashboard.css';

const StudentDashboard = () => {
  const stats = [
    { label: 'Courses Enrolled', value: '6', icon: '📚', color: '#667eea' },
    { label: 'Assessments Taken', value: '18', icon: '✅', color: '#48bb78' },
    { label: 'Average Score', value: '87%', icon: '📊', color: '#ed8936' },
    { label: 'Badges Earned', value: '12', icon: '🏆', color: '#9f7aea' }
  ];

  return (
    <div className="role-dashboard student-dashboard">
      <h2 className="dashboard-welcome">
        <span className="welcome-icon">🎓</span>
        Student Dashboard
      </h2>
      <p className="dashboard-description">Track your learning progress and take assessments</p>

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
            <span className="action-icon">📝</span>
            <span>Take Assessment</span>
          </button>
          <button className="action-card">
            <span className="action-icon">📊</span>
            <span>View My Scores</span>
          </button>
          <button className="action-card">
            <span className="action-icon">🎮</span>
            <span>Play Games</span>
          </button>
          <button className="action-card">
            <span className="action-icon">📚</span>
            <span>Browse Courses</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
