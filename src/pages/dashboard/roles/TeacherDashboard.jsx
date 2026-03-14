import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import TeacherGroups from '../components/TeacherGroups';
import UploadExamPaper from '../components/UploadExamPaper';
import CreateAssessment from '../components/CreateAssessment';
import ClassProgressViewer from '../components/ClassProgressViewer';
import GradeSubmissionsManager from '../components/GradeSubmissionsManager';
import './RoleDashboard.css';
import axios from 'axios';
import CONFIG from '../../../Config';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({
    myClasses: 0,
    totalStudents: 0,
    assessmentsCreated: 0,
    pendingGrading: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherStats();
  }, [user]);

  const fetchTeacherStats = async () => {
    try {
      setLoading(true);
      const userId = user ? (user.id || user.email || 'GUEST_USER') : 'GUEST_USER';

      // Fetch teacher dashboard stats from backend
      const response = await axios.get(
        `${CONFIG.development.ADMIN_BASE_URL}/v1/teacher/dashboard/stats?userId=${encodeURIComponent(userId)}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching teacher stats:', error);
      // Use default stats if API fails
      setStats({
        myClasses: 0,
        totalStudents: 0,
        assessmentsCreated: 0,
        pendingGrading: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { label: 'My Classes', value: stats.myClasses, icon: '📚', color: '#48bb78' },
    { label: 'Total Students', value: stats.totalStudents, icon: '🎓', color: '#667eea' },
    { label: 'Assessments Created', value: stats.assessmentsCreated, icon: '📝', color: '#ed8936' },
    { label: 'Pending Grading', value: stats.pendingGrading, icon: '✏️', color: '#e53e3e' }
  ];

  const renderOverview = () => (
    <>
      <h2 className="dashboard-welcome">
        <span className="welcome-icon">👨‍🏫</span>
        Teacher Dashboard
      </h2>
      <p className="dashboard-description">Manage your classes, create assessments, and track student progress</p>

      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderTop: `4px solid ${stat.color}` }}>
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <div className="stat-value">{loading ? '...' : stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="action-grid">
          <button className="action-card" onClick={() => setActiveSection('upload-paper')}>
            <span className="action-icon">📄</span>
            <span>Upload Exam Paper</span>
          </button>
          <button className="action-card" onClick={() => setActiveSection('create-assessment')}>
            <span className="action-icon">➕</span>
            <span>Create Assessment</span>
          </button>
          <button className="action-card" onClick={() => setActiveSection('class-progress')}>
            <span className="action-icon">📊</span>
            <span>View Class Progress</span>
          </button>
          <button className="action-card" onClick={() => setActiveSection('grade-submissions')}>
            <span className="action-icon">✏️</span>
            <span>Grade Submissions</span>
          </button>
          <button className="action-card" onClick={() => setActiveSection('classes')}>
            <span className="action-icon">👥</span>
            <span>Manage Classes</span>
          </button>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="recent-activity-section" style={{ marginTop: '32px' }}>
        <h3>Recent Activity</h3>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <p style={{ color: '#64748b', textAlign: 'center' }}>
            Recent submissions and activities will appear here
          </p>
        </div>
      </div>
    </>
  );

  return (
    <div className="role-dashboard teacher-dashboard">
      {/* Navigation Tabs */}
      <div className="dashboard-nav-tabs">
        <button
          className={`nav-tab ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`nav-tab ${activeSection === 'upload-paper' ? 'active' : ''}`}
          onClick={() => setActiveSection('upload-paper')}
        >
          📄 Upload Paper
        </button>
        <button
          className={`nav-tab ${activeSection === 'create-assessment' ? 'active' : ''}`}
          onClick={() => setActiveSection('create-assessment')}
        >
          📝 Create Assessment
        </button>
        <button
          className={`nav-tab ${activeSection === 'class-progress' ? 'active' : ''}`}
          onClick={() => setActiveSection('class-progress')}
        >
          📊 Class Progress
        </button>
        <button
          className={`nav-tab ${activeSection === 'grade-submissions' ? 'active' : ''}`}
          onClick={() => setActiveSection('grade-submissions')}
        >
          ✏️ Grading
        </button>
        <button
          className={`nav-tab ${activeSection === 'classes' ? 'active' : ''}`}
          onClick={() => setActiveSection('classes')}
        >
          📚 My Classes
        </button>
      </div>

      {/* Content Sections */}
      {activeSection === 'overview' && renderOverview()}

      {activeSection === 'upload-paper' && (
        <>
          <button
            className="back-to-overview-btn"
            onClick={() => setActiveSection('overview')}
          >
            ← Back to Overview
          </button>
          <UploadExamPaper />
        </>
      )}

      {activeSection === 'create-assessment' && (
        <>
          <button
            className="back-to-overview-btn"
            onClick={() => setActiveSection('overview')}
          >
            ← Back to Overview
          </button>
          <CreateAssessment />
        </>
      )}

      {activeSection === 'class-progress' && (
        <>
          <button
            className="back-to-overview-btn"
            onClick={() => setActiveSection('overview')}
          >
            ← Back to Overview
          </button>
          <ClassProgressViewer />
        </>
      )}

      {activeSection === 'grade-submissions' && (
        <>
          <button
            className="back-to-overview-btn"
            onClick={() => setActiveSection('overview')}
          >
            ← Back to Overview
          </button>
          <GradeSubmissionsManager />
        </>
      )}

      {activeSection === 'classes' && (
        <>
          <button
            className="back-to-overview-btn"
            onClick={() => setActiveSection('overview')}
          >
            ← Back to Overview
          </button>
          <TeacherGroups />
        </>
      )}
    </div>
  );
};

export default TeacherDashboard;
