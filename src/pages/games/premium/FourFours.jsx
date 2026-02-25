import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './PremiumGames.css';

const FourFours = ({ audioEnabled = true }) => {
  const { user } = useAuth();
  const [targetNumber, setTargetNumber] = useState(1);
  const [userExpression, setUserExpression] = useState('');
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(new Set());
  const [feedback, setFeedback] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Pre-calculated solutions for hints
  const solutions = {
    1: '(4/4)^(4-4) = 1 or 44/44',
    2: '4/4 + 4/4',
    3: '(4+4+4)/4',
    4: '4+(4-4)×4',
    5: '(4×4+4)/4',
    6: '4+4/4+4/4 or (4+4)/4+4',
    7: '44/4-4',
    8: '4+4+4-4',
    9: '4+4+4/4',
    10: '(44-4)/4',
    11: '4/.4 + 4/4',
    12: '(4+4+4)×4 or 44+4-4',
    13: '4!-44/4',
    14: '4×4-4/4',
    15: '44/4+4',
    16: '4+4+4+4',
    17: '4×4+4/4',
    18: '44*.4+4',
    19: '4!-4-4/4',
    20: '4×(4+4/4)'
  };

  const countFours = (expr) => {
    return (expr.match(/4/g) || []).length;
  };

  const evaluateExpression = (expr) => {
    try {
      // Replace special symbols
      expr = expr.replace(/×/g, '*')
                 .replace(/÷/g, '/')
                 .replace(/√/g, 'Math.sqrt')
                 .replace(/!/g, ''); // Handle factorial separately

      // Check for factorial
      let factorialCount = (userExpression.match(/!/g) || []).length;

      // Simple factorial implementation
      if (userExpression.includes('4!')) {
        expr = expr.replace(/4!/g, '24');
      }

      // Count 4s
      const fourCount = countFours(userExpression);
      if (fourCount !== 4) {
        return { valid: false, message: `You must use exactly four 4s! (You used ${fourCount})` };
      }

      // Evaluate using Function constructor (safer than eval)
      const result = Function('"use strict"; return (' + expr + ')')();

      if (Math.abs(result - targetNumber) < 0.001) {
        return { valid: true, result: targetNumber };
      } else {
        return { valid: false, message: `That equals ${result.toFixed(2)}, not ${targetNumber}!` };
      }
    } catch (err) {
      return { valid: false, message: 'Invalid expression! Check your syntax.' };
    }
  };

  const handleSubmit = () => {
    const result = evaluateExpression(userExpression);

    if (result.valid) {
      setScore(prev => prev + targetNumber);
      setSolved(prev => new Set([...prev, targetNumber]));
      setFeedback(`🎉 Correct! ${targetNumber} = ${userExpression}`);

      if (audioEnabled) playSound('success');

      setTimeout(() => {
        // Move to next unsolved number
        let next = targetNumber + 1;
        while (solved.has(next) && next <= 20) {
          next++;
        }
        if (next > 20) next = 1;
        setTargetNumber(next);
        setUserExpression('');
        setFeedback('');
        setShowSolution(false);
      }, 2000);
    } else {
      setFeedback(result.message);
      if (audioEnabled) playSound('error');
    }
  };

  const insertSymbol = (symbol) => {
    setUserExpression(prev => prev + symbol);
  };

  const clearExpression = () => {
    setUserExpression('');
    setFeedback('');
  };

  const skipNumber = () => {
    let next = targetNumber + 1;
    if (next > 20) next = 1;
    setTargetNumber(next);
    setUserExpression('');
    setFeedback('');
    setShowSolution(false);
  };

  const playSound = (type) => {
    const audio = new Audio();
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  if (!gameStarted) {
    return (
      <div className="premium-game-container">
        <div className="game-intro">
          <h1 className="game-title">🔢 Four Fours Challenge</h1>
          <p className="game-description">
            Use exactly four 4s and mathematical operations to create every number from 1 to 20!
          </p>
          <div className="example-box">
            <h3>Examples:</h3>
            <p>1 = 44/44</p>
            <p>2 = 4/4 + 4/4</p>
            <p>5 = (4×4+4)/4</p>
            <p>10 = (44-4)/4</p>
          </div>
          <div className="rules-box">
            <h3>🎯 Rules:</h3>
            <ul>
              <li>Use exactly four 4s</li>
              <li>You can use: +, −, ×, ÷, ( ), √, !, .</li>
              <li>4! = 24 (factorial)</li>
              <li>.4 = 0.4 (decimal)</li>
              <li>44 counts as two 4s</li>
            </ul>
          </div>
          <button className="start-game-btn" onClick={() => setGameStarted(true)}>
            🧠 Start Challenge
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-game-container four-fours">
      <div className="game-header">
        <div className="game-stats-row">
          <span className="stat big">🎯 Target: {targetNumber}</span>
          <span className="stat big">⭐ Score: {score}</span>
          <span className="stat big">✅ {solved.size}/20 Solved</span>
        </div>
      </div>

      <div className="four-fours-board">
        <div className="progress-tracker">
          <h3>Progress (1-20):</h3>
          <div className="number-grid">
            {[...Array(20)].map((_, i) => {
              const num = i + 1;
              return (
                <button
                  key={num}
                  className={`progress-number ${solved.has(num) ? 'solved' : ''} ${num === targetNumber ? 'current' : ''}`}
                  onClick={() => {
                    setTargetNumber(num);
                    setUserExpression('');
                    setShowSolution(false);
                  }}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        <div className="expression-builder-four">
          <h3>Build your expression:</h3>
          <div className="expression-display-large">
            {userExpression || 'Use four 4s to make ' + targetNumber}
          </div>
          {feedback && (
            <div className={`feedback ${feedback.includes('Correct') ? 'success' : 'error'}`}>
              {feedback}
            </div>
          )}
        </div>

        <div className="symbol-panel">
          <div className="symbol-section">
            <h4>Numbers & Grouping:</h4>
            <div className="symbol-buttons">
              <button className="symbol-btn" onClick={() => insertSymbol('4')}>4</button>
              <button className="symbol-btn" onClick={() => insertSymbol('()')}>()</button>
              <button className="symbol-btn" onClick={() => insertSymbol('.')}>.</button>
            </div>
          </div>

          <div className="symbol-section">
            <h4>Basic Operations:</h4>
            <div className="symbol-buttons">
              <button className="symbol-btn" onClick={() => insertSymbol('+')}>+</button>
              <button className="symbol-btn" onClick={() => insertSymbol('-')}>−</button>
              <button className="symbol-btn" onClick={() => insertSymbol('×')}>×</button>
              <button className="symbol-btn" onClick={() => insertSymbol('÷')}>÷</button>
            </div>
          </div>

          <div className="symbol-section">
            <h4>Advanced:</h4>
            <div className="symbol-buttons">
              <button className="symbol-btn" onClick={() => insertSymbol('√')}>√</button>
              <button className="symbol-btn" onClick={() => insertSymbol('!')}>!</button>
              <button className="symbol-btn" onClick={() => insertSymbol('^')}>^</button>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="action-btn clear" onClick={clearExpression}>
            🗑️ Clear
          </button>
          <button className="action-btn hint" onClick={() => setShowSolution(!showSolution)}>
            💡 Hint
          </button>
          <button className="action-btn skip" onClick={skipNumber}>
            ⏭️ Skip
          </button>
          <button className="action-btn submit" onClick={handleSubmit}>
            ✅ Check
          </button>
        </div>

        {showSolution && (
          <div className="solution-box">
            <h4>💡 Solution for {targetNumber}:</h4>
            <p className="solution-text">{solutions[targetNumber] || 'Try your best!'}</p>
          </div>
        )}

        <div className="hint-box">
          <p><strong>Quick Tips:</strong></p>
          <p>• Use 4! for 24</p>
          <p>• Use .4 for 0.4</p>
          <p>• Concatenate: 44 uses two 4s</p>
          <p>• √4 = 2</p>
        </div>
      </div>
    </div>
  );
};

export default FourFours;
