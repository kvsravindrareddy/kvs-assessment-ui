import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './PremiumGames.css';

const GameOf24 = ({ audioEnabled = true }) => {
  const { user } = useAuth();
  const [numbers, setNumbers] = useState([]);
  const [userExpression, setUserExpression] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [solved, setSolved] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [difficulty, setDifficulty] = useState('medium');

  const generateNumbers = () => {
    let nums;
    switch(difficulty) {
      case 'easy':
        // Easier combinations
        nums = [
          [2, 3, 4, 5],
          [1, 2, 3, 8],
          [2, 2, 6, 6],
          [3, 3, 4, 4],
          [1, 4, 5, 6]
        ];
        break;
      case 'medium':
        nums = [
          [4, 8, 2, 1],
          [3, 7, 5, 2],
          [6, 9, 1, 2],
          [8, 4, 3, 1],
          [5, 5, 3, 1]
        ];
        break;
      case 'hard':
        nums = [
          [1, 3, 4, 6],
          [2, 3, 5, 12],
          [3, 3, 8, 8],
          [1, 5, 5, 5],
          [2, 7, 7, 11]
        ];
        break;
      default:
        nums = [[4, 8, 2, 1]];
    }
    return nums[Math.floor(Math.random() * nums.length)];
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
    setSolved(0);
    setTimeLeft(60);
    setUserExpression('');
    setFeedback('');
    setNumbers(generateNumbers());
  };

  const evaluateExpression = (expr) => {
    try {
      // Replace × and ÷ with * and /
      expr = expr.replace(/×/g, '*').replace(/÷/g, '/');

      // Check if all four numbers are used
      const usedNumbers = expr.match(/\d+/g).map(Number).sort();
      const requiredNumbers = [...numbers].sort();

      if (usedNumbers.length !== 4 ||
          !usedNumbers.every((num, idx) => num === requiredNumbers[idx])) {
        return { valid: false, message: 'You must use all four numbers exactly once!' };
      }

      // Evaluate the expression
      const result = eval(expr);

      if (Math.abs(result - 24) < 0.001) {
        return { valid: true, result: 24 };
      } else {
        return { valid: false, message: `That equals ${result.toFixed(2)}, not 24!` };
      }
    } catch (err) {
      return { valid: false, message: 'Invalid expression!' };
    }
  };

  const handleSubmit = () => {
    const result = evaluateExpression(userExpression);

    if (result.valid) {
      const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
      setScore(prev => prev + points);
      setSolved(prev => prev + 1);
      setFeedback('🎉 Correct! Amazing logic!');

      if (audioEnabled) playSound('success');

      setTimeout(() => {
        setNumbers(generateNumbers());
        setUserExpression('');
        setFeedback('');
      }, 1500);
    } else {
      setFeedback(result.message);
      if (audioEnabled) playSound('error');

      setTimeout(() => {
        setFeedback('');
      }, 2000);
    }
  };

  const insertOperator = (op) => {
    setUserExpression(prev => prev + op);
  };

  const insertNumber = (num) => {
    setUserExpression(prev => prev + num);
  };

  const clearExpression = () => {
    setUserExpression('');
    setFeedback('');
  };

  const endGame = () => {
    setGameStarted(false);
    setGameOver(true);
  };

  const playSound = (type) => {
    const audio = new Audio();
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  if (!gameStarted && !gameOver) {
    return (
      <div className="premium-game-container">
        <div className="game-intro">
          <h1 className="game-title">🎯 Game of 24</h1>
          <p className="game-description">
            Use all four numbers with +, −, ×, ÷ to make exactly 24!
          </p>
          <div className="example-box">
            <h3>Example:</h3>
            <p>Numbers: 4, 8, 2, 1</p>
            <p>Solution: (8 × 2) + 4 + 4 = 24</p>
            <p className="tip">💡 Try different combinations and operations!</p>
          </div>
          <div className="level-selector">
            <h3>Choose Difficulty:</h3>
            <div className="level-grid">
              <button
                className={`level-btn ${difficulty === 'easy' ? 'active' : ''}`}
                onClick={() => setDifficulty('easy')}
              >
                🟢 Easy<br/><small>Simple combinations</small>
              </button>
              <button
                className={`level-btn ${difficulty === 'medium' ? 'active' : ''}`}
                onClick={() => setDifficulty('medium')}
              >
                🟡 Medium<br/><small>Standard puzzles</small>
              </button>
              <button
                className={`level-btn ${difficulty === 'hard' ? 'active' : ''}`}
                onClick={() => setDifficulty('hard')}
              >
                🔴 Hard<br/><small>Brain teasers</small>
              </button>
            </div>
          </div>
          <button className="start-game-btn" onClick={startGame}>
            🎮 Start Game
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    const accuracy = solved > 0 ? 100 : 0;
    return (
      <div className="premium-game-container">
        <div className="game-over">
          <h1 className="game-over-title">🏆 Game Complete!</h1>
          <div className="final-stats-grid">
            <div className="stat-card">
              <span className="stat-icon">⭐</span>
              <span className="stat-label">Score</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🎯</span>
              <span className="stat-label">Puzzles Solved</span>
              <span className="stat-value">{solved}</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🧠</span>
              <span className="stat-label">Difficulty</span>
              <span className="stat-value">{difficulty}</span>
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
    <div className="premium-game-container game24">
      <div className="game-header">
        <div className="game-stats-row">
          <span className="stat big">⏱️ {timeLeft}s</span>
          <span className="stat big">⭐ {score}</span>
          <span className="stat big">✅ {solved} Solved</span>
        </div>
      </div>

      <div className="game24-board">
        <div className="target-display">
          <h2>Target: <span className="target-number">24</span></h2>
        </div>

        <div className="numbers-display">
          <h3>Your Numbers:</h3>
          <div className="number-tiles">
            {numbers.map((num, idx) => (
              <button
                key={idx}
                className="number-tile-24"
                onClick={() => insertNumber(num)}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="expression-builder">
          <div className="expression-display">
            {userExpression || 'Click numbers and operators...'}
          </div>
          {feedback && (
            <div className={`feedback ${feedback.includes('Correct') ? 'success' : 'error'}`}>
              {feedback}
            </div>
          )}
        </div>

        <div className="operators-panel">
          <h4>Operations:</h4>
          <div className="operator-buttons">
            <button className="operator-btn" onClick={() => insertOperator('+')}>+</button>
            <button className="operator-btn" onClick={() => insertOperator('-')}>−</button>
            <button className="operator-btn" onClick={() => insertOperator('×')}>×</button>
            <button className="operator-btn" onClick={() => insertOperator('÷')}>÷</button>
            <button className="operator-btn" onClick={() => insertOperator('(')}>(</button>
            <button className="operator-btn" onClick={() => insertOperator(')')}>)</button>
          </div>
        </div>

        <div className="action-buttons">
          <button className="action-btn clear" onClick={clearExpression}>
            🗑️ Clear
          </button>
          <button className="action-btn submit" onClick={handleSubmit}>
            ✅ Check Answer
          </button>
        </div>

        <div className="hint-box">
          <p>💡 <strong>Tip:</strong> Try parentheses to change order of operations!</p>
          <p>Example: (4 + 2) × 3 = 18</p>
        </div>
      </div>
    </div>
  );
};

export default GameOf24;
