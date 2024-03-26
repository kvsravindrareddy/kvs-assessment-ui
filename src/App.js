// App.js
import React, { useState } from 'react';
import './App.css';
import AssessmentQuestions from './pages/random/AssessmentQuestions';
import NumberSequence from './pages/random/NumberSequence';
import Contactus from './pages/admin/Contactus';
import Subscribe from './pages/admin/Subscribe';
import './css/mainpage.css';

function App() {
  const [activeSection, setActiveSection] = useState('Home'); // State for active section

  const navigationOptions = ['Home', 'Pre-K', 'Kindergarten', 'Math', 'News', 'Contact', 'About', 'Subscribe']; // Navigation options

  const handleNavigationClick = (option) => {
    setActiveSection(option);
  };

  return (
    <div id="mainpage" className={activeSection === 'Home' ? 'home' : ''}>
      <div className="topnav">
        {navigationOptions.map(option => (
          <a key={option} className={activeSection === option ? 'active' : ''} onClick={() => handleNavigationClick(option)}>{option}</a>
        ))}
      </div>
      {activeSection === 'Pre-K' && <NumberSequence />} {/* Render NumberSequence component if active section is 'Pre-K' */}  
      {activeSection === 'Math' && <AssessmentQuestions />} {/* Render AssessmentQuestions component if active section is 'Math' */}
      {activeSection === 'Subscribe' && <Subscribe/>} {/* Render Subscribe component if active section is 'Subscribe' */}
      {activeSection === 'Contact' && <Contactus />} {/* Render Contactus component if active section is 'Contact' */}
    </div>
  );
}

export default App;
