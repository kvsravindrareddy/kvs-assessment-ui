import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleDashboard.css';
import StudentMetricsDashboard from './StudentMetricsDashboard';
import OfflineMode from '../../../components/OfflineMode'; 

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [showOfflineMode, setShowOfflineMode] = useState(false);

  return (
    <div className="role-dashboard student-dashboard">
      <div className="quick-actions-section" style={{ marginBottom: '30px' }}>
        <h3>Quick Actions</h3>
        <div className="action-grid">
          <button className="action-card" onClick={() => navigate('/student/grading-dashboard')}>
            <span className="action-icon">📊</span><span>Grading Dashboard</span>
          </button>
          <button className="action-card" onClick={() => navigate('/reading')}>
            <span className="action-icon">📚</span><span>Read Stories</span>
          </button>
          <button className="action-card" onClick={() => navigate('/games')}>
            <span className="action-icon">🎮</span><span>Play Games</span>
          </button>

          {/* UPDATED: Now points to the new Assessment Hub! */}
          <button className="action-card" onClick={() => navigate('/assessments')}>
            <span className="action-icon">📝</span><span>Assessments</span>
          </button>

          <button className="action-card" onClick={() => navigate('/ai-hub')}>
            <span className="action-icon">🤖</span><span>AI Learning</span>
          </button>

          <button className="action-card" onClick={() => navigate('/worksheets')}>
            <span className="action-icon">📄</span><span>Worksheets</span>
          </button>

          {/* 🚀 NEW: Safely added Global Exams button here! */}
          <button 
            className="action-card" 
            onClick={() => navigate('/competitive-hub')} 
            style={{ 
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
              border: '1px solid #38bdf8',
              boxShadow: '0 4px 15px rgba(56, 189, 248, 0.2)'
            }}
          >
            <span className="action-icon" style={{ filter: 'drop-shadow(0 0 5px rgba(56, 189, 248, 0.8))' }}>🌍</span>
            <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>Global Exams</span>
          </button>

          <button className="action-card" onClick={() => setShowOfflineMode(true)}>
            <span className="action-icon">📥</span><span>Offline Learning</span>
          </button>
        </div>
      </div>

      {/* Offline Mode Modal */}
      {showOfflineMode && (
        <div className="modal-overlay" onClick={() => setShowOfflineMode(false)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowOfflineMode(false)}>✕</button>
            <OfflineMode />
          </div>
        </div>
      )}

      <div className="dynamic-metrics-wrapper">
        <StudentMetricsDashboard />
      </div>
    </div>
  );
};

export default StudentDashboard;