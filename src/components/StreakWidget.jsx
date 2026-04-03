import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CONFIG from '../Config';
import './StreakWidget.css';

function StreakWidget({ onStreakClick }) {
    const [streak, setStreak] = useState(null);
    const [showAnimation] = useState(false);

    useEffect(() => {
        fetchStreak();
        // Fetch every minute to check if user needs to maintain streak
        const interval = setInterval(fetchStreak, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchStreak = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get(
                `${CONFIG.development.GATEWAY_URL}/v1/streaks/me`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStreak(response.data);
        } catch (error) {
            console.error('Error fetching streak:', error);
        }
    };

    if (!streak) return null;

    const getStreakColor = () => {
        if (streak.currentStreak >= 100) return '#9333ea'; // Purple for legendary
        if (streak.currentStreak >= 30) return '#ea580c'; // Orange for 30+
        if (streak.currentStreak >= 7) return '#dc2626'; // Red for 7+
        return '#f59e0b'; // Yellow for < 7
    };

    const getStreakEmoji = () => {
        if (streak.currentStreak >= 100) return '👑';
        if (streak.currentStreak >= 50) return '💎';
        if (streak.currentStreak >= 30) return '🏆';
        if (streak.currentStreak >= 7) return '🔥🔥';
        return '🔥';
    };

    return (
        <div
            className={`streak-widget ${streak.streakAtRisk ? 'at-risk' : ''} ${streak.isOnFire ? 'on-fire' : ''}`}
            onClick={onStreakClick}
            style={{ '--streak-color': getStreakColor() }}
        >
            <div className="streak-flame">
                {getStreakEmoji()}
            </div>
            <div className="streak-info">
                <div className="streak-number">{streak.currentStreak}</div>
                <div className="streak-label">day streak</div>
            </div>
            {streak.streakAtRisk && (
                <div className="streak-alert">⚠️</div>
            )}
            {showAnimation && (
                <div className="streak-spark">✨</div>
            )}
        </div>
    );
}

export default React.memo(StreakWidget);
