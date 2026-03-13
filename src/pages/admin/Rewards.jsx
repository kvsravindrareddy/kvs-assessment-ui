import React from 'react';
import "../../css/LegalPages.css";

const Rewards = () => {
  const badges = [
    { name: 'First Steps', icon: '🎯', description: 'Complete your first lesson', rarity: 'Common', color: '#4caf50' },
    { name: 'Week Warrior', icon: '🔥', description: '7-day learning streak', rarity: 'Common', color: '#ff9800' },
    { name: 'Speed Demon', icon: '⚡', description: 'Complete 10 lessons in one day', rarity: 'Uncommon', color: '#2196f3' },
    { name: 'Perfect Score', icon: '💯', description: 'Get 100% on 5 assessments', rarity: 'Uncommon', color: '#9c27b0' },
    { name: 'Month Master', icon: '📅', description: '30-day learning streak', rarity: 'Rare', color: '#ff5722' },
    { name: 'Math Genius', icon: '🧮', description: 'Master all math topics', rarity: 'Rare', color: '#ffc107' },
    { name: 'Reading Champion', icon: '📚', description: 'Read 100 stories', rarity: 'Rare', color: '#795548' },
    { name: 'Game Master', icon: '🎮', description: 'Unlock all 12 games', rarity: 'Epic', color: '#e91e63' },
    { name: 'Legendary Learner', icon: '🏆', description: 'Reach Level 50', rarity: 'Legendary', color: '#ffd700' }
  ];

  const rewards = [
    { level: 5, reward: 'Unlock Custom Avatar', icon: '👤', color: '#4caf50' },
    { level: 10, reward: 'Unlock Premium Game', icon: '🎮', color: '#2196f3' },
    { level: 15, reward: 'Custom Profile Theme', icon: '🎨', color: '#9c27b0' },
    { level: 20, reward: 'Exclusive Badge Collection', icon: '🏅', color: '#ff9800' },
    { level: 25, reward: 'Priority Support Access', icon: '⭐', color: '#f44336' },
    { level: 30, reward: 'Unlock All AI Features', icon: '🤖', color: '#00bcd4' },
    { level: 40, reward: 'Custom Learning Path', icon: '🎯', color: '#3f51b5' },
    { level: 50, reward: 'Lifetime Premium Access', icon: '👑', color: '#ffd700' }
  ];

  const streakRewards = [
    { days: 7, reward: '50 bonus points', icon: '🔥' },
    { days: 14, reward: 'Unlock new game', icon: '🎮' },
    { days: 30, reward: 'Exclusive badge', icon: '🏆' },
    { days: 60, reward: 'Free month premium', icon: '⭐' },
    { days: 100, reward: 'Custom avatar + theme', icon: '👑' }
  ];

  return (
    <section id="rewards" className="section">
      <div className="container">
        <div className="content">
          <div className="text-section">

            <h1 className="section-heading">🎁 Rewards & Achievements</h1>

            <div className="privacy-intro">
              <p>
                Every lesson, every game, every achievement brings you closer to awesome rewards!
                Collect badges, unlock features, and become a KiVO legend! 🌟
              </p>
            </div>

            {/* Achievement Badges */}
            <div className="privacy-section">
              <h2>🏆 Achievement Badges</h2>
              <p style={{ marginBottom: '2rem' }}>
                Collect them all! Each badge shows off your learning journey.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem'
              }}>
                {badges.map((badge, index) => (
                  <div
                    key={index}
                    style={{
                      background: `linear-gradient(135deg, ${badge.color}22, ${badge.color}44)`,
                      padding: '2rem',
                      borderRadius: '15px',
                      border: `3px solid ${badge.color}`,
                      textAlign: 'center',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)';
                      e.currentTarget.style.boxShadow = `0 12px 30px ${badge.color}66`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Rarity badge */}
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      padding: '0.25rem 0.75rem',
                      background: badge.color,
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {badge.rarity}
                    </div>

                    <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>
                      {badge.icon}
                    </div>
                    <h3 style={{
                      color: badge.color,
                      fontSize: '1.3rem',
                      marginBottom: '0.75rem',
                      fontWeight: '700'
                    }}>
                      {badge.name}
                    </h3>
                    <p style={{ color: '#666', margin: 0, fontSize: '0.95rem' }}>
                      {badge.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Level Rewards */}
            <div className="privacy-section">
              <h2>🎯 Level Up Rewards</h2>
              <p style={{ marginBottom: '2rem' }}>
                Keep learning to unlock amazing rewards at each milestone!
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem'
              }}>
                {rewards.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'white',
                      padding: '2rem',
                      borderRadius: '12px',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                      border: `3px solid ${item.color}`,
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = `0 8px 25px ${item.color}66`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    {/* Level badge */}
                    <div style={{
                      position: 'absolute',
                      top: '-15px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60px',
                      height: '60px',
                      background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)`,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem',
                      fontWeight: 'bold',
                      color: 'white',
                      boxShadow: `0 4px 12px ${item.color}88`,
                      border: '4px solid white'
                    }}>
                      {item.level}
                    </div>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                        {item.icon}
                      </div>
                      <h3 style={{
                        color: '#2c3e50',
                        fontSize: '1.2rem',
                        marginBottom: '0.5rem',
                        fontWeight: '700'
                      }}>
                        {item.reward}
                      </h3>
                      <p style={{ color: '#999', fontSize: '0.9rem', margin: 0 }}>
                        Unlock at Level {item.level}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak Rewards */}
            <div className="privacy-section">
              <h2>🔥 Streak Rewards</h2>
              <p style={{ marginBottom: '2rem' }}>
                Learn every day to keep your streak alive and earn exclusive rewards!
              </p>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                {streakRewards.map((streak, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'linear-gradient(90deg, #fff9e6, white)',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '2px solid #ffc107',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(10px)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 193, 7, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      fontSize: '3rem',
                      flexShrink: 0
                    }}>
                      {streak.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '1.3rem',
                        fontWeight: 'bold',
                        color: '#2c3e50',
                        marginBottom: '0.5rem'
                      }}>
                        {streak.days} Day Streak
                      </div>
                      <div style={{ color: '#666', fontSize: '1rem' }}>
                        Reward: <strong style={{ color: '#ffc107' }}>{streak.reward}</strong>
                      </div>
                    </div>
                    <div style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #ffc107, #ff9800)',
                      color: 'white',
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      🔓 Unlock
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="privacy-section">
              <h2>❓ How to Earn Rewards</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem',
                marginTop: '1.5rem'
              }}>
                {[
                  { icon: '📖', title: 'Complete Lessons', desc: 'Earn 10-50 points per lesson' },
                  { icon: '🎯', title: 'Take Assessments', desc: 'Earn 100-500 points based on score' },
                  { icon: '🎮', title: 'Play Games', desc: 'Earn 20-100 points per game session' },
                  { icon: '🔥', title: 'Maintain Streaks', desc: 'Daily bonus points for consistency' },
                  { icon: '🏆', title: 'Compete on Leaderboard', desc: 'Top 10 get monthly bonus rewards' },
                  { icon: '👥', title: 'Invite Friends', desc: 'Earn 500 points per referral' }
                ].map((method, index) => (
                  <div
                    key={index}
                    style={{
                      background: '#f8f9fa',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      textAlign: 'center',
                      border: '2px solid #e0e0e0',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e3f2fd';
                      e.currentTarget.style.borderColor = '#1e90ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8f9fa';
                      e.currentTarget.style.borderColor = '#e0e0e0';
                    }}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                      {method.icon}
                    </div>
                    <h3 style={{
                      color: '#2c3e50',
                      fontSize: '1.1rem',
                      marginBottom: '0.5rem'
                    }}>
                      {method.title}
                    </h3>
                    <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>
                      {method.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{
              marginTop: '3rem',
              padding: '2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'white'
            }}>
              <h2 style={{ color: 'white', marginBottom: '1rem' }}>
                🎁 Start Earning Rewards Today!
              </h2>
              <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'white' }}>
                Sign up now and get your first 100 points instantly!
              </p>
              <a href="/signup" style={{
                display: 'inline-block',
                padding: '12px 30px',
                backgroundColor: 'white',
                color: '#667eea',
                textDecoration: 'none',
                borderRadius: '5px',
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}>
                Start Learning Free
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Rewards;
