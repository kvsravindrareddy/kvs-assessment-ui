import React, { useState, useEffect } from 'react';
import '../../css/CompareNumbers.css';

const CompareNumbers = () => {
  const [level, setLevel] = useState('easy'); // easy: 1-20, medium: 1-50, hard: 1-100
  const [score, setScore] = useState(0);
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const getLevelRange = () => {
    switch (level) {
      case 'easy': return { min: 1, max: 20 };
      case 'medium': return { min: 1, max: 50 };
      case 'hard': return { min: 1, max: 100 };
      default: return { min: 1, max: 20 };
    }
  };

  const generateQuestion = () => {
    const { min, max } = getLevelRange();

    let n1 = Math.floor(Math.random() * (max - min + 1)) + min;
    let n2 = Math.floor(Math.random() * (max - min + 1)) + min;

    // Make sure numbers are different
    while (n1 === n2) {
      n2 = Math.floor(Math.random() * (max - min + 1)) + min;
    }

    setNum1(n1);
    setNum2(n2);

    if (n1 > n2) {
      setCorrectAnswer('>');
    } else if (n1 < n2) {
      setCorrectAnswer('<');
    } else {
      setCorrectAnswer('=');
    }

    setSelectedAnswer(null);
    setFeedback('');
  };

  useEffect(() => {
    generateQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);

    if (answer === correctAnswer) {
      setScore(score + 1);
      setFeedback('Perfect! That\'s correct!');

      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance('Perfect! That is correct!');
      utterance.rate = 0.8;
      synth.speak(utterance);

      setTimeout(() => {
        setQuestionsAnswered(questionsAnswered + 1);
        generateQuestion();
      }, 1500);
    } else {
      const symbolWords = { '>': 'greater than', '<': 'less than', '=': 'equal to' };
      setFeedback(`Not quite! ${num1} is ${symbolWords[correctAnswer]} ${num2}`);

      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance('Try again!');
      utterance.rate = 0.8;
      synth.speak(utterance);

      setTimeout(() => {
        setQuestionsAnswered(questionsAnswered + 1);
        generateQuestion();
      }, 2000);
    }
  };

  const resetGame = () => {
    setScore(0);
    setQuestionsAnswered(0);
    generateQuestion();
  };

  const getSymbolLabel = (symbol) => {
    switch (symbol) {
      case '>': return 'Greater Than';
      case '<': return 'Less Than';
      case '=': return 'Equal To';
      default: return '';
    }
  };

  return (
    <div className="compare-numbers-container">
      <div className="compare-header">
        <h2>Compare Numbers</h2>
        <p>Choose the correct comparison symbol!</p>
      </div>

      <div className="level-selector">
        <button
          className={`level-button ${level === 'easy' ? 'active' : ''}`}
          onClick={() => { setLevel('easy'); resetGame(); }}
        >
          Easy (1-20)
        </button>
        <button
          className={`level-button ${level === 'medium' ? 'active' : ''}`}
          onClick={() => { setLevel('medium'); resetGame(); }}
        >
          Medium (1-50)
        </button>
        <button
          className={`level-button ${level === 'hard' ? 'active' : ''}`}
          onClick={() => { setLevel('hard'); resetGame(); }}
        >
          Hard (1-100)
        </button>
      </div>

      <div className="game-stats">
        <div className="stat-item">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Questions:</span>
          <span className="stat-value">{questionsAnswered}</span>
        </div>
        <button className="reset-button" onClick={resetGame}>
          🔄 Reset
        </button>
      </div>

      <div className="game-card">
        <div className="comparison-display">
          <h3>Which symbol goes in between?</h3>

          <div className="numbers-row">
            <div className="number-box">{num1}</div>
            <div className="symbol-box">?</div>
            <div className="number-box">{num2}</div>
          </div>
        </div>

        <div className="symbol-options">
          {['>', '<', '='].map((symbol) => (
            <button
              key={symbol}
              className={`symbol-button ${selectedAnswer === symbol ? (symbol === correctAnswer ? 'correct' : 'incorrect') : ''}`}
              onClick={() => handleAnswer(symbol)}
              disabled={selectedAnswer !== null}
            >
              <span className="symbol-icon">{symbol}</span>
              <span className="symbol-label">{getSymbolLabel(symbol)}</span>
            </button>
          ))}
        </div>

        {feedback && (
          <div className={`feedback-message ${selectedAnswer === correctAnswer ? 'success' : 'error'}`}>
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareNumbers;
