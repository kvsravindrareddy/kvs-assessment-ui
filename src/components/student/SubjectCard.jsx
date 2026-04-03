import React from 'react';
import './SubjectCard.css';

/**
 * Subject Performance Card Component
 *
 * Displays individual subject performance with grade, trend, and statistics
 */
const SubjectCard = ({ subject }) => {
  if (!subject) return null;

  const {
    subjectName,
    averageScore,
    letterGrade,
    totalExams,
    trendIndicator,
    weakTopics
  } = subject;

  // Color mapping for grades
  const getGradeColor = (grade) => {
    if (!grade) return '#64748b';
    const gradeUpper = grade.toUpperCase();
    if (gradeUpper.startsWith('A')) return '#10b981'; // Green
    if (gradeUpper.startsWith('B')) return '#3b82f6'; // Blue
    if (gradeUpper.startsWith('C')) return '#f59e0b'; // Orange
    if (gradeUpper.startsWith('D')) return '#fb923c'; // Light Orange
    return '#ef4444'; // Red for F
  };

  // Parse trend indicator
  const getTrendIcon = (trend) => {
    if (!trend) return '→';
    if (trend.includes('improving') || trend.includes('↗')) return '↗';
    if (trend.includes('declining') || trend.includes('↘')) return '↘';
    return '→';
  };

  const getTrendColor = (trend) => {
    if (!trend) return '#94a3b8';
    if (trend.includes('improving') || trend.includes('↗')) return '#10b981';
    if (trend.includes('declining') || trend.includes('↘')) return '#ef4444';
    return '#94a3b8';
  };

  const gradeColor = getGradeColor(letterGrade);
  const trendIcon = getTrendIcon(trendIndicator);
  const trendColor = getTrendColor(trendIndicator);

  return (
    <div className="subject-card">
      <div className="subject-card-header">
        <div className="subject-name">
          <h3>{subjectName || 'Subject'}</h3>
          <div className="subject-trend" style={{ color: trendColor }}>
            <span className="trend-icon">{trendIcon}</span>
            <span className="trend-text">{trendIndicator || 'stable'}</span>
          </div>
        </div>
        <div className="subject-grade" style={{ background: `${gradeColor}15`, color: gradeColor }}>
          {letterGrade || 'N/A'}
        </div>
      </div>

      <div className="subject-score-section">
        <div className="score-display">
          <div className="score-value" style={{ color: gradeColor }}>
            {averageScore ? `${averageScore.toFixed(1)}%` : 'N/A'}
          </div>
          <div className="score-label">Average Score</div>
        </div>
        <div className="score-meta">
          <div className="meta-item">
            <span className="meta-icon">📝</span>
            <span className="meta-text">{totalExams || 0} exams</span>
          </div>
        </div>
      </div>

      {weakTopics && weakTopics.length > 0 && (
        <div className="weak-topics-section">
          <div className="weak-topics-header">Areas to Improve</div>
          <div className="weak-topics-list">
            {weakTopics.slice(0, 3).map((topic) => (
              <span key={topic} className="weak-topic-tag">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {(!weakTopics || weakTopics.length === 0) && (
        <div className="no-weak-topics">
          <span className="success-icon">✨</span>
          <span>Great performance!</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(SubjectCard);
