import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import CONFIG from '../../Config';
import './ChallengeArena.css';

export default function ChallengeArena() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const challengeIdParam = searchParams.get('challengeId');

    const currentUserId = user ? (user.email || user.id || 'GUEST_USER') : 'GUEST_USER';
    const currentUserName = user?.username || user?.firstName || user?.name || 'Guest';
    const [sessionUserId, setSessionUserId] = useState(currentUserId);

    console.log('[CHALLENGE_ARENA] Current user:', {
        user,
        currentUserId,
        currentUserName
    });

    const [activeView, setActiveView] = useState('lobby'); // lobby, create, challenge, friends
    const [availableChallenges, setAvailableChallenges] = useState([]);
    const [friends, setFriends] = useState([]);
    const [pendingInvitations, setPendingInvitations] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [friendSearchQuery, setFriendSearchQuery] = useState('');
    const [friendsTab, setFriendsTab] = useState('friends'); // friends, requests, search, invitations
    const [upcomingTournaments, setUpcomingTournaments] = useState([]);
    const [activeTournaments, setActiveTournaments] = useState([]);
    const [tournamentsTab, setTournamentsTab] = useState('upcoming'); // upcoming, active
    const [loading, setLoading] = useState(false);

    // Challenge creation state
    const [challengeType, setChallengeType] = useState('MATH_DUEL');
    const [difficulty, setDifficulty] = useState('EASY');
    const [gradeLevel, setGradeLevel] = useState('GRADE_5');

    // Active challenge state
    const [activeChallenge, setActiveChallenge] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questionIndex, setQuestionIndex] = useState(1);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [challengeCompleted, setChallengeCompleted] = useState(false);

    const challengeTypes = [
        { id: 'MATH_DUEL', name: 'Math Duel', icon: '⚡', duration: 5, questions: 10, color: '#f59e0b', active: true },
        { id: 'MENTAL_MATH_SPRINT', name: 'Mental Math Sprint', icon: '🧠', duration: 3, questions: 15, color: '#3b82f6', active: true },
        { id: 'LOGIC_PUZZLE_DUEL', name: 'Logic Puzzle', icon: '🧩', duration: 10, questions: 8, color: '#8b5cf6', active: true },
        { id: 'SCIENCE_QUIZ_BATTLE', name: 'Science Quiz', icon: '🔬', duration: 7, questions: 12, color: '#10b981', active: true },
        { id: 'VOCABULARY_MASTER', name: 'Vocabulary Master', icon: '📚', duration: 5, questions: 15, color: '#ef4444', active: true },
        { id: 'MIXED_SUBJECT_CHALLENGE', name: 'Mixed Challenge', icon: '🎯', duration: 10, questions: 20, color: '#ec4899', active: true },
    ];

    const difficulties = [
        { id: 'EASY', label: 'Easy', icon: '😊', color: '#22c55e' },
        { id: 'MEDIUM', label: 'Medium', icon: '🤔', color: '#eab308' },
        { id: 'HARD', label: 'Hard', icon: '🧠', color: '#ef4444' },
        { id: 'EXTREME', label: 'Extreme', icon: '🔥', color: '#7f1d1d' }
    ];

    const grades = ['GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6', 'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10'];

    // 🌟 FIX: Foolproof Participant Extractor
    const getMyParticipantId = (challenge = activeChallenge) => {
        if (!challenge || !challenge.participants) return sessionUserId || currentUserId;
        const token = localStorage.getItem('token');
        if (!token) {
            const guestP = challenge.participants.find(p => p.userId !== challenge.createdBy);
            return guestP ? guestP.userId : sessionUserId || currentUserId;
        }
        const loggedInP = challenge.participants.find(p => 
            p.userId === user?.username || p.userId === user?.email || p.userId === user?.id || p.userId === currentUserId
        );
        return loggedInP ? loggedInP.userId : currentUserId;
    };

    // Timer effect
    useEffect(() => {
        let interval;
        if (isTimerRunning && !challengeCompleted) {
            interval = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, challengeCompleted]);

    // Load challenge if ID in URL
    useEffect(() => {
        if (challengeIdParam) {
            loadChallengeById(challengeIdParam);
        }
    }, [challengeIdParam]);

    // Fetch available challenges
    useEffect(() => {
        if (activeView === 'lobby') {
            fetchAvailableChallenges();
        }
    }, [activeView]);

    // Fetch friends data
    useEffect(() => {
        if (activeView === 'friends') {
            fetchFriendsData();
        }
    }, [activeView, friendsTab]);

    // Fetch tournaments data
    useEffect(() => {
        if (activeView === 'tournaments') {
            fetchTournamentsData();
        }
    }, [activeView, tournamentsTab]);

    // 🌟 FIX: Safe Polling
    useEffect(() => {
        let pollInterval;
        if (!activeChallenge) return;

        const shouldPoll = activeView === 'waiting' || (activeView === 'completed' && activeChallenge.status !== 'COMPLETED');

        if (shouldPoll) {
            pollInterval = setInterval(async () => {
                try {
                    const token = localStorage.getItem('token');
                    const endpoint = token
                        ? `${CONFIG.development.GATEWAY_URL}/v1/challenge/${activeChallenge.challengeId}`
                        : `${CONFIG.development.GATEWAY_URL}/v1/challenge/${activeChallenge.challengeId}/guest`;

                    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                    const res = await axios.get(endpoint, config);

                    setActiveChallenge(res.data);

                    if (activeView === 'waiting' && res.data.status === 'ACTIVE') {
                        startChallengeQuestions(res.data);
                    }
                } catch (err) {
                    console.error('[POLLING] Error polling:', err);
                }
            }, 3000); 
        }

        return () => clearInterval(pollInterval);
    }, [activeView, activeChallenge?.status, activeChallenge?.challengeId]);

    const fetchFriendsData = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) return;

            if (friendsTab === 'friends') {
                const res = await axios.get(`${CONFIG.development.GATEWAY_URL}/v1/friends/${currentUserId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFriends(res.data || []);
            } else if (friendsTab === 'requests') {
                const res = await axios.get(`${CONFIG.development.GATEWAY_URL}/v1/friends/${currentUserId}/pending`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPendingRequests(res.data || []);
            } else if (friendsTab === 'invitations') {
                const res = await axios.get(`${CONFIG.development.GATEWAY_URL}/v1/friends/${currentUserId}/invitations`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPendingInvitations(res.data || []);
            }
        } catch (err) {}
    };

    const sendFriendRequest = async (friendEmail) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${CONFIG.development.GATEWAY_URL}/v1/friends/request`, {
                userId: currentUserId,
                userName: currentUserName,
                friendEmail: friendEmail
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Friend request sent successfully!');
            setFriendSearchQuery('');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send friend request');
        }
    };

    const acceptFriendRequest = async (friendshipId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${CONFIG.development.GATEWAY_URL}/v1/friends/accept/${friendshipId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Friend request accepted!');
            fetchFriendsData();
        } catch (err) {}
    };

    const declineFriendRequest = async (friendshipId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${CONFIG.development.GATEWAY_URL}/v1/friends/decline/${friendshipId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFriendsData();
        } catch (err) {}
    };

    const sendChallengeInvitation = async (friendId, friendName) => {
        try {
            const token = localStorage.getItem('token');
            const challengeRes = await axios.post(`${CONFIG.development.GATEWAY_URL}/v1/challenge/create`, {
                challengeType: challengeType,
                difficulty: difficulty,
                durationMinutes: challengeTypes.find(t => t.id === challengeType)?.duration || 5,
                totalQuestions: challengeTypes.find(t => t.id === challengeType)?.questions || 10,
                userId: currentUserId,
                userName: currentUserName,
                email: user?.email || 'guest@email.com',
                gradeLevel: gradeLevel,
                schoolId: user?.schoolId || 'DEFAULT_SCHOOL',
                maxParticipants: 2,
                isPublic: false,
                invitedUserId: friendId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const challengeId = challengeRes.data.challengeId;

            await axios.post(`${CONFIG.development.GATEWAY_URL}/v1/friends/challenge/invite`, {
                challengeId: challengeId,
                invitedByUserId: currentUserId,
                invitedByUserName: currentUserName,
                invitedUserId: friendId,
                invitedUserName: friendName,
                message: `${currentUserName} challenges you to a ${challengeTypes.find(t => t.id === challengeType)?.name}!`
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(`Challenge invitation sent to ${friendName}!`);
        } catch (err) {}
    };

    const acceptChallengeInvitation = async (invitation) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${CONFIG.development.GATEWAY_URL}/v1/friends/challenge/accept/${invitation.id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await joinChallenge(invitation.challengeId);
        } catch (err) {}
    };

    const declineChallengeInvitation = async (invitationId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${CONFIG.development.GATEWAY_URL}/v1/friends/challenge/decline/${invitationId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFriendsData();
        } catch (err) {}
    };

    const fetchTournamentsData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            if (tournamentsTab === 'upcoming') {
                const res = await axios.get(`${CONFIG.development.GATEWAY_URL}/v1/tournaments/upcoming`, {
                    params: { gradeLevel: gradeLevel },
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUpcomingTournaments(res.data || []);
            } else if (tournamentsTab === 'active') {
                const res = await axios.get(`${CONFIG.development.GATEWAY_URL}/v1/tournaments/active`, {
                    params: { gradeLevel: gradeLevel },
                    headers: { Authorization: `Bearer ${token}` }
                });
                setActiveTournaments(res.data || []);
            }
        } catch (err) {}
    };

    const registerForTournament = async (tournamentId, tournamentName) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${CONFIG.development.GATEWAY_URL}/v1/tournaments/register`, {
                tournamentId: tournamentId,
                userId: currentUserId,
                userName: currentUserName,
                email: user?.email || 'guest@email.com'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Successfully registered for ${tournamentName}!`);
            fetchTournamentsData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to register for tournament');
        }
    };

    const formatTimeUntil = (dateTime) => {
        const now = new Date();
        const target = new Date(dateTime);
        const diffMs = target - now;

        if (diffMs < 0) return 'Started';

        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (diffDays > 0) {
            return `${diffDays}d ${diffHours}h`;
        } else if (diffHours > 0) {
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            return `${diffHours}h ${diffMins}m`;
        } else {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            return `${diffMins}m`;
        }
    };

    const getTournamentIcon = (type) => {
        const icons = {
            'WEEKLY': '🔥',
            'MONTHLY': '🏆',
            'SPECIAL_EVENT': '⭐',
            'SCHOOL_VS_SCHOOL': '🏫',
            'CLASS_VS_CLASS': '👨‍🎓'
        };
        return icons[type] || '🎮';
    };

    const getTournamentColor = (type) => {
        const colors = {
            'WEEKLY': { bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '#f59e0b' },
            'MONTHLY': { bg: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', border: '#3b82f6' },
            'SPECIAL_EVENT': { bg: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', border: '#ec4899' },
            'SCHOOL_VS_SCHOOL': { bg: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', border: '#0ea5e9' },
            'CLASS_VS_CLASS': { bg: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)', border: '#a855f7' }
        };
        return colors[type] || colors['WEEKLY'];
    };

    const fetchAvailableChallenges = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get(`${CONFIG.development.GATEWAY_URL}/v1/challenge/available`, {
                params: { gradeLevel: 'GRADE_5' }, 
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailableChallenges(res.data || []);
        } catch (err) {}
    };

    const loadChallengeById = async (challengeId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const endpoint = token
                ? `${CONFIG.development.GATEWAY_URL}/v1/challenge/${challengeId}`
                : `${CONFIG.development.GATEWAY_URL}/v1/challenge/${challengeId}/guest`;

            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            const res = await axios.get(endpoint, config);
            setActiveChallenge(res.data);

            const myId = getMyParticipantId(res.data);
            const myParticipant = res.data.participants?.find(p => p.userId === myId);
            const isUserDone = myParticipant && myParticipant.questionsAttempted >= res.data.totalQuestions;

            if (res.data.status === 'COMPLETED' || isUserDone) {
                setChallengeCompleted(true);
                setIsTimerRunning(false);
                setActiveView('completed');
                if (myParticipant) setScore(myParticipant.score);
            } else if (res.data.status === 'ACTIVE') {
                if (activeView !== 'challenge') {
                    startChallengeQuestions(res.data);
                }
            } else {
                setActiveView('waiting');
            }
        } catch (err) {
            alert('Failed to load challenge.');
        } finally {
            setLoading(false);
        }
    };

    const createChallenge = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const selectedType = challengeTypes.find(t => t.id === challengeType);

            const res = await axios.post(`${CONFIG.development.GATEWAY_URL}/v1/challenge/create`, {
                userId: currentUserId,
                userName: currentUserName,
                email: user?.email || '',
                challengeType: challengeType,
                difficulty: difficulty,
                gradeLevel: gradeLevel,
                schoolId: user?.schoolId || 'SCHOOL_001',
                durationMinutes: selectedType.duration,
                totalQuestions: selectedType.questions,
                isPublic: true,
                maxParticipants: 2
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setActiveChallenge(res.data);
            setActiveView('waiting');
        } catch (err) {
            alert('Failed to create challenge.');
        } finally {
            setLoading(false);
        }
    };

    const joinChallenge = async (challengeId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            const endpoint = token
                ? `${CONFIG.development.GATEWAY_URL}/v1/challenge/join`
                : `${CONFIG.development.GATEWAY_URL}/v1/challenge/join-guest`;

            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            const res = await axios.post(endpoint, {
                challengeId: challengeId,
                userId: currentUserId,
                userName: currentUserName,
                email: user?.email || ''
            }, config);

            setActiveChallenge(res.data);

            if (!token && res.data.participants) {
                const guestParticipant = res.data.participants.find(p => p.userId !== res.data.createdBy);
                if (guestParticipant) {
                    setSessionUserId(guestParticipant.userId);
                }
            }

            if (res.data.status === 'ACTIVE') {
                startChallengeQuestions(res.data);
            } else {
                setActiveView('waiting');
            }
        } catch (err) {
            alert('Failed to join challenge.');
        } finally {
            setLoading(false);
        }
    };

    const startChallengeQuestions = (challenge) => {
        if (challenge.questions && challenge.questions.length > 0) {
            setCurrentQuestion(challenge.questions[0]);
            setQuestionIndex(1);
            setScore(0);
            setTimeElapsed(0);
            setIsTimerRunning(true);
            setChallengeCompleted(false);
            setActiveView('challenge');
        }
    };

    const submitAnswer = async () => {
        if (!selectedAnswer || !activeChallenge) return;

        try {
            const token = localStorage.getItem('token');

            const endpoint = token
                ? `${CONFIG.development.GATEWAY_URL}/v1/challenge/submit-answer`
                : `${CONFIG.development.GATEWAY_URL}/v1/challenge/submit-answer-guest`;

            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            const myDbId = getMyParticipantId();
            
            // 🌟 FIX: Sends BOTH "A" and "45" so the backend string matching works perfectly!
            const selectedValue = currentQuestion.options[selectedAnswer];

            const res = await axios.post(endpoint, {
                challengeId: activeChallenge.challengeId,
                userId: myDbId,
                questionIndex: questionIndex,
                userAnswer: [selectedAnswer, selectedValue], 
                timeElapsedSeconds: timeElapsed
            }, config);

            setScore(res.data.currentScore);

            if (res.data.challengeCompleted) {
                setChallengeCompleted(true);
                setIsTimerRunning(false);
                loadChallengeById(activeChallenge.challengeId);
            } else {
                const nextQuestion = activeChallenge.questions[questionIndex];
                setCurrentQuestion(nextQuestion);
                setQuestionIndex(questionIndex + 1);
                setSelectedAnswer('');
            }
        } catch (err) {
            alert('Failed to submit answer.');
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="challenge-arena-container">
                <div className="challenge-loading">
                    <div className="spinner"></div>
                    <p>Loading Challenge Arena...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="challenge-arena-container">
            <button onClick={() => navigate('/assessments')} className="back-btn">
                <span>←</span> Back to Hub
            </button>

            {/* Loading State */}
            {loading && (
                <div className="challenge-loading">
                    <div className="spinner"></div>
                    <p>Loading challenge...</p>
                </div>
            )}

            {/* Lobby View */}
            {!loading && activeView === 'lobby' && (
                <div className="arena-lobby">
                    <div className="arena-header">
                        <h1>⚔️ Challenge Arena</h1>
                        <p>Compete with peers in timed skill challenges!</p>
                    </div>

                    <div className="arena-actions">
                        <button onClick={() => setActiveView('create')} className="btn-primary">
                            ⚡ Create Challenge
                        </button>
                        <button onClick={() => setActiveView('friends')} className="btn-secondary">
                            👥 Challenge Friends
                        </button>
                        <button onClick={() => setActiveView('tournaments')} className="btn-secondary">
                            🏅 Tournaments
                        </button>
                        <button onClick={() => navigate('/assessments/leaderboard')} className="btn-secondary">
                            🏆 Leaderboards
                        </button>
                    </div>

                    <div className="available-challenges-section">
                        <h2>🎯 Join Open Challenges</h2>
                        {availableChallenges.length === 0 ? (
                            <div className="no-challenges">
                                <p>🔍 No challenges available right now.</p>
                                <p>Create one to get started!</p>
                            </div>
                        ) : (
                            <div className="challenges-grid">
                                {availableChallenges.map(challenge => {
                                    const typeInfo = challengeTypes.find(t => t.id === challenge.challengeType);
                                    return (
                                        <div key={challenge.challengeId} className="challenge-card">
                                            <div className="challenge-icon" style={{ background: typeInfo?.color }}>
                                                {typeInfo?.icon}
                                            </div>
                                            <div className="challenge-info">
                                                <h3>{typeInfo?.name}</h3>
                                                <div className="challenge-details">
                                                    <span>🎯 {challenge.difficulty}</span>
                                                    <span>⏱️ {challenge.durationMinutes} min</span>
                                                    <span>📝 {challenge.totalQuestions} Q</span>
                                                </div>
                                                <p className="challenge-creator">By: {challenge.createdByName}</p>
                                            </div>
                                            <button
                                                onClick={() => joinChallenge(challenge.challengeId)}
                                                className="join-btn"
                                            >
                                                Join Battle →
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Challenge View */}
            {!loading && activeView === 'create' && (
                <div className="create-challenge-view">
                    <button onClick={() => setActiveView('lobby')} className="back-btn">
                        ← Back to Lobby
                    </button>

                    <h2>⚡ Create New Challenge</h2>

                    <div className="form-section">
                        <label>Challenge Type</label>
                        <div className="challenge-type-grid">
                            {challengeTypes.map(type => (
                                <div
                                    key={type.id}
                                    onClick={() => setChallengeType(type.id)}
                                    className={`type-card ${challengeType === type.id ? 'selected' : ''}`}
                                    style={{ borderColor: challengeType === type.id ? type.color : '#e2e8f0' }}
                                >
                                    <div className="type-icon" style={{ background: type.color }}>{type.icon}</div>
                                    <h4>{type.name}</h4>
                                    <p>{type.duration} min • {type.questions} questions</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-section">
                        <label>Difficulty Level</label>
                        <div className="difficulty-grid">
                            {difficulties.map(diff => (
                                <button
                                    key={diff.id}
                                    onClick={() => setDifficulty(diff.id)}
                                    className={`difficulty-btn ${difficulty === diff.id ? 'selected' : ''}`}
                                    style={{
                                        borderColor: difficulty === diff.id ? diff.color : '#e2e8f0',
                                        background: difficulty === diff.id ? `${diff.color}15` : 'white'
                                    }}
                                >
                                    {diff.icon} {diff.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-section">
                        <label>Grade Level</label>
                        <select
                            value={gradeLevel}
                            onChange={(e) => setGradeLevel(e.target.value)}
                            className="grade-select"
                        >
                            {grades.map(grade => (
                                <option key={grade} value={grade}>
                                    {grade.replace('GRADE_', 'Grade ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button onClick={createChallenge} className="create-btn" disabled={loading}>
                        {loading ? 'Creating...' : '🚀 Create Challenge'}
                    </button>
                </div>
            )}

            {/* Waiting Room */}
            {!loading && activeView === 'waiting' && activeChallenge && (
                <div className="waiting-room">
                    <h2>⏳ Waiting for Opponent...</h2>
                    <div className="waiting-content">
                        <div className="challenge-summary">
                            <h3>{challengeTypes.find(t => t.id === activeChallenge.challengeType)?.name}</h3>
                            <p>🎯 {activeChallenge.difficulty} • ⏱️ {activeChallenge.durationMinutes} min</p>
                        </div>

                        <div className="participants-count">
                            <p>{activeChallenge.currentParticipants} / {activeChallenge.maxParticipants} players</p>
                        </div>

                        <div className="waiting-animation">
                            <div className="pulse-ring"></div>
                            <div className="pulse-dot"></div>
                        </div>

                        {/* Check if current user is already a participant */}
                        {(() => {
                            const myId = getMyParticipantId();
                            const isParticipant = activeChallenge.participants &&
                                activeChallenge.participants.some(p => p.userId === myId);

                            // Also check if user is the creator
                            const isCreator = activeChallenge.createdBy === myId;

                            // Show join button only if NOT a participant AND NOT the creator
                            const shouldShowJoinButton = !isParticipant && !isCreator;

                            return shouldShowJoinButton ? (
                                <>
                                    <p className="waiting-hint">Ready to join this challenge?</p>
                                    <button
                                        onClick={() => joinChallenge(activeChallenge.challengeId)}
                                        className="join-challenge-btn"
                                        disabled={loading}
                                    >
                                        {loading ? 'Joining...' : '🎮 Join Challenge'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="waiting-hint">Share the link with your opponent!</p>
                                    <div className="challenge-link-container">
                                        <code className="challenge-link">
                                            {window.location.origin}/assessments/challenge-arena?challengeId={activeChallenge.challengeId}
                                        </code>
                                        <button
                                            onClick={() => {
                                                const url = `${window.location.origin}/assessments/challenge-arena?challengeId=${activeChallenge.challengeId}`;
                                                navigator.clipboard.writeText(url);
                                                alert('Challenge link copied to clipboard!');
                                            }}
                                            className="copy-link-btn"
                                        >
                                            📋 Copy Link
                                        </button>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Active Challenge View */}
            {!loading && activeView === 'challenge' && currentQuestion && !challengeCompleted && (
                <div className="active-challenge-view">
                    <div className="challenge-header">
                        <div className="challenge-badge">{challengeTypes.find(t => t.id === activeChallenge.challengeType)?.icon} Challenge</div>
                        <div className="challenge-stats">
                            <span className="stat-timer">⏱️ {formatTime(timeElapsed)}</span>
                            <span className="stat-progress">Q: {questionIndex} / {activeChallenge.totalQuestions}</span>
                            <span className="stat-score">Score: {score}</span>
                        </div>
                    </div>

                    <div className="question-card">
                        <h3 className="question-text">{currentQuestion.questionText || currentQuestion.name}</h3>

                        <div className="options-list">
                            {Object.entries(currentQuestion.options || {}).map(([key, value]) => {
                                const isChecked = selectedAnswer === key;
                                return (
                                    <label key={key} className={`option-item ${isChecked ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="option"
                                            value={key}
                                            checked={isChecked}
                                            onChange={() => setSelectedAnswer(key)}
                                            style={{ display: 'none' }}
                                        />
                                        <div className="option-indicator">{key}</div>
                                        <span className="option-text">{value}</span>
                                    </label>
                                );
                            })}
                        </div>

                        <button onClick={submitAnswer} disabled={!selectedAnswer} className="submit-answer-btn">
                            Submit Answer 🎯
                        </button>
                    </div>
                </div>
            )}

            {/* Completion View */}
            {!loading && challengeCompleted && activeChallenge && (
                <div className="challenge-completed-view">
                    <div className="completion-trophy">🏆</div>
                    <h2>Challenge Complete!</h2>

                    {activeChallenge.status === 'ACTIVE' && (
                        <div style={{ background: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: '12px', padding: '15px', color: '#1e3a8a', fontWeight: 'bold', margin: '20px 0' }}>
                            ⏳ Waiting for your opponent to finish...
                        </div>
                    )}

                    <div className="final-score">
                        <span className="score-value">{score}</span>
                        <span className="score-label">/ {activeChallenge.totalQuestions}</span>
                    </div>

                    <div className="rankings">
                        <h3>📊 Rankings</h3>
                        {activeChallenge.participants && activeChallenge.participants
                            .sort((a, b) => (a.rank || 999) - (b.rank || 999))
                            .map((participant, idx) => (
                                <div key={participant.userId} className={`ranking-item rank-${idx + 1}`}>
                                    <span className="rank-badge">{participant.rank || '-'}</span>
                                    <span className="participant-name">
                                        {participant.userName} {participant.userId === getMyParticipantId() ? '(You)' : ''}
                                    </span>
                                    <span className="participant-score">{participant.score} pts</span>
                                </div>
                            ))}
                    </div>

                    <button onClick={() => { setActiveView('lobby'); setActiveChallenge(null); setChallengeCompleted(false); }} className="back-to-lobby-btn">
                        Return to Lobby
                    </button>
                </div>
            )}

            {/* Friends View */}
            {!loading && activeView === 'friends' && (
                <div className="friends-view">
                    <button onClick={() => setActiveView('lobby')} className="back-btn">
                        ← Back to Lobby
                    </button>

                    <h2>👥 Challenge Friends</h2>
                    <p>Manage your friends and send challenge invitations!</p>

                    <div className="friends-tabs">
                        <button
                            className={`tab-btn ${friendsTab === 'friends' ? 'active' : ''}`}
                            onClick={() => setFriendsTab('friends')}
                        >
                            Friends ({friends.length})
                        </button>
                        <button
                            className={`tab-btn ${friendsTab === 'requests' ? 'active' : ''}`}
                            onClick={() => setFriendsTab('requests')}
                        >
                            Requests {pendingRequests.length > 0 && <span className="badge">{pendingRequests.length}</span>}
                        </button>
                        <button
                            className={`tab-btn ${friendsTab === 'invitations' ? 'active' : ''}`}
                            onClick={() => setFriendsTab('invitations')}
                        >
                            Invitations {pendingInvitations.length > 0 && <span className="badge">{pendingInvitations.length}</span>}
                        </button>
                        <button
                            className={`tab-btn ${friendsTab === 'search' ? 'active' : ''}`}
                            onClick={() => setFriendsTab('search')}
                        >
                            Add Friends
                        </button>
                    </div>

                    <div className="friends-content">
                        {/* Friends List Tab */}
                        {friendsTab === 'friends' && (
                            <div className="friends-list">
                                {friends.length === 0 ? (
                                    <div className="empty-state">
                                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>👋</div>
                                        <h3>No Friends Yet</h3>
                                        <p>Add friends to start challenging them!</p>
                                        <button onClick={() => setFriendsTab('search')} className="btn-primary">
                                            Add Friends
                                        </button>
                                    </div>
                                ) : (
                                    <div className="friends-grid">
                                        {friends.map(friend => (
                                            <div key={friend.id} className="friend-card">
                                                <div className="friend-header">
                                                    <div className="friend-avatar">{friend.friendName[0]}</div>
                                                    <div className="friend-info">
                                                        <h4>{friend.friendName}</h4>
                                                        <p className="friend-stats">
                                                            {friend.challengesSent + friend.challengesReceived} challenges •
                                                            {friend.challengesWon} wins
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="friend-actions">
                                                    <select
                                                        value={challengeType}
                                                        onChange={(e) => setChallengeType(e.target.value)}
                                                        className="challenge-type-select"
                                                    >
                                                        {challengeTypes.filter(t => t.active).map(type => (
                                                            <option key={type.id} value={type.id}>
                                                                {type.icon} {type.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => sendChallengeInvitation(friend.friendId, friend.friendName)}
                                                        className="btn-challenge"
                                                    >
                                                        🎯 Challenge
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pending Requests Tab */}
                        {friendsTab === 'requests' && (
                            <div className="requests-list">
                                {pendingRequests.length === 0 ? (
                                    <div className="empty-state">
                                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📬</div>
                                        <h3>No Pending Requests</h3>
                                        <p>You don't have any friend requests at the moment.</p>
                                    </div>
                                ) : (
                                    <div className="requests-grid">
                                        {pendingRequests.map(request => (
                                            <div key={request.id} className="request-card">
                                                <div className="request-header">
                                                    <div className="friend-avatar">{request.userName[0]}</div>
                                                    <div className="request-info">
                                                        <h4>{request.userName}</h4>
                                                        <p className="request-date">
                                                            {new Date(request.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="request-actions">
                                                    <button
                                                        onClick={() => acceptFriendRequest(request.id)}
                                                        className="btn-accept"
                                                    >
                                                        ✓ Accept
                                                    </button>
                                                    <button
                                                        onClick={() => declineFriendRequest(request.id)}
                                                        className="btn-decline"
                                                    >
                                                        ✗ Decline
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Challenge Invitations Tab */}
                        {friendsTab === 'invitations' && (
                            <div className="invitations-list">
                                {pendingInvitations.length === 0 ? (
                                    <div className="empty-state">
                                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎯</div>
                                        <h3>No Challenge Invitations</h3>
                                        <p>You don't have any pending challenge invitations.</p>
                                    </div>
                                ) : (
                                    <div className="invitations-grid">
                                        {pendingInvitations.map(invitation => (
                                            <div key={invitation.id} className="invitation-card">
                                                <div className="invitation-header">
                                                    <div className="challenge-icon">🎮</div>
                                                    <div className="invitation-info">
                                                        <h4>{invitation.invitedByUserName} challenges you!</h4>
                                                        <p className="invitation-message">{invitation.message}</p>
                                                        <p className="invitation-time">
                                                            Expires: {new Date(invitation.expiresAt).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="invitation-actions">
                                                    <button
                                                        onClick={() => acceptChallengeInvitation(invitation)}
                                                        className="btn-accept"
                                                    >
                                                        🎯 Accept Challenge
                                                    </button>
                                                    <button
                                                        onClick={() => declineChallengeInvitation(invitation.id)}
                                                        className="btn-decline"
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Add Friends Tab */}
                        {friendsTab === 'search' && (
                            <div className="add-friends-view">
                                <div className="search-container">
                                    <h3>Add Friends by Email</h3>
                                    <p>Enter your friend's email address to send them a friend request</p>
                                    <div className="search-input-wrapper">
                                        <input
                                            type="email"
                                            placeholder="friend@example.com"
                                            value={friendSearchQuery}
                                            onChange={(e) => setFriendSearchQuery(e.target.value)}
                                            className="friend-search-input"
                                        />
                                        <button
                                            onClick={() => sendFriendRequest(friendSearchQuery)}
                                            disabled={!friendSearchQuery || !friendSearchQuery.includes('@')}
                                            className="btn-send-request"
                                        >
                                            Send Request
                                        </button>
                                    </div>
                                </div>

                                <div className="add-friends-tips">
                                    <h4>💡 Tips</h4>
                                    <ul>
                                        <li>Make sure your friend has an account first</li>
                                        <li>Double-check the email address</li>
                                        <li>Your friend will receive a notification</li>
                                        <li>Once accepted, you can challenge them anytime!</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tournaments View */}
            {!loading && activeView === 'tournaments' && (
                <div className="tournaments-view">
                    <button onClick={() => setActiveView('lobby')} className="back-btn">
                        ← Back to Lobby
                    </button>

                    <h2>🏅 Tournaments & Competitions</h2>
                    <p>Join weekly tournaments and school competitions!</p>

                    <div className="tournaments-tabs">
                        <button
                            className={`tab-btn ${tournamentsTab === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setTournamentsTab('upcoming')}
                        >
                            Upcoming ({upcomingTournaments.length})
                        </button>
                        <button
                            className={`tab-btn ${tournamentsTab === 'active' ? 'active' : ''}`}
                            onClick={() => setTournamentsTab('active')}
                        >
                            Active {activeTournaments.length > 0 && <span className="badge">{activeTournaments.length}</span>}
                        </button>
                    </div>

                    <div className="tournaments-content">
                        {/* Upcoming Tournaments Tab */}
                        {tournamentsTab === 'upcoming' && (
                            <div className="tournaments-list">
                                {upcomingTournaments.length === 0 ? (
                                    <div className="empty-state">
                                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🏅</div>
                                        <h3>No Upcoming Tournaments</h3>
                                        <p>Check back soon for new tournament announcements!</p>
                                    </div>
                                ) : (
                                    <div className="tournaments-grid">
                                        {upcomingTournaments.map(tournament => {
                                            const colors = getTournamentColor(tournament.type);
                                            return (
                                                <div
                                                    key={tournament.id}
                                                    className="tournament-card"
                                                    style={{ background: colors.bg, borderColor: colors.border }}
                                                >
                                                    <div className="tournament-header">
                                                        <div className="tournament-icon">{getTournamentIcon(tournament.type)}</div>
                                                        <div className="tournament-badge">{tournament.status}</div>
                                                    </div>

                                                    <h3 className="tournament-name">{tournament.name}</h3>
                                                    <p className="tournament-description">{tournament.description}</p>

                                                    <div className="tournament-details">
                                                        <div className="detail-row">
                                                            <span className="detail-label">Starts In:</span>
                                                            <span className="detail-value highlight">{formatTimeUntil(tournament.startTime)}</span>
                                                        </div>
                                                        <div className="detail-row">
                                                            <span className="detail-label">Duration:</span>
                                                            <span className="detail-value">
                                                                {Math.ceil((new Date(tournament.endTime) - new Date(tournament.startTime)) / (1000 * 60 * 60 * 24))} days
                                                            </span>
                                                        </div>
                                                        <div className="detail-row">
                                                            <span className="detail-label">Participants:</span>
                                                            <span className="detail-value">
                                                                {tournament.currentParticipants} / {tournament.maxParticipants}
                                                            </span>
                                                        </div>
                                                        <div className="detail-row">
                                                            <span className="detail-label">Prize:</span>
                                                            <span className="detail-value prize">{tournament.prizeDescription}</span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => registerForTournament(tournament.id, tournament.name)}
                                                        className="btn-register"
                                                        disabled={tournament.currentParticipants >= tournament.maxParticipants}
                                                    >
                                                        {tournament.currentParticipants >= tournament.maxParticipants ? 'Full' : '🎯 Register Now'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Active Tournaments Tab */}
                        {tournamentsTab === 'active' && (
                            <div className="tournaments-list">
                                {activeTournaments.length === 0 ? (
                                    <div className="empty-state">
                                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚡</div>
                                        <h3>No Active Tournaments</h3>
                                        <p>Register for upcoming tournaments to join when they start!</p>
                                    </div>
                                ) : (
                                    <div className="tournaments-grid">
                                        {activeTournaments.map(tournament => {
                                            const colors = getTournamentColor(tournament.type);
                                            return (
                                                <div
                                                    key={tournament.id}
                                                    className="tournament-card active-tournament"
                                                    style={{ background: colors.bg, borderColor: colors.border }}
                                                >
                                                    <div className="tournament-header">
                                                        <div className="tournament-icon pulsing">{getTournamentIcon(tournament.type)}</div>
                                                        <div className="tournament-badge active">LIVE</div>
                                                    </div>

                                                    <h3 className="tournament-name">{tournament.name}</h3>
                                                    <p className="tournament-description">{tournament.description}</p>

                                                    <div className="tournament-details">
                                                        <div className="detail-row">
                                                            <span className="detail-label">Time Left:</span>
                                                            <span className="detail-value highlight">{formatTimeUntil(tournament.endTime)}</span>
                                                        </div>
                                                        <div className="detail-row">
                                                            <span className="detail-label">Participants:</span>
                                                            <span className="detail-value">
                                                                {tournament.currentParticipants} competing
                                                            </span>
                                                        </div>
                                                        <div className="detail-row">
                                                            <span className="detail-label">Your Rank:</span>
                                                            <span className="detail-value">-</span>
                                                        </div>
                                                        <div className="detail-row">
                                                            <span className="detail-label">Prize:</span>
                                                            <span className="detail-value prize">{tournament.prizeDescription}</span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => alert('Tournament challenge coming soon!')}
                                                        className="btn-compete"
                                                    >
                                                        🔥 Compete Now
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}