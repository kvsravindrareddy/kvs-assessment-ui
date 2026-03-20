import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CONFIG from '../../Config';

export default function TechnologyAssessments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentUserId = user ? (user.id || user.email || 'GUEST') : 'GUEST';

  const [techSubjects, setTechSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTech, setSelectedTech] = useState('');
  const [complexity, setComplexity] = useState('MEDIUM');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);

  const [assessmentId, setAssessmentId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchTechPool = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${CONFIG.development.GATEWAY_URL || CONFIG.development.ADMIN_BASE_URL}/admin-assessment/v1/grade-subjects/pool`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Filter ONLY subjects flagged as Technology
        const techOnly = res.data.filter(sub => sub.isTechnology);
        setTechSubjects(techOnly);
      } catch (err) {
        console.error('Failed to load tech subjects', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTechPool();
  }, []);

  const startTechAssessment = async () => {
    if (!selectedTech) return;
    setLoading(true);
    try {
      const payload = {
        userId: currentUserId,
        email: user?.email || '',
        category: 'TECHNOLOGY', // 🚀 Hardcoded to bypass Grade logic!
        type: selectedTech,
        complexity: complexity,
        numberOfQuestions: numberOfQuestions
      };

      const res = await axios.post(`${CONFIG.development.ASSESSMENT_BASE_URL}/v1/assessment/load`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setAssessmentId(res.data.assessmentId);
      setTotalQuestions(res.data.numberOfQuestions || numberOfQuestions);
      await fetchQuestion(res.data.assessmentId, 1);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start assessment. Ensure Admin has loaded questions for this technology.');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestion = async (assId, index) => {
    const res = await axios.post(`${CONFIG.development.ASSESSMENT_BASE_URL}/v1/assessment/start`, {
      userId: currentUserId, email: user?.email || '', assessmentId: assId, questionIndex: index
    }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    
    setCurrentQuestion(res.data?.question?.question || res.data);
    setQuestionIndex(index);
    setSelectedAnswer('');
  };

  const submitAnswer = async () => {
    if (!selectedAnswer) return;
    const isLast = questionIndex === totalQuestions;
    try {
      const res = await axios.post(`${CONFIG.development.ASSESSMENT_BASE_URL}/v1/assessment/submit-answer`, {
        userId: currentUserId, email: user?.email || '', assessmentId: assessmentId, questionIndex: questionIndex, userAnswer: [selectedAnswer]
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

      setScore(res.data.score);
      if (isLast) setCompleted(true);
      else await fetchQuestion(assessmentId, questionIndex + 1);
    } catch (err) {
      alert("Failed to submit answer.");
    }
  };

  if (loading && !assessmentId) return <div style={{ color: '#38bdf8', textAlign: 'center', padding: '50px', fontSize: '1.5rem', fontFamily: 'monospace' }}>INITIALIZING NEURAL LINK...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: '"Fira Code", monospace', backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', borderRadius: '16px' }}>
      
      {!assessmentId ? (
        <div style={{ padding: '40px', border: '1px solid #334155', borderRadius: '16px', backgroundColor: '#0f172a', boxShadow: '0 0 40px rgba(56, 189, 248, 0.1)' }}>
          <h1 style={{ color: '#38bdf8', textAlign: 'center', fontSize: '2.5rem', margin: '0 0 10px 0', textShadow: '0 0 15px rgba(56, 189, 248, 0.4)' }}>💻 Cyber Matrix Assessments</h1>
          <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '40px' }}>Select your programming stack and bypass the mainframe.</p>

          <div style={{ display: 'grid', gap: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <div>
              <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>Select Technology Core:</label>
              <select value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)} style={{ width: '100%', padding: '15px', backgroundColor: '#1e293b', color: '#34d399', border: '1px solid #475569', borderRadius: '8px', fontSize: '1.2rem', outline: 'none' }}>
                <option value="">-- AWAITING SELECTION --</option>
                {techSubjects.map(sub => <option key={sub.subjectName} value={sub.subjectName}>{sub.subjectName.replace(/_/g, ' ')}</option>)}
              </select>
            </div>

            <div>
              <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>Algorithm Complexity:</label>
              <select value={complexity} onChange={(e) => setComplexity(e.target.value)} style={{ width: '100%', padding: '15px', backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #475569', borderRadius: '8px', fontSize: '1.2rem', outline: 'none' }}>
                <option value="EASY">EASY (Intern)</option>
                <option value="MEDIUM">MEDIUM (Junior Dev)</option>
                <option value="HARD">HARD (Senior Dev)</option>
                <option value="EXPERT">EXPERT (System Architect)</option>
              </select>
            </div>

            <button onClick={startTechAssessment} disabled={!selectedTech} style={{ width: '100%', padding: '20px', backgroundColor: selectedTech ? '#38bdf8' : '#334155', color: selectedTech ? '#0f172a' : '#94a3b8', border: 'none', borderRadius: '8px', fontSize: '1.3rem', fontWeight: 'bold', cursor: selectedTech ? 'pointer' : 'not-allowed', marginTop: '20px', transition: '0.3s' }}>
              {selectedTech ? 'EXECUTE // START' : 'AWAITING INPUT...'}
            </button>
          </div>
        </div>
      ) : completed ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px' }}>
          <h1 style={{ color: '#34d399', fontSize: '3rem', margin: '0 0 20px 0' }}>COMPILATION SUCCESS</h1>
          <div style={{ fontSize: '2rem', color: '#f8fafc', marginBottom: '40px' }}>Final Score: <span style={{ color: '#38bdf8', fontSize: '4rem' }}>{score} / {totalQuestions}</span></div>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '15px 30px', backgroundColor: 'transparent', color: '#38bdf8', border: '2px solid #38bdf8', borderRadius: '8px', fontSize: '1.2rem', cursor: 'pointer' }}>RETURN TO HUB</button>
        </div>
      ) : currentQuestion && (
        <div style={{ padding: '30px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '15px', marginBottom: '20px' }}>
            <span>RUNTIME: {selectedTech}</span>
            <span>NODE: {questionIndex} / {totalQuestions}</span>
            <span style={{ color: '#34d399' }}>SCORE: {score}</span>
          </div>

          <h2 style={{ color: '#f8fafc', fontSize: '1.4rem', lineHeight: '1.6', marginBottom: '20px' }}>{currentQuestion.name}</h2>

          {/* Code Snippet Renderer */}
          {currentQuestion.codeSnippet && (
            <div style={{ backgroundColor: '#020617', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #38bdf8', marginBottom: '30px', overflowX: 'auto' }}>
              <pre style={{ margin: 0, color: '#34d399' }}><code>{currentQuestion.codeSnippet}</code></pre>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
            {Object.entries(currentQuestion.options || {}).map(([key, value]) => (
              <label key={key} style={{ padding: '15px 20px', backgroundColor: selectedAnswer === key ? '#1e293b' : '#020617', border: `1px solid ${selectedAnswer === key ? '#38bdf8' : '#334155'}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', transition: '0.2s' }}>
                <input type="radio" value={key} checked={selectedAnswer === key} onChange={() => setSelectedAnswer(key)} style={{ display: 'none' }} />
                <div style={{ color: selectedAnswer === key ? '#38bdf8' : '#64748b', fontWeight: 'bold' }}>[{key}]</div>
                <span style={{ color: selectedAnswer === key ? '#f8fafc' : '#cbd5e1', fontSize: '1.1rem' }}>{value}</span>
              </label>
            ))}
          </div>

          <button onClick={submitAnswer} disabled={!selectedAnswer} style={{ width: '100%', padding: '20px', backgroundColor: selectedAnswer ? '#34d399' : '#334155', color: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', cursor: selectedAnswer ? 'pointer' : 'not-allowed' }}>
            {questionIndex === totalQuestions ? 'SUBMIT FINAL' : 'COMPILE & CONTINUE'}
          </button>
        </div>
      )}
    </div>
  );
}