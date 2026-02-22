import React, { useState } from 'react';
import '../../css/AlphabetGenerator.css';

const AlphabetGenerator = ({ type }) => {
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const generateAlphabets = (startCharCode, endCharCode) => {
    const alphabets = [];
    for (let i = startCharCode; i <= endCharCode; i++) {
      alphabets.push(String.fromCharCode(i));
    }
    return alphabets;
  };

  const speakLetter = (letter) => {
    const synth = window.speechSynthesis;
    synth.cancel();

    // Speak the letter name (not the case)
    const letterName = letter.toUpperCase();
    const utterance = new SpeechSynthesisUtterance(letterName);
    utterance.rate = 0.8; // Slower for kids
    utterance.pitch = 1.2; // Higher pitch for kids
    synth.speak(utterance);
  };

  const handleLetterClick = (letter) => {
    // Trigger animation
    setIsAnimating(true);
    setSelectedLetter(letter);

    // Speak the letter
    speakLetter(letter);

    // Reset animation after it completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
  };

  const handlePlayAgain = () => {
    setSelectedLetter(null);
    setIsAnimating(false);
    window.speechSynthesis.cancel();
  };

  const renderAlphabets = (startCharCode, endCharCode) => {
    const alphabets = generateAlphabets(startCharCode, endCharCode);
    return (
      <div className="alphabet-grid">
        {alphabets.map((alphabet, index) => (
          <div
            className={`alphabet-card ${selectedLetter === alphabet ? 'selected' : ''}`}
            key={index}
            onClick={() => handleLetterClick(alphabet)}
          >
            <span className="alphabet-letter">{alphabet}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderCursiveAlphabets = () => {
    const cursiveLetters = '𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵';
    return (
      <div className="alphabet-grid">
        {cursiveLetters.split('').map((letter, index) => (
          <div
            className={`alphabet-card ${selectedLetter === letter ? 'selected' : ''}`}
            key={index}
            onClick={() => handleLetterClick(letter)}
          >
            <span className="alphabet-letter">{letter}</span>
          </div>
        ))}
      </div>
    );
  };

  let alphabetsComponent;
  switch (type) {
    case 'Capital':
      alphabetsComponent = renderAlphabets(65, 90);
      break;
    case 'Small':
      alphabetsComponent = renderAlphabets(97, 122);
      break;
    case 'Cursive':
      alphabetsComponent = renderCursiveAlphabets();
      break;
    default:
      alphabetsComponent = null;
  }

  return (
    <div className="alphabet-generator">
      {/* Header */}
      <div className="alphabet-header">
        <h2 className="alphabet-title">{`${type} Letters`}</h2>
        <div className="alphabet-emoji">🔤</div>
      </div>

      {/* Selected Letter Display - Big Animated View */}
      {selectedLetter && (
        <div className={`letter-display ${isAnimating ? 'animating' : ''}`}>
          <div className="letter-display-content">
            <div className="big-letter">{selectedLetter}</div>
            <div className="letter-name">{selectedLetter.toUpperCase()}</div>
            <button
              className="play-again-btn"
              onClick={handlePlayAgain}
            >
              <span className="play-icon">🔄</span>
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Alphabet Grid */}
      {!selectedLetter && (
        <div className="alphabet-content">
          <div className="instruction-text">
            <span className="instruction-emoji">👆</span>
            Tap any letter to learn!
            <span className="instruction-emoji">✨</span>
          </div>
          {alphabetsComponent}
        </div>
      )}
    </div>
  );
};

export default AlphabetGenerator;
