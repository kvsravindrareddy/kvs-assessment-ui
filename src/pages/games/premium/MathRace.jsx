import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './PremiumGames.css';

const MathRace = ({ audioEnabled = true }) => {
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
  const [timeLeft, setTimeLeft] = useState(90);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [streak, setStreak] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [animation, setAnimation] = useState('');

  const generateQuestion = () => {
    let num1, num2, operator, answer;

    switch(level) {
      case 1: // Easy: Single digit addition/subtraction
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        operator = Math.random() > 0.5 ? '+' : '-';
        answer = operator === '+' ? num1 + num2 : Math.max(num1, num2) - Math.min(num1, num2);
        break;

      case 2: // Medium: Two digit addition/subtraction
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * 50) + 10;
        operator = Math.random() > 0.5 ? '+' : '-';
        answer = operator === '+' ? num1 + num2 : Math.max(num1, num2) - Math.min(num1, num2);
        break;

      case 3: // Hard: Multiplication and division
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        operator = Math.random() > 0.5 ? '×' : '÷';
        if (operator === '×') {
          answer = num1 * num2;
        } else {
          answer = num1;
          num1 = num1 * num2;
        }
        break;

      case 4: // Expert: Mixed operations
        num1 = Math.floor(Math.random() * 20) + 5;
        num2 = Math.floor(Math.random() * 20) + 5;
        const ops = ['+', '-', '×'];
        operator = ops[Math.floor(Math.random() * ops.length)];
        answer = operator === '+' ? num1 + num2 :
                 operator === '-' ? Math.max(num1, num2) - Math.min(num1, num2) :
                 num1 * num2;
        break;

      case 5: // Master: Complex operations
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * 50) + 10;
        const allOps = ['+', '-', '×'];
        operator = allOps[Math.floor(Math.random() * allOps.length)];
        answer = operator === '+' ? num1 + num2 :
                 operator === '-' ? Math.max(num1, num2) - Math.min(num1, num2) :
                 num1 * num2;
        break;

      default:
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        operator = '+';
        answer = num1 + num2;
    }

    return {
      num1,
      num2,
      operator,
      answer,
      question: `${num1} ${operator} ${num2}`
    };
  };

  useEffect(() => {
    if (gameStarted) {
      setCurrentQuestion(generateQuestion());
    }
  }, [gameStarted, level]);

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
    setStreak(0);
    setTotalQuestions(0);
    setCorrectAnswers(0);
    setTimeLeft(90);
    setUserAnswer('');
  };

  const checkAnswer = () => {
    setTotalQuestions(prev => prev + 1);

    if (parseInt(userAnswer) === currentQuestion.answer) {
      const points = (10 + streak * 2) * level;
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);
      setAnimation('correct');

      if (audioEnabled) playSound('success');

      setTimeout(() => {
        setAnimation('');
        setCurrentQuestion(generateQuestion());
        setUserAnswer('');
      }, 500);
    } else {
      setStreak(0);
      setAnimation('incorrect');

      if (audioEnabled) playSound('error');

      setTimeout(() => {
        setAnimation('');
        setCurrentQuestion(generateQuestion());
        setUserAnswer('');
      }, 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && userAnswer) {
      checkAnswer();
    }
  };

  const endGame = () => {
    setGameStarted(false);
    setGameOver(true);

    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const coinsEarned = Math.floor(score / 10);

    // Save to backend
    saveGameHistory({
      userId: user?.id,
      gameType: 'math-race',
      score,
      level,
      duration: 90,
      accuracy,
      coinsEarned,
      gameData: {
        totalQuestions,
        correctAnswers,
        highestStreak: streak
      }
    });
  };

  const playSound = (type) => {
    const audio = new Audio();
    const sounds = {
      success: 'data:audio/wav;base64,...',
      error: 'data:audio/wav;base64,...'
    };
    audio.src = sounds[type];
    audio.play().catch(() => {});
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
      <div className="premium-game-container math-race">
        <div className="game-intro">
          <h1 className="game-title">🏎️ Math Race</h1>
          <p className="game-description">
            Solve as many math problems as you can in 90 seconds! Build streaks for bonus points!
          </p>
          <div className="level-selector">
            <h3>Choose Difficulty:</h3>
            <div className="level-grid">
              <button className={`level-btn ${level === 1 ? 'active' : ''}`} onClick={() => setLevel(1)}>
                🟢 Easy<br/><small>Single digit +/-</small>
              </button>
              <button className={`level-btn ${level === 2 ? 'active' : ''}`} onClick={() => setLevel(2)}>
                🔵 Medium<br/><small>Two digit +/-</small>
              </button>
              <button className={`level-btn ${level === 3 ? 'active' : ''}`} onClick={() => setLevel(3)}>
                🟡 Hard<br/><small>Multiply/Divide</small>
              </button>
              <button className={`level-btn ${level === 4 ? 'active' : ''}`} onClick={() => setLevel(4)}>
                🟠 Expert<br/><small>Mixed operations</small>
              </button>
              <button className={`level-btn ${level === 5 ? 'active' : ''}`} onClick={() => setLevel(5)}>
                🔴 Master<br/><small>Complex math</small>
              </button>
            </div>
          </div>
          <button className="start-game-btn race" onClick={startGame}>
            🏁 Start Race!
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const coinsEarned = Math.floor(score / 10);

    return (
      <div className="premium-game-container">
        <div className="game-over">
          <h1 className="game-over-title">🏆 Race Complete!</h1>
          <div className="final-stats-grid">
            <div className="stat-card">
              <span className="stat-icon">⭐</span>
              <span className="stat-label">Score</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">✅</span>
              <span className="stat-label">Correct</span>
              <span className="stat-value">{correctAnswers}/{totalQuestions}</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🎯</span>
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">{accuracy}%</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🪙</span>
              <span className="stat-label">Coins</span>
              <span className="stat-value">{coinsEarned}</span>
            </div>
          </div>
          <button className="play-again-btn" onClick={startGame}>
            🔄 Race Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-game-container math-race-game">
      <div className="game-header">
        <div className="game-stats-row">
          <span className="stat big">⏱️ {timeLeft}s</span>
          <span className="stat big">⭐ {score}</span>
          <span className="stat big">🔥 Streak: {streak}</span>
          <span className="stat big">✅ {correctAnswers}/{totalQuestions}</span>
        </div>
      </div>

      <div className={`math-question-container ${animation}`}>
        {currentQuestion && (
          <>
            <div className="math-question">
              {currentQuestion.question} = ?
            </div>
            <div className="answer-input-container">
              <input
                type="number"
                className="answer-input"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type answer"
                autoFocus
              />
              <button className="submit-answer-btn" onClick={checkAnswer} disabled={!userAnswer}>
                ➡️ Submit
              </button>
            </div>
          </>
        )}
      </div>

      {streak >= 3 && (
        <div className="streak-bonus">
          🔥 {streak} Streak! Bonus: +{streak * 2} points per answer!
        </div>
      )}
    </div>
  );
};

export default MathRace;
