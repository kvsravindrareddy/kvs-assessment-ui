import React, { useState } from 'react';
import '../../css/Alphabets.css';

const Alphabets = ({ audioEnabled = true }) => {
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [letterType, setLetterType] = useState('uppercase');

  const alphabetData = {
    A: { word: 'Apple', emoji: '🍎' },
    B: { word: 'Ball', emoji: '⚽' },
    C: { word: 'Cat', emoji: '🐱' },
    D: { word: 'Dog', emoji: '🐶' },
    E: { word: 'Elephant', emoji: '🐘' },
    F: { word: 'Fish', emoji: '🐟' },
    G: { word: 'Grapes', emoji: '🍇' },
    H: { word: 'House', emoji: '🏠' },
    I: { word: 'Ice Cream', emoji: '🍦' },
    J: { word: 'Juice', emoji: '🧃' },
    K: { word: 'Kite', emoji: '🪁' },
    L: { word: 'Lion', emoji: '🦁' },
    M: { word: 'Monkey', emoji: '🐵' },
    N: { word: 'Nest', emoji: '🪺' },
    O: { word: 'Orange', emoji: '🍊' },
    P: { word: 'Penguin', emoji: '🐧' },
    Q: { word: 'Queen', emoji: '👸' },
    R: { word: 'Rabbit', emoji: '🐰' },
    S: { word: 'Star', emoji: '⭐' },
    T: { word: 'Tree', emoji: '🌳' },
    U: { word: 'Umbrella', emoji: '☂️' },
    V: { word: 'Violin', emoji: '🎻' },
    W: { word: 'Watermelon', emoji: '🍉' },
    X: { word: 'Xylophone', emoji: '🎵' },
    Y: { word: 'Yacht', emoji: '⛵' },
    Z: { word: 'Zebra', emoji: '🦓' }
  };

  const letters = Object.keys(alphabetData);

  const speakLetter = (letter, word) => {
    if (audioEnabled) {
      const synth = window.speechSynthesis;
      // Cancel any ongoing speech first
      synth.cancel();
      const text = `${letter}. ${letter} for ${word}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.7;
      synth.speak(utterance);
    }
  };

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    const data = alphabetData[letter];
    speakLetter(letter, data.word);
  };

  const getDisplayLetter = (letter) => {
    if (letterType === 'uppercase') return letter;
    return letter.toLowerCase();
  };

  return (
    <div className="alphabets-container">
      <div className="alphabets-header">
        <h2>Learn Alphabets</h2>
        <p>Click on any letter to hear it and learn a word!</p>
      </div>

      <div className="letter-type-selector">
        <button
          className={`type-button ${letterType === 'uppercase' ? 'active' : ''}`}
          onClick={() => setLetterType('uppercase')}
        >
          ABC (Uppercase)
        </button>
        <button
          className={`type-button ${letterType === 'lowercase' ? 'active' : ''}`}
          onClick={() => setLetterType('lowercase')}
        >
          abc (Lowercase)
        </button>
      </div>

      <div className="alphabets-grid">
        {letters.map((letter, index) => {
          const data = alphabetData[letter];
          return (
            <div
              key={letter}
              className={`alphabet-card ${selectedLetter === letter ? 'selected' : ''}`}
              onClick={() => handleLetterClick(letter)}
              style={{ animationDelay: `${index * 0.02}s` }}
            >
              <div className="letter-display">{getDisplayLetter(letter)}</div>
              <div className="word-emoji">{data.emoji}</div>
              <div className="word-name">{data.word}</div>
            </div>
          );
        })}
      </div>

      {selectedLetter && (
        <div className="alphabet-details">
          <div className="detail-content">
            <div className="big-letter-display">
              <span className="big-letter uppercase">{selectedLetter}</span>
              <span className="big-letter lowercase">{selectedLetter.toLowerCase()}</span>
            </div>
            <div className="detail-info">
              <h3>{selectedLetter} is for {alphabetData[selectedLetter].word}</h3>
              <div className="detail-emoji">{alphabetData[selectedLetter].emoji}</div>
              <p className="phonetic-info">
                Say: "{selectedLetter}" like in "{alphabetData[selectedLetter].word}"
              </p>
            </div>
          </div>
          <button
            className="replay-button"
            onClick={() => speakLetter(selectedLetter, alphabetData[selectedLetter].word)}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Alphabets;
