import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import CONFIG from '../../Config';
import './LeaderboardView.css';

export default function LeaderboardView() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const currentUserId = user ? (user.id || user.email || 'GUEST_USER') : 'GUEST_USER';
    const [activeTab, setActiveTab] = useState('daily'); // daily, weekly, allTime
    const [gradeLevel, setGradeLevel] = useState('GRADE_5');
    const [leaderboard, setLeaderboard] = useState(null);
    const [userRankings, setUserRankings] = useState(null);
    const [allBadges, setAllBadges] = useState([]);
    const [loading, setLoading] = useState(false);

    const grades = ['GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6', 'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10'];

    const skillLevelColors = {
        'BRONZE': '#cd7f32',
        'SILVER': '#c0c0c0',
        'GOLD': '#ffd700',
        'PLATINUM': '#e5e4e2',
        'DIAMOND': '#b9f2ff'
    };

    useEffect(() => {
        fetchLeaderboard();
        fetchUserRankings();
        fetchBadges();
    }, [activeTab, gradeLevel]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let endpoint = '';

            if (activeTab === 'daily') {
                endpoint = `/v1/leaderboard/daily?gradeLevel=${gradeLevel}`;
            } else if (activeTab === 'weekly') {
                endpoint = `/v1/leaderboard/weekly?gradeLevel=${gradeLevel}`;
            } else {
                endpoint = `/v1/leaderboard/all-time?gradeLevel=${gradeLevel}`;
            }

            const res = await axios.get(`${CONFIG.development.GATEWAY_URL}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setLeaderboard(res.data);
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRankings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(
                `${CONFIG.development.GATEWAY_URL}/v1/leaderboard/user/${currentUserId}?gradeLevel=${gradeLevel}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.found) {
                setUserRankings(res.data);
            }
        } catch (err) {
            console.error('Error fetching user rankings:', err);
        }
    };

    const fetchBadges = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(
                `${CONFIG.development.GATEWAY_URL}/v1/leaderboard/badges`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAllBadges(res.data || []);
        } catch (err) {
            console.error('Error fetching badges:', err);
        }
    };

    const getRankColor = (rank) => {
        if (rank === 1) return '#ffd700'; // Gold
        if (rank === 2) return '#c0c0c0'; // Silver
        if (rank === 3) return '#cd7f32'; // Bronze
        return '#64748b';
    };

    const getRankMedal = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    return (
        <div className="leaderboard-container">
            <button onClick={() => navigate('/assessments/challenge-arena')} className="back-btn-leaderboard">
                <span>←</span> Back to Arena
            </button>

            <div className="leaderboard-header">
                <h1>🏆 Challenge Leaderboard</h1>
                <p>Compete and climb the ranks!</p>
            </div>

            {/* User Stats Card */}
            {userRankings && (
                <div className="user-stats-card">
                    <div className="user-stats-header">
                        <div className="user-info">
                            <h3>{userRankings.userName}</h3>
                            <div className="skill-badge" style={{ background: skillLevelColors[userRankings.skillLevel] }}>
                                {userRankings.skillLevel} ({userRankings.skillPoints} pts)
                            </div>
                        </div>
                        <div className="user-streak">
                            <span className="streak-icon">🔥</span>
                            <span className="streak-value">{userRankings.currentStreak}</span>
                            <span className="streak-label">Day Streak</span>
                        </div>
                    </div>

                    <div className="user-stats-grid">
                        <div className="stat-item">
                            <div className="stat-label">Daily Rank</div>
                            <div className="stat-value" style={{ color: getRankColor(userRankings.dailyRank) }}>
                                {getRankMedal(userRankings.dailyRank)}
                            </div>
                            <div className="stat-sublabel">{userRankings.dailyScore} pts today</div>
                        </div>

                        <div className="stat-item">
                            <div className="stat-label">Weekly Rank</div>
                            <div className="stat-value" style={{ color: getRankColor(userRankings.weeklyRank) }}>
                                {getRankMedal(userRankings.weeklyRank)}
                            </div>
                            <div className="stat-sublabel">{userRankings.weeklyScore} pts this week</div>
                        </div>

                        <div className="stat-item">
                            <div className="stat-label">All-Time Rank</div>
                            <div className="stat-value" style={{ color: getRankColor(userRankings.allTimeRank) }}>
                                {getRankMedal(userRankings.allTimeRank)}
                            </div>
                            <div className="stat-sublabel">{userRankings.totalScore} pts total</div>
                        </div>

                        <div className="stat-item">
                            <div className="stat-label">Win Rate</div>
                            <div className="stat-value">
                                {userRankings.totalChallenges > 0
                                    ? Math.round((userRankings.totalWins / userRankings.totalChallenges) * 100)
                                    : 0}%
                            </div>
                            <div className="stat-sublabel">{userRankings.totalWins} / {userRankings.totalChallenges}</div>
                        </div>

                        <div className="stat-item">
                            <div className="stat-label">Accuracy</div>
                            <div className="stat-value">{Math.round(userRankings.averageAccuracy)}%</div>
                            <div className="stat-sublabel">Average</div>
                        </div>

                        <div className="stat-item">
                            <div className="stat-label">Badges</div>
                            <div className="stat-value">{userRankings.totalBadges}</div>
                            <div className="stat-sublabel">Collected</div>
                        </div>
                    </div>

                    {/* User Badges */}
                    {userRankings.badges && userRankings.badges.length > 0 && (
                        <div className="user-badges-section">
                            <h4>🎖️ Your Badges</h4>
                            <div className="badges-grid">
                                {userRankings.badges.map(badgeId => {
                                    const badge = allBadges.find(b => b.id === badgeId);
                                    return badge ? (
                                        <div key={badgeId} className="badge-item" title={badge.description}>
                                            <span className="badge-icon">{badge.icon}</span>
                                            <span className="badge-name">{badge.name}</span>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Filters */}
            <div className="leaderboard-filters">
                <div className="filter-section">
                    <label>Time Period</label>
                    <div className="tab-buttons">
                        {['daily', 'weekly', 'allTime'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            >
                                {tab === 'daily' && '📅 Today'}
                                {tab === 'weekly' && '📆 This Week'}
                                {tab === 'allTime' && '🏆 All Time'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="filter-section">
                    <label>Grade Level</label>
                    <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="grade-select-leaderboard">
                        {grades.map(grade => (
                            <option key={grade} value={grade}>
                                {grade.replace('GRADE_', 'Grade ')}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Leaderboard Table */}
            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading leaderboard...</p>
                </div>
            ) : leaderboard && leaderboard.entries.length > 0 ? (
                <div className="leaderboard-table">
                    <div className="leaderboard-list">
                        {leaderboard.entries.map((entry, idx) => (
                            <div
                                key={entry.userId}
                                className={`leaderboard-row ${entry.userId === currentUserId ? 'current-user' : ''} rank-${Math.min(entry.rank, 3)}`}
                            >
                                <div className="rank-badge-large" style={{ background: getRankColor(entry.rank) }}>
                                    {getRankMedal(entry.rank)}
                                </div>

                                <div className="user-details">
                                    <div className="user-name-row">
                                        <span className="user-name">{entry.userName}</span>
                                        {entry.userId === currentUserId && <span className="you-badge">YOU</span>}
                                    </div>
                                    <div className="user-meta">
                                        <span className="skill-badge-small" style={{ background: skillLevelColors[entry.skillLevel] }}>
                                            {entry.skillLevel}
                                        </span>
                                        <span className="challenges-count">{entry.challengesCompleted} challenges</span>
                                        <span className="accuracy-badge">{Math.round(entry.averageAccuracy)}% acc</span>
                                    </div>
                                </div>

                                <div className="score-display">
                                    <div className="score-value">{entry.score}</div>
                                    <div className="score-label">points</div>
                                </div>

                                {entry.badges && entry.badges.length > 0 && (
                                    <div className="row-badges">
                                        {entry.badges.slice(0, 3).map(badgeId => {
                                            const badge = allBadges.find(b => b.id === badgeId);
                                            return badge ? (
                                                <span key={badgeId} className="badge-icon-small" title={badge.name}>
                                                    {badge.icon}
                                                </span>
                                            ) : null;
                                        })}
                                        {entry.badges.length > 3 && (
                                            <span className="more-badges">+{entry.badges.length - 3}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="no-data">
                    <p>No rankings yet for this time period.</p>
                    <p>Complete challenges to appear on the leaderboard!</p>
                </div>
            )}

            {/* All Badges Collection */}
            <div className="all-badges-section">
                <h2>🎖️ All Badges</h2>
                <p>Earn badges by completing challenges and achieving milestones!</p>

                {['SPEED', 'ACCURACY', 'CONSISTENCY', 'ACHIEVEMENT'].map(category => {
                    const categoryBadges = allBadges.filter(b => b.category === category);
                    if (categoryBadges.length === 0) return null;

                    return (
                        <div key={category} className="badge-category-section">
                            <h3>{category.charAt(0) + category.slice(1).toLowerCase()} Badges</h3>
                            <div className="all-badges-grid">
                                {categoryBadges.map(badge => {
                                    const isEarned = userRankings?.badges?.includes(badge.id);
                                    return (
                                        <div key={badge.id} className={`badge-card ${isEarned ? 'earned' : 'locked'}`}>
                                            <div className="badge-icon-large">{badge.icon}</div>
                                            <div className="badge-info">
                                                <div className="badge-name-large">{badge.name}</div>
                                                <div className="badge-description">{badge.description}</div>
                                                <div className={`badge-rarity rarity-${badge.rarity.toLowerCase()}`}>
                                                    {badge.rarity}
                                                </div>
                                            </div>
                                            {isEarned && <div className="earned-check">✓</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
