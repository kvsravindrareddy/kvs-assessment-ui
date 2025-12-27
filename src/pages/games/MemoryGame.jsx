import React, { useState, useEffect } from 'react';
import '../../css/MemoryGame.css';

const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [theme, setTheme] = useState('numbers');

  const themes = {
    numbers: ['1', '2', '3', '4', '5', '6', '7', '8'],
    emojis: ['🍎', '🍌', '🍇', '🍊', '🍓', '🍒', '🍑', '🍉'],
    shapes: ['⭕', '⬛', '🔺', '⬟', '⭐', '❤️', '💎', '🌙']
  };

  const initializeGame = (selectedTheme) => {
    const selectedIcons = themes[selectedTheme];
    const cardPairs = [...selectedIcons, ...selectedIcons];
    const shuffled = cardPairs
      .map((value, index) => ({ id: index, value, flipped: false }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setIsComplete(false);
  };

  useEffect(() => {
    initializeGame(theme);
  }, [theme]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      if (cards[first].value === cards[second].value) {
        // Match found
        setMatchedCards([...matchedCards, first, second]);
        setFlippedCards([]);

        const synth = window.speechSynthesis;
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance('Match found!');
        synth.speak(utterance);

        // Check if game is complete
        if (matchedCards.length + 2 === cards.length) {
          setTimeout(() => {
            setIsComplete(true);
            const completeUtterance = new SpeechSynthesisUtterance(
              `Congratulations! You completed the game in ${moves + 1} moves!`
            );
            synth.speak(completeUtterance);
          }, 500);
        }
      } else {
        // No match
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
      setMoves(moves + 1);
    }
  }, [flippedCards]);

  const handleCardClick = (index) => {
    if (
      flippedCards.length === 2 ||
      flippedCards.includes(index) ||
      matchedCards.includes(index)
    ) {
      return;
    }

    setFlippedCards([...flippedCards, index]);
  };

  const isCardFlipped = (index) => {
    return flippedCards.includes(index) || matchedCards.includes(index);
  };

  const getCardClass = (index) => {
    let className = 'memory-card';
    if (isCardFlipped(index)) className += ' flipped';
    if (matchedCards.includes(index)) className += ' matched';
    return className;
  };

  return (
    <div className="memory-game-container">
      <div className="memory-header">
        <h2>Memory Match Game</h2>
        <p>Find all the matching pairs!</p>
      </div>

      <div className="theme-selector">
        <button
          className={`theme-button ${theme === 'numbers' ? 'active' : ''}`}
          onClick={() => setTheme('numbers')}
        >
          Numbers
        </button>
        <button
          className={`theme-button ${theme === 'emojis' ? 'active' : ''}`}
          onClick={() => setTheme('emojis')}
        >
          Emojis
        </button>
        <button
          className={`theme-button ${theme === 'shapes' ? 'active' : ''}`}
          onClick={() => setTheme('shapes')}
        >
          Shapes
        </button>
      </div>

      <div className="game-stats">
        <div className="stat">Moves: {moves}</div>
        <button className="restart-button" onClick={() => initializeGame(theme)}>
          Restart
        </button>
      </div>

      <div className="memory-grid">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={getCardClass(index)}
            onClick={() => handleCardClick(index)}
          >
            <div className="card-inner">
              <div className="card-front">?</div>
              <div className="card-back">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {isComplete && (
        <div className="completion-overlay">
          <div className="completion-card">
            <h2>Congratulations!</h2>
            <p>You completed the game in <strong>{moves} moves</strong>!</p>
            <button
              className="play-again-button"
              onClick={() => initializeGame(theme)}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;
