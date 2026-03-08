import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CONFIG from '../../Config';
import './FlashTestHub.css';

export default function FlashTestHub() {
    const [liveTests, setLiveTests] = useState([]);
    const [upcomingTests, setUpcomingTests] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const token = localStorage.getItem('token');
            const [liveRes, upcomingRes] = await Promise.all([
                axios.get(`${CONFIG.development.GATEWAY_URL}/v1/flash-tests/live`,
                    { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${CONFIG.development.GATEWAY_URL}/v1/flash-tests/upcoming`,
                    { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setLiveTests(liveRes.data);
            setUpcomingTests(upcomingRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching flash tests:', error);
            setLoading(false);
        }
    };

    const handleTestClick = (test) => {
        if (test.hasSubmitted) {
            // Navigate to leaderboard
            window.location.href = `/flash-test/${test.id}/leaderboard`;
        } else {
            // Navigate to test page
            window.location.href = `/flash-test/${test.id}`;
        }
    };

    if (loading) {
        return <div className="flash-test-loading">⚡ Loading Flash Tests...</div>;
    }

    return (
        <div className="flash-test-hub">
            <div className="flash-test-header">
                <h1>⚡ Flash Test Challenges</h1>
                <p>Compete, Win Rewards, Earn Certificates!</p>
            </div>

            {liveTests.length > 0 && (
                <section className="test-section live-section">
                    <h2>🔴 LIVE NOW</h2>
                    <div className="tests-grid">
                        {liveTests.map(test => (
                            <div
                                key={test.id}
                                className={`test-card live ${test.hasSubmitted ? 'submitted' : ''}`}
                                onClick={() => handleTestClick(test)}
                            >
                                <div className="test-badge live-badge">🔴 LIVE</div>
                                {test.hasSubmitted && <div className="submitted-badge">✅ Submitted</div>}

                                <div className="test-emoji">{test.testEmoji}</div>
                                <h3 className="test-name">{test.testName}</h3>
                                <p className="test-description">{test.description}</p>

                                <div className="test-meta">
                                    <span className="meta-item">📚 {test.subject}</span>
                                    <span className="meta-item">⏱️ {test.timeLimitMinutes} min</span>
                                    <span className="meta-item">❓ {test.questionCount} questions</span>
                                </div>

                                <div className="test-difficulty">
                                    {test.difficultyLevel === 'EASY' && '🟢 Easy'}
                                    {test.difficultyLevel === 'MEDIUM' && '🟡 Medium'}
                                    {test.difficultyLevel === 'HARD' && '🔴 Hard'}
                                    {test.difficultyLevel === 'EXPERT' && '🔥 Expert'}
                                </div>

                                <div className="test-timer">
                                    ⏳ Ends in: {test.timeRemaining}
                                </div>

                                <div className="test-rewards">
                                    <div className="reward-item">🏆 Top {test.topWinnersCount} Winners</div>
                                    <div className="reward-item">{test.badgeEmoji} {test.badgeName}</div>
                                </div>

                                <div className="test-participants">
                                    👥 {test.totalParticipants} participants
                                </div>

                                {test.hasSubmitted ? (
                                    <div className="test-result">
                                        <div>Your Score: {test.userScore}</div>
                                        <div>Your Rank: #{test.userRank}</div>
                                    </div>
                                ) : (
                                    <button className="take-test-btn">⚡ Take Test Now</button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {upcomingTests.length > 0 && (
                <section className="test-section upcoming-section">
                    <h2>📅 Coming Soon</h2>
                    <div className="tests-grid">
                        {upcomingTests.map(test => (
                            <div key={test.id} className="test-card upcoming">
                                <div className="test-badge upcoming-badge">📅 UPCOMING</div>

                                <div className="test-emoji">{test.testEmoji}</div>
                                <h3 className="test-name">{test.testName}</h3>
                                <p className="test-description">{test.description}</p>

                                <div className="test-meta">
                                    <span className="meta-item">📚 {test.subject}</span>
                                    <span className="meta-item">⏱️ {test.timeLimitMinutes} min</span>
                                    <span className="meta-item">❓ {test.questionCount} questions</span>
                                </div>

                                <div className="test-start-time">
                                    Starts: {new Date(test.startTime).toLocaleString()}
                                </div>

                                <div className="test-rewards">
                                    <div className="reward-item">🏆 Top {test.topWinnersCount} Winners</div>
                                    <div className="reward-item">{test.badgeEmoji} {test.badgeName}</div>
                                </div>

                                <button className="notify-btn">🔔 Notify Me</button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {liveTests.length === 0 && upcomingTests.length === 0 && (
                <div className="no-tests">
                    <span className="no-tests-icon">📭</span>
                    <h3>No Flash Tests Available</h3>
                    <p>Check back soon for exciting challenges!</p>
                </div>
            )}
        </div>
    );
}
