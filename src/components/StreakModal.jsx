import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CONFIG from '../Config';
import './StreakModal.css';

export default function StreakModal({ isOpen, onClose }) {
    const [streak, setStreak] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [shareSuccess, setShareSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchStreakData();
        }
    }, [isOpen]);

    const fetchStreakData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const [streakRes, leaderboardRes] = await Promise.all([
                axios.get(`${CONFIG.development.GATEWAY_URL}/v1/streaks/me`,
                    { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${CONFIG.development.GATEWAY_URL}/v1/streaks/leaderboard?limit=50`,
                    { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setStreak(streakRes.data);
            setLeaderboard(leaderboardRes.data);
        } catch (error) {
            console.error('Error fetching streak data:', error);
        }
    };

    const handleShare = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${CONFIG.development.GATEWAY_URL}/v1/streaks/share`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Generate shareable text
            const shareText = `🔥 I've maintained a ${streak.currentStreak} day learning streak on KiVO Learning! ${streak.badges.filter(b => b.achieved).map(b => b.emoji).join('')}\n\nCan you beat my streak? Join me! #LearningStreak #KiVOLearning`;

            if (navigator.share) {
                await navigator.share({
                    title: 'My Learning Streak',
                    text: shareText
                });
            } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(shareText);
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 3000);
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const downloadStreakImage = () => {
        // TODO: Generate image with canvas and download
        alert('Screenshot feature coming soon! For now, share using the Share button.');
    };

    if (!isOpen || !streak) return null;

    return (
        <>
            <div className="streak-modal-backdrop" onClick={onClose} />
            <div className="streak-modal">
                <div className="streak-modal-header">
                    <h2>🔥 Your Learning Streak</h2>
                    <button className="streak-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="streak-tabs">
                    <button
                        className={`streak-tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`streak-tab ${activeTab === 'badges' ? 'active' : ''}`}
                        onClick={() => setActiveTab('badges')}
                    >
                        Badges
                    </button>
                    <button
                        className={`streak-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('leaderboard')}
                    >
                        Leaderboard
                    </button>
                </div>

                <div className="streak-modal-content">
                    {activeTab === 'overview' && (
                        <div className="streak-overview">
                            <div className="streak-hero">
                                <div className="streak-main-stat">
                                    <div className="streak-flame-big">
                                        {streak.currentStreak >= 100 ? '👑' :
                                         streak.currentStreak >= 30 ? '🏆' : '🔥'}
                                    </div>
                                    <div className="streak-count-big">{streak.currentStreak}</div>
                                    <div className="streak-label-big">DAY STREAK</div>
                                </div>
                                <p className="streak-message">{streak.streakMessage}</p>
                                <p className="motivation-message">{streak.motivationMessage}</p>
                            </div>

                            <div className="streak-stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon">🏅</div>
                                    <div className="stat-value">{streak.longestStreak}</div>
                                    <div className="stat-label">Longest Streak</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">📅</div>
                                    <div className="stat-value">{streak.totalDaysActive}</div>
                                    <div className="stat-label">Total Days</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">🏆</div>
                                    <div className="stat-value">#{streak.rank}</div>
                                    <div className="stat-label">Global Rank</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">❄️</div>
                                    <div className="stat-value">{streak.freezeCount - streak.freezeUsed}</div>
                                    <div className="stat-label">Streak Freezes</div>
                                </div>
                            </div>

                            {streak.nextMilestone && (
                                <div className="next-milestone">
                                    <h3>Next Milestone</h3>
                                    <div className="milestone-card">
                                        <span className="milestone-emoji">{streak.nextMilestone.emoji}</span>
                                        <div className="milestone-info">
                                            <div className="milestone-name">{streak.nextMilestone.name}</div>
                                            <div className="milestone-progress">
                                                {streak.nextMilestone.days - streak.currentStreak} days to go!
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="streak-actions">
                                <button className="btn-share" onClick={handleShare}>
                                    📤 Share Streak
                                </button>
                                <button className="btn-screenshot" onClick={downloadStreakImage}>
                                    📸 Download Image
                                </button>
                            </div>

                            {shareSuccess && (
                                <div className="share-success">
                                    ✅ Copied to clipboard! Paste to share your streak!
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'badges' && (
                        <div className="streak-badges">
                            <h3>Milestone Badges</h3>
                            <div className="badges-grid">
                                {streak.badges.map(badge => (
                                    <div
                                        key={badge.days}
                                        className={`badge-card ${badge.achieved ? 'achieved' : 'locked'}`}
                                    >
                                        <div className="badge-emoji">{badge.emoji}</div>
                                        <div className="badge-name">{badge.name}</div>
                                        <div className="badge-days">{badge.days} days</div>
                                        {badge.achieved && badge.achievedAt && (
                                            <div className="badge-date">
                                                Earned {new Date(badge.achievedAt).toLocaleDateString()}
                                            </div>
                                        )}
                                        {!badge.achieved && (
                                            <div className="badge-locked">🔒 Locked</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'leaderboard' && (
                        <div className="streak-leaderboard">
                            <h3>Top Streaks 🏆</h3>
                            <div className="leaderboard-list">
                                {leaderboard.map(entry => (
                                    <div
                                        key={entry.rank}
                                        className={`leaderboard-entry ${entry.isCurrentUser ? 'current-user' : ''} ${entry.isLegendary ? 'legendary' : ''}`}
                                    >
                                        <div className="entry-rank">
                                            {entry.rank <= 3 ? (
                                                <span className={`medal rank-${entry.rank}`}>
                                                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                                                </span>
                                            ) : (
                                                `#${entry.rank}`
                                            )}
                                        </div>
                                        <div className="entry-info">
                                            <div className="entry-username">
                                                {entry.username}
                                                {entry.isLegendary && <span className="legendary-badge">👑</span>}
                                                {entry.isCurrentUser && <span className="you-badge">You</span>}
                                            </div>
                                            <div className="entry-stats">
                                                {entry.currentStreak} days • Best: {entry.longestStreak}
                                            </div>
                                        </div>
                                        <div className="entry-badge">{entry.badge}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
