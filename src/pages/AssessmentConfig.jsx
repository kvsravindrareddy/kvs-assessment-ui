import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/AssessmentConfig.css';

const AssessmentConfig = () => {
  const { gradeCode, subjectCode } = useParams();
  const navigate = useNavigate();
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [config, setConfig] = useState({
    numberOfQuestions: 0,
    complexity: 'MEDIUM'
  });

  useEffect(() => {
    fetchOptions();
  }, [gradeCode, subjectCode]);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:9002/v1/grades/${gradeCode}/subjects/${subjectCode}/options`
      );

      if (response.data.status === 'success') {
        const opts = response.data.options;
        setOptions(opts);
        setConfig({
          numberOfQuestions: opts.recommendedQuestions,
          complexity: 'MEDIUM'
        });
      } else {
        setError('Failed to load assessment options');
      }
    } catch (err) {
      console.error('Error fetching options:', err);
      setError('Failed to load assessment options. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = async () => {
    try {
      const userId = localStorage.getItem('userId') || '4';
      const email = localStorage.getItem('email') || 'student@test.com';

      // Call the existing load assessment API
      const loadResponse = await axios.post('http://localhost:9002/v1/assessment/load', {
        userId,
        email,
        category: gradeCode,
        type: subjectCode,
        complexity: config.complexity,
        numberOfQuestions: config.numberOfQuestions
      });

      if (loadResponse.data.assessmentId) {
        // Navigate to assessment page
        navigate(`/assessment/${loadResponse.data.assessmentId}`);
      } else {
        alert('Failed to start assessment. Please try again.');
      }
    } catch (err) {
      console.error('Error starting assessment:', err);
      alert('Failed to start assessment. Please try again.');
    }
  };

  const getComplexityDescription = (complexity) => {
    switch (complexity) {
      case 'EASY':
        return 'Perfect for beginners and practice';
      case 'MEDIUM':
        return 'Balanced difficulty for regular practice';
      case 'HARD':
        return 'Challenging questions for advanced learners';
      default:
        return '';
    }
  };

  const getComplexityIcon = (complexity) => {
    switch (complexity) {
      case 'EASY':
        return '🟢';
      case 'MEDIUM':
        return '🟡';
      case 'HARD':
        return '🔴';
      default:
        return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="config-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading options...</p>
        </div>
      </div>
    );
  }

  if (error || !options) {
    return (
      <div className="config-container">
        <div className="error-message">
          <h2>⚠️ Error</h2>
          <p>{error || 'Options not found'}</p>
          <button onClick={() => navigate(`/select-subject/${gradeCode}`)} className="btn-primary">
            Back to Subjects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="config-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span onClick={() => navigate('/select-grade')} className="breadcrumb-item">
          Grades
        </span>
        <span className="breadcrumb-separator">›</span>
        <span onClick={() => navigate(`/select-subject/${gradeCode}`)} className="breadcrumb-item">
          {options.gradeName}
        </span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">{options.subjectName}</span>
      </div>

      {/* Header */}
      <div className="config-header">
        <h1>Configure Your Assessment</h1>
        <p>{options.gradeName} - {options.subjectName}</p>
      </div>

      {/* Configuration Card */}
      <div className="config-card">
        {/* Number of Questions */}
        <div className="config-section">
          <label className="config-label">
            <span className="label-icon">📝</span>
            Number of Questions
          </label>
          <div className="question-selector">
            <div className="slider-container">
              <input
                type="range"
                min={options.minQuestions}
                max={options.maxQuestions}
                value={config.numberOfQuestions}
                onChange={(e) => setConfig({ ...config, numberOfQuestions: parseInt(e.target.value) })}
                className="question-slider"
              />
              <div className="slider-labels">
                <span>{options.minQuestions}</span>
                <span>{options.maxQuestions}</span>
              </div>
            </div>
            <div className="question-value">
              <span className="value-number">{config.numberOfQuestions}</span>
              <span className="value-label">Questions</span>
            </div>
          </div>
          <div className="recommendation">
            ⭐ Recommended: {options.recommendedQuestions} questions for {options.gradeName}
            {config.numberOfQuestions !== options.recommendedQuestions && (
              <button
                className="use-recommended"
                onClick={() => setConfig({ ...config, numberOfQuestions: options.recommendedQuestions })}
              >
                Use Recommended
              </button>
            )}
          </div>
        </div>

        {/* Complexity Selection */}
        <div className="config-section">
          <label className="config-label">
            <span className="label-icon">🎯</span>
            Difficulty Level
          </label>
          <div className="complexity-options">
            {['EASY', 'MEDIUM', 'HARD'].map((level) => (
              <div
                key={level}
                className={`complexity-option ${config.complexity === level ? 'selected' : ''}`}
                onClick={() => setConfig({ ...config, complexity: level })}
              >
                <div className="complexity-header">
                  <span className="complexity-icon">{getComplexityIcon(level)}</span>
                  <span className="complexity-name">{level}</span>
                </div>
                <p className="complexity-description">
                  {getComplexityDescription(level)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment Summary */}
        <div className="config-summary">
          <h3>Assessment Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Grade:</span>
              <span className="summary-value">{options.gradeName}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Subject:</span>
              <span className="summary-value">{options.subjectName}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Questions:</span>
              <span className="summary-value">{config.numberOfQuestions}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Difficulty:</span>
              <span className="summary-value">{config.complexity}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="config-actions">
          <button
            onClick={() => navigate(`/select-subject/${gradeCode}`)}
            className="btn-back"
          >
            ← Back
          </button>
          <button
            onClick={handleStartAssessment}
            className="btn-start"
          >
            Start Assessment →
          </button>
        </div>
      </div>

      {/* Tips Section */}
      <div className="tips-section">
        <h3>💡 Tips for Success</h3>
        <ul>
          <li>Find a quiet place to focus on your assessment</li>
          <li>Start with the recommended number of questions</li>
          <li>Choose a difficulty level that challenges you appropriately</li>
          <li>Take your time to read each question carefully</li>
        </ul>
      </div>
    </div>
  );
};

export default AssessmentConfig;
