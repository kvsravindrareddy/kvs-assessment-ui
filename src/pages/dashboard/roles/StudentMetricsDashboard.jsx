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

  const fetchDashboard = async () => {
    try {
      const userId = user ? (user.id || user.email || 'GUEST_USER') : 'GUEST_USER';
      const url = `${CONFIG.development.ADMIN_BASE_URL}/v1/assessment/dashboard/student?userId=${encodeURIComponent(userId)}`;
      
      const res = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setData(res.data);
    } catch (err) {
      console.error("Failed to load student dashboard metrics", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  if (!data) return <div className="metrics-dashboard-container"><h2>Loading your progress...</h2></div>;

  const currentMetrics = data[activeTab];

  const handleResume = (session) => {
    if (session.assessmentType === 'STORY') {
      navigate(`/reading?storyId=${session.assessmentId}`);
    } else if (session.assessmentType === 'MATH_CHALLENGE') {
      navigate(`/assessments/speed-math`); 
    } else {
      navigate(`/${session.assessmentType.toLowerCase()}?id=${session.assessmentId}`);
    }
  };

  const handleEndSession = async (session) => {
    if (!window.confirm(`Are you sure you want to end "${session.assessmentName}"? Your score will be saved as is.`)) return;
    try {
        await axios.post(`${CONFIG.development.GATEWAY_URL}/api/assessment/end-session`, null, {
            params: { userId: session.userId, assessmentId: session.assessmentId, assessmentType: session.assessmentType },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchDashboard(); 
    } catch (err) {
        alert("Failed to end session.");
    }
  };

  const getSessionRating = (score, total) => {
    if (!total || total === 0) return '⭐';
    const accuracy = (score / total) * 100;
    if (accuracy >= 95) return '⭐⭐⭐⭐⭐';
    if (accuracy >= 80) return '⭐⭐⭐⭐';
    if (accuracy >= 60) return '⭐⭐⭐';
    if (accuracy >= 40) return '⭐⭐';
    return '⭐';
  };

  const getCategoryDisplay = (type) => {
    if (!type) return { label: 'Assessment', icon: '📝', color: '#64748b', bg: '#f1f5f9' };
    const t = type.toUpperCase();
    if (t === 'STORY') return { label: 'Story Reading', icon: '📖', color: '#0ea5e9', bg: '#e0f2fe', border: '#bae6fd' };
    if (t === 'MATH_CHALLENGE') return { label: 'The Math Universe 🌍', icon: '⚡', color: '#f59e0b', bg: '#fef3c7', border: '#fde68a' };
    if (t === 'MATH') return { label: 'Grade Mathematics', icon: '📐', color: '#10b981', bg: '#d1fae5', border: '#a7f3d0' };
    if (t === 'SCIENCE') return { label: 'Grade Science', icon: '🔬', color: '#8b5cf6', bg: '#ede9fe', border: '#ddd6fe' };
    if (t === 'ENGLISH') return { label: 'Grade English', icon: '📝', color: '#f43f5e', bg: '#ffe4e6', border: '#fecdd3' };
    return { label: type.replace(/_/g, ' '), icon: '📚', color: '#475569', bg: '#e2e8f0', border: '#cbd5e1' };
  };

  const getFilteredCompletedList = () => {
    if (!data.recentlyCompleted) return [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday); startOfWeek.setDate(startOfWeek.getDate() - 7);
    const startOfMonth = new Date(startOfToday); startOfMonth.setMonth(startOfMonth.getMonth() - 1);

    return data.recentlyCompleted.filter(session => {
        const sessionDate = new Date(session.updatedAt);
        if (activeTab === 'today') return sessionDate >= startOfToday;
        if (activeTab === 'thisWeek') return sessionDate >= startOfWeek;
        if (activeTab === 'thisMonth') return sessionDate >= startOfMonth;
        return true; 
    });
  };

  const filteredCompletedItems = getFilteredCompletedList();
  
  // Clean fallback mapping
  const categoryScores = data.scoreBySubject || {};

  return (
    <div className="metrics-dashboard-container">
      
      {data.allTime && (
        <div className="rating-banner">
            <div className="rating-text-section">
                <h2 className="rating-title">
                    Current Rank: <span className="rating-stars">{data.allTime.rating}</span>
                </h2>
                <p className="rating-message">{data.allTime.motivationalMessage}</p>
            </div>
            <div className="rating-accuracy-box">
                <div className="accuracy-value">{data.allTime.accuracyPercentage}%</div>
                <div className="accuracy-label">Overall Accuracy</div>
            </div>
        </div>
      )}

      {data.continueLearning.length > 0 && (
        <section>
          <h2 className="section-title">🚀 Start Where You Left Off</h2>
          <div className="resume-grid">
            {data.continueLearning.map(session => {
              const progress = session.totalQuestions > 0 ? (session.lastAttemptedIndex / session.totalQuestions) * 100 : 0;
              const category = getCategoryDisplay(session.assessmentType);

              return (
                <div key={session.sessionId} className="resume-card">
                  <div>
                    <div style={{ background: category.bg, color: category.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', width: 'fit-content', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '5px', border: `1px solid ${category.border}` }}>
                        <span>{category.icon}</span> {category.label}
                    </div>
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
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button className="resume-btn" onClick={() => handleResume(session)} style={{ flex: 2 }}>Resume Challenge →</button>
                    <button onClick={() => handleEndSession(session)} style={{ flex: 1, background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>End 🛑</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title">📊 Your Performance</h2>
        <div className="time-tabs">
          {['today', 'thisWeek', 'thisMonth', 'allTime'].map(tab => (
            <button key={tab} className={`time-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
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

        {/* 🌟 THIS BLOCK WILL ALWAYS RENDER NOW! */}
        <div style={{ marginTop: '30px', background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginTop: '0', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🏆 Your Exploration Results
            </h3>
            
            {Object.keys(categoryScores).length > 0 ? (
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    {Object.entries(categoryScores).map(([subject, score]) => {
                        const cat = getCategoryDisplay(subject);
                        return (
                            <div key={subject} style={{ background: 'white', border: `2px solid ${cat.border}`, padding: '15px 25px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', flex: '1', minWidth: '220px', boxShadow: `0 4px 15px ${cat.bg}88` }}>
                                <div style={{ background: cat.bg, padding: '10px', borderRadius: '50%', fontSize: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50px', width: '50px' }}>
                                    {cat.icon}
                                </div>
                                <div>
                                    <div style={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{cat.label}</div>
                                    <div style={{ color: '#0f172a', fontSize: '1.8rem', fontWeight: '900', lineHeight: '1.2' }}>
                                        {score} <span style={{fontSize: '1rem', color: '#94a3b8', fontWeight: '600'}}>points</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{ color: '#64748b', fontStyle: 'italic', padding: '20px', background: 'white', borderRadius: '12px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                    No points collected yet. Start a Math Universe challenge to see your breakdown!
                </div>
            )}
        </div>
      </section>

      <section>
        <h2 className="section-title">🏆 Recently Completed ({activeTab.replace('this', '').replace(/([A-Z])/g, ' $1').trim()})</h2>
        {filteredCompletedItems.length > 0 ? (
            <div className="completed-list">
                {filteredCompletedItems.map(session => {
                const stars = getSessionRating(session.score, session.totalQuestions);
                const category = getCategoryDisplay(session.assessmentType); 
                return (
                    <div key={session.sessionId} className="completed-item">
                    <div className="completed-info">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 8px' }}>
                            {session.assessmentName} 
                            <span style={{ fontSize: '0.9rem', letterSpacing: '2px', background: 'rgba(251, 191, 36, 0.1)', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>{stars}</span>
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: category.bg, color: category.color, padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', border: `1px solid ${category.border}`, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>{category.icon}</span> {category.label}
                            </span>
                            <span style={{ color: '#94a3b8', fontSize: '13px' }}>•</span>
                            <span style={{ color: '#64748b', fontSize: '13px' }}>{new Date(session.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="completed-score">{session.score} / {session.totalQuestions}</div>
                    </div>
                );
                })}
            </div>
        ) : (
            <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                No completed assessments for this period. Time to start exploring!
            </div>
        )}
      </section>
    </div>
  );
}