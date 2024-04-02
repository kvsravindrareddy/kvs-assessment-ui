// App.js
import React, { useState } from 'react';
import './App.css';
import AssessmentQuestions from './pages/random/AssessmentQuestions';
import NumberSequence from './pages/random/NumberSequence';
import Contactus from './pages/admin/Contactus';
import Subscribe from './pages/admin/Subscribe';
import GenerateNumbers from './pages/random/GenerateNumbers';
import WordProblems from './pages/random/WordProblems';
import CountingMoney from './pages/random/CountingMoney';
import './css/mainpage.css';

function App() {
  const [activeSection, setActiveSection] = useState('Home'); // State for active section
  const [showMathOptions, setShowMathOptions] = useState(false); // State for showing math options

  const navigationOptions = ['Home', 'Pre-K', 'Kindergarten', 'Math', 'News', 'Contact', 'About', 'Subscribe']; // Navigation options
  const mathOptions = ['Random Assessment', 'Generate Numbers', "Word Problems", "Counting Money"]; // Math options

  const handleNavigationClick = (option) => {
    setActiveSection(option);
  };

  const toggleMathOptions = () => {
    setShowMathOptions(!showMathOptions);
  }

  const renderMathComponent = (option) => {
    switch (option) {
      case 'Random Assessment':
        return <AssessmentQuestions />;
      case 'Generate Numbers':
        return <GenerateNumbers />;
      case 'Word Problems':
        return <WordProblems />;
      case 'Counting Money':
        return <CountingMoney />;
      default:
        return null;
    }
  }

  return (
    <div id="mainpage" className={activeSection === 'Home' ? 'home' : ''}>
      <div className='header'>
      <div className='brand-section'>
        <img src={require('./images/kobstechnologies-color.png')} alt='logo' />
        <div className='buttons'>
          <button className='login'>Login</button>
          <button className='signup'>Sign Up</button>
        </div>
        <div className='search'>
          <input type='text' placeholder='Search' />
          <button className='search-icon'>
            <img src={require('./images/search-icon.png')} alt='search' />
          </button>
        </div>
      </div>
      </div>
      <div className="topnav">
        {navigationOptions.map(option => (
          <div key={option} className={activeSection === option ? 'active' : ''}>
            {option === 'Math' ? (
              <div className="dropdown" onMouseEnter={toggleMathOptions} onMouseLeave={toggleMathOptions}>
                <a className="dropbtn">Math</a>
                {showMathOptions && (
                  <div className="dropdown-content">
                    {mathOptions.map(mathOption => (
                      <a key={mathOption} onClick={() => handleNavigationClick(mathOption)}>
                        {mathOption}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a onClick={() => handleNavigationClick(option)}>{option}</a>
            )}
          </div>
        ))}
      </div>
      {activeSection === 'Pre-K' && <NumberSequence />}
      {renderMathComponent(activeSection)} {/* Render the selected math component */}
      {activeSection === 'Subscribe' && <Subscribe />}
      {activeSection === 'Contact' && <Contactus />}
    </div>
  );
}

export default App;
