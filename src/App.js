import React, { useState, useEffect } from 'react';
import './App.css';
import './css/footer.css';

import { getLocation } from './utils/location';
import Contactus from './pages/admin/Contactus';
import AboutUs from './pages/admin/AboutUs';
import Subscribe from './pages/admin/Subscribe';
import AIHub from './pages/ai/AIHub';
import Footer from './footer';
import EarlyEducation from './components/EarlyEducation';
import AssessmentComponents from './components/AssessmentComponents';
import LoadGradeData from './pages/config/LoadGradeData';
import ModernHomePage from './components/ModernHomePage';
import News from './pages/news/News';
import AssessmentFlow from './pages/random/AssessmentFlow';
import ReadingFlow from './pages/reading/ReadingFlow';
import GamesHub from './pages/games/GamesHub';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import UnifiedDashboard from './pages/dashboard/UnifiedDashboard';
import PricingPage from './pages/subscription/PricingPage';
import UsageIndicator from './components/UsageIndicator';
import { useLocation, useNavigate } from 'react-router-dom';

// NEW: Import the beautiful Assessments Hub
import AssessmentsHub from './pages/assessments/AssessmentsHub';

function AppContent() {
  const [activeSection, setActiveSection] = useState('Home');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/reading')) setActiveSection('Reading');
    else if (path.includes('/dashboard')) setActiveSection('Dashboard');
    else if (path.includes('/games')) setActiveSection('Games');
    // NEW: Tells the nav bar to highlight Assessments when on this URL
    else if (path.includes('/assessments')) setActiveSection('AssessmentsHub'); 
    else if (path === '/' && activeSection !== 'Home') setActiveSection('Home');
  }, [location.pathname]);

  const [expandedSection, setExpandedSection] = useState(null);
  const [locationState, setLocationState] = useState({ latitude: null, longitude: null });
  const [gradeData, setGradeData] = useState({});
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { subscriptionTier, SUBSCRIPTION_TIERS, getRemainingUsage } = useSubscription();

  const isAdminUser = user && (
    user.role === 'SUPER_ADMIN' ||
    user.role === 'DISTRICT_ADMIN' ||
    user.role === 'SCHOOL_ADMIN' ||
    user.role === 'TEACHER' ||
    user.role === 'CONTENT_CREATOR' ||
    user.role === 'COUNSELOR' ||
    user.role === 'LIBRARIAN' ||
    user.role === 'SUPPORT_STAFF'
  );

  const [showStudentNav, setShowStudentNav] = useState(!isAdminUser);

  const isGuestUser = !user;
  const isFreeTier = subscriptionTier === SUBSCRIPTION_TIERS.GUEST ||
                     subscriptionTier === SUBSCRIPTION_TIERS.STUDENT_FREE ||
                     subscriptionTier === SUBSCRIPTION_TIERS.TEACHER_FREE;

  const prekOptions = ['Alphabets', 'Numbers', 'Shapes', 'Colors'];
  const mathOptions = ['Random Assessment', 'Generate Numbers', 'Word Problems', 'Counting Money'];

  const allFeatures = [
    { name: 'Alphabets', category: 'Pre-K', description: 'Learn ABC with words and emojis', icon: '🔤', keywords: ['abc', 'letters', 'alphabet', 'a-z'], navigateTo: 'Alphabets', gameId: null },
    { name: 'Numbers', category: 'Pre-K', description: 'Learn numbers 1-1000 with voice', icon: '🔢', keywords: ['count', 'counting', 'numbers', 'digits', '123'], navigateTo: 'Numbers', gameId: null },
    { name: 'Shapes', category: 'Pre-K', description: 'Learn different shapes', icon: '🔷', keywords: ['shapes', 'circle', 'square', 'triangle', 'geometry'], navigateTo: 'Shapes', gameId: null },
    { name: 'Colors', category: 'Pre-K', description: 'Learn colors with examples', icon: '🎨', keywords: ['colors', 'red', 'blue', 'green', 'rainbow'], navigateTo: 'Colors', gameId: null },
    { name: 'Games', category: 'Games', description: 'Educational games hub', icon: '🎮', keywords: ['games', 'play', 'fun', 'activities'], navigateTo: 'Games', gameId: null },
    { name: 'Sudoku', category: 'Games', description: '4x4 logic puzzle', icon: '🧩', keywords: ['sudoku', 'puzzle', 'logic', 'brain'], navigateTo: 'Games', gameId: 'sudoku' },
    { name: 'Math Challenge', category: 'Games', description: 'Arithmetic practice', icon: '🔢', keywords: ['math', 'addition', 'subtraction', 'multiplication', 'division', 'arithmetic'], navigateTo: 'Games', gameId: 'math' },
    { name: 'Number Match', category: 'Games', description: 'Match numbers with dots and words', icon: '🎯', keywords: ['number', 'match', 'dots', 'counting', 'recognition'], navigateTo: 'Games', gameId: 'numbermatch' },
    { name: 'Skip Counting', category: 'Games', description: 'Count by 2s, 5s, and 10s', icon: '🔄', keywords: ['skip', 'counting', 'sequence', 'pattern', 'multiply'], navigateTo: 'Games', gameId: 'skipcounting' },
    { name: 'Compare Numbers', category: 'Games', description: 'Greater than, less than, equal', icon: '⚖️', keywords: ['compare', 'greater', 'less', 'equal', 'bigger', 'smaller'], navigateTo: 'Games', gameId: 'compare' },
    { name: 'Memory Match', category: 'Games', description: 'Find matching pairs', icon: '🎴', keywords: ['memory', 'match', 'pairs', 'concentration', 'cards'], navigateTo: 'Games', gameId: 'memory' },
    { name: 'Drawing Board', category: 'Games', description: 'Create artwork', icon: '🎨', keywords: ['draw', 'paint', 'art', 'creative', 'colors', 'brush'], navigateTo: 'Games', gameId: 'drawing' },
    { name: 'Reading', category: 'Reading', description: 'Reading practice and stories', icon: '📚', keywords: ['read', 'stories', 'books', 'comprehension'], navigateTo: 'Reading', gameId: null },
    { name: 'AI', category: 'AI', description: 'AI assistant for help', icon: '🤖', keywords: ['ai', 'assistant', 'help', 'questions', 'chat'], navigateTo: 'AI', gameId: null },
    { name: 'Random Assessment', category: 'Math', description: 'Random math problems', icon: '🎲', keywords: ['test', 'quiz', 'assessment', 'practice', 'random'], navigateTo: 'Random Assessment', gameId: null },
    { name: 'Generate Numbers', category: 'Math', description: 'Number generation tool', icon: '🔢', keywords: ['generate', 'random', 'numbers'], navigateTo: 'Generate Numbers', gameId: null },
    { name: 'Word Problems', category: 'Math', description: 'Math word problems', icon: '📝', keywords: ['word', 'problems', 'story', 'math'], navigateTo: 'Word Problems', gameId: null },
    { name: 'Counting Money', category: 'Math', description: 'Learn to count money', icon: '💰', keywords: ['money', 'coins', 'dollars', 'cents', 'currency'], navigateTo: 'Counting Money', gameId: null },
    { name: 'Assessment Flow', category: 'Assessment', description: 'Grade-level assessments', icon: '🎯', keywords: ['test', 'grade', 'assessment', 'exam', 'practice'], navigateTo: 'AssessmentsHub', gameId: null }
  ];

  // CHANGED: The "Assessments" button now triggers "AssessmentsHub"
  const navigationOptions = [
    { label: 'Home', value: 'Home', icon: '🏠' },
    { label: 'Assessments', value: 'AssessmentsHub', icon: '📝' },
    { label: 'Stories', value: 'Reading', icon: '📚' },
    { label: 'Worksheets', value: 'Worksheets', icon: '🖨️' },
    { label: 'Games', value: 'Games', icon: '🎮' },
    { label: 'AI Help', value: 'AI', icon: '🤖' }
  ];

  if (user) {
    navigationOptions.push({ label: 'Dashboard', value: 'Dashboard', icon: '📊' });
  }

  useEffect(() => {
    getLocation(setLocationState, user); 
  }, [user]);

  const handleSubjectClick = (grade, subject) => {
    setSelectedGrade(grade);
    setSelectedSubject(subject);
    setActiveSection('AssessmentFlow');
  };

  const handleNavigationClick = (option) => {
    setActiveSection(option);
    if (option === 'Dashboard') navigate('/dashboard');
    else if (option === 'Reading') navigate('/reading');
    else if (option === 'Games') navigate('/games');
    else if (option === 'AssessmentsHub') navigate('/assessments'); // NEW: Navigates to correct URL
    else if (option === 'Home') navigate('/');
  };

  const toggleSection = (section) => {
    setExpandedSection(prev => (prev === section ? null : section));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = allFeatures.filter(feature =>
      feature.name.toLowerCase().includes(lowerQuery) ||
      feature.description.toLowerCase().includes(lowerQuery) ||
      feature.category.toLowerCase().includes(lowerQuery) ||
      feature.keywords.some(keyword => keyword.includes(lowerQuery))
    );

    setSearchResults(filtered);
    setShowSearchResults(true);
  };

  const handleSearchResultClick = (feature) => {
    if (feature.gameId) {
      setSelectedGame(feature.gameId);
    } else {
      setSelectedGame(null);
    }

    handleNavigationClick(feature.navigateTo);
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
  };

  return (
    <div id="mainpage" className={activeSection === 'Home' ? 'home' : ''}>
      <div className="header">
        <div className="brand-section">
          <div className="logo-container">
            <span className="logo-icon">📚</span>
            <span className="logo-text">GoStudyLab</span>
          </div>
        </div>
        <div className="welcome-message">
          <h1>🤖 AI-Powered Learning Adventures - Where Every Student Becomes a Star! ⭐✨</h1>
        </div>
        <div className="nav-right">
          <div className="audio-toggle-container">
            <button
              className={`audio-toggle ${audioEnabled ? 'enabled' : 'disabled'}`}
              onClick={() => setAudioEnabled(!audioEnabled)}
              title={audioEnabled ? 'Audio ON - Click to disable' : 'Audio OFF - Click to enable'}
            >
              <span className="audio-icon">{audioEnabled ? '🔊' : '🔇'}</span>
            </button>
          </div>

          {isAdminUser && (
            <button
              className={`icon-button nav-toggle-button ${showStudentNav ? 'enabled' : 'disabled'}`}
              onClick={() => setShowStudentNav(!showStudentNav)}
              title={showStudentNav ? 'Hide student navigation' : 'Show student navigation'}
            >
              <span className="nav-toggle-icon">{showStudentNav ? '👁️' : '👁️‍🗨️'}</span>
            </button>
          )}

          <button
            className="icon-button search-button"
            onClick={() => setShowSearchModal(!showSearchModal)}
            title="Search"
          >
            🔍
          </button>

          <div className="profile-container">
            <button
              className="icon-button profile-button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              title="Profile"
            >
              👤
            </button>

            {showProfileMenu && (
              <>
                <div
                  className="profile-backdrop"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="profile-dropdown">
                  {user ? (
                    <>
                      <div className="profile-info">
                        <p><strong>{user.firstName} {user.lastName}</strong></p>
                        <p className="profile-email">{user.email}</p>
                        <span className={`profile-role ${user.role.toLowerCase()}`}>{user.role}</span>
                      </div>
                      <button
                        className="profile-menu-item"
                        onClick={() => {
                          setActiveSection('Dashboard');
                          navigate('/dashboard');
                          setShowProfileMenu(false);
                        }}
                      >
                        <span className="menu-icon">📊</span>
                        <span>My Dashboard</span>
                      </button>
                      <button
                        className="profile-menu-item"
                        onClick={() => {
                          setActiveSection('Pricing');
                          setShowProfileMenu(false);
                        }}
                      >
                        <span className="menu-icon">💎</span>
                        <span>Upgrade Plan</span>
                      </button>
                      <button
                        className="profile-menu-item logout-item"
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                          alert('Logged out successfully!');
                        }}
                      >
                        <span className="menu-icon">🚪</span>
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="profile-menu-item login-item"
                        onClick={() => {
                          setShowLogin(true);
                          setShowProfileMenu(false);
                        }}
                      >
                        <span className="menu-icon">🔑</span>
                        <span>User Login</span>
                      </button>
                      <button
                        className="profile-menu-item signup-item"
                        onClick={() => {
                          setShowSignup(true);
                          setShowProfileMenu(false);
                        }}
                      >
                        <span className="menu-icon">✨</span>
                        <span>Sign Up</span>
                      </button>
                      <button
                        className="profile-menu-item"
                        onClick={() => {
                          setActiveSection('Pricing');
                          setShowProfileMenu(false);
                        }}
                      >
                        <span className="menu-icon">💎</span>
                        <span>View Plans</span>
                      </button>
                      <button
                        className="profile-menu-item admin-login-item"
                        onClick={() => {
                          setShowAdminLogin(true);
                          setShowProfileMenu(false);
                        }}
                      >
                        <span className="menu-icon">👑</span>
                        <span>Admin Login</span>
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {showSearchModal && (
          <>
            <div
              className="search-modal-backdrop"
              onClick={() => {
                setShowSearchModal(false);
                setSearchQuery('');
                setShowSearchResults(false);
              }}
            />
            <div className="search-modal">
              <div className="search-modal-header">
                <h3>🔍 Search</h3>
                <button
                  className="close-modal"
                  onClick={() => {
                    setShowSearchModal(false);
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="search-modal-content">
                <input
                  type="text"
                  placeholder="Search for games, activities, subjects..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="search-modal-input"
                  autoFocus
                />

                {searchResults.length > 0 && (
                  <div className="search-results-list">
                    <div className="results-count">
                      Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                    </div>
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="search-result-item"
                        onClick={() => {
                          handleSearchResultClick(result);
                          setShowSearchModal(false);
                        }}
                      >
                        <span className="result-icon">{result.icon}</span>
                        <div className="result-info">
                          <div className="result-name">{result.name}</div>
                          <div className="result-description">{result.description}</div>
                        </div>
                        <span className="result-category">{result.category}</span>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.length === 0 && searchQuery.length >= 2 && (
                  <div className="search-no-results">
                    <span className="no-results-icon">🔍</span>
                    <p>No results found for "{searchQuery}"</p>
                    <small>Try searching for: games, numbers, colors, math, reading</small>
                  </div>
                )}

                {searchQuery.length < 2 && (
                  <div className="search-suggestions">
                    <p>💡 Popular searches:</p>
                    <div className="suggestion-chips">
                      {['Sudoku', 'Math Challenge', 'Reading', 'Alphabets', 'AI Assistant'].map((term) => (
                        <button
                          key={term}
                          className="suggestion-chip"
                          onClick={() => {
                            setSearchQuery(term);
                            handleSearch(term);
                          }}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {isGuestUser && (
        <div className="guest-mode-banner">
          <div className="guest-banner-content">
            <span className="guest-icon">⚡</span>
            <span className="guest-message">You're in Guest Mode - Sign up for unlimited access!</span>
          </div>
          <button className="guest-signup-btn" onClick={() => setShowSignup(true)}>
            Sign Up Free
          </button>
        </div>
      )}

      {showStudentNav && (
        <div className="student-nav-wrapper">
          <nav className="flat-topnav">
            {navigationOptions.map((option) => (
              <button
                key={option.value}
                className={`nav-item ${activeSection === option.value ? 'active' : ''}`}
                onClick={() => {
                  if (option.value === 'Games') {
                    setSelectedGame(null);
                  }
                  handleNavigationClick(option.value);
                }}
                title={option.label}
              >
                <span className="nav-icon">{option.icon}</span>
                <span className="nav-text">{option.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}

      {isAdminUser && !showStudentNav && activeSection === 'Home' && (
        <div className="admin-nav-info-banner">
          <span className="info-icon">ℹ️</span>
          <p>Student navigation is hidden. Click the eye icon (👁️‍🗨️) in the header to show Home, Reading, Games, and AI options.</p>
        </div>
      )}

      {activeSection === 'Home' && showStudentNav && (
        <ModernHomePage
          onNavigate={handleNavigationClick}
          gradeData={gradeData}
          onSubjectClick={handleSubjectClick}
        />
      )}

      {/* NEW: Renders the beautiful Assessments Hub when clicked */}
      {activeSection === 'AssessmentsHub' && <AssessmentsHub />}

      {activeSection === 'Dashboard' && <UnifiedDashboard />}
      {activeSection === 'Pricing' && <PricingPage />}
      {activeSection === 'AI' && <AIHub audioEnabled={audioEnabled} />}
      {prekOptions.includes(activeSection) && <EarlyEducation option={activeSection} audioEnabled={audioEnabled} />}
      {mathOptions.includes(activeSection) && <AssessmentComponents option={activeSection} audioEnabled={audioEnabled} />}
      {activeSection === 'Subscribe' && <Subscribe />}
      {activeSection === 'Contact' && <Contactus />}
      {activeSection === 'About Us' && <AboutUs />}
      {activeSection === 'AssessmentFlow' && (
        <AssessmentFlow preSelectedCategory={selectedGrade} preSelectedType={selectedSubject} audioEnabled={audioEnabled} />
      )}
      {activeSection === 'Reading' && <ReadingFlow audioEnabled={audioEnabled} />}
      {activeSection === 'Games' && <GamesHub preSelectedGame={selectedGame} audioEnabled={audioEnabled} />}

      <div style={{ clear: 'both' }}>
        <Footer onNavigate={handleNavigationClick} />
      </div>

      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
          onLoginSuccess={() => {
            setShowLogin(false);
            setActiveSection('Dashboard');
            navigate('/dashboard');
          }}
        />
      )}

      {showSignup && (
        <Signup
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}

      {showAdminLogin && (
        <Login
          onClose={() => setShowAdminLogin(false)}
          onSwitchToSignup={() => {}}
          isAdmin={true}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <AppContent />
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;