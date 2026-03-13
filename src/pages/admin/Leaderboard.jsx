import React, { useState, useEffect } from 'react';
import "../../css/LegalPages.css";

const Leaderboard = () => {
  const [period, setPeriod] = useState('week');
  const [category, setCategory] = useState('all');

  // Mock leaderboard data - would come from backend
  const leaderboardData = {
    all: [
      { rank: 1, name: 'Emma Rodriguez', avatar: '👧', score: 15847, streak: 45, level: 25, badge: '🏆' },
      { rank: 2, name: 'Michael Chen', avatar: '👦', score: 14932, streak: 38, level: 24, badge: '🥈' },
      { rank: 3, name: 'Sofia Martinez', avatar: '👧', score: 14201, streak: 42, level: 23, badge: '🥉' },
      { rank: 4, name: 'Liam Johnson', avatar: '👦', score: 13876, streak: 35, level: 22, badge: '⭐' },
      { rank: 5, name: 'Olivia Williams', avatar: '👧', score: 13654, streak: 40, level: 22, badge: '⭐' },
      { rank: 6, name: 'Noah Brown', avatar: '👦', score: 13298, streak: 33, level: 21, badge: '⭐' },
      { rank: 7, name: 'Ava Davis', avatar: '👧', score: 12987, streak: 37, level: 21, badge: '⭐' },
      { rank: 8, name: 'Ethan Miller', avatar: '👦', score: 12765, streak: 31, level: 20, badge: '⭐' },
      { rank: 9, name: 'Isabella Wilson', avatar: '👧', score: 12543, streak: 36, level: 20, badge: '⭐' },
      { rank: 10, name: 'Mason Garcia', avatar: '👦', score: 12321, streak: 29, level: 19, badge: '⭐' }
    ],
    math: [
      { rank: 1, name: 'Michael Chen', avatar: '👦', score: 8934, streak: 28, level: 18, badge: '🏆' },
      { rank: 2, name: 'Emma Rodriguez', avatar: '👧', score: 8721, streak: 32, level: 17, badge: '🥈' },
      { rank: 3, name: 'Noah Brown', avatar: '👦', score: 8456, streak: 25, level: 16, badge: '🥉' }
    ],
    reading: [
      { rank: 1, name: 'Emma Rodriguez', avatar: '👧', score: 7123, streak: 45, level: 15, badge: '🏆' },
      { rank: 2, name: 'Olivia Williams', avatar: '👧', score: 6987, streak: 40, level: 14, badge: '🥈' },
      { rank: 3, name: 'Ava Davis', avatar: '👧', score: 6754, streak: 37, level: 14, badge: '🥉' }
    ]
  };

  const periods = [
    { key: 'today', label: 'Today', icon: '📅' },
    { key: 'week', label: 'This Week', icon: '🗓️' },
    { key: 'month', label: 'This Month', icon: '📆' },
    { key: 'allTime', label: 'All Time', icon: '🏅' }
  ];

  const categories = [
    { key: 'all', label: 'Overall', icon: '🌟' },
    { key: 'math', label: 'Math Champions', icon: '🔢' },
    { key: 'reading', label: 'Reading Masters', icon: '📚' },
    { key: 'games', label: 'Game Heroes', icon: '🎮' }
  ];

  return (
    <section id="leaderboard" className="section">
      <div className="container">
        <div className="content">
          <div className="text-section">

            <h1 className="section-heading">🏆 Champions Leaderboard</h1>

            <div className="privacy-intro">
              <p>
                See who's crushing it on KiVO Learning! Compete with students worldwide,
                climb the ranks, and become a learning champion! 🌟
              </p>
            </div>

            {/* Period Selector */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '2rem'
            }}>
              {periods.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: period === p.key
                      ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                      : 'white',
                    color: period === p.key ? 'white' : '#2c3e50',
                    border: period === p.key ? 'none' : '2px solid #e0e0e0',
                    borderRadius: '25px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    boxShadow: period === p.key ? '0 4px 12px rgba(251, 191, 36, 0.4)' : 'none'
                  }}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>

            {/* Category Selector */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '3rem'
            }}>
              {categories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: category === c.key
                      ? 'linear-gradient(135deg, #667eea, #764ba2)'
                      : 'white',
                    color: category === c.key ? 'white' : '#2c3e50',
                    border: category === c.key ? 'none' : '2px solid #e0e0e0',
                    borderRadius: '25px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    boxShadow: category === c.key ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
                  }}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            {/* Top 3 Podium */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              gap: '2rem',
              marginBottom: '3rem',
              flexWrap: 'wrap'
            }}>
              {leaderboardData[category].slice(0, 3).map((student, index) => {
                const heights = ['180px', '220px', '160px'];
                const colors = ['#c0c0c0', '#ffd700', '#cd7f32'];
                const positions = [1, 0, 2]; // Middle is highest

                return (
                  <div
                    key={student.rank}
                    style={{
                      textAlign: 'center',
                      order: positions[index]
                    }}
                  >
                    <div style={{
                      width: '120px',
                      height: heights[index],
                      background: `linear-gradient(135deg, ${colors[index]}, ${colors[index]}dd)`,
                      borderRadius: '12px 12px 0 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      padding: '1.5rem 1rem',
                      boxShadow: `0 8px 24px ${colors[index]}88`,
                      position: 'relative',
                      animation: 'slideUp 0.6s ease-out'
                    }}>
                      <div style={{
                        fontSize: '4rem',
                        marginBottom: '0.5rem'
                      }}>
                        {student.avatar}
                      </div>
                      <div style={{
                        fontSize: '2rem',
                        marginBottom: '0.5rem'
                      }}>
                        {student.badge}
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                        marginBottom: '0.5rem'
                      }}>
                        {student.name}
                      </div>
                      <div style={{
                        fontSize: '1.3rem',
                        fontWeight: 'bold',
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                      }}>
                        {student.score.toLocaleString()}
                      </div>

                      {/* Rank badge */}
                      <div style={{
                        position: 'absolute',
                        top: '-15px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '40px',
                        height: '40px',
                        background: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: colors[index],
                        boxShadow: `0 4px 12px ${colors[index]}88`
                      }}>
                        {student.rank}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full Leaderboard List */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}>
              {leaderboardData[category].map((student, index) => (
                <div
                  key={student.rank}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 60px 1fr auto auto',
                    gap: '1rem',
                    padding: '1.5rem',
                    alignItems: 'center',
                    borderBottom: index < leaderboardData[category].length - 1 ? '1px solid #f0f0f0' : 'none',
                    background: student.rank <= 3
                      ? 'linear-gradient(90deg, #fff9e6, white)'
                      : 'white',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = student.rank <= 3
                      ? 'linear-gradient(90deg, #fff3cd, white)'
                      : '#f9f9f9';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = student.rank <= 3
                      ? 'linear-gradient(90deg, #fff9e6, white)'
                      : 'white';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  {/* Rank */}
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: student.rank <= 3 ? '#fbbf24' : '#666',
                    textAlign: 'center'
                  }}>
                    #{student.rank}
                  </div>

                  {/* Avatar */}
                  <div style={{ fontSize: '2.5rem', textAlign: 'center' }}>
                    {student.avatar}
                  </div>

                  {/* Name & Stats */}
                  <div>
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      color: '#2c3e50',
                      marginBottom: '0.25rem'
                    }}>
                      {student.name}
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#666',
                      display: 'flex',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <span>🔥 {student.streak} day streak</span>
                      <span>🎯 Level {student.level}</span>
                    </div>
                  </div>

                  {/* Badge */}
                  <div style={{ fontSize: '2rem' }}>
                    {student.badge}
                  </div>

                  {/* Score */}
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#1e90ff',
                    textAlign: 'right',
                    minWidth: '120px'
                  }}>
                    {student.score.toLocaleString()}
                    <div style={{
                      fontSize: '0.7rem',
                      color: '#999',
                      fontWeight: 'normal'
                    }}>
                      points
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div style={{
              marginTop: '3rem',
              padding: '2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'white'
            }}>
              <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '2rem' }}>
                🚀 Ready to Join the Champions?
              </h2>
              <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'white', opacity: 0.95 }}>
                Start learning today and climb the leaderboard!
              </p>
              <a href="/signup" style={{
                display: 'inline-block',
                padding: '12px 30px',
                backgroundColor: 'white',
                color: '#667eea',
                textDecoration: 'none',
                borderRadius: '5px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }}>
                Start Learning Free
              </a>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default Leaderboard;
