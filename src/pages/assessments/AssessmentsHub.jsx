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
        {
            id: 'simple-math',
            title: 'Speed Math Challenge',
            description: 'Test your calculation speed with dynamically generated math problems.',
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
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            path: '/assessments/math-by-grade'
        },
        {
            id: 'subject-assessment',
            title: 'Subject Assessments',
            description: 'Comprehensive tests across various subjects including Science, English, and more.',
            icon: '📚',
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            path: '/assessments/subject-assessments'
        },
        {
            id: 'challenge-arena',
            title: '⚔️ Challenge Arena',
            description: 'Compete with peers in timed skill challenges. Test your speed and accuracy!',
            icon: '🏆',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            path: '/assessments/challenge-arena'
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
                        <div className="hub-card-icon" style={{ background: cat.gradient }}>
                            {cat.icon}
                        </div>
                        <div className="hub-card-content">
                            <h3>{cat.title}</h3>
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
                                <div className="hub-start-btn">Start Assessment ➔</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}