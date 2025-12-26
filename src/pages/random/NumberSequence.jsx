import React, { useState } from 'react';
import '../../css/Numbers.css';

const NumberSequence = () => {
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [mode, setMode] = useState('learn');
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(20);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [practiceNumber, setPracticeNumber] = useState(Math.floor(Math.random() * 20) + 1);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [rangeError, setRangeError] = useState('');

  const predefinedRanges = [
    { label: '1-10', start: 1, end: 10 },
    { label: '1-20', start: 1, end: 20 },
    { label: '1-50', start: 1, end: 50 },
    { label: '1-100', start: 1, end: 100 },
    { label: '50-100', start: 50, end: 100 }
  ];

  const getNumberWord = (num) => {
    // Handle special cases
    if (num === 0) return 'Zero';
    if (num === 1000) return 'One Thousand';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    // Convert numbers 1-999
    if (num >= 1 && num <= 999) {
      let result = '';

      // Hundreds place
      const hundreds = Math.floor(num / 100);
      if (hundreds > 0) {
        result += ones[hundreds] + ' Hundred';
        if (num % 100 !== 0) result += ' ';
      }

      // Tens and ones place
      const remainder = num % 100;
      if (remainder >= 10 && remainder <= 19) {
        // Handle teens (10-19)
        result += teens[remainder - 10];
      } else {
        // Handle tens place
        const tensPlace = Math.floor(remainder / 10);
        if (tensPlace > 0) {
          result += tens[tensPlace];
          if (remainder % 10 !== 0) result += '-';
        }

        // Handle ones place
        const onesPlace = remainder % 10;
        if (onesPlace > 0) {
          result += ones[onesPlace];
        }
      }

      return result.trim();
    }

    return num.toString();
  };

  const numbers = Array.from({ length: rangeEnd - rangeStart + 1 }, (_, i) => rangeStart + i);

  const speakNumber = (number) => {
    const synth = window.speechSynthesis;
    // Cancel any ongoing speech first
    synth.cancel();
    const word = getNumberWord(number);
    const text = `${word}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.7;
    synth.speak(utterance);
  };

  const handleNumberClick = (number) => {
    setSelectedNumber(number);
    speakNumber(number);
  };

  const handleRangeClick = (start, end) => {
    setRangeStart(start);
    setRangeEnd(end);
    setSelectedNumber(null);
  };

  const handleCustomRange = () => {
    const start = parseInt(customStart);
    const end = parseInt(customEnd);

    // Clear previous error
    setRangeError('');

    // Validation checks with specific error messages
    if (isNaN(start) || isNaN(end)) {
      setRangeError('Please enter valid numbers for both start and end');
      return;
    }

    if (start < 1) {
      setRangeError('Start number must be at least 1');
      return;
    }

    if (end > 1000) {
      setRangeError('End number cannot exceed 1000');
      return;
    }

    if (start >= end) {
      setRangeError('Start number must be less than end number');
      return;
    }

    // Valid range - apply it
    setRangeStart(start);
    setRangeEnd(end);
    setSelectedNumber(null);
    setCustomStart('');
    setCustomEnd('');
    setRangeError('');
  };

  const handlePracticeSubmit = () => {
    const nextNum = practiceNumber + 1;
    if (parseInt(userAnswer) === nextNum) {
      setFeedback({ type: 'success', message: `Correct! ${practiceNumber} + 1 = ${nextNum}` });
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(`Excellent! ${practiceNumber} plus one equals ${nextNum}`);
      synth.speak(utterance);
      setTimeout(() => {
        const newNum = Math.floor(Math.random() * (rangeEnd - rangeStart + 1)) + rangeStart;
        setPracticeNumber(newNum);
        setUserAnswer('');
        setFeedback(null);
      }, 2000);
    } else {
      setFeedback({ type: 'error', message: `Try again! What comes after ${practiceNumber}?` });
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance('Try again!');
      synth.speak(utterance);
    }
  };

  return (
    <div className="numbers-container">
      <div className="numbers-header">
        <h2>Learn Numbers</h2>
        <p>Choose a range and click on any number to hear it!</p>
      </div>

      {/* Range Selector */}
      <div className="range-selector-section">
        <h3>Select Number Range</h3>
        <div className="predefined-ranges">
          {predefinedRanges.map((range) => (
            <button
              key={range.label}
              className={`range-button ${rangeStart === range.start && rangeEnd === range.end ? 'active' : ''}`}
              onClick={() => handleRangeClick(range.start, range.end)}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="custom-range">
          <h4>Or Create Custom Range</h4>
          <div className="custom-range-inputs">
            <input
              type="number"
              placeholder="Start"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              min="1"
              max="999"
            />
            <span className="range-separator">to</span>
            <input
              type="number"
              placeholder="End"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              min="2"
              max="1000"
            />
            <button className="apply-button" onClick={handleCustomRange}>
              Apply
            </button>
          </div>
          <p className="range-hint">Max range: 1-1000</p>
          {rangeError && (
            <div className="range-error">
              {rangeError}
            </div>
          )}
        </div>
      </div>

      <div className="current-range-display">
        Showing: {rangeStart} - {rangeEnd} ({numbers.length} numbers)
      </div>

      <div className="mode-selector">
        <button
          className={`mode-button ${mode === 'learn' ? 'active' : ''}`}
          onClick={() => setMode('learn')}
        >
          Learn Mode
        </button>
        <button
          className={`mode-button ${mode === 'practice' ? 'active' : ''}`}
          onClick={() => setMode('practice')}
        >
          Practice Mode
        </button>
      </div>

      {mode === 'learn' ? (
        <>
          <div className="numbers-grid">
            {numbers.map((number) => (
              <div
                key={number}
                className={`number-card ${selectedNumber === number ? 'selected' : ''}`}
                onClick={() => handleNumberClick(number)}
              >
                <div className="number-digit">{number}</div>
                <div className="number-word">{getNumberWord(number)}</div>
              </div>
            ))}
          </div>

          {selectedNumber && (
            <div className="number-details">
              <h3>You selected: {selectedNumber}</h3>
              <p className="number-display">
                <span className="big-number">{selectedNumber}</span>
                <span className="number-word-large">{getNumberWord(selectedNumber)}</span>
              </p>
              <div className="counting-visual">
                {'⭐'.repeat(Math.min(selectedNumber, 10))}
                {selectedNumber > 10 && ` +${selectedNumber - 10} more`}
              </div>
              <button
                className="replay-button"
                onClick={() => speakNumber(selectedNumber)}
              >
                Play Again
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="practice-mode">
          <div className="practice-card">
            <h3>What comes next?</h3>
            <div className="practice-question">
              <span className="practice-number">{practiceNumber}</span>
              <span className="practice-operator">+ 1 =</span>
              <input
                type="number"
                className="practice-input"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePracticeSubmit()}
                placeholder="?"
              />
            </div>
            <button
              className="submit-button"
              onClick={handlePracticeSubmit}
              disabled={!userAnswer}
            >
              Check Answer
            </button>

            {feedback && (
              <div className={`feedback ${feedback.type}`}>
                {feedback.message}
              </div>
            )}
          </div>

          <div className="practice-help">
            <button
              className="help-button"
              onClick={() => speakNumber(practiceNumber)}
            >
              Hear the number
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NumberSequence;
