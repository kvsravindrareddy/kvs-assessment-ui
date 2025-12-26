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

  const mathOptions = ['Random Assessment', 'Generate Numbers', 'Word Problems', 'Counting Money', 'Assessment Flow'];
  const prekOptions = ['Alphabets', 'Numbers', 'Shapes', 'Colors'];
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

      {/* Home Content Sections */}
      {activeSection === 'Home' && (
        <div className="home-container">
          <div className="left-grade-section">
            <LoadGradeData
              gradeData={gradeData}
              setGradeData={setGradeData}
              onClick={toggleSection}
              expandedSection={expandedSection}
              onSubjectClick={handleSubjectClick} // << new
            />
          </div>

          {/* Right Column: Learning Sections */}
          <div className="right-section">
            {/* Pre-K Section */}
            <div className="section-card prek-card" onClick={() => toggleSection('Pre-K')}>
              <div className="card-header">
                <div className="card-icon">🎨</div>
                <div className="card-title">
                  <h2>Early Education (Pre-K)</h2>
                  <p>Ages 3-5 • Foundational Learning</p>
                </div>
                <div className="card-arrow">{expandedSection === 'Pre-K' ? '▲' : '▼'}</div>
              </div>
              {expandedSection === 'Pre-K' && (
                <div className="dropdown-content">
                  {prekOptions.map(opt => (
                    <a key={opt} onClick={(e) => { e.stopPropagation(); handleNavigationClick(opt); }}>
                      <span className="option-icon">✓</span> {opt}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Math Section */}
            <div className="section-card math-card" onClick={() => toggleSection('Math')}>
              <div className="card-header">
                <div className="card-icon">🔢</div>
                <div className="card-title">
                  <h2>Mathematics Practice</h2>
                  <p>All Grades • Interactive Exercises</p>
                </div>
                <div className="card-arrow">{expandedSection === 'Math' ? '▲' : '▼'}</div>
              </div>
              {expandedSection === 'Math' && (
                <div className="dropdown-content">
                  {mathOptions.map(opt => (
                    <a key={opt} onClick={(e) => { e.stopPropagation(); handleNavigationClick(opt); }}>
                      <span className="option-icon">✓</span> {opt}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Kindergarten Section */}
            <div className="section-card kg-card" onClick={() => handleNavigationClick('Kindergarten')}>
              <div className="card-header">
                <div className="card-icon">📖</div>
                <div className="card-title">
                  <h2>Kindergarten Ready</h2>
                  <p>Ages 5-6 • School Preparation</p>
                </div>
                <div className="card-arrow">→</div>
              </div>
            </div>
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
