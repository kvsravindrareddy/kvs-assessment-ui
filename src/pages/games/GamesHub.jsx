import React, { useState, useEffect } from 'react';
import Sudoku from './Sudoku';
import MathChallenge from './MathChallenge';
import MemoryGame from './MemoryGame';
import DrawingBoard from './DrawingBoard';
import NumberMatch from './NumberMatch';
import SkipCounting from './SkipCounting';
import CompareNumbers from './CompareNumbers';
import WordBuilder from './premium/WordBuilder';
import MathRace from './premium/MathRace';
import GameOf24 from './premium/GameOf24';
import FourFours from './premium/FourFours';
import Chess from './premium/Chess';
import TicTacToe from './TicTacToe';
import SimonSays from './cognitive/SimonSays';
import PatternMatch from './cognitive/PatternMatch';
import YogaInstructor from './physical/YogaInstructor';
import DanceChallenge from './physical/DanceChallenge';
import '../../css/GamesHub.css';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import UpgradePrompt from '../../components/UpgradePrompt';
import UsageIndicator from '../../components/UsageIndicator';
import MathBalance from './MathBalance';
import NextInPattern from './cognitive/NextInPattern';
import { speakText } from '../../utils/audioHelper';

const GamesHub = ({ preSelectedGame = null, audioEnabled = true }) => {
  const { canPerformAction, trackUsage, getUpgradeMessage } = useSubscription();
  const { user } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(preSelectedGame);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Check if user is admin/super user
  const isAdminUser = user && (
    user.role === 'SUPER_ADMIN' ||
    user.role === 'DISTRICT_ADMIN' ||
    user.role === 'SCHOOL_ADMIN' ||
    user.role === 'TEACHER' ||
    user.role === 'CONTENT_CREATOR'
  );

  useEffect(() => {
    if (preSelectedGame) {
      setSelectedGame(preSelectedGame);
    }
  }, [preSelectedGame]);

  const games = [
    {
      id: 'sudoku',
      name: 'Sudoku 4x4',
      icon: '🧩',
      description: 'Logic puzzle for kids',
      color: '#FF6B6B',
      category: 'logic',
      premium: false
    },
    {
      id: 'math',
      name: 'Math Challenge',
      icon: '🔢',
      description: 'Practice arithmetic skills',
      color: '#4ECDC4',
      category: 'math',
      premium: false
    },
    {
      id: 'numbermatch',
      name: 'Number Match',
      icon: '🎯',
      description: 'Match numbers with dots and words',
      color: '#84fab0',
      category: 'math',
      premium: false
    },
    {
      id: 'skipcounting',
      name: 'Skip Counting',
      icon: '🔄',
      description: 'Count by 2s, 5s, and 10s',
      color: '#fcb69f',
      category: 'math',
      premium: false
    },
    {
      id: 'compare',
      name: 'Compare Numbers',
      icon: '⚖️',
      description: 'Greater than, less than, or equal',
      color: '#d299c2',
      category: 'math',
      premium: false
    },
    {
      id: 'memory',
      name: 'Memory Match',
      icon: '🎴',
      description: 'Find matching pairs',
      color: '#FFE66D',
      category: 'memory',
      premium: false
    },
    {
      id: 'drawing',
      name: 'Drawing Board',
      icon: '🎨',
      description: 'Create colorful artwork',
      color: '#9b59b6',
      category: 'creative',
      premium: false
    },
    {
      id: 'wordbuilder',
      name: 'Word Builder Pro',
      icon: '🔤',
      description: 'Build words from letters - Track your best scores!',
      color: '#667eea',
      category: 'language',
      premium: true
    },
    {
      id: 'mathrace',
      name: 'Math Race Pro',
      icon: '🏎️',
      description: 'Speed math competition - Beat your records!',
      color: '#f093fb',
      category: 'math',
      premium: true
    },
    {
      id: 'gameof24',
      name: 'Game of 24',
      icon: '🎯',
      description: 'Use four numbers to make 24 - Logic puzzle!',
      color: '#fa709a',
      category: 'logic',
      premium: true
    },
    {
      id: 'fourfours',
      name: 'Four Fours',
      icon: '🔢',
      description: 'Use four 4s to make numbers 1-20 - Mind bender!',
      color: '#4facfe',
      category: 'logic',
      premium: true
    },
    {
      id: 'chess',
      name: 'Chess Master',
      icon: '♟️',
      description: 'Classic chess - Play vs AI or friends!',
      color: '#8b4513',
      category: 'strategy',
      premium: true
    },
    {
      id: 'tictactoe',
      name: 'Tic-Tac-Toe',
      icon: '❌',
      description: 'Classic 3-in-a-row strategy game!',
      color: '#e74c3c',
      category: 'strategy',
      premium: false
    },
    {
      id: 'simonsays',
      name: 'Simon Says',
      icon: '🧠',
      description: 'Memory sequence game - Train your focus!',
      color: '#667eea',
      category: 'cognitive',
      premium: false
    },
    {
      id: 'patternmatch',
      name: 'Pattern Match',
      icon: '🎯',
      description: 'Visual pattern recognition - Beat the clock!',
      color: '#764ba2',
      category: 'cognitive',
      premium: false
    },
    {
      id: 'yoga',
      name: 'AI Yoga Instructor',
      icon: '🧘',
      description: 'Guided yoga poses - Relax and stretch!',
      color: '#fa8bff',
      category: 'physical',
      premium: false
    },
    {
      id: 'dance',
      name: 'Dance Challenge',
      icon: '💃',
      description: 'Follow the dance moves - Get active!',
      color: '#2bd2ff',
      category: 'physical',
      premium: false
    },
    {
      id: 'math-balance',
      name: 'Math Balance Scale',
      icon: '⚖️',
      description: 'Balance the scale to solve equations! Great for visual math.',
      color: '#4CAF50',
      category: 'math',
      premium: false
    },
    {
      id: 'next-pattern',
      name: 'What Comes Next?',
      icon: '🧩',
      description: 'Find the missing puzzle piece in the visual sequence!',
      color: '#FF9800',
      category: 'cognitive',
      premium: false
    },
  ];

  const categories = [
    { id: 'all', name: 'All Games', icon: '🎮', color: '#667eea' },
    { id: 'math', name: 'Math Games', icon: '🔢', color: '#4ECDC4' },
    { id: 'logic', name: 'Logic Puzzles', icon: '🧩', color: '#FF6B6B' },
    { id: 'strategy', name: 'Strategy', icon: '♟️', color: '#8b4513' },
    { id: 'cognitive', name: 'Cognitive Focus', icon: '🧠', color: '#667eea' },
    { id: 'physical', name: 'Physical Activity', icon: '🏃', color: '#fa8bff' },
    { id: 'language', name: 'Language', icon: '🔤', color: '#667eea' },
    { id: 'memory', name: 'Memory', icon: '🃏', color: '#FFE66D' },
    { id: 'creative', name: 'Creative', icon: '🎨', color: '#9b59b6' }
  ];

  const filteredGames = selectedCategory === 'all'
    ? games
    : games.filter(game => game.category === selectedCategory);

  const handleGameSelect = (game) => {
    speakText(`Let's play ${game.name}`, audioEnabled);
    
    // Any logged-in user can access Premium Games
    if (game.premium && !isAdminUser) {
      const isUserLoggedIn = !!user;

      if (!isUserLoggedIn) {
        alert('🌟 Premium Game! Please log in or sign up for a free account to access this game!');
        setShowUpgradeModal(true);
        return;
      }
    }
    setSelectedGame(game.id);
  };

  if (selectedGame) {
    const activeGameData = games.find(g => g.id === selectedGame);

    return (
      // Optimized Container: Normal flow, but with protective padding and auto-centering
      <div className="active-game-wrapper" style={{
        minHeight: 'calc(100vh - 80px)', // Ensures it fills the screen gracefully
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '25px', // Prevents it from touching the sticky header
        paddingBottom: '40px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        
        {/* Innovative Top Alignment Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '0 20px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <button 
            className="back-button" 
            onClick={() => setSelectedGame(null)} 
            style={{ margin: 0, padding: '8px 20px' }}
          >
            ← Back to Games
          </button>

          {/* Symmetrical Game Data Badge */}
          {activeGameData && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 18px',
              backgroundColor: activeGameData.color + '15', // Transparent tint
              border: `2px solid ${activeGameData.color}`,
              borderRadius: '30px',
              fontWeight: 'bold',
              color: '#1e293b',
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
            }}>
              <span style={{ fontSize: '1.4rem' }}>{activeGameData.icon}</span>
              {activeGameData.name}
            </div>
          )}
        </div>

        {/* Game Play Area - Flex column to perfectly center the child components */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          padding: '0 10px'
        }}>
          {selectedGame === 'sudoku' && <Sudoku />}
          {selectedGame === 'math' && <MathChallenge />}
          {selectedGame === 'numbermatch' && <NumberMatch />}
          {selectedGame === 'skipcounting' && <SkipCounting />}
          {selectedGame === 'compare' && <CompareNumbers />}
          {selectedGame === 'memory' && <MemoryGame />}
          {selectedGame === 'drawing' && <DrawingBoard />}
          {selectedGame === 'wordbuilder' && <WordBuilder />}
          {selectedGame === 'mathrace' && <MathRace />}
          {selectedGame === 'gameof24' && <GameOf24 />}
          {selectedGame === 'fourfours' && <FourFours />}
          {selectedGame === 'chess' && <Chess />}
          {selectedGame === 'tictactoe' && <TicTacToe />}
          {selectedGame === 'simonsays' && <SimonSays />}
          {selectedGame === 'patternmatch' && <PatternMatch />}
          {selectedGame === 'yoga' && <YogaInstructor />}
          {selectedGame === 'dance' && <DanceChallenge />}
          {selectedGame === 'math-balance' && <MathBalance audioEnabled={audioEnabled} />}
          {selectedGame === 'next-pattern' && <NextInPattern audioEnabled={audioEnabled} />}
        </div>
      </div>
    );
  }

  return (
    <div className="games-hub-container">
      {!selectedGame && <UsageIndicator type="game" />}

      <div className="games-hub-header">
        <h1>Learning Games</h1>
        <p>Choose a category to browse games!</p>
      </div>

      <div className="category-index">
        <h2 className="category-index-title">Game Categories</h2>
        <div className="category-nav">
          {categories.map((category) => {
            const count = category.id === 'all'
              ? games.length
              : games.filter(g => g.category === category.id).length;
            return (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(category.id);
                  speakText(category.name, audioEnabled);
                }}
                style={{ '--category-color': category.color }}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
                <span className="category-count">{count} games</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="games-index-table">
        <h3 className="index-title">
          {selectedCategory === 'all' ? 'All Games' : categories.find(c => c.id === selectedCategory)?.name}
        </h3>
        <div className="index-list">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className={`index-item ${game.premium ? 'premium-index' : ''}`}
              onClick={() => {
                if (!isAdminUser && !canPerformAction('game')) {
                  setShowUpgradeModal(true);
                  return;
                }
                if (!isAdminUser) trackUsage('game');
                handleGameSelect(game);
              }}
            >
              <span className="index-icon">{game.icon}</span>
              <span className="index-name">{game.name}</span>
              {game.premium && <span className="premium-badge">⭐ Premium</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="games-section">
        <h3 className="section-title">
          {selectedCategory === 'all' ? 'Browse All Games' : `${categories.find(c => c.id === selectedCategory)?.name} Collection`}
        </h3>
        <div className="games-grid">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className={`game-card ${game.premium ? 'premium-card' : ''}`}
              onClick={() => {
                if (!isAdminUser && !canPerformAction('game')) {
                  setShowUpgradeModal(true);
                  return;
                }
                if (!isAdminUser) trackUsage('game');
                handleGameSelect(game);
              }}
              style={{ '--game-color': game.color }}
            >
              {game.premium && <div className="premium-star">⭐</div>}
              <div className="game-icon">{game.icon}</div>
              <h3 className="game-name">{game.name}</h3>
              <p className="game-description">{game.description}</p>
              <button className="play-button">Play Now</button>
            </div>
          ))}
        </div>
      </div>

      {showUpgradeModal && (
        <UpgradePrompt
          message={getUpgradeMessage('game')}
          showModal
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={() => window.location.href = '#Pricing'}
        />
      )}
    </div>
  );
};

export default GamesHub;