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
    } else if (['MATH', 'SCIENCE', 'ENGLISH', 'SOCIAL_STUDIES', 'COMPUTER_SCIENCE', 'HINDI', 'SANSKRIT'].includes(session.assessmentType)) {
      // Subject-based assessments - navigate to subject assessments with resume data
      navigate(`/assessments/subjects?resumeId=${session.assessmentId}`);
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
                    {data.allTime.rating} <span style={{ fontSize: '1rem', fontWeight: '600', opacity: 0.8 }}>Rank</span>
                </h2>
                <p className="rating-message">{data.allTime.motivationalMessage}</p>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div className="rating-accuracy-box">
                    <div className="accuracy-value">{data.allTime.accuracyPercentage}%</div>
                    <div className="accuracy-label">Accuracy</div>
                </div>
                <div className="rating-accuracy-box">
                    <div className="accuracy-value">{data.allTime.totalScore}</div>
                    <div className="accuracy-label">Total Score</div>
                </div>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <h2 className="section-title" style={{ margin: 0 }}>📊 Your Performance</h2>
          <div className="time-tabs" style={{ margin: 0 }}>
            {['today', 'thisWeek', 'thisMonth', 'allTime'].map(tab => (
              <button key={tab} className={`time-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab.replace('this', '').replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          {/* Quick Stats */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Tests</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>{currentMetrics?.assessmentsCompleted || 0}</div>
            </div>
            <div style={{ width: '1px', background: '#e2e8f0' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Score</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>{currentMetrics?.totalScore || 0}</div>
            </div>
            <div style={{ width: '1px', background: '#e2e8f0' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Accuracy</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#3b82f6' }}>{currentMetrics?.accuracyPercentage || 0}%</div>
            </div>
          </div>

          {/* Subject Breakdown - Only if there are scores */}
          {Object.keys(categoryScores).length > 0 && (
            <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏆 Top Subjects</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(categoryScores).slice(0, 3).map(([subject, score]) => {
                  const cat = getCategoryDisplay(subject);
                  return (
                    <div key={subject} style={{ background: 'white', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px', border: `1px solid ${cat.border}` }}>
                      <div style={{ background: cat.bg, padding: '6px', borderRadius: '8px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '32px', width: '32px' }}>
                        {cat.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#475569', fontWeight: '600', fontSize: '0.85rem' }}>{cat.label}</div>
                      </div>
                      <div style={{ color: cat.color, fontSize: '1.3rem', fontWeight: '800' }}>{score}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {filteredCompletedItems.length > 0 && (
        <section>
          <h2 className="section-title">🏆 Recently Completed</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
              {filteredCompletedItems.slice(0, 6).map(session => {
              const stars = getSessionRating(session.score, session.totalQuestions);
              const category = getCategoryDisplay(session.assessmentType);
              const accuracy = session.totalQuestions > 0 ? Math.round((session.score / session.totalQuestions) * 100) : 0;
              return (
                  <div key={session.sessionId} style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', marginBottom: '4px', lineHeight: '1.3' }}>{session.assessmentName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(session.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      </div>
                      <div style={{ background: category.bg, color: category.color, padding: '4px 8px', borderRadius: '8px', fontSize: '1rem', border: `1px solid ${category.border}` }}>
                        {category.icon}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: accuracy >= 80 ? '#10b981' : accuracy >= 60 ? '#f59e0b' : '#64748b' }}>{session.score}</div>
                        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>/ {session.totalQuestions}</div>
                      </div>
                      <div style={{ fontSize: '0.85rem', background: accuracy >= 80 ? '#d1fae5' : accuracy >= 60 ? '#fef3c7' : '#f1f5f9', color: accuracy >= 80 ? '#065f46' : accuracy >= 60 ? '#92400e' : '#475569', padding: '4px 12px', borderRadius: '20px', fontWeight: '700' }}>
                        {accuracy}%
                      </div>
                    </div>
                  </div>
              );
              })}
          </div>
        </section>
      )}
    </div>
  );
}