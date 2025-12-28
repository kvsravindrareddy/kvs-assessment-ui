import React, { useState, useEffect } from 'react';
import './App.css';
import './css/footer.css';

import { getLocation } from './utils/location';
import Contactus from './pages/admin/Contactus';
import AboutUs from './pages/admin/AboutUs';
import Subscribe from './pages/admin/Subscribe';
import UserManagement from './pages/admin/UserManagement';
import AIHub from './pages/ai/AIHub';
import Footer from './footer';
import EarlyEducation from './components/EarlyEducation';
import AssessmentComponents from './components/AssessmentComponents';
import LoadGradeData from './pages/config/LoadGradeData';
import News from './pages/news/News';
import AssessmentFlow from './pages/random/AssessmentFlow';
import ReadingFlow from './pages/reading/ReadingFlow';
import GamesHub from './pages/games/GamesHub';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';


function AppContent() {
  const [activeSection, setActiveSection] = useState('Home');
  const [expandedSection, setExpandedSection] = useState(null);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
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

  const prekOptions = ['Alphabets', 'Numbers', 'Shapes', 'Colors'];
  const mathOptions = ['Random Assessment', 'Generate Numbers', 'Word Problems', 'Counting Money', 'Assessment Flow'];

  // All searchable features
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
    { name: 'Assessment Flow', category: 'Assessment', description: 'Grade-level assessments', icon: '🎯', keywords: ['test', 'grade', 'assessment', 'exam', 'practice'], navigateTo: 'Assessment Flow', gameId: null }
  ];

  const navigationOptions = [
    { label: 'Home', icon: '🏠' },
    { label: 'Reading', icon: '📚' },
    { label: 'Games', icon: '🎮' },
    { label: 'AI', icon: '🤖' }
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
    // If it's a game with a specific gameId, set it
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
      {/* Header */}
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

          {/* Search Icon Button */}
          <button
            className="icon-button search-button"
            onClick={() => setShowSearchModal(!showSearchModal)}
            title="Search"
          >
            🔍
          </button>

          {/* Profile Icon Button with Dropdown */}
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
                      {isAdmin() && (
                        <button
                          className="profile-menu-item"
                          onClick={() => {
                            setActiveSection('UserManagement');
                            setShowProfileMenu(false);
                          }}
                        >
                          <span className="menu-icon">👥</span>
                          <span>Manage Users</span>
                        </button>
                      )}
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

        {/* Search Modal */}
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

      {/* Navigation Tabs */}
      <nav className="topnav">
        {navigationOptions.map((option) => (
          <button
            key={option.label}
            className={`nav-item ${activeSection === option.label ? 'active' : ''}`}
            onClick={() => {
              if (option.label === 'Games') {
                setSelectedGame(null);
              }
              handleNavigationClick(option.label);
            }}
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
      {activeSection === 'AI' && <AIHub audioEnabled={audioEnabled} />}
      {prekOptions.includes(activeSection) && <EarlyEducation option={activeSection} audioEnabled={audioEnabled} />}
      {mathOptions.includes(activeSection) && <AssessmentComponents option={activeSection} audioEnabled={audioEnabled} />}
      {activeSection === 'Subscribe' && <Subscribe />}
      {activeSection === 'Contact' && <Contactus />}
      {activeSection === 'About Us' && <AboutUs />}
      {activeSection === 'UserManagement' && <UserManagement />}
      {/* Dynamically show AssessmentFlow with selected values */}
      {activeSection === 'AssessmentFlow' && (
        <AssessmentFlow preSelectedCategory={selectedGrade} preSelectedType={selectedSubject} audioEnabled={audioEnabled} />
      )}
      {activeSection === 'Reading' && <ReadingFlow audioEnabled={audioEnabled} />}
      {activeSection === 'Games' && <GamesHub preSelectedGame={selectedGame} audioEnabled={audioEnabled} />}


      {/* Footer */}
      <div style={{ clear: 'both' }}>
        <Footer onNavigate={handleNavigationClick} />
      </div>

      {/* Authentication Modals */}
      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
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
      <AppContent />
    </AuthProvider>
  );
}

export default App;
