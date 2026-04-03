import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import CONFIG from '../../Config';

export default function SpeedMathChallenge() {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const currentUserId = user ? (user.id || user.email || 'GUEST_USER') : 'GUEST_USER';
    
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(false);

    const [setupMode, setSetupMode] = useState(true); 
    const [mathType, setMathType] = useState('ADDITION');
    const [complexity, setComplexity] = useState('EASY');
    
    const [activeSavedSession, setActiveSavedSession] = useState(null);

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
        { id: 'EASY', label: 'Easy (Lvl 1)', color: '#22c55e' },
        { id: 'MEDIUM', label: 'Medium (Lvl 2)', color: '#eab308' },
        { id: 'HARD', label: 'Hard (Lvl 3)', color: '#ef4444' },
        { id: 'EXTREME', label: 'Extreme (Lvl 4)', color: '#7f1d1d' }
    ];

    useEffect(() => {
        const fetchActiveSession = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${CONFIG.development.GATEWAY_URL}/api/assessment/random-math/session/${encodeURIComponent(currentUserId)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data && res.data.status === 'IN_PROGRESS' && res.data.assessmentData) {
                    setActiveSavedSession(res.data);
                }
            } catch (err) {
                console.error("No active session found.");
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchActiveSession();
    }, [user, currentUserId]);

    const handleResumeSavedSession = () => {
        if (!activeSavedSession) return;
        const savedData = JSON.parse(activeSavedSession.assessmentData);
        setSession(activeSavedSession);
        setQuestions(savedData.randomMathQuestions);
        
        const qIndex = activeSavedSession.resumeQuestionIndex;
        if (qIndex >= savedData.randomMathQuestions.length) {
            setCurrentIndex(savedData.randomMathQuestions.length - 1);
            setCompleted(true);
        } else {
            setCurrentIndex(qIndex);
        }
        
        setScore(activeSavedSession.score);
        
        if (savedData.randomMathQuestions && savedData.randomMathQuestions.length > 0) {
            setMathType(savedData.randomMathQuestions[0].type.toUpperCase());
        }

        setSetupMode(false);
    };

    const startNewAssessment = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${CONFIG.development.GATEWAY_URL}/api/assessment/allrandomquestions`, {
                params: { userId: currentUserId, numberOfQuestions: 10, type: mathType, complexity: complexity },
                headers: { Authorization: `Bearer ${token}` }
            });

            setSession({ assessmentId: res.data.assessmentId, assessmentType: 'MATH_CHALLENGE' });
            setQuestions(res.data.questions);
            setCurrentIndex(0);
            setScore(0);
            setSetupMode(false);
            setCompleted(false);
            setActiveSavedSession(null); 
        } catch (err) {
            alert("Failed to generate questions. Please ensure the backend is running and up to date!");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        if (/^-?\d*\.?\d*$/.test(val) || val === '') {
            setSelectedAnswer(val);
        }
    };

    const submitAnswer = async () => {
        if (!selectedAnswer || !questions || !questions[currentIndex]) return;

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
                userId: currentUserId, 
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
            await axios.post(`${CONFIG.development.GATEWAY_URL}/api/assessment/end-session`, null, {
                params: {
                    userId: currentUserId,
                    assessmentId: session.assessmentId,
                    assessmentType: 'MATH_CHALLENGE'
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            setCompleted(true);
        } catch (err) {
            alert("Failed to end assessment.");
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><div className="spinner"></div></div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
            
            <style>
            {`
                .universe-grid {
                    background-color: #020617;
                    background-image: 
                        radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.15) 0%, transparent 60%),
                        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 100% 100%, 40px 40px, 40px 40px;
                    border: 1px solid #1e293b;
                    box-shadow: inset 0 0 50px rgba(0,0,0,0.8), 0 20px 40px rgba(0,0,0,0.1);
                    border-radius: 24px;
                    padding: 50px 30px;
                    margin-bottom: 40px;
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    align-items: center;
                    gap: 20px;
                }

                .math-node-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-top: 1px solid rgba(255, 255, 255, 0.2);
                    border-bottom: 3px solid var(--node-color);
                    border-radius: 20px;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    position: relative;
                    overflow: hidden;
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
                }

                .math-node-card:hover {
                    background: rgba(30, 41, 59, 0.85);
                    border-color: var(--node-color);
                    color: #f8fafc;
                    transform: translateY(-8px);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.5), 0 0 30px var(--node-color-alpha);
                    z-index: 10;
                }

                .math-node-card.selected {
                    background: var(--node-color-alpha-heavy);
                    border-color: var(--node-color);
                    color: #ffffff;
                    transform: translateY(-12px) scale(1.05);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.7), 0 0 50px var(--node-color-alpha), inset 0 0 25px var(--node-color-alpha);
                    z-index: 20;
                    animation: float-pulse 3s ease-in-out infinite;
                }

                .math-node-card .node-huge-icon {
                    font-size: var(--icon-size);
                    margin-bottom: 8px;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    text-shadow: 0 5px 15px rgba(0,0,0,0.8);
                    filter: drop-shadow(0 0 10px var(--node-color-alpha));
                    line-height: 1;
                }

                .math-node-card:hover .node-huge-icon {
                    transform: scale(1.15);
                    filter: drop-shadow(0 0 20px var(--node-color));
                    text-shadow: 0 0 20px rgba(255,255,255,0.4);
                }

                .math-node-card.selected .node-huge-icon {
                    transform: scale(1.25);
                    filter: drop-shadow(0 0 35px var(--node-color));
                    text-shadow: 0 0 30px rgba(255,255,255,0.8);
                }

                .math-node-card .node-label-text {
                    font-weight: 800;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    text-align: center;
                    font-size: var(--text-size);
                    transition: color 0.3s;
                }

                .math-node-card.selected .node-label-text {
                    color: #ffffff;
                    text-shadow: 0 0 10px var(--node-color);
                }

                @keyframes float-pulse {
                    0% { transform: translateY(-12px) scale(1.05); box-shadow: 0 20px 40px rgba(0,0,0,0.7), 0 0 30px var(--node-color-alpha), inset 0 0 15px var(--node-color-alpha); }
                    50% { transform: translateY(-18px) scale(1.08); box-shadow: 0 25px 50px rgba(0,0,0,0.8), 0 0 60px var(--node-color-alpha), inset 0 0 30px var(--node-color-alpha); }
                    100% { transform: translateY(-12px) scale(1.05); box-shadow: 0 20px 40px rgba(0,0,0,0.7), 0 0 30px var(--node-color-alpha), inset 0 0 15px var(--node-color-alpha); }
                }

                .difficulty-card {
                    flex: 1;
                    min-width: 140px;
                    padding: 16px 20px;
                    border-radius: 16px;
                    background: #f8fafc;
                    border: 2px solid #e2e8f0;
                    color: #64748b;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                }
                
                .difficulty-card:hover {
                    background: #f1f5f9;
                    transform: translateY(-2px);
                }

                .difficulty-card.selected {
                    background: #0f172a;
                    border-color: var(--diff-color);
                    color: #ffffff;
                    transform: translateY(-4px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1), 0 0 20px var(--diff-color-alpha);
                }

                .difficulty-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; height: 5px;
                    background: var(--diff-color);
                    opacity: 0.3;
                    transition: 0.3s;
                }

                .difficulty-card.selected::before {
                    opacity: 1;
                    box-shadow: 0 0 15px var(--diff-color);
                }
                
                .universe-title {
                    background: linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 900;
                }
            `}
            </style>

            {/* 🚀 TOP NAVIGATION BAR (Consistently rendered in all states) */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                <button 
                    onClick={() => navigate('/')} 
                    style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#94a3b8'; }}
                    onMouseLeave={(e) => { e.target.style.background = '#ffffff'; e.target.style.borderColor = '#cbd5e1'; }}
                >
                    🏠 Home
                </button>
                <button 
                    onClick={() => navigate('/assessments')} 
                    style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#94a3b8'; }}
                    onMouseLeave={(e) => { e.target.style.background = '#ffffff'; e.target.style.borderColor = '#cbd5e1'; }}
                >
                    ← Back to Hub
                </button>
            </div>

            {setupMode ? (
                <div style={{ background: '#ffffff', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 50px rgba(0,0,0,0.08)' }}>
                    
                    {activeSavedSession && (
                        <div style={{ background: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: '16px', padding: '20px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '1.2rem' }}>⚡ Active Challenge Detected</h3>
                                <p style={{ margin: 0, color: '#64748b' }}>You were in the middle of a <b>{activeSavedSession.assessmentName}</b> challenge.</p>
                            </div>
                            <button onClick={handleResumeSavedSession} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
                                Resume Challenge →
                            </button>
                        </div>
                    )}

                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h2 className="universe-title" style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>The Math Universe</h2>
                        <p style={{ color: '#64748b', fontSize: '1.2rem', margin: 0 }}>Select a constellation to calibrate your navigation computer.</p>
                    </div>

                    <div className="universe-grid">
                        {mathNodes.map(node => {
                            const parts = node.label.split(' ');
                            const icon = parts[0];
                            const text = parts.slice(1).join(' ');
                            
                            let width = '120px';
                            let height = '120px';
                            let iconSize = '3.5rem';
                            let textSize = '0.75rem';
                            
                            if (node.weight === 3) { 
                                width = '180px'; height = '170px'; iconSize = '5.5rem'; textSize = '1rem'; 
                            } else if (node.weight === 2) { 
                                width = '140px'; height = '135px'; iconSize = '4.5rem'; textSize = '0.85rem'; 
                            }

                            return (
                                <div 
                                    key={node.id}
                                    onClick={() => setMathType(node.id)}
                                    className={`math-node-card ${mathType === node.id ? 'selected' : ''}`}
                                    style={{
                                        width, height,
                                        '--node-color': node.color,
                                        '--node-color-alpha': `${node.color}66`,
                                        '--node-color-alpha-heavy': `${node.color}33`,
                                        '--icon-size': iconSize,
                                        '--text-size': textSize
                                    }}
                                >
                                    <div className="node-huge-icon">{icon}</div>
                                    <div className="node-label-text">{text}</div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '50px' }}>
                        {difficultyCards.map(diff => (
                            <div 
                                key={diff.id} onClick={() => setComplexity(diff.id)}
                                className={`difficulty-card ${complexity === diff.id ? 'selected' : ''}`}
                                style={{
                                    '--diff-color': diff.color,
                                    '--diff-color-alpha': `${diff.color}66`,
                                }}
                            >
                                {diff.label}
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={startNewAssessment}
                        style={{ width: '100%', maxWidth: '400px', margin: '0 auto', display: 'block', padding: '20px', fontSize: '1.3rem', fontWeight: '900', letterSpacing: '1px', borderRadius: '50px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 10px 30px rgba(37, 99, 235, 0.4)', transition: 'transform 0.2s' }}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px) scale(1.02)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0) scale(1)'}
                    >
                        INITIALIZE SEQUENCE 🚀
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
                    <button onClick={() => { setSetupMode(true); setActiveSavedSession(null); }} style={{ padding: '16px 40px', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '50px', background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(15,23,42,0.3)' }}>
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
                            onChange={handleInputChange}
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