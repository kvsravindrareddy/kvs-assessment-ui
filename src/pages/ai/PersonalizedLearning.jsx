import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import CONFIG from '../../Config';
import './PersonalizedLearning.css';

const PersonalizedLearning = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null);
  const [emotionData, setEmotionData] = useState(null);
  const [selectedEmotion, setSelectedEmotion] = useState(null);

  const emotions = [
    { id: 'happy', emoji: '😊', label: 'Happy', color: '#10b981' },
    { id: 'excited', emoji: '🤩', label: 'Excited', color: '#f59e0b' },
    { id: 'curious', emoji: '🤔', label: 'Curious', color: '#3b82f6' },
    { id: 'confused', emoji: '😕', label: 'Confused', color: '#f97316' },
    { id: 'frustrated', emoji: '😤', label: 'Frustrated', color: '#ef4444' },
    { id: 'tired', emoji: '😴', label: 'Tired', color: '#8b5cf6' },
    { id: 'motivated', emoji: '💪', label: 'Motivated', color: '#ec4899' },
    { id: 'neutral', emoji: '😐', label: 'Okay', color: '#6b7280' }
  ];

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      const userId = user?.id || user?.email || 'GUEST_USER';
      const response = await axios.get(
        `${CONFIG.development.ADMIN_BASE_URL}/v1/ai-learning/recommendations`,
        { params: { userId } }
      );
      setRecommendations(response.data);
      setEmotionData(response.data.emotionAnalysis);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setLoading(false);
    }
  };

  const handleEmotionSelect = async (emotion) => {
    setSelectedEmotion(emotion);
    try {
      const userId = user?.id || user?.email || 'GUEST_USER';
      await axios.post(
        `${CONFIG.development.ADMIN_BASE_URL}/v1/ai-learning/emotion`,
        {
          userId,
          emotion: emotion.id,
          timestamp: new Date().toISOString(),
          context: 'learning_session'
        }
      );

      // Show feedback
      setTimeout(() => {
        setSelectedEmotion(null);
        fetchRecommendations(); // Refresh recommendations based on emotion
      }, 2000);
    } catch (error) {
      console.error('Error recording emotion:', error);
    }
  };

  if (loading) {
    return (
      <div className="personalized-learning-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Analyzing your learning journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="personalized-learning-container">
      {/* Emotion Check-in */}
      <div className="emotion-checkin-section">
        <h2>😊 How are you feeling today?</h2>
        <p className="subtitle">Help us personalize your learning experience</p>

        <div className="emotions-grid">
          {emotions.map((emotion) => (
            <button
              key={emotion.id}
              className={`emotion-button ${selectedEmotion?.id === emotion.id ? 'selected' : ''}`}
              onClick={() => handleEmotionSelect(emotion)}
              style={{ borderColor: emotion.color }}
            >
              <span className="emotion-emoji">{emotion.emoji}</span>
              <span className="emotion-label">{emotion.label}</span>
              {selectedEmotion?.id === emotion.id && (
                <div className="emotion-ripple" style={{ background: emotion.color }}></div>
              )}
            </button>
          ))}
        </div>

        {selectedEmotion && (
          <div className="emotion-feedback" style={{ background: `${selectedEmotion.color}20` }}>
            <p>✨ Thanks! We've adjusted your recommendations based on how you're feeling.</p>
          </div>
        )}
      </div>

      {/* Emotion Analytics */}
      {emotionData && (
        <div className="emotion-analytics-section">
          <h3>📊 Your Emotional Learning Pattern</h3>
          <div className="emotion-chart">
            {emotionData.recentEmotions?.map((item, index) => {
              const emotionInfo = emotions.find(e => e.id === item.emotion);
              return (
                <div key={index} className="emotion-bar-container">
                  <span className="emotion-bar-emoji">{emotionInfo?.emoji}</span>
                  <div className="emotion-bar-wrapper">
                    <div
                      className="emotion-bar"
                      style={{
                        width: `${item.percentage}%`,
                        background: emotionInfo?.color
                      }}
                    ></div>
                  </div>
                  <span className="emotion-bar-value">{item.percentage}%</span>
                </div>
              );
            })}
          </div>

          <div className="insights">
            <p><strong>💡 Insight:</strong> {emotionData.insight}</p>
          </div>
        </div>
      )}

      {/* Personalized Recommendations */}
      {recommendations && (
        <>
          {/* Based on Performance */}
          <div className="recommendations-section">
            <h3>🎯 Recommended Based on Your Performance</h3>
            <div className="recommendations-grid">
              {recommendations.performanceBased?.map((rec, index) => (
                <div key={index} className="recommendation-card performance">
                  <div className="rec-header">
                    <span className="rec-icon">{rec.icon}</span>
                    <span className="rec-badge">{rec.difficulty}</span>
                  </div>
                  <h4>{rec.title}</h4>
                  <p className="rec-reason">{rec.reason}</p>
                  <div className="rec-meta">
                    <span>📚 {rec.subject}</span>
                    <span>⏱️ {rec.estimatedTime}</span>
                  </div>
                  <button className="start-learning-btn" style={{ background: rec.color }}>
                    Start Learning
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Based on Interests */}
          <div className="recommendations-section">
            <h3>❤️ You Might Like These</h3>
            <div className="recommendations-grid">
              {recommendations.interestBased?.map((rec, index) => (
                <div key={index} className="recommendation-card interest">
                  <div className="rec-header">
                    <span className="rec-icon">{rec.icon}</span>
                    <span className="rec-score">Match: {rec.matchScore}%</span>
                  </div>
                  <h4>{rec.title}</h4>
                  <p className="rec-description">{rec.description}</p>
                  <div className="rec-tags">
                    {rec.tags?.map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    ))}
                  </div>
                  <button className="start-learning-btn">Explore</button>
                </div>
              ))}
            </div>
          </div>

          {/* Based on Peers */}
          <div className="recommendations-section">
            <h3>🌟 Popular with Students Like You</h3>
            <div className="recommendations-grid">
              {recommendations.peerBased?.map((rec, index) => (
                <div key={index} className="recommendation-card peer">
                  <div className="rec-header">
                    <span className="rec-icon">{rec.icon}</span>
                    <div className="peer-stats">
                      <span>👥 {rec.peersCompleted} students</span>
                      <span>⭐ {rec.averageRating}/5</span>
                    </div>
                  </div>
                  <h4>{rec.title}</h4>
                  <p className="rec-reason">{rec.whyPopular}</p>
                  <div className="success-rate">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${rec.successRate}%` }}></div>
                    </div>
                    <span>{rec.successRate}% success rate</span>
                  </div>
                  <button className="start-learning-btn">Join Them</button>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Streak & Motivation */}
          <div className="motivation-section">
            <div className="streak-card">
              <h3>🔥 Learning Streak</h3>
              <div className="streak-count">{recommendations.streak || 0} days</div>
              <p>Keep it up! You're on a roll!</p>
            </div>

            <div className="achievement-card">
              <h3>🏆 Recent Achievement</h3>
              <div className="achievement-icon">{recommendations.recentAchievement?.icon}</div>
              <h4>{recommendations.recentAchievement?.title}</h4>
              <p>{recommendations.recentAchievement?.description}</p>
            </div>

            <div className="next-milestone-card">
              <h3>🎖️ Next Milestone</h3>
              <p>{recommendations.nextMilestone?.title}</p>
              <div className="milestone-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${recommendations.nextMilestone?.progress}%` }}
                  ></div>
                </div>
                <span>{recommendations.nextMilestone?.progress}% complete</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PersonalizedLearning;
