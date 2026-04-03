import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import CONFIG from '../../Config';
import './UniversalSubjectHub.css';

export default function UniversalSubjectHub({ 
    title, 
    subtitle, 
    subjectKeywords, 
    primaryColor, 
    secondaryColor, 
    icon, 
    ambientSymbols 
}) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const currentUserId = user ? (user.id || user.email || 'GUEST_USER') : 'GUEST_USER';
    
    const [orderedGrades, setOrderedGrades] = useState([]);
    const [gradeSubjectMap, setGradeSubjectMap] = useState({});
    const [gradesLoading, setGradesLoading] = useState(true);

    const [selectedGrade, setSelectedGrade] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [complexity, setComplexity] = useState('MEDIUM');
    
    const [loading, setLoading] = useState(false);
    const [isCompiling, setIsCompiling] = useState(false);
    const [compileProgress, setCompileProgress] = useState("");
    
    const [assessmentData, setAssessmentData] = useState(null);
    const [qCache, setQCache] = useState({}); 
    const [answers, setAnswers] = useState({}); 
    
    const [currentIndex, setCurrentIndex] = useState(1);
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [showPrintView, setShowPrintView] = useState(false);
    const [printConfig, setPrintConfig] = useState({ showAnswers: false, showExplanations: false });

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // 🚀 1. DYNAMICALLY LOAD VALID GRADES & SUBJECTS FROM BACKEND
    useEffect(() => {
        const loadCurriculum = async () => {
            try {
                const token = localStorage.getItem('token');
                const baseUrl = CONFIG.development.GATEWAY_URL || CONFIG.development.ADMIN_BASE_URL;
                const response = await axios.get(`${baseUrl}/admin-assessment/v1/grade-subjects`, { 
                    headers: { Authorization: token ? `Bearer ${token}` : '' } 
                });
                
                let activeGrades = (response.data || []).filter(g => g.isActive);
                activeGrades.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                
                const validGradesList = [];
                const subjMap = {};
                
                activeGrades.forEach(g => {
                    // Filter subjects based on the keywords provided by the wrapper!
                    const matchedSubjects = (g.subjects || [])
                        .map(s => s.subjectName)
                        .filter(name => subjectKeywords.some(kw => name.toUpperCase().includes(kw.toUpperCase())));

                    if (matchedSubjects.length > 0) {
                        validGradesList.push(g.gradeCode);
                        subjMap[g.gradeCode] = matchedSubjects;
                    }
                });

                setOrderedGrades(validGradesList);
                setGradeSubjectMap(subjMap);

                if (validGradesList.length > 0) {
                    setSelectedGrade(validGradesList[0]);
                }
            } catch (error) {
                console.error('Error loading curriculum:', error);
            } finally {
                setGradesLoading(false);
            }
        };
        loadCurriculum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 🚀 2. ROBUST JSON EXTRACTOR
    const getQDetails = (qNode) => {
        if (!qNode) return { qText: '', qOptions: {}, actualAnswer: 'N/A', explanation: '' };
        const qText = qNode.question?.name || qNode.name || qNode.questionText || "Data corrupted";
        const qOptions = qNode.question?.options || qNode.options || {};
        let actualAnswer = "N/A";
        let explanation = "";
        const targetAns = qNode.answer || qNode.question?.answer || qNode.correctAnswer;
        if (targetAns) {
            if (targetAns.values && Array.isArray(targetAns.values)) actualAnswer = targetAns.values.join(', ');
            else if (typeof targetAns === 'string') actualAnswer = targetAns;
            explanation = targetAns.explanation || qNode.explanation || ""; 
        }
        return { qText, qOptions, actualAnswer, explanation };
    };

    // 🚀 3. SAFE CHUNKED COMPILER (Bypasses Backend 429 Errors safely)
    const compilePaper = async (assessmentId, totalQs) => {
        setIsCompiling(true);
        const token = localStorage.getItem('token');
        const baseUrl = CONFIG.development.GATEWAY_URL || CONFIG.development.ADMIN_BASE_URL;
        const newCache = { ...qCache };
        
        for(let i = 1; i <= totalQs; i++) {
            if (!newCache[i]) {
                setCompileProgress(`Downloading node ${i} of ${totalQs}...`);
                let success = false;
                let attempts = 0;
                while (!success && attempts < 3) {
                    try {
                        const qRes = await axios.post(`${baseUrl}/v1/assessment/questions/start`, {
                            userId: currentUserId.toString(), email: user?.email || '',
                            assessmentId: assessmentId, questionIndex: i
                        }, { headers: { Authorization: `Bearer ${token}` } });
                        
                        let qData = qRes.data.question || qRes.data;
                        if (qRes.data.questions && Array.isArray(qRes.data.questions)) qData = qRes.data.questions[0];
                        newCache[i] = qData;
                        success = true;
                        await sleep(150); 
                    } catch (e) {
                        attempts++;
                        await sleep(1000);
                    }
                }
            }
        }
        setQCache(newCache);
        setIsCompiling(false);
        return newCache;
    };

    const startAssessment = async () => {
        if (!selectedGrade || !selectedSubject) return alert("Please select a valid destination.");
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = CONFIG.development.GATEWAY_URL || CONFIG.development.ADMIN_BASE_URL;

            const loadRes = await axios.post(`${baseUrl}/v1/assessment/questions/load`, {
                category: selectedGrade, type: selectedSubject, complexity: complexity, numberOfQuestions: 10,
                userId: currentUserId, email: user?.email || ''
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            const assId = loadRes.data.assessmentId;
            const qCount = loadRes.data.numberOfQuestions || 10;
            setAssessmentData({ id: assId, count: qCount });
            
            // Start compiling questions in background while they play!
            compilePaper(assId, qCount);
            
            setCurrentIndex(1);
            setScore(0);
            setAnswers({});
            setCompleted(false);
        } catch (err) {
            alert("Failed to initialize Holographic Matrix. Please check network or ask Admin to load questions.");
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = async (selectedOption) => {
        const isLastQuestion = currentIndex === assessmentData.count;
        setAnswers(prev => ({ ...prev, [currentIndex]: selectedOption }));
        
        const cachedQ = qCache[currentIndex];
        const { actualAnswer } = getQDetails(cachedQ);
        if (selectedOption === actualAnswer) setScore(prev => prev + 10);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${CONFIG.development.GATEWAY_URL || CONFIG.development.ADMIN_BASE_URL}/v1/assessment/questions/submit-answer`, {
                assessmentId: assessmentData.id, userId: currentUserId, email: user?.email || '',
                questionIndex: currentIndex, userAnswer: [selectedOption]
            }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (e) { }

        if (isLastQuestion) {
            setCompleted(true);
            try {
                await axios.post(`${CONFIG.development.GATEWAY_URL || CONFIG.development.ADMIN_BASE_URL}/v1/assessment/questions/submit`, {
                    userId: currentUserId, email: user?.email || '', assessmentId: assessmentData.id, reason: "Matrix Completed"
                }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            } catch (e) {}
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    // --- RENDER LOGIC ---

    if (gradesLoading || loading) return (
        <div style={{ background: '#020617', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '5rem', animation: 'pulse 1.5s infinite' }}>{icon}</div>
            <h2 style={{ color: primaryColor, fontSize: '2rem', fontFamily: 'monospace', letterSpacing: '3px', marginTop: '20px' }}>INITIALIZING SUBSYSTEMS...</h2>
        </div>
    );

    if (isCompiling && !assessmentData) return (
        <div style={{ background: '#020617', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '4rem', animation: 'spin 3s linear infinite' }}>⚙️</div>
            <h2 style={{ color: primaryColor, fontSize: '1.5rem', fontFamily: 'monospace', marginTop: '20px' }}>{compileProgress}</h2>
        </div>
    );

    if (showPrintView) {
        return (
            <div style={{ background: 'white', minHeight: '100vh', padding: '40px', fontFamily: '"Times New Roman", serif' }}>
                <style>{`@media print { .no-print { display: none !important; } @page { margin: 20mm; } }`}</style>
                <div className="no-print" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <label><input type="checkbox" checked={printConfig.showAnswers} onChange={e => setPrintConfig({...printConfig, showAnswers: e.target.checked})} /> Answers</label>
                        <label><input type="checkbox" disabled={!printConfig.showAnswers} checked={printConfig.showExplanations} onChange={e => setPrintConfig({...printConfig, showExplanations: e.target.checked})} /> Explanations</label>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setShowPrintView(false)} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
                        <button onClick={() => window.print()} style={{ padding: '10px 30px', background: primaryColor, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Print</button>
                    </div>
                </div>
                <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '20px', marginBottom: '30px' }}>
                    <h2>KiVO Learning - {title} Report</h2>
                    {completed ? (
                        <p>Score: <strong>{score} / {assessmentData.count * 10}</strong></p>
                    ) : (
                        <p>Mock Paper - Grade {selectedGrade?.replace('GRADE_', '')}</p>
                    )}
                    <p>Student: {user?.username || user?.email || '__________'} | Date: {new Date().toLocaleDateString()}</p>
                </div>
                {Array.from({ length: assessmentData.count }).map((_, i) => {
                    const qIndex = i + 1;
                    const { qText, qOptions, actualAnswer, explanation } = getQDetails(qCache[qIndex]);
                    const userAnswer = answers[qIndex] || 'Not Answered';
                    const isCorrect = userAnswer === actualAnswer;
                    
                    return (
                        <div key={qIndex} style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px dashed #ccc', pageBreakInside: 'avoid' }}>
                            <p><strong>{qIndex}. {qText}</strong></p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingLeft: '20px', marginBottom: '10px' }}>
                                {Object.entries(qOptions).map(([k, v]) => <div key={k}>({k}) {v}</div>)}
                            </div>
                            
                            {completed ? (
                                <div style={{ paddingLeft: '20px', fontSize: '0.95rem' }}>
                                    <span>Your Answer: <strong style={{color: isCorrect ? 'green' : 'red'}}>{userAnswer}</strong> | </span>
                                    <span>Correct Answer: <strong style={{color: 'green'}}>{actualAnswer}</strong></span>
                                    {explanation && <div style={{ marginTop: '5px', fontStyle: 'italic', color: '#555' }}>Explanation: {explanation}</div>}
                                </div>
                            ) : (
                                <div style={{ paddingLeft: '20px' }}>Your Answer: _________</div>
                            )}

                            {!completed && printConfig.showAnswers && (
                                <div style={{ paddingLeft: '20px', marginTop: '10px', color: 'green', fontSize: '0.95rem' }}>
                                    <strong>Correct Answer: {actualAnswer}</strong>
                                    {printConfig.showExplanations && explanation && <div style={{ marginTop: '5px', fontStyle: 'italic', color: '#555' }}>Explanation: {explanation}</div>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div style={{ background: `radial-gradient(circle at 50% 0%, ${secondaryColor}22 0%, #020617 100%)`, backgroundColor: '#020617', color: '#f8fafc', minHeight: '100vh', fontFamily: '"Nunito", system-ui, sans-serif', padding: '20px' }}>
            
            {/* 🚀 THE 200-YEAR FUTURISTIC CSS */}
            <style>
            {`
                .cyber-glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-top: 1px solid rgba(255, 255, 255, 0.2);
                    border-bottom: 3px solid ${primaryColor}88;
                    border-radius: 32px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5), inset 0 0 20px ${primaryColor}11;
                }
                .hover-glow:hover {
                    border-color: ${primaryColor};
                    background: rgba(255, 255, 255, 0.05);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.5), 0 0 30px ${primaryColor}66;
                    transform: translateY(-5px) scale(1.02);
                    z-index: 10;
                }
                .nav-btn {
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white;
                    padding: 10px 20px; border-radius: 50px; cursor: pointer; font-weight: bold; backdrop-filter: blur(5px);
                    transition: 0.3s; display: flex; alignItems: center; gap: 8px;
                }
                .nav-btn:hover { background: rgba(255,255,255,0.15); box-shadow: 0 0 15px rgba(255,255,255,0.2); }
                .topic-btn.active {
                    background: ${primaryColor}33; border-color: ${primaryColor};
                    box-shadow: 0 0 30px ${primaryColor}88, inset 0 0 15px ${primaryColor}44;
                    transform: translateY(-8px) scale(1.05);
                }
                .ambient-bg {
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 0; overflow: hidden;
                }
                .ambient-symbol {
                    position: absolute; color: ${primaryColor}22; font-size: 5rem; font-weight: 900;
                    animation: float 20s infinite ease-in-out alternate;
                }
                @keyframes float {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    100% { transform: translate(100px, -100px) rotate(45deg); }
                }
            `}
            </style>

            <div className="ambient-bg">
                {ambientSymbols?.map((sym, i) => (
                    <div key={i} className="ambient-symbol" style={{ top: `${Math.random() * 80}%`, left: `${Math.random() * 80}%`, animationDelay: `${i * 2}s` }}>
                        {sym}
                    </div>
                ))}
            </div>

            <div style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', maxWidth: '1200px', margin: '0 auto 30px auto' }}>
                    <button className="nav-btn" onClick={() => navigate('/')}>🏠 Starbase Home</button>
                    <button className="nav-btn" onClick={() => navigate('/assessments')}>← Back to Hub</button>
                </div>

                {!assessmentData ? (
                    <div className="cyber-glass-card" style={{ maxWidth: '1000px', margin: '0 auto', padding: '50px', textAlign: 'center' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '10px', filter: `drop-shadow(0 0 20px ${primaryColor})` }}>{icon}</div>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#f8fafc', margin: '0 0 10px 0', letterSpacing: '1px' }}>{title}</h1>
                        <p style={{ color: '#94a3b8', fontSize: '1.3rem', marginBottom: '40px' }}>{subtitle}</p>
                        
                        {orderedGrades.length === 0 ? (
                            <div style={{ padding: '50px', border: `2px dashed ${primaryColor}55`, borderRadius: '24px' }}>
                                <span style={{ fontSize: '3rem' }}>📡</span>
                                <h3>No modules found in this sector.</h3>
                                <p>Ask your instructor to load {subjectKeywords[0]} content.</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
                                    {orderedGrades.map(g => (
                                        <button key={g} onClick={() => { setSelectedGrade(g); setSelectedSubject(null); }} className={`nav-btn ${selectedGrade === g ? 'active' : ''}`} style={{ background: selectedGrade === g ? primaryColor : 'rgba(255,255,255,0.05)', borderColor: selectedGrade === g ? primaryColor : 'rgba(255,255,255,0.1)' }}>
                                            Grade {g.replace('GRADE_', '').replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>

                                {gradeSubjectMap[selectedGrade] && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                                        {gradeSubjectMap[selectedGrade].map(sub => (
                                            <div key={sub} onClick={() => setSelectedSubject(sub)} className={`cyber-glass-card hover-glow topic-btn ${selectedSubject === sub ? 'active' : ''}`} style={{ padding: '25px', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                                                <div style={{ fontWeight: '900', fontSize: '1.2rem', letterSpacing: '0.5px' }}>{sub.replace(/_/g, ' ')}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button onClick={startAssessment} disabled={!selectedSubject} style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, color: 'white', border: 'none', padding: '20px 60px', fontSize: '1.5rem', fontWeight: '900', borderRadius: '50px', cursor: selectedSubject ? 'pointer' : 'not-allowed', opacity: selectedSubject ? 1 : 0.5, boxShadow: `0 10px 30px ${primaryColor}88`, letterSpacing: '2px', transition: '0.3s' }}>
                                    INITIALIZE 🚀
                                </button>
                            </>
                        )}
                    </div>
                ) : completed ? (
                    <div className="cyber-glass-card" style={{ maxWidth: '800px', margin: '50px auto', padding: '60px', textAlign: 'center' }}>
                        <div style={{ fontSize: '6rem', marginBottom: '20px', animation: 'bounce 2s infinite' }}>🏆</div>
                        <h2 style={{ fontSize: '3.5rem', color: '#f8fafc', fontWeight: '900', margin: '0 0 20px 0' }}>Module Conquered!</h2>
                        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '40px', borderRadius: '30px', display: 'inline-block', border: `2px solid ${primaryColor}55`, marginBottom: '40px', boxShadow: `inset 0 0 30px ${primaryColor}22` }}>
                            <span style={{ fontSize: '6rem', color: primaryColor, fontWeight: '900', lineHeight: 1 }}>{score}</span>
                            <span style={{ fontSize: '3rem', color: '#64748b', margin: '0 20px' }}>/</span>
                            <span style={{ fontSize: '3.5rem', color: '#f8fafc', fontWeight: 'bold' }}>{assessmentData.count * 10}</span>
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
                                <div style={{ background: 'rgba(16,185,129,0.2)', padding: '10px 24px', borderRadius: '50px', border: '1px solid #10b981', fontWeight: 'bold', color: '#a7f3d0', fontSize: '1.1rem' }}>
                                    Score: {score}
                                </div>
                            </div>
                        </div>

                        <div className="cyber-glass-card" style={{ padding: '60px', textAlign: 'center', marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '2.5rem', color: 'white', lineHeight: '1.5', fontWeight: '900', textShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>
                                {getQDetails(qCache[currentIndex]).qText}
                            </h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            {Object.entries(getQDetails(qCache[currentIndex]).qOptions).map(([key, value]) => (
                                <button 
                                    key={key}
                                    onClick={() => submitAnswer(key)}
                                    className="cyber-glass-card hover-glow"
                                    style={{ padding: '25px 30px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', textAlign: 'left', transition: '0.3s', width: '100%' }}
                                >
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