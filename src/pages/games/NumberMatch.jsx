import React, { useState, useEffect } from 'react';
import '../../css/NumberMatch.css';

const NumberMatch = () => {
  const [level, setLevel] = useState('easy'); // easy: 1-10, medium: 1-20, hard: 1-50
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const getLevelRange = () => {
    switch (level) {
      case 'easy': return { min: 1, max: 10 };
      case 'medium': return { min: 1, max: 20 };
      case 'hard': return { min: 1, max: 50 };
      default: return { min: 1, max: 10 };
    }
  };

  const getNumberWord = (num) => {
    const words = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
                   'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];
    if (num <= 20) return words[num];
    if (num <= 50) {
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty'];
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
      const tensPlace = Math.floor(num / 10);
      const onesPlace = num % 10;
      return onesPlace === 0 ? tens[tensPlace] : `${tens[tensPlace]}-${ones[onesPlace]}`;
    }
    return num.toString();
  };

  const generateDots = (num) => {
    const dots = [];
    const rows = Math.ceil(num / 5);
    for (let i = 0; i < rows; i++) {
      const dotsInRow = Math.min(5, num - i * 5);
      dots.push(
        <div key={i} className="dot-row">
          {Array(dotsInRow).fill(0).map((_, j) => (
            <span key={j} className="dot">⚫</span>
          ))}
        </div>
      );
    }
    return dots;
  };

  const generateQuestion = () => {
    const { min, max } = getLevelRange();
    const correctNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    // Randomly choose question type: show dots/word and ask for number, or vice versa
    const types = ['dots-to-number', 'word-to-number', 'number-to-word'];
    const questionType = types[Math.floor(Math.random() * types.length)];

    const newQuestion = {
      correctAnswer: correctNumber,
      type: questionType
    };

    // Generate 4 options including the correct answer
    const newOptions = [correctNumber];
    while (newOptions.length < 4) {
      const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!newOptions.includes(randomNum)) {
        newOptions.push(randomNum);
      }
    }

    // Shuffle options
    newOptions.sort(() => Math.random() - 0.5);

    setQuestion(newQuestion);
    setOptions(newOptions);
    setSelectedAnswer(null);
    setFeedback('');
  };

  useEffect(() => {
    generateQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);

    if (answer === question.correctAnswer) {
      setScore(score + 1);
      setFeedback('Correct! Well done!');

      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance('Correct! Well done!');
      utterance.rate = 0.8;
      synth.speak(utterance);

      setTimeout(() => {
        setQuestionsAnswered(questionsAnswered + 1);
        generateQuestion();
      }, 1500);
    } else {
      setFeedback(`Oops! The correct answer is ${question.correctAnswer}`);

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

  const renderQuestion = () => {
    if (!question) return null;

    switch (question.type) {
      case 'dots-to-number':
        return (
          <div className="question-content">
            <h3>How many dots do you see?</h3>
            <div className="dots-container">
              {generateDots(question.correctAnswer)}
            </div>
          </div>
        );
      case 'word-to-number':
        return (
          <div className="question-content">
            <h3>What number is this?</h3>
            <div className="word-display">
              {getNumberWord(question.correctAnswer)}
            </div>
          </div>
        );
      case 'number-to-word':
        return (
          <div className="question-content">
            <h3>Which word matches this number?</h3>
            <div className="number-display">
              {question.correctAnswer}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderOptions = () => {
    if (!question) return null;

    if (question.type === 'number-to-word') {
      return options.map((num) => (
        <button
          key={num}
          className={`option-button ${selectedAnswer === num ? (num === question.correctAnswer ? 'correct' : 'incorrect') : ''}`}
          onClick={() => handleAnswer(num)}
          disabled={selectedAnswer !== null}
        >
          {getNumberWord(num)}
        </button>
      ));
    } else {
      return options.map((num) => (
        <button
          key={num}
          className={`option-button ${selectedAnswer === num ? (num === question.correctAnswer ? 'correct' : 'incorrect') : ''}`}
          onClick={() => handleAnswer(num)}
          disabled={selectedAnswer !== null}
        >
          {num}
        </button>
      ));
    }
  };

  return (
    <div className="number-match-container">
      <div className="number-match-header">
        <h2>Number Match</h2>
        <p>Match numbers with dots and words!</p>
      </div>

      <div className="level-selector">
        <button
          className={`level-button ${level === 'easy' ? 'active' : ''}`}
          onClick={() => { setLevel('easy'); resetGame(); }}
        >
          Easy (1-10)
        </button>
        <button
          className={`level-button ${level === 'medium' ? 'active' : ''}`}
          onClick={() => { setLevel('medium'); resetGame(); }}
        >
          Medium (1-20)
        </button>
        <button
          className={`level-button ${level === 'hard' ? 'active' : ''}`}
          onClick={() => { setLevel('hard'); resetGame(); }}
        >
          Hard (1-50)
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

      {question && (
        <div className="game-card">
          {renderQuestion()}

          <div className="options-grid">
            {renderOptions()}
          </div>

          {feedback && (
            <div className={`feedback-message ${selectedAnswer === question.correctAnswer ? 'success' : 'error'}`}>
              {feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NumberMatch;
