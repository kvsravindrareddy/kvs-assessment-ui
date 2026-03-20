import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CONFIG from '../../Config';

// --- DYNAMIC SMART ICON GENERATOR ---
const getSubjectIcon = (subjectName) => {
  if (!subjectName) return '📝';
  const s = subjectName.toUpperCase();
  
  if (s.includes('MATH')) return '📐';
  if (s.includes('ENGLISH')) return '📚';
  if (s.includes('SCIENCE')) return '🔬';
  if (s.includes('HISTORY')) return '🏛️';
  if (s.includes('GEOGRAPHY')) return '🌍';
  if (s.includes('SOCIAL')) return '🤝';
  if (s.includes('COMPUTER') || s.includes('IT')) return '💻';
  if (s.includes('HINDI') || s.includes('TELUGU') || s.includes('LANGUAGE')) return '🗣️';
  if (s.includes('KNOWLEDGE') || s.includes('GENERAL')) return '💡';
  if (s.includes('ART')) return '🎨';
  if (s.includes('MUSIC')) return '🎵';

  // Fallback: Deterministic Hash for ANY unknown subject added by Admin!
  const genericIcons = ['📖', '✏️', '🎯', '🧩', '⭐', '🌟', '🧠', '⚡', '🚀', '🔍'];
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  return genericIcons[Math.abs(hash) % genericIcons.length];
};

export default function SubjectAssessments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeAssessmentId = searchParams.get('resumeId');

  const currentUserId = user ? (user.id || user.email || 'GUEST_USER') : 'GUEST_USER';

  // --- DYNAMIC GRADES & SUBJECTS STATE ---
  const [orderedGrades, setOrderedGrades] = useState([]);
  const [gradeSubjectMap, setGradeSubjectMap] = useState({});
  const [gradesLoading, setGradesLoading] = useState(true);

  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
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

  // 1. FIX: Point URLs correctly to match AssessmentFlow.jsx structure exactly
  const assessmentUrl = CONFIG.development.ASSESSMENT_BASE_URL;
  const adminUrl = CONFIG.development.GATEWAY_URL || CONFIG.development.ADMIN_BASE_URL;

  const loadAssessmentURL = `${assessmentUrl}/v1/assessment/questions/load`;
  const startAssessmentURL = `${assessmentUrl}/v1/assessment/questions/start`;
  const submitAnswerURL = `${assessmentUrl}/v1/assessment/questions/submit-answer`;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  // --- UI CACHING IMPLEMENTATION ---
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

        // Check if cache exists and is valid
        if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime) < CACHE_DURATION)) {
            activeGrades = JSON.parse(cachedData);
        } else {
            // Fetch from API if cache expired or doesn't exist
            const token = localStorage.getItem('token');
            const response = await axios.get(
              `${adminUrl}/admin-assessment/v1/grade-subjects`,
              { headers: { Authorization: token ? `Bearer ${token}` : '' } }
            );
            
            activeGrades = (response.data || []).filter(g => g.isActive);
            activeGrades.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            
            // Save to UI Cache
            localStorage.setItem(CACHE_KEY, JSON.stringify(activeGrades));
            localStorage.setItem(CACHE_TTL_KEY, Date.now().toString());
        }
        
        // Process Data
        const gradesList = activeGrades.map(g => g.gradeCode);
        const subjMap = {};
        
        activeGrades.forEach(g => {
          subjMap[g.gradeCode] = (g.subjects || []).map(s => s.subjectName);
        });

        setOrderedGrades(gradesList);
        setGradeSubjectMap(subjMap);

        // Auto-select Default Grade (Prefer V if exists, else first available)
        if (gradesList.length > 0) {
          const defaultGrade = gradesList.includes('V') ? 'V' : gradesList[0];
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
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
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

      if (session.assessmentType) {
        setSelectedSubject(session.assessmentType);
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
    if (!selectedGrade || !selectedSubject) return;
    setShowConfigDialog(true);
    setErrorMessage('');
    setNumberOfQuestions(10);
    setComplexity('SIMPLE');
  };

  const startAssessment = async () => {
    if (!selectedGrade || !selectedSubject) return;

    setLoading(true);
    setErrorMessage('');
    
    // 2. FIX: Do NOT hide the dialog until the API correctly resolves!
    // setShowConfigDialog(false); 

    try {
      const token = localStorage.getItem('token');
      const loadRes = await axios.post(loadAssessmentURL, {
        userId: currentUserId,
        email: user?.email || '',
        category: selectedGrade,
        type: selectedSubject,
        complexity: complexity,
        numberOfQuestions: numberOfQuestions
      }, { headers: { 'Authorization': `Bearer ${token}` } });

      const newAssessmentId = loadRes.data.assessmentId;
      const totalQs = loadRes.data.numberOfQuestions || numberOfQuestions;

      setAssessmentId(newAssessmentId);
      setTotalQuestions(totalQs);
      await fetchQuestion(newAssessmentId, 1);
      
      setScore(0);
      setSelectedAnswer('');
      setCompleted(false);
      setTimeElapsed(0);
      setIsTimerRunning(true);
      setBookmarkedQuestions(new Set());

      // NOW we safely hide the config dialog and show the assessment
      setShowConfigDialog(false);

    } catch (err) {
      console.error('Error starting subject assessment:', err);
      const errorMsg = err.response?.data?.message || 'Could not load questions. Ensure the Admin has loaded questions for this Subject & Grade.';
      setErrorMessage(errorMsg);
      // We don't hide the config dialog on error, allowing the user to read the message.
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
                assessmentType: selectedSubject
            },
            headers: { Authorization: `Bearer ${token}` }
        });
        setCompleted(true);
        setIsTimerRunning(false);
    } catch (err) {
        alert("Failed to end assessment.");
    }
  };

  if (gradesLoading) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '60px 20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📚</div>
          <h2 style={{ fontSize: '1.8rem', color: '#1e293b', margin: '0 0 10px 0' }}>Loading Curriculum...</h2>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>Please wait while we sync grades and subjects</p>
        </div>
      </div>
    );
  }

  if (loading && resumeAssessmentId) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '60px 20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⏳</div>
          <h2 style={{ fontSize: '1.8rem', color: '#1e293b', margin: '0 0 10px 0' }}>Resuming Your Assessment...</h2>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>Getting your progress ready</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
        <button onClick={() => navigate('/assessments')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span>←</span> Back to Hub
        </button>

      {!assessmentId && !showConfigDialog ? (
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '30px 20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.2rem', color: '#1e293b', margin: '0 0 5px 0', fontWeight: '800' }}>Subject Assessments 📚</h2>
            <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '30px', fontSize: '1.1rem' }}>Select your Grade and Subject to begin.</p>

            {/* DYNAMIC Grade Selector */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '20px' }}>
                {orderedGrades.map(grade => (
                    <button 
                        key={grade} 
                        onClick={() => { setSelectedGrade(grade); setSelectedSubject(null); }}
                        style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', cursor: 'pointer', background: selectedGrade === grade ? '#0f172a' : '#f1f5f9', color: selectedGrade === grade ? 'white' : '#475569' }}
                    >
                        {grade.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* DYNAMIC Subject Selector */}
            {gradeSubjectMap[selectedGrade] && gradeSubjectMap[selectedGrade].length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '40px' }}>
                    {gradeSubjectMap[selectedGrade].map(subject => (
                        <div 
                            key={subject} 
                            onClick={() => setSelectedSubject(subject)}
                            style={{ padding: '20px', borderRadius: '16px', border: `2px solid ${selectedSubject === subject ? '#10b981' : '#e2e8f0'}`, background: selectedSubject === subject ? '#ecfdf5' : 'white', cursor: 'pointer', textAlign: 'center', transition: '0.2s', boxShadow: selectedSubject === subject ? '0 4px 15px rgba(16,185,129,0.2)' : 'none' }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{getSubjectIcon(subject)}</div>
                            <div style={{ fontWeight: 'bold', color: selectedSubject === subject ? '#065f46' : '#475569' }}>{subject.replace('_', ' ')}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '16px', color: '#64748b', marginBottom: '40px' }}>
                    No subjects assigned to this grade yet.
                </div>
            )}

            <button
                onClick={openConfigDialog}
                disabled={loading || !selectedSubject}
                style={{ width: '100%', maxWidth: '400px', margin: '0 auto', display: 'block', padding: '20px', fontSize: '1.3rem', fontWeight: 'bold', borderRadius: '50px', background: !selectedSubject ? '#cbd5e1' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', cursor: !selectedSubject ? 'not-allowed' : 'pointer', boxShadow: !selectedSubject ? 'none' : '0 10px 25px rgba(16, 185, 129, 0.4)' }}
            >
                Configure Assessment ⚙️
            </button>
        </div>

      ) : showConfigDialog ? (
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '40px 30px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', maxWidth: '700px', margin: '0 auto' }}>
            <button onClick={() => setShowConfigDialog(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>←</span> Back
            </button>

            <h2 style={{ textAlign: 'center', fontSize: '2rem', color: '#1e293b', margin: '0 0 10px 0', fontWeight: '800' }}>Configure Your Assessment ⚙️</h2>
            <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '40px', fontSize: '1rem' }}>
                {getSubjectIcon(selectedSubject)} {selectedSubject} - Grade {selectedGrade.replace('_', ' ')}
            </p>

            {errorMessage && (
                <div style={{ background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: '12px', padding: '16px 20px', marginBottom: '30px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#dc2626', marginBottom: '4px' }}>Unable to Load Assessment</div>
                        <div style={{ color: '#991b1b', fontSize: '0.95rem' }}>{errorMessage}</div>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px', fontSize: '1.1rem' }}>
                    📊 Number of Questions
                </label>
                <select
                    value={numberOfQuestions}
                    onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '15px 20px', fontSize: '1.1rem', borderRadius: '12px', border: '2px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '600', color: '#475569' }}
                >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                    <option value={25}>25 Questions</option>
                    <option value={30}>30 Questions</option>
                </select>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px', fontSize: '1.1rem' }}>
                    🎯 Difficulty Level
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {['SIMPLE', 'MEDIUM', 'COMPLEX'].map(level => (
                        <button
                            key={level}
                            onClick={() => setComplexity(level)}
                            style={{ padding: '18px', borderRadius: '12px', border: `2px solid ${complexity === level ? '#10b981' : '#e2e8f0'}`, background: complexity === level ? '#ecfdf5' : 'white', cursor: 'pointer', fontWeight: 'bold', color: complexity === level ? '#065f46' : '#475569', fontSize: '1rem', transition: 'all 0.2s' }}
                        >
                            {level === 'SIMPLE' && '😊 Easy'}
                            {level === 'MEDIUM' && '🤔 Medium'}
                            {level === 'COMPLEX' && '🧠 Hard'}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={startAssessment}
                disabled={loading}
                style={{ width: '100%', padding: '20px', fontSize: '1.3rem', fontWeight: 'bold', borderRadius: '50px', background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 10px 25px rgba(16, 185, 129, 0.4)', marginTop: '20px' }}
            >
                {loading ? 'Generating Test...' : 'Start Assessment 🚀'}
            </button>
        </div>

      ) : completed ? (
            <div style={{ textAlign: 'center', background: '#ffffff', padding: '60px 20px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '6rem', marginBottom: '10px' }}>🏆</div>
                <h2 style={{ fontSize: '2.8rem', color: '#1e293b', margin: '0 0 10px 0', fontWeight: '900' }}>Test Complete!</h2>
                
                <div style={{ background: '#f8fafc', padding: '30px 60px', borderRadius: '30px', display: 'inline-block', margin: '40px 0', border: '2px solid #e2e8f0' }}>
                    <span style={{ fontSize: '5rem', color: '#10b981', fontWeight: '900', lineHeight: '1' }}>{score}</span> 
                    <span style={{ fontSize: '2.5rem', color: '#cbd5e1', margin: '0 20px' }}>/</span> 
                    <span style={{ fontSize: '3rem', color: '#64748b', fontWeight: 'bold', lineHeight: '1' }}>{totalQuestions}</span>
                </div>
                <br/>
                <button onClick={() => setAssessmentId(null)} style={{ padding: '16px 40px', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '50px', background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Take Another Test 📚
                </button>
            </div>
      ) : currentQuestion && (
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '40px 20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ background: '#f1f5f9', padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', color: '#475569', fontSize: '1.1rem', border: '1px solid #e2e8f0' }}>
                    {getSubjectIcon(selectedSubject)} {selectedSubject}
                </div>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <span style={{ background: '#fef3c7', color: '#d97706', padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        ⏱️ {formatTime(timeElapsed)}
                    </span>
                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        Q: {questionIndex} / {totalQuestions}
                    </span>
                    <span style={{ background: '#ecfdf5', color: '#059669', padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 0 0 2px #a7f3d0' }}>
                        Score: {score}
                    </span>
                </div>
            </div>

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
            
            <h3 style={{ fontSize: '1.6rem', color: '#0f172a', marginBottom: '30px', lineHeight: '1.5' }}>
                {currentQuestion.name}
            </h3>

            {errorMessage && (
                <div style={{ background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <div style={{ color: '#dc2626', fontSize: '0.95rem', fontWeight: '600' }}>{errorMessage}</div>
                    <button onClick={() => setErrorMessage('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1.2rem', padding: '0 8px' }}>×</button>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
                {Object.entries(currentQuestion.options || {}).map(([key, value]) => {
                const isChecked = selectedAnswer === key;
                return (
                    <label key={key} style={{ padding: '18px 20px', borderRadius: '16px', border: `2px solid ${isChecked ? '#10b981' : '#e2e8f0'}`, background: isChecked ? '#ecfdf5' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', transition: 'all 0.2s' }}>
                    <input type="radio" name="option" value={key} checked={isChecked} onChange={() => setSelectedAnswer(key)} style={{ display: 'none' }} />
                    <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: isChecked ? '#10b981' : '#f1f5f9', color: isChecked ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{key}</div>
                    <span style={{ fontSize: '1.1rem', color: isChecked ? '#065f46' : '#475569', fontWeight: isChecked ? 'bold' : 'normal' }}>{value}</span>
                    </label>
                );
                })}
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', maxWidth: '400px', margin: '0 auto' }}>
                <button 
                    onClick={submitAnswer} disabled={!selectedAnswer}
                    style={{ flex: 2, padding: '20px', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '50px', background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', opacity: !selectedAnswer ? 0.5 : 1 }}
                >
                    Submit 🎯
                </button>
                <button 
                    onClick={endAssessmentEarly}
                    style={{ flex: 1, padding: '20px', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '50px', background: '#fee2e2', color: '#ef4444', border: '2px solid #fca5a5', cursor: 'pointer' }}
                >
                    End 🛑
                </button>
            </div>
        </div>
      )}
    </div>
  );
}