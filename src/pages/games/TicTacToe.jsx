import React, { useState, useEffect } from 'react';
import './TicTacToe.css';

const TicTacToe = ({ audioEnabled = true }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameMode, setGameMode] = useState(null); // 'ai' or 'two-player'
  const [difficulty, setDifficulty] = useState('medium');
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [thinking, setThinking] = useState(false);

  // Winning combinations
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  // Check for winner
  const calculateWinner = (squares) => {
    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line };
      }
    }
    return null;
  };

  // Check if board is full
  const isBoardFull = (squares) => {
    return squares.every(square => square !== null);
  };

  // AI Move - Minimax algorithm
  const minimax = (squares, depth, isMaximizing, alpha, beta) => {
    const result = calculateWinner(squares);

    if (result) {
      return result.winner === 'O' ? 10 - depth : depth - 10;
    }

    if (isBoardFull(squares)) {
      return 0;
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'O';
          const evaluation = minimax(squares, depth + 1, false, alpha, beta);
          squares[i] = null;
          maxEval = Math.max(maxEval, evaluation);
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) break; // Alpha-beta pruning
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'X';
          const evaluation = minimax(squares, depth + 1, true, alpha, beta);
          squares[i] = null;
          minEval = Math.min(minEval, evaluation);
          beta = Math.min(beta, evaluation);
          if (beta <= alpha) break; // Alpha-beta pruning
        }
      }
      return minEval;
    }
  };

  // Get best move for AI
  const getBestMove = (squares, difficultyLevel) => {
    const availableMoves = squares.map((sq, idx) => sq === null ? idx : null).filter(idx => idx !== null);

    if (difficultyLevel === 'easy') {
      // Random move
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    if (difficultyLevel === 'medium') {
      // 70% optimal, 30% random
      if (Math.random() < 0.7) {
        // Check for winning move
        for (let move of availableMoves) {
          const testBoard = [...squares];
          testBoard[move] = 'O';
          if (calculateWinner(testBoard)) {
            return move;
          }
        }

        // Block player's winning move
        for (let move of availableMoves) {
          const testBoard = [...squares];
          testBoard[move] = 'X';
          if (calculateWinner(testBoard)) {
            return move;
          }
        }

        // Take center if available
        if (squares[4] === null) return 4;

        // Take corner
        const corners = [0, 2, 6, 8].filter(i => squares[i] === null);
        if (corners.length > 0) {
          return corners[Math.floor(Math.random() * corners.length)];
        }
      }
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    // Hard mode - Unbeatable with minimax
    let bestScore = -Infinity;
    let bestMove = availableMoves[0];

    for (let move of availableMoves) {
      const testBoard = [...squares];
      testBoard[move] = 'O';
      const moveScore = minimax(testBoard, 0, false, -Infinity, Infinity);
      if (moveScore > bestScore) {
        bestScore = moveScore;
        bestMove = move;
      }
    }

    return bestMove;
  };

  // Handle square click
  const handleClick = (index) => {
    if (board[index] || winner || thinking) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const result = calculateWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setScores(prev => ({ ...prev, [result.winner]: prev[result.winner] + 1 }));
      if (audioEnabled) playSound('win');
      return;
    }

    if (isBoardFull(newBoard)) {
      setWinner('draw');
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      if (audioEnabled) playSound('draw');
      return;
    }

    setIsXNext(!isXNext);

    // AI move
    if (gameMode === 'ai' && isXNext) {
      setThinking(true);
      setTimeout(() => {
        makeAIMove(newBoard);
        setThinking(false);
      }, 500);
    }

    if (audioEnabled) playSound('move');
  };

  // AI makes move
  const makeAIMove = (currentBoard) => {
    const aiMove = getBestMove(currentBoard, difficulty);
    const newBoard = [...currentBoard];
    newBoard[aiMove] = 'O';
    setBoard(newBoard);

    const result = calculateWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setScores(prev => ({ ...prev, [result.winner]: prev[result.winner] + 1 }));
      if (audioEnabled) playSound('win');
      return;
    }

    if (isBoardFull(newBoard)) {
      setWinner('draw');
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      if (audioEnabled) playSound('draw');
      return;
    }

    setIsXNext(true);
    if (audioEnabled) playSound('move');
  };

  // Reset game
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine([]);
  };

  // Reset all (including scores)
  const resetAll = () => {
    resetGame();
    setScores({ X: 0, O: 0, draws: 0 });
    setGameStarted(false);
    setGameMode(null);
  };

  // Play sound
  const playSound = (type) => {
    const audio = new Audio();
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  // Start game
  const startGame = () => {
    setGameStarted(true);
    resetGame();
  };

  // Game setup screen
  if (!gameStarted) {
    return (
      <div className="tictactoe-container">
        <div className="tictactoe-intro">
          <h1 className="tictactoe-title">❌⭕ Tic-Tac-Toe</h1>
          <p className="tictactoe-description">
            Classic strategy game - Get three in a row to win!
          </p>

          <div className="mode-selector">
            <h3>Choose Game Mode:</h3>
            <div className="mode-buttons">
              <button
                className={`mode-btn ${gameMode === 'ai' ? 'active' : ''}`}
                onClick={() => setGameMode('ai')}
              >
                🤖 Play vs AI
              </button>
              <button
                className={`mode-btn ${gameMode === 'two-player' ? 'active' : ''}`}
                onClick={() => setGameMode('two-player')}
              >
                👥 Two Players
              </button>
            </div>
          </div>

          {gameMode === 'ai' && (
            <div className="difficulty-selector">
              <h3>Choose Difficulty:</h3>
              <div className="difficulty-buttons">
                <button
                  className={`diff-btn easy ${difficulty === 'easy' ? 'active' : ''}`}
                  onClick={() => setDifficulty('easy')}
                >
                  🟢 Easy<br/><small>Random moves</small>
                </button>
                <button
                  className={`diff-btn medium ${difficulty === 'medium' ? 'active' : ''}`}
                  onClick={() => setDifficulty('medium')}
                >
                  🟡 Medium<br/><small>Smart moves</small>
                </button>
                <button
                  className={`diff-btn hard ${difficulty === 'hard' ? 'active' : ''}`}
                  onClick={() => setDifficulty('hard')}
                >
                  🔴 Hard<br/><small>Unbeatable!</small>
                </button>
              </div>
            </div>
          )}

          <div className="rules-box">
            <h3>📋 How to Play:</h3>
            <ul>
              <li>Players take turns placing X or O</li>
              <li>Get 3 in a row (horizontal, vertical, or diagonal)</li>
              <li>Block your opponent from winning</li>
              <li>First to 3 in a row wins!</li>
            </ul>
          </div>

          <button
            className="start-btn"
            onClick={startGame}
            disabled={!gameMode}
          >
            🎮 Start Game
          </button>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div className="tictactoe-container">
      <div className="tictactoe-header">
        <h2 className="game-title-small">
          {gameMode === 'ai' ? '🤖 You (X) vs AI (O)' : '👥 Two Player Mode'}
        </h2>
        {gameMode === 'ai' && (
          <div className="difficulty-badge">{difficulty.toUpperCase()} MODE</div>
        )}
      </div>

      {/* Scoreboard */}
      <div className="scoreboard">
        <div className="score-item x-score">
          <span className="score-label">X</span>
          <span className="score-value">{scores.X}</span>
        </div>
        <div className="score-item draw-score">
          <span className="score-label">Draws</span>
          <span className="score-value">{scores.draws}</span>
        </div>
        <div className="score-item o-score">
          <span className="score-label">O</span>
          <span className="score-value">{scores.O}</span>
        </div>
      </div>

      {/* Game status */}
      <div className="game-status">
        {thinking ? (
          <span className="status-thinking">🤔 AI is thinking...</span>
        ) : winner ? (
          winner === 'draw' ? (
            <span className="status-draw">🤝 It's a Draw!</span>
          ) : (
            <span className={`status-winner ${winner.toLowerCase()}`}>
              {winner === 'X' ? '🎉 X Wins!' : '🎉 O Wins!'}
            </span>
          )
        ) : (
          <span className="status-turn">
            {isXNext ? '❌ X' : '⭕ O'}'s Turn
          </span>
        )}
      </div>

      {/* Game board */}
      <div className="tictactoe-board">
        {board.map((square, index) => (
          <button
            key={index}
            className={`tictactoe-square ${square ? square.toLowerCase() : ''} ${
              winningLine.includes(index) ? 'winning' : ''
            }`}
            onClick={() => handleClick(index)}
            disabled={!!winner || thinking}
          >
            {square && (
              <span className="square-symbol">
                {square === 'X' ? '❌' : '⭕'}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="action-buttons">
        <button className="action-btn reset" onClick={resetGame}>
          🔄 New Round
        </button>
        <button className="action-btn quit" onClick={resetAll}>
          🏠 Main Menu
        </button>
      </div>

      {/* Winner modal */}
      {winner && (
        <div className="winner-modal">
          <div className="winner-content">
            <h2 className="winner-title">
              {winner === 'draw' ? '🤝 Draw!' : `🏆 ${winner} Wins!`}
            </h2>
            <p className="winner-subtitle">
              {winner === 'X' && gameMode === 'ai' ? 'You beat the AI!' :
               winner === 'O' && gameMode === 'ai' ? 'AI wins this round!' :
               winner === 'draw' ? 'Well played by both!' :
               `Player ${winner} is victorious!`}
            </p>
            <div className="winner-scores">
              <div className="winner-score-item">
                <span>X: {scores.X}</span>
              </div>
              <div className="winner-score-item">
                <span>Draws: {scores.draws}</span>
              </div>
              <div className="winner-score-item">
                <span>O: {scores.O}</span>
              </div>
            </div>
            <button className="play-again-btn" onClick={resetGame}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicTacToe;
