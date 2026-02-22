import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/AnswerKey.css';

const AnswerKey = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [answerKey, setAnswerKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, correct, incorrect

  useEffect(() => {
    fetchAnswerKey();
  }, [assessmentId]);

  const fetchAnswerKey = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId') || '4';
      const isTeacher = localStorage.getItem('isTeacher') === 'true';

      const response = await axios.get(
        `http://localhost:9002/v1/assessment/${assessmentId}/answer-key`,
        {
          params: { userId, isTeacher }
        }
      );

      if (response.data.status === 'success') {
        setAnswerKey(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load answer key');
      }
    } catch (err) {
      console.error('Error fetching answer key:', err);
      setError(err.response?.data?.message || 'Failed to load answer key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredQuestions = () => {
    if (!answerKey) return [];

    switch (filter) {
      case 'correct':
        return answerKey.answerKey.filter(q => q.isCorrect);
      case 'incorrect':
        return answerKey.answerKey.filter(q => !q.isCorrect);
      default:
        return answerKey.answerKey;
    }
  };

  const calculatePercentage = () => {
    if (!answerKey) return 0;
    return ((answerKey.correctAnswers / answerKey.totalQuestions) * 100).toFixed(1);
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return '#4caf50';
    if (percentage >= 75) return '#8bc34a';
    if (percentage >= 60) return '#ffc107';
    if (percentage >= 50) return '#ff9800';
    return '#f44336';
  };

  if (loading) {
    return (
      <div className="answer-key-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="answer-key-container">
        <div className="error-message">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!answerKey) {
    return null;
  }

  const percentage = calculatePercentage();
  const filteredQuestions = getFilteredQuestions();

  return (
    <div className="answer-key-container">
      {/* Header */}
      <div className="answer-key-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>
        <h1>Assessment Results</h1>
      </div>

      {/* Summary Card */}
      <div className="results-summary">
        <div className="summary-header">
          <h2>
            {answerKey.grade} - {answerKey.subject}
          </h2>
          <span className="complexity-badge">{answerKey.complexity}</span>
        </div>

        <div className="score-display">
          <div className="score-circle" style={{ borderColor: getGradeColor(percentage) }}>
            <div className="score-percentage" style={{ color: getGradeColor(percentage) }}>
              {percentage}%
            </div>
            <div className="score-fraction">
              {answerKey.correctAnswers} / {answerKey.totalQuestions}
            </div>
          </div>

          <div className="score-breakdown">
            <div className="score-item correct">
              <span className="icon">✓</span>
              <span className="label">Correct</span>
              <span className="value">{answerKey.correctAnswers}</span>
            </div>
            <div className="score-item incorrect">
              <span className="icon">✗</span>
              <span className="label">Incorrect</span>
              <span className="value">{answerKey.totalQuestions - answerKey.correctAnswers}</span>
            </div>
            <div className="score-item total">
              <span className="icon">📊</span>
              <span className="label">Total</span>
              <span className="value">{answerKey.totalQuestions}</span>
            </div>
          </div>
        </div>

        <div className="submitted-time">
          Submitted: {new Date(answerKey.submittedAt).toLocaleString()}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Questions ({answerKey.answerKey.length})
        </button>
        <button
          className={filter === 'correct' ? 'active' : ''}
          onClick={() => setFilter('correct')}
        >
          Correct ({answerKey.correctAnswers})
        </button>
        <button
          className={filter === 'incorrect' ? 'active' : ''}
          onClick={() => setFilter('incorrect')}
        >
          Incorrect ({answerKey.totalQuestions - answerKey.correctAnswers})
        </button>
      </div>

      {/* Questions List */}
      <div className="questions-list">
        {filteredQuestions.map((question) => (
          <div
            key={question.questionIndex}
            className={`question-card ${question.isCorrect ? 'correct' : 'incorrect'}`}
          >
            <div className="question-header">
              <span className="question-number">Question {question.questionIndex + 1}</span>
              <span className={`result-badge ${question.isCorrect ? 'correct' : 'incorrect'}`}>
                {question.isCorrect ? '✓ Correct' : '✗ Incorrect'}
              </span>
            </div>

            <div className="question-text">
              {question.questionText || `Question ID: ${question.questionId}`}
            </div>

            <div className="answers-section">
              <div className="answer-row your-answer">
                <span className="answer-label">Your Answer:</span>
                <span className="answer-value">
                  {question.studentAnswer?.join(', ') || 'No answer provided'}
                </span>
              </div>

              {!question.isCorrect && (
                <div className="answer-row correct-answer">
                  <span className="answer-label">Correct Answer:</span>
                  <span className="answer-value">
                    {question.correctAnswer?.join(', ')}
                  </span>
                </div>
              )}

              {question.remarks && (
                <div className="remarks">
                  <span className="remarks-label">Note:</span>
                  <span className="remarks-text">{question.remarks}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="no-results">
            <p>No questions match the selected filter.</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={() => window.print()} className="btn-secondary">
          🖨️ Print Results
        </button>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AnswerKey;
