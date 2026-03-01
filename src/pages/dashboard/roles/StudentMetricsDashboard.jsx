import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import CONFIG from '../../../Config';
import './StudentMetricsDashboard.css';

export default function StudentMetricsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const userId = user ? (user.id || user.email || 'GUEST_USER') : 'GUEST_USER';
        // Note: Hits Port 9000 API Gateway routing to your Spring Boot endpoint
        const url = `${CONFIG.development.ADMIN_BASE_URL}/v1/assessment/dashboard/student?userId=${encodeURIComponent(userId)}`;
        
        const res = await axios.get(url, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to load student dashboard metrics", err);
      }
    };
    fetchDashboard();
  }, [user]);

  if (!data) return <div className="metrics-dashboard-container"><h2>Loading your progress...</h2></div>;

  const currentMetrics = data[activeTab];

  const handleResume = (session) => {
    if (session.assessmentType === 'STORY') {
      navigate(`/reading?storyId=${session.assessmentId}`);
    } else {
      navigate(`/${session.assessmentType.toLowerCase()}?id=${session.assessmentId}`);
    }
  };

  return (
    <div className="metrics-dashboard-container">
      {/* 1. Continue Learning */}
      {data.continueLearning.length > 0 && (
        <section>
          <h2 className="section-title">🚀 Start Where You Left Off</h2>
          <div className="resume-grid">
            {data.continueLearning.map(session => {
              const progress = session.totalQuestions > 0 ? (session.lastAttemptedIndex / session.totalQuestions) * 100 : 0;
              return (
                <div key={session.sessionId} className="resume-card">
                  <div>
                    <div className="resume-tag">{session.assessmentType}</div>
                    <h3>{session.assessmentName}</h3>
                    <div className="progress-container">
                      <div className="progress-text">
                        <span>Progress</span>
                        <span>{session.lastAttemptedIndex} / {session.totalQuestions}</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <button className="resume-btn" onClick={() => handleResume(session)}>Resume Now →</button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. Performance Metrics */}
      <section>
        <h2 className="section-title">📊 Your Performance</h2>
        <div className="time-tabs">
          {['today', 'thisWeek', 'thisMonth', 'allTime'].map(tab => (
            <button 
              key={tab} 
              className={`time-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.replace('this', '').replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}
            </button>
          ))}
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <h4>Assessments Done</h4>
            <div className="metric-value">{currentMetrics?.assessmentsCompleted || 0}</div>
          </div>
          <div className="metric-card">
            <h4>Total Score</h4>
            <div className="metric-value">{currentMetrics?.totalScore || 0}</div>
          </div>
          <div className="metric-card">
            <h4>Accuracy</h4>
            <div className="metric-value">{currentMetrics?.accuracyPercentage || 0}%</div>
          </div>
        </div>
      </section>

      {/* 3. Recently Completed */}
      {data.recentlyCompleted.length > 0 && (
        <section>
          <h2 className="section-title">🏆 Recently Completed</h2>
          <div className="completed-list">
            {data.recentlyCompleted.map(session => (
              <div key={session.sessionId} className="completed-item">
                <div className="completed-info">
                  <h4>{session.assessmentName}</h4>
                  <p>{session.assessmentType} • {new Date(session.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="completed-score">
                  {session.score} / {session.totalQuestions}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}