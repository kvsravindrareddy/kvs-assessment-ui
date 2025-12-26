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
  const navigationOptions = ['Home', 'Reading', 'AI', 'Contact', 'About Us', 'Subscribe'];

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
          <img src={require('./images/kobstechnologies-color.png')} alt="logo" />
        </div>
        <div className="nav-right">
          <div className="buttons">
            <button className="login">Login</button>
            <button className="signup">Sign Up</button>
          </div>
          <div className="search">
            <input type="text" placeholder="Search" />
            <button className="search-icon">
              <img src={require('./images/search-icon.png')} alt="search" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="topnav">
        {navigationOptions.map((option) => (
          <div key={option} className={activeSection === option ? 'active' : ''}>
            <a onClick={() => handleNavigationClick(option)}>{option}</a>
          </div>
        ))}
      </div>

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

          {/* Right Column: PreK, Math, KG */}
          <div className="right-section">
            {/* Pre-K Section */}
            <div className="section-card" onClick={() => toggleSection('Pre-K')}>
              <h2>Early Education {expandedSection === 'Pre-K' ? '▲' : '▼'}</h2>
              {expandedSection === 'Pre-K' && (
                <div className="dropdown-content">
                  {prekOptions.map(opt => (
                    <a key={opt} onClick={() => handleNavigationClick(opt)}>{opt}</a>
                  ))}
                </div>
              )}
            </div>

            {/* Math Section */}
            <div className="section-card" onClick={() => toggleSection('Math')}>
              <h2>Math {expandedSection === 'Math' ? '▲' : '▼'}</h2>
              {expandedSection === 'Math' && (
                <div className="dropdown-content">
                  {mathOptions.map(opt => (
                    <a key={opt} onClick={() => handleNavigationClick(opt)}>{opt}</a>
                  ))}
                </div>
              )}
            </div>

            {/* Kindergarten Section */}
            <div className="section-card" onClick={() => handleNavigationClick('Kindergarten')}>
              <h2>Kindergarten</h2>
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
