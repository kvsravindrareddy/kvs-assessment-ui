import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { getConfig } from '../../Config';

export default function CompetitiveAssessmentFlow() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const config = getConfig();
    
    const exam = state?.exam;
    const startInPrintMode = state?.printMode || false;
    
    // UI States
    const [loading, setLoading] = useState(true);
    const [isCompiling, setIsCompiling] = useState(false);
    const [compileProgress, setCompileProgress] = useState("");
    const [showPrintView, setShowPrintView] = useState(false);
    const [printConfig, setPrintConfig] = useState({ showAnswers: false, showExplanations: false });

    // Exam States
    const [sectionsData, setSectionsData] = useState([]);
    const [timeLeft, setTimeLeft] = useState(exam?.totalDurationMinutes ? exam.totalDurationMinutes * 60 : 0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [scoreResult, setScoreResult] = useState(null);

    const [activeSectionId, setActiveSectionId] = useState(null);
    const [activeQIndex, setActiveQIndex] = useState(1); 
    const [qLoading, setQLoading] = useState(false);

    // Shared Memory Cache
    const [qCache, setQCache] = useState({}); 
    const [answers, setAnswers] = useState({}); 
    const [statuses, setStatuses] = useState({}); 

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // 🚀 BULLETPROOF QUESTION EXTRACTOR
    const getQDetails = (qNode) => {
        if (!qNode) return { qText: '', qOptions: {}, actualAnswer: 'N/A', explanation: '' };

        const qText = qNode.question?.name || qNode.name || qNode.questionText || "Question text missing";
        const qOptions = qNode.question?.options || qNode.options || {};
        
        let actualAnswer = "N/A";
        let explanation = "";

        const targetAns = qNode.answer || qNode.question?.answer || qNode.correctAnswer;
        if (targetAns) {
            if (targetAns.values && Array.isArray(targetAns.values)) {
                actualAnswer = targetAns.values.join(', ');
            } else if (typeof targetAns === 'string') {
                actualAnswer = targetAns;
            }
            explanation = targetAns.explanation || qNode.explanation || ""; 
        }
        
        return { qText, qOptions, actualAnswer, explanation };
    };

    // 🚀 THE COMPILER: Fetches ONLY the questions that aren't already in cache
    const compileFullPaper = async (currentSections) => {
        setIsCompiling(true);
        const token = localStorage.getItem('token');
        const userId = user?.username || user?.id || 'GUEST';
        const userEmail = user?.email || 'guest@kivolearning.com';
        const baseUrl = config.GATEWAY_URL || config.ASSESSMENT_BASE_URL;

        const newCache = { ...qCache };
        
        for (const section of currentSections) {
            if (!newCache[section.id]) newCache[section.id] = {};
            
            for(let i = 1; i <= section.questionCount; i++) {
                if (!newCache[section.id][i]) {
                    setCompileProgress(`Downloading ${section.sectionName}: Q${i} of ${section.questionCount}...`);
                    
                    let success = false;
                    let attempts = 0;
                    while (!success && attempts < 3) {
                        try {
                            const qRes = await axios.post(`${baseUrl}/v1/assessment/questions/start`, {
                                userId: userId.toString(), email: userEmail,
                                assessmentId: section.assessmentId, questionIndex: i
                            }, { headers: { Authorization: `Bearer ${token}` } });
                            
                            let qData = qRes.data.question || qRes.data;
                            if (qRes.data.questions && Array.isArray(qRes.data.questions)) qData = qRes.data.questions[0];

                            newCache[section.id][i] = qData;
                            success = true;
                            await sleep(150); // Safe delay to bypass 429
                        } catch (e) {
                            attempts++;
                            await sleep(1000);
                        }
                    }
                }
            }
        }
        setQCache(newCache);
        setIsCompiling(false);
        return newCache;
    };

    useEffect(() => {
        if (!exam) return navigate('/competitive-hub');

        const initializeSessions = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = user?.username || user?.id || 'GUEST';
                const userEmail = user?.email || 'guest@kivolearning.com'; 
                const baseUrl = config.GATEWAY_URL || config.ASSESSMENT_BASE_URL;

                const loadedSections = [];

                for (let s = 0; s < exam.sections.length; s++) {
                    const section = exam.sections[s];
                    if (s > 0) await sleep(500); 

                    const payload = {
                        category: exam.examName, 
                        type: section.sectionName, 
                        complexity: "COMPLEX", 
                        numberOfQuestions: section.questionCount,
                        userId: userId.toString(),
                        email: userEmail 
                    };
                    
                    const res = await axios.post(`${baseUrl}/v1/assessment/questions/load`, payload, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    loadedSections.push({ ...section, assessmentId: res.data.assessmentId });
                }

                setSectionsData(loadedSections);
                
                const initStatuses = {};
                loadedSections.forEach(sec => {
                    initStatuses[sec.id] = {};
                    for(let i=1; i<=sec.questionCount; i++) {
                        initStatuses[sec.id][i] = 'NOT_VISITED';
                    }
                });
                setStatuses(initStatuses);

                setActiveSectionId(loadedSections[0]?.id);
                setLoading(false);

                // If user clicked "Generate Mock Paper", immediately compile and print
                if (startInPrintMode) {
                    await compileFullPaper(loadedSections);
                    setPrintConfig({ showAnswers: false, showExplanations: false });
                    setShowPrintView(true);
                    setTimeout(() => window.print(), 500);
                } else {
                    fetchAndSetQuestion(loadedSections[0]?.id, 1, loadedSections[0]?.assessmentId);
                }

            } catch (error) {
                console.error("Initialization Failed", error);
                alert("Failed to initialize exam. Please check your network and try again.");
                navigate('/competitive-hub');
            }
        };

        initializeSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exam]);

    useEffect(() => {
        if (loading || isSubmitted || showPrintView || isCompiling || timeLeft <= 0) return;

        if (timeLeft <= 0) {
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
                oscillator.connect(audioCtx.destination);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 1.5); 
            } catch(e) {}

            alert("⏰ TIME IS UP! The simulation will now be auto-submitted.");
            handleSubmit(true); 
            return;
        }

        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [loading, isSubmitted, showPrintView, isCompiling, timeLeft]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const fetchAndSetQuestion = async (sectionId, qIndex, overrideAssessmentId = null) => {
        setActiveSectionId(sectionId);
        setActiveQIndex(qIndex);
        
        setStatuses(prev => {
            if (prev[sectionId]?.[qIndex] === 'NOT_VISITED') {
                return { ...prev, [sectionId]: { ...prev[sectionId], [qIndex]: 'NOT_ANSWERED' } };
            }
            return prev;
        });

        // 🚀 ENSURE RESUME WORKS: Quietly update the backend tracking index
        syncAnswerToBackend(sectionId, qIndex, answers[sectionId]?.[qIndex] || null, overrideAssessmentId);

        if (qCache[sectionId]?.[qIndex]) return;

        setQLoading(true);
        try {
            const token = localStorage.getItem('token');
            const userId = user?.username || user?.id || 'GUEST';
            const userEmail = user?.email || 'guest@kivolearning.com'; 
            const baseUrl = config.GATEWAY_URL || config.ASSESSMENT_BASE_URL;
            const targetSection = sectionsData.find(s => s.id === sectionId);
            const targetAssessmentId = overrideAssessmentId || targetSection?.assessmentId;

            const res = await axios.post(`${baseUrl}/v1/assessment/questions/start`, {
                userId: userId.toString(),
                email: userEmail,
                assessmentId: targetAssessmentId,
                questionIndex: qIndex
            }, { headers: { Authorization: `Bearer ${token}` } });

            let qData = res.data.question || res.data;
            if (res.data.questions && Array.isArray(res.data.questions)) qData = res.data.questions[0];

            setQCache(prev => ({ ...prev, [sectionId]: { ...(prev[sectionId] || {}), [qIndex]: qData } }));
        } catch (err) {
            console.error(`Failed to fetch Q${qIndex}`, err);
        } finally {
            setQLoading(false);
        }
    };

    const handleAnswerSelect = (optionKey) => {
        setAnswers(prev => ({
            ...prev,
            [activeSectionId]: { ...(prev[activeSectionId] || {}), [activeQIndex]: optionKey }
        }));
    };

    const syncAnswerToBackend = (sectionId, qIndex, answerVal, overrideAssessmentId = null) => {
        const targetSection = sectionsData.find(s => s.id === sectionId);
        if (!targetSection && !overrideAssessmentId) return;

        const payload = {
            assessmentId: overrideAssessmentId || targetSection.assessmentId,
            userId: (user?.username || user?.id || 'GUEST').toString(),
            email: user?.email || 'guest@kivolearning.com',
            questionIndex: qIndex,
            userAnswer: answerVal ? [answerVal] : []
        };

        const token = localStorage.getItem('token');
        axios.post(`${config.GATEWAY_URL || config.ASSESSMENT_BASE_URL}/v1/assessment/questions/submit-answer`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        }).catch(err => console.warn("Background sync failed", err));
    };

    const handleSaveAndNext = () => {
        const currentAnswer = answers[activeSectionId]?.[activeQIndex];
        const hasAnswer = !!currentAnswer;
        
        setStatuses(prev => ({
            ...prev,
            [activeSectionId]: { ...prev[activeSectionId], [activeQIndex]: hasAnswer ? 'ANSWERED' : 'NOT_ANSWERED' }
        }));

        syncAnswerToBackend(activeSectionId, activeQIndex, currentAnswer);
        moveToNextQuestion();
    };

    const handleMarkForReview = () => {
        setStatuses(prev => ({ ...prev, [activeSectionId]: { ...prev[activeSectionId], [activeQIndex]: 'MARKED' } }));
        const currentAnswer = answers[activeSectionId]?.[activeQIndex];
        syncAnswerToBackend(activeSectionId, activeQIndex, currentAnswer);
        moveToNextQuestion();
    };

    const handleClearResponse = () => {
        setAnswers(prev => {
            const newAnswers = { ...prev };
            if (newAnswers[activeSectionId]) delete newAnswers[activeSectionId][activeQIndex];
            return newAnswers;
        });
        setStatuses(prev => ({ ...prev, [activeSectionId]: { ...prev[activeSectionId], [activeQIndex]: 'NOT_ANSWERED' } }));
        syncAnswerToBackend(activeSectionId, activeQIndex, null);
    };

    const moveToNextQuestion = () => {
        const currentSection = sectionsData.find(s => s.id === activeSectionId);
        if (activeQIndex < currentSection.questionCount) {
            fetchAndSetQuestion(activeSectionId, activeQIndex + 1);
        } else {
            const currentSecIndex = sectionsData.findIndex(s => s.id === activeSectionId);
            if (currentSecIndex < sectionsData.length - 1) {
                fetchAndSetQuestion(sectionsData[currentSecIndex + 1].id, 1);
            }
        }
    };

    const handleSubmit = async (bypassConfirm = false) => {
        if (!bypassConfirm && !window.confirm("Are you sure you want to submit the exam?")) return;
        
        // Ensure all skipped questions are loaded for grading & PDF
        const fullyCompiledCache = await compileFullPaper(sectionsData);
        
        let correct = 0, wrong = 0, skipped = 0, totalPossibleScore = 0, earnedScore = 0;

        sectionsData.forEach(section => {
            totalPossibleScore += (section.marksPerQuestion * section.questionCount);
            for(let i = 1; i <= section.questionCount; i++) {
                const userAnswer = answers[section.id]?.[i];
                const cachedQ = fullyCompiledCache[section.id]?.[i];
                
                if (!userAnswer) {
                    skipped++;
                } else if (cachedQ) {
                    const { actualAnswer } = getQDetails(cachedQ);
                    if (userAnswer === actualAnswer) {
                        correct++;
                        earnedScore += section.marksPerQuestion;
                    } else {
                        wrong++;
                        earnedScore -= (section.marksPerQuestion * exam.negativeMarkingFactor);
                    }
                }
            }
        });

        setScoreResult({ correct, wrong, skipped, earnedScore, totalPossibleScore });

        try {
            const token = localStorage.getItem('token');
            const userId = user?.username || user?.id || 'GUEST';
            const userEmail = user?.email || 'guest@kivolearning.com';
            const baseUrl = config.GATEWAY_URL || config.ASSESSMENT_BASE_URL;

            for (const section of sectionsData) {
                await axios.post(`${baseUrl}/v1/assessment/questions/submit`, {
                    userId: userId.toString(),
                    email: userEmail,
                    assessmentId: section.assessmentId,
                    reason: "Competitive Matrix Submitted"
                }, { headers: { Authorization: `Bearer ${token}` } });
            }
        } catch (err) {
            console.error("Failed to submit final tracking data", err);
        }

        setIsSubmitted(true);
    };

    // --- RENDER LOGIC ---

    if (loading) return <div style={{ background: '#020617', color: '#38bdf8', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>Initializing Matrix...</div>;
    
    if (isCompiling) return (
        <div style={{ background: '#020617', color: '#10b981', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>Compiling Full Paper...</div>
            <div style={{ fontSize: '1.2rem', color: '#64748b' }}>{compileProgress}</div>
        </div>
    );

    // 🚀 THE MASTER PRINT VIEW (Shared by Pre-Exam Mock and Post-Exam Result)
    if (showPrintView) {
        return (
            <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px', fontFamily: '"Times New Roman", Times, serif' }}>
                <style>
                    {`
                        @media print {
                            html, body, #root, .app-container { height: auto !important; overflow: visible !important; background: white !important; margin: 0 !important; padding: 0 !important; }
                            .no-print { display: none !important; }
                            .print-container { box-shadow: none !important; padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
                            .page-break { page-break-before: always; }
                            .avoid-break { page-break-inside: avoid; }
                            @page { margin: 20mm 15mm; size: A4 portrait; }
                            .print-header { display: block !important; }
                        }
                        .print-header { display: none; }
                    `}
                </style>

                <div className="no-print" style={{ maxWidth: '850px', margin: '0 auto 20px auto', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: '0 0 10px 0', fontFamily: 'sans-serif' }}>⚙️ PDF Settings</h3>
                        <div style={{ display: 'flex', gap: '20px', fontFamily: 'sans-serif', fontSize: '14px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={printConfig.showAnswers} onChange={e => setPrintConfig({...printConfig, showAnswers: e.target.checked})} /> Include Answer Key
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: printConfig.showAnswers ? 1 : 0.5 }}>
                                <input type="checkbox" checked={printConfig.showExplanations} onChange={e => setPrintConfig({...printConfig, showExplanations: e.target.checked})} disabled={!printConfig.showAnswers} /> Include Explanations
                            </label>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => {
                            if (startInPrintMode) navigate('/competitive-hub');
                            else setShowPrintView(false);
                        }} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Close Print View</button>
                        <button onClick={() => window.print()} style={{ padding: '10px 30px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Print Paper</button>
                    </div>
                </div>

                <div className="print-container" style={{ background: 'white', color: 'black', padding: '40px', maxWidth: '850px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    
                    <div className="print-header" style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid black', paddingBottom: '20px' }}>
                        <img src="/kivo-logo.png" alt="KiVO Learning" style={{ height: '60px', objectFit: 'contain', marginBottom: '10px' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        <h2 style={{ margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '24px' }}>KiVO Learning International</h2>
                        <h3 style={{ margin: '0', color: '#555' }}>{exam.examName} {isSubmitted ? 'PERFORMANCE REPORT' : 'MOCK PAPER'}</h3>
                    </div>

                    <div className="no-print" style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid black', paddingBottom: '20px' }}>
                        <h2 style={{ margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '24px' }}>{exam.examName} {isSubmitted ? 'PERFORMANCE REPORT' : 'MOCK PAPER'}</h2>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        {isSubmitted && scoreResult ? (
                            <p style={{ margin: 0, fontSize: '1.2rem' }}>Score: <strong>{scoreResult.earnedScore} / {scoreResult.totalPossibleScore}</strong> | Correct: {scoreResult.correct} | Incorrect: {scoreResult.wrong}</p>
                        ) : (
                            <p style={{ margin: 0, fontSize: '1.2rem' }}>Total Time: <strong>{exam.totalDurationMinutes} Minutes</strong> | Negative Marking: <strong>-{exam.negativeMarkingFactor * 100}%</strong></p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px', fontWeight: 'bold' }}>
                            <span>Student: {user?.username || user?.email || '_______________________'}</span>
                            <span>Date: {new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    {sectionsData.map((sec, secIndex) => (
                        <div key={sec.id} style={{ marginBottom: '40px' }}>
                            <h2 style={{ background: '#f1f5f9', padding: '10px', border: '1px solid black', textTransform: 'uppercase' }}>
                                PART {secIndex + 1}: {sec.sectionName} ({sec.questionCount} Questions)
                            </h2>
                            
                            {Array.from({ length: sec.questionCount }).map((_, i) => {
                                const qIndex = i + 1;
                                const cachedQ = qCache[sec.id]?.[qIndex];
                                
                                // Failsafe if question isn't loaded
                                if (!cachedQ) return (
                                    <div key={qIndex} style={{ marginBottom: '15px', color: 'gray', fontStyle: 'italic' }}>
                                        {qIndex}. Failed to load question from database.
                                    </div>
                                );

                                const { qText, qOptions, actualAnswer, explanation } = getQDetails(cachedQ);
                                const userAnswer = answers[sec.id]?.[qIndex] || 'Not Answered';
                                const isCorrect = userAnswer === actualAnswer;

                                return (
                                    <div key={qIndex} className="avoid-break" style={{ marginBottom: '35px', paddingLeft: '15px' }}>
                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                            <strong>{qIndex}.</strong>
                                            <span>{qText}</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingLeft: '25px', marginBottom: '15px', color: '#333' }}>
                                            {Object.entries(qOptions).map(([key, val]) => (
                                                <div key={key}>({key}) {typeof val === 'object' ? JSON.stringify(val) : String(val)}</div>
                                            ))}
                                        </div>
                                        
                                        <div style={{ paddingLeft: '25px' }}>
                                            {!isSubmitted ? (
                                                <div style={{ display: 'inline-block', border: '2px dashed #94a3b8', padding: '8px 20px', borderRadius: '4px', color: '#64748b', fontSize: '0.9rem' }}>
                                                    Your Answer: _________
                                                </div>
                                            ) : (
                                                <div style={{ background: isCorrect ? '#ecfdf5' : (userAnswer === 'Not Answered' ? '#f8fafc' : '#fef2f2'), padding: '10px', borderRadius: '8px', borderLeft: `4px solid ${isCorrect ? '#10b981' : (userAnswer === 'Not Answered' ? '#94a3b8' : '#ef4444')}`, fontSize: '0.95rem' }}>
                                                    <div style={{ display: 'flex', gap: '20px', marginBottom: (printConfig.showExplanations && explanation) ? '10px' : '0' }}>
                                                        <span><strong>Your Answer:</strong> <span style={{ color: isCorrect ? '#059669' : '#dc2626', fontWeight: 'bold' }}>{userAnswer}</span></span>
                                                        <span><strong>Correct Answer:</strong> <span style={{ color: '#059669', fontWeight: 'bold' }}>{actualAnswer}</span></span>
                                                        <span><strong>Status:</strong> {userAnswer === 'Not Answered' ? 'Skipped' : (isCorrect ? '✅ Correct' : '❌ Incorrect')}</span>
                                                    </div>
                                                    {(printConfig.showExplanations && explanation) && (
                                                        <div style={{ paddingTop: '10px', borderTop: '1px solid #e2e8f0', color: '#334155' }}>
                                                            <strong>💡 Explanation:</strong> {explanation}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {!isSubmitted && printConfig.showAnswers && (
                        <>
                            <div className="page-break"></div>
                            <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '30px' }}>
                                <h2>OFFICIAL ANSWER KEY</h2>
                            </div>
                            {sectionsData.map(sec => (
                                <div key={'key-'+sec.id} style={{ marginBottom: '30px' }}>
                                    <h3 style={{ textDecoration: 'underline', background: '#f1f5f9', padding: '5px' }}>{sec.sectionName}</h3>
                                    {!printConfig.showExplanations ? (
                                        <div className="avoid-break" style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '15px', marginTop: '15px' }}>
                                            {Array.from({ length: sec.questionCount }).map((_, i) => {
                                                const cachedQ = qCache[sec.id]?.[i + 1];
                                                if (!cachedQ) return <div key={'ans-'+i}><strong>{i + 1}.</strong> N/A</div>;
                                                const { actualAnswer } = getQDetails(cachedQ);
                                                return <div key={'ans-'+i}><strong>{i + 1}.</strong> {actualAnswer}</div>;
                                            })}
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                                            {Array.from({ length: sec.questionCount }).map((_, i) => {
                                                const cachedQ = qCache[sec.id]?.[i + 1];
                                                if (!cachedQ) return null;
                                                const { actualAnswer, explanation } = getQDetails(cachedQ);
                                                return (
                                                    <div key={'expl-'+i} className="avoid-break" style={{ borderBottom: '1px dashed #ccc', paddingBottom: '10px' }}>
                                                        <div><strong>Q{i + 1}. Correct Answer:</strong> <span style={{color: 'green', fontWeight: 'bold'}}>{actualAnswer}</span></div>
                                                        {explanation && <div style={{ marginTop: '5px', fontStyle: 'italic', color: '#444' }}><strong>Explanation:</strong> {explanation}</div>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        );
    }

    // 🚀 THE STANDARD EXAM UI
    
    const currentSection = sectionsData.find(s => s.id === activeSectionId);
    const activeQData = qCache[activeSectionId]?.[activeQIndex];
    const { qText, qOptions } = getQDetails(activeQData);
    const selectedAnswer = answers[activeSectionId]?.[activeQIndex] || '';

    const getStatusColor = (status) => {
        if (status === 'ANSWERED') return '#10b981'; 
        if (status === 'NOT_ANSWERED') return '#ef4444'; 
        if (status === 'MARKED') return '#8b5cf6'; 
        return '#cbd5e1'; 
    };

    return (
        <div style={{ background: '#0f172a', color: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <div style={{ background: '#1e293b', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, borderBottom: '2px solid #334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h2 style={{ margin: 0, color: '#38bdf8', fontSize: '1.5rem', fontWeight: '900', letterSpacing: '1px' }}>{exam.examName}</h2>
                    {!isSubmitted && (
                        <button onClick={async () => {
                            await compileFullPaper(sectionsData);
                            setPrintConfig({ showAnswers: false, showExplanations: false });
                            setShowPrintView(true);
                        }} style={{ padding: '8px 15px', background: '#334155', color: '#f8fafc', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🖨️ Print Paper
                        </button>
                    )}
                </div>
                {!isSubmitted && (
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', background: '#020617', padding: '10px 20px', borderRadius: '8px', border: `1px solid ${timeLeft < 300 ? '#ef4444' : '#38bdf8'}`, color: timeLeft < 300 ? '#ef4444' : '#f8fafc' }}>
                        ⏱️ {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            {isSubmitted && scoreResult ? (
                // SUBMISSION SCREEN
                <div style={{ maxWidth: '800px', margin: '50px auto', background: '#1e293b', padding: '50px', borderRadius: '20px', textAlign: 'center', border: '2px solid #38bdf8', boxShadow: '0 0 50px rgba(56, 189, 248, 0.1)' }}>
                    <h1 style={{ color: '#38bdf8', fontSize: '3rem', margin: '0 0 30px 0' }}>Simulation Complete</h1>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', fontSize: '1.2rem', marginBottom: '40px' }}>
                        <div style={{ background: '#0f172a', padding: '25px', borderRadius: '12px', border: '1px solid #10b981' }}><div style={{fontSize: '2rem', color: '#10b981', fontWeight: 'bold'}}>{scoreResult.correct}</div>✅ Correct</div>
                        <div style={{ background: '#0f172a', padding: '25px', borderRadius: '12px', border: '1px solid #ef4444' }}><div style={{fontSize: '2rem', color: '#ef4444', fontWeight: 'bold'}}>{scoreResult.wrong}</div>❌ Incorrect</div>
                        <div style={{ background: '#0f172a', padding: '25px', borderRadius: '12px', border: '1px solid #f59e0b' }}><div style={{fontSize: '2rem', color: '#f59e0b', fontWeight: 'bold'}}>{scoreResult.skipped}</div>⏭️ Skipped</div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)', padding: '40px', borderRadius: '16px', border: '2px dashed #38bdf8' }}>
                        <h2 style={{ margin: 0, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' }}>Final Competitive Score</h2>
                        <h1 style={{ fontSize: '5rem', color: '#34d399', margin: '15px 0' }}>{scoreResult.earnedScore} <span style={{fontSize: '2rem', color: '#475569'}}>/ {scoreResult.totalPossibleScore}</span></h1>
                        <p style={{ color: '#64748b', margin: 0 }}>Penalty rule applied: -{exam.negativeMarkingFactor * 100}% per incorrect answer.</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '40px' }}>
                        <button onClick={() => {
                            setPrintConfig({ showAnswers: true, showExplanations: true });
                            setShowPrintView(true);
                        }} style={{ padding: '15px 30px', background: '#10b981', color: 'white', border: 'none', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>🖨️ Detailed Report</button>
                        <button onClick={() => navigate('/competitive-hub')} style={{ padding: '15px 30px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>Back to Hub</button>
                    </div>
                </div>
            ) : (
                // EXAM UI
                <div style={{ display: 'flex', minHeight: 'calc(100vh - 85px)' }}>
                    <div style={{ flex: '1', padding: '30px', display: 'flex', flexDirection: 'column', borderRight: '2px solid #334155' }}>
                        <div style={{ display: 'flex', gap: '5px', marginBottom: '30px', borderBottom: '2px solid #334155' }}>
                            {sectionsData.map(sec => (
                                <button 
                                    key={sec.id} 
                                    onClick={() => fetchAndSetQuestion(sec.id, 1)}
                                    style={{ padding: '15px 30px', background: activeSectionId === sec.id ? '#38bdf8' : '#1e293b', color: activeSectionId === sec.id ? '#0f172a' : '#cbd5e1', border: 'none', borderRadius: '12px 12px 0 0', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', transition: '0.2s' }}>
                                    {sec.sectionName}
                                </button>
                            ))}
                        </div>

                        <div style={{ flex: '1', background: '#1e293b', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                            {qLoading ? (
                                <div style={{ textAlign: 'center', color: '#38bdf8', fontSize: '1.5rem', marginTop: '100px' }}>Loading Question... ⏳</div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '30px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#38bdf8' }}>Question {activeQIndex}</h3>
                                        <span style={{ background: '#0f172a', padding: '5px 15px', borderRadius: '20px', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold' }}>Marks: +{currentSection?.marksPerQuestion} / -{currentSection?.marksPerQuestion * exam.negativeMarkingFactor}</span>
                                    </div>
                                    
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 'normal', lineHeight: '1.6', marginBottom: '40px' }}>{qText}</h2>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {Object.entries(qOptions).map(([key, value]) => (
                                            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '20px', background: selectedAnswer === key ? 'rgba(56, 189, 248, 0.1)' : '#0f172a', border: selectedAnswer === key ? '2px solid #38bdf8' : '2px solid #334155', padding: '20px', borderRadius: '12px', cursor: 'pointer', transition: '0.2s' }}>
                                                <input type="radio" name="options" value={key} checked={selectedAnswer === key} onChange={() => handleAnswerSelect(key)} style={{ transform: 'scale(1.5)', cursor: 'pointer' }} />
                                                <span style={{ fontWeight: 'bold', color: '#94a3b8', fontSize: '1.2rem' }}>{key})</span>
                                                <span style={{ fontSize: '1.2rem' }}>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', padding: '20px', background: '#1e293b', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button onClick={handleMarkForReview} style={{ padding: '15px 25px', background: 'transparent', border: '2px solid #8b5cf6', color: '#8b5cf6', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Mark for Review & Next</button>
                                <button onClick={handleClearResponse} style={{ padding: '15px 25px', background: 'transparent', border: '2px solid #64748b', color: '#cbd5e1', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Clear Response</button>
                            </div>
                            <button onClick={handleSaveAndNext} style={{ padding: '15px 40px', background: '#10b981', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>Save & Next</button>
                        </div>
                    </div>

                    <div style={{ width: '350px', background: '#020617', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', fontWeight: 'bold', borderBottom: '2px solid #1e293b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{width:'20px', height:'20px', borderRadius:'4px', background: '#10b981'}}></div> Answered</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{width:'20px', height:'20px', borderRadius:'4px', background: '#ef4444'}}></div> Not Answered</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{width:'20px', height:'20px', borderRadius:'4px', background: '#cbd5e1'}}></div> Not Visited</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{width:'20px', height:'20px', borderRadius:'4px', background: '#8b5cf6'}}></div> Marked</div>
                        </div>

                        <div style={{ padding: '20px', flex: '1', overflowY: 'auto' }}>
                            <h4 style={{ color: '#94a3b8', margin: '0 0 20px 0', textTransform: 'uppercase' }}>{currentSection?.sectionName} Palette</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                                {Array.from({ length: currentSection?.questionCount || 0 }).map((_, i) => {
                                    const qIdx = i + 1;
                                    const status = statuses[activeSectionId]?.[qIdx] || 'NOT_VISITED';
                                    const bgColor = getStatusColor(status);
                                    
                                    return (
                                        <button 
                                            key={qIdx}
                                            onClick={() => fetchAndSetQuestion(activeSectionId, qIdx)}
                                            style={{ 
                                                aspectRatio: '1', background: bgColor, color: status === 'NOT_VISITED' ? '#0f172a' : 'white', 
                                                border: activeQIndex === qIdx ? '3px solid white' : 'none', borderRadius: '8px', 
                                                fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer',
                                                boxShadow: activeQIndex === qIdx ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                                            }}
                                        >
                                            {qIdx}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ padding: '20px', borderTop: '2px solid #1e293b' }}>
                            <button onClick={() => handleSubmit(false)} style={{ width: '100%', padding: '20px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '1.2rem', cursor: 'pointer', textTransform: 'uppercase' }}>Submit Exam</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}