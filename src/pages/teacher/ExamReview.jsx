import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CONFIG from '../../Config';
import '../../css/ExamReview.css';

const ExamReview = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);
    const [adjustments, setAdjustments] = useState({});
    const [reviewNotes, setReviewNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchGradingResults();
    }, [submissionId]);

    const fetchGradingResults = async () => {
        try {
            const response = await axios.get(
                `${CONFIG.development.ADMIN_SUPPORT_BASE_URL}/admin-assessment/v1/exams/${submissionId}`
            );
            setResult(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching results:', err);
            setError('Failed to fetch grading results');
            setLoading(false);
        }
    };

    const handleScoreChange = (questionNumber, newScore) => {
        setAdjustments({
            ...adjustments,
            [questionNumber]: {
                questionNumber,
                adjustedScore: parseFloat(newScore),
                teacherFeedback: adjustments[questionNumber]?.teacherFeedback || ''
            }
        });
    };

    const handleFeedbackChange = (questionNumber, feedback) => {
        setAdjustments({
            ...adjustments,
            [questionNumber]: {
                ...adjustments[questionNumber],
                questionNumber,
                teacherFeedback: feedback
            }
        });
    };

    const calculateNewTotal = () => {
        if (!result?.questions) return 0;

        let total = 0;
        result.questions.forEach(q => {
            const adjustment = adjustments[q.questionNumber];
            if (adjustment && adjustment.adjustedScore !== undefined) {
                total += adjustment.adjustedScore;
            } else {
                total += q.scoreAwarded || 0;
            }
        });
        return total;
    };

    const handleSubmitReview = async () => {
        setSubmitting(true);
        setError(null);

        try {
            const questionAdjustments = Object.values(adjustments).filter(
                adj => adj.adjustedScore !== undefined || adj.teacherFeedback
            );

            const reviewRequest = {
                reviewNotes,
                questionAdjustments
            };

            await axios.post(
                `${CONFIG.development.ADMIN_SUPPORT_BASE_URL}/admin-assessment/v1/exams/${submissionId}/review`,
                reviewRequest,
                {
                    headers: {
                        'X-Teacher-Id': localStorage.getItem('userId') || 'teacher123'
                    }
                }
            );

            alert('✅ Review submitted successfully!');
            navigate(`/exam-results/${submissionId}`);

        } catch (err) {
            console.error('Error submitting review:', err);
            setError(err.response?.data?.message || 'Failed to submit review');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="exam-review-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading exam for review...</p>
                </div>
            </div>
        );
    }

    if (error && !result) {
        return (
            <div className="exam-review-container">
                <div className="error-panel">
                    <h2>❌ Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    const { submission, questions } = result;
    const newTotal = calculateNewTotal();
    const newPercentage = submission.maxPossibleScore > 0
        ? (newTotal / submission.maxPossibleScore * 100).toFixed(1)
        : 0;

    return (
        <div className="exam-review-container">
            <div className="review-header">
                <button onClick={() => navigate(`/exam-results/${submissionId}`)} className="btn-back">
                    ← Back to Results
                </button>
                <h1>👨‍🏫 Review & Approve Grading</h1>
            </div>

            <div className="review-summary">
                <div className="score-comparison">
                    <div className="score-box original">
                        <div className="score-label">AI Grading</div>
                        <div className="score-value">{submission.percentageScore?.toFixed(1) || 0}%</div>
                        <div className="score-detail">
                            {submission.totalScore?.toFixed(1) || 0} / {submission.maxPossibleScore?.toFixed(1) || 0}
                        </div>
                    </div>

                    <div className="score-arrow">→</div>

                    <div className="score-box adjusted">
                        <div className="score-label">After Review</div>
                        <div className="score-value">{newPercentage}%</div>
                        <div className="score-detail">
                            {newTotal.toFixed(1)} / {submission.maxPossibleScore?.toFixed(1) || 0}
                        </div>
                    </div>
                </div>

                <div className="adjustment-info">
                    {Object.keys(adjustments).length > 0 ? (
                        <div className="adjusted-count">
                            ✏️ {Object.keys(adjustments).length} question(s) adjusted
                        </div>
                    ) : (
                        <div className="no-adjustments">
                            No adjustments made yet
                        </div>
                    )}
                </div>
            </div>

            <div className="review-questions">
                <h2>Review Each Question</h2>
                <p className="review-instructions">
                    Review the AI grading for each question. You can adjust scores and add feedback as needed.
                </p>

                <div className="questions-list">
                    {questions && questions.map((question, index) => {
                        const adjustment = adjustments[question.questionNumber] || {};
                        const finalScore = adjustment.adjustedScore !== undefined
                            ? adjustment.adjustedScore
                            : question.scoreAwarded;

                        return (
                            <div key={index} className="review-question-card">
                                <div className="question-header">
                                    <span className="question-number">Question {question.questionNumber}</span>
                                    <span className={`ai-status ${question.isCorrect ? 'correct' : 'incorrect'}`}>
                                        AI: {question.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                    </span>
                                </div>

                                <div className="question-content">
                                    <div className="question-text">
                                        <strong>Question:</strong>
                                        <p>{question.questionText}</p>
                                    </div>

                                    <div className="answer-grid">
                                        <div className="answer-box student">
                                            <strong>Student Answer:</strong>
                                            <p>{question.studentAnswer || 'No answer'}</p>
                                        </div>

                                        <div className="answer-box correct">
                                            <strong>Correct Answer:</strong>
                                            <p>{question.correctAnswer}</p>
                                        </div>
                                    </div>

                                    <div className="ai-rationale">
                                        <strong>AI Rationale:</strong>
                                        <p>{question.aiGradingRationale}</p>
                                        <div className="confidence">
                                            AI Confidence: {(question.aiConfidenceScore * 100).toFixed(0)}%
                                        </div>
                                    </div>

                                    <div className="score-adjustment">
                                        <div className="score-input-group">
                                            <label>Adjust Score:</label>
                                            <div className="score-inputs">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={question.maxScore}
                                                    step="0.1"
                                                    value={finalScore}
                                                    onChange={(e) => handleScoreChange(
                                                        question.questionNumber,
                                                        e.target.value
                                                    )}
                                                    className="score-input"
                                                />
                                                <span className="score-max">/ {question.maxScore}</span>
                                            </div>
                                            {adjustment.adjustedScore !== undefined && (
                                                <span className="adjusted-indicator">✏️ Adjusted</span>
                                            )}
                                        </div>

                                        <div className="feedback-input-group">
                                            <label>Teacher Feedback (optional):</label>
                                            <textarea
                                                value={adjustment.teacherFeedback || ''}
                                                onChange={(e) => handleFeedbackChange(
                                                    question.questionNumber,
                                                    e.target.value
                                                )}
                                                placeholder="Add feedback for this question..."
                                                rows="3"
                                                className="feedback-textarea"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="review-notes-section">
                <h3>Overall Review Notes</h3>
                <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add any overall comments about this exam grading..."
                    rows="4"
                    className="review-notes-textarea"
                />
            </div>

            {error && (
                <div className="error-message">
                    ❌ {error}
                </div>
            )}

            <div className="review-actions">
                <button
                    onClick={() => navigate(`/exam-results/${submissionId}`)}
                    className="btn-cancel"
                    disabled={submitting}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmitReview}
                    className="btn-submit"
                    disabled={submitting}
                >
                    {submitting ? 'Submitting...' : '✅ Approve & Submit Review'}
                </button>
            </div>
        </div>
    );
};

export default ExamReview;
