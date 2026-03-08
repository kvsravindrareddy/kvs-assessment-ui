import React, { useState } from 'react';
import './ModernHomePage.css';

const ModernHomePage = ({ onNavigate, gradeData, onSubjectClick }) => {
  const [activeTab, setActiveTab] = useState('early-learning');

  const earlyLearning = [
    { icon: '🔤', title: 'Alphabets', color: '#667eea', section: 'Alphabets' },
    { icon: '🔢', title: 'Numbers', color: '#48bb78', section: 'Numbers' },
    { icon: '🔷', title: 'Shapes', color: '#ed8936', section: 'Shapes' },
    { icon: '🎨', title: 'Colors', color: '#9f7aea', section: 'Colors' }
  ];

  const quickGames = [
    { icon: '🎮', title: 'All Games', color: '#ec4899', gameId: null },
    { icon: '🧩', title: 'Sudoku', color: '#06b6d4', gameId: 'sudoku' },
    { icon: '🔢', title: 'Math Challenge', color: '#f59e0b', gameId: 'math' },
    { icon: '🎯', title: 'Number Match', color: '#10b981', gameId: 'numbermatch' },
    { icon: '🔄', title: 'Skip Counting', color: '#8b5cf6', gameId: 'skipcounting' },
    { icon: '⚖️', title: 'Compare Numbers', color: '#ef4444', gameId: 'compare' }
  ];

  const assessments = [
    { icon: '📚', title: 'Reading', section: 'Reading', color: '#48bb78', desc: 'Improve reading skills' },
    { icon: '🎯', title: 'Math Tests', section: 'Assessment Flow', color: '#667eea', desc: 'Practice math' },
    { icon: '🤖', title: 'AI Tutor', section: 'AI', color: '#9f7aea', desc: 'Get personalized help' },
    { icon: '⚡', title: 'Challenges', section: 'AssessmentsHub', color: '#f59e0b', desc: 'Compete with friends' }
  ];

  const grades = Object.keys(gradeData).map(grade => ({
    number: grade,
    subjects: Object.keys(gradeData[grade] || {})
  }));

  const revolutionaryFeatures = [
    {
      icon: '🧬',
      title: 'AI Learning DNA',
      desc: 'Personalized learning pathways that adapt to every student\'s unique style',
      color: '#667eea',
      badge: 'Revolutionary'
    },
    {
      icon: '🔮',
      title: 'Future Gap Predictor',
      desc: 'Identifies learning gaps before they become problems',
      color: '#ec4899',
      badge: 'Predictive AI'
    },
    {
      icon: '❤️',
      title: 'Emotional Learning Detection',
      desc: 'Real-time understanding of student engagement and emotional state',
      color: '#ef4444',
      badge: 'Live AI'
    },
    {
      icon: '⚡',
      title: 'Dynamic Question Engine',
      desc: 'Questions that evolve based on student responses',
      color: '#f59e0b',
      badge: 'Smart'
    },
    {
      icon: '🔧',
      title: 'AI Concept Repair Mode',
      desc: 'Automatically fixes knowledge gaps with targeted lessons',
      color: '#10b981',
      badge: 'Auto-Fix'
    },
    {
      icon: '🗺️',
      title: 'Knowledge Graph Visualization',
      desc: 'See your learning journey as an interactive map',
      color: '#06b6d4',
      badge: 'Visual'
    },
    {
      icon: '👨‍👩‍👧',
      title: 'Parent Insight Engine',
      desc: 'Simple, non-technical reports parents actually understand',
      color: '#8b5cf6',
      badge: 'Parent-Friendly'
    },
    {
      icon: '🤝',
      title: 'AI Peer Simulator',
      desc: 'Practice with AI classmates anytime, anywhere',
      color: '#9f7aea',
      badge: 'Social AI'
    },
    {
      icon: '🌟',
      title: 'Life Skill Injection',
      desc: 'Real-world skills embedded in every lesson',
      color: '#f59e0b',
      badge: 'Future Ready'
    },
    {
      icon: '📡',
      title: 'Offline Adaptive Mode',
      desc: 'Full AI learning without internet connection',
      color: '#48bb78',
      badge: 'Works Offline'
    },
    {
      icon: '📦',
      title: 'Smart Printable Kits',
      desc: 'AI-generated worksheets that continue learning offline',
      color: '#ed8936',
      badge: 'Print & Learn'
    },
    {
      icon: '⚡',
      title: 'Class Energy Meter',
      desc: 'Measure classroom engagement in real-time',
      color: '#ec4899',
      badge: 'For Teachers'
    },
    {
      icon: '📊',
      title: 'Parent Action Dashboard',
      desc: 'Clear actions parents can take to help their kids',
      color: '#667eea',
      badge: 'Actionable'
    },
    {
      icon: '🎯',
      title: 'Real-Life Skill Days',
      desc: 'Weekly challenges connecting learning to real life',
      color: '#10b981',
      badge: 'Practical'
    }
  ];

  const tabs = [
    { id: 'early-learning', label: 'Early Learning', icon: '🌈', color: '#667eea' },
    { id: 'games', label: 'Games', icon: '🎮', color: '#ec4899' },
    { id: 'assessments', label: 'Assessments', icon: '📝', color: '#10b981' },
    { id: 'our-innovation', label: 'Our Innovation', icon: '🚀', color: '#ec4899' },
    { id: 'grades', label: 'By Grade', icon: '🎓', color: '#f59e0b' }
  ];

  return (
    <div className="modern-home-container">
      {/* Hero Section */}
      <section className="hero-section-compact">
        <h1 className="hero-title-compact">Let's Learn & Play! ✨</h1>
        <p className="hero-subtitle-compact">Choose a category to get started</p>
      </section>

      {/* Category Tabs */}
      <div className="category-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`category-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              '--tab-color': tab.color,
              '--tab-color-light': `${tab.color}22`
            }}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Early Learning Tab */}
        {activeTab === 'early-learning' && (
          <div className="tab-panel fade-in">
            <h2 className="panel-title">🌈 Early Learning (Ages 3-6)</h2>
            <p className="panel-subtitle">Build foundational skills through interactive activities</p>
            <div className="cards-grid-large">
              {earlyLearning.map((item, index) => (
                <div
                  key={index}
                  className="card-beautiful large"
                  style={{ background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)` }}
                  onClick={() => onNavigate(item.section)}
                >
                  <div className="card-icon-beautiful">{item.icon}</div>
                  <h3 className="card-title-beautiful">{item.title}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div className="tab-panel fade-in">
            <h2 className="panel-title">🎮 Fun Games</h2>
            <p className="panel-subtitle">Learn through play with exciting educational games</p>
            <div className="cards-grid-medium">
              {quickGames.map((game, index) => (
                <div
                  key={index}
                  className="card-beautiful medium"
                  style={{ background: `linear-gradient(135deg, ${game.color} 0%, ${game.color}dd 100%)` }}
                  onClick={() => onNavigate('Games')}
                >
                  <div className="card-icon-beautiful medium">{game.icon}</div>
                  <h4 className="card-title-beautiful small">{game.title}</h4>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assessments Tab */}
        {activeTab === 'assessments' && (
          <div className="tab-panel fade-in">
            <h2 className="panel-title">📝 Assessments & Learning</h2>
            <p className="panel-subtitle">Test your knowledge and track progress</p>
            <div className="cards-grid-medium">
              {assessments.map((tool, index) => (
                <div
                  key={index}
                  className="card-beautiful medium assessment-card"
                  style={{ background: `linear-gradient(135deg, ${tool.color} 0%, ${tool.color}dd 100%)` }}
                  onClick={() => onNavigate(tool.section)}
                >
                  <div className="card-icon-beautiful medium">{tool.icon}</div>
                  <h4 className="card-title-beautiful small">{tool.title}</h4>
                  <p className="card-desc">{tool.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Our Innovation Tab */}
        {activeTab === 'our-innovation' && (
          <div className="tab-panel fade-in">
            <div className="innovation-hero">
              <h2 className="innovation-title">🚀 Transforming Education Worldwide</h2>
              <p className="innovation-subtitle">
                We're not just teaching—we're revolutionizing how children learn, think, and grow.
                <br />
                <strong>Join us in changing the student world forever.</strong>
              </p>
            </div>

            <div className="innovation-grid">
              {revolutionaryFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="innovation-card"
                  style={{ '--feature-color': feature.color }}
                >
                  <div className="innovation-badge">{feature.badge}</div>
                  <div className="innovation-icon">{feature.icon}</div>
                  <h3 className="innovation-card-title">{feature.title}</h3>
                  <p className="innovation-card-desc">{feature.desc}</p>
                  <div className="innovation-glow"></div>
                </div>
              ))}
            </div>

            <div className="innovation-cta">
              <h3 className="cta-title">Ready to Transform Learning?</h3>
              <p className="cta-subtitle">
                Technology • Education • Ethics • Life Skills
              </p>
              <div className="cta-buttons">
                <button className="cta-button primary">Join as School</button>
                <button className="cta-button secondary">Start Learning Free</button>
              </div>
            </div>
          </div>
        )}

        {/* By Grade Tab */}
        {activeTab === 'grades' && (
          <div className="tab-panel fade-in">
            <h2 className="panel-title">🎓 By Grade Level</h2>
            <p className="panel-subtitle">Select your grade to see available subjects</p>
            {grades.length > 0 ? (
              <div className="grades-grid-beautiful">
                {grades.map((grade) => (
                  <div key={grade.number} className="grade-card-beautiful">
                    <div className="grade-badge">Grade {grade.number}</div>
                    <div className="subjects-grid">
                      {grade.subjects.map((subject, idx) => (
                        <button
                          key={idx}
                          className="subject-button-beautiful"
                          onClick={() => onSubjectClick(grade.number, subject)}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>📚 No grade data available yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernHomePage;
