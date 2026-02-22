import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './PremiumGames.css';

const WordBuilder = ({ audioEnabled = true }) => {
  const { user } = useAuth();

  // Check if user is admin/super user
  const isAdminUser = user && (
    user.role === 'SUPER_ADMIN' ||
    user.role === 'DISTRICT_ADMIN' ||
    user.role === 'SCHOOL_ADMIN' ||
    user.role === 'TEACHER' ||
    user.role === 'CONTENT_CREATOR'
  );
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentLetters, setCurrentLetters] = useState([]);
  const [formedWord, setFormedWord] = useState('');
  const [validWords, setValidWords] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [coins, setCoins] = useState(0);

  const wordLists = {
    1: ['CAT', 'DOG', 'BAT', 'RAT', 'HAT', 'MAT'],
    2: ['STAR', 'MOON', 'TREE', 'FISH', 'BIRD', 'LION'],
    3: ['APPLE', 'HOUSE', 'WATER', 'CHAIR', 'TABLE', 'PHONE'],
    4: ['RAINBOW', 'MONSTER', 'DIAMOND', 'CRYSTAL', 'BALLOON'],
    5: ['ELEPHANT', 'SUNSHINE', 'MOUNTAIN', 'TREASURE', 'DINOSAUR']
  };

  const generateLetters = () => {
    const words = wordLists[level] || wordLists[1];
    const targetWord = words[Math.floor(Math.random() * words.length)];
    const letters = targetWord.split('').sort(() => Math.random() - 0.5);

    // Add some extra random letters
    const extras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 3; i++) {
      letters.push(extras[Math.floor(Math.random() * extras.length)]);
    }

    return letters.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [gameStarted, timeLeft]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setValidWords([]);
    setTimeLeft(60);
    setCurrentLetters(generateLetters());
    setFormedWord('');
  };

  const handleLetterClick = (letter, index) => {
    if (audioEnabled) playSound('click');
    setFormedWord(prev => prev + letter);
    const newLetters = [...currentLetters];
    newLetters[index] = null;
    setCurrentLetters(newLetters);
  };

  const clearWord = () => {
    setFormedWord('');
    setCurrentLetters(generateLetters());
  };

  const submitWord = () => {
    const word = formedWord.toUpperCase();
    const allWords = Object.values(wordLists).flat();

    if (allWords.includes(word) && !validWords.includes(word)) {
      const points = word.length * 10 * level;
      setScore(prev => prev + points);
      setValidWords(prev => [...prev, word]);
      setCoins(prev => prev + word.length);

      if (audioEnabled) playSound('success');

      // Save to backend
      saveGameProgress({
        gameType: 'word-builder',
        score: score + points,
        level,
        coins: coins + word.length
      });
    } else {
      if (audioEnabled) playSound('error');
    }

    clearWord();
  };

  const endGame = () => {
    setGameStarted(false);
    setGameOver(true);

    // Save final score
    saveGameHistory({
      userId: user?.id,
      gameType: 'word-builder',
      score,
      level,
      duration: 60,
      coinsEarned: coins,
      gameData: { validWords, wordsCount: validWords.length }
    });
  };

  const playSound = (type) => {
    // Sound effects implementation
    const audio = new Audio();
    const sounds = {
      click: 'data:audio/wav;base64,...',
      success: 'data:audio/wav;base64,...',
      error: 'data:audio/wav;base64,...'
    };
    audio.src = sounds[type];
    audio.play().catch(() => {});
  };

  const saveGameProgress = async (data) => {
    try {
      await fetch('http://localhost:5001/api/games/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };

  const saveGameHistory = async (data) => {
    try {
      await fetch('http://localhost:5001/api/games/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.error('Failed to save history:', err);
    }
  };

  if (!gameStarted && !gameOver) {
    return (
      <div className="premium-game-container">
        <div className="game-intro">
          <h1 className="game-title">🔤 Word Builder</h1>
          <p className="game-description">
            Build as many words as you can from the given letters in 60 seconds!
          </p>
          <div className="level-selector">
            <h3>Choose Level:</h3>
            {[1, 2, 3, 4, 5].map(l => (
              <button
                key={l}
                className={`level-btn ${level === l ? 'active' : ''}`}
                onClick={() => setLevel(l)}
              >
                Level {l}
              </button>
            ))}
          </div>
          <button className="start-game-btn" onClick={startGame}>
            🎮 Start Game
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="premium-game-container">
        <div className="game-over">
          <h1 className="game-over-title">🎉 Game Over!</h1>
          <div className="final-stats">
            <div className="stat-card">
              <span className="stat-label">Score</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Words Found</span>
              <span className="stat-value">{validWords.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Coins Earned</span>
              <span className="stat-value">🪙 {coins}</span>
            </div>
          </div>
          <div className="words-list">
            <h3>Your Words:</h3>
            <div className="words-grid">
              {validWords.map((word, idx) => (
                <span key={idx} className="found-word">{word}</span>
              ))}
            </div>
          </div>
          <button className="play-again-btn" onClick={startGame}>
            🔄 Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-game-container">
      <div className="game-header">
        <div className="game-stats">
          <span className="stat">⏱️ {timeLeft}s</span>
          <span className="stat">⭐ {score}</span>
          <span className="stat">🪙 {coins}</span>
          <span className="stat">📊 Level {level}</span>
        </div>
      </div>

      <div className="game-board">
        <div className="word-display">
          <div className="formed-word">
            {formedWord || 'Tap letters to form words'}
          </div>
          <div className="word-actions">
            <button className="action-btn clear" onClick={clearWord}>
              🔄 Clear
            </button>
            <button className="action-btn submit" onClick={submitWord}>
              ✅ Submit
            </button>
          </div>
        </div>

        <div className="letters-grid">
          {currentLetters.map((letter, idx) => (
            letter && (
              <button
                key={idx}
                className="letter-tile"
                onClick={() => handleLetterClick(letter, idx)}
              >
                {letter}
              </button>
            )
          ))}
        </div>

        <div className="valid-words-display">
          <h4>Words Found ({validWords.length}):</h4>
          <div className="words-list-game">
            {validWords.map((word, idx) => (
              <span key={idx} className="valid-word-chip">{word}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordBuilder;
