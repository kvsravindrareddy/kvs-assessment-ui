import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import CONFIG from '../../Config';
import '../../css/AssessmentFlow.css';

export default function SpeedMathChallenge() {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(false);

    // Configuration for starting a NEW test
    const [setupMode, setSetupMode] = useState(false);
    const [mathType, setMathType] = useState('ADDITION');
    const [complexity, setComplexity] = useState('EASY');

    const typeCards = [
        { id: 'ADDITION', icon: '➕', label: 'Addition', desc: 'Find the sum', color: '#ef4444', bg: '#fef2f2' },
        { id: 'SUBTRACTION', icon: '➖', label: 'Subtraction', desc: 'Find the difference', color: '#3b82f6', bg: '#eff6ff' },
        { id: 'MULTIPLICATION', icon: '✖️', label: 'Multiplication', desc: 'Find the product', color: '#10b981', bg: '#ecfdf5' },
        { id: 'DIVISION', icon: '➗', label: 'Division', desc: 'Find the quotient', color: '#f59e0b', bg: '#fffbeb' }
    ];

    const difficultyCards = [
        { id: 'EASY', label: 'Easy', icon: '🟢', desc: 'Single digits' },
        { id: 'MEDIUM', label: 'Medium', icon: '🟡', desc: 'Double digits' },
        { id: 'HARD', label: 'Hard', icon: '🔴', desc: 'Triple digits' }
    ];

    useEffect(() => {
        const fetchActiveSession = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = user?.username || 'GUEST';
                const res = await axios.get(`${CONFIG.development.GATEWAY_URL}/api/assessment/random-math/session/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data && res.data.status === 'IN_PROGRESS' && res.data.assessmentData) {
                    const savedData = JSON.parse(res.data.assessmentData);
                    setSession(res.data);
                    setQuestions(savedData.randomMathQuestions);
                    setCurrentIndex(res.data.resumeQuestionIndex);
                    setScore(res.data.score);
                } else {
                    setSetupMode(true);
                }
            } catch (err) {
                console.error("Error fetching session, starting fresh.", err);
                setSetupMode(true);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchActiveSession();
    }, [user]);

    const startNewAssessment = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const userId = user?.username || 'GUEST';
            const res = await axios.get(`${CONFIG.development.GATEWAY_URL}/api/assessment/allrandomquestions`, {
                params: {
                    userId: userId,
                    numberOfQuestions: 10,
                    type: mathType,
                    complexity: complexity
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            setSession({ assessmentId: res.data.assessmentId, assessmentType: 'MATH_CHALLENGE' });
            setQuestions(res.data.questions);
            setCurrentIndex(0);
            setScore(0);
            setSetupMode(false);
            setCompleted(false);
        } catch (err) {
            alert("Failed to generate questions. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = async () => {
        if (!selectedAnswer) return;

        const currentQuestion = questions[currentIndex];
        
        // FIX: Force both values to be Numbers to guarantee a perfect match!
        const isCorrect = Number(selectedAnswer) === Number(currentQuestion.answer.correct);
        const newScore = isCorrect ? score + 1 : score;

        const updatedQuestion = {
            ...currentQuestion,
            answer: { ...currentQuestion.answer, selected: selectedAnswer, status: isCorrect ? 'CORRECT' : 'INCORRECT' }
        };

        const isLastQuestion = currentIndex === questions.length - 1;
        const nextStatus = isLastQuestion ? 'COMPLETED' : 'IN_PROGRESS';

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${CONFIG.development.GATEWAY_URL}/api/assessment/submitrandomquestion`, {
                userId: user?.username || 'GUEST',
                email: user?.email,
                assessmentId: session.assessmentId,
                assessmentType: 'MATH_CHALLENGE',
                assessmentStatus: nextStatus,
                currentQuestion: updatedQuestion
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setScore(newScore);
            setSelectedAnswer('');

            if (isLastQuestion) {
                setCompleted(true);
            } else {
                setCurrentIndex(prev => prev + 1);
            }
        } catch (err) {
            alert("Failed to submit answer. Check your connection.");
        }
    };

    if (loading) return <div className="timeless-layout"><div className="spinner"></div></div>;

    return (
        <div className="timeless-layout">
            <div className="focus-reading-mode">
                <button className="back-btn" onClick={() => navigate('/assessments')} style={{ marginBottom: '20px' }}>
                    ← Back to Assessment Hub
                </button>

                <div className="reading-canvas" style={{ maxWidth: '800px' }}>
                    <h2 className="reading-title" style={{ textAlign: 'center', marginBottom: '30px' }}>⚡ Speed Math Challenge</h2>

                    {setupMode ? (
                        <div className="assessment-section">
                            <h3 style={{ color: '#1e293b', marginBottom: '15px' }}>1. Select Operation</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                                {typeCards.map(type => (
                                    <div 
                                        key={type.id}
                                        onClick={() => setMathType(type.id)}
                                        style={{
                                            border: `2px solid ${mathType === type.id ? type.color : '#e2e8f0'}`,
                                            backgroundColor: mathType === type.id ? type.bg : '#ffffff',
                                            borderRadius: '16px', padding: '20px 15px', cursor: 'pointer',
                                            textAlign: 'center', transition: 'all 0.2s ease',
                                            boxShadow: mathType === type.id ? `0 4px 12px ${type.color}33` : 'none',
                                            transform: mathType === type.id ? 'translateY(-2px)' : 'none'
                                        }}
                                    >
                                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{type.icon}</div>
                                        <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.1rem' }}>{type.label}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '5px' }}>{type.desc}</div>
                                    </div>
                                ))}
                            </div>

                            <h3 style={{ color: '#1e293b', marginBottom: '15px' }}>2. Select Difficulty</h3>
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' }}>
                                {difficultyCards.map(diff => (
                                    <div 
                                        key={diff.id}
                                        onClick={() => setComplexity(diff.id)}
                                        style={{
                                            flex: 1, minWidth: '120px',
                                            border: `2px solid ${complexity === diff.id ? '#3b82f6' : '#e2e8f0'}`,
                                            backgroundColor: complexity === diff.id ? '#eff6ff' : '#ffffff',
                                            borderRadius: '12px', padding: '15px', cursor: 'pointer',
                                            textAlign: 'center', transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{diff.icon}</div>
                                        <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{diff.label}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{diff.desc}</div>
                                    </div>
                                ))}
                            </div>

                            <button 
                                className="modern-submit-btn" 
                                onClick={startNewAssessment}
                                style={{ width: '100%', padding: '16px', fontSize: '1.2rem', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
                            >
                                Start Timer & Begin Challenge 🚀
                            </button>
                        </div>
                    ) : completed ? (
                        <div className="assessment-done-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
                            <div className="done-icon" style={{ fontSize: '4rem', marginBottom: '20px' }}>🏆</div>
                            <h3 style={{ fontSize: '2rem', color: '#1e293b', marginBottom: '10px' }}>Challenge Complete!</h3>
                            <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '20px' }}>Great job exercising your brain.</p>
                            
                            <div className="score-display" style={{ display: 'inline-block', background: '#f8fafc', padding: '20px 40px', borderRadius: '20px', marginBottom: '30px' }}>
                                <span className="score-number" style={{ fontSize: '3rem', color: '#3b82f6', fontWeight: '900' }}>{score}</span> 
                                <span style={{ fontSize: '1.5rem', color: '#94a3b8', margin: '0 10px' }}>/</span> 
                                <span style={{ fontSize: '2rem', color: '#64748b', fontWeight: 'bold' }}>{questions.length}</span>
                            </div>
                            
                            <br/>
                            <button className="modern-submit-btn" onClick={() => setSetupMode(true)} style={{ padding: '12px 30px', borderRadius: '10px' }}>
                                Play Again 🔄
                            </button>
                        </div>
                    ) : (
                        <div className="assessment-section">
                            <div className="modern-question-box" style={{ padding: '40px' }}>
                                <div className="question-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                                    <span className="q-badge" style={{ fontSize: '1.1rem', padding: '8px 16px' }}>Question {currentIndex + 1} of {questions.length}</span>
                                    <span className="q-badge" style={{ background: '#ecfdf5', color: '#059669', fontSize: '1.1rem', padding: '8px 16px', border: '1px solid #a7f3d0' }}>
                                        Score: 🎯 {score}
                                    </span>
                                </div>
                                
                                <div style={{ 
                                    background: '#f8fafc', padding: '40px 20px', borderRadius: '20px', 
                                    textAlign: 'center', marginBottom: '30px', border: '2px dashed #e2e8f0' 
                                }}>
                                    <h3 className="q-text" style={{ fontSize: '3.5rem', margin: '0', color: '#0f172a', fontWeight: '900', letterSpacing: '2px' }}>
                                        {questions[currentIndex]?.name}
                                    </h3>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                                    <input 
                                        type="number" 
                                        style={{ 
                                            width: '100%', maxWidth: '300px', fontSize: '2rem', textAlign: 'center', 
                                            padding: '15px', borderRadius: '16px', border: '3px solid #cbd5e1', 
                                            outline: 'none', color: '#1e293b', fontWeight: 'bold', transition: 'border-color 0.2s'
                                        }}
                                        placeholder="="
                                        value={selectedAnswer}
                                        onChange={(e) => setSelectedAnswer(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                        onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                                        autoFocus
                                    />
                                </div>

                                <button 
                                    className="modern-submit-btn" 
                                    onClick={submitAnswer}
                                    disabled={!selectedAnswer}
                                    style={{ 
                                        width: '100%', padding: '18px', fontSize: '1.2rem', borderRadius: '16px',
                                        opacity: !selectedAnswer ? 0.5 : 1, transition: 'all 0.2s'
                                    }}
                                >
                                    Submit Answer
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}