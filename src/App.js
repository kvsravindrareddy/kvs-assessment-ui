import React, { useState } from 'react';
import './App.css';
import './css/footer.css';
import AssessmentQuestions from './pages/random/AssessmentQuestions';
import NumberSequence from './pages/random/NumberSequence';
import Contactus from './pages/admin/Contactus';
import AboutUs from './pages/admin/AboutUs';
import Subscribe from './pages/admin/Subscribe';
import GenerateNumbers from './pages/random/GenerateNumbers';
import WordProblems from './pages/random/WordProblems';
import CountingMoney from './pages/random/CountingMoney';
import PreKWorksheets from './pages/prek/PreKWorksheets';
import Shapes from './pages/prek/Shapes';
import Colors from './pages/prek/Colors';

function App() {
  const [activeSection, setActiveSection] = useState('Home');
  const [showMathOptions, setShowMathOptions] = useState(false);
  const [showPrekOptions, setShowPrekOptions] = useState(false);

  const navigationOptions = ['Home', 'Pre-K', 'Kindergarten', 'Math', 'News', 'Contact', 'About Us', 'Subscribe'];
  const mathOptions = ['Random Assessment', 'Generate Numbers', "Word Problems", "Counting Money"];
  const prekOptions = ['Alphabets', 'Numbers', 'Shapes', 'Colors'];

  const handleNavigationClick = (option) => {
    if (option === 'Pre-K') {
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
        </div>
        <div className='nav-right'>
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
      {renderPrekComponent(activeSection)}
      {renderMathComponent(activeSection)}
      {activeSection === 'Subscribe' && <Subscribe />}
      {activeSection === 'Contact' && <Contactus />}
      {activeSection === 'About Us' && <AboutUs />}

      {/* Footer section */}
      <footer>
          <hr className="footer-line" />
          <div className="footer-content">
            <div className="footer-section resources">
              <h3>Resources</h3>
              {/* Add your resource links here */}
            </div>
            <div className="footer-section about">
              <h3>About</h3>
              <a href="#" onClick={() => handleNavigationClick('About Us')}>About Us</a>
              <br/>
              <a href="#" onClick={() => handleNavigationClick('Subscribe')}>Subscribe</a>
              <br/>
              <a href="#" onClick={() => handleNavigationClick('Contact')}>Contact</a>

            </div>
            <div className="footer-section other">
              <h3>Other</h3>
              {/* Add your Other links here */}
            </div>
            <div className="footer-section follow-us">
              <h3>Follow Us</h3>
              <div className="social-icons">
                <a href="https://www.youtube.com/@kobstechnologies/videos" target="_blank" rel="noopener noreferrer"><img className="icon" src={require('./images/youtube-logo.png')} alt="YouTube" /></a>
                <a href="https://www.linkedin.com/in/kobs-technologies-9965572a6/" target="_blank" rel="noopener noreferrer"><img className="icon" src={require('./images/linkedin-logo.png')} alt="LinkedIn" /></a>
                <a href="https://www.facebook.com/profile.php?id=61554761378472" target="_blank" rel="noopener noreferrer"><img className="icon" src={require('./images/facebook-logo.png')} alt="Facebook" /></a>
                <a href="https://www.threads.net/@kobstechnologies" target="_blank" rel="noopener noreferrer"><img className="icon" src={require('./images/instagram-logo.png')} alt="Instagram" /></a>
                <a href="https://twitter.com/technologi32955" target="_blank" rel="noopener noreferrer"><img className="icon" src={require('./images/twitter-logo.png')} alt="Twitter" /></a>
              </div>
            </div>
          </div>
        </footer>
    </div>
  );
}

export default App;
