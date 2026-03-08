import axios from 'axios';
import CONFIG from '../Config';

let activityRecordedToday = false;

/**
 * Records user activity for streak tracking
 * Call this when user completes any learning activity
 */
export const recordStreakActivity = async () => {
    // Only record once per day
    if (activityRecordedToday) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.post(
            `${CONFIG.development.GATEWAY_URL}/v1/streaks/record`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );

        activityRecordedToday = true;
        console.log('✅ Streak activity recorded:', response.data);

        // Show celebration if milestone achieved
        const streak = response.data;
        if (streak.badges) {
            const latestBadge = streak.badges.find(b =>
                b.achieved &&
                b.achievedAt &&
                new Date(b.achievedAt).toDateString() === new Date().toDateString()
            );

            if (latestBadge) {
                showMilestoneNotification(latestBadge, streak.currentStreak);
            }
        }

        return response.data;
    } catch (error) {
        console.error('Error recording streak activity:', error);
    }
};

/**
 * Show celebration notification when milestone achieved
 */
const showMilestoneNotification = (badge, streak) => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'streak-milestone-notification';
    notification.innerHTML = `
        <div class="milestone-content">
            <div class="milestone-emoji">${badge.emoji}</div>
            <div class="milestone-text">
                <div class="milestone-title">🎉 Milestone Achieved!</div>
                <div class="milestone-name">${badge.name}</div>
                <div class="milestone-streak">${streak} Day Streak!</div>
            </div>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .streak-milestone-notification {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            z-index: 20000;
            background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
            padding: 40px;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            animation: milestonePopup 4s forwards;
        }

        @keyframes milestonePopup {
            0% {
                transform: translate(-50%, -50%) scale(0);
                opacity: 0;
            }
            10% {
                transform: translate(-50%, -50%) scale(1.2);
                opacity: 1;
            }
            15% {
                transform: translate(-50%, -50%) scale(1);
            }
            85% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) scale(0);
                opacity: 0;
            }
        }

        .milestone-content {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .milestone-emoji {
            font-size: 5rem;
            animation: spin 2s linear infinite;
        }

        @keyframes spin {
            0%, 100% {
                transform: rotate(0deg) scale(1);
            }
            25% {
                transform: rotate(-10deg) scale(1.1);
            }
            75% {
                transform: rotate(10deg) scale(1.1);
            }
        }

        .milestone-text {
            text-align: left;
        }

        .milestone-title {
            font-size: 1.5rem;
            font-weight: 900;
            color: #92400e;
            margin-bottom: 5px;
        }

        .milestone-name {
            font-size: 2rem;
            font-weight: 900;
            color: #ea580c;
            margin-bottom: 5px;
        }

        .milestone-streak {
            font-size: 1.2rem;
            color: #64748b;
            font-weight: 700;
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(notification);

    // Remove after animation
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 4000);
};

/**
 * Reset the daily activity flag (for testing)
 */
export const resetDailyActivity = () => {
    activityRecordedToday = false;
};
