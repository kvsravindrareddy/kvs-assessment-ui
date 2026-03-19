import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CONFIG from '../../Config';
import './MathByGrade.css';

export default function MathByGrade() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeAssessmentId = searchParams.get('resumeId');

  const currentUserId = user ? (user.id || user.email || 'GUEST_USER') : 'GUEST_USER';

  // --- DYNAMIC GRADES & MATH SUBJECTS STATE ---
  const [orderedGrades, setOrderedGrades] = useState([]);
  const [gradeData, setGradeData] = useState({});
  const [gradesLoading, setGradesLoading] = useState(true);

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
  
  // Clean single error message state
  const [errorMessage, setErrorMessage] = useState('');

  // Timer state
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());

  const baseUrl = CONFIG.development.GATEWAY_URL || CONFIG.development.ADMIN_BASE_URL;
  const loadAssessmentURL = `${baseUrl}/v1/assessment/questions/load`;
  const startAssessmentURL = `${baseUrl}/v1/assessment/questions/start`;
  const submitAnswerURL = `${baseUrl}/v1/assessment/questions/submit-answer`;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleBookmark = () => {
    setBookmarkedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) newSet.delete(questionIndex);
      else newSet.add(questionIndex);
      return newSet;
    });
  };

  // --- UI CACHING IMPLEMENTATION WITH MATH FILTERING ---
  useEffect(() => {
    const loadGradesAndSubjects = async () => {
      try {
        setGradesLoading(true);
        const CACHE_KEY = 'kivo_dynamic_grades_cache';
        const CACHE_TTL_KEY = 'kivo_dynamic_grades_cache_time';
        const CACHE_DURATION = 1000 * 60 * 60; // 1 Hour

        let activeGrades = [];
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TTL_KEY);

        if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime) < CACHE_DURATION)) {
            activeGrades = JSON.parse(cachedData);
        } else {
            const token = localStorage.getItem('token');
            const response = await axios.get(
              `${baseUrl}/admin-assessment/v1/grade-subjects`,
              { headers: { Authorization: token ? `Bearer ${token}` : '' } }
            );
            
            activeGrades = (response.data || []).filter(g => g.isActive);
            activeGrades.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            
            localStorage.setItem(CACHE_KEY, JSON.stringify(activeGrades));
            localStorage.setItem(CACHE_TTL_KEY, Date.now().toString());
        }
        
        const mathGradesList = [];
        const mathSubjMap = {};
        
        activeGrades.forEach(g => {
          const mathSubjects = (g.subjects || [])
              .map(s => s.subjectName)
              .filter(name => 
                  name.toUpperCase().includes('MATH') || 
                  name.toUpperCase().includes('ALGEBRA') || 
                  name.toUpperCase().includes('GEOMETRY') || 
                  name.toUpperCase().includes('CALCULUS')
              );

          if (mathSubjects.length > 0) {
              mathGradesList.push(g.gradeCode);
              mathSubjMap[g.gradeCode] = mathSubjects;
          }
        });

        setOrderedGrades(mathGradesList);
        setGradeData(mathSubjMap);

        if (mathGradesList.length > 0) {
          const defaultGrade = mathGradesList.includes('V') ? 'V' : mathGradesList[0];
          setSelectedGrade(defaultGrade);
        }
      } catch (error) {
        console.error('Error loading grades and subjects:', error);
      } finally {
        setGradesLoading(false);
      }
    };

    loadGradesAndSubjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerRunning && !completed) {
      interval = setInterval(() => { setTimeElapsed(prev => prev + 1); }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, completed]);

  useEffect(() => {
    if (resumeAssessmentId && currentUserId) {
      resumeAssessment(resumeAssessmentId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeAssessmentId, currentUserId]);

  const resumeAssessment = async (assId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const dashboardURL = `${CONFIG.development.ADMIN_BASE_URL}/v1/assessment/dashboard/student?userId=${encodeURIComponent(currentUserId)}`;
      const dashboardRes = await axios.get(dashboardURL, { headers: { 'Authorization': `Bearer ${token}` } });
      const session = dashboardRes.data.continueLearning?.find(s => s.assessmentId === assId);

      if (!session) {
        setErrorMessage('Assessment session not found. Please start a new assessment.');
        setLoading(false);
        return;
      }

      const nextQuestionIndex = (session.lastAttemptedIndex || 0) + 1;
      const res = await axios.post(startAssessmentURL, {
        userId: currentUserId,
        email: user?.email || '',
        assessmentId: assId,
        questionIndex: nextQuestionIndex
      }, { headers: { 'Authorization': `Bearer ${token}` } });

      const questionData = res.data?.question?.question || res.data;

      setAssessmentId(assId);
      setTotalQuestions(session.totalQuestions);
      setCurrentQuestion(questionData);
      setQuestionIndex(nextQuestionIndex);
      setScore(session.score || 0);
      setSelectedAnswer('');
      setCompleted(false);

      if (session.assessmentName) {
        const gradeMatch = session.assessmentName.match(/Grade\s+(\S+)/);
        if (gradeMatch && gradeMatch[1]) setSelectedGrade(gradeMatch[1].replace(/[()]/g, ''));
      }

      setIsTimerRunning(true);
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
    setErrorMessage(''); 
    setNumberOfQuestions(10);
    setComplexity('SIMPLE');
  };

  const startAssessment = async () => {
    if (!selectedGrade) return;
    const mathSubject = gradeData[selectedGrade]?.[0];
    if (!mathSubject) {
      setErrorMessage('No math subjects available for this grade.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');

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

      await fetchQuestion(newAssessmentId, 1);

      setShowConfigDialog(false);
      setScore(0);
      setSelectedAnswer('');
      setCompleted(false);
      setTimeElapsed(0);
      setIsTimerRunning(true);
      setBookmarkedQuestions(new Set());

    } catch (err) {
      console.error('Error starting math assessment:', err);
      // Clean single error message from backend
      const errorMsg = err.response?.data?.message || 'Could not load questions. Please ensure content is available for this Grade.';
      setErrorMessage(errorMsg);
      // Ensure dialog stays open if we fail here, so user sees the message
      setShowConfigDialog(true);
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
      }, { headers: { 'Authorization': `Bearer ${token}` } });

      const questionData = res.data?.question?.question || res.data;
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

      const res = await axios.post(submitAnswerURL, payload, { headers: { 'Authorization': `Bearer ${token}` } });

      if (res.data && res.data.score !== undefined) {
          setScore(res.data.score);
      }
      setSelectedAnswer('');

      if (!isLastQuestion) {
          await fetchQuestion(assessmentId, questionIndex + 1);
      } else {
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
                assessmentType: gradeData[selectedGrade]?.[0] || 'MATH'
            },
            headers: { Authorization: `Bearer ${token}` }
        });
        setCompleted(true);
        setIsTimerRunning(false);
    } catch (err) {
        alert("Failed to end assessment.");
    }
  };

  if (gradesLoading || (loading && resumeAssessmentId)) {
    return (
      <div className="math-nextgen-container">
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '100px 20px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', textAlign: 'center', marginTop: '10vh' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px', animation: 'pulse 2s infinite' }}>{gradesLoading ? '📚' : '⏳'}</div>
          <h2 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: '800' }}>
            {gradesLoading ? 'Loading Curriculum...' : 'Resuming Your Assessment...'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Please wait a moment</p>
        </div>
      </div>
    );
  }

  // Determine what to show in the right panel based on state
  const renderMainPanel = () => {
    if (completed) {
      return (
        <div className="math-panel-content" style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '6rem', marginBottom: '20px' }}>🏆</div>
          <h2 style={{ fontSize: '2.8rem', color: '#0f172a', margin: '0 0 10px 0', fontWeight: '900' }}>Test Complete!</h2>
          
          <div style={{ background: '#f8fafc', padding: '30px 60px', borderRadius: '30px', display: 'inline-block', margin: '40px 0', border: '2px solid #e2e8f0' }}>
              <span style={{ fontSize: '5rem', color: '#10b981', fontWeight: '900', lineHeight: '1' }}>{score}</span> 
              <span style={{ fontSize: '2.5rem', color: '#cbd5e1', margin: '0 20px' }}>/</span> 
              <span style={{ fontSize: '3rem', color: '#64748b', fontWeight: 'bold', lineHeight: '1' }}>{totalQuestions}</span>
          </div>
          
          <div style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '40px', fontWeight: '600' }}>
            {score === totalQuestions && "🎉 Perfect Score! Outstanding!"}
            {score >= totalQuestions * 0.8 && score < totalQuestions && "⭐ Great job! Keep it up!"}
            {score >= totalQuestions * 0.6 && score < totalQuestions * 0.8 && "👍 Good work! Practice makes perfect!"}
            {score < totalQuestions * 0.6 && "💪 Keep practicing! You'll improve!"}
          </div>

          <button onClick={() => setAssessmentId(null)} className="math-action-btn">
            Take Another Math Test 📐
          </button>
        </div>
      );
    }

    if (currentQuestion && assessmentId) {
      return (
        <div className="math-panel-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ background: '#ecfdf5', padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', color: '#065f46', border: '1px solid #a7f3d0' }}>
                📐 {gradeData[selectedGrade]?.[0]?.replace(/_/g, ' ') || 'Mathematics'}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ background: '#fef3c7', color: '#d97706', padding: '8px 16px', borderRadius: '20px', fontWeight: '700' }}>
                      ⏱️ {formatTime(timeElapsed)}
                  </span>
                  <span style={{ background: '#eff6ff', color: '#2563eb', padding: '8px 16px', borderRadius: '20px', fontWeight: '700' }}>
                      Q: {questionIndex} / {totalQuestions}
                  </span>
              </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
            <button onClick={toggleBookmark} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: bookmarkedQuestions.has(questionIndex) ? '#f59e0b' : '#94a3b8', fontWeight: '600' }}>
                {bookmarkedQuestions.has(questionIndex) ? '🔖 Bookmarked' : '📑 Bookmark'}
            </button>
          </div>
          
          <h3 style={{ fontSize: '1.8rem', color: '#0f172a', marginBottom: '40px', lineHeight: '1.4', fontWeight: '800' }}>
            {currentQuestion.name || currentQuestion.question || "Unable to display question text"}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
              {Object.entries(currentQuestion.options || {}).map(([key, value]) => {
                const isChecked = selectedAnswer === key;
                return (
                    <label key={key} style={{ padding: '20px', borderRadius: '16px', border: `2px solid ${isChecked ? '#10b981' : '#e2e8f0'}`, background: isChecked ? '#ecfdf5' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s', boxShadow: isChecked ? '0 4px 15px rgba(16, 185, 129, 0.1)' : 'none' }}>
                      <input type="radio" name="option" value={key} checked={isChecked} onChange={() => setSelectedAnswer(key)} style={{ display: 'none' }} />
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: isChecked ? '#10b981' : '#f1f5f9', color: isChecked ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.1rem' }}>{key}</div>
                      <span style={{ fontSize: '1.15rem', color: isChecked ? '#065f46' : '#334155', fontWeight: isChecked ? '700' : '500' }}>{value}</span>
                    </label>
                );
              })}
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={submitAnswer} disabled={!selectedAnswer} className="math-action-btn" style={{ flex: 2, margin: 0 }}>
                  Submit Answer 🎯
              </button>
              <button onClick={endAssessmentEarly} className="math-action-btn" style={{ flex: 1, margin: 0, background: '#fee2e2', color: '#ef4444', boxShadow: 'none' }}>
                  End 🛑
              </button>
          </div>
        </div>
      );
    }

    if (showConfigDialog) {
      return (
        <div className="math-panel-content">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
            <button onClick={() => setShowConfigDialog(false)} style={{ background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#475569', marginRight: '20px' }}>←</button>
            <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: 0, fontWeight: '900' }}>Test Setup</h2>
          </div>

          {errorMessage && (
            <div className="clean-error-alert">
              <span>⚠️</span>
              <p>{errorMessage}</p>
            </div>
          )}

          <div className="config-grid">
            <div className="config-group">
              <label>📊 Number of Questions</label>
              <select value={numberOfQuestions} onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))} className="modern-select">
                <option value={5}>5 Questions (Quick)</option>
                <option value={10}>10 Questions (Standard)</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions (Challenge)</option>
              </select>
            </div>

            <div className="config-group">
              <label>🎯 Difficulty Level</label>
              <div className="difficulty-pill-grid">
                {[
                  { value: 'SIMPLE', label: 'Easy', icon: '😊' },
                  { value: 'MEDIUM', label: 'Medium', icon: '🤔' },
                  { value: 'COMPLEX', label: 'Hard', icon: '🧠' }
                ].map(level => (
                  <button key={level.value} onClick={() => setComplexity(level.value)} className={`difficulty-pill ${complexity === level.value ? 'active' : ''}`}>
                    <span className="difficulty-icon">{level.icon}</span>
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={startAssessment} disabled={loading} className="math-action-btn">
            {loading ? 'Initializing Core...' : 'Generate Assessment 🚀'}
          </button>
        </div>
      );
    }

    // Default View: Subject Hero
    const hasMath = gradeData[selectedGrade] && gradeData[selectedGrade].length > 0;
    return (
      <>
        <div className="math-ambient-bg">
            <span className="ambient-1">∑</span>
            <span className="ambient-2">π</span>
            <span className="ambient-3">√</span>
            <span className="ambient-4">∫</span>
            <span className="ambient-5">∞</span>
        </div>
        <div className="math-panel-content">
          <div className="math-hero-header">
            <h1 className="math-main-title">Math Core</h1>
            <p className="math-subtitle">Master the fundamentals of Grade {selectedGrade?.replace('GRADE_', '').replace('_', ' ')}</p>
          </div>

          {hasMath ? (
            <div className="modern-subject-card">
              <div className="modern-subject-icon">📐</div>
              <h3 className="modern-subject-title">{gradeData[selectedGrade][0].replace(/_/g, ' ')}</h3>
              <p className="modern-subject-desc">Adaptive problem solving</p>
            </div>
          ) : (
            <div className="modern-subject-card" style={{ borderColor: '#f1f5f9', opacity: 0.7 }}>
              <div className="modern-subject-icon" style={{ background: '#f8fafc', color: '#94a3b8' }}>📭</div>
              <h3 className="modern-subject-title" style={{ color: '#64748b' }}>Not Available</h3>
              <p className="modern-subject-desc">No curriculum assigned to this grade.</p>
            </div>
          )}

          <button onClick={openConfigDialog} disabled={!hasMath} className="math-action-btn">
            Configure Module ⚙️
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="math-nextgen-container">
      <button onClick={() => navigate('/assessments')} className="math-hub-back-btn">
        <span>←</span> Back to Hub
      </button>

      <div className="math-dashboard-layout">
        {/* LEFT SIDEBAR: Vertical Grade List */}
        {(!assessmentId && !showConfigDialog && !completed) && (
            <aside className="math-vertical-sidebar">
                <div className="sidebar-header">Academic Level</div>
                <div className="vertical-grade-list">
                    {orderedGrades.length > 0 ? (
                        orderedGrades.map(grade => {
                            const hasMath = gradeData[grade] && gradeData[grade].length > 0;
                            return (
                                <button
                                    key={grade}
                                    onClick={() => hasMath && setSelectedGrade(grade)}
                                    disabled={!hasMath}
                                    className={`vertical-grade-btn ${selectedGrade === grade ? 'active' : ''} ${!hasMath ? 'disabled' : ''}`}
                                >
                                    <span>Grade {grade.replace('GRADE_', '').replace('_', ' ')}</span>
                                    {hasMath && <div className="grade-checkmark">✓</div>}
                                </button>
                            );
                        })
                    ) : (
                        <div style={{ color: '#94a3b8', fontSize: '0.95rem', padding: '10px' }}>No curriculum data available.</div>
                    )}
                </div>
            </aside>
        )}

        {/* RIGHT MAIN PANEL: Dynamic Content based on State */}
        <main className="math-main-panel" style={{ gridColumn: (assessmentId || showConfigDialog || completed) ? '1 / -1' : 'auto' }}>
            {renderMainPanel()}
        </main>
      </div>
    </div>
  );
}