import React, { useState, useEffect } from 'react';
import './App.css';
import './css/footer.css';

import { getLocation } from './utils/location';
import Contactus from './pages/admin/Contactus';
import AboutUs from './pages/admin/AboutUs';
import Subscribe from './pages/admin/Subscribe';
import SpeakComponent from './pages/ai/SpeakComponent';
import Footer from './footer';
import EarlyEducation from './components/EarlyEducation';
import AssessmentComponents from './components/AssessmentComponents';
import LoadGradeData from './pages/config/LoadGradeData';
import News from './pages/news/News';
import AssessmentFlow from './pages/random/AssessmentFlow';
import ReadingFlow from './pages/reading/ReadingFlow';


function App() {
  const [activeSection, setActiveSection] = useState('Home');
  const [expandedSection, setExpandedSection] = useState(null);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [gradeData, setGradeData] = useState({});
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const prekOptions = ['Alphabets', 'Numbers', 'Shapes', 'Colors'];
  const mathOptions = ['Random Assessment', 'Generate Numbers', 'Word Problems', 'Counting Money', 'Assessment Flow'];

  const navigationOptions = [
    { label: 'Home', icon: '🏠' },
    { label: 'Reading', icon: '📚' },
    { label: 'AI', icon: '🤖' },
    { label: 'Contact', icon: '✉️' },
    { label: 'About Us', icon: 'ℹ️' },
    { label: 'Subscribe', icon: '🔔' }
  ];

  useEffect(() => {
    getLocation(setLocation);
  }, [activeSection]);

  const handleSubjectClick = (grade, subject) => {
    setSelectedGrade(grade);
    setSelectedSubject(subject);
    setActiveSection('AssessmentFlow');
  };

  const handleNavigationClick = (option) => {
    setActiveSection(option);
  };

  const toggleSection = (section) => {
    setExpandedSection(prev => (prev === section ? null : section));
  };

  return (
    <div id="mainpage" className={activeSection === 'Home' ? 'home' : ''}>
      {/* Header */}
      <div className="header">
        <div className="brand-section">
          <img src={require('./images/kobstechnologies-color.png')} alt="KOBS Technologies Learning Platform" />
        </div>
        <div className="welcome-message">
          <h1>🤖 AI-Powered Learning Adventures - Where Every Student Becomes a Star! ⭐✨</h1>
        </div>
        <div className="nav-right">
          <div className="buttons">
            <button className="login">Login</button>
            <button className="signup">Sign Up</button>
          </div>
          <div className="search">
            <input type="text" placeholder="🔍 Ask AI..." />
            <button className="search-icon">
              <img src={require('./images/search-icon.png')} alt="search" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="topnav">
        {navigationOptions.map((option) => (
          <button
            key={option.label}
            className={`nav-item ${activeSection === option.label ? 'active' : ''}`}
            onClick={() => handleNavigationClick(option.label)}
          >
            <span className="nav-icon">{option.icon}</span>
            {option.label}
          </button>
        ))}
      </nav>

      {/* Quick Access Tools - Visible on Home Page */}
      {activeSection === 'Home' && (
        <div className="quick-access-section">
          <h2 className="quick-access-title">⚡ Quick Start - Jump Right In!</h2>
          <div className="quick-tools-grid">
            <div className="quick-tool-card ai-tool" onClick={() => handleNavigationClick('AI')}>
              <div className="tool-icon">🤖</div>
              <h3>AI Assistant</h3>
              <p>Ask questions & get instant help</p>
            </div>
            <div className="quick-tool-card reading-tool" onClick={() => handleNavigationClick('Reading')}>
              <div className="tool-icon">📚</div>
              <h3>Reading Practice</h3>
              <p>Improve reading skills</p>
            </div>
            <div className="quick-tool-card math-tool" onClick={() => handleNavigationClick('Random Assessment')}>
              <div className="tool-icon">🔢</div>
              <h3>Math Quiz</h3>
              <p>Test your math skills</p>
            </div>
            <div className="quick-tool-card game-tool" onClick={() => handleNavigationClick('Assessment Flow')}>
              <div className="tool-icon">🎯</div>
              <h3>Practice Tests</h3>
              <p>Grade-level assessments</p>
            </div>
            <div className="quick-tool-card alphabet-tool" onClick={() => handleNavigationClick('Alphabets')}>
              <div className="tool-icon">🔤</div>
              <h3>ABC Learning</h3>
              <p>Learn alphabets & phonics</p>
            </div>
            <div className="quick-tool-card numbers-tool" onClick={() => handleNavigationClick('Numbers')}>
              <div className="tool-icon">🔢</div>
              <h3>Number Games</h3>
              <p>Count & learn numbers</p>
            </div>
          </div>
        </div>
      )}

      {/* Home Content Sections - Learning Trees */}
      {activeSection === 'Home' && (
        <div className="learning-garden">
          <h2 className="garden-title">🌳 Learning Garden - Pick Your Path! 🌱</h2>

          <div className="trees-container">
            {/* Pre-K Tree */}
            <div className="learning-tree prek-tree">
              <div className="tree-trunk">
                <div className="trunk-label">🎨 Pre-K</div>
              </div>
              <div className="tree-branches">
                {prekOptions.map((opt, index) => (
                  <div
                    key={opt}
                    className={`leaf leaf-${index + 1}`}
                    onClick={() => handleNavigationClick(opt)}
                  >
                    <span className="leaf-emoji">🍃</span>
                    <span className="leaf-text">{opt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Math Practice Tree */}
            <div className="learning-tree math-tree">
              <div className="tree-trunk">
                <div className="trunk-label">🔢 Math</div>
              </div>
              <div className="tree-branches">
                {mathOptions.map((opt, index) => (
                  <div
                    key={opt}
                    className={`leaf leaf-${index + 1}`}
                    onClick={() => handleNavigationClick(opt)}
                  >
                    <span className="leaf-emoji">🍃</span>
                    <span className="leaf-text">{opt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reading Tree */}
            <div className="learning-tree reading-tree">
              <div className="tree-trunk">
                <div className="trunk-label">📚 Reading</div>
              </div>
              <div className="tree-branches">
                <div
                  className="leaf leaf-1"
                  onClick={() => handleNavigationClick('Reading')}
                >
                  <span className="leaf-emoji">🍃</span>
                  <span className="leaf-text">Stories</span>
                </div>
                <div
                  className="leaf leaf-2"
                  onClick={() => handleNavigationClick('Alphabets')}
                >
                  <span className="leaf-emoji">🍃</span>
                  <span className="leaf-text">ABC</span>
                </div>
                <div
                  className="leaf leaf-3"
                  onClick={() => handleNavigationClick('Reading')}
                >
                  <span className="leaf-emoji">🍃</span>
                  <span className="leaf-text">Phonics</span>
                </div>
              </div>
            </div>
          </div>

          {/* All Grades Tree - Large tree showing all grade levels */}
          <div className="mega-tree-section">
            <h3 className="mega-tree-title">📚 Grade Levels - Choose Your Grade & Subject 🎯</h3>
            <LoadGradeData
              gradeData={gradeData}
              setGradeData={setGradeData}
              onClick={toggleSection}
              expandedSection={expandedSection}
              onSubjectClick={handleSubjectClick}
            />
          </div>
        </div>
      )}

      {/* Dynamic Section Components */}
      {activeSection === 'AI' && <SpeakComponent />}
      {prekOptions.includes(activeSection) && <EarlyEducation option={activeSection} />}
      {mathOptions.includes(activeSection) && <AssessmentComponents option={activeSection} />}
      {activeSection === 'Subscribe' && <Subscribe />}
      {activeSection === 'Contact' && <Contactus />}
      {activeSection === 'About Us' && <AboutUs />}
      {/* Dynamically show AssessmentFlow with selected values */}
      {activeSection === 'AssessmentFlow' && (
        <AssessmentFlow preSelectedCategory={selectedGrade} preSelectedType={selectedSubject} />
      )}
      {activeSection === 'Reading' && <ReadingFlow />}


      {/* Footer */}
      <div style={{ clear: 'both' }}>
        <Footer onNavigate={handleNavigationClick} />
      </div>
    </div>
  );
}

export default App;
