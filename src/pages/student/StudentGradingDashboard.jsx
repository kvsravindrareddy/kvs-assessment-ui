import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import studentGradingService from '../../services/studentGradingService';
import PerformanceLineChart from '../../components/charts/PerformanceLineChart';
import SubjectRadarChart from '../../components/charts/SubjectRadarChart';
import SubjectBarChart from '../../components/charts/SubjectBarChart';
import SubjectCard from '../../components/student/SubjectCard';
import './StudentGradingDashboard.css';

/**
 * Student Grading Dashboard Component
 *
 * Main dashboard for displaying student academic performance with grades,
 * charts, subject breakdown, and exam history
 */
const StudentGradingDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = user ? (user.id || user.email || 'GUEST_USER') : 'GUEST_USER';
      const response = await studentGradingService.getGradingDashboard(userId);

      if (response.success) {
        setDashboardData(response.dashboard);
      } else {
        setError('Failed to load grading dashboard');
      }
    } catch (err) {
      console.error('Error fetching grading dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grading-dashboard-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your grading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grading-dashboard-container">
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchDashboard} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="grading-dashboard-container">
        <div className="empty-state">
          <span className="empty-icon">📚</span>
          <p>No grading data available yet.</p>
          <p className="empty-subtitle">Complete some assessments to see your grades and performance!</p>
        </div>
      </div>
    );
  }

  const {
    profile,
    overallPerformance,
    subjectBreakdown,
    trends,
    recentExams
  } = dashboardData;

  return (
    <div className="grading-dashboard-container">
      {/* Back Navigation */}
      <button className="back-to-dashboard-btn" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">📊</span>
            Grading Dashboard
          </h1>
          <p className="dashboard-subtitle">Track your academic performance and grades</p>
        </div>

        {profile && (
          <div className="profile-badge">
            <div className="profile-info">
              <span className="profile-grade">Grade {profile.currentGrade}</span>
              {profile.currentClass && (
                <span className="profile-class">Section {profile.currentClass}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📈 Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'subjects' ? 'active' : ''}`}
          onClick={() => setActiveTab('subjects')}
        >
          📚 Subjects
        </button>
        <button
          className={`tab-button ${activeTab === 'exams' ? 'active' : ''}`}
          onClick={() => setActiveTab('exams')}
        >
          📝 Exam History
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          {/* Overall Performance Section */}
          {overallPerformance && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card overall-gpa">
                  <div className="stat-icon-wrapper" style={{ background: '#dbeafe' }}>
                    <span style={{ fontSize: '2rem' }}>🎯</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{overallPerformance.overallPercentage?.toFixed(1) || 'N/A'}%</div>
                    <div className="stat-label">Overall Average</div>
                  </div>
                </div>

                <div className="stat-card gpa">
                  <div className="stat-icon-wrapper" style={{ background: '#e0e7ff' }}>
                    <span style={{ fontSize: '2rem' }}>🏆</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{overallPerformance.gpa?.toFixed(2) || 'N/A'}</div>
                    <div className="stat-label">GPA (4.0 Scale)</div>
                  </div>
                </div>

                <div className="stat-card grade">
                  <div className="stat-icon-wrapper" style={{ background: '#ddd6fe' }}>
                    <span style={{ fontSize: '2rem' }}>⭐</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{overallPerformance.letterGrade || 'N/A'}</div>
                    <div className="stat-label">Overall Grade</div>
                  </div>
                </div>

                <div className="stat-card exams-count">
                  <div className="stat-icon-wrapper" style={{ background: '#fef3c7' }}>
                    <span style={{ fontSize: '2rem' }}>📝</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{overallPerformance.totalExams || 0}</div>
                    <div className="stat-label">Total Exams</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts Section */}
          {trends && (
            <div className="charts-section">
              <div className="charts-grid">
                {/* Line Chart */}
                {trends.weeklyScores && trends.weeklyScores.length > 0 && (
                  <div className="chart-wrapper full-width">
                    <PerformanceLineChart
                      data={trends.weeklyScores}
                      title="Performance Over Time (Last 12 Weeks)"
                    />
                  </div>
                )}

                {/* Radar Chart */}
                {trends.subjectRadar && trends.subjectRadar.length > 0 && (
                  <div className="chart-wrapper">
                    <SubjectRadarChart
                      data={trends.subjectRadar}
                      title="Subject Comparison"
                    />
                  </div>
                )}

                {/* Bar Chart */}
                {subjectBreakdown && subjectBreakdown.length > 0 && (
                  <div className="chart-wrapper">
                    <SubjectBarChart
                      data={subjectBreakdown}
                      title="Subject Performance"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div className="tab-content">
          {subjectBreakdown && subjectBreakdown.length > 0 ? (
            <div className="subjects-grid">
              {subjectBreakdown.map((subject, index) => (
                <SubjectCard
                  key={index}
                  subject={{
                    subjectName: subject.subject,
                    averageScore: subject.averageScore,
                    letterGrade: subject.letterGrade,
                    totalExams: subject.totalExams,
                    trendIndicator: subject.trendIndicator,
                    weakTopics: subject.weakTopics
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📚</span>
              <p>No subject data available yet.</p>
              <p className="empty-subtitle">Complete assessments to see your subject breakdown!</p>
            </div>
          )}
        </div>
      )}

      {/* Exams Tab */}
      {activeTab === 'exams' && (
        <div className="tab-content">
          {recentExams && recentExams.length > 0 ? (
            <div className="exams-table-wrapper">
              <table className="exams-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Assessment</th>
                    <th>Subject</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Grade</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExams.map((exam, index) => {
                    const percentage = exam.percentageScore || 0;
                    const gradeColor = percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444';

                    return (
                      <tr key={index}>
                        <td className="exam-date">
                          {exam.submittedAt ? new Date(exam.submittedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'N/A'}
                        </td>
                        <td className="exam-name">{exam.assessmentName || 'Unnamed Assessment'}</td>
                        <td className="exam-subject">
                          <span className="subject-tag">{exam.subject || 'General'}</span>
                        </td>
                        <td className="exam-score">
                          <strong>{exam.totalScore || 0}</strong> / {exam.maxPossibleScore || exam.totalQuestions || 0}
                        </td>
                        <td className="exam-percentage">
                          <span className="percentage-badge" style={{ background: `${gradeColor}15`, color: gradeColor }}>
                            {percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="exam-grade">
                          <span className="grade-badge" style={{ background: `${gradeColor}15`, color: gradeColor }}>
                            {exam.letterGrade || calculateLetterGrade(percentage)}
                          </span>
                        </td>
                        <td className="exam-status">
                          <span className="status-badge reviewed">{exam.status || 'REVIEWED'}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📝</span>
              <p>No exam history available yet.</p>
              <p className="empty-subtitle">Your graded exams will appear here!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to calculate letter grade from percentage
const calculateLetterGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

export default StudentGradingDashboard;
