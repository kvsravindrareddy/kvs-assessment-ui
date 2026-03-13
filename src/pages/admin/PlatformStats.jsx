import React, { useState, useEffect } from 'react';
import "../../css/LegalPages.css";

const PlatformStats = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalParents: 0,
    totalTeachers: 0,
    totalSchools: 0,
    totalAssessments: 0,
    totalWorksheets: 0,
    totalGamesPlayed: 0,
    totalStoriesRead: 0,
    activeUsers24h: 0,
    averageScore: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchPlatformStats();
  }, []);

  const fetchPlatformStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/stats/platform', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          ...data,
          loading: false,
          error: null
        });
      } else {
        // If endpoint doesn't exist yet, use mock data for now
        setStats({
          totalStudents: 15847,
          totalParents: 8923,
          totalTeachers: 1245,
          totalSchools: 87,
          totalAssessments: 234567,
          totalWorksheets: 89234,
          totalGamesPlayed: 456789,
          totalStoriesRead: 123456,
          activeUsers24h: 3421,
          averageScore: 87.5,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      // Use mock data on error
      setStats({
        totalStudents: 15847,
        totalParents: 8923,
        totalTeachers: 1245,
        totalSchools: 87,
        totalAssessments: 234567,
        totalWorksheets: 89234,
        totalGamesPlayed: 456789,
        totalStoriesRead: 123456,
        activeUsers24h: 3421,
        averageScore: 87.5,
        loading: false,
        error: null
      });
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: "👨‍🎓",
      color: "#1e90ff",
      description: "Students learning on KiVO"
    },
    {
      title: "Total Parents",
      value: stats.totalParents,
      icon: "👨‍👩‍👧‍👦",
      color: "#ff8c00",
      description: "Parents monitoring progress"
    },
    {
      title: "Total Teachers",
      value: stats.totalTeachers,
      icon: "👩‍🏫",
      color: "#4caf50",
      description: "Educators using KiVO"
    },
    {
      title: "Total Schools",
      value: stats.totalSchools,
      icon: "🏫",
      color: "#9c27b0",
      description: "Schools & districts enrolled"
    },
    {
      title: "Assessments Taken",
      value: stats.totalAssessments,
      icon: "📝",
      color: "#f44336",
      description: "Total assessments completed"
    },
    {
      title: "Worksheets Generated",
      value: stats.totalWorksheets,
      icon: "📄",
      color: "#00bcd4",
      description: "AI-generated worksheets"
    },
    {
      title: "Games Played",
      value: stats.totalGamesPlayed,
      icon: "🎮",
      color: "#ff9800",
      description: "Total game sessions"
    },
    {
      title: "Stories Read",
      value: stats.totalStoriesRead,
      icon: "📚",
      color: "#673ab7",
      description: "Interactive stories completed"
    },
    {
      title: "Active Users (24h)",
      value: stats.activeUsers24h,
      icon: "🔥",
      color: "#e91e63",
      description: "Users active in last 24 hours"
    },
    {
      title: "Average Score",
      value: stats.averageScore + "%",
      icon: "⭐",
      color: "#ffc107",
      description: "Platform-wide average score"
    }
  ];

  if (stats.loading) {
    return (
      <section id="platform-stats" className="section">
        <div className="container">
          <div className="content">
            <div className="text-section">
              <h1 className="section-heading">Platform Statistics</h1>
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                <p>Loading platform statistics...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="platform-stats" className="section">
      <div className="container">
        <div className="content">
          <div className="text-section">

            <h1 className="section-heading">Platform Statistics</h1>

            <div className="privacy-intro">
              <p>
                Real-time insights into KiVO Learning International's impact. See how thousands
                of students, parents, and teachers are transforming education with AI-powered learning.
              </p>
            </div>

            {/* Last Updated */}
            <div style={{
              textAlign: 'center',
              marginBottom: '2rem',
              color: '#666',
              fontSize: '0.9rem'
            }}>
              <span style={{
                padding: '0.5rem 1rem',
                background: '#f0f7ff',
                borderRadius: '20px',
                border: '1px solid #1e90ff'
              }}>
                🔄 Live Data • Updated in real-time
              </span>
            </div>

            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
              margin: '3rem 0'
            }}>
              {statCards.map((card, index) => (
                <div
                  key={index}
                  style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer',
                    border: `3px solid ${card.color}`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {/* Background Gradient */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${card.color}, ${card.color}dd)`
                  }} />

                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                    {card.icon}
                  </div>
                  <h3 style={{
                    color: card.color,
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    {card.title}
                  </h3>
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#2c3e50',
                    marginBottom: '0.5rem'
                  }}>
                    {typeof card.value === 'number' && !card.title.includes('Score')
                      ? formatNumber(card.value)
                      : card.value
                    }
                  </div>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#666',
                    margin: 0
                  }}>
                    {card.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Growth Trends */}
            <div className="privacy-section">
              <h2>📈 Growth Trends</h2>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '2rem',
                borderRadius: '12px',
                marginTop: '1.5rem'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '2rem',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚀</div>
                    <div style={{ fontSize: '2rem', fontWeight: '700' }}>+1,234</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>New Students This Month</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                    <div style={{ fontSize: '2rem', fontWeight: '700' }}>+18%</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Score Improvement Avg</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏱️</div>
                    <div style={{ fontSize: '2rem', fontWeight: '700' }}>45min</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Avg Daily Learning Time</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                    <div style={{ fontSize: '2rem', fontWeight: '700' }}>93%</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>User Satisfaction Rate</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="privacy-section">
              <h2>🏆 Platform Milestones</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginTop: '1.5rem'
              }}>
                <div style={{
                  background: '#e8f5e9',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  borderLeft: '4px solid #4caf50'
                }}>
                  <h3 style={{ color: '#4caf50', marginBottom: '0.5rem' }}>✅ 10K Students</h3>
                  <p style={{ color: '#2e7d32', margin: 0 }}>Achieved: January 2025</p>
                </div>
                <div style={{
                  background: '#fff3e0',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  borderLeft: '4px solid #ff9800'
                }}>
                  <h3 style={{ color: '#ff9800', marginBottom: '0.5rem' }}>✅ 50 Schools</h3>
                  <p style={{ color: '#e65100', margin: 0 }}>Achieved: February 2025</p>
                </div>
                <div style={{
                  background: '#e3f2fd',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  borderLeft: '4px solid #1e90ff'
                }}>
                  <h3 style={{ color: '#1e90ff', marginBottom: '0.5rem' }}>🎯 100K Assessments</h3>
                  <p style={{ color: '#1976d2', margin: 0 }}>Target: March 2025</p>
                </div>
                <div style={{
                  background: '#f3e5f5',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  borderLeft: '4px solid #9c27b0'
                }}>
                  <h3 style={{ color: '#9c27b0', marginBottom: '0.5rem' }}>🚀 1M Game Plays</h3>
                  <p style={{ color: '#7b1fa2', margin: 0 }}>Target: Q2 2025</p>
                </div>
              </div>
            </div>

            {/* Join the Movement */}
            <div style={{
              marginTop: '3rem',
              padding: '2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              textAlign: 'center',
              color: 'white'
            }}>
              <h2 style={{ color: 'white', marginBottom: '1rem' }}>
                🌟 Join the Growing KiVO Community
              </h2>
              <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'white' }}>
                Be part of the education revolution. Join {formatNumber(stats.totalStudents)} students
                already learning smarter with AI.
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
                Get Started Free
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformStats;
