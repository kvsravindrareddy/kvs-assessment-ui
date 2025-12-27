import React, { useState, useEffect } from 'react';
import '../../css/MathChallenge.css';

const MathChallenge = () => {
  const [level, setLevel] = useState('easy');
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);

  const generateQuestion = (difficulty) => {
    let num1, num2, operation, answer;

    if (difficulty === 'easy') {
      // Addition and subtraction up to 10
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      operation = Math.random() > 0.5 ? '+' : '-';
      if (operation === '-' && num1 < num2) [num1, num2] = [num2, num1];
      answer = operation === '+' ? num1 + num2 : num1 - num2;
    } else if (difficulty === 'medium') {
      // Addition, subtraction, multiplication up to 20
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      const ops = ['+', '-', '×'];
      operation = ops[Math.floor(Math.random() * ops.length)];
      if (operation === '-' && num1 < num2) [num1, num2] = [num2, num1];
      if (operation === '×') {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
      }
      answer = operation === '+' ? num1 + num2 : operation === '-' ? num1 - num2 : num1 * num2;
    } else {
      // All operations up to 50
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      const ops = ['+', '-', '×', '÷'];
      operation = ops[Math.floor(Math.random() * ops.length)];

      if (operation === '-' && num1 < num2) [num1, num2] = [num2, num1];
      if (operation === '÷') {
        // Ensure division results in whole number
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * answer;
      } else {
        answer = operation === '+' ? num1 + num2 : operation === '-' ? num1 - num2 : num1 * num2;
      }
    }

    return { num1, num2, operation, answer };
  };

  useEffect(() => {
    setQuestion(generateQuestion(level));
    setScore(0);
    setQuestionsAnswered(0);
    setStreak(0);
  }, [level]);

  const speakText = (text) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  };

  const handleSubmit = () => {
    if (!userAnswer) return;

    const isCorrect = parseInt(userAnswer) === question.answer;

    if (isCorrect) {
      setScore(score + 10);
      setStreak(streak + 1);
      setFeedback({ type: 'success', message: 'Correct! Great job!' });
      speakText('Excellent! Correct!');
    } else {
      setStreak(0);
      setFeedback({
        type: 'error',
        message: `Oops! The correct answer is ${question.answer}`
      });
      speakText('Try the next one!');
    }

    setQuestionsAnswered(questionsAnswered + 1);
    setUserAnswer('');

    setTimeout(() => {
      setQuestion(generateQuestion(level));
      setFeedback(null);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (!question) return null;

  return (
    <div className="math-challenge-container">
      <div className="math-header">
        <h2>Math Challenge</h2>
        <p>Solve as many problems as you can!</p>
      </div>

      <div className="level-selector">
        <button
          className={`level-button ${level === 'easy' ? 'active' : ''}`}
          onClick={() => setLevel('easy')}
        >
          Easy
        </button>
        <button
          className={`level-button ${level === 'medium' ? 'active' : ''}`}
          onClick={() => setLevel('medium')}
        >
          Medium
        </button>
        <button
          className={`level-button ${level === 'hard' ? 'active' : ''}`}
          onClick={() => setLevel('hard')}
        >
          Hard
        </button>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Questions:</span>
          <span className="stat-value">{questionsAnswered}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Streak:</span>
          <span className="stat-value">{streak} 🔥</span>
        </div>
      </div>

      <div className="question-card">
        <div className="question-display">
          <span className="question-number">{question.num1}</span>
          <span className="question-operation">{question.operation}</span>
          <span className="question-number">{question.num2}</span>
          <span className="question-equals">=</span>
          <span className="question-mark">?</span>
        </div>

        <div className="answer-section">
          <input
            type="number"
            className="answer-input"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Your answer"
            autoFocus
          />
          <button className="submit-button" onClick={handleSubmit}>
            Check Answer
          </button>
        </div>

        {feedback && (
          <div className={`feedback-message ${feedback.type}`}>
            {feedback.message}
          </div>
        )}
      </div>

      {streak >= 5 && (
        <div className="streak-badge">
          On Fire! {streak} in a row!
        </div>
      )}
    </div>
  );
};

export default MathChallenge;
