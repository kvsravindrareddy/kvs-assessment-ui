import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CONFIG from '../../Config';
import { useGrades } from '../../hooks/useGrades';
import './MathByGrade.css';

export default function MathByGrade() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeAssessmentId = searchParams.get('resumeId');
  const { grades: orderedGrades, loading: gradesLoading } = useGrades();

  const currentUserId = user ? (user.id || user.email || 'GUEST_USER') : 'GUEST_USER';

  const [gradeData, setGradeData] = useState({});
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  // Assessment configuration
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [complexity, setComplexity] = useState('SIMPLE');

  const [assessmentId, setAssessmentId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(1);

  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Timer state
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Bookmarks
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());

  const adminConfigURL = `${CONFIG.development.ADMIN_BASE_URL}/admin-assessment/v1/app-config/subject-types`;
  const loadAssessmentURL = `${CONFIG.development.GATEWAY_URL}/v1/assessment/questions/load`;
  const startAssessmentURL = `${CONFIG.development.GATEWAY_URL}/v1/assessment/questions/start`;
  const submitAnswerURL = `${CONFIG.development.GATEWAY_URL}/v1/assessment/questions/submit-answer`;

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle bookmark
  const toggleBookmark = () => {
    setBookmarkedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex);
      } else {
        newSet.add(questionIndex);
      }
      return newSet;
    });
  };

  useEffect(() => {
    fetch(adminConfigURL)
      .then(res => res.json())
      .then(data => {
        // Filter to show only MATH subjects
        const mathOnlyData = {};
        Object.keys(data).forEach(grade => {
          const mathSubjects = data[grade].filter(subject =>
            subject.toUpperCase().includes('MATH')
          );
          if (mathSubjects.length > 0) {
            mathOnlyData[grade] = mathSubjects;
          }
        });
        setGradeData(mathOnlyData);
      })
      .catch(err => console.error('Failed to load grades:', err));
  }, [adminConfigURL]);

  // Set default grade when grades are loaded
  useEffect(() => {
    if (orderedGrades.length > 0 && !selectedGrade) {
      setSelectedGrade(orderedGrades[6] || orderedGrades[0]); // Default to grade V or first grade
    }
  }, [orderedGrades, selectedGrade]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && !completed) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, completed]);

  // Handle resume on mount
  useEffect(() => {
    if (resumeAssessmentId && currentUserId) {
      console.log('Resuming assessment:', resumeAssessmentId);
      resumeAssessment(resumeAssessmentId);
    }
  }, [resumeAssessmentId, currentUserId]);

  const resumeAssessment = async (assId) => {
    setLoading(true);
    console.log('Resume function called with ID:', assId);

    try {
      const token = localStorage.getItem('token');

      // Fetch session info from dashboard API to get lastAttemptedIndex and score
      const dashboardURL = `${CONFIG.development.ADMIN_BASE_URL}/v1/assessment/dashboard/student?userId=${encodeURIComponent(currentUserId)}`;
      console.log('Fetching dashboard from:', dashboardURL);

      const dashboardRes = await axios.get(dashboardURL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Dashboard response:', dashboardRes.data);

      // Find the session in continueLearning
      const session = dashboardRes.data.continueLearning?.find(s => s.assessmentId === assId);
      console.log('Found session:', session);

      if (!session) {
        console.error('Session not found in continueLearning list');
        setErrorMessage('Assessment session not found. Please start a new assessment.');
        setLoading(false);
        return;
      }

      // Resume from next question after lastAttemptedIndex
      const nextQuestionIndex = (session.lastAttemptedIndex || 0) + 1;
      console.log('Resuming from question index:', nextQuestionIndex);

      // Fetch the next question
      const res = await axios.post(startAssessmentURL, {
        userId: currentUserId,
        email: user?.email || '',
        assessmentId: assId,
        questionIndex: nextQuestionIndex
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Question fetch response:', res.data);

      // Extract question data
      const questionData = res.data?.question?.question || res.data;
      console.log('Extracted question data:', questionData);

      setAssessmentId(assId);
      setTotalQuestions(session.totalQuestions);
      setCurrentQuestion(questionData);
      setQuestionIndex(nextQuestionIndex);
      setScore(session.score || 0);
      setSelectedAnswer('');
      setCompleted(false);

      // Set grade from session if available
      if (session.assessmentName) {
        // Try to extract grade from assessment name (e.g., "MATH - Grade GRADE_5 (SIMPLE)")
        const gradeMatch = session.assessmentName.match(/Grade\s+(\S+)/);
        if (gradeMatch && gradeMatch[1]) {
          setSelectedGrade(gradeMatch[1].replace(/[()]/g, ''));
        }
      }

      // Resume timer
      setIsTimerRunning(true);

      console.log('Resume successful!');

    } catch (err) {
      console.error('Error resuming assessment:', err);
      setErrorMessage('Unable to resume assessment. Please start a new one.');
    } finally {
      setLoading(false);
    }
  };

  const openConfigDialog = () => {
    if (!selectedGrade) return;
    setShowConfigDialog(true);
    setErrorMessage(''); // Clear any previous errors
    // Reset configuration
    setNumberOfQuestions(10);
    setComplexity('SIMPLE');
  };

  const startAssessment = async () => {
    if (!selectedGrade) return;

    // Get the first (and possibly only) math subject for this grade
    const mathSubject = gradeData[selectedGrade]?.[0];
    if (!mathSubject) {
      setErrorMessage('No math subjects available for this grade');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setShowConfigDialog(false);

    try {
      const token = localStorage.getItem('token');

      // Step 1: LOAD the assessment with user-selected configuration
      const loadRes = await axios.post(loadAssessmentURL, {
        userId: currentUserId,
        email: user?.email || '',
        category: selectedGrade,
        type: mathSubject,
        complexity: complexity,
        numberOfQuestions: numberOfQuestions
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const newAssessmentId = loadRes.data.assessmentId;
      const totalQs = loadRes.data.numberOfQuestions || numberOfQuestions;

      setAssessmentId(newAssessmentId);
      setTotalQuestions(totalQs);

      // Step 2: START by fetching Question #1
      await fetchQuestion(newAssessmentId, 1);

      setScore(0);
      setSelectedAnswer('');
      setCompleted(false);

      // Start timer
      setTimeElapsed(0);
      setIsTimerRunning(true);
      setBookmarkedQuestions(new Set());

    } catch (err) {
      console.error('Error starting math assessment:', err);
      const errorMsg = err.response?.data?.message || 'Could not load questions. Ensure the Admin has loaded questions for Math & this Grade.';
      setErrorMessage(errorMsg);
      setShowConfigDialog(true); // Stay on config dialog to show error
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestion = async (assId, index) => {
      const token = localStorage.getItem('token');
      const res = await axios.post(startAssessmentURL, {
          userId: currentUserId,
          email: user?.email || '',
          assessmentId: assId,
          questionIndex: index
      }, {
          headers: { 'Authorization': `Bearer ${token}` }
      });

      // Extract the nested question object: res.data.question.question
      const questionData = res.data?.question?.question || res.data;
      console.log('Question data:', questionData);

      setCurrentQuestion(questionData);
      setQuestionIndex(index);
  };

  const submitAnswer = async () => {
    if (!assessmentId || !currentQuestion || !selectedAnswer) return;

    const isLastQuestion = questionIndex === totalQuestions;

    try {
      const token = localStorage.getItem('token');

      const payload = {
        userId: currentUserId,
        email: user?.email || '',
        assessmentId: assessmentId,
        questionIndex: questionIndex,
        userAnswer: [selectedAnswer]
      };

      const res = await axios.post(submitAnswerURL, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.data && res.data.score !== undefined) {
          setScore(res.data.score);
      }

      setSelectedAnswer('');

      if (!isLastQuestion) {
          // Fetch the next question
          await fetchQuestion(assessmentId, questionIndex + 1);
      } else {
          // Finish the assessment
          setCompleted(true);
          setIsTimerRunning(false);
      }
    } catch (err) {
      console.error("Failed to submit answer:", err);
      setErrorMessage("Failed to submit answer. Please try again.");
    }
  };

  const endAssessmentEarly = async () => {
    if (!window.confirm("Are you sure you want to end early? Your score will be saved.")) return;
    try {
        const token = localStorage.getItem('token');
        await axios.post(`${CONFIG.development.GATEWAY_URL}/api/assessment/end-session`, null, {
            params: {
                userId: currentUserId,
                assessmentId: assessmentId,
                assessmentType: 'MATH'
            },
            headers: { Authorization: `Bearer ${token}` }
        });
        setCompleted(true);
        setIsTimerRunning(false);
    } catch (err) {
        alert("Failed to end assessment.");
    }
  };

  // Show loading while resuming
  if (loading && resumeAssessmentId) {
    return (
      <div className="math-container">
        <div className="math-loading-card">
          <div className="math-loading-icon">⏳</div>
          <h2>Resuming Your Math Assessment...</h2>
          <p>Getting your progress ready</p>
        </div>
      </div>
    );
  }

  return (
    <div className="math-container">
      <button onClick={() => navigate('/assessments')} className="math-back-btn">
        <span>←</span> Back to Hub
      </button>

      {!assessmentId && !showConfigDialog ? (
        <div className="math-selection-card">
          {/* Math Hero Header with Symbols */}
          <div className="math-hero-header">
            <div className="math-symbols-float">
              <span className="math-symbol">∑</span>
              <span className="math-symbol">π</span>
              <span className="math-symbol">√</span>
              <span className="math-symbol">∫</span>
              <span className="math-symbol">∞</span>
              <span className="math-symbol">÷</span>
              <span className="math-symbol">×</span>
              <span className="math-symbol">±</span>
            </div>
            <div className="math-title-wrapper">
              <h1 className="math-main-title">Math By Grade</h1>
              <p className="math-subtitle">Master mathematics at your grade level 📐</p>
            </div>
          </div>

          {/* Grade Selector with Math Theme */}
          <div className="math-grade-selector">
            <h3 className="math-section-label">Select Your Grade Level</h3>
            <div className="math-grade-grid">
              {orderedGrades.map(grade => {
                const hasMath = gradeData[grade] && gradeData[grade].length > 0;
                return (
                  <button
                    key={grade}
                    onClick={() => hasMath && setSelectedGrade(grade)}
                    disabled={!hasMath}
                    className={`math-grade-btn ${selectedGrade === grade ? 'active' : ''} ${!hasMath ? 'disabled' : ''}`}
                  >
                    <span className="grade-number">{grade.replace('GRADE_', '').replace('_', ' ')}</span>
                    {hasMath && <span className="grade-checkmark">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Math Subject Display */}
          {gradeData[selectedGrade] && gradeData[selectedGrade].length > 0 ? (
            <div className="math-subject-display">
              <div className="math-subject-card">
                <div className="math-icon-large">📐</div>
                <h3>{gradeData[selectedGrade][0].replace('_', ' ')}</h3>
                <p>Grade {selectedGrade?.replace('GRADE_', '').replace('_', ' ')} Mathematics</p>
              </div>
            </div>
          ) : selectedGrade ? (
            <div className="math-no-content">
              <div className="no-content-icon">📝</div>
              <p>No math assessments available for this grade yet.</p>
            </div>
          ) : null}

          <button
            onClick={openConfigDialog}
            disabled={loading || !selectedGrade || !gradeData[selectedGrade]?.length}
            className="math-configure-btn"
          >
            Configure Math Assessment ⚙️
          </button>
        </div>

      ) : showConfigDialog ? (
        <div className="math-config-card">
          <button onClick={() => setShowConfigDialog(false)} className="math-back-btn">
            <span>←</span> Back
          </button>

          <div className="math-config-header">
            <div className="config-icon">⚙️</div>
            <h2>Configure Your Math Test</h2>
            <p>📐 {gradeData[selectedGrade]?.[0]?.replace('_', ' ')} - Grade {selectedGrade?.replace('GRADE_', '').replace('_', ' ')}</p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="math-error-alert">
              <span className="error-icon">⚠️</span>
              <div>
                <div className="error-title">Unable to Load Assessment</div>
                <div className="error-message">{errorMessage}</div>
              </div>
            </div>
          )}

          {/* Number of Questions */}
          <div className="config-section">
            <label className="config-label">
              📊 Number of Questions
            </label>
            <select
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
              className="config-select"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
              <option value={25}>25 Questions</option>
              <option value={30}>30 Questions</option>
            </select>
          </div>

          {/* Complexity Level */}
          <div className="config-section">
            <label className="config-label">
              🎯 Difficulty Level
            </label>
            <div className="config-difficulty-grid">
              {[
                { value: 'SIMPLE', label: '😊 Easy', icon: '➕' },
                { value: 'MEDIUM', label: '🤔 Medium', icon: '✖️' },
                { value: 'COMPLEX', label: '🧠 Hard', icon: '∫' }
              ].map(level => (
                <button
                  key={level.value}
                  onClick={() => setComplexity(level.value)}
                  className={`difficulty-btn ${complexity === level.value ? 'active' : ''}`}
                >
                  <span className="difficulty-icon">{level.icon}</span>
                  <span>{level.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startAssessment}
            disabled={loading}
            className="math-start-btn"
          >
            {loading ? 'Generating Test...' : 'Start Math Assessment 🚀'}
          </button>
        </div>

      ) : completed ? (
        <div className="math-completion-card">
          <div className="completion-trophy">🏆</div>
          <h2 className="completion-title">Math Test Complete!</h2>

          <div className="completion-score-display">
            <span className="score-earned">{score}</span>
            <span className="score-divider">/</span>
            <span className="score-total">{totalQuestions}</span>
          </div>

          <div className="completion-message">
            {score === totalQuestions && <p className="perfect-score">🎉 Perfect Score! Outstanding!</p>}
            {score >= totalQuestions * 0.8 && score < totalQuestions && <p className="great-score">⭐ Great job! Keep it up!</p>}
            {score >= totalQuestions * 0.6 && score < totalQuestions * 0.8 && <p className="good-score">👍 Good work! Practice makes perfect!</p>}
            {score < totalQuestions * 0.6 && <p className="keep-trying">💪 Keep practicing! You'll improve!</p>}
          </div>

          <button onClick={() => setAssessmentId(null)} className="math-retry-btn">
            Take Another Math Test 📐
          </button>
        </div>
      ) : currentQuestion && (
        <div className="math-question-card">
          {/* Question Header */}
          <div className="question-header">
            <div className="question-badge math-badge">
              📐 Mathematics
            </div>
            <div className="question-stats">
              <span className="stat-timer" style={{ background: '#fef3c7', color: '#d97706', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold' }}>
                ⏱️ {formatTime(timeElapsed)}
              </span>
              <span className="stat-question">
                Q: {questionIndex} / {totalQuestions}
              </span>
              <span className="stat-score">
                Score: {score}
              </span>
            </div>
          </div>

          {/* Bookmark button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button
              onClick={toggleBookmark}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: bookmarkedQuestions.has(questionIndex) ? '#f59e0b' : '#cbd5e1', transition: '0.2s' }}
            >
              {bookmarkedQuestions.has(questionIndex) ? '🔖' : '📑'}
              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                {bookmarkedQuestions.has(questionIndex) ? 'Bookmarked' : 'Bookmark'}
              </span>
            </button>
          </div>

          <h3 className="question-text">
            {currentQuestion.name}
          </h3>

          {/* Error Message during assessment */}
          {errorMessage && (
            <div className="math-error-alert inline">
              <span className="error-icon">⚠️</span>
              <div className="error-message">{errorMessage}</div>
              <button onClick={() => setErrorMessage('')} className="error-close">×</button>
            </div>
          )}

          <div className="question-options">
            {Object.entries(currentQuestion.options || {}).map(([key, value]) => {
              const isChecked = selectedAnswer === key;
              return (
                <label key={key} className={`option-label ${isChecked ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="option"
                    value={key}
                    checked={isChecked}
                    onChange={() => setSelectedAnswer(key)}
                    style={{ display: 'none' }}
                  />
                  <div className="option-indicator">{key}</div>
                  <span className="option-text">{value}</span>
                </label>
              );
            })}
          </div>

          <div className="question-actions">
            <button
              onClick={submitAnswer}
              disabled={!selectedAnswer}
              className="submit-btn"
            >
              Submit Answer 🎯
            </button>
            <button
              onClick={endAssessmentEarly}
              className="end-btn"
            >
              End Test 🛑
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
