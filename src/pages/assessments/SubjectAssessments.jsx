import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CONFIG from '../../Config';

const orderedGrades = ['PRE_K', 'KINDERGARTEN', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

const getSubjectIcon = (subjectName) => {
  const s = subjectName.toUpperCase();
  if (s.includes('MATH')) return '📐';
  if (s.includes('ENGLISH')) return '📚';
  if (s.includes('SCIENCE')) return '🔬';
  if (s.includes('HISTORY')) return '🏛️';
  if (s.includes('GEOGRAPHY')) return '🌍';
  if (s.includes('COMPUTER') || s.includes('IT')) return '💻';
  return '📝'; 
};

export default function SubjectAssessments() {
  const { user } = useAuth(); 
  const navigate = useNavigate();

  const currentUserId = user ? (user.id || user.email || 'GUEST_USER') : 'GUEST_USER';

  const [gradeData, setGradeData] = useState({});
  const [selectedGrade, setSelectedGrade] = useState(orderedGrades[6]); // Defaults to V
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [assessmentId, setAssessmentId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(1); 
  
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const adminConfigURL = `${CONFIG.development.ADMIN_BASE_URL}/admin-assessment/v1/app-config/subject-types`;
  const loadAssessmentURL = `${CONFIG.development.GATEWAY_URL}/v1/assessment/questions/load`; 
  const startAssessmentURL = `${CONFIG.development.GATEWAY_URL}/v1/assessment/questions/start`; 
  const submitAnswerURL = `${CONFIG.development.GATEWAY_URL}/v1/assessment/questions/submit-answer`;

  useEffect(() => {
    fetch(adminConfigURL)
      .then(res => res.json())
      .then(data => setGradeData(data))
      .catch(err => console.error('Failed to load grades:', err));
  }, [adminConfigURL]);

  const startAssessment = async () => {
    if (!selectedGrade || !selectedSubject) return;
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Step 1: LOAD the assessment
      const loadRes = await axios.post(loadAssessmentURL, {
        userId: currentUserId,
        email: user?.email || '',
        category: selectedGrade,
        type: selectedSubject, // 🌟 FIXED: Changed 'subjectType' to 'type' to match LoadAssessmentRequest.java
        complexity: 'SIMPLE',
        numberOfQuestions: 10
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const newAssessmentId = loadRes.data.assessmentId;
      const totalQs = loadRes.data.numberOfQuestions || 10;
      
      setAssessmentId(newAssessmentId);
      setTotalQuestions(totalQs);
      
      // Step 2: START by fetching Question #1
      await fetchQuestion(newAssessmentId, 1);
      
      setScore(0);
      setSelectedAnswer('');
      setCompleted(false);

    } catch (err) {
      console.error('Error starting subject assessment:', err);
      alert('Could not load questions. Ensure the Admin has loaded questions for this Subject & Grade.');
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
      
      setCurrentQuestion(res.data);
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
      }
    } catch (err) {
      alert("Failed to submit answer.");
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
    } catch (err) {
        alert("Failed to end assessment.");
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
        <button onClick={() => navigate('/assessments')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span>←</span> Back to Hub
        </button>

      {!assessmentId ? (
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '30px 20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
            <h2 style={{ textAlign: 'center', fontSize: '2.2rem', color: '#1e293b', margin: '0 0 5px 0', fontWeight: '800' }}>Subject Assessments 📚</h2>
            <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '30px', fontSize: '1.1rem' }}>Select your Grade and Subject to begin.</p>

            {/* Grade Selector */}
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

            {/* Subject Selector */}
            {gradeData[selectedGrade] && gradeData[selectedGrade].length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '40px' }}>
                    {gradeData[selectedGrade].map(subject => (
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
                    No subjects loaded for this grade yet.
                </div>
            )}

            <button 
                onClick={startAssessment}
                disabled={loading || !selectedSubject}
                style={{ width: '100%', maxWidth: '400px', margin: '0 auto', display: 'block', padding: '20px', fontSize: '1.3rem', fontWeight: 'bold', borderRadius: '50px', background: !selectedSubject ? '#cbd5e1' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', cursor: !selectedSubject ? 'not-allowed' : 'pointer', boxShadow: !selectedSubject ? 'none' : '0 10px 25px rgba(16, 185, 129, 0.4)' }}
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
                <div style={{ display: 'flex', gap: '15px' }}>
                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        Q: {questionIndex} / {totalQuestions}
                    </span>
                    <span style={{ background: '#ecfdf5', color: '#059669', padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 0 0 2px #a7f3d0' }}>
                        Score: {score}
                    </span>
                </div>
            </div>
            
            <h3 style={{ fontSize: '1.6rem', color: '#0f172a', marginBottom: '30px', lineHeight: '1.5' }}>
                {currentQuestion.name}
            </h3>

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