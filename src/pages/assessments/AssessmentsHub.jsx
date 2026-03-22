import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import CONFIG from '../../Config';
import './AssessmentsHub.css';

export default function AssessmentsHub() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [mathSession, setMathSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch active sessions to show "Resume" buttons
        const checkActiveSessions = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = user?.username || 'GUEST';
                // We will build this endpoint in the backend next
                const res = await axios.get(`${CONFIG.development.GATEWAY_URL}/api/assessment/random-math/session/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data && res.data.status === 'IN_PROGRESS') {
                    setMathSession(res.data);
                }
            } catch (err) {
                console.log("No active math session found.");
            } finally {
                setLoading(false);
            }
        };
        
        if (user) checkActiveSessions();
        else setLoading(false);
    }, [user]);

    const categories = [
        // 🚀 NEW: Premium Global Exams Card
        {
            id: 'competitive-exams',
            title: 'Global Entrance Matrix',
            description: 'Simulate real-world competitive exams (IIT-JEE, SAT, EAMCET) with section timers and negative marking.',
            icon: '🌍',
            gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', // Sleek dark theme for premium feel
            path: '/competitive-hub',
            hasResume: false,
            progress: 0
        },
        {
            id: 'speed-math',
            title: 'Speed Math Challenge',
            description: 'Test your calculation speed with timed math problems. Improve mental math skills.',
            icon: '⚡',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            path: '/assessments/speed-math',
            hasResume: mathSession != null,
            progress: mathSession ? Math.round((mathSession.resumeQuestionIndex / mathSession.totalQuestions) * 100) : 0
        },
        {
            id: 'grade-math',
            title: 'Math by Grade',
            description: 'Structured mathematics assessments tailored to your specific grade level.',
            icon: '📐',
            gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            path: '/assessments/math-by-grade'
        },
        {
            id: 'reading-comprehension',
            title: 'Reading Comprehension',
            description: 'Test reading skills with passages and questions. Build critical thinking.',
            icon: '📖',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            path: '/assessments/reading-comprehension'
        },
        {
            id: 'vocabulary-spelling',
            title: 'Vocabulary & Spelling',
            description: 'Master word meanings, spellings, and usage. Expand your language skills.',
            icon: '📝',
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            path: '/assessments/vocabulary-spelling'
        },
        {
            id: 'science-lab',
            title: 'Science Lab',
            description: 'Explore scientific concepts with interactive questions and experiments.',
            icon: '🔬',
            gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            path: '/assessments/science-lab'
        },
        {
            id: 'grammar-language',
            title: 'Grammar & Language',
            description: 'Master grammar rules, sentence structure, and proper language usage.',
            icon: '✍️',
            gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            path: '/assessments/grammar-language'
        },
        {
            id: 'critical-thinking',
            title: 'Critical Thinking',
            description: 'Solve puzzles, riddles, and logic problems. Develop reasoning skills.',
            icon: '🧠',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            path: '/assessments/critical-thinking'
        },
        {
            id: 'subject-tests',
            title: 'Subject Tests',
            description: 'Comprehensive tests across Math, Science, English, Social Studies.',
            icon: '📚',
            gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
            path: '/assessments/subject-assessments'
        },
        {
            id: 'challenge-arena',
            title: 'Challenge Arena',
            description: 'Compete with classmates in real-time challenges. Race against the clock!',
            icon: '🏆',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            path: '/assessments/challenge-arena'
        },
        {
            id: 'it-learning-hub',
            title: 'IT Learning Hub',
            description: 'Learn programming, computer science, and digital skills with videos & assessments.',
            icon: '💻',
            gradient: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
            path: '/it-learning-hub'
        }
    ];

    if (loading) return <div className="hub-loading"><div className="spinner"></div></div>;

    return (
        <div className="assessment-hub-container">
            <div className="hub-header">
                <h1>Assessment Center</h1>
                <p>Choose a category below to test your knowledge and track your progress.</p>
            </div>

            <div className="hub-grid">
                {categories.map(cat => (
                    <div key={cat.id} className="hub-card" onClick={() => navigate(cat.path)}>
                        <div className="hub-card-icon" style={{ background: cat.gradient, border: cat.id === 'competitive-exams' ? '2px solid #38bdf8' : 'none' }}>
                            {cat.icon}
                        </div>
                        <div className="hub-card-content">
                            <h3 style={{ color: cat.id === 'competitive-exams' ? '#38bdf8' : 'inherit' }}>{cat.title}</h3>
                            <p>{cat.description}</p>
                            
                            {cat.hasResume ? (
                                <div className="hub-resume-section">
                                    <div className="hub-progress-bar">
                                        <div className="hub-progress-fill" style={{ width: `${cat.progress}%`, background: cat.gradient }}></div>
                                    </div>
                                    <div className="hub-resume-text">
                                        <span>{cat.progress}% Completed</span>
                                        <span className="hub-resume-btn">Resume Now ➔</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="hub-start-btn" style={{ color: cat.id === 'competitive-exams' ? '#38bdf8' : 'inherit' }}>
                                    {cat.id === 'competitive-exams' ? 'Enter Matrix ➔' : 'Start Assessment ➔'}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}