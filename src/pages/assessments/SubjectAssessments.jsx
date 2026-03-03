import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CONFIG from '../../Config';
import '../../css/AssessmentFlow.css';

const orderedGrades = [
  'PRE_K', 'KINDERGARTEN', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'
];

const getSubjectIcon = (subjectName) => {
  const s = subjectName.toUpperCase();
  if (s.includes('MATH')) return '📐';
  if (s.includes('ENGLISH')) return '📚';
  if (s.includes('SCIENCE')) return '🔬';
  if (s.includes('HISTORY')) return '🏛️';
  if (s.includes('GEOGRAPHY')) return '🌍';
  if (s.includes('SOCIAL')) return '🤝';
  if (s.includes('COMPUTER') || s.includes('IT')) return '💻';
  if (s.includes('HINDI') || s.includes('TELUGU') || s.includes('LANGUAGE')) return '🗣️';
  return '📝'; 
};

export default function SubjectAssessments() {
  const { user } = useAuth(); 
  const navigate = useNavigate();

  const [gradeData, setGradeData] = useState({});
  const [selectedGrade, setSelectedGrade] = useState(orderedGrades[0]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [assessmentDetails, setAssessmentDetails] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Configure these endpoints to match your QuestionAssessmentRestController mappings
  const adminConfigURL = `${CONFIG.development.ADMIN_BASE_URL}/admin-assessment/v1/app-config/subject-types`;
  const startAssessmentURL = `${CONFIG.development.GATEWAY_URL}/api/assessment/questions/start`; 
  const submitAnswerURL = `${CONFIG.development.GATEWAY_URL}/api/assessment/questions/submit-answer`;

  // Load available Grades and Subjects
  useEffect(() => {
    fetch(adminConfigURL)
      .then(res => res.json())
      .then(data => {
        setGradeData(data);
        if (data[orderedGrades[0]] && data[orderedGrades[0]].length > 0) {
          setSelectedSubject(data[orderedGrades[0]][0]);
        }
      })
      .catch(err => console.error('Failed to load grades configuration:', err));
  }, [adminConfigURL]);

  const handleSelectGrade = (grade) => {
    setSelectedGrade(grade);
    const subjectsForGrade = gradeData[grade] || [];
    if (subjectsForGrade.length > 0) {
      setSelectedSubject(subjectsForGrade[0]);
    } else {
      setSelectedSubject(null);
    }
  };

  const startAssessment = async () => {
    if (!selectedGrade || !selectedSubject) return;
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const currentUserId = user ? (user.id || user.email || 'GUEST_USER') : 'GUEST_USER';
      
      // Calls the backend to generate/fetch questions for the selected grade and subject
      const res = await axios.post(startAssessmentURL, {
        userId: currentUserId,
        category: selectedGrade,
        subjectType: selectedSubject,
        complexity: 'EASY', // Can be made dynamic later
        numberOfQuestions: 10
      }, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      
      const backendData = res.data;
      setAssessmentDetails(backendData);
      setQuestionIndex(backendData.resumeQuestionIndex || 0);
      setScore(backendData.currentScore || 0);
      setSelectedAnswer('');
      setCompleted(false);
      
    } catch (err) {
      console.error('Error starting subject assessment:', err);
      alert('Could not load questions. Ensure the Admin has loaded questions for this Subject & Grade.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!assessmentDetails || !selectedAnswer) return;
    
    const isLastQuestion = questionIndex === assessmentDetails.questions.length - 1;
    const currentUserId = user ? (user.id || user.email || 'GUEST_USER') : 'GUEST_USER';
    const currentQuestion = assessmentDetails.questions[questionIndex];

    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        userId: currentUserId,
        assessmentId: assessmentDetails.assessmentId, 
        questionId: currentQuestion.id,
        sequenceNumber: currentQuestion.sequenceNumber || questionIndex,
        userAnswer: [selectedAnswer],
        lastQuestion: isLastQuestion
      };

      const res = await axios.post(submitAnswerURL, payload, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });

      // Update score from backend validation
      if (res.data && res.data.currentScore !== undefined) {
          setScore(res.data.currentScore);
      }

      setSelectedAnswer('');

      if (!isLastQuestion) {
        setQuestionIndex(prev => prev + 1);
      } else {
        setCompleted(true);
      }
      
    } catch (err) {
      console.error("Failed to submit answer:", err);
      alert("Error saving answer. Please check your connection.");
    }
  };

  const endAssessmentEarly = async () => {
    if (!window.confirm("Are you sure you want to end this assessment early? Your score will be saved.")) return;
    
    try {
        const token = localStorage.getItem('token');
        const currentUserId = user ? (user.id || user.email || 'GUEST_USER') : 'GUEST_USER';
        
        await axios.post(`${CONFIG.development.GATEWAY_URL}/api/assessment/end-session`, null, {
            params: {
                userId: currentUserId,
                assessmentId: assessmentDetails.assessmentId,
                assessmentType: selectedSubject
            },
            headers: { Authorization: `Bearer ${token}` }
        });

        setCompleted(true);
    } catch (err) {
        alert("Failed to end assessment.");
    }
  };

  return (
    <div className="timeless-layout">
      {!assessmentDetails ? (
        <div className="timeless-grid">
          <aside className="timeless-sidebar">
            <h2 className="sidebar-title">Grade Levels</h2>
            <nav className="grade-nav">
              {orderedGrades.map((grade) => (
                <button
                  key={grade}
                  className={`grade-nav-item ${selectedGrade === grade ? 'active' : ''}`}
                  onClick={() => handleSelectGrade(grade)}
                >
                  <span className="grade-icon">🏫</span> {grade.replace('_', ' ')}
                </button>
              ))}
            </nav>
          </aside>

          <main className="timeless-main">
            <header className="main-header">
              <div className="header-text-group">
                <h1 className="grade-title">Subject Assessments</h1>
                <p className="grade-subtitle">Select a subject for Grade {selectedGrade.replace('_', ' ')} to begin your test.</p>
              </div>
              
              {gradeData[selectedGrade] && gradeData[selectedGrade].length > 0 ? (
                <div className="innovative-subject-dock">
                  {gradeData[selectedGrade].map(subject => (
                    <button
                      key={subject}
                      className={`subject-tab ${selectedSubject === subject ? 'active' : ''}`}
                      onClick={() => setSelectedSubject(subject)}
                    >
                      <span className="subject-icon">{getSubjectIcon(subject)}</span>
                      <span className="subject-name">{subject.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ marginTop: '40px' }}>
                  <span className="empty-icon">📭</span>
                  <h3>No Subjects Configured</h3>
                  <p>Check back later for Grade {selectedGrade}.</p>
                </div>
              )}
            </header>

            {selectedSubject && (
              <section className="cards-container" style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <div style={{ background: '#ffffff', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>{getSubjectIcon(selectedSubject)}</div>
                    <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>{selectedSubject.replace('_', ' ')} Assessment</h2>
                    <p style={{ color: '#64748b', marginBottom: '30px' }}>Test your knowledge with 10 carefully curated questions.</p>
                    
                    <button 
                        onClick={startAssessment}
                        disabled={loading}
                        style={{ width: '100%', padding: '18px', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '50px', background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 20px rgba(15,23,42,0.2)' }}
                    >
                        {loading ? 'Loading Questions...' : 'Start Assessment 🚀'}
                    </button>
                </div>
              </section>
            )}
          </main>
        </div>
      ) : (
        <div className="focus-reading-mode">
          <button className="back-btn" onClick={() => { setAssessmentDetails(null); navigate('/assessments'); }}>
            ← Back to Assessment Hub
          </button>
          
          <div className="reading-canvas" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="assessment-section">
              {completed ? (
                <div className="assessment-done-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div className="done-icon" style={{ fontSize: '5rem', marginBottom: '20px' }}>🏆</div>
                  <h3 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', color: '#1e293b' }}>Assessment Complete</h3>
                  <p style={{ color: '#64748b', fontSize: '1.2rem' }}>You finished the {selectedSubject} challenge!</p>
                  <div className="score-display" style={{ display: 'inline-block', background: '#f8fafc', padding: '30px 60px', borderRadius: '30px', margin: '30px 0', border: '2px solid #e2e8f0' }}>
                    <span className="score-number" style={{ fontSize: '4rem', color: '#3b82f6', fontWeight: '900' }}>{score}</span> 
                    <span style={{ fontSize: '2rem', color: '#cbd5e1', margin: '0 20px' }}>/</span> 
                    <span style={{ fontSize: '2.5rem', color: '#64748b', fontWeight: 'bold' }}>{assessmentDetails.questions.length}</span>
                  </div>
                  <br/>
                  <button onClick={() => setAssessmentDetails(null)} className="modern-submit-btn" style={{ padding: '15px 40px', borderRadius: '50px' }}>
                    Take Another Test
                  </button>
                </div>
              ) : (
                assessmentDetails.questions && assessmentDetails.questions.length > 0 && (
                  <div className="modern-question-box" style={{ padding: '40px' }}>
                    <div className="question-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                      <span className="q-badge" style={{ fontSize: '1.1rem' }}>Question {questionIndex + 1} of {assessmentDetails.questions.length}</span>
                      <span className="q-badge" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>Score: {score}</span>
                    </div>
                    
                    <h3 className="q-text" style={{ fontSize: '1.8rem', lineHeight: '1.5', color: '#0f172a', marginBottom: '30px' }}>
                        {assessmentDetails.questions[questionIndex].name}
                    </h3>

                    <div className="modern-options" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
                      {Object.entries(assessmentDetails.questions[questionIndex].options).map(([key, value]) => {
                        const isChecked = selectedAnswer === key;
                        return (
                          <label key={key} className={`modern-option-label ${isChecked ? 'selected' : ''}`} style={{ padding: '20px', borderRadius: '16px', border: `2px solid ${isChecked ? '#3b82f6' : '#e2e8f0'}`, background: isChecked ? '#eff6ff' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', transition: 'all 0.2s' }}>
                            <input
                              type="radio"
                              name="option"
                              value={key}
                              checked={isChecked}
                              onChange={() => setSelectedAnswer(key)}
                              style={{ display: 'none' }}
                            />
                            <div className="opt-indicator" style={{ width: '35px', height: '35px', borderRadius: '50%', background: isChecked ? '#3b82f6' : '#f1f5f9', color: isChecked ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{key}</div>
                            <span className="opt-text" style={{ fontSize: '1.2rem', color: isChecked ? '#1e293b' : '#475569', fontWeight: isChecked ? 'bold' : 'normal' }}>{value}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button
                        onClick={submitAnswer}
                        disabled={!selectedAnswer}
                        style={{ flex: 2, padding: '20px', fontSize: '1.3rem', fontWeight: 'bold', borderRadius: '50px', background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', opacity: !selectedAnswer ? 0.5 : 1, transition: 'all 0.2s' }}
                        >
                        Submit Answer 🎯
                        </button>
                        
                        <button 
                            onClick={endAssessmentEarly}
                            style={{ flex: 1, padding: '20px', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '50px', background: '#fee2e2', color: '#ef4444', border: '2px solid #fca5a5', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            End 🛑
                        </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}