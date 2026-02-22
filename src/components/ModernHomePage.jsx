import React from 'react';
import './ModernHomePage.css';

const ModernHomePage = ({ onNavigate, gradeData, onSubjectClick }) => {
  const earlyLearning = [
    { icon: '🔤', title: 'Alphabets', color: '#667eea', section: 'Alphabets' },
    { icon: '🔢', title: 'Numbers', color: '#48bb78', section: 'Numbers' },
    { icon: '🔷', title: 'Shapes', color: '#ed8936', section: 'Shapes' },
    { icon: '🎨', title: 'Colors', color: '#9f7aea', section: 'Colors' }
  ];

  const quickGames = [
    { icon: '🎮', title: 'All Games', color: '#ec4899' },
    { icon: '🧩', title: 'Sudoku', color: '#06b6d4' },
    { icon: '🔢', title: 'Math Challenge', color: '#f59e0b' },
    { icon: '🎯', title: 'Number Match', color: '#10b981' },
    { icon: '🔄', title: 'Skip Counting', color: '#8b5cf6' },
    { icon: '⚖️', title: 'Compare Numbers', color: '#ef4444' }
  ];

  const learningTools = [
    { icon: '📚', title: 'Reading', section: 'Reading', color: '#48bb78' },
    { icon: '🤖', title: 'AI Tutor', section: 'AI', color: '#9f7aea' },
    { icon: '🎯', title: 'Assessments', section: 'Assessment Flow', color: '#667eea' }
  ];

  const grades = Object.keys(gradeData).map(grade => ({
    number: grade,
    subjects: Object.keys(gradeData[grade] || {})
  }));

  return (
    <div className="modern-home-container">
      {/* Hero Section */}
      <section className="hero-section-beautiful">
        <div className="hero-stars">✨🌟⭐💫</div>
        <h1 className="hero-title-beautiful">Let's Learn & Play!</h1>
        <p className="hero-subtitle-beautiful">Choose what you want to explore today</p>
      </section>

      {/* Early Learning - Big Cards */}
      <section className="learning-section">
        <h2 className="section-title-beautiful">🌈 Early Learning (Ages 3-6)</h2>
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
      </section>

      {/* Quick Games */}
      <section className="learning-section">
        <h2 className="section-title-beautiful">🎮 Fun Games</h2>
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
      </section>

      {/* Learning Tools */}
      <section className="learning-section">
        <h2 className="section-title-beautiful">📖 Learning Tools</h2>
        <div className="cards-grid-medium">
          {learningTools.map((tool, index) => (
            <div
              key={index}
              className="card-beautiful medium"
              style={{ background: `linear-gradient(135deg, ${tool.color} 0%, ${tool.color}dd 100%)` }}
              onClick={() => onNavigate(tool.section)}
            >
              <div className="card-icon-beautiful medium">{tool.icon}</div>
              <h4 className="card-title-beautiful small">{tool.title}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Grade Levels */}
      {grades.length > 0 && (
        <section className="learning-section">
          <h2 className="section-title-beautiful">🎓 By Grade Level</h2>
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
        </section>
      )}
    </div>
  );
};

export default ModernHomePage;
