import React, { useState, useEffect } from 'react';
import './Cognitive.css';

const PatternMatch = ({ audioEnabled = true }) => {
  const [pattern, setPattern] = useState([]);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [difficulty, setDifficulty] = useState('easy');
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);

  const shapes = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '⭐', '❤️', '🔷', '🔶'];

  const difficultySettings = {
    easy: { patternLength: 3, optionsCount: 4, timeLimit: 40 },
    medium: { patternLength: 4, optionsCount: 6, timeLimit: 30 },
    hard: { patternLength: 5, optionsCount: 8, timeLimit: 20 }
  };

  // Timer
  useEffect(() => {
    if (gameStarted && !gameOver && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted) {
      endGame();
    }
  }, [timeLeft, gameStarted, gameOver]);

  // Generate new pattern
  const generatePattern = () => {
    const settings = difficultySettings[difficulty];
    const patternLength = settings.patternLength + Math.floor(level / 3);

    const newPattern = [];
    for (let i = 0; i < patternLength; i++) {
      newPattern.push(shapes[Math.floor(Math.random() * shapes.length)]);
    }

    setPattern(newPattern);
    generateOptions(newPattern, settings.optionsCount);
  };

  // Generate answer options
  const generateOptions = (correctPattern, count) => {
    const opts = [correctPattern];

    while (opts.length < count) {
      const wrongPattern = correctPattern.map(() =>
        shapes[Math.floor(Math.random() * shapes.length)]
      );

      // Make sure it's different from correct answer
      if (JSON.stringify(wrongPattern) !== JSON.stringify(correctPattern)) {
        opts.push(wrongPattern);
      }
    }

    // Shuffle options
    setOptions(opts.sort(() => Math.random() - 0.5));
  };

  // Start game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setStreak(0);
    setTimeLeft(difficultySettings[difficulty].timeLimit);
    setFeedback('');
    generatePattern();
  };

  // Handle answer selection
  const handleAnswer = (selectedPattern) => {
    if (JSON.stringify(selectedPattern) === JSON.stringify(pattern)) {
      // Correct!
      const points = level * 10 + streak * 5;
      setScore(prev => prev + points);
      setLevel(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        return newStreak;
      });
      setFeedback('✅ Correct! +' + points);

      if (audioEnabled) playSound(true);

      setTimeout(() => {
        setFeedback('');
        generatePattern();
      }, 1000);
    } else {
      // Wrong!
      setStreak(0);
      setFeedback('❌ Wrong! Try again!');

      if (audioEnabled) playSound(false);

      setTimeout(() => {
        setFeedback('');
      }, 1500);
    }
  };

  // End game
  const endGame = () => {
    setGameOver(true);
    setGameStarted(false);
  };

  // Play sound
  const playSound = (isCorrect) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = isCorrect ? 800 : 200;
    oscillator.type = isCorrect ? 'sine' : 'sawtooth';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  // Setup screen
  if (!gameStarted && !gameOver) {
    return (
      <div className="cognitive-container">
        <div className="cognitive-intro">
          <h1 className="cognitive-title">🎯 Pattern Match</h1>
          <p className="cognitive-description">
            Remember the pattern and find the matching one! Train visual memory!
          </p>

          <div className="demo-pattern">
            <div className="pattern-display demo">
              <div className="pattern-item">🔴</div>
              <div className="pattern-item">🔵</div>
              <div className="pattern-item">🟢</div>
            </div>
          </div>

          <div className="difficulty-selector">
            <h3>Choose Difficulty:</h3>
            <div className="difficulty-buttons">
              <button
                className={`diff-btn ${difficulty === 'easy' ? 'active' : ''}`}
                onClick={() => setDifficulty('easy')}
              >
                🟢 Easy<br/><small>3 shapes, 40s</small>
              </button>
              <button
                className={`diff-btn ${difficulty === 'medium' ? 'active' : ''}`}
                onClick={() => setDifficulty('medium')}
              >
                🟡 Medium<br/><small>4 shapes, 30s</small>
              </button>
              <button
                className={`diff-btn ${difficulty === 'hard' ? 'active' : ''}`}
                onClick={() => setDifficulty('hard')}
              >
                🔴 Hard<br/><small>5 shapes, 20s</small>
              </button>
            </div>
          </div>

          <div className="rules-box">
            <h3>📋 How to Play:</h3>
            <ul>
              <li>Look at the pattern shown at the top</li>
              <li>Find the matching pattern from options below</li>
              <li>Click the correct pattern to score points</li>
              <li>Build streaks for bonus points!</li>
              <li>Beat the clock - time is running!</li>
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
          <h1 className="game-over-title">Time's Up!</h1>
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
              <span className="stat-label">Best Streak</span>
              <span className="stat-value">{bestStreak}</span>
            </div>
          </div>

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
    <div className="cognitive-container pattern-game">
      <div className="pattern-header">
        <div className="pattern-stats">
          <div className="stat-item">
            <span className="stat-label">⏱️ Time</span>
            <span className="stat-value">{timeLeft}s</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">📊 Score</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">🎯 Level</span>
            <span className="stat-value">{level}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">🔥 Streak</span>
            <span className="stat-value">{streak}</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`pattern-feedback ${feedback.includes('✅') ? 'correct' : 'wrong'}`}>
          {feedback}
        </div>
      )}

      <div className="pattern-display-container">
        <h3 className="pattern-title">Remember this pattern:</h3>
        <div className="pattern-display">
          {pattern.map((shape, index) => (
            <div key={index} className="pattern-item">
              {shape}
            </div>
          ))}
        </div>
      </div>

      <div className="pattern-options-container">
        <h3 className="pattern-title">Find the matching pattern:</h3>
        <div className="pattern-options">
          {options.map((option, index) => (
            <div
              key={index}
              className="pattern-option"
              onClick={() => handleAnswer(option)}
            >
              {option.map((shape, shapeIndex) => (
                <div key={shapeIndex} className="pattern-item-small">
                  {shape}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatternMatch;
