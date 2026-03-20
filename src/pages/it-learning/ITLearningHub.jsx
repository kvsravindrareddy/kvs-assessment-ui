import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConfig } from '../../Config';

export default function ITLearningHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const config = getConfig();
  
  // Safe fallback while AuthContext loads
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

  // 🚀 1. FETCH ONLY TECHNOLOGIES FROM THE DB POOL
  useEffect(() => {
    const fetchTechPool = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = config.GATEWAY_URL || config.ADMIN_BASE_URL;
        
        const res = await axios.get(`${baseUrl}/admin-assessment/v1/grade-subjects/pool`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter ONLY subjects flagged as Technology
        const techOnly = (res.data || []).filter(sub => sub.isTechnology || sub.technology);
        setTechSubjects(techOnly);
      } catch (err) {
        console.error('Failed to load tech subjects from DB', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTechPool();
  }, [config.GATEWAY_URL, config.ADMIN_BASE_URL]);

  // 🚀 2. START ASSESSMENT (Fixed API Endpoint)
  const startTechAssessment = async () => {
    if (!selectedTech) return;
    setLoading(true);
    try {
      const payload = {
        userId: currentUserId,
        email: user?.email || '',
        category: 'TECHNOLOGY', // Hardcoded Grade-Agnostic
        type: selectedTech,     
        complexity: complexity,
        numberOfQuestions: numberOfQuestions
      };

      // 🚀 FIX: Updated to /v1/assessment/questions/load to resolve the 404!
      const res = await axios.post(`${config.ASSESSMENT_BASE_URL}/v1/assessment/questions/load`, payload, {
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

  // 🚀 3. FETCH SINGLE QUESTION (Fixed API Endpoint)
  const fetchQuestion = async (assId, index) => {
    const res = await axios.post(`${config.ASSESSMENT_BASE_URL}/v1/assessment/questions/start`, {
      userId: currentUserId, email: user?.email || '', assessmentId: assId, questionIndex: index
    }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    
    setCurrentQuestion(res.data?.question?.question || res.data);
    setQuestionIndex(index);
    setSelectedAnswer('');
  };

  // 🚀 4. SUBMIT ANSWER (Fixed API Endpoint)
  const submitAnswer = async () => {
    if (!selectedAnswer) return;
    const isLast = questionIndex === totalQuestions;
    setLoading(true);
    try {
      const res = await axios.post(`${config.ASSESSMENT_BASE_URL}/v1/assessment/questions/submit-answer`, {
        userId: currentUserId, email: user?.email || '', assessmentId: assessmentId, questionIndex: questionIndex, userAnswer: [selectedAnswer]
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

      setScore(res.data.score);
      if (isLast) setCompleted(true);
      else await fetchQuestion(assessmentId, questionIndex + 1);
    } catch (err) {
      alert("Failed to submit answer.");
    } finally {
      setLoading(false);
    }
  };

  const copyCodeToClipboard = () => {
    if (currentQuestion?.codeSnippet) {
      navigator.clipboard.writeText(currentQuestion.codeSnippet);
      alert('Code Copied to Clipboard!');
    }
  };

  // --- UI RENDERERS ---

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#f8fafc', fontFamily: '"Fira Code", monospace' }}>
      
      {/* 🚀 CYBER-THEMED INTEGRATED HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', backgroundColor: '#0f172a', borderBottom: '1px solid #334155', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ background: 'transparent', color: '#38bdf8', border: '1px solid #38bdf8', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ← SYSTEM HUB
          </button>
          <h2 style={{ margin: 0, color: '#34d399', fontSize: '1.5rem', letterSpacing: '1px' }}>KIVO // IT_MATRIX</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
           <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
             OPERATIVE ID: <span style={{ color: '#f8fafc', fontWeight: 'bold', letterSpacing: '1px' }}>{user?.firstName?.toUpperCase() || user?.email?.toUpperCase() || 'AWAITING_AUTH...'}</span>
           </span>
        </div>
      </header>

      {/* 🚀 MAIN CONTENT CONTAINER */}
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
        
        {loading && !assessmentId && techSubjects.length === 0 ? (
          <div style={{ color: '#38bdf8', textAlign: 'center', padding: '50px', fontSize: '1.5rem' }}>INITIALIZING NEURAL LINK... FETCHING TECHNOLOGIES...</div>
        ) : !assessmentId ? (
          
          <div style={{ padding: '40px', border: '1px solid #334155', borderRadius: '16px', backgroundColor: '#0f172a', boxShadow: '0 0 40px rgba(56, 189, 248, 0.1)' }}>
            <h1 style={{ color: '#38bdf8', textAlign: 'center', fontSize: '2.5rem', margin: '0 0 10px 0', textShadow: '0 0 15px rgba(56, 189, 248, 0.4)' }}>
              💻 IT & Programming Matrix
            </h1>
            <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '40px' }}>
              Select your technology stack. Assessments are grade-agnostic.
            </p>

            <div style={{ display: 'grid', gap: '25px', maxWidth: '600px', margin: '0 auto' }}>
              
              <div>
                <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Programming Language / Tech: *</label>
                <select 
                  value={selectedTech} 
                  onChange={(e) => setSelectedTech(e.target.value)} 
                  style={{ width: '100%', padding: '15px', backgroundColor: '#1e293b', color: '#34d399', border: '1px solid #475569', borderRadius: '8px', fontSize: '1.2rem', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="">-- AWAITING SELECTION --</option>
                  {techSubjects.map(sub => (
                    <option key={sub.subjectName} value={sub.subjectName}>{sub.subjectName.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                {techSubjects.length === 0 && !loading && (
                  <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '5px' }}>
                    No technologies found. Please sync the core DB from the Admin Dashboard.
                  </p>
                )}
              </div>

              <div>
                <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Algorithm Complexity:</label>
                <select 
                  value={complexity} 
                  onChange={(e) => setComplexity(e.target.value)} 
                  style={{ width: '100%', padding: '15px', backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #475569', borderRadius: '8px', fontSize: '1.2rem', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="EASY">EASY (Intern / Beginner)</option>
                  <option value="MEDIUM">MEDIUM (Junior Developer)</option>
                  <option value="HARD">HARD (Senior Developer)</option>
                  <option value="EXPERT">EXPERT (System Architect)</option>
                </select>
              </div>

              <div>
                <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Number of Questions:</label>
                <select 
                  value={numberOfQuestions} 
                  onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))} 
                  style={{ width: '100%', padding: '15px', backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #475569', borderRadius: '8px', fontSize: '1.2rem', outline: 'none', cursor: 'pointer' }}
                >
                  <option value={5}>5 Questions</option><option value={10}>10 Questions</option><option value={15}>15 Questions</option>
                </select>
              </div>

              <button 
                onClick={startTechAssessment} 
                disabled={!selectedTech || loading} 
                style={{ 
                  width: '100%', padding: '20px', 
                  backgroundColor: selectedTech && !loading ? '#38bdf8' : '#334155', 
                  color: selectedTech && !loading ? '#0f172a' : '#94a3b8', 
                  border: 'none', borderRadius: '8px', fontSize: '1.3rem', fontWeight: 'bold', 
                  cursor: selectedTech && !loading ? 'pointer' : 'not-allowed', 
                  marginTop: '10px', transition: '0.3s',
                  boxShadow: selectedTech && !loading ? '0 0 20px rgba(56, 189, 248, 0.4)' : 'none'
                }}
              >
                {loading ? 'COMPILING REQUEST...' : (selectedTech ? 'EXECUTE // START' : 'AWAITING INPUT...')}
              </button>
            </div>
          </div>

        ) : completed ? (

          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', boxShadow: '0 0 40px rgba(16, 185, 129, 0.1)' }}>
            <h1 style={{ color: '#34d399', fontSize: '3rem', margin: '0 0 20px 0' }}>COMPILATION SUCCESS</h1>
            <div style={{ fontSize: '2rem', color: '#f8fafc', marginBottom: '40px' }}>
              Final Assessment Score: <br/>
              <span style={{ color: '#38bdf8', fontSize: '5rem', fontWeight: 'bold' }}>{score} <span style={{ color: '#64748b', fontSize: '3rem' }}>/</span> {totalQuestions}</span>
            </div>
            <button 
              onClick={() => { setAssessmentId(null); setCompleted(false); setSelectedTech(''); }} 
              style={{ padding: '15px 30px', backgroundColor: 'transparent', color: '#38bdf8', border: '2px solid #38bdf8', borderRadius: '8px', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}
            >
              RETURN TO TERMINAL
            </button>
          </div>

        ) : currentQuestion && (

          <div style={{ padding: '30px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', position: 'relative' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '15px', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ background: '#1e293b', padding: '5px 15px', borderRadius: '20px', color: '#38bdf8' }}>RUNTIME: {selectedTech}</span>
              <span style={{ background: '#1e293b', padding: '5px 15px', borderRadius: '20px', color: '#f8fafc' }}>NODE: {questionIndex} / {totalQuestions}</span>
              <span style={{ background: '#1e293b', padding: '5px 15px', borderRadius: '20px', color: '#34d399' }}>SCORE: {score}</span>
            </div>

            <h2 style={{ color: '#f8fafc', fontSize: '1.4rem', lineHeight: '1.6', marginBottom: '25px', fontWeight: '500' }}>
              {currentQuestion.name}
            </h2>

            {/* 🚀 CYBER CODE SNIPPET RENDERER */}
            {currentQuestion.codeSnippet && (
              <div style={{ backgroundColor: '#020617', borderRadius: '8px', borderLeft: '4px solid #38bdf8', marginBottom: '35px', overflow: 'hidden', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#1e293b', padding: '8px 15px', borderBottom: '1px solid #334155' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {currentQuestion.codeLanguage || selectedTech || 'SOURCE CODE'}
                  </span>
                  <button 
                    onClick={copyCodeToClipboard} 
                    style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase' }}
                  >
                    📋 Copy
                  </button>
                </div>
                <div style={{ padding: '20px', overflowX: 'auto' }}>
                  <pre style={{ margin: 0, color: '#34d399', fontSize: '1.05rem', lineHeight: '1.5' }}>
                    <code>{currentQuestion.codeSnippet}</code>
                  </pre>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
              {Object.entries(currentQuestion.options || {}).map(([key, value]) => (
                <label 
                  key={key} 
                  style={{ 
                    padding: '18px 20px', 
                    backgroundColor: selectedAnswer === key ? '#1e293b' : '#020617', 
                    border: `2px solid ${selectedAnswer === key ? '#38bdf8' : '#334155'}`, 
                    borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', transition: '0.2s',
                    boxShadow: selectedAnswer === key ? '0 4px 15px rgba(56, 189, 248, 0.1)' : 'none'
                  }}
                >
                  <input type="radio" value={key} checked={selectedAnswer === key} onChange={() => setSelectedAnswer(key)} style={{ display: 'none' }} />
                  <div style={{ color: selectedAnswer === key ? '#0f172a' : '#64748b', backgroundColor: selectedAnswer === key ? '#38bdf8' : 'transparent', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold', border: `2px solid ${selectedAnswer === key ? '#38bdf8' : '#64748b'}` }}>
                    {key}
                  </div>
                  <span style={{ color: selectedAnswer === key ? '#f8fafc' : '#cbd5e1', fontSize: '1.1rem', fontFamily: value.includes('{') || value.includes(';') ? '"Fira Code", monospace' : 'inherit' }}>
                    {value}
                  </span>
                </label>
              ))}
            </div>

            <button 
              onClick={submitAnswer} 
              disabled={!selectedAnswer || loading} 
              style={{ 
                width: '100%', padding: '20px', backgroundColor: selectedAnswer && !loading ? '#34d399' : '#334155', 
                color: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', 
                cursor: selectedAnswer && !loading ? 'pointer' : 'not-allowed',
                boxShadow: selectedAnswer && !loading ? '0 4px 15px rgba(52, 211, 153, 0.4)' : 'none'
              }}
            >
              {loading ? 'PROCESSING...' : (questionIndex === totalQuestions ? 'SUBMIT FINAL' : 'COMPILE & CONTINUE')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}