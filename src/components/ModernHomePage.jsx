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

  // Categorized Revolutionary Features
  const featureCategories = [
    {
      category: '🤖 AI-Powered Intelligence',
      icon: '🤖',
      color: '#667eea',
      description: 'Advanced AI that learns, adapts, and grows with each student',
      features: [
        {
          icon: '🧬',
          title: 'AI Learning DNA',
          desc: 'Learns your personality, interests, emotions - adapts like a real tutor who knows you',
          color: '#667eea',
          badge: 'Revolutionary'
        },
        {
          icon: '❤️',
          title: 'Live Emotional AI',
          desc: 'Detects frustration, boredom, excitement - adjusts instantly like a caring teacher',
          color: '#ef4444',
          badge: 'Empathy AI'
        },
        {
          icon: '🔮',
          title: 'Future Gap Predictor',
          desc: 'Predicts struggles 2-3 weeks before they happen - fixes problems before they exist',
          color: '#ec4899',
          badge: 'Predictive AI'
        },
        {
          icon: '🔧',
          title: 'Auto Concept Repair',
          desc: 'Finds exactly what you missed and fixes it - no more "I don\'t get it"',
          color: '#10b981',
          badge: 'Auto-Fix'
        },
        {
          icon: '🤖',
          title: 'AI Study Buddy',
          desc: 'Personal AI that grows with you K-12 - remembers everything about your journey',
          color: '#8b5cf6',
          badge: 'Always There'
        },
        {
          icon: '🗣️',
          title: 'Voice AI Conversation',
          desc: 'Talk naturally with AI tutors - like having a friend who knows everything',
          color: '#06b6d4',
          badge: 'Voice AI'
        }
      ]
    },
    {
      category: '🎮 Gamified Learning',
      icon: '🎮',
      color: '#ec4899',
      description: 'Learning so fun, kids choose it over video games',
      features: [
        {
          icon: '🎮',
          title: 'Learning Universe',
          desc: 'AAA game quality - kids choose this over Fortnite and Roblox',
          color: '#8b5cf6',
          badge: 'Addictive'
        },
        {
          icon: '🏆',
          title: 'Team Learning Missions',
          desc: 'Cooperative multiplayer - friends solve problems together, not compete',
          color: '#f59e0b',
          badge: 'Co-op Mode'
        },
        {
          icon: '🌍',
          title: 'AR Real-World Quests',
          desc: 'Learn math at grocery stores, science at parks - education meets real life',
          color: '#06b6d4',
          badge: 'AR Powered'
        },
        {
          icon: '📺',
          title: 'Netflix Learning Series',
          desc: 'Episodic stories kids wait for - cliffhangers that make them want to learn more',
          color: '#e74c3c',
          badge: 'Binge-Worthy'
        },
        {
          icon: '🎵',
          title: 'Multi-Sensory Learning',
          desc: 'Music, movement, touch, sight - learn through all your senses',
          color: '#9f7aea',
          badge: 'Sensory'
        }
      ]
    },
    {
      category: '👨‍👩‍👧 Family & Social',
      icon: '👨‍👩‍👧',
      color: '#48bb78',
      description: 'Strengthen family bonds while learning together',
      features: [
        {
          icon: '👨‍👩‍👧',
          title: 'Parent-Child Co-Learning',
          desc: 'Learn together - bonding time that\'s educational AND fun for both',
          color: '#9f7aea',
          badge: 'Family Time'
        },
        {
          icon: '📸',
          title: 'Parent Moments Sharing',
          desc: 'Parents receive child achievements as shareable moments for social media',
          color: '#ec4899',
          badge: 'Live Now ✓'
        },
        {
          icon: '📱',
          title: 'Parent Action Dashboard',
          desc: 'Clear 5-minute actions parents can do today - not confusing data',
          color: '#06b6d4',
          badge: 'Actionable'
        },
        {
          icon: '💬',
          title: 'AI Peer Simulator',
          desc: 'Practice explaining concepts to AI friends - deepens understanding',
          color: '#48bb78',
          badge: 'Social AI'
        }
      ]
    },
    {
      category: '📊 Smart Assessment',
      icon: '📊',
      color: '#f59e0b',
      description: 'Stress-free evaluation that celebrates growth',
      features: [
        {
          icon: '📝',
          title: 'AI Paper Correction',
          desc: 'Scan handwritten homework with phone - instant AI grading with detailed feedback',
          color: '#f59e0b',
          badge: 'Coming Soon'
        },
        {
          icon: '⚡',
          title: 'Mistake-Powered Learning',
          desc: 'Every error makes you smarter - no shame, just growth',
          color: '#e74c3c',
          badge: 'No Stress'
        },
        {
          icon: '🎨',
          title: 'Multiple Ways to Show',
          desc: 'Draw, build, explain, perform - show knowledge YOUR way',
          color: '#9f7aea',
          badge: 'Creative'
        },
        {
          icon: '📊',
          title: 'Holistic Progress Tree',
          desc: 'Track academic, emotional, physical, creative, social growth in one place',
          color: '#48bb78',
          badge: 'Whole Child'
        },
        {
          icon: '🗺️',
          title: 'Knowledge Galaxy Map',
          desc: 'Visual universe of what you know - exploration not obligation',
          color: '#8b5cf6',
          badge: 'Beautiful'
        }
      ]
    },
    {
      category: '🌟 Life Skills & Character',
      icon: '🌟',
      color: '#10b981',
      description: 'Real-world skills and emotional intelligence development',
      features: [
        {
          icon: '💰',
          title: 'Financial Literacy Gaming',
          desc: 'Budget, invest, save in simulation - real money skills through play',
          color: '#f59e0b',
          badge: 'Life Skills'
        },
        {
          icon: '🎯',
          title: 'Critical Thinking Lab',
          desc: 'Solve real problems - climate, poverty, health - think like world changers',
          color: '#10b981',
          badge: 'Problem Solving'
        },
        {
          icon: '🎭',
          title: 'Character Development',
          desc: 'Growth mindset, resilience, empathy tracked like academic progress',
          color: '#667eea',
          badge: 'EQ Focus'
        },
        {
          icon: '🏗️',
          title: 'Project-Based Learning',
          desc: 'Build real things - apps, robots, businesses - learn by creating',
          color: '#06b6d4',
          badge: 'Build & Learn'
        },
        {
          icon: '🌟',
          title: 'Life Skill Days',
          desc: 'Cooking math, cleaning science, shopping budgets - school meets real life',
          color: '#ed8936',
          badge: 'Practical'
        },
        {
          icon: '🔬',
          title: 'Curiosity Engine',
          desc: 'Every answer sparks 3 new questions - endless wonder and discovery',
          color: '#10b981',
          badge: 'Wonder Driven'
        }
      ]
    },
    {
      category: '🌍 Global & Accessible',
      icon: '🌍',
      color: '#06b6d4',
      description: 'Learning for everyone, everywhere - online or offline',
      features: [
        {
          icon: '📡',
          title: 'Offline-First World',
          desc: 'Download personalized content packages - full learning with zero internet',
          color: '#667eea',
          badge: 'Live Now ✓'
        },
        {
          icon: '📦',
          title: 'Smart Printable Worksheets',
          desc: 'Auto-generated math worksheets (addition, subtraction, multiplication, division)',
          color: '#ec4899',
          badge: 'Live Now ✓'
        },
        {
          icon: '🌐',
          title: 'Hyper-Local Content',
          desc: 'Math with local currency, science with local plants - culturally relevant',
          color: '#10b981',
          badge: 'Local First'
        },
        {
          icon: '🌈',
          title: 'Neurodiversity Adaptive',
          desc: 'Perfect for ADHD, autism, dyslexia - learns how YOUR brain works best',
          color: '#9f7aea',
          badge: 'Inclusive'
        }
      ]
    },
    {
      category: '👩‍🏫 Teacher Tools',
      icon: '👩‍🏫',
      color: '#8b5cf6',
      description: 'Empowering teachers with AI-assisted insights',
      features: [
        {
          icon: '⚡',
          title: 'Class Energy Meter',
          desc: 'Teachers see real-time engagement - adjust on the fly',
          color: '#f59e0b',
          badge: 'For Teachers'
        }
      ]
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
              <h2 className="innovation-title">🚀 The Future of Learning is HERE</h2>
              <p className="innovation-subtitle">
                <strong>KiVO Learning:</strong> The platform kids CHOOSE over video games • Parents TRUST for whole-child development • Teachers EMBRACE as their AI co-teacher
                <br />
                <strong>🌍 No other platform in the world combines gaming quality + emotional AI + family bonding + real-world skills + offline accessibility</strong>
              </p>
              <div className="hero-stats">
                <div className="stat-item">
                  <div className="stat-number">28+</div>
                  <div className="stat-label">Revolutionary Features</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">100%</div>
                  <div className="stat-label">Works Offline</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">∞</div>
                  <div className="stat-label">Personalized Paths</div>
                </div>
              </div>
            </div>

            {/* Categorized Features */}
            {featureCategories.map((category, catIndex) => (
              <div key={catIndex} className="feature-category-section">
                <div className="category-header" style={{ '--category-color': category.color }}>
                  <span className="category-icon">{category.icon}</span>
                  <div className="category-info">
                    <h3 className="category-title">{category.category}</h3>
                    <p className="category-description">{category.description}</p>
                  </div>
                  <span className="category-count">{category.features.length} features</span>
                </div>

                <div className="innovation-grid">
                  {category.features.map((feature, index) => (
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
              </div>
            ))}

            <div className="innovation-cta">
              <h3 className="cta-title">Join the Learning Revolution</h3>
              <p className="cta-subtitle">
                💡 Technology • 🎓 Education • 🌱 Ethics • 🌟 Life Skills • ❤️ Emotional Intelligence
              </p>
              <div className="cta-vision">
                <strong>"We're not building another learning platform. We're changing the student world."</strong>
              </div>
              <div className="cta-features-list">
                <div className="feature-pill">✅ Kids choose it over games</div>
                <div className="feature-pill">✅ Parents trust holistic development</div>
                <div className="feature-pill">✅ Teachers love the AI assistance</div>
                <div className="feature-pill">✅ Works 100% offline</div>
                <div className="feature-pill">✅ Multiple user roles (Student, Parent, Teacher)</div>
                <div className="feature-pill">✅ Free to start, affordable to continue</div>
              </div>
              <div className="cta-buttons">
                <button className="cta-button primary">🏫 Partner as School</button>
                <button className="cta-button secondary">🎮 Start Free Adventure</button>
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
