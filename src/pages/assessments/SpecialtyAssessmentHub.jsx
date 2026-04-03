import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import CONFIG from '../../Config';

export default function SpecialtyAssessmentHub({ title, subtitle, topics, primaryColor, secondaryColor, icon, ambientSymbols }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const currentUserId = user ? (user.id || user.email || 'GUEST_USER') : 'GUEST_USER';
    
    const [orderedGrades, setOrderedGrades] = useState([]);
    const [gradesLoading, setGradesLoading] = useState(true);

    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedTopic, setSelectedTopic] = useState(topics[0].id);
    
    const [loading, setLoading] = useState(false);
    const [isCompiling, setIsCompiling] = useState(false);
    const [compileProgress, setCompileProgress] = useState("");
    
    const [assessmentData, setAssessmentData] = useState(null);
    const [qCache, setQCache] = useState({}); 
    const [answers, setAnswers] = useState({}); 
    const [answerKey, setAnswerKey] = useState([]); 
    
    const [currentIndex, setCurrentIndex] = useState(1);
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [showPrintView, setShowPrintView] = useState(false);
    const [printConfig, setPrintConfig] = useState({ showAnswers: true, showExplanations: true });

    useEffect(() => {
        const loadGrades = async () => {
            try {
                const token = localStorage.getItem('token');
                const baseUrl = CONFIG.development.GATEWAY_URL || CONFIG.development.ADMIN_BASE_URL;
                const response = await axios.get(`${baseUrl}/admin-assessment/v1/grade-subjects`, { 
                    headers: { Authorization: token ? `Bearer ${token}` : '' } 
                });
                
                let activeGrades = (response.data || []).filter(g => g.isActive);
                activeGrades.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                
                setOrderedGrades(activeGrades);

                if (activeGrades.length > 0) {
                    setSelectedGrade(activeGrades[0].gradeCode);
                }
            } catch (error) {
                console.error('Error loading grades:', error);
            } finally {
                setGradesLoading(false);
            }
        };
        loadGrades();
    }, []);

    const getQDetails = (qNode) => {
        if (!qNode) return { qText: '', qOptions: {}, actualAnswer: 'N/A', explanation: '' };
        
        const qText = qNode.question?.name || qNode.name || qNode.questionText || "Data corrupted";
        const qOptions = qNode.question?.options || qNode.options || {};
        
        const actualAnswer = qNode.correctAnswer || "N/A";
        const explanation = qNode.explanation || "";
        
        return { qText, qOptions, actualAnswer, explanation };
    };

    // 🚀 FIX: High-Speed Concurrent Chunking! (No backend changes required)
    const compilePaper = async (assessmentId, totalQs) => {
        setIsCompiling(true);
        setCompileProgress(`Initializing secure connection...`);
        const token = localStorage.getItem('token');
        const baseUrl = CONFIG.development.GATEWAY_URL || CONFIG.development.ADMIN_BASE_URL;
        const newCache = { ...qCache };
        
        // Fetch in parallel batches of 5 to maximize speed without overloading the server
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
            await Promise.all(batch); // Wait for the batch to finish
            setCompileProgress(`Loaded ${Math.min(i + batchSize - 1, totalQs)} of ${totalQs} modules...`);
        }
        
        setQCache(newCache);
        setIsCompiling(false);
        return newCache;
    };

    const startAssessment = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = CONFIG.development.GATEWAY_URL || CONFIG.development.ADMIN_BASE_URL;

            const loadRes = await axios.post(`${baseUrl}/v1/assessment/questions/load`, {
                category: selectedGrade, 
                type: selectedTopic, 
                complexity: 'MEDIUM', 
                numberOfQuestions: 10,
                userId: currentUserId.toString(), 
                email: user?.email || ''
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            const assId = loadRes.data.assessmentId;
            const qCount = loadRes.data.numberOfQuestions || 10;
            setAssessmentData({ id: assId, count: qCount });
            
            // Start the lightning-fast background fetch
            compilePaper(assId, qCount);
            
            // 🚀 FIX: Read the Resume Index and Score directly from the backend if recovering a session!
            let resumeIndex = 1;
            if (loadRes.data.resumeQuestionIndex) resumeIndex = loadRes.data.resumeQuestionIndex;
            else if (loadRes.data.currentQuestionIndex) resumeIndex = loadRes.data.currentQuestionIndex;
            else if (loadRes.data.questionIndex) resumeIndex = loadRes.data.questionIndex;

            setCurrentIndex(resumeIndex);
            setScore(loadRes.data.currentScore || loadRes.data.score || 0);
            
            setAnswerKey([]);
            setAnswers({});
            setCompleted(false);
        } catch (err) {
            alert(`No questions found. Please ask your Admin to generate ${selectedTopic} questions for this Grade in the Dashboard!`);
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = async (selectedOption) => {
        const isLastQuestion = currentIndex === assessmentData.count;
        setAnswers(prev => ({ ...prev, [currentIndex]: selectedOption }));
        
        try {
            const token = localStorage.getItem('token');
            const baseUrl = CONFIG.development.GATEWAY_URL || CONFIG.development.ADMIN_BASE_URL;
            // Instantly sync the answer to the DB to ensure browser-close safety
            const res = await axios.post(`${baseUrl}/v1/assessment/questions/submit-answer`, {
                assessmentId: assessmentData.id, userId: currentUserId.toString(), email: user?.email || '',
                questionIndex: currentIndex, userAnswer: [selectedOption]
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            if (res.data && res.data.score !== undefined) {
                setScore(res.data.score); 
            }
        } catch (e) { 
            console.error("Failed to submit answer to backend", e);
        }

        if (isLastQuestion) {
            setCompleted(true);
            try {
                const token = localStorage.getItem('token');
                const baseUrl = CONFIG.development.GATEWAY_URL || CONFIG.development.ADMIN_BASE_URL;
                
                await axios.post(`${baseUrl}/v1/assessment/questions/submit`, {
                    userId: currentUserId.toString(), email: user?.email || '', assessmentId: assessmentData.id, reason: "Matrix Completed"
                }, { headers: { Authorization: `Bearer ${token}` } });
                
                const akRes = await axios.get(`${baseUrl}/v1/assessment/questions/${assessmentData.id}/answer-key?userId=${currentUserId.toString()}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (akRes.data?.data?.answers) {
                    setAnswerKey(akRes.data.data.answers);
                }
            } catch (e) {
                console.error("Failed to fetch answer key", e);
            }
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    if (gradesLoading || loading) return <div style={{ background: '#020617', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontSize: '5rem', animation: 'pulse 1.5s infinite' }}>{icon}</div><h2 style={{ color: primaryColor, fontSize: '2rem', fontFamily: 'monospace', letterSpacing: '3px', marginTop: '20px' }}>INITIALIZING SUBSYSTEMS...</h2></div>;
    if (isCompiling && !assessmentData) return <div style={{ background: '#020617', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontSize: '4rem', animation: 'spin 3s linear infinite' }}>⚙️</div><h2 style={{ color: primaryColor, fontSize: '1.5rem', fontFamily: 'monospace', marginTop: '20px' }}>{compileProgress}</h2></div>;

    if (showPrintView) {
        return (
            <div style={{ background: 'white', minHeight: '100vh', padding: '40px', fontFamily: '"Times New Roman", Times, serif', color: 'black' }}>
                <style>
                    {`
                        @media print {
                            html, body, #root, .app-container, .unified-dashboard-container, .dashboard-content, .content-body {
                                height: auto !important; min-height: auto !important; overflow: visible !important;
                                background: white !important; margin: 0 !important; padding: 0 !important; position: static !important;
                            }
                            .no-print { display: none !important; }
                            .print-wrapper { box-shadow: none !important; padding: 0 !important; max-width: 100% !important; margin: 0 !important; border: none !important; border-radius: 0 !important; }
                            @page { margin: 15mm; size: auto; }
                            * { color: black !important; text-shadow: none !important; }
                            .page-break { page-break-inside: avoid; margin-bottom: 30px; }
                        }
                    `}
                </style>
                <div className="no-print" style={{ maxWidth: '850px', margin: '0 auto 20px auto', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', gap: '20px', fontFamily: 'sans-serif' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            <input type="checkbox" checked={printConfig.showAnswers} onChange={e => setPrintConfig({...printConfig, showAnswers: e.target.checked})} /> Show Answers
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', opacity: printConfig.showAnswers ? 1 : 0.5 }}>
                            <input type="checkbox" disabled={!printConfig.showAnswers} checked={printConfig.showExplanations} onChange={e => setPrintConfig({...printConfig, showExplanations: e.target.checked})} /> Show Explanations
                        </label>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setShowPrintView(false)} style={{ padding: '10px 20px', background: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Close Report</button>
                        <button onClick={() => window.print()} style={{ padding: '10px 30px', background: primaryColor, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Print Document</button>
                    </div>
                </div>
                
                <div className="print-wrapper" style={{ background: 'white', color: 'black', padding: '40px', maxWidth: '850px', margin: '0 auto', border: '3px solid #1e293b', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '20px', marginBottom: '30px' }}>
                        <img src="/kivo-logo.png" alt="KiVO Learning" width="60" height="60" style={{ height: '60px', objectFit: 'contain', marginBottom: '10px' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        <h2 style={{ margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '24px' }}>KiVO Learning International</h2>
                        <h3 style={{ margin: '0 0 15px 0', color: '#555' }}>{title} {completed ? 'PERFORMANCE REPORT' : 'MOCK PAPER'}</h3>
                        
                        {completed && <p style={{ fontSize: '1.2rem', margin: '5px 0' }}>Final Score: <strong>{score} / {assessmentData.count}</strong></p>}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            <span>Student: {user?.username || user?.email || '_______________________'}</span>
                            <span>Grade: {orderedGrades.find(g => g.gradeCode === selectedGrade)?.gradeName || selectedGrade}</span>
                            <span>Date: {new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    {Array.from({ length: assessmentData.count }).map((_, i) => {
                        const qIndex = i + 1;
                        const { qText, qOptions, actualAnswer: cachedAnswer, explanation: cachedExp } = getQDetails(qCache[qIndex]);
                        const userAnswer = answers[qIndex] || 'Not Answered';
                        
                        const keyItem = answerKey.find(a => a.questionIndex === qIndex);
                        const actualAnswer = (keyItem && keyItem.correctAnswer && keyItem.correctAnswer !== 'N/A') ? keyItem.correctAnswer : cachedAnswer;
                        const explanation = (keyItem && keyItem.explanation) ? keyItem.explanation : cachedExp;
                        
                        const isCorrect = userAnswer === actualAnswer;
                        
                        return (
                            <div key={qIndex} className="page-break" style={{ paddingBottom: '20px', borderBottom: '1px dashed #ccc', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                    <strong>{qIndex}.</strong>
                                    <span style={{ fontSize: '1.1rem' }}>{qText}</span>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingLeft: '25px', marginBottom: '15px' }}>
                                    {Object.entries(qOptions).map(([k, v]) => (
                                        <div key={k}>({k}) {v}</div>
                                    ))}
                                </div>
                                
                                {completed ? (
                                    <div style={{ paddingLeft: '25px' }}>
                                        <div style={{ marginBottom: '5px', padding: '10px', background: isCorrect ? '#f0fdf4' : '#fef2f2', borderLeft: `4px solid ${isCorrect ? '#16a34a' : '#ef4444'}` }}>
                                            <span>Your Answer: <strong>{userAnswer}</strong></span>
                                            <span style={{ margin: '0 10px' }}>|</span>
                                            <span>Correct Answer: <strong>{actualAnswer}</strong></span>
                                        </div>
                                        {printConfig.showExplanations && explanation && (
                                            <div style={{ marginTop: '10px', color: '#444', fontStyle: 'italic' }}>
                                                <strong>Explanation:</strong> {explanation}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ paddingLeft: '25px', marginTop: '15px' }}>
                                        Your Answer: __________________
                                    </div>
                                )}

                                {!completed && printConfig.showAnswers && (
                                    <div style={{ paddingLeft: '25px', marginTop: '15px', padding: '10px', background: '#f8fafc', borderLeft: '4px solid #94a3b8' }}>
                                        <strong>Correct Answer: {actualAnswer}</strong>
                                        {printConfig.showExplanations && explanation && (
                                            <div style={{ marginTop: '5px', color: '#444', fontStyle: 'italic' }}>
                                                <strong>Explanation:</strong> {explanation}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #e2e8f0', color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        *** End of Report ***
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: `radial-gradient(circle at 50% 0%, ${secondaryColor}22 0%, #020617 100%)`, backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', fontFamily: '"Nunito", system-ui, sans-serif', padding: '20px' }}>
            <style>
            {`
                .cyber-glass-card {
                    background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-top: 1px solid rgba(255, 255, 255, 0.2); border-bottom: 3px solid ${primaryColor}88; border-radius: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5), inset 0 0 20px ${primaryColor}11;
                }
                .hover-glow:hover {
                    border-color: ${primaryColor}; background: rgba(255, 255, 255, 0.05); box-shadow: 0 15px 35px rgba(0,0,0,0.5), 0 0 30px ${primaryColor}66; transform: translateY(-5px) scale(1.02); z-index: 10;
                }
                .nav-btn {
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 10px 20px; border-radius: 50px; cursor: pointer; font-weight: bold; backdrop-filter: blur(5px); transition: 0.3s; display: flex; align-items: center; gap: 8px;
                }
                .nav-btn:hover { background: rgba(255,255,255,0.15); box-shadow: 0 0 15px rgba(255,255,255,0.2); }
                .topic-btn.active {
                    background: ${primaryColor}33; border-color: ${primaryColor}; box-shadow: 0 0 30px ${primaryColor}88, inset 0 0 15px ${primaryColor}44; transform: translateY(-8px) scale(1.05);
                }
                .ambient-bg { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 0; overflow: hidden; }
                .ambient-symbol { position: absolute; color: ${primaryColor}22; font-size: 5rem; font-weight: 900; animation: float 20s infinite ease-in-out alternate; }
                @keyframes float { 0% { transform: translate(0, 0) rotate(0deg); } 100% { transform: translate(100px, -100px) rotate(45deg); } }
            `}
            </style>

            <div className="ambient-bg">
                {ambientSymbols?.map((sym, i) => (
                    <div key={i} className="ambient-symbol" style={{ top: `${Math.random() * 80}%`, left: `${Math.random() * 80}%`, animationDelay: `${i * 2}s` }}>{sym}</div>
                ))}
            </div>

            <div style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', maxWidth: '1200px', margin: '0 auto 30px auto' }}>
                    <button className="nav-btn" onClick={() => navigate('/')}>🏠 Home</button>
                    <button className="nav-btn" onClick={() => navigate('/assessments')}>← Back to Hub</button>
                </div>

                {!assessmentData ? (
                    <div className="cyber-glass-card" style={{ maxWidth: '1000px', margin: '0 auto', padding: '50px', textAlign: 'center' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '10px', filter: `drop-shadow(0 0 20px ${primaryColor})` }}>{icon}</div>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#f8fafc', margin: '0 0 10px 0', letterSpacing: '1px' }}>{title}</h1>
                        <p style={{ color: '#94a3b8', fontSize: '1.3rem', marginBottom: '40px' }}>{subtitle}</p>
                        
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
                            {orderedGrades.map(g => (
                                <button key={g.gradeCode} onClick={() => setSelectedGrade(g.gradeCode)} className={`nav-btn ${selectedGrade === g.gradeCode ? 'active' : ''}`} style={{ background: selectedGrade === g.gradeCode ? primaryColor : 'rgba(255,255,255,0.05)', borderColor: selectedGrade === g.gradeCode ? primaryColor : 'rgba(255,255,255,0.1)' }}>
                                    {g.gradeName}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            {topics.map(t => (
                                <div key={t.id} onClick={() => setSelectedTopic(t.id)} className={`cyber-glass-card hover-glow topic-btn ${selectedTopic === t.id ? 'active' : ''}`} style={{ padding: '25px', cursor: 'pointer', transition: '0.4s' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{t.icon}</div>
                                    <div style={{ fontWeight: '900', fontSize: '1.2rem' }}>{t.label}</div>
                                </div>
                            ))}
                        </div>

                        <button onClick={startAssessment} style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, color: 'white', border: 'none', padding: '20px 60px', fontSize: '1.5rem', fontWeight: '900', borderRadius: '50px', cursor: 'pointer', boxShadow: `0 10px 30px ${primaryColor}88`, letterSpacing: '2px', transition: '0.3s' }}>
                            INITIALIZE 🚀
                        </button>
                    </div>
                ) : completed ? (
                    <div className="cyber-glass-card" style={{ maxWidth: '800px', margin: '50px auto', padding: '60px', textAlign: 'center' }}>
                        <div style={{ fontSize: '6rem', marginBottom: '20px', animation: 'bounce 2s infinite' }}>🏆</div>
                        <h2 style={{ fontSize: '3.5rem', color: '#f8fafc', fontWeight: '900', margin: '0 0 20px 0' }}>Module Conquered!</h2>
                        
                        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '40px', borderRadius: '30px', display: 'inline-block', border: `2px solid ${primaryColor}55`, marginBottom: '40px', boxShadow: `inset 0 0 30px ${primaryColor}22` }}>
                            <span style={{ fontSize: '6rem', color: primaryColor, fontWeight: '900', lineHeight: 1 }}>{score}</span>
                            <span style={{ fontSize: '3rem', color: '#64748b', margin: '0 20px' }}>/</span>
                            <span style={{ fontSize: '3.5rem', color: '#f8fafc', fontWeight: 'bold' }}>{assessmentData.count}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                            <button onClick={async () => { await compilePaper(assessmentData.id, assessmentData.count); setShowPrintView(true); }} className="nav-btn" style={{ background: primaryColor, padding: '15px 30px', fontSize: '1.2rem', borderColor: primaryColor }}>🖨️ Download Analytics</button>
                            <button onClick={() => setAssessmentData(null)} className="nav-btn" style={{ padding: '15px 30px', fontSize: '1.2rem' }}>🔄 Change Module</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <div style={{ background: `${primaryColor}22`, padding: '10px 24px', borderRadius: '50px', border: `1px solid ${primaryColor}`, fontWeight: 'bold', color: '#f8fafc', fontSize: '1.1rem' }}>
                                Node: {currentIndex} / {assessmentData.count}
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button onClick={async () => { await compilePaper(assessmentData.id, assessmentData.count); setShowPrintView(true); }} className="nav-btn" style={{ fontSize: '0.9rem' }}>🖨️ Print Mock Paper</button>
                                <div style={{ background: 'rgba(16,185,129,0.2)', padding: '10px 24px', borderRadius: '50px', border: '1px solid #10b981', fontWeight: 'bold', color: '#a7f3d0', fontSize: '1.1rem' }}>Score: {score}</div>
                            </div>
                        </div>

                        <div className="cyber-glass-card" style={{ padding: '60px', textAlign: 'center', marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '2.5rem', color: 'white', lineHeight: '1.5', fontWeight: '900', textShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>
                                {getQDetails(qCache[currentIndex]).qText}
                            </h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            {Object.entries(getQDetails(qCache[currentIndex]).qOptions).map(([key, value]) => (
                                <button key={key} onClick={() => submitAnswer(key)} className="cyber-glass-card hover-glow" style={{ padding: '25px 30px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', textAlign: 'left', transition: '0.3s', width: '100%' }}>
                                    <div style={{ background: `${primaryColor}33`, color: '#fff', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '900', boxShadow: `0 0 15px ${primaryColor}66` }}>{key}</div>
                                    <div style={{ color: 'white', fontSize: '1.4rem', fontWeight: 'bold' }}>{value}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}