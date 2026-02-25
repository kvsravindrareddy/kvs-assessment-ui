import React, { useState, useEffect, useRef } from 'react';
import './Cognitive.css';

const SimonSays = ({ audioEnabled = true }) => {
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('simonHighScore') || '0');
  });
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [speed, setSpeed] = useState('normal'); // normal, fast, slow

  const colors = ['red', 'blue', 'green', 'yellow'];
  const sounds = {
    red: 440,    // A4
    blue: 523,   // C5
    green: 587,  // D5
    yellow: 659  // E5
  };

  // Play tone
  const playTone = (color, duration = 400) => {
    if (!audioEnabled) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = sounds[color];
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  };

  // Start new game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setSequence([]);
    setUserSequence([]);
    nextRound([]);
  };

  // Add next color to sequence
  const nextRound = (currentSequence) => {
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    const newSequence = [...currentSequence, newColor];
    setSequence(newSequence);
    setUserSequence([]);

    setTimeout(() => {
      playSequence(newSequence);
    }, 500);
  };

  // Play the sequence
  const playSequence = async (seq) => {
    setIsPlaying(true);
    const speedDelay = speed === 'slow' ? 1000 : speed === 'fast' ? 400 : 700;

    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => {
        setTimeout(() => {
          lightUpButton(seq[i]);
          resolve();
        }, speedDelay);
      });
    }

    setIsPlaying(false);
  };

  // Light up button
  const lightUpButton = (color) => {
    setActiveButton(color);
    playTone(color);

    setTimeout(() => {
      setActiveButton(null);
    }, 300);
  };

  // Handle user click
  const handleColorClick = (color) => {
    if (isPlaying || gameOver) return;

    lightUpButton(color);

    const newUserSequence = [...userSequence, color];
    setUserSequence(newUserSequence);

    // Check if user input is correct
    const currentIndex = userSequence.length;
    if (color !== sequence[currentIndex]) {
      // Wrong!
      handleGameOver();
      return;
    }

    // Check if user completed the sequence
    if (newUserSequence.length === sequence.length) {
      // Correct sequence completed!
      const newScore = score + sequence.length * 10;
      setScore(newScore);

      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('simonHighScore', newScore.toString());
      }

      setLevel(level + 1);

      // Next round after delay
      setTimeout(() => {
        nextRound(sequence);
      }, 1000);
    }
  };

  // Handle game over
  const handleGameOver = () => {
    setGameOver(true);
    setGameStarted(false);

    // Play error sound
    if (audioEnabled) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 200;
      oscillator.type = 'sawtooth';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  // Setup screen
  if (!gameStarted && !gameOver) {
    return (
      <div className="cognitive-container">
        <div className="cognitive-intro">
          <h1 className="cognitive-title">🧠 Simon Says</h1>
          <p className="cognitive-description">
            Watch the pattern and repeat it! Train your memory and focus!
          </p>

          <div className="demo-board">
            <div className="simon-grid demo">
              <div className="simon-button red demo"></div>
              <div className="simon-button blue demo"></div>
              <div className="simon-button green demo"></div>
              <div className="simon-button yellow demo"></div>
            </div>
          </div>

          <div className="speed-selector">
            <h3>Choose Speed:</h3>
            <div className="speed-buttons">
              <button
                className={`speed-btn ${speed === 'slow' ? 'active' : ''}`}
                onClick={() => setSpeed('slow')}
              >
                🐢 Slow<br/><small>1s delay</small>
              </button>
              <button
                className={`speed-btn ${speed === 'normal' ? 'active' : ''}`}
                onClick={() => setSpeed('normal')}
              >
                🚶 Normal<br/><small>0.7s delay</small>
              </button>
              <button
                className={`speed-btn ${speed === 'fast' ? 'active' : ''}`}
                onClick={() => setSpeed('fast')}
              >
                🏃 Fast<br/><small>0.4s delay</small>
              </button>
            </div>
          </div>

          <div className="high-score-display">
            <h3>🏆 High Score: {highScore}</h3>
          </div>

          <div className="rules-box">
            <h3>📋 How to Play:</h3>
            <ul>
              <li>Watch the pattern Simon shows</li>
              <li>Repeat the pattern by clicking colors</li>
              <li>Each round adds one more step</li>
              <li>Game ends if you make a mistake!</li>
            </ul>
          </div>

          <button className="start-btn cognitive" onClick={startGame}>
            🎮 Start Game
          </button>
        </div>
      </div>
    );
  }

  // Game over screen
  if (gameOver) {
    return (
      <div className="cognitive-container">
        <div className="cognitive-game-over">
          <h1 className="game-over-title">Game Over!</h1>
          <div className="final-stats">
            <div className="stat-large">
              <span className="stat-label">Final Score</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat-large">
              <span className="stat-label">Level Reached</span>
              <span className="stat-value">{level}</span>
            </div>
            <div className="stat-large">
              <span className="stat-label">Sequence Length</span>
              <span className="stat-value">{sequence.length}</span>
            </div>
          </div>

          {score >= highScore && score > 0 && (
            <div className="new-record">
              🎉 New High Score! 🎉
            </div>
          )}

          <div className="game-over-buttons">
            <button className="play-again-btn" onClick={startGame}>
              🔄 Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div className="cognitive-container simon-game">
      <div className="simon-header">
        <div className="simon-stats">
          <div className="stat-item">
            <span className="stat-label">Level</span>
            <span className="stat-value">{level}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">High Score</span>
            <span className="stat-value">{highScore}</span>
          </div>
        </div>
      </div>

      <div className="simon-status">
        {isPlaying ? (
          <span className="status-watching">👀 Watch carefully!</span>
        ) : (
          <span className="status-your-turn">
            🎯 Your turn! ({userSequence.length}/{sequence.length})
          </span>
        )}
      </div>

      <div className="simon-board">
        <div className="simon-grid">
          {colors.map((color) => (
            <button
              key={color}
              className={`simon-button ${color} ${
                activeButton === color ? 'active' : ''
              }`}
              onClick={() => handleColorClick(color)}
              disabled={isPlaying}
            >
              <span className="button-label">{color.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="simon-sequence-display">
        <h4>Pattern to remember:</h4>
        <div className="sequence-dots">
          {sequence.map((color, index) => (
            <div
              key={index}
              className={`sequence-dot ${color} ${
                index < userSequence.length ? 'completed' : ''
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimonSays;
