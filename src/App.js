import React, { useState, useEffect, lazy, Suspense } from 'react';
import './App.css';
import './css/styles.css';
import './css/footer.css';
import kivoLogo from './assets/kivo.png';

import { getLocation } from './utils/location';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { useLocation, useNavigate } from 'react-router-dom';
import FlashMessages from './components/FlashMessages';
import StreakWidget from './components/StreakWidget';
import Footer from './footer';

// Eagerly loaded: always visible shell components
import ErrorReportButton from './components/ErrorReportButton';
import IdeaSubmitButton from './components/IdeaSubmitButton';

// Lazy-loaded: section-specific pages (split into separate JS chunks)
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const UnifiedDashboard = lazy(() => import('./pages/dashboard/UnifiedDashboard'));
const PricingPage = lazy(() => import('./pages/subscription/PricingPage'));
const ModernHomePage = lazy(() => import('./components/ModernHomePage'));
const AIHub = lazy(() => import('./pages/ai/AIHub'));
const AssessmentsHub = lazy(() => import('./pages/assessments/AssessmentsHub'));
const WorksheetsHub = lazy(() => import('./pages/worksheets/WorksheetsHub'));
const ReadingFlow = lazy(() => import('./pages/reading/ReadingFlow'));
const GamesHub = lazy(() => import('./pages/games/GamesHub'));
const AssessmentFlow = lazy(() => import('./pages/random/AssessmentFlow'));
const EarlyEducation = lazy(() => import('./components/EarlyEducation'));
const AssessmentComponents = lazy(() => import('./components/AssessmentComponents'));
const EnhancedSearch = lazy(() => import('./components/EnhancedSearch'));
const StreakModal = lazy(() => import('./components/StreakModal'));

// Lazy-loaded: admin/info pages (rarely visited on initial load)
const Contactus = lazy(() => import('./pages/admin/Contactus'));
const AboutUs = lazy(() => import('./pages/admin/AboutUs'));
const Subscribe = lazy(() => import('./pages/admin/Subscribe'));
const PrivacyPolicy = lazy(() => import('./pages/admin/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/admin/TermsOfService'));
const OurInnovation = lazy(() => import('./pages/admin/OurInnovation'));
const HowItWorks = lazy(() => import('./pages/admin/HowItWorks'));
const FAQ = lazy(() => import('./pages/admin/FAQ'));
const SuccessStories = lazy(() => import('./pages/admin/SuccessStories'));
const PlatformStats = lazy(() => import('./pages/admin/PlatformStats'));
const SystemHealth = lazy(() => import('./pages/admin/SystemHealth'));
const Leaderboard = lazy(() => import('./pages/admin/Leaderboard'));
const Rewards = lazy(() => import('./pages/admin/Rewards'));
const IdeaHub = lazy(() => import('./pages/admin/IdeaHub'));
const ReportBug = lazy(() => import('./pages/admin/ReportBug'));

// Shared fallback for lazy sections
const SectionLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', fontSize: '1.2rem', color: '#64748b' }}>
    Loading...
  </div>
);

// Helper: wraps element in Suspense with the section loader fallback
const S = (element) => <Suspense fallback={<SectionLoader />}>{element}</Suspense>;

function AppContent() {
  const [activeSection, setActiveSection] = useState('Home');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/reading') || path.includes('/stories')) setActiveSection('Reading');
    else if (path.includes('/dashboard')) setActiveSection('Dashboard');
    else if (path.includes('/games')) setActiveSection('Games');
    else if (path.includes('/assessments') || path.includes('/it-learning-hub') || path.includes('/science-lab') || path.includes('/grammar-hub') || path.includes('/vocabulary-hub')) {
        setActiveSection('AssessmentsHub');
    }
    else if (path.includes('/ai-hub')) setActiveSection('AI');
    else if (path.includes('/worksheets')) setActiveSection('Worksheets');
    else if (path === '/' && activeSection !== 'Home') setActiveSection('Home');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const [, setLocationState] = useState({ latitude: null, longitude: null });
  const gradeData = {};
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const { user, logout } = useAuth();

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
    else if (option === 'AI') navigate('/ai-hub');
    else if (option === 'Worksheets') navigate('/worksheets');
    else if (option === 'Home') navigate('/');
  };

  const handleSearchResultClick = (feature) => {
    if (feature.gameId) {
      setSelectedGame(feature.gameId);
    } else {
      setSelectedGame(null);
    }

    handleNavigationClick(feature.navigateTo);
  };

  return (
    <div id="mainpage" className={activeSection === 'Home' ? 'home' : ''}>
      <FlashMessages />
      <div className="header">
        <div className="brand-section">
          <div className="logo-container">
            <img src={kivoLogo} alt="KiVO Learning" className="logo-image" width="60" height="60" style={{height: '60px', width: 'auto', backgroundColor: 'transparent', border: 'none'}} />
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

          {user && (
            <StreakWidget onStreakClick={() => setShowStreakModal(true)} />
          )}

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
          <EnhancedSearch
            allFeatures={allFeatures}
            onResultClick={(feature) => {
              handleSearchResultClick(feature);
              setShowSearchModal(false);
            }}
            onClose={() => setShowSearchModal(false)}
            user={user}
          />
        )}

        <StreakModal
          isOpen={showStreakModal}
          onClose={() => setShowStreakModal(false)}
        />
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

      {/* Modern Breadcrumb Navigation for Dashboard */}
      {activeSection === 'Dashboard' && (
        <div className="breadcrumb-nav">
          <button
            className="breadcrumb-item"
            onClick={() => {
              setActiveSection('Home');
              navigate('/');
            }}
          >
            <span className="breadcrumb-icon">🏠</span>
            <span>Home</span>
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-item active">
            <span className="breadcrumb-icon">📊</span>
            <span>Dashboard</span>
          </span>
        </div>
      )}

      {showStudentNav && activeSection !== 'Dashboard' && (
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

      {activeSection === 'Home' && showStudentNav && S(
        <ModernHomePage
          onNavigate={handleNavigationClick}
          gradeData={gradeData}
          onSubjectClick={handleSubjectClick}
        />
      )}

      {/* Renders the Assessments Hub when clicked */}
      {activeSection === 'AssessmentsHub' && S(<AssessmentsHub />)}
      {activeSection === 'Worksheets' && S(<WorksheetsHub />)}

      {activeSection === 'Dashboard' && S(<UnifiedDashboard />)}
      {activeSection === 'Pricing' && S(<PricingPage />)}
      {activeSection === 'AI' && S(<AIHub audioEnabled={audioEnabled} />)}
      {prekOptions.includes(activeSection) && S(<EarlyEducation option={activeSection} audioEnabled={audioEnabled} />)}
      {mathOptions.includes(activeSection) && S(<AssessmentComponents option={activeSection} audioEnabled={audioEnabled} />)}
      {activeSection === 'Subscribe' && S(<Subscribe />)}
      {activeSection === 'Contact' && S(<Contactus />)}
      {activeSection === 'About Us' && S(<AboutUs />)}
      {activeSection === 'Our Innovation' && S(<OurInnovation />)}
      {activeSection === 'How It Works' && S(<HowItWorks />)}
      {activeSection === 'FAQ' && S(<FAQ />)}
      {activeSection === 'Success Stories' && S(<SuccessStories />)}
      {activeSection === 'Platform Stats' && S(<PlatformStats />)}
      {activeSection === 'System Health' && S(<SystemHealth />)}
      {activeSection === 'Leaderboard' && S(<Leaderboard />)}
      {activeSection === 'Rewards' && S(<Rewards />)}
      {activeSection === 'Idea Hub' && S(<IdeaHub />)}
      {activeSection === 'Report Bug' && S(<ReportBug />)}
      {activeSection === 'Privacy' && S(<PrivacyPolicy />)}
      {activeSection === 'Terms' && S(<TermsOfService />)}
      {activeSection === 'AssessmentFlow' && S(
        <AssessmentFlow preSelectedCategory={selectedGrade} preSelectedType={selectedSubject} audioEnabled={audioEnabled} />
      )}
      {activeSection === 'Reading' && S(<ReadingFlow audioEnabled={audioEnabled} />)}
      {activeSection === 'Games' && S(<GamesHub preSelectedGame={selectedGame} audioEnabled={audioEnabled} />)}

      <div style={{ clear: 'both' }}>
        <Footer onNavigate={handleNavigationClick} />
      </div>

      {showLogin && S(
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

      {showSignup && S(
        <Signup
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}

      {showAdminLogin && S(
        <Login
          onClose={() => setShowAdminLogin(false)}
          onSwitchToSignup={() => {}}
          isAdmin={true}
        />
      )}

      {/* Floating Error Report Button - Always visible */}
      <ErrorReportButton />

      {/* Floating Idea Submit Button - Always visible */}
      <IdeaSubmitButton />
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