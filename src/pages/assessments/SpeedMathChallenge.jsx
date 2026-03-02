import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import CONFIG from '../../Config';

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

    const [setupMode, setSetupMode] = useState(true); // ALWAYS true initially to show the globe!
    const [mathType, setMathType] = useState('ADDITION');
    const [complexity, setComplexity] = useState('EASY');
    
    // NEW: Store the active session but don't force the user into it
    const [activeSavedSession, setActiveSavedSession] = useState(null);

    // 28 Math Challenge Options with varying "weights" to create a realistic, responsive cloud/universe
    const mathNodes = [
        { id: 'ADDITION', label: '➕ Addition', weight: 3, color: '#ef4444' },
        { id: 'SUBTRACTION', label: '➖ Subtraction', weight: 3, color: '#3b82f6' },
        { id: 'MULTIPLICATION', label: '✖️ Multiplication', weight: 3, color: '#10b981' },
        { id: 'DIVISION', label: '➗ Division', weight: 3, color: '#f59e0b' },
        { id: 'MIXED_OPERATIONS', label: '🔀 Mixed Ops', weight: 3, color: '#8b5cf6' },
        { id: 'ALGEBRA_LINEAR', label: '𝑥 Algebra', weight: 3, color: '#f43f5e' },
        { id: 'PERCENTAGE', label: '📈 Percentage', weight: 2, color: '#ec4899' },
        { id: 'FRACTION_ADDITION', label: '½ Frac Add', weight: 2, color: '#14b8a6' },
        { id: 'FRACTION_MULTIPLICATION', label: '¾ Frac Mult', weight: 2, color: '#06b6d4' },
        { id: 'DECIMALS', label: '0.5 Decimals', weight: 2, color: '#f97316' },
        { id: 'RATIO_PROPORTION', label: 'a:b Ratio', weight: 2, color: '#84cc16' },
        { id: 'MODULUS', label: '% Modulus', weight: 2, color: '#6366f1' },
        { id: 'SQUARE_ROOT', label: '√ Sq Root', weight: 2, color: '#d946ef' },
        { id: 'EXPONENTIATION', label: 'x² Exponents', weight: 2, color: '#eab308' },
        { id: 'MEAN_MEDIAN_MODE', label: 'x̄ Mean/Med', weight: 2, color: '#2dd4bf' },
        { id: 'PROBABILITY', label: '🎲 Probability', weight: 2, color: '#fb923c' },
        { id: 'GEOMETRY_AREA', label: '⬜ Area', weight: 2, color: '#a3e635' },
        { id: 'GEOMETRY_PERIMETER', label: '📏 Perimeter', weight: 2, color: '#c084fc' },
        { id: 'CUBE_ROOT', label: '∛ Cube Root', weight: 1, color: '#fca5a5' },
        { id: 'FACTORIAL', label: 'n! Factorial', weight: 1, color: '#93c5fd' },
        { id: 'LOGARITHM', label: 'log(x) Log', weight: 1, color: '#6ee7b7' },
        { id: 'GCD_LCM', label: 'LCM / GCD', weight: 1, color: '#fcd34d' },
        { id: 'PRIME_COMPOSITE', label: 'Prime / Comp', weight: 1, color: '#c4b5fd' },
        { id: 'EVEN_ODD', label: 'Even / Odd', weight: 1, color: '#fca5a5' },
        { id: 'ROMAN_NUMERALS', label: 'XIV Roman', weight: 1, color: '#67e8f9' },
        { id: 'BINARY_CONVERSION', label: '0101 Binary', weight: 1, color: '#fdba74' },
        { id: 'TRIGONOMETRIC', label: 'sin(θ) Trig', weight: 1, color: '#d8b4fe' }
    ];

    const difficultyCards = [
        { id: 'EASY', label: 'Easy', color: '#22c55e' },
        { id: 'MEDIUM', label: 'Medium', color: '#eab308' },
        { id: 'HARD', label: 'Hard', color: '#ef4444' },
        { id: 'EXTREME', label: 'Extreme', color: '#7f1d1d' }
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
                    // Just save it to state so we can show a banner, don't auto-start it!
                    setActiveSavedSession(res.data);
                }
            } catch (err) {
                console.error("No active session found.");
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchActiveSession();
    }, [user]);

    // NEW: Function to manually resume the saved session when they click the banner button
    const handleResumeSavedSession = () => {
        if (!activeSavedSession) return;
        const savedData = JSON.parse(activeSavedSession.assessmentData);
        setSession(activeSavedSession);
        setQuestions(savedData.randomMathQuestions);
        setCurrentIndex(activeSavedSession.resumeQuestionIndex);
        setScore(activeSavedSession.score);
        setSetupMode(false);
        setCompleted(false);
    };

    const startNewAssessment = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const userId = user?.username || 'GUEST';
            const res = await axios.get(`${CONFIG.development.GATEWAY_URL}/api/assessment/allrandomquestions`, {
                params: { userId: userId, numberOfQuestions: 10, type: mathType, complexity: complexity },
                headers: { Authorization: `Bearer ${token}` }
            });

            setSession({ assessmentId: res.data.assessmentId, assessmentType: 'MATH_CHALLENGE' });
            setQuestions(res.data.questions);
            setCurrentIndex(0);
            setScore(0);
            setSetupMode(false);
            setCompleted(false);
            setActiveSavedSession(null); // Clear the banner once they start a new one
        } catch (err) {
            alert("Failed to generate questions. Please ensure the backend is running and up to date!");
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = async () => {
        if (!selectedAnswer) return;

        const currentQuestion = questions[currentIndex];
        const isLastQuestion = currentIndex === questions.length - 1;
        const nextStatus = isLastQuestion ? 'COMPLETED' : 'IN_PROGRESS';

        const updatedQuestion = {
            ...currentQuestion,
            answer: { ...currentQuestion.answer, selected: selectedAnswer }
        };

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${CONFIG.development.GATEWAY_URL}/api/assessment/submitrandomquestion`, {
                userId: user?.username || 'GUEST',
                email: user?.email,
                assessmentId: session.assessmentId,
                assessmentType: 'MATH_CHALLENGE',
                assessmentStatus: nextStatus,
                currentQuestion: updatedQuestion
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.score !== undefined) {
                setScore(res.data.score);
            }

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

    const endAssessment = async () => {
        if (!window.confirm("Are you sure you want to end this challenge early? Your current score will be saved.")) return;
        
        try {
            const token = localStorage.getItem('token');
            const currentQuestion = questions[currentIndex];
            
            const updatedQuestion = {
                ...currentQuestion,
                answer: { ...currentQuestion.answer, selected: '' }
            };

            await axios.post(`${CONFIG.development.GATEWAY_URL}/api/assessment/submitrandomquestion`, {
                userId: user?.username || 'GUEST',
                email: user?.email,
                assessmentId: session.assessmentId,
                assessmentType: 'MATH_CHALLENGE',
                assessmentStatus: 'COMPLETED',
                currentQuestion: updatedQuestion
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCompleted(true);
        } catch (err) {
            alert("Failed to end assessment.");
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><div className="spinner"></div></div>;

    const getBubbleStyle = (weight, isSelected, color) => {
        const baseStyle = {
            cursor: 'pointer',
            borderRadius: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            border: `2px solid ${color}`,
            background: isSelected ? color : 'rgba(255, 255, 255, 0.05)',
            color: isSelected ? '#ffffff' : color,
            boxShadow: isSelected ? `0 0 20px ${color}99, inset 0 0 10px rgba(255,255,255,0.5)` : 'none',
            transform: isSelected ? 'scale(1.1) translateY(-5px)' : 'scale(1)'
        };

        if (weight === 3) return { ...baseStyle, fontSize: '1.1rem', padding: '16px 28px' };
        if (weight === 2) return { ...baseStyle, fontSize: '0.95rem', padding: '12px 20px' };
        return { ...baseStyle, fontSize: '0.85rem', padding: '8px 16px' };
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
            <button onClick={() => navigate('/assessments')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>←</span> Back to Hub
            </button>

            {setupMode ? (
                <div style={{ background: '#ffffff', borderRadius: '24px', padding: '30px 20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
                    
                    {/* NEW: Display Banner if they have an active session! */}
                    {activeSavedSession && (
                        <div style={{ background: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: '16px', padding: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '1.2rem' }}>⚡ Active Challenge Detected</h3>
                                <p style={{ margin: 0, color: '#64748b' }}>You were in the middle of a <b>{activeSavedSession.assessmentName}</b> challenge.</p>
                            </div>
                            <button onClick={handleResumeSavedSession} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
                                Resume Challenge →
                            </button>
                        </div>
                    )}

                    <h2 style={{ textAlign: 'center', fontSize: '2.2rem', color: '#1e293b', margin: '0 0 5px 0', fontWeight: '800' }}>The Math Universe 🌍</h2>
                    <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '30px', fontSize: '1.1rem' }}>Select a constellation to begin your challenge.</p>

                    <div style={{ 
                        background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)', 
                        borderRadius: '24px', padding: '40px 20px', marginBottom: '40px',
                        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '12px',
                        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)'
                    }}>
                        {mathNodes.map(node => (
                            <div 
                                key={node.id}
                                onClick={() => setMathType(node.id)}
                                style={getBubbleStyle(node.weight, mathType === node.id, node.color)}
                                onMouseEnter={(e) => {
                                    if(mathType !== node.id) {
                                        e.target.style.background = `${node.color}22`;
                                        e.target.style.transform = 'scale(1.05)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if(mathType !== node.id) {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                        e.target.style.transform = 'scale(1)';
                                    }
                                }}
                            >
                                {node.label}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '40px' }}>
                        {difficultyCards.map(diff => (
                            <div 
                                key={diff.id} onClick={() => setComplexity(diff.id)}
                                style={{
                                    padding: '12px 24px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold',
                                    background: complexity === diff.id ? diff.color : '#f8fafc',
                                    color: complexity === diff.id ? '#ffffff' : '#475569',
                                    transition: 'all 0.2s', border: `2px solid ${complexity === diff.id ? diff.color : '#e2e8f0'}`,
                                    boxShadow: complexity === diff.id ? `0 4px 15px ${diff.color}66` : 'none',
                                    transform: complexity === diff.id ? 'translateY(-2px)' : 'none'
                                }}
                            >
                                {diff.label}
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={startNewAssessment}
                        style={{ width: '100%', maxWidth: '400px', margin: '0 auto', display: 'block', padding: '20px', fontSize: '1.3rem', fontWeight: 'bold', borderRadius: '50px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)', transition: 'transform 0.2s' }}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        Launch Challenge 🚀
                    </button>
                </div>
            ) : completed ? (
                <div style={{ textAlign: 'center', background: '#ffffff', padding: '60px 20px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: '6rem', marginBottom: '10px', animation: 'bounce 2s infinite' }}>🏆</div>
                    <h2 style={{ fontSize: '2.8rem', color: '#1e293b', margin: '0 0 10px 0', fontWeight: '900' }}>Sector Conquered!</h2>
                    <p style={{ color: '#64748b', fontSize: '1.2rem' }}>You successfully completed the <b>{mathNodes.find(n => n.id === mathType)?.label || mathType}</b> challenge.</p>
                    
                    <div style={{ background: '#f8fafc', padding: '30px 60px', borderRadius: '30px', display: 'inline-block', margin: '40px 0', border: '2px solid #e2e8f0' }}>
                        <span style={{ fontSize: '5rem', color: '#3b82f6', fontWeight: '900', lineHeight: '1' }}>{score}</span> 
                        <span style={{ fontSize: '2.5rem', color: '#cbd5e1', margin: '0 20px' }}>/</span> 
                        <span style={{ fontSize: '3rem', color: '#64748b', fontWeight: 'bold', lineHeight: '1' }}>{questions.length}</span>
                    </div>
                    <br/>
                    <button onClick={() => setSetupMode(true)} style={{ padding: '16px 40px', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '50px', background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(15,23,42,0.3)' }}>
                        Explore Another Sector 🌍
                    </button>
                </div>
            ) : (
                <div style={{ background: '#ffffff', borderRadius: '24px', padding: '40px 20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '15px' }}>
                        <div style={{ background: '#f1f5f9', padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', color: '#475569', fontSize: '1.1rem', border: '1px solid #e2e8f0' }}>
                            {mathNodes.find(n => n.id === mathType)?.label || mathType}
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <span style={{ background: '#eff6ff', color: '#2563eb', padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                Q: {currentIndex + 1} / {questions.length}
                            </span>
                            <span style={{ background: '#ecfdf5', color: '#059669', padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 0 0 2px #a7f3d0' }}>
                                Score: {score}
                            </span>
                        </div>
                    </div>
                    
                    <div style={{ background: '#f8fafc', padding: '80px 20px', borderRadius: '30px', textAlign: 'center', marginBottom: '40px', border: '3px dashed #e2e8f0' }}>
                        <h3 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', margin: '0', color: '#0f172a', fontWeight: '900', letterSpacing: '2px' }}>
                            {questions[currentIndex]?.name}
                        </h3>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                        <input 
                            type="text" 
                            inputMode="decimal"
                            autoComplete="off"
                            style={{ 
                                width: '100%', maxWidth: '400px', fontSize: '2.5rem', textAlign: 'center', 
                                padding: '20px', borderRadius: '24px', border: '4px solid #cbd5e1', 
                                outline: 'none', color: '#1e293b', fontWeight: '900', transition: 'all 0.2s',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                            }}
                            placeholder="="
                            value={selectedAnswer}
                            onChange={(e) => setSelectedAnswer(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                            onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 10px 30px rgba(59,130,246,0.15)'; }}
                            onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)'; }}
                            autoFocus
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', maxWidth: '400px', margin: '0 auto' }}>
                        <button 
                            onClick={submitAnswer}
                            disabled={!selectedAnswer}
                            style={{ 
                                flex: 2, padding: '20px', fontSize: '1.3rem', fontWeight: 'bold', borderRadius: '50px',
                                background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer',
                                opacity: !selectedAnswer ? 0.5 : 1, transition: 'all 0.2s',
                                boxShadow: !selectedAnswer ? 'none' : '0 10px 25px rgba(15,23,42,0.3)'
                            }}
                        >
                            Submit 🎯
                        </button>

                        <button 
                            onClick={endAssessment}
                            style={{ 
                                flex: 1, padding: '20px', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '50px',
                                background: '#fee2e2', color: '#ef4444', border: '2px solid #fca5a5', cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#fecaca'}
                            onMouseLeave={(e) => e.target.style.background = '#fee2e2'}
                        >
                            End 🛑
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}