import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CONFIG from '../../Config';
import './WorldMap.css';

export default function WorldMap({ subject = 'MATH', gradeLevel = 'ALL' }) {
    const [worldMap, setWorldMap] = useState(null);
    const [selectedWorld, setSelectedWorld] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorldMap();
    }, [subject, gradeLevel]);

    const fetchWorldMap = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${CONFIG.development.GATEWAY_URL}/v1/game-learning/world-map?subject=${subject}&gradeLevel=${gradeLevel}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setWorldMap(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching world map:', error);
            setLoading(false);
        }
    };

    const handleWorldClick = (world) => {
        if (!world.isLocked) {
            setSelectedWorld(world);
        }
    };

    const handleLevelClick = async (level) => {
        if (level.isLocked) {
            alert(`🔒 Unlock this level by earning ${level.starsToUnlock} stars!`);
            return;
        }

        // TODO: Navigate to actual level/assessment page
        console.log('Starting level:', level);
        alert(`Starting: ${level.levelName}\nDifficulty: ${level.difficulty}\nType: ${level.levelType}`);
    };

    if (loading) {
        return <div className="world-map-loading">🌍 Loading Adventure...</div>;
    }

    if (!worldMap) {
        return <div className="world-map-error">Failed to load world map</div>;
    }

    return (
        <div className="world-map-container">
            {/* Player Stats Header */}
            <div className="player-stats-header">
                <div className="stat-item">
                    <span className="stat-icon">⭐</span>
                    <span className="stat-value">{worldMap.userRewards.totalStars}</span>
                    <span className="stat-label">Stars</span>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">🪙</span>
                    <span className="stat-value">{worldMap.userRewards.totalCoins}</span>
                    <span className="stat-label">Coins</span>
                </div>
                <div className="stat-item level-badge">
                    <span className="stat-icon">🎯</span>
                    <span className="stat-value">Level {worldMap.userRewards.level}</span>
                    <div className="xp-bar">
                        <div
                            className="xp-fill"
                            style={{
                                width: `${((1000 - worldMap.userRewards.xpToNextLevel) / 1000) * 100}%`
                            }}
                        />
                    </div>
                    <span className="stat-label">{worldMap.userRewards.xpToNextLevel} XP to next level</span>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">👑</span>
                    <span className="stat-value">{worldMap.userRewards.bossDefeats}</span>
                    <span className="stat-label">Bosses Defeated</span>
                </div>
            </div>

            {/* World Map Path */}
            <div className="worlds-path">
                {worldMap.worlds.map((world, index) => (
                    <div key={world.worldId} className="world-node-wrapper">
                        {index > 0 && (
                            <div className={`world-connector ${world.isLocked ? 'locked' : 'unlocked'}`}>
                                <div className="connector-line" />
                            </div>
                        )}

                        <div
                            className={`world-node ${world.isLocked ? 'locked' : 'unlocked'} ${selectedWorld?.worldId === world.worldId ? 'selected' : ''}`}
                            onClick={() => handleWorldClick(world)}
                        >
                            <div className="world-emoji">{world.worldEmoji}</div>
                            <div className="world-info">
                                <h3 className="world-name">{world.worldName}</h3>
                                <p className="world-description">{world.worldDescription}</p>
                            </div>

                            {world.isLocked && (
                                <div className="world-lock">
                                    <span className="lock-icon">🔒</span>
                                    <span className="lock-text">Need {world.unlockRequirement} ⭐</span>
                                </div>
                            )}

                            {!world.isLocked && (
                                <div className="world-progress">
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${world.completionPercentage}%` }}
                                        />
                                    </div>
                                    <div className="progress-text">
                                        {world.levelsCompleted}/{world.totalLevels} levels • {world.starsEarned}/{world.maxStars} ⭐
                                    </div>
                                </div>
                            )}

                            {world.hasBoss && world.bossDefeated && (
                                <div className="boss-badge">👑 BOSS DEFEATED</div>
                            )}

                            {world.completionPercentage === 100 && world.rewardBadge && (
                                <div className="world-completed-badge">{world.rewardBadge}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Level Details Panel */}
            {selectedWorld && !selectedWorld.isLocked && (
                <div className="level-panel">
                    <div className="level-panel-header">
                        <h2>{selectedWorld.worldEmoji} {selectedWorld.worldName}</h2>
                        <button className="close-panel-btn" onClick={() => setSelectedWorld(null)}>✕</button>
                    </div>

                    <div className="levels-grid">
                        {selectedWorld.levels.map((level) => (
                            <div
                                key={level.levelId}
                                className={`level-card ${level.levelType.toLowerCase()} ${level.isLocked ? 'locked' : 'unlocked'} ${level.completed ? 'completed' : ''}`}
                                onClick={() => handleLevelClick(level)}
                            >
                                <div className="level-number">
                                    {level.levelType === 'BOSS' ? '👹' : level.levelNumber}
                                </div>

                                <div className="level-name">{level.levelName}</div>

                                <div className="level-difficulty">
                                    {level.difficulty === 'EASY' && '🟢'}
                                    {level.difficulty === 'MEDIUM' && '🟡'}
                                    {level.difficulty === 'HARD' && '🔴'}
                                    {' '}{level.difficulty}
                                </div>

                                {level.isLocked && (
                                    <div className="level-lock">
                                        🔒 {level.starsToUnlock} ⭐ needed
                                    </div>
                                )}

                                {!level.isLocked && (
                                    <>
                                        <div className="level-stars">
                                            {[...Array(3)].map((_, i) => (
                                                <span key={i} className={i < level.starsEarned ? 'star-filled' : 'star-empty'}>
                                                    {i < level.starsEarned ? '⭐' : '☆'}
                                                </span>
                                            ))}
                                        </div>

                                        {level.completed && (
                                            <div className="level-stats">
                                                <span>Best: {level.bestScore}</span>
                                                {level.attempts > 1 && <span>Attempts: {level.attempts}</span>}
                                            </div>
                                        )}

                                        <div className="level-rewards">
                                            🪙 {level.rewardCoins} • ✨ {level.rewardXp} XP
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
