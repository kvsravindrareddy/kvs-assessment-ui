import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CONFIG from '../../Config';
import './UniversalSubjectHub.css';

export default function UniversalSubjectHub({ 
    title, subtitle, subjectKeywords, primaryColor, secondaryColor, icon, ambientSymbols, videoCategories 
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeAssessmentId = searchParams.get('resumeId');

  const currentUserId = user ? (user.id || user.email || 'GUEST_USER') : 'GUEST_USER';

  // Tab State
  const [activeTab, setActiveTab] = useState(videoCategories ? 'videos' : 'assessments');

  // Assessment State
  const [orderedGrades, setOrderedGrades] = useState([]);
  const [gradeData, setGradeData] = useState({});
  const [gradesLoading, setGradesLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
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
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());

  const baseUrl = CONFIG.development.GATEWAY_URL || CONFIG.development.ADMIN_BASE_URL;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60); const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleBookmark = () => {
    setBookmarkedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) newSet.delete(questionIndex); else newSet.add(questionIndex);
      return newSet;
    });
  };

  useEffect(() => {
    const loadGradesAndSubjects = async () => {
      try {
        setGradesLoading(true);
        const CACHE_KEY = 'kivo_dynamic_grades_cache';
        const CACHE_TTL_KEY = 'kivo_dynamic_grades_cache_time';
        
        let activeGrades = [];
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TTL_KEY);

        if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime) < 3600000)) {
            activeGrades = JSON.parse(cachedData);
        } else {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${baseUrl}/admin-assessment/v1/grade-subjects`, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
            activeGrades = (res.data || []).filter(g => g.isActive);
            activeGrades.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            localStorage.setItem(CACHE_KEY, JSON.stringify(activeGrades));
            localStorage.setItem(CACHE_TTL_KEY, Date.now().toString());
        }
        
        const gradesList = []; const subjMap = {};
        activeGrades.forEach(g => {
          const matchedSubjects = (g.subjects || []).map(s => s.subjectName).filter(name => 
            subjectKeywords.some(kw => name.toUpperCase().includes(kw.toUpperCase()))
          );
          if (matchedSubjects.length > 0) { gradesList.push(g.gradeCode); subjMap[g.gradeCode] = matchedSubjects; }
        });

        setOrderedGrades(gradesList); setGradeData(subjMap);
        if (gradesList.length > 0) {
          const defaultGrade = gradesList.includes('V') ? 'V' : gradesList[0];
          setSelectedGrade(defaultGrade); setSelectedSubject(subjMap[defaultGrade][0]);
        }
      } catch (error) { console.error('Error loading curriculum:', error); } finally { setGradesLoading(false); }
    };
    loadGradesAndSubjects();
  }, [baseUrl, subjectKeywords]);

  useEffect(() => {
    let interval;
    if (isTimerRunning && !completed) interval = setInterval(() => { setTimeElapsed(prev => prev + 1); }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, completed]);

  const resumeAssessment = async (assId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const dashboardURL = `${CONFIG.development.ADMIN_BASE_URL}/v1/assessment/dashboard/student?userId=${encodeURIComponent(currentUserId)}`;
      const dashboardRes = await axios.get(dashboardURL, { headers: { 'Authorization': `Bearer ${token}` } });
      const session = dashboardRes.data.continueLearning?.find(s => s.assessmentId === assId);

      if (!session) {
        setErrorMessage('Assessment session not found.');
        setLoading(false); return;
      }

      const nextQuestionIndex = (session.lastAttemptedIndex || 0) + 1;
      // FIX: Changed undefined variable to dynamic URL
      const res = await axios.post(`${baseUrl}/v1/assessment/questions/start`, {
        userId: currentUserId, email: user?.email || '', assessmentId: assId, questionIndex: nextQuestionIndex
      }, { headers: { 'Authorization': `Bearer ${token}` } });

      setAssessmentId(assId);
      setTotalQuestions(session.totalQuestions);
      setCurrentQuestion(res.data?.question?.question || res.data);
      setQuestionIndex(nextQuestionIndex);
      setScore(session.score || 0);
      setSelectedAnswer('');
      setCompleted(false);

      if (session.assessmentType) setSelectedSubject(session.assessmentType);
      if (session.assessmentName) {
        const gradeMatch = session.assessmentName.match(/Grade\s+(\S+)/);
        if (gradeMatch && gradeMatch[1]) setSelectedGrade(gradeMatch[1].replace(/[()]/g, ''));
      }
      setIsTimerRunning(true);
    } catch (err) {
      setErrorMessage('Unable to resume assessment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resumeAssessmentId && currentUserId) resumeAssessment(resumeAssessmentId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeAssessmentId, currentUserId]);

  const openConfigDialog = () => {
    if (!selectedGrade || !selectedSubject) return;
    setShowConfigDialog(true);
    setErrorMessage(''); 
    setNumberOfQuestions(10);
    setComplexity('SIMPLE');
  };

  const startAssessment = async () => {
    setLoading(true); setErrorMessage('');
    try {
      const token = localStorage.getItem('token');
      const loadRes = await axios.post(`${baseUrl}/v1/assessment/questions/load`, {
        userId: currentUserId, email: user?.email || '', category: selectedGrade, type: selectedSubject, complexity, numberOfQuestions
      }, { headers: { Authorization: `Bearer ${token}` } });

      const newId = loadRes.data.assessmentId;
      setAssessmentId(newId); setTotalQuestions(loadRes.data.numberOfQuestions || numberOfQuestions);
      await fetchQuestion(newId, 1);

      setShowConfigDialog(false); setScore(0); setSelectedAnswer(''); setCompleted(false); setTimeElapsed(0); setIsTimerRunning(true); setBookmarkedQuestions(new Set());
    } catch (err) {
      setErrorMessage(err.response?.data?.message || `No AI questions loaded for Grade ${selectedGrade} ${selectedSubject.replace(/_/g, ' ')} yet.`);
      setShowConfigDialog(true);
    } finally { setLoading(false); }
  };

  const fetchQuestion = async (assId, index) => {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${baseUrl}/v1/assessment/questions/start`, { userId: currentUserId, email: user?.email || '', assessmentId: assId, questionIndex: index }, { headers: { Authorization: `Bearer ${token}` } });
      setCurrentQuestion(res.data?.question?.question || res.data); setQuestionIndex(index);
  };

  const submitAnswer = async () => {
    if (!assessmentId || !currentQuestion || !selectedAnswer) return;
    const isLast = questionIndex === totalQuestions;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${baseUrl}/v1/assessment/questions/submit-answer`, {
        userId: currentUserId, email: user?.email || '', assessmentId, questionIndex, userAnswer: [selectedAnswer]
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data?.score !== undefined) setScore(res.data.score);
      setSelectedAnswer('');
      if (!isLast) await fetchQuestion(assessmentId, questionIndex + 1);
      else { setCompleted(true); setIsTimerRunning(false); }
    } catch (err) { setErrorMessage("Failed to submit answer."); }
  };

  const endAssessmentEarly = async () => {
    if (!window.confirm("End early? Your score will be saved.")) return;
    try {
        const token = localStorage.getItem('token');
        await axios.post(`${CONFIG.development.GATEWAY_URL}/api/assessment/end-session`, null, {
            params: { userId: currentUserId, assessmentId, assessmentType: selectedSubject }, headers: { Authorization: `Bearer ${token}` }
        });
        setCompleted(true); setIsTimerRunning(false);
    } catch (err) { alert("Failed to end assessment."); }
  };

  const renderAssessmentPanel = () => {
    if (completed) {
      return (
        <div className="hub-panel-content" style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '6rem', marginBottom: '20px' }}>🏆</div>
          <h2 style={{ fontSize: '2.8rem', color: '#0f172a', fontWeight: '900' }}>Assessment Complete!</h2>
          <div style={{ background: '#f8fafc', padding: '30px 60px', borderRadius: '30px', display: 'inline-block', margin: '40px 0', border: '2px solid #e2e8f0' }}>
              <span style={{ fontSize: '5rem', color: 'var(--hub-primary)', fontWeight: '900' }}>{score}</span> 
              <span style={{ fontSize: '2.5rem', color: '#cbd5e1', margin: '0 20px' }}>/</span> 
              <span style={{ fontSize: '3rem', color: '#64748b', fontWeight: 'bold' }}>{totalQuestions}</span>
          </div>
          <button onClick={() => setAssessmentId(null)} className="hub-action-btn">Take Another Test {icon}</button>
        </div>
      );
    }

    if (currentQuestion && assessmentId) {
      return (
        <div className="hub-panel-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ background: 'var(--hub-glow-light)', padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', color: 'var(--hub-primary-dark)', border: '1px solid var(--hub-glow)' }}>
                {icon} {selectedSubject.replace(/_/g, ' ')}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ background: '#fef3c7', color: '#d97706', padding: '8px 16px', borderRadius: '20px', fontWeight: '700' }}>⏱️ {formatTime(timeElapsed)}</span>
                  <span style={{ background: '#eff6ff', color: '#2563eb', padding: '8px 16px', borderRadius: '20px', fontWeight: '700' }}>Q: {questionIndex} / {totalQuestions}</span>
              </div>
          </div>
          <h3 style={{ fontSize: '1.8rem', color: '#0f172a', marginBottom: '40px', lineHeight: '1.4', fontWeight: '800' }}>
            {currentQuestion.name || currentQuestion.question || "Unable to display question text"}
          </h3>
          {errorMessage && <div className="clean-error-alert"><span>⚠️</span><p>{errorMessage}</p></div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
              {Object.entries(currentQuestion.options || {}).map(([key, value]) => {
                const isChecked = selectedAnswer === key;
                return (
                    <label key={key} style={{ padding: '20px', borderRadius: '16px', border: `2px solid ${isChecked ? 'var(--hub-primary)' : '#e2e8f0'}`, background: isChecked ? 'var(--hub-glow-light)' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s' }}>
                      <input type="radio" name="option" value={key} checked={isChecked} onChange={() => setSelectedAnswer(key)} style={{ display: 'none' }} />
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: isChecked ? 'var(--hub-primary)' : '#f1f5f9', color: isChecked ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>{key}</div>
                      <span style={{ fontSize: '1.15rem', color: isChecked ? 'var(--hub-primary-dark)' : '#334155', fontWeight: isChecked ? '700' : '500' }}>{value}</span>
                    </label>
                );
              })}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={submitAnswer} disabled={!selectedAnswer} className="hub-action-btn" style={{ flex: 2, margin: 0 }}>Submit Answer 🎯</button>
              <button onClick={endAssessmentEarly} className="hub-action-btn" style={{ flex: 1, margin: 0, background: '#fee2e2', color: '#ef4444', boxShadow: 'none' }}>End 🛑</button>
          </div>
        </div>
      );
    }

    if (showConfigDialog) {
      return (
        <div className="hub-panel-content">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
            <button onClick={() => setShowConfigDialog(false)} style={{ background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem', color: '#475569', marginRight: '20px' }}>←</button>
            <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: 0, fontWeight: '900' }}>Test Setup</h2>
          </div>
          {errorMessage && <div className="clean-error-alert"><span>⚠️</span><p>{errorMessage}</p></div>}
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
                    <span className="difficulty-icon">{level.icon}</span>{level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={startAssessment} disabled={loading} className="hub-action-btn">
            {loading ? 'Initializing...' : 'Start Assessment 🚀'}
          </button>
        </div>
      );
    }

    const hasData = gradeData[selectedGrade] && gradeData[selectedGrade].length > 0;
    return (
      <div className="hub-panel-content">
        <div className="hub-subjects-grid">
          {hasData ? (
              gradeData[selectedGrade].map(subj => (
                  <div key={subj} onClick={() => setSelectedSubject(subj)} className={`modern-subject-card ${selectedSubject === subj ? 'active' : ''}`}>
                      <div className="modern-subject-icon">{icon}</div>
                      <h3 className="modern-subject-title">{subj.replace(/_/g, ' ')}</h3>
                  </div>
              ))
          ) : (
              <div className="modern-subject-card" style={{ gridColumn: '1 / -1', borderColor: '#f1f5f9', opacity: 0.7 }}>
                <div className="modern-subject-icon" style={{ background: '#f8fafc', color: '#94a3b8' }}>📭</div>
                <h3 className="modern-subject-title" style={{ color: '#64748b' }}>No Modules Assigned</h3>
              </div>
          )}
        </div>
        <button onClick={openConfigDialog} disabled={!hasData || !selectedSubject} className="hub-action-btn">Configure {title} ⚙️</button>
      </div>
    );
  };

  return (
    <div className="universal-hub-container" style={{
        '--hub-primary': primaryColor, '--hub-primary-dark': secondaryColor,
        '--hub-gradient': `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        '--hub-glow': `${primaryColor}40`, '--hub-glow-light': `${primaryColor}15`
    }}>
      <button onClick={() => navigate('/assessments')} className="hub-back-btn"><span>←</span> Back to Hub</button>

      <div className="hub-hero-header">
        <div className="hub-symbols-float">
            {ambientSymbols.map((sym, i) => <span key={i} className="hub-symbol" style={{animationDelay: `${i}s`}}>{sym}</span>)}
        </div>
        <div style={{position: 'relative', zIndex: 1}}>
            <h1 className="hub-main-title">{title}</h1>
            <p className="hub-subtitle">{subtitle}</p>
        </div>
      </div>

      {videoCategories && !assessmentId && !showConfigDialog && !completed && (
        <div className="hub-tab-navigation">
            <button className={`hub-tab-btn ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => setActiveTab('videos')}>📺 Video Tutorials</button>
            <button className={`hub-tab-btn ${activeTab === 'assessments' ? 'active' : ''}`} onClick={() => setActiveTab('assessments')}>📝 Interactive Assessments</button>
        </div>
      )}

      {activeTab === 'videos' && videoCategories && !assessmentId && !completed ? (
        <div className="hub-videos-container">
            {videoCategories.map(category => (
                <div key={category.id} className="hub-video-category">
                    <div className="hub-category-header" style={{ borderLeftColor: category.color }}>
                        <span className="hub-category-icon">{category.icon}</span>
                        <h3>{category.title}</h3>
                    </div>
                    <div className="hub-playlists-grid">
                        {category.playlists.map((playlist, idx) => (
                            <div key={idx} className="hub-playlist-card" onClick={() => window.open(playlist.url, '_blank')}>
                                <div className="hub-playlist-thumbnail" style={{background: category.color}}><span className="hub-playlist-emoji">{playlist.thumbnail}</span></div>
                                <div className="hub-playlist-content">
                                    <h4>{playlist.title}</h4>
                                    <p className="hub-playlist-channel">📺 {playlist.channel}</p>
                                    <p className="hub-playlist-description">{playlist.description}</p>
                                    <div className="hub-topic-tags">{playlist.topics.map((t, i) => <span key={i} className="hub-topic-tag">{t}</span>)}</div>
                                </div>
                                <div className="hub-playlist-action">Watch Now →</div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      ) : (
        <div className="hub-dashboard-layout">
            {(!assessmentId && !showConfigDialog && !completed) && (
                <aside className="hub-vertical-sidebar">
                    <div className="sidebar-header">Academic Level</div>
                    <div className="vertical-grade-list">
                        {orderedGrades.map(grade => {
                            const hasData = gradeData[grade] && gradeData[grade].length > 0;
                            return (
                                <button key={grade} onClick={() => { if (hasData) { setSelectedGrade(grade); setSelectedSubject(gradeData[grade][0]); } }} disabled={!hasData} className={`vertical-grade-btn ${selectedGrade === grade ? 'active' : ''} ${!hasData ? 'disabled' : ''}`}>
                                    <span>Grade {grade.replace('GRADE_', '').replace('_', ' ')}</span>
                                    {hasData && <div className="grade-checkmark">✓</div>}
                                </button>
                            );
                        })}
                    </div>
                </aside>
            )}
            <main className="hub-main-panel" style={{ gridColumn: (assessmentId || showConfigDialog || completed) ? '1 / -1' : 'auto' }}>
                {renderAssessmentPanel()}
            </main>
        </div>
      )}
    </div>
  );
}