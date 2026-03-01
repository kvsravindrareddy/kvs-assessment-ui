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
        const url = `${CONFIG.development.ADMIN_BASE_URL}/v1/assessment/dashboard/student?userId=${encodeURIComponent(userId)}`;
        const res = await axios.get(url, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      }
    };
    fetchDashboard();
  }, [user]);

  if (!data) return <div className="metrics-dashboard-container"><h2>Loading your progress...</h2></div>;

  const currentMetrics = data[activeTab];

  const handleResume = (session) => {
    if (session.assessmentType === 'STORY') {
      // You can pass the ID to your ReadingFlow component via URL params!
      navigate(`/reading?storyId=${session.assessmentId}`);
    } else {
      navigate(`/${session.assessmentType.toLowerCase()}?id=${session.assessmentId}`);
    }
  };

  return (
    <div className="metrics-dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome back, {user?.name || 'Student'}! 👋</h1>
        <p>Here is a look at your learning journey so far.</p>
      </header>

      {/* 1. Continue Learning */}
      {data.continueLearning.length > 0 && (
        <section>
          <h2 className="section-title">🚀 Start Where You Left Off</h2>
          <div className="resume-grid">
            {data.continueLearning.map(session => {
              const progress = session.totalQuestions > 0 
                ? (session.lastAttemptedIndex / session.totalQuestions) * 100 
                : 0;
              
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
                  <button className="resume-btn" onClick={() => handleResume(session)}>
                    Resume Now →
                  </button>
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
          {['today', 'thisWeek', 'thisMonth', 'thisQuarter', 'thisYear', 'allTime'].map(tab => (
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
            <div className="metric-value">{currentMetrics.assessmentsCompleted}</div>
            <div className="metric-subtext">Great job!</div>
          </div>
          <div className="metric-card">
            <h4>Total Score</h4>
            <div className="metric-value">{currentMetrics.totalScore}</div>
            <div className="metric-subtext">Points Earned</div>
          </div>
          <div className="metric-card">
            <h4>Accuracy</h4>
            <div className="metric-value">{currentMetrics.accuracyPercentage}%</div>
            <div className="metric-subtext">Keep it up!</div>
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