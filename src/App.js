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
//import AlphabetGenerator from './pages/prek/AlphabetGenerator';
import PreKWorksheets from './pages/prek/PreKWorksheets';
import Shapes from './pages/prek/Shapes';
import Colors from './pages/prek/Colors';
import './css/mainpage.css';

function App() {
  const [activeSection, setActiveSection] = useState('Home'); // State for active section
  const [showMathOptions, setShowMathOptions] = useState(false); // State for showing math options
  const [showPrekOptions, setShowPrekOptions] = useState(false); // State for showing pre-k options

  const navigationOptions = ['Home', 'Pre-K', 'Kindergarten', 'Math', 'News', 'Contact', 'About', 'Subscribe']; // Navigation options
  const mathOptions = ['Random Assessment', 'Generate Numbers', "Word Problems", "Counting Money"]; // Math options
  const prekOptions = ['Alphabets', 'Numbers', 'Shapes', 'Colors']; // Pre-K options

  const handleNavigationClick = (option) => {
    if(option === 'Pre-K') {
      setShowPrekOptions(!showPrekOptions);
    } else {
      setActiveSection(option);
    }
  };

  const toggleMathOptions = () => {
    setShowMathOptions(!showMathOptions);
  }

  const togglePrekOptions = () => {
    setShowPrekOptions(!showPrekOptions);
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

  const renderPrekComponent = (option) => {
    switch (option) {
      case 'Alphabets':
        return <PreKWorksheets />;
      case 'Numbers':
        return <NumberSequence />;
      case 'Shapes':
        return <Shapes />;
      case 'Colors':
        return <Colors />;
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
          ) : option === 'Pre-K' ? (
            <div className="dropdown" onMouseEnter={togglePrekOptions} onMouseLeave={togglePrekOptions}>
              <a className="dropbtn">Pre-K</a>
              {showPrekOptions && (
                <div className="dropdown-content">
                  {prekOptions.map(prekOption => (
                    <a key={prekOption} onClick={() => handleNavigationClick(prekOption)}>
                      {prekOption}
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
    {renderPrekComponent(activeSection)} {/* Render the selected pre-k component */}
    {renderMathComponent(activeSection)} {/* Render the selected math component */}
    {activeSection === 'Subscribe' && <Subscribe />}
    {activeSection === 'Contact' && <Contactus />}
  </div>
);
}

export default App;