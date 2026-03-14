import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import CONFIG from '../../Config';
import '../../css/ExamHistory.css';

const ExamHistory = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [error, setError] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
    const [studentFilter, setStudentFilter] = useState(searchParams.get('student') || '');
    const [viewMode, setViewMode] = useState('teacher'); // 'teacher' or 'student'

    const pageSize = 20;

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const userRole = localStorage.getItem('userRole');

        if (userRole === 'STUDENT') {
            setViewMode('student');
        }

        fetchSubmissions();
    }, [currentPage, statusFilter, studentFilter, viewMode]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const userId = localStorage.getItem('userId');
            const userRole = localStorage.getItem('userRole');

            let url = '';
            const params = {
                page: currentPage,
                size: pageSize
            };

            if (viewMode === 'student') {
                // Fetch submissions for logged-in student
                url = `${CONFIG.development.ADMIN_SUPPORT_BASE_URL}/admin-assessment/v1/exams/student/${userId}`;
            } else {
                // Fetch submissions for logged-in teacher
                if (statusFilter !== 'ALL') {
                    url = `${CONFIG.development.ADMIN_SUPPORT_BASE_URL}/admin-assessment/v1/exams/admin/submissions`;
                    params.status = statusFilter;
                } else {
                    url = `${CONFIG.development.ADMIN_SUPPORT_BASE_URL}/admin-assessment/v1/exams/teacher/${userId}`;
                }

                if (studentFilter) {
                    params.studentUserId = studentFilter;
                }
            }

            const response = await axios.get(url, { params });

            setSubmissions(response.data.submissions || []);
            setCurrentPage(response.data.currentPage || 0);
            setTotalPages(response.data.totalPages || 0);
            setTotalItems(response.data.totalItems || 0);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching submissions:', err);
            setError('Failed to fetch exam submissions');
            setLoading(false);
        }
    };

    const handleFilterChange = (filterType, value) => {
        if (filterType === 'status') {
            setStatusFilter(value);
            setSearchParams({ status: value });
        } else if (filterType === 'student') {
            setStudentFilter(value);
        }
        setCurrentPage(0); // Reset to first page
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'UPLOADED': '#f59e0b',
            'PROCESSING': '#3b82f6',
            'GRADED': '#10b981',
            'PENDING_REVIEW': '#f59e0b',
            'REVIEWED': '#10b981',
            'FAILED': '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    const getGradeColor = (percentage) => {
        if (percentage >= 90) return '#10b981';
        if (percentage >= 80) return '#3b82f6';
        if (percentage >= 70) return '#f59e0b';
        if (percentage >= 60) return '#f97316';
        return '#ef4444';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && submissions.length === 0) {
        return (
            <div className="exam-history-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading exam history...</p>
                </div>
            </div>
        );
    }

    if (error && submissions.length === 0) {
        return (
            <div className="exam-history-container">
                <div className="error-panel">
                    <h2>❌ Error</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-primary">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="exam-history-container">
            <div className="history-header">
                <div className="header-content">
                    <h1>📚 Exam History</h1>
                    <p className="header-subtitle">
                        {viewMode === 'student'
                            ? 'View your exam submissions and results'
                            : 'Manage and review student exam submissions'}
                    </p>
                </div>
                {viewMode === 'teacher' && (
                    <button
                        onClick={() => navigate('/exam-upload')}
                        className="btn-upload"
                    >
                        📄 Upload New Exam
                    </button>
                )}
            </div>

            {viewMode === 'teacher' && (
                <div className="filters-panel">
                    <div className="filter-group">
                        <label>Status:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="filter-select"
                        >
                            <option value="ALL">All Status</option>
                            <option value="UPLOADED">Uploaded</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="GRADED">Graded</option>
                            <option value="PENDING_REVIEW">Pending Review</option>
                            <option value="REVIEWED">Reviewed</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Student ID:</label>
                        <input
                            type="text"
                            placeholder="Filter by student ID..."
                            value={studentFilter}
                            onChange={(e) => handleFilterChange('student', e.target.value)}
                            className="filter-input"
                        />
                    </div>

                    <div className="filter-stats">
                        <span className="total-count">
                            Total: <strong>{totalItems}</strong> submission{totalItems !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            )}

            {submissions.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3>No exam submissions found</h3>
                    <p>
                        {viewMode === 'student'
                            ? 'You have no exam submissions yet.'
                            : 'No exam submissions match your current filters.'}
                    </p>
                    {viewMode === 'teacher' && (
                        <button
                            onClick={() => navigate('/exam-upload')}
                            className="btn-primary"
                        >
                            Upload First Exam
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="submissions-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Submission ID</th>
                                    {viewMode === 'teacher' && <th>Student</th>}
                                    <th>Assessment</th>
                                    <th>Grade</th>
                                    <th>Score</th>
                                    <th>Status</th>
                                    <th>Submitted</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((submission) => (
                                    <tr key={submission.submissionId} className="submission-row">
                                        <td className="submission-id">
                                            <span className="id-badge">{submission.submissionId}</span>
                                        </td>
                                        {viewMode === 'teacher' && (
                                            <td className="student-info">
                                                <div className="student-name">
                                                    {submission.studentName || submission.studentUserId}
                                                </div>
                                                <div className="student-email">
                                                    {submission.studentEmail}
                                                </div>
                                            </td>
                                        )}
                                        <td className="assessment-info">
                                            <div className="assessment-name">{submission.assessmentName}</div>
                                            <div className="grade-code">{submission.gradeCode}</div>
                                        </td>
                                        <td className="grade-display">
                                            {submission.percentageScore !== null && submission.percentageScore !== undefined ? (
                                                <div
                                                    className="grade-badge"
                                                    style={{
                                                        background: getGradeColor(submission.percentageScore),
                                                        color: 'white'
                                                    }}
                                                >
                                                    {submission.percentageScore.toFixed(1)}%
                                                </div>
                                            ) : (
                                                <span className="grade-pending">-</span>
                                            )}
                                        </td>
                                        <td className="score-display">
                                            {submission.totalScore !== null && submission.totalScore !== undefined ? (
                                                <span>
                                                    {submission.totalScore.toFixed(1)} / {submission.maxPossibleScore.toFixed(1)}
                                                </span>
                                            ) : (
                                                <span className="score-pending">-</span>
                                            )}
                                        </td>
                                        <td className="status-display">
                                            <span
                                                className="status-badge"
                                                style={{ background: getStatusColor(submission.status) }}
                                            >
                                                {submission.status}
                                            </span>
                                        </td>
                                        <td className="date-display">
                                            {formatDate(submission.createdAt)}
                                        </td>
                                        <td className="actions-display">
                                            <button
                                                onClick={() => navigate(`/exam-results/${submission.submissionId}`)}
                                                className="btn-view"
                                                disabled={submission.status === 'UPLOADED' || submission.status === 'PROCESSING'}
                                            >
                                                {submission.status === 'PENDING_REVIEW' ? '👨‍🏫 Review' : '👁️ View'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="btn-page"
                            >
                                ← Previous
                            </button>

                            <div className="page-info">
                                <span className="page-numbers">
                                    Page {currentPage + 1} of {totalPages}
                                </span>
                                <span className="items-info">
                                    Showing {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalItems)} of {totalItems}
                                </span>
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                                className="btn-page"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ExamHistory;
