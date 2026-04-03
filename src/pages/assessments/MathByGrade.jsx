import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CONFIG from '../../Config';

export default function MathByGrade() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentUserId = user ? (user.id || user.email || 'GUEST_USER') : 'GUEST_USER';

  const [orderedGrades, setOrderedGrades] = useState([]);
  const [gradeData, setGradeData] = useState({});
  const [gradesLoading, setGradesLoading] = useState(true);

  const [selectedGrade, setSelectedGrade] = useState('');
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [complexity, setComplexity] = useState('MEDIUM');

  const [assessmentData, setAssessmentData] = useState(null);
  const [qCache, setQCache] = useState({});
  const [answers, setAnswers] = useState({});
  const [answerKey, setAnswerKey] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(1);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState("");
  const [showPrintView, setShowPrintView] = useState(false);
  const [printConfig, setPrintConfig] = useState({ showAnswers: true, showExplanations: true });
  const [errorMessage, setErrorMessage] = useState('');

  const baseUrl = CONFIG.development.GATEWAY_URL || CONFIG.development.ADMIN_BASE_URL;
  const loadAssessmentURL = `${baseUrl}/v1/assessment/questions/load`;

  useEffect(() => {
    const loadGradesAndSubjects = async () => {
      try {
        setGradesLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${baseUrl}/admin-assessment/v1/grade-subjects`,
          { headers: { Authorization: token ? `Bearer ${token}` : '' } }
        );
        
        let activeGrades = (response.data || []).filter(g => g.isActive);
        activeGrades.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        
        const mathSubjMap = {};
        const validGradesList = [];
        
        activeGrades.forEach(g => {
          const mathSubjects = (g.subjects || [])
              .map(s => s.subjectName)
              .filter(name => 
                  name.toUpperCase().includes('MATH') || 
                  name.toUpperCase().includes('ALGEBRA') || 
                  name.toUpperCase().includes('GEOMETRY') || 
                  name.toUpperCase().includes('CALCULUS') ||
                  name.toUpperCase().includes('NUMBERS')
              );

          if (mathSubjects.length > 0) {
              validGradesList.push(g);
              mathSubjMap[g.gradeCode] = mathSubjects;
          }
        });

        setOrderedGrades(validGradesList);
        setGradeData(mathSubjMap);

        if (validGradesList.length > 0) {
          setSelectedGrade(validGradesList[0].gradeCode);
        }
      } catch (error) {
        console.error('Error loading curriculum:', error);
      } finally {
        setGradesLoading(false);
      }
    };

    loadGradesAndSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getQDetails = (qNode) => {
    if (!qNode) return { qText: '', qOptions: {}, actualAnswer: 'N/A', explanation: '' };
    const qText = qNode.question?.name || qNode.name || qNode.questionText || "Data corrupted";
    const qOptions = qNode.question?.options || qNode.options || {};
    const actualAnswer = qNode.correctAnswer || "N/A";
    const explanation = qNode.explanation || "";
    return { qText, qOptions, actualAnswer, explanation };
  };

  // 🚀 FIX: High-Speed Concurrent Chunking!
  const compilePaper = async (assessmentId, totalQs) => {
      setIsCompiling(true);
      setCompileProgress(`Gathering puzzle pieces...`);
      const token = localStorage.getItem('token');
      const newCache = { ...qCache };
      
      const batchSize = 5;
      for (let i = 1; i <= totalQs; i += batchSize) {
          const batch = [];
          for (let j = i; j < i + batchSize && j <= totalQs; j++) {
              if (!newCache[j]) {
                  const req = axios.post(`${baseUrl}/v1/assessment/questions/start`, {
                      userId: currentUserId.toString(), email: user?.email || '',
                      assessmentId: assessmentId, questionIndex: j
                  }, { headers: { Authorization: `Bearer ${token}` } })
                  .then(res => {
                      let qData = res.data.question || res.data;
                      if (res.data.questions && Array.isArray(res.data.questions)) qData = res.data.questions[0];
                      if (res.data.correctAnswer) qData.correctAnswer = res.data.correctAnswer;
                      if (res.data.explanation) qData.explanation = res.data.explanation;
                      newCache[j] = qData;
                  }).catch(() => console.warn(`Background fetch failed for Q${j}`));
                  batch.push(req);
              }
          }
          await Promise.all(batch);
          setCompileProgress(`Packed ${Math.min(i + batchSize - 1, totalQs)} of ${totalQs} items...`);
      }
      
      setQCache(newCache);
      setIsCompiling(false);
      return newCache;
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
        userId: currentUserId.toString(),
        email: user?.email || '',
        category: selectedGrade,
        type: mathSubject,
        complexity: complexity,
        numberOfQuestions: numberOfQuestions
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const assId = loadRes.data.assessmentId;
      const qCount = loadRes.data.numberOfQuestions || numberOfQuestions;

      setAssessmentData({ id: assId, count: qCount, subject: mathSubject });
      
      compilePaper(assId, qCount);
      
      // 🚀 FIX: Auto-Resume logic
      let resumeIndex = 1;
      if (loadRes.data.resumeQuestionIndex) resumeIndex = loadRes.data.resumeQuestionIndex;
      else if (loadRes.data.currentQuestionIndex) resumeIndex = loadRes.data.currentQuestionIndex;
      else if (loadRes.data.questionIndex) resumeIndex = loadRes.data.questionIndex;

      setShowConfigDialog(false);
      setAnswerKey([]);
      setCurrentIndex(resumeIndex);
      setScore(loadRes.data.currentScore || loadRes.data.score || 0);
      setAnswers({});
      setCompleted(false);
    } catch (err) {
      setErrorMessage('Could not load questions. Please ensure content is generated for this Grade.');
      setShowConfigDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (selectedOption) => {
      const isLastQuestion = currentIndex === assessmentData.count;
      setAnswers(prev => ({ ...prev, [currentIndex]: selectedOption }));
      
      try {
          const token = localStorage.getItem('token');
          const res = await axios.post(`${baseUrl}/v1/assessment/questions/submit-answer`, {
              assessmentId: assessmentData.id, userId: currentUserId.toString(), email: user?.email || '',
              questionIndex: currentIndex, userAnswer: [selectedOption]
          }, { headers: { Authorization: `Bearer ${token}` } });
          
          if (res.data && res.data.score !== undefined) {
              setScore(res.data.score);
          }
      } catch (e) { 
          console.error("Failed to sync answer");
      }

      if (isLastQuestion) {
          setCompleted(true);
          try {
              const token = localStorage.getItem('token');
              await axios.post(`${baseUrl}/v1/assessment/questions/submit`, {
                  userId: currentUserId.toString(), email: user?.email || '', assessmentId: assessmentData.id, reason: "Math Explorer Completed"
              }, { headers: { Authorization: `Bearer ${token}` } });
              
              const akRes = await axios.get(`${baseUrl}/v1/assessment/questions/${assessmentData.id}/answer-key?userId=${currentUserId.toString()}`, {
                  headers: { Authorization: `Bearer ${token}` }
              });
              
              if (akRes.data?.data?.answers) {
                  setAnswerKey(akRes.data.data.answers);
              }
          } catch (e) {}
      } else {
          setCurrentIndex(prev => prev + 1);
      }
  };

  if (gradesLoading || loading) return (
      <div style={{ background: '#f0fdf4', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '6rem', animation: 'bounce 1s infinite' }}>🧭</div>
          <h2 style={{ color: '#16a34a', fontSize: '2rem', fontWeight: '900', marginTop: '20px' }}>Packing your backpack...</h2>
      </div>
  );

  if (isCompiling && !assessmentData) return (
      <div style={{ background: '#f0fdf4', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '5rem', animation: 'spin 3s linear infinite' }}>⚙️</div>
          <h2 style={{ color: '#16a34a', fontSize: '1.5rem', fontWeight: '900', marginTop: '20px' }}>{compileProgress}</h2>
      </div>
  );

  if (showPrintView) {
      return (
          <div style={{ background: 'white', minHeight: '100vh', padding: '40px', fontFamily: '"Comic Sans MS", "Nunito", sans-serif', color: 'black' }}>
              <style>
                  {`
                      @media print {
                          html, body, #root, .app-container, .unified-dashboard-container, .dashboard-content { 
                              height: auto !important; min-height: auto !important; overflow: visible !important; background: white !important; margin: 0 !important; padding: 0 !important; position: static !important;
                          }
                          .no-print { display: none !important; }
                          
                          /* 🚀 FIX: Removed borders in print view to avoid multi-page cutoff issues */
                          .print-wrapper { 
                              box-shadow: none !important; 
                              padding: 0 !important; 
                              max-width: 100% !important; 
                              margin: 0 !important; 
                              border: none !important; 
                              border-radius: 0 !important; 
                          }
                          
                          * { color: black !important; }
                          @page { margin: 15mm; size: auto; }
                          .page-break { page-break-inside: avoid; margin-bottom: 30px; }
                      }
                  `}
              </style>
              
              <div className="no-print" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '2px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', gap: '20px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                          <input type="checkbox" checked={printConfig.showAnswers} onChange={e => setPrintConfig({...printConfig, showAnswers: e.target.checked})} /> Show Answers
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', opacity: printConfig.showAnswers ? 1 : 0.5 }}>
                          <input type="checkbox" disabled={!printConfig.showAnswers} checked={printConfig.showExplanations} onChange={e => setPrintConfig({...printConfig, showExplanations: e.target.checked})} /> Show Explanations
                      </label>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setShowPrintView(false)} style={{ padding: '10px 20px', background: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Close Report</button>
                      <button onClick={() => window.print()} style={{ padding: '10px 30px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Print Document</button>
                  </div>
              </div>
              
              <div className="print-wrapper" style={{ background: 'white', padding: '40px', maxWidth: '850px', margin: '0 auto', border: '4px solid #16a34a', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
                  <div style={{ textAlign: 'center', borderBottom: '3px dashed #16a34a', paddingBottom: '20px', marginBottom: '30px' }}>
                      <img src="/kivo-logo.png" alt="KiVO Learning" width="70" height="70" style={{ height: '70px', objectFit: 'contain', marginBottom: '15px' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      <h2 style={{ margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '28px', color: '#16a34a' }}>Math Explorer Report 🧭</h2>
                      
                      {completed && <div style={{ fontSize: '1.5rem', margin: '15px 0', background: '#f0fdf4', display: 'inline-block', padding: '10px 30px', borderRadius: '50px', border: '2px solid #22c55e' }}>Score: <strong>{score} / {assessmentData.count}</strong></div>}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', background: '#f8fafc', padding: '15px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                          <span>Student: {user?.username || user?.email || '_________________'}</span>
                          <span>{orderedGrades.find(g => g.gradeCode === selectedGrade)?.gradeName || selectedGrade}</span>
                          <span>Date: {new Date().toLocaleDateString()}</span>
                      </div>
                  </div>
                  
                  {Array.from({ length: assessmentData.count }).map((_, i) => {
                      const qIndex = i + 1;
                      const { qText, qOptions, actualAnswer: cachedAnswer, explanation: cachedExp } = getQDetails(qCache[qIndex]);
                      const userAnswer = answers[qIndex] || 'Skipped';
                      
                      const keyItem = answerKey.find(a => a.questionIndex === qIndex);
                      const actualAnswer = (keyItem && keyItem.correctAnswer && keyItem.correctAnswer !== 'N/A') ? keyItem.correctAnswer : cachedAnswer;
                      const explanation = (keyItem && keyItem.explanation) ? keyItem.explanation : cachedExp;
                      
                      const isCorrect = userAnswer === actualAnswer;
                      
                      return (
                          <div key={qIndex} className="page-break" style={{ paddingBottom: '20px', borderBottom: '2px dashed #e2e8f0', marginBottom: '20px' }}>
                              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                  <strong style={{ fontSize: '1.4rem', color: '#3b82f6' }}>{qIndex}.</strong>
                                  <span style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{qText}</span>
                              </div>
                              
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingLeft: '40px', marginBottom: '15px', fontSize: '1.1rem' }}>
                                  {Object.entries(qOptions).map(([k, v]) => (
                                      <div key={k}><strong>({k})</strong> {v}</div>
                                  ))}
                              </div>
                              
                              {completed ? (
                                  <div style={{ marginLeft: '40px', background: isCorrect ? '#f0fdf4' : '#fef2f2', padding: '15px', borderRadius: '12px', border: `2px solid ${isCorrect ? '#22c55e' : '#ef4444'}` }}>
                                      <div style={{ fontSize: '1.1rem' }}>
                                          <span>Your Answer: <strong style={{color: isCorrect ? '#16a34a' : '#dc2626'}}>{userAnswer}</strong></span>
                                          <span style={{ margin: '0 15px', color: '#cbd5e1' }}>|</span>
                                          <span>Correct Answer: <strong style={{color: '#16a34a'}}>{actualAnswer}</strong></span>
                                      </div>
                                      {printConfig.showExplanations && explanation && (
                                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '2px dashed #cbd5e1', color: '#475569', fontStyle: 'italic' }}>
                                              <strong>💡 How to solve it:</strong> {explanation}
                                          </div>
                                      )}
                                  </div>
                              ) : (
                                  <div style={{ marginLeft: '40px', marginTop: '15px', fontSize: '1.2rem', color: '#94a3b8' }}>
                                      Your Answer: ____________________
                                  </div>
                              )}

                              {!completed && printConfig.showAnswers && (
                                  <div style={{ marginLeft: '40px', marginTop: '15px', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '2px solid #cbd5e1' }}>
                                      <strong style={{ color: '#16a34a', fontSize: '1.1rem' }}>Correct Answer: {actualAnswer}</strong>
                                      {printConfig.showExplanations && explanation && (
                                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '2px dashed #e2e8f0', color: '#475569', fontStyle: 'italic' }}>
                                              <strong>💡 How to solve it:</strong> {explanation}
                                          </div>
                                      )}
                                  </div>
                              )}
                          </div>
                      );
                  })}
                  
                  {/* 🚀 FIX: Document Footer for clean ending */}
                  <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #e2e8f0', color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>
                      *** End of Report ***
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div style={{ background: '#f0fdf4', color: '#334155', minHeight: '100vh', fontFamily: '"Nunito", "Comic Sans MS", sans-serif' }}>
      
      {/* 🚀 KID-FRIENDLY CSS INJECTION */}
      <style>
        {`
          .explorer-layout { display: flex; min-height: calc(100vh - 60px); }
          .explorer-sidebar {
              width: 300px; background: white; border-right: 4px dashed #86efac; padding: 30px 20px;
              display: flex; flex-direction: column; gap: 15px; box-shadow: 5px 0 20px rgba(0,0,0,0.03); z-index: 10;
          }
          .grade-btn {
              background: white; border: 3px solid #e2e8f0; color: #64748b; padding: 18px 20px; border-radius: 20px;
              text-align: left; font-weight: 900; font-size: 1.2rem; cursor: pointer; transition: all 0.2s;
              display: flex; align-items: center; gap: 15px; box-shadow: 0 4px 0 #e2e8f0;
          }
          .grade-btn:hover { background: #f8fafc; transform: translateY(2px); box-shadow: 0 2px 0 #e2e8f0; }
          .grade-btn.active {
              background: #10b981; border-color: #047857; color: white; box-shadow: 0 4px 0 #065f46; transform: translateY(-2px);
          }
          .explorer-main { flex: 1; padding: 40px; overflow-y: auto; }
          
          .fun-btn {
              background: #3b82f6; color: white; border: 3px solid #1d4ed8; padding: 16px 32px; border-radius: 50px;
              font-weight: 900; font-size: 1.3rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 6px 0 #1d4ed8;
              display: inline-flex; align-items: center; justify-content: center; gap: 10px; text-transform: uppercase;
          }
          .fun-btn:hover { transform: translateY(2px); box-shadow: 0 4px 0 #1d4ed8; }
          .fun-btn:active { transform: translateY(6px); box-shadow: 0 0 0 #1d4ed8; }
          .fun-btn:disabled { background: #94a3b8; border-color: #475569; box-shadow: 0 6px 0 #475569; cursor: not-allowed; }

          .nav-top-btn {
              background: white; border: 3px solid #cbd5e1; color: #475569; padding: 10px 20px; border-radius: 16px;
              font-weight: 900; cursor: pointer; box-shadow: 0 4px 0 #cbd5e1; transition: 0.2s; display: flex; align-items: center; gap: 8px;
          }
          .nav-top-btn:hover { transform: translateY(2px); box-shadow: 0 2px 0 #cbd5e1; }

          .radio-card {
              background: white; border: 4px solid #e2e8f0; padding: 25px; border-radius: 24px; cursor: pointer;
              transition: all 0.2s; display: flex; alignItems: center; gap: 20px; box-shadow: 0 6px 0 #cbd5e1; margin-bottom: 15px;
          }
          .radio-card:hover { border-color: #60a5fa; transform: translateY(2px); box-shadow: 0 4px 0 #93c5fd; }
          .radio-card.selected { border-color: #3b82f6; background: #eff6ff; box-shadow: 0 4px 0 #2563eb; transform: scale(1.02); }
        `}
      </style>

      <div style={{ display: 'flex', gap: '15px', padding: '20px 30px 0 30px' }}>
          <button className="nav-top-btn" onClick={() => navigate('/')}>🏠 Home</button>
          <button className="nav-top-btn" onClick={() => navigate('/assessments')}>← Back to Hub</button>
      </div>

      {!assessmentData && !showConfigDialog ? (
        <div className="explorer-layout">
          <aside className="explorer-sidebar">
            <h2 style={{ color: '#0f172a', fontSize: '1.8rem', textAlign: 'center', fontWeight: '900', marginBottom: '10px' }}>Basecamps ⛺</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orderedGrades.map((g) => (
                <button
                  key={g.gradeCode}
                  className={`grade-btn ${selectedGrade === g.gradeCode ? 'active' : ''}`}
                  onClick={() => setSelectedGrade(g.gradeCode)}
                >
                  <span style={{ fontSize: '1.6rem' }}>🎒</span> {g.gradeName}
                </button>
              ))}
            </div>
          </aside>

          <main className="explorer-main">
            <div style={{ background: 'white', borderRadius: '32px', padding: '50px', border: '4px dashed #fbbf24', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '5rem', marginBottom: '20px', animation: 'bounce 2s infinite' }}>🧭</div>
              <h1 style={{ fontSize: '3.5rem', color: '#d97706', fontWeight: '900', margin: '0 0 15px 0' }}>Math Explorer</h1>
              <p style={{ color: '#64748b', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '40px' }}>
                Get ready for a math adventure tailored to <strong>{orderedGrades.find(g => g.gradeCode === selectedGrade)?.gradeName || 'your grade'}</strong>!
              </p>
              
              {gradeData[selectedGrade] && gradeData[selectedGrade].length > 0 ? (
                  <div style={{ background: '#f0fdf4', border: '3px solid #4ade80', borderRadius: '24px', padding: '30px', display: 'inline-block', marginBottom: '40px' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📐</div>
                      <h3 style={{ margin: 0, color: '#16a34a', fontSize: '1.5rem', fontWeight: '900' }}>{gradeData[selectedGrade][0].replace(/_/g, ' ')}</h3>
                  </div>
              ) : (
                  <div style={{ background: '#fef2f2', border: '3px solid #f87171', borderRadius: '24px', padding: '30px', display: 'inline-block', marginBottom: '40px' }}>
                      <h3 style={{ margin: 0, color: '#dc2626', fontSize: '1.5rem', fontWeight: '900' }}>No paths found in this sector.</h3>
                  </div>
              )}
              
              <div style={{ display: 'block' }}>
                <button onClick={() => setShowConfigDialog(true)} disabled={!gradeData[selectedGrade] || gradeData[selectedGrade].length === 0} className="fun-btn" style={{ background: '#10b981', borderColor: '#047857', boxShadow: '0 6px 0 #047857' }}>
                    Pack your Bag! 🎒
                </button>
              </div>
            </div>
          </main>
        </div>
      ) : showConfigDialog ? (
          <div style={{ maxWidth: '700px', margin: '50px auto', background: 'white', borderRadius: '32px', padding: '50px', border: '4px solid #3b82f6', boxShadow: '0 15px 0 #2563eb' }}>
              <button onClick={() => setShowConfigDialog(false)} className="nav-top-btn" style={{ marginBottom: '30px' }}>← Wait, go back</button>
              
              <h2 style={{ textAlign: 'center', fontSize: '2.5rem', color: '#1d4ed8', fontWeight: '900', margin: '0 0 30px 0' }}>Choose Your Path 🗺️</h2>
              
              {errorMessage && (
                  <div style={{ background: '#fef2f2', color: '#dc2626', padding: '15px', borderRadius: '16px', fontWeight: 'bold', marginBottom: '20px', border: '2px solid #f87171', textAlign: 'center' }}>
                      ⚠️ {errorMessage}
                  </div>
              )}

              <div style={{ marginBottom: '30px' }}>
                  <label style={{ display: 'block', fontWeight: '900', color: '#475569', marginBottom: '10px', fontSize: '1.2rem' }}>How many puzzles? 🧩</label>
                  <select value={numberOfQuestions} onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))} style={{ width: '100%', padding: '15px 20px', fontSize: '1.2rem', borderRadius: '16px', border: '3px solid #cbd5e1', fontWeight: 'bold', outline: 'none' }}>
                      <option value={5}>5 Puzzles (Quick Trip)</option>
                      <option value={10}>10 Puzzles (Standard Trek)</option>
                      <option value={20}>20 Puzzles (Epic Journey)</option>
                  </select>
              </div>

              <div style={{ marginBottom: '40px' }}>
                  <label style={{ display: 'block', fontWeight: '900', color: '#475569', marginBottom: '10px', fontSize: '1.2rem' }}>How tricky? 🤔</label>
                  <div style={{ display: 'flex', gap: '15px' }}>
                      {['EASY', 'MEDIUM', 'HARD'].map(level => (
                          <button key={level} onClick={() => setComplexity(level)} style={{ flex: 1, padding: '15px', borderRadius: '16px', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', transition: '0.2s', border: complexity === level ? '3px solid #f59e0b' : '3px solid #e2e8f0', background: complexity === level ? '#fef3c7' : 'white', color: complexity === level ? '#b45309' : '#64748b' }}>
                              {level === 'EASY' && '😊 Easy'}
                              {level === 'MEDIUM' && '🤔 Tricky'}
                              {level === 'HARD' && '🧠 Expert'}
                          </button>
                      ))}
                  </div>
              </div>

              <button onClick={startAssessment} disabled={loading} className="fun-btn" style={{ width: '100%', padding: '20px', fontSize: '1.5rem' }}>
                  {loading ? 'Rolling out Map...' : 'Start Expedition! 🚀'}
              </button>
          </div>
      ) : completed ? (
          <div style={{ maxWidth: '800px', margin: '50px auto', textAlign: 'center', background: 'white', border: '4px solid #10b981', padding: '60px', borderRadius: '40px', boxShadow: '0 15px 0 #059669' }}>
              <div style={{ fontSize: '7rem', marginBottom: '20px', animation: 'bounce 2s infinite' }}>🏅</div>
              <h2 style={{ fontSize: '3.5rem', color: '#047857', fontWeight: '900', margin: '0 0 20px 0' }}>Expedition Complete!</h2>
              
              <div style={{ display: 'inline-block', background: '#f0fdf4', padding: '30px 60px', borderRadius: '30px', border: '4px dashed #4ade80', marginBottom: '40px' }}>
                  <span style={{ fontSize: '5rem', color: '#16a34a', fontWeight: '900' }}>{score}</span>
                  <span style={{ fontSize: '3rem', color: '#94a3b8', margin: '0 20px' }}>/</span>
                  <span style={{ fontSize: '4rem', color: '#0f172a', fontWeight: '900' }}>{assessmentData.count}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <button onClick={async () => { await compilePaper(assessmentData.id, assessmentData.count); setShowPrintView(true); }} className="fun-btn" style={{ background: '#f59e0b', borderColor: '#d97706', boxShadow: '0 6px 0 #d97706' }}>🖨️ Print Trophy Sheet</button>
                  <button onClick={() => setAssessmentData(null)} className="fun-btn">🔄 New Adventure</button>
              </div>
          </div>
      ) : (
          <div style={{ maxWidth: '900px', margin: '30px auto', background: 'white', borderRadius: '32px', padding: '40px', border: '4px solid #3b82f6', boxShadow: '0 15px 0 #2563eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '4px dashed #bfdbfe', paddingBottom: '20px' }}>
                  <div style={{ background: '#dbeafe', padding: '10px 24px', borderRadius: '50px', border: '3px solid #93c5fd', fontWeight: '900', color: '#1d4ed8', fontSize: '1.2rem' }}>
                      Puzzle {currentIndex} of {assessmentData.count}
                  </div>
                  <div style={{ display: 'flex', gap: '15px' }}>
                      <button onClick={async () => { await compilePaper(assessmentData.id, assessmentData.count); setShowPrintView(true); }} className="nav-top-btn" style={{ fontSize: '1rem' }}>🖨️ Peek at Map</button>
                      <div style={{ background: '#d1fae5', padding: '10px 24px', borderRadius: '50px', border: '3px solid #6ee7b7', fontWeight: '900', color: '#047857', fontSize: '1.2rem' }}>
                          Stars: {score}
                      </div>
                  </div>
              </div>

              <div style={{ padding: '40px 20px', textAlign: 'center', marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '2.5rem', color: '#0f172a', lineHeight: '1.5', fontWeight: '900' }}>
                      {getQDetails(qCache[currentIndex]).qText}
                  </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  {Object.entries(getQDetails(qCache[currentIndex]).qOptions).map(([key, value]) => (
                      <button key={key} onClick={() => submitAnswer(key)} className="radio-card">
                          <div style={{ background: '#3b82f6', color: 'white', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: '900', border: '3px solid #1d4ed8' }}>{key}</div>
                          <div style={{ color: '#334155', fontSize: '1.5rem', fontWeight: '900' }}>{value}</div>
                      </button>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
}