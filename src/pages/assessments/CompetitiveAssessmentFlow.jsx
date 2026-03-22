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
    
    const [loading, setLoading] = useState(true);
    const [sectionsData, setSectionsData] = useState([]);
    const [activeSectionId, setActiveSectionId] = useState(null);
    const [userAnswers, setUserAnswers] = useState({}); 
    const [timeLeft, setTimeLeft] = useState(exam?.totalDurationMinutes ? exam.totalDurationMinutes * 60 : 0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [scoreResult, setScoreResult] = useState(null);

    useEffect(() => {
        if (!exam) {
            navigate('/competitive-hub');
            return;
        }

        const fetchQuestionsForBlueprint = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = user?.username || user?.id || 'GUEST';
                const userEmail = user?.email || 'guest@kivolearning.com'; 
                const baseUrl = config.GATEWAY_URL || config.ASSESSMENT_BASE_URL;

                const sectionPromises = exam.sections.map(async (section) => {
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
                    
                    console.log(`🌐 Backend Response for ${section.sectionName}:`, res.data);

                    // 🚀 ULTRA-ROBUST EXTRACTOR: Finds the array no matter what the backend named it
                    let extractedQuestions = [];
                    if (res.data.questions && Array.isArray(res.data.questions)) extractedQuestions = res.data.questions;
                    else if (res.data.questionDTOs && Array.isArray(res.data.questionDTOs)) extractedQuestions = res.data.questionDTOs;
                    else if (res.data.assessmentQuestions && Array.isArray(res.data.assessmentQuestions)) extractedQuestions = res.data.assessmentQuestions;
                    else if (res.data.data && Array.isArray(res.data.data)) extractedQuestions = res.data.data;
                    else if (res.data.data?.questions && Array.isArray(res.data.data.questions)) extractedQuestions = res.data.data.questions;
                    else {
                        // Fallback: Find the first array property in the JSON response
                        const arrayProp = Object.values(res.data).find(val => Array.isArray(val));
                        if (arrayProp) extractedQuestions = arrayProp;
                    }

                    return {
                        ...section,
                        assessmentId: res.data.assessmentId || res.data.id,
                        questions: extractedQuestions
                    };
                });

                const loadedSections = await Promise.all(sectionPromises);
                setSectionsData(loadedSections);
                setActiveSectionId(loadedSections[0]?.id); 
                setLoading(false);
            } catch (error) {
                console.error("Failed to load section questions", error);
                alert("Error loading questions from backend. See console.");
                navigate('/competitive-hub');
            }
        };

        fetchQuestionsForBlueprint();
    }, [exam, navigate, user, config]);

    // Timer Logic
    useEffect(() => {
        if (loading || isSubmitted || timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [loading, isSubmitted, timeLeft]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (questionId, optionKey) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: optionKey }));
    };

    const handleSubmit = () => {
        if (!window.confirm("Are you sure you want to submit the exam?")) return;
        
        setIsSubmitted(true);
        
        let correct = 0;
        let wrong = 0;
        let skipped = 0;
        let totalPossibleScore = 0;
        let earnedScore = 0;

        sectionsData.forEach(section => {
            section.questions.forEach(q => {
                totalPossibleScore += section.marksPerQuestion;
                const userAnswer = userAnswers[q.id];
                const actualAnswer = q.correctAnswer || q.answer?.values?.[0] || q.answer;
                
                if (!userAnswer) {
                    skipped++;
                } else if (userAnswer === actualAnswer) {
                    correct++;
                    earnedScore += section.marksPerQuestion;
                } else {
                    wrong++;
                    earnedScore -= (section.marksPerQuestion * exam.negativeMarkingFactor);
                }
            });
        });

        setScoreResult({ correct, wrong, skipped, earnedScore, totalPossibleScore });
    };

    if (loading) return <div style={{ background: '#020617', color: '#38bdf8', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>Loading Simulation Matrix...</div>;

    const activeSection = sectionsData.find(s => s.id === activeSectionId);

    return (
        <div style={{ background: '#0f172a', color: '#f8fafc', minHeight: '100vh', fontFamily: '"Fira Code", monospace' }}>
            <div style={{ background: '#1e293b', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #334155' }}>
                <h2 style={{ margin: 0, color: '#38bdf8' }}>{exam.examName}</h2>
                {!isSubmitted && (
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: timeLeft < 300 ? '#ef4444' : '#10b981' }}>
                        ⏱️ {formatTime(timeLeft)}
                    </div>
                )}
                {isSubmitted ? (
                    <button onClick={() => navigate('/competitive-hub')} style={{ padding: '10px 20px', background: '#38bdf8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Exit Matrix</button>
                ) : (
                    <button onClick={handleSubmit} style={{ padding: '10px 30px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>SUBMIT EXAM</button>
                )}
            </div>

            {isSubmitted && scoreResult ? (
                <div style={{ maxWidth: '800px', margin: '50px auto', background: '#1e293b', padding: '40px', borderRadius: '16px', textAlign: 'center', border: '1px solid #38bdf8' }}>
                    <h1 style={{ color: '#38bdf8', fontSize: '3rem', margin: '0 0 20px 0' }}>Simulation Complete</h1>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '1.2rem', marginBottom: '30px' }}>
                        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px' }}>✅ Correct: <strong style={{color: '#10b981'}}>{scoreResult.correct}</strong></div>
                        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px' }}>❌ Incorrect: <strong style={{color: '#ef4444'}}>{scoreResult.wrong}</strong></div>
                        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px' }}>⏭️ Skipped: <strong style={{color: '#f59e0b'}}>{scoreResult.skipped}</strong></div>
                        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px' }}>🎯 Accuracy: <strong>{Math.round((scoreResult.correct / (scoreResult.correct + scoreResult.wrong)) * 100) || 0}%</strong></div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)', padding: '30px', borderRadius: '12px', border: '2px dashed #38bdf8' }}>
                        <h2 style={{ margin: 0, color: '#f8fafc' }}>Final Competitive Score</h2>
                        <h1 style={{ fontSize: '4rem', color: '#34d399', margin: '10px 0' }}>{scoreResult.earnedScore} <span style={{fontSize: '1.5rem', color: '#64748b'}}>/ {scoreResult.totalPossibleScore}</span></h1>
                        <p style={{ color: '#94a3b8', margin: 0 }}>Penalty applied: -{exam.negativeMarkingFactor * 100}% per incorrect answer.</p>
                    </div>
                </div>
            ) : (
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #334155', paddingBottom: '10px', overflowX: 'auto' }}>
                        {sectionsData.map(sec => (
                            <button 
                                key={sec.id} 
                                onClick={() => setActiveSectionId(sec.id)}
                                style={{ 
                                    padding: '12px 25px', 
                                    background: activeSectionId === sec.id ? '#38bdf8' : '#1e293b', 
                                    color: activeSectionId === sec.id ? '#0f172a' : '#cbd5e1', 
                                    border: 'none', 
                                    borderRadius: '8px 8px 0 0', 
                                    fontWeight: 'bold', 
                                    cursor: 'pointer',
                                    fontSize: '1.1rem'
                                }}>
                                {sec.sectionName} ({sec.questions.length} Qs)
                            </button>
                        ))}
                    </div>

                    {activeSection?.questions?.length > 0 ? activeSection.questions.map((q, index) => {
                        // 🚀 SAFE RENDERING: Extracts text whether it's wrapped in `question` object or flat
                        const qText = q.questionText || q.question?.name || q.text || "Question text missing";
                        const qOptions = q.options || q.question?.options || {};
                        
                        return (
                            <div key={q.id || index} style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', marginBottom: '20px', borderLeft: userAnswers[q.id] ? '4px solid #10b981' : '4px solid #334155' }}>
                                <h3 style={{ margin: '0 0 20px 0', color: '#f8fafc', lineHeight: '1.5' }}>
                                    <span style={{ color: '#38bdf8', marginRight: '10px' }}>Q{index + 1}.</span> 
                                    {qText}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {Object.entries(qOptions).map(([key, value]) => (
                                        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: userAnswers[q.id] === key ? 'rgba(56, 189, 248, 0.1)' : '#0f172a', border: userAnswers[q.id] === key ? '1px solid #38bdf8' : '1px solid #334155', padding: '15px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }}>
                                            <input type="radio" name={`question-${q.id}`} value={key} checked={userAnswers[q.id] === key} onChange={() => handleAnswerSelect(q.id, key)} style={{ transform: 'scale(1.5)' }} />
                                            <span style={{ fontWeight: 'bold', color: '#94a3b8' }}>{key})</span>
                                            <span style={{ fontSize: '1.1rem' }}>{value}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        );
                    }) : (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                            No questions available for this section. Please upload questions for Category <b>'{exam.examName}'</b>, Type <b>'{activeSection?.sectionName}'</b>, and Complexity <b>'COMPLEX'</b>.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}