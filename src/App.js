import React, { useState, useEffect } from 'react';
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
import SpeakComponent from './pages/ai/SpeakComponent';
import CONFIG from './Config';
import AssessmentFlow from './pages/random/AssessmentFlow';


function App() {
  const [activeSection, setActiveSection] = useState('Home');
  const [expandedSection, setExpandedSection] = useState(null);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState(null);

  // Function to get the geolocation
  const getLocation = () => {
    console.log('Getting location...');
    // Fallback function to get IP-based location if Geolocation fails
    const getIpLocation = () => {
      console.log('Getting IP-based location...');
      fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
          const lat = data.latitude;
          const lon = data.longitude;
          console.log('IP-based location:', lat, lon);
          setLocation({ latitude: lat, longitude: lon });
          sendLocationToApi(lat, lon); // Send location to API
        })
        .catch(error => console.error('Error getting IP location:', error));
    };
  
    // Check if browser supports Geolocation
    if (navigator.geolocation) {
      console.log('Geolocation is supported by this browser.');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Latitude:', position.coords.latitude);
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocation({ latitude: lat, longitude: lon });
          sendLocationToApi(lat, lon);  // Send location to API
        },
        (error) => {
          console.error('Error getting geolocation:', error);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              alert("User denied the request for Geolocation. Falling back to IP-based location.");
              getIpLocation();  // Fallback to IP-based geolocation
              break;
            case error.POSITION_UNAVAILABLE:
              alert("Location information is unavailable. Falling back to IP-based location.");
              getIpLocation();  // Fallback to IP-based geolocation
              break;
            case error.TIMEOUT:
              alert("The request to get user location timed out. Falling back to IP-based location.");
              getIpLocation();  // Fallback to IP-based geolocation
              break;
            case error.UNKNOWN_ERROR:
              alert("An unknown error occurred. Falling back to IP-based location.");
              getIpLocation();  // Fallback to IP-based geolocation
              break;
          }
        }
      );
    } else {
      console.log("Geolocation is not supported by this browser. Using IP-based location.");
      getIpLocation();  // Use IP-based location if Geolocation is not supported
    }
  };
  
  // Function to send the lat and lon to the REST API
  const sendLocationToApi = (lat, lon) => {
    console.log('Sending location:', lat, lon);
    const url = `${CONFIG.development.EVALUATION_BASE_URL}/geo/locate?lat=${lat}&lon=${lon}`;
    fetch(url, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(data => console.log('Location sent:', data))
      .catch(error => console.error('Error sending location:', error));
  };
  
  // useEffect to get location on mount and on navigation change
  useEffect(() => {
    getLocation();
  }, [activeSection]); // Re-fetch location when activeSection changes  

  const navigationOptions = ['Home', 'AI', 'News', 'Contact', 'About Us', 'Subscribe'];
  const mathOptions = ['Random Assessment', 'Generate Numbers', 'Word Problems', 'Counting Money', 'Assessment Flow'];
  const prekOptions = ['Alphabets', 'Numbers', 'Shapes', 'Colors'];

  const handleNavigationClick = (option) => {
    setActiveSection(option);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

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
      case 'Assessment Flow':
        return <AssessmentFlow />;
      default:
        return null;
    }
  };

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
  };

  return (
    <div id="mainpage" className={activeSection === 'Home' ? 'home' : ''}>
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
      <div className="topnav">
        {navigationOptions.map((option) => (
          <div key={option} className={activeSection === option ? 'active' : ''}>
            <a onClick={() => handleNavigationClick(option)}>{option}</a>
          </div>
        ))}
      </div>
      {activeSection === 'Home' && (
        <div className="home-sections">
          <div className="section-card" onClick={() => toggleSection('Pre-K')}>
            <h2>Pre-K {expandedSection === 'Pre-K' ? '▲' : '▼'}</h2>
            {expandedSection === 'Pre-K' && (
              <div className="dropdown-content">
                {prekOptions.map((prekOption) => (
                  <a key={prekOption} onClick={() => handleNavigationClick(prekOption)}>
                    {prekOption}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="section-card" onClick={() => toggleSection('Math')}>
            <h2>Math {expandedSection === 'Math' ? '▲' : '▼'}</h2>
            {expandedSection === 'Math' && (
              <div className="dropdown-content">
                {mathOptions.map((mathOption) => (
                  <a key={mathOption} onClick={() => handleNavigationClick(mathOption)}>
                    {mathOption}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="section-card" onClick={() => handleNavigationClick('Kindergarten')}>
            <h2>Kindergarten</h2>
          </div>
        </div>
      )}
      {activeSection === 'AI' && <SpeakComponent />}
      {prekOptions.includes(activeSection) && renderPrekComponent(activeSection)}
      {mathOptions.includes(activeSection) && renderMathComponent(activeSection)}
      {activeSection === 'Subscribe' && <Subscribe />}
      {activeSection === 'Contact' && <Contactus />}
      {activeSection === 'About Us' && <AboutUs />}

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
            <br />
            <a href="#" onClick={() => handleNavigationClick('Subscribe')}>Subscribe</a>
            <br />
            <a href="#" onClick={() => handleNavigationClick('Contact')}>Contact</a>
          </div>
          <div className="footer-section other">
            <h3>Other</h3>
            {/* Add your Other links here */}
          </div>
          <div className="footer-section follow-us">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="https://www.youtube.com/@kobstechnologies/videos" target="_blank" rel="noopener noreferrer">
                <img className="icon" src={require('./images/youtube-logo.png')} alt="YouTube" />
              </a>
              <a href="https://www.linkedin.com/in/kobs-technologies-9965572a6/" target="_blank" rel="noopener noreferrer">
                <img className="icon" src={require('./images/linkedin-logo.png')} alt="LinkedIn" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61554761378472" target="_blank" rel="noopener noreferrer">
                <img className="icon" src={require('./images/facebook-logo.png')} alt="Facebook" />
              </a>
              <a href="https://www.threads.net/@kobstechnologies" target="_blank" rel="noopener noreferrer">
                <img className="icon" src={require('./images/instagram-logo.png')} alt="Instagram" />
              </a>
              <a href="https://twitter.com/technologi32955" target="_blank" rel="noopener noreferrer">
                <img className="icon" src={require('./images/twitter-logo.png')} alt="Twitter" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
