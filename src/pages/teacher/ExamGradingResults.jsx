import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CONFIG from '../../Config';
import '../../css/ExamGradingResults.css';

const ExamGradingResults = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [polling, setPolling] = useState(false);
    const [result, setResult] = useState(null);
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchGradingStatus();
        const interval = setInterval(() => {
            if (status?.status === 'PROCESSING' || status?.status === 'UPLOADED') {
                fetchGradingStatus();
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [submissionId]);

    const fetchGradingStatus = async () => {
        try {
            const response = await axios.get(
                `${CONFIG.development.ADMIN_SUPPORT_BASE_URL}/admin-assessment/v1/exams/${submissionId}/status`
            );
            setStatus(response.data);

            // If grading is complete, fetch full results
            if (response.data.status !== 'PROCESSING' && response.data.status !== 'UPLOADED') {
                fetchGradingResults();
            } else {
                setPolling(true);
                setLoading(false);
            }
        } catch (err) {
            console.error('Error fetching status:', err);
            setError('Failed to fetch grading status');
            setLoading(false);
        }
    };

    const fetchGradingResults = async () => {
        try {
            const response = await axios.get(
                `${CONFIG.development.ADMIN_SUPPORT_BASE_URL}/admin-assessment/v1/exams/${submissionId}`
            );
            setResult(response.data);
            setLoading(false);
            setPolling(false);
        } catch (err) {
            console.error('Error fetching results:', err);
            setError('Failed to fetch grading results');
            setLoading(false);
        }
    };

    const handleReview = () => {
        navigate(`/exam-review/${submissionId}`);
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

    if (loading) {
        return (
            <div className="exam-results-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading grading results...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="exam-results-container">
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

    if (polling) {
        return (
            <div className="exam-results-container">
                <div className="processing-panel">
                    <div className="processing-animation">
                        <div className="ai-icon">🤖</div>
                        <div className="processing-spinner"></div>
                    </div>
                    <h2>AI is Grading Your Exam...</h2>
                    <p className="status-text">Status: {status?.status}</p>
                    <div className="progress-info">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${status?.progress || 0}%` }}></div>
                        </div>
                        <p>{status?.progress || 0}% Complete</p>
                    </div>
                    <p className="stage-text">Current Stage: {status?.currentStage}</p>
                    <p className="message-text">{status?.message}</p>

                    <div className="processing-steps">
                        <div className={`step ${status?.progress >= 20 ? 'completed' : ''}`}>
                            <span className="step-icon">📤</span>
                            <span>Uploaded</span>
                        </div>
                        <div className={`step ${status?.progress >= 50 ? 'completed' : ''}`}>
                            <span className="step-icon">🔄</span>
                            <span>Processing</span>
                        </div>
                        <div className={`step ${status?.progress >= 80 ? 'completed' : ''}`}>
                            <span className="step-icon">✅</span>
                            <span>Graded</span>
                        </div>
                        <div className={`step ${status?.progress >= 90 ? 'completed' : ''}`}>
                            <span className="step-icon">👨‍🏫</span>
                            <span>Review</span>
                        </div>
                    </div>

                    <p className="estimate-text">
                        ⏱️ Estimated time: ~{status?.estimatedSeconds || 30} seconds
                    </p>
                </div>
            </div>
        );
    }

    if (!result || !result.submission) {
        return null;
    }

    const { submission, questions } = result;

    return (
        <div className="exam-results-container">
            <div className="results-header">
                <button onClick={() => navigate('/exams')} className="btn-back">
                    ← Back
                </button>
                <h1>📊 Exam Grading Results</h1>
            </div>

            <div className="submission-summary">
                <div className="summary-card">
                    <div className="score-display">
                        <div className="score-circle" style={{ borderColor: getGradeColor(submission.percentageScore) }}>
                            <div className="score-value" style={{ color: getGradeColor(submission.percentageScore) }}>
                                {submission.percentageScore?.toFixed(1) || 0}%
                            </div>
                        </div>
                        <div className="score-details">
                            <div className="score-fraction">
                                {submission.totalScore?.toFixed(1) || 0} / {submission.maxPossibleScore?.toFixed(1) || 0}
                            </div>
                            <div className="score-label">Total Score</div>
                        </div>
                    </div>
                </div>

                <div className="info-cards">
                    <div className="info-card">
                        <div className="info-icon">👨‍🎓</div>
                        <div className="info-content">
                            <div className="info-label">Student</div>
                            <div className="info-value">{submission.studentName || submission.studentUserId}</div>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-icon">📝</div>
                        <div className="info-content">
                            <div className="info-label">Assessment</div>
                            <div className="info-value">{submission.assessmentName}</div>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-icon">📚</div>
                        <div className="info-content">
                            <div className="info-label">Grade Level</div>
                            <div className="info-value">{submission.gradeCode}</div>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-icon">🎯</div>
                        <div className="info-content">
                            <div className="info-label">Questions</div>
                            <div className="info-value">{submission.totalQuestionsGraded} graded</div>
                        </div>
                    </div>
                </div>

                <div className="status-bar">
                    <div className="status-badge" style={{ background: getStatusColor(submission.status) }}>
                        {submission.status}
                    </div>
                    {submission.status === 'PENDING_REVIEW' && (
                        <button onClick={handleReview} className="btn-review">
                            👨‍🏫 Review & Approve
                        </button>
                    )}
                </div>
            </div>

            <div className="questions-section">
                <h2>Question-by-Question Breakdown</h2>
                <div className="questions-list">
                    {questions && questions.map((question, index) => (
                        <div key={index} className="question-card">
                            <div className="question-header">
                                <span className="question-number">Q{question.questionNumber}</span>
                                <span className={`question-status ${question.isCorrect ? 'correct' : 'incorrect'}`}>
                                    {question.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                </span>
                                <span className="question-score">
                                    {question.scoreAwarded?.toFixed(1) || 0} / {question.maxScore?.toFixed(1) || 0}
                                </span>
                            </div>

                            <div className="question-body">
                                <div className="question-text">
                                    <strong>Question:</strong>
                                    <p>{question.questionText}</p>
                                </div>

                                <div className="answer-section">
                                    <div className="student-answer">
                                        <strong>Student Answer:</strong>
                                        <p>{question.studentAnswer || 'No answer provided'}</p>
                                    </div>

                                    <div className="correct-answer">
                                        <strong>Correct Answer:</strong>
                                        <p>{question.correctAnswer}</p>
                                    </div>
                                </div>

                                <div className="ai-feedback">
                                    <strong>AI Feedback:</strong>
                                    <p>{question.aiGradingRationale}</p>
                                    <div className="confidence-bar">
                                        <span>Confidence:</span>
                                        <div className="confidence-meter">
                                            <div
                                                className="confidence-fill"
                                                style={{ width: `${(question.aiConfidenceScore * 100).toFixed(0)}%` }}
                                            ></div>
                                        </div>
                                        <span>{(question.aiConfidenceScore * 100).toFixed(0)}%</span>
                                    </div>
                                </div>

                                {question.teacherFeedback && (
                                    <div className="teacher-feedback">
                                        <strong>Teacher Feedback:</strong>
                                        <p>{question.teacherFeedback}</p>
                                        {question.wasManuallyAdjusted && (
                                            <div className="adjusted-score">
                                                Adjusted Score: {question.teacherAdjustedScore}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="metadata-section">
                <h3>Processing Details</h3>
                <div className="metadata-grid">
                    <div className="metadata-item">
                        <span>Submission ID:</span>
                        <span>{submission.submissionId}</span>
                    </div>
                    <div className="metadata-item">
                        <span>AI Model:</span>
                        <span>{submission.aiModelUsed || 'GPT-4o'}</span>
                    </div>
                    <div className="metadata-item">
                        <span>Processing Time:</span>
                        <span>{(submission.processingDurationMs / 1000).toFixed(1)}s</span>
                    </div>
                    <div className="metadata-item">
                        <span>Submitted:</span>
                        <span>{new Date(submission.createdAt).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamGradingResults;
