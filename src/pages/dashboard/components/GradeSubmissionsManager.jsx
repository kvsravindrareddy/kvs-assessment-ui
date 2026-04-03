import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import './GradeSubmissionsManager.css';

const GradeSubmissionsManager = () => {
  const { user } = useAuth();
  const [, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('PENDING_REVIEW');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [, setDetailsLoading] = useState(false);
  const [submissionDetails, setSubmissionDetails] = useState(null);

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const teacherId = user ? (user.id || user.email) : 'GUEST_USER';
      const response = await axios.get(
        `http://localhost:8083/api/admin-assessment/v1/exams/teacher/${encodeURIComponent(teacherId)}?status=${statusFilter}`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.data.success) {
        setSubmissions(response.data.submissions || []);
        setFilteredSubmissions(response.data.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
      setFilteredSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissionDetails = async (submissionId) => {
    setDetailsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8083/api/admin-assessment/v1/exams/${submissionId}`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.data.success) {
        setSubmissionDetails(response.data.submission);
        setSelectedSubmission(submissionId);
      }
    } catch (error) {
      console.error('Error fetching submission details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleApproveGrade = async (submissionId) => {
    try {
      const response = await axios.post(
        `http://localhost:8083/api/admin-assessment/v1/exams/${submissionId}/approve`,
        {},
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.data.success) {
        alert('Grade approved successfully!');
        fetchSubmissions();
        setSelectedSubmission(null);
      }
    } catch (error) {
      alert('Failed to approve grade: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateScore = async (submissionId, newScore, feedback) => {
    try {
      const response = await axios.put(
        `http://localhost:8083/api/admin-assessment/v1/exams/${submissionId}`,
        { totalScore: newScore, teacherFeedback: feedback },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.data.success) {
        alert('Score updated successfully!');
        fetchSubmissions();
        fetchSubmissionDetails(submissionId);
      }
    } catch (error) {
      alert('Failed to update score: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleBulkApprove = async () => {
    if (!window.confirm(`Approve all ${filteredSubmissions.length} submissions?`)) return;
    try {
      const submissionIds = filteredSubmissions.map(s => s.submissionId);
      const response = await axios.post(
        'http://localhost:8083/api/admin-assessment/v1/exams/bulk-approve',
        { submissionIds },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.data.success) {
        alert(`${response.data.approved} submissions approved successfully!`);
        fetchSubmissions();
      }
    } catch (error) {
      alert('Bulk approve failed: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="grade-submissions-container">
      <div className="submissions-header">
        <h2><span>✏️</span> Grade Submissions Management</h2>
        <p>Review and approve AI-graded exam submissions</p>
      </div>

      <div className="submissions-controls">
        <div className="control-group">
          <label>Filter by Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select">
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="APPROVED">Approved</option>
            <option value="ALL">All</option>
          </select>
        </div>
        <button onClick={handleBulkApprove} disabled={filteredSubmissions.length === 0 || statusFilter !== 'PENDING_REVIEW'} className="btn-bulk-approve">
          ✅ Bulk Approve ({filteredSubmissions.length})
        </button>
      </div>

      {loading && <div className="loading-spinner">Loading submissions...</div>}

      {!loading && (
        <div className="submissions-table-wrapper">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Submission ID</th>
                <th>Student</th>
                <th>Assessment</th>
                <th>Subject</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length === 0 ? (
                <tr><td colSpan="9" style={{textAlign:'center',color:'#94a3b8'}}>No submissions found</td></tr>
              ) : (
                filteredSubmissions.map((sub, index) => (
                  <tr key={index}>
                    <td><code>{sub.submissionId?.slice(0, 8)}</code></td>
                    <td>{sub.studentUserId}</td>
                    <td>{sub.assessmentName}</td>
                    <td><span className="subject-tag">{sub.subject}</span></td>
                    <td><strong>{sub.totalScore || 0}</strong> / {sub.maxPossibleScore || sub.totalQuestions}</td>
                    <td><span className={`percentage-badge ${sub.percentageScore >= 80 ? 'high' : sub.percentageScore >= 60 ? 'medium' : 'low'}`}>{sub.percentageScore?.toFixed(1)}%</span></td>
                    <td><span className={`status-badge status-${sub.status.toLowerCase()}`}>{sub.status}</span></td>
                    <td>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <button onClick={() => fetchSubmissionDetails(sub.submissionId)} className="btn-view">View</button>
                      {sub.status === 'PENDING_REVIEW' && (
                        <button onClick={() => handleApproveGrade(sub.submissionId)} className="btn-approve">Approve</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedSubmission && submissionDetails && (
        <div className="submission-detail-modal" onClick={() => setSelectedSubmission(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedSubmission(null)}>×</button>
            <h3>Submission Details</h3>

            <div className="detail-section">
              <h4>Basic Information</h4>
              <div className="info-grid">
                <div className="info-item"><span>Student:</span><strong>{submissionDetails.studentUserId}</strong></div>
                <div className="info-item"><span>Assessment:</span><strong>{submissionDetails.assessmentName}</strong></div>
                <div className="info-item"><span>Subject:</span><strong>{submissionDetails.subject}</strong></div>
                <div className="info-item"><span>Grade Level:</span><strong>{submissionDetails.gradeLevel}</strong></div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Scores</h4>
              <div className="score-grid">
                <div className="score-card"><span>Total Score</span><strong>{submissionDetails.totalScore || 0}</strong></div>
                <div className="score-card"><span>Max Score</span><strong>{submissionDetails.maxPossibleScore}</strong></div>
                <div className="score-card"><span>Percentage</span><strong>{submissionDetails.percentageScore?.toFixed(1)}%</strong></div>
              </div>
            </div>

            {submissionDetails.aiFeedback && (
              <div className="detail-section">
                <h4>AI Feedback</h4>
                <div className="feedback-box">{submissionDetails.aiFeedback}</div>
              </div>
            )}

            {submissionDetails.questionGradings && (
              <div className="detail-section">
                <h4>Question-wise Breakdown</h4>
                <div className="questions-list">
                  {submissionDetails.questionGradings.map((q, i) => (
                    <div key={i} className="question-item">
                      <div className="question-header">
                        <span>Question {i + 1}</span>
                        <span className={`points ${q.pointsAwarded >= q.maxPoints ? 'full' : 'partial'}`}>{q.pointsAwarded} / {q.maxPoints} pts</span>
                      </div>
                      {q.feedback && <div className="question-feedback">{q.feedback}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions">
              {submissionDetails.status === 'PENDING_REVIEW' && (
                <>
                  <button onClick={() => handleApproveGrade(submissionDetails.submissionId)} className="btn-approve-modal">✅ Approve Grade</button>
                  <button onClick={() => {
                    const newScore = prompt('Enter new total score:', submissionDetails.totalScore);
                    const feedback = prompt('Enter teacher feedback (optional):');
                    if (newScore !== null) {
                      handleUpdateScore(submissionDetails.submissionId, parseFloat(newScore), feedback || '');
                    }
                  }} className="btn-edit-modal">✏️ Edit Score</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeSubmissionsManager;
