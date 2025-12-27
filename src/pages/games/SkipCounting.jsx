import React, { useState, useEffect } from 'react';
import '../../css/SkipCounting.css';

const SkipCounting = () => {
  const [skipBy, setSkipBy] = useState(2);
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [missingIndex, setMissingIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const generateSequence = () => {
    const skipOptions = [2, 5, 10];
    const currentSkip = skipOptions.includes(skipBy) ? skipBy : 2;

    // Generate sequence of 6 numbers
    const startNumber = currentSkip;
    const sequenceLength = 6;
    const newSequence = [];

    for (let i = 0; i < sequenceLength; i++) {
      newSequence.push(startNumber + (i * currentSkip));
    }

    // Pick random index to be the missing number (not first or last for better UX)
    const randomIndex = Math.floor(Math.random() * (sequenceLength - 2)) + 1;
    const correctAnswer = newSequence[randomIndex];

    // Generate options
    const newOptions = [correctAnswer];
    while (newOptions.length < 4) {
      // Generate wrong answers that are close to the correct one
      const offset = (Math.random() < 0.5 ? -1 : 1) * currentSkip * (Math.floor(Math.random() * 2) + 1);
      const wrongAnswer = correctAnswer + offset;
      if (!newOptions.includes(wrongAnswer) && wrongAnswer > 0) {
        newOptions.push(wrongAnswer);
      }
    }

    // Shuffle options
    newOptions.sort(() => Math.random() - 0.5);

    setSequence(newSequence);
    setMissingIndex(randomIndex);
    setOptions(newOptions);
    setSelectedAnswer(null);
    setFeedback('');
  };

  useEffect(() => {
    generateSequence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipBy]);

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    const correctAnswer = sequence[missingIndex];

    if (answer === correctAnswer) {
      setScore(score + 1);
      setFeedback('Excellent! That\'s correct!');

      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance('Excellent! That is correct!');
      utterance.rate = 0.8;
      synth.speak(utterance);

      setTimeout(() => {
        setQuestionsAnswered(questionsAnswered + 1);
        generateSequence();
      }, 1500);
    } else {
      setFeedback(`Not quite! The answer is ${correctAnswer}`);

      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance('Try again!');
      utterance.rate = 0.8;
      synth.speak(utterance);

      setTimeout(() => {
        setQuestionsAnswered(questionsAnswered + 1);
        generateSequence();
      }, 2000);
    }
  };

  const resetGame = () => {
    setScore(0);
    setQuestionsAnswered(0);
    generateSequence();
  };

  return (
    <div className="skip-counting-container">
      <div className="skip-counting-header">
        <h2>Skip Counting</h2>
        <p>Find the missing number in the sequence!</p>
      </div>

      <div className="skip-selector">
        <button
          className={`skip-button ${skipBy === 2 ? 'active' : ''}`}
          onClick={() => { setSkipBy(2); resetGame(); }}
        >
          Count by 2s
        </button>
        <button
          className={`skip-button ${skipBy === 5 ? 'active' : ''}`}
          onClick={() => { setSkipBy(5); resetGame(); }}
        >
          Count by 5s
        </button>
        <button
          className={`skip-button ${skipBy === 10 ? 'active' : ''}`}
          onClick={() => { setSkipBy(10); resetGame(); }}
        >
          Count by 10s
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
        <div className="sequence-display">
          <h3>What number is missing?</h3>
          <div className="sequence-boxes">
            {sequence.map((num, index) => (
              <div
                key={index}
                className={`sequence-box ${index === missingIndex ? 'missing' : ''}`}
              >
                {index === missingIndex ? '?' : num}
              </div>
            ))}
          </div>
        </div>

        <div className="options-grid">
          {options.map((num) => (
            <button
              key={num}
              className={`option-button ${selectedAnswer === num ? (num === sequence[missingIndex] ? 'correct' : 'incorrect') : ''}`}
              onClick={() => handleAnswer(num)}
              disabled={selectedAnswer !== null}
            >
              {num}
            </button>
          ))}
        </div>

        {feedback && (
          <div className={`feedback-message ${selectedAnswer === sequence[missingIndex] ? 'success' : 'error'}`}>
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkipCounting;
