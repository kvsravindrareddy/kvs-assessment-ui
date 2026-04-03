import React, { useState, useCallback } from 'react';
import '../../css/Alphabets.css';

// Static data defined once at module level — not recreated on every render
const ALPHABET_DATA = {
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

const LETTERS = Object.keys(ALPHABET_DATA);

const Alphabets = ({ audioEnabled = true }) => {
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [letterType, setLetterType] = useState('uppercase');
  const [isAnimating, setIsAnimating] = useState(false);

  const speakLetter = useCallback((letter, word) => {
    if (audioEnabled) {
      const synth = window.speechSynthesis;
      // Cancel any ongoing speech first
      synth.cancel();

      const text = `${letter} for ${word}`;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.7;
      utterance.pitch = 1.3;

      // Try to get a child/female voice
      const voices = synth.getVoices();
      const childVoice = voices.find(voice =>
        voice.name.includes('Samantha') ||
        voice.name.includes('Karen') ||
        voice.name.includes('Fiona') ||
        voice.name.includes('female') ||
        voice.name.includes('child')
      );
      if (childVoice) {
        utterance.voice = childVoice;
      }

      synth.speak(utterance);
    }
  }, [audioEnabled]);

  const handleLetterClick = useCallback((letter) => {
    setSelectedLetter(letter);
    setIsAnimating(true);
    const data = ALPHABET_DATA[letter];
    speakLetter(letter, data.word);

    // Reset animation after 3 seconds
    setTimeout(() => {
      setIsAnimating(false);
      setSelectedLetter(null);
    }, 3000);
  }, [speakLetter]);

  const setUppercase = useCallback(() => setLetterType('uppercase'), []);
  const setLowercase = useCallback(() => setLetterType('lowercase'), []);

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
          onClick={setUppercase}
        >
          ABC (Uppercase)
        </button>
        <button
          className={`type-button ${letterType === 'lowercase' ? 'active' : ''}`}
          onClick={setLowercase}
        >
          abc (Lowercase)
        </button>
      </div>

      <div className="alphabets-grid">
        {LETTERS.map((letter, index) => {
          const data = ALPHABET_DATA[letter];
          const isSelected = selectedLetter === letter && isAnimating;
          return (
            <div
              key={letter}
              className={`alphabet-card ${isSelected ? 'bubble-out' : ''}`}
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
    </div>
  );
};

export default Alphabets;
