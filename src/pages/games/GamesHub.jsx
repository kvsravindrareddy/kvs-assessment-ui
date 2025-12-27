import React, { useState, useEffect } from 'react';
import Sudoku from './Sudoku';
import MathChallenge from './MathChallenge';
import MemoryGame from './MemoryGame';
import DrawingBoard from './DrawingBoard';
import NumberMatch from './NumberMatch';
import SkipCounting from './SkipCounting';
import CompareNumbers from './CompareNumbers';
import '../../css/GamesHub.css';

const GamesHub = ({ preSelectedGame = null }) => {
  const [selectedGame, setSelectedGame] = useState(preSelectedGame);

  useEffect(() => {
    if (preSelectedGame) {
      setSelectedGame(preSelectedGame);
    }
  }, [preSelectedGame]);

  const games = [
    {
      id: 'sudoku',
      name: 'Sudoku 4x4',
      icon: '🧩',
      description: 'Logic puzzle for kids',
      color: '#FF6B6B'
    },
    {
      id: 'math',
      name: 'Math Challenge',
      icon: '🔢',
      description: 'Practice arithmetic skills',
      color: '#4ECDC4'
    },
    {
      id: 'numbermatch',
      name: 'Number Match',
      icon: '🎯',
      description: 'Match numbers with dots and words',
      color: '#84fab0'
    },
    {
      id: 'skipcounting',
      name: 'Skip Counting',
      icon: '🔄',
      description: 'Count by 2s, 5s, and 10s',
      color: '#fcb69f'
    },
    {
      id: 'compare',
      name: 'Compare Numbers',
      icon: '⚖️',
      description: 'Greater than, less than, or equal',
      color: '#d299c2'
    },
    {
      id: 'memory',
      name: 'Memory Match',
      icon: '🎴',
      description: 'Find matching pairs',
      color: '#FFE66D'
    },
    {
      id: 'drawing',
      name: 'Drawing Board',
      icon: '🎨',
      description: 'Create colorful artwork',
      color: '#9b59b6'
    }
  ];

  if (selectedGame) {
    return (
      <div className="game-container">
        <button className="back-button" onClick={() => setSelectedGame(null)}>
          ← Back to Games
        </button>
        {selectedGame === 'sudoku' && <Sudoku />}
        {selectedGame === 'math' && <MathChallenge />}
        {selectedGame === 'numbermatch' && <NumberMatch />}
        {selectedGame === 'skipcounting' && <SkipCounting />}
        {selectedGame === 'compare' && <CompareNumbers />}
        {selectedGame === 'memory' && <MemoryGame />}
        {selectedGame === 'drawing' && <DrawingBoard />}
      </div>
    );
  }

  return (
    <div className="games-hub-container">
      <div className="games-hub-header">
        <h1>Learning Games</h1>
        <p>Choose a game to play and learn!</p>
      </div>

      <div className="games-grid">
        {games.map((game) => (
          <div
            key={game.id}
            className="game-card"
            onClick={() => setSelectedGame(game.id)}
            style={{ '--game-color': game.color }}
          >
            <div className="game-icon">{game.icon}</div>
            <h3 className="game-name">{game.name}</h3>
            <p className="game-description">{game.description}</p>
            <button className="play-button">Play Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamesHub;
