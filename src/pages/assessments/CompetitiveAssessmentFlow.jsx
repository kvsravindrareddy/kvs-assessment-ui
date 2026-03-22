import React, { useState, useEffect, useCallback } from 'react';
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
    
    const [loading, setLoading] = useState(true);
    const [isCompilingResult, setIsCompilingResult] = useState(false);
    const [compileProgress, setCompileProgress] = useState("");
    const [sectionsData, setSectionsData] = useState([]);
    const [timeLeft, setTimeLeft] = useState(exam?.totalDurationMinutes ? exam.totalDurationMinutes * 60 : 0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [scoreResult, setScoreResult] = useState(null);

    const [activeSectionId, setActiveSectionId] = useState(null);
    const [activeQIndex, setActiveQIndex] = useState(1); 
    const [qLoading, setQLoading] = useState(false);

    const [qCache, setQCache] = useState({}); 
    const [answers, setAnswers] = useState({}); 
    const [statuses, setStatuses] = useState({}); 

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
                fetchAndSetQuestion(loadedSections[0]?.id, 1, loadedSections[0]?.assessmentId);

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
        if (loading || isSubmitted || timeLeft <= 0) return;

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
    }, [loading, isSubmitted, timeLeft]);

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

        // 🚀 ENSURE RESUME BUTTON WORKS: Send a blank sync to backend to register lastAttemptedIndex
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

            setQCache(prev => ({
                ...prev,
                [sectionId]: { ...(prev[sectionId] || {}), [qIndex]: qData }
            }));
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
        setStatuses(prev => ({
            ...prev,
            [activeSectionId]: { ...prev[activeSectionId], [activeQIndex]: 'MARKED' }
        }));
        
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
        setStatuses(prev => ({
            ...prev,
            [activeSectionId]: { ...prev[activeSectionId], [activeQIndex]: 'NOT_ANSWERED' }
        }));

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
        
        setIsCompilingResult(true);

        const token = localStorage.getItem('token');
        const userId = user?.username || user?.id || 'GUEST';
        const userEmail = user?.email || 'guest@kivolearning.com';
        const baseUrl = config.GATEWAY_URL || config.ASSESSMENT_BASE_URL;

        // 🚀 COMPILER: Fetch any questions the user skipped so the final PDF is complete!
        const fullyCompiledCache = { ...qCache };
        
        for (const section of sectionsData) {
            for(let i = 1; i <= section.questionCount; i++) {
                if (!fullyCompiledCache[section.id]?.[i]) {
                    setCompileProgress(`Compiling ${section.sectionName}: Q${i}...`);
                    try {
                        const qRes = await axios.post(`${baseUrl}/v1/assessment/questions/start`, {
                            userId: userId.toString(), email: userEmail,
                            assessmentId: section.assessmentId, questionIndex: i
                        }, { headers: { Authorization: `Bearer ${token}` } });
                        
                        let qData = qRes.data.question || qRes.data;
                        if (qRes.data.questions && Array.isArray(qRes.data.questions)) qData = qRes.data.questions[0];

                        if (!fullyCompiledCache[section.id]) fullyCompiledCache[section.id] = {};
                        fullyCompiledCache[section.id][i] = qData;
                    } catch (e) {
                        console.warn("Could not fetch skipped question for report");
                    }
                    await sleep(150); // Protect backend from 429
                }
            }
        }

        setQCache(fullyCompiledCache); // Save the fully compiled questions

        // Calculate Scores
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
        
        setIsCompilingResult(false);
        setIsSubmitted(true);
    };

    if (loading) return <div style={{ background: '#020617', color: '#38bdf8', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>Initializing Assessment Matrix...</div>;
    if (isCompilingResult) return <div style={{ background: '#020617', color: '#10b981', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontSize: '2rem', marginBottom: '10px' }}>Compiling Final Report & Checking Answers...</div><div style={{ fontSize: '1.2rem', color: '#64748b' }}>{compileProgress}</div></div>;

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
            
            {/* 🚀 CSS FOR PRINTING RESULTS */}
            <style>
                {`
                    @media print {
                        .no-print { display: none !important; }
                        .print-only { display: block !important; color: black; background: white; }
                        body { background: white; margin: 0; padding: 0; font-family: "Times New Roman", serif; }
                    }
                    @media screen {
                        .print-only { display: none !important; }
                    }
                `}
            </style>

            <div className="no-print" style={{ background: '#1e293b', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, borderBottom: '2px solid #334155' }}>
                <h2 style={{ margin: 0, color: '#38bdf8', fontSize: '1.5rem', fontWeight: '900', letterSpacing: '1px' }}>{exam.examName}</h2>
                {!isSubmitted && (
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', background: '#020617', padding: '10px 20px', borderRadius: '8px', border: `1px solid ${timeLeft < 300 ? '#ef4444' : '#38bdf8'}`, color: timeLeft < 300 ? '#ef4444' : '#f8fafc' }}>
                        ⏱️ {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            {isSubmitted && scoreResult ? (
                <>
                    {/* WEB VIEW: SUBMISSION SCREEN */}
                    <div className="no-print" style={{ maxWidth: '800px', margin: '50px auto', background: '#1e293b', padding: '50px', borderRadius: '20px', textAlign: 'center', border: '2px solid #38bdf8', boxShadow: '0 0 50px rgba(56, 189, 248, 0.1)' }}>
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
                            <button onClick={() => window.print()} style={{ padding: '15px 30px', background: '#10b981', color: 'white', border: 'none', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>🖨️ Download Detailed Report</button>
                            <button onClick={() => navigate('/competitive-hub')} style={{ padding: '15px 30px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>Back to Hub</button>
                        </div>
                    </div>

                    {/* 🚀 PRINT VIEW: DETAILED POST-ASSESSMENT REPORT */}
                    <div className="print-only" style={{ padding: '20px', maxWidth: '850px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '20px', marginBottom: '30px' }}>
                            <h1 style={{ margin: '0 0 10px 0', textTransform: 'uppercase' }}>{exam.examName} - PERFORMANCE REPORT</h1>
                            <p style={{ margin: 0, fontSize: '1.2rem' }}>Score: <strong>{scoreResult.earnedScore} / {scoreResult.totalPossibleScore}</strong> | Correct: {scoreResult.correct} | Incorrect: {scoreResult.wrong}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                                <span>Student: {user?.username || user?.email || 'N/A'}</span>
                                <span>Date: {new Date().toLocaleDateString()}</span>
                            </div>
                        </div>

                        {sectionsData.map(sec => (
                            <div key={'print-'+sec.id} style={{ marginBottom: '40px' }}>
                                <h2 style={{ background: '#f1f5f9', padding: '10px', border: '1px solid black', textTransform: 'uppercase' }}>{sec.sectionName}</h2>
                                
                                {Array.from({ length: sec.questionCount }).map((_, i) => {
                                    const qIndex = i + 1;
                                    const cachedQ = qCache[sec.id]?.[qIndex];
                                    if (!cachedQ) return null;

                                    const { qText, qOptions, actualAnswer, explanation } = getQDetails(cachedQ);
                                    const userAnswer = answers[sec.id]?.[qIndex] || 'Not Answered';
                                    const isCorrect = userAnswer === actualAnswer;
                                    
                                    return (
                                        <div key={qIndex} style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px dashed #ccc', pageBreakInside: 'avoid' }}>
                                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                                <strong>{qIndex}.</strong>
                                                <span>{qText}</span>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingLeft: '25px', marginBottom: '10px', color: '#555' }}>
                                                {Object.entries(qOptions).map(([key, val]) => (
                                                    <div key={key}>({key}) {typeof val === 'object' ? JSON.stringify(val) : String(val)}</div>
                                                ))}
                                            </div>
                                            
                                            {/* Results block */}
                                            <div style={{ background: isCorrect ? '#ecfdf5' : (userAnswer === 'Not Answered' ? '#f8fafc' : '#fef2f2'), padding: '10px', borderRadius: '8px', borderLeft: `4px solid ${isCorrect ? '#10b981' : (userAnswer === 'Not Answered' ? '#94a3b8' : '#ef4444')}`, marginLeft: '25px', fontSize: '0.95rem' }}>
                                                <div style={{ display: 'flex', gap: '20px', marginBottom: explanation ? '10px' : '0' }}>
                                                    <span><strong>Your Answer:</strong> <span style={{ color: isCorrect ? '#059669' : '#dc2626', fontWeight: 'bold' }}>{userAnswer}</span></span>
                                                    <span><strong>Correct Answer:</strong> <span style={{ color: '#059669', fontWeight: 'bold' }}>{actualAnswer}</span></span>
                                                    <span><strong>Status:</strong> {userAnswer === 'Not Answered' ? 'Skipped' : (isCorrect ? '✅ Correct' : '❌ Incorrect')}</span>
                                                </div>
                                                {explanation && (
                                                    <div style={{ paddingTop: '10px', borderTop: '1px solid #e2e8f0', color: '#334155' }}>
                                                        <strong>💡 Explanation:</strong> {explanation}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="no-print" style={{ display: 'flex', minHeight: 'calc(100vh - 85px)' }}>
                    {/* EXAM UI... */}
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
                                    
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 'normal', lineHeight: '1.6', marginBottom: '40px' }}>{getQDetails(activeQData).qText}</h2>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {Object.entries(getQDetails(activeQData).qOptions).map(([key, value]) => (
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