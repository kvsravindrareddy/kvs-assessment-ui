import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useSubscription } from '../../../context/SubscriptionContext';
import axios from 'axios';
import './ParentDashboard.css';

const ParentDashboard = () => {
  const { user } = useAuth();
  const { getLimits, subscriptionTier, SUBSCRIPTION_TIERS } = useSubscription();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [linkMethod, setLinkMethod] = useState('credentials'); // 'credentials' or 'verification'
  const [studentUsername, setStudentUsername] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [linking, setLinking] = useState(false);

  // Get max children limit from subscription
  const limits = getLimits();
  const maxChildren = limits.maxStudents || 4; // Default to 4 for family plans
  const canAddMoreChildren = children.length < maxChildren;

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);

      // Fetch actual linked children from API
      const response = await axios.get(
        `http://localhost:9000/auth/parent-child/children/${user.id}`
      );

      const linkedChildren = response.data.children || [];

      // Map to expected format (add mock data for progress tracking later)
      const childrenWithProgress = linkedChildren.map(child => ({
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        username: child.username,
        email: child.email,
        grade: child.grade,
        profilePicture: child.profilePictureUrl,
        overallProgress: 0, // TODO: Get from assessment service
        assessmentsTaken: 0,
        averageScore: 0,
        timeSpent: 0,
        strongSubjects: [],
        needsImprovement: [],
        recentActivity: [],
        upcomingAssignments: [],
        attendance: {
          present: 0,
          absent: 0,
          total: 0,
          percentage: 0
        }
      }));

      setChildren(childrenWithProgress);
      if (childrenWithProgress.length > 0) {
        setSelectedChild(childrenWithProgress[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading children:', error);
      // If no children linked, set empty array
      setChildren([]);
      setLoading(false);
    }
  };

  const handleAddChildClick = () => {
    if (!canAddMoreChildren) {
      alert(`You've reached the maximum limit of ${maxChildren} children for your subscription plan. Please upgrade to add more children.`);
      return;
    }
    // Reset form
    setLinkMethod('credentials');
    setStudentUsername('');
    setStudentPassword('');
    setStudentEmail('');
    setVerificationCode('');
    setCodeSent(false);
    setShowAddChildModal(true);
  };

  const handleSendVerificationCode = async () => {
    if (!studentEmail) {
      alert('Please enter student email');
      return;
    }

    try {
      setLinking(true);
      const response = await axios.post('http://localhost:9000/auth/parent-child/send-verification-code', {
        parentId: user.id,
        studentEmail: studentEmail
      });

      setCodeSent(true);
      alert(response.data.message || 'Verification code sent to student email!');
    } catch (error) {
      console.error('Error sending verification code:', error);
      alert(error.response?.data?.message || 'Failed to send verification code');
    } finally {
      setLinking(false);
    }
  };

  const handleLinkByCredentials = async () => {
    if (!studentUsername || !studentPassword) {
      alert('Please enter both username and password');
      return;
    }

    try {
      setLinking(true);
      const response = await axios.post('http://localhost:9000/auth/parent-child/link-by-credentials', {
        parentId: user.id,
        studentUsername: studentUsername,
        studentPassword: studentPassword
      });

      alert('Student linked successfully!');
      setShowAddChildModal(false);
      loadChildren(); // Reload children list
    } catch (error) {
      console.error('Error linking student:', error);
      alert(error.response?.data?.message || 'Failed to link student. Please check credentials.');
    } finally {
      setLinking(false);
    }
  };

  const handleLinkByVerificationCode = async () => {
    if (!studentEmail || !verificationCode) {
      alert('Please enter both email and verification code');
      return;
    }

    try {
      setLinking(true);
      const response = await axios.post('http://localhost:9000/auth/parent-child/link-by-code', {
        parentId: user.id,
        studentEmail: studentEmail,
        verificationCode: verificationCode
      });

      alert('Student linked successfully!');
      setShowAddChildModal(false);
      loadChildren(); // Reload children list
    } catch (error) {
      console.error('Error linking student:', error);
      alert(error.response?.data?.message || 'Failed to link student. Please check the verification code.');
    } finally {
      setLinking(false);
    }
  };

  const renderChildSelector = () => (
    <div className="child-selector-section">
      <div className="selector-header">
        <h3>Your Children ({children.length}/{maxChildren})</h3>
        <button
          className={`add-child-btn ${!canAddMoreChildren ? 'disabled' : ''}`}
          onClick={handleAddChildClick}
          disabled={!canAddMoreChildren}
          title={!canAddMoreChildren ? `Maximum ${maxChildren} children allowed` : 'Add a child'}
        >
          ➕ Add Child
        </button>
      </div>

      <div className="children-cards">
        {children.map((child) => (
          <div
            key={child.id}
            className={`child-card ${selectedChild?.id === child.id ? 'active' : ''}`}
            onClick={() => setSelectedChild(child)}
          >
            <div className="child-avatar">
              {child.profilePicture ? (
                <img src={child.profilePicture} alt={child.firstName} />
              ) : (
                <div className="avatar-placeholder">
                  {child.firstName[0]}{child.lastName[0]}
                </div>
              )}
            </div>
            <div className="child-info">
              <h4>{child.firstName} {child.lastName}</h4>
              <p>Grade {child.grade}{child.section}</p>
            </div>
            <div className="child-progress-badge">
              <div className="progress-circle" style={{
                background: `conic-gradient(#48bb78 ${child.overallProgress * 3.6}deg, #e2e8f0 0deg)`
              }}>
                <div className="progress-inner">{child.overallProgress}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOverview = () => {
    if (!selectedChild) return null;

    return (
      <div className="overview-content">
        {/* Performance Stats */}
        <div className="performance-stats-grid">
          <div className="perf-stat-card">
            <div className="stat-icon" style={{ background: '#48bb7820', color: '#48bb78' }}>📊</div>
            <div className="stat-details">
              <div className="stat-value">{selectedChild.averageScore}%</div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>

          <div className="perf-stat-card">
            <div className="stat-icon" style={{ background: '#667eea20', color: '#667eea' }}>📝</div>
            <div className="stat-details">
              <div className="stat-value">{selectedChild.assessmentsTaken}</div>
              <div className="stat-label">Assessments Taken</div>
            </div>
          </div>

          <div className="perf-stat-card">
            <div className="stat-icon" style={{ background: '#ed893620', color: '#ed8936' }}>⏰</div>
            <div className="stat-details">
              <div className="stat-value">{selectedChild.timeSpent}h</div>
              <div className="stat-label">Time This Week</div>
            </div>
          </div>

          <div className="perf-stat-card">
            <div className="stat-icon" style={{ background: '#38a16920', color: '#38a169' }}>📅</div>
            <div className="stat-details">
              <div className="stat-value">{selectedChild.attendance.percentage}%</div>
              <div className="stat-label">Attendance Rate</div>
            </div>
          </div>
        </div>

        {/* Strengths and Improvements */}
        <div className="strengths-improvements-section">
          <div className="strength-card">
            <h3>💪 Strong Subjects</h3>
            <div className="subject-tags">
              {selectedChild.strongSubjects.map((subject, index) => (
                <span key={index} className="subject-tag success">{subject}</span>
              ))}
            </div>
          </div>

          <div className="improvement-card">
            <h3>📚 Needs Improvement</h3>
            <div className="subject-tags">
              {selectedChild.needsImprovement.map((subject, index) => (
                <span key={index} className="subject-tag warning">{subject}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity-section">
          <h3>🎯 Recent Activity</h3>
          <div className="activity-timeline">
            {selectedChild.recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-date">{new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-type">{activity.type}</span>
                    {activity.subject && <span className="activity-subject">• {activity.subject}</span>}
                  </div>
                  <div className="activity-title">{activity.title}</div>
                  {activity.score && (
                    <div className="activity-score" style={{
                      color: activity.score >= 80 ? '#48bb78' : activity.score >= 60 ? '#ed8936' : '#e53e3e'
                    }}>
                      Score: {activity.score}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div className="upcoming-assignments-section">
          <h3>📋 Upcoming Assignments</h3>
          {selectedChild.upcomingAssignments.length === 0 ? (
            <div className="no-assignments">
              <p>✅ No pending assignments</p>
            </div>
          ) : (
            <div className="assignments-list">
              {selectedChild.upcomingAssignments.map((assignment, index) => (
                <div key={index} className="assignment-item">
                  <div className="assignment-due-date">
                    <div className="due-icon">📅</div>
                    <div className="due-text">
                      <span className="due-label">Due</span>
                      <span className="due-value">{new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="assignment-details">
                    <div className="assignment-subject">{assignment.subject}</div>
                    <div className="assignment-title">{assignment.title}</div>
                  </div>
                  <div className={`assignment-status ${assignment.status}`}>
                    {assignment.status === 'pending' ? '⏳ Pending' : '✅ Completed'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProgress = () => {
    if (!selectedChild) return null;

    return (
      <div className="progress-content">
        <div className="progress-chart-placeholder">
          <h3>📈 Progress Over Time</h3>
          <p className="coming-soon-text">
            Interactive charts showing assessment scores, time spent, and subject-wise performance will be available soon!
          </p>
          <div className="chart-mockup">
            <div className="chart-bars">
              <div className="chart-bar" style={{ height: '70%' }}></div>
              <div className="chart-bar" style={{ height: '85%' }}></div>
              <div className="chart-bar" style={{ height: '75%' }}></div>
              <div className="chart-bar" style={{ height: '90%' }}></div>
              <div className="chart-bar" style={{ height: '88%' }}></div>
            </div>
            <div className="chart-labels">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
              <span>Week 5</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReports = () => {
    return (
      <div className="reports-content">
        <div className="reports-header">
          <h3>📊 Download Reports</h3>
          <p>Generate detailed reports for {selectedChild?.firstName}'s performance</p>
        </div>

        <div className="report-types-grid">
          <div className="report-type-card">
            <div className="report-icon">📄</div>
            <h4>Weekly Summary</h4>
            <p>Last 7 days performance overview</p>
            <button className="download-report-btn">Download PDF</button>
          </div>

          <div className="report-type-card">
            <div className="report-icon">📊</div>
            <h4>Monthly Report</h4>
            <p>Comprehensive monthly analysis</p>
            <button className="download-report-btn">Download PDF</button>
          </div>

          <div className="report-type-card">
            <div className="report-icon">📈</div>
            <h4>Subject-Wise Analysis</h4>
            <p>Detailed breakdown by subject</p>
            <button className="download-report-btn">Download PDF</button>
          </div>

          <div className="report-type-card">
            <div className="report-icon">🎯</div>
            <h4>Custom Report</h4>
            <p>Choose date range and subjects</p>
            <button className="download-report-btn">Customize & Download</button>
          </div>
        </div>
      </div>
    );
  };

  const renderMessages = () => {
    return (
      <div className="messages-content">
        <div className="messages-placeholder">
          <div className="placeholder-icon">💬</div>
          <h3>Teacher Communication</h3>
          <p>Message teachers, view announcements, and stay connected with your child's educators.</p>
          <button className="placeholder-btn">Coming Soon</button>
        </div>
      </div>
    );
  };

  const renderAddChildModal = () => (
    <div className="modal-overlay" onClick={() => setShowAddChildModal(false)}>
      <div className="add-child-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Child ({children.length + 1}/{maxChildren})</h2>
          <button className="modal-close" onClick={() => setShowAddChildModal(false)}>✕</button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Link your child's student account to your parent account
          </p>
          {children.length === maxChildren - 1 && (
            <div className="limit-warning">
              ⚠️ This will be your last child under the current plan. Upgrade to add more.
            </div>
          )}

          {/* Method Selection Tabs */}
          <div className="link-method-tabs">
            <button
              className={`tab-btn ${linkMethod === 'credentials' ? 'active' : ''}`}
              onClick={() => setLinkMethod('credentials')}
            >
              🔐 Use Login Credentials
            </button>
            <button
              className={`tab-btn ${linkMethod === 'verification' ? 'active' : ''}`}
              onClick={() => setLinkMethod('verification')}
            >
              📧 Use Verification Code
            </button>
          </div>

          {/* Credentials Method */}
          {linkMethod === 'credentials' && (
            <div className="link-form">
              <div className="form-group">
                <label>Student Username</label>
                <input
                  type="text"
                  placeholder="Enter student's username"
                  value={studentUsername}
                  onChange={(e) => setStudentUsername(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Student Password</label>
                <input
                  type="password"
                  placeholder="Enter student's password"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                />
              </div>

              <p className="helper-text">
                ℹ️ Enter your child's login credentials to link their account
              </p>
            </div>
          )}

          {/* Verification Code Method */}
          {linkMethod === 'verification' && (
            <div className="link-form">
              <div className="form-group">
                <label>Student Email</label>
                <input
                  type="email"
                  placeholder="student@school.com"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  disabled={codeSent}
                />
              </div>

              {codeSent && (
                <div className="form-group">
                  <label>Verification Code</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                  />
                </div>
              )}

              <p className="helper-text">
                {!codeSent
                  ? '📧 A verification code will be sent to your child\'s registered email'
                  : '✅ Code sent! Check the student\'s email inbox'}
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={() => setShowAddChildModal(false)}>
            Cancel
          </button>

          {linkMethod === 'credentials' && (
            <button
              className="btn-primary"
              onClick={handleLinkByCredentials}
              disabled={linking || !studentUsername || !studentPassword}
            >
              {linking ? 'Linking...' : 'Link Student'}
            </button>
          )}

          {linkMethod === 'verification' && !codeSent && (
            <button
              className="btn-primary"
              onClick={handleSendVerificationCode}
              disabled={linking || !studentEmail}
            >
              {linking ? 'Sending...' : 'Send Verification Code'}
            </button>
          )}

          {linkMethod === 'verification' && codeSent && (
            <button
              className="btn-primary"
              onClick={handleLinkByVerificationCode}
              disabled={linking || !verificationCode}
            >
              {linking ? 'Verifying...' : 'Verify & Link'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="parent-dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading children's data...</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="parent-dashboard-container">
        <div className="empty-state">
          <div className="empty-icon">👨‍👩‍👧‍👦</div>
          <h3>No Children Added Yet</h3>
          <p>Add your children's accounts to monitor their progress and performance</p>
          <p className="plan-limit-info">
            Your current plan allows up to {maxChildren} children
          </p>
          <button className="add-first-child-btn" onClick={handleAddChildClick}>
            Add Your First Child
          </button>
        </div>
        {showAddChildModal && renderAddChildModal()}
      </div>
    );
  }

  return (
    <div className="parent-dashboard-container">
      <div className="parent-dashboard-header">
        <h2>👨‍👩‍👧‍👦 Parent Dashboard</h2>
        <p>Monitor your children's learning journey and progress</p>
      </div>

      {renderChildSelector()}

      {selectedChild && (
        <div className="child-details-container">
          <div className="details-header">
            <div className="child-name-section">
              <div className="large-avatar">
                {selectedChild.profilePicture ? (
                  <img src={selectedChild.profilePicture} alt={selectedChild.firstName} />
                ) : (
                  <div className="avatar-placeholder-large">
                    {selectedChild.firstName[0]}{selectedChild.lastName[0]}
                  </div>
                )}
              </div>
              <div className="name-details">
                <h3>{selectedChild.firstName} {selectedChild.lastName}</h3>
                <p>Grade {selectedChild.grade}{selectedChild.section} • {selectedChild.overallProgress}% Overall Progress</p>
              </div>
            </div>
          </div>

          <div className="details-tabs">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button
              className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
              onClick={() => setActiveTab('progress')}
            >
              📈 Progress
            </button>
            <button
              className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              📄 Reports
            </button>
            <button
              className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              💬 Messages
            </button>
          </div>

          <div className="details-content">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'progress' && renderProgress()}
            {activeTab === 'reports' && renderReports()}
            {activeTab === 'messages' && renderMessages()}
          </div>
        </div>
      )}

      {showAddChildModal && renderAddChildModal()}
    </div>
  );
};

export default ParentDashboard;
