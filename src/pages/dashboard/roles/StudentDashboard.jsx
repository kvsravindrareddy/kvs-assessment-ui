import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleDashboard.css';
import StudentMetricsDashboard from './StudentMetricsDashboard'; 

const StudentDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="role-dashboard student-dashboard">
      <div className="quick-actions-section" style={{ marginBottom: '30px' }}>
        <h3>Quick Actions</h3>
        <div className="action-grid">
          <button className="action-card" onClick={() => navigate('/reading')}>
            <span className="action-icon">📚</span><span>Read Stories</span>
          </button>
          <button className="action-card" onClick={() => navigate('/games')}>
            <span className="action-icon">🎮</span><span>Play Games</span>
          </button>
          <button className="action-card" onClick={() => navigate('/select-grade')}>
            <span className="action-icon">📝</span><span>Take Assessment</span>
          </button>
          <button className="action-card" onClick={() => navigate('/ai-hub')}>
            <span className="action-icon">🤖</span><span>AI Learning</span>
          </button>
        </div>
      </div>

      <div className="dynamic-metrics-wrapper">
        <StudentMetricsDashboard />
      </div>
    </div>
  );
};

export default StudentDashboard;