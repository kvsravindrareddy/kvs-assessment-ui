import React, { useState, useEffect } from 'react';
import '../../css/Sudoku.css';

const Sudoku = () => {
  const [grid, setGrid] = useState([]);
  const [solution, setSolution] = useState([]);
  const [difficulty, setDifficulty] = useState('easy');
  const [selectedCell, setSelectedCell] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [errors, setErrors] = useState(0);

  // Generate a simple 4x4 Sudoku puzzle for kids
  const generatePuzzle = (level) => {
    // Simple valid 4x4 Sudoku solution
    const solutions = [
      [
        [1, 2, 3, 4],
        [3, 4, 1, 2],
        [2, 3, 4, 1],
        [4, 1, 2, 3]
      ],
      [
        [2, 1, 4, 3],
        [4, 3, 2, 1],
        [1, 4, 3, 2],
        [3, 2, 1, 4]
      ],
      [
        [3, 4, 2, 1],
        [2, 1, 3, 4],
        [4, 3, 1, 2],
        [1, 2, 4, 3]
      ]
    ];

    const randomSolution = solutions[Math.floor(Math.random() * solutions.length)];
    setSolution(randomSolution);

    // Create puzzle by removing numbers based on difficulty
    const cellsToRemove = level === 'easy' ? 6 : level === 'medium' ? 8 : 10;
    const puzzle = randomSolution.map(row => [...row]);

    let removed = 0;
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 4);
      const col = Math.floor(Math.random() * 4);
      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0;
        removed++;
      }
    }

    setGrid(puzzle);
    setIsComplete(false);
    setErrors(0);
    setSelectedCell(null);
  };

  useEffect(() => {
    generatePuzzle(difficulty);
  }, [difficulty]);

  const handleCellClick = (row, col) => {
    if (solution[row][col] !== grid[row][col] || grid[row][col] === 0) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberInput = (num) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = num;
    setGrid(newGrid);

    // Check if correct
    if (num !== solution[row][col]) {
      setErrors(errors + 1);
      // Speak error
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance('Try again!');
      synth.speak(utterance);
    } else {
      // Speak success
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance('Correct!');
      synth.speak(utterance);
    }

    // Check if puzzle is complete
    checkComplete(newGrid);
  };

  const checkComplete = (currentGrid) => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (currentGrid[i][j] !== solution[i][j]) {
          return;
        }
      }
    }
    setIsComplete(true);
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance('Congratulations! You solved the puzzle!');
    synth.speak(utterance);
  };

  const getCellClass = (row, col, value) => {
    let className = 'sudoku-cell';
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      className += ' selected';
    }
    if (value === 0) {
      className += ' empty';
    } else if (value !== solution[row][col]) {
      className += ' incorrect';
    } else {
      className += ' correct';
    }
    return className;
  };

  return (
    <div className="sudoku-container">
      <div className="sudoku-header">
        <h2>Kid's Sudoku (4x4)</h2>
        <p>Fill in the numbers 1-4 so each row, column, and box has all numbers!</p>
      </div>

      <div className="difficulty-selector">
        <button
          className={`difficulty-button ${difficulty === 'easy' ? 'active' : ''}`}
          onClick={() => setDifficulty('easy')}
        >
          Easy
        </button>
        <button
          className={`difficulty-button ${difficulty === 'medium' ? 'active' : ''}`}
          onClick={() => setDifficulty('medium')}
        >
          Medium
        </button>
        <button
          className={`difficulty-button ${difficulty === 'hard' ? 'active' : ''}`}
          onClick={() => setDifficulty('hard')}
        >
          Hard
        </button>
      </div>

      <div className="game-info">
        <div className="info-item">Errors: {errors}</div>
        <button className="new-game-button" onClick={() => generatePuzzle(difficulty)}>
          New Game
        </button>
      </div>

      <div className="sudoku-board">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="sudoku-row">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={getCellClass(rowIndex, colIndex, cell)}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell !== 0 ? cell : ''}
              </div>
            ))}
          </div>
        ))}
      </div>

      {selectedCell && !isComplete && (
        <div className="number-pad">
          <h3>Select a number:</h3>
          <div className="number-buttons">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                className="number-button"
                onClick={() => handleNumberInput(num)}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}

      {isComplete && (
        <div className="completion-message">
          <h2>Congratulations!</h2>
          <p>You solved the puzzle with {errors} errors!</p>
          <button className="play-again-button" onClick={() => generatePuzzle(difficulty)}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Sudoku;
