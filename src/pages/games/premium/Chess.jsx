import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './PremiumGames.css';
import './Chess.css';

const Chess = ({ audioEnabled = true }) => {
  const { user } = useAuth();
  const [board, setBoard] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState('ai'); // 'ai' or 'two-player'
  const [difficulty, setDifficulty] = useState('easy');
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'check', 'checkmate', 'stalemate'
  const [winner, setWinner] = useState(null);
  const [thinking, setThinking] = useState(false);

  // Initialize chess board
  const initializeBoard = () => {
    const initialBoard = [
      // Row 8 (Black pieces)
      [
        { type: 'rook', color: 'black', symbol: '♜', moved: false },
        { type: 'knight', color: 'black', symbol: '♞', moved: false },
        { type: 'bishop', color: 'black', symbol: '♝', moved: false },
        { type: 'queen', color: 'black', symbol: '♛', moved: false },
        { type: 'king', color: 'black', symbol: '♚', moved: false },
        { type: 'bishop', color: 'black', symbol: '♝', moved: false },
        { type: 'knight', color: 'black', symbol: '♞', moved: false },
        { type: 'rook', color: 'black', symbol: '♜', moved: false }
      ],
      // Row 7 (Black pawns)
      Array(8).fill(null).map(() => ({ type: 'pawn', color: 'black', symbol: '♟', moved: false })),
      // Rows 6-3 (Empty)
      ...Array(4).fill(null).map(() => Array(8).fill(null)),
      // Row 2 (White pawns)
      Array(8).fill(null).map(() => ({ type: 'pawn', color: 'white', symbol: '♙', moved: false })),
      // Row 1 (White pieces)
      [
        { type: 'rook', color: 'white', symbol: '♖', moved: false },
        { type: 'knight', color: 'white', symbol: '♘', moved: false },
        { type: 'bishop', color: 'white', symbol: '♗', moved: false },
        { type: 'queen', color: 'white', symbol: '♕', moved: false },
        { type: 'king', color: 'white', symbol: '♔', moved: false },
        { type: 'bishop', color: 'white', symbol: '♗', moved: false },
        { type: 'knight', color: 'white', symbol: '♘', moved: false },
        { type: 'rook', color: 'white', symbol: '♖', moved: false }
      ]
    ];
    return initialBoard;
  };

  useEffect(() => {
    if (gameStarted) {
      setBoard(initializeBoard());
      setCapturedPieces({ white: [], black: [] });
      setMoveHistory([]);
      setCurrentPlayer('white');
      setGameStatus('playing');
      setWinner(null);
    }
  }, [gameStarted]);

  // Get valid moves for a piece (includes filtering moves that leave king in check)
  const getValidMoves = (row, col, piece, currentBoard = board, filterCheck = true) => {
    if (!piece) return [];

    const moves = [];
    const { type, color } = piece;

    const isValidSquare = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
    const isEmptyOrEnemy = (r, c) => {
      if (!isValidSquare(r, c)) return false;
      const target = currentBoard[r][c];
      return !target || target.color !== color;
    };

    switch (type) {
      case 'pawn':
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        // Forward move
        if (isValidSquare(row + direction, col) && !currentBoard[row + direction][col]) {
          moves.push([row + direction, col]);
          // Double move from start
          if (row === startRow && !currentBoard[row + 2 * direction][col]) {
            moves.push([row + 2 * direction, col]);
          }
        }

        // Capture diagonally
        [-1, 1].forEach(dc => {
          const newRow = row + direction;
          const newCol = col + dc;
          if (isValidSquare(newRow, newCol)) {
            const target = currentBoard[newRow][newCol];
            if (target && target.color !== color) {
              moves.push([newRow, newCol]);
            }
          }
        });
        break;

      case 'rook':
        // Horizontal and vertical
        [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
          let r = row + dr, c = col + dc;
          while (isValidSquare(r, c)) {
            if (!currentBoard[r][c]) {
              moves.push([r, c]);
            } else {
              if (currentBoard[r][c].color !== color) moves.push([r, c]);
              break;
            }
            r += dr;
            c += dc;
          }
        });
        break;

      case 'knight':
        [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => {
          const newRow = row + dr, newCol = col + dc;
          if (isEmptyOrEnemy(newRow, newCol)) {
            moves.push([newRow, newCol]);
          }
        });
        break;

      case 'bishop':
        // Diagonals
        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
          let r = row + dr, c = col + dc;
          while (isValidSquare(r, c)) {
            if (!currentBoard[r][c]) {
              moves.push([r, c]);
            } else {
              if (currentBoard[r][c].color !== color) moves.push([r, c]);
              break;
            }
            r += dr;
            c += dc;
          }
        });
        break;

      case 'queen':
        // Combination of rook and bishop
        [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
          let r = row + dr, c = col + dc;
          while (isValidSquare(r, c)) {
            if (!currentBoard[r][c]) {
              moves.push([r, c]);
            } else {
              if (currentBoard[r][c].color !== color) moves.push([r, c]);
              break;
            }
            r += dr;
            c += dc;
          }
        });
        break;

      case 'king':
        [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dr, dc]) => {
          const newRow = row + dr, newCol = col + dc;
          if (isEmptyOrEnemy(newRow, newCol)) {
            moves.push([newRow, newCol]);
          }
        });
        break;
    }

    // Filter out moves that would leave king in check
    if (filterCheck) {
      const validMovesFiltered = [];
      for (const [toRow, toCol] of moves) {
        // Simulate the move
        const testBoard = currentBoard.map(row => [...row]);
        testBoard[toRow][toCol] = testBoard[row][col];
        testBoard[row][col] = null;

        // Check if this move leaves the king in check
        if (!isKingInCheck(color, testBoard)) {
          validMovesFiltered.push([toRow, toCol]);
        }
      }
      return validMovesFiltered;
    }

    return moves;
  };

  // Check if king is in check
  const isKingInCheck = (color, currentBoard = board) => {
    // Find king position
    let kingPos = null;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = currentBoard[r][c];
        if (piece && piece.type === 'king' && piece.color === color) {
          kingPos = [r, c];
          break;
        }
      }
      if (kingPos) break;
    }

    if (!kingPos) return false;

    // Check if any enemy piece can attack king
    const enemyColor = color === 'white' ? 'black' : 'white';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = currentBoard[r][c];
        if (piece && piece.color === enemyColor) {
          // Get moves WITHOUT filtering for check (to avoid infinite recursion)
          const moves = getValidMoves(r, c, piece, currentBoard, false);
          if (moves.some(([mr, mc]) => mr === kingPos[0] && mc === kingPos[1])) {
            return true;
          }
        }
      }
    }

    return false;
  };

  // Check if player has any valid moves
  const hasValidMoves = (color, currentBoard = board) => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = currentBoard[r][c];
        if (piece && piece.color === color) {
          // Get moves with check filtering already applied
          const moves = getValidMoves(r, c, piece, currentBoard, true);
          if (moves.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Check for checkmate or stalemate
  const checkGameOver = (color, currentBoard) => {
    const inCheck = isKingInCheck(color, currentBoard);
    const hasMovesAvailable = hasValidMoves(color, currentBoard);

    if (!hasMovesAvailable) {
      if (inCheck) {
        // Checkmate
        const winner = color === 'white' ? 'black' : 'white';
        setGameStatus('checkmate');
        setWinner(winner);
        if (audioEnabled) playSound('win');
        return true;
      } else {
        // Stalemate
        setGameStatus('stalemate');
        setWinner('draw');
        if (audioEnabled) playSound('draw');
        return true;
      }
    }
    return false;
  };

  // Handle square click
  const handleSquareClick = (row, col) => {
    if (gameStatus !== 'playing') return;
    if (gameMode === 'ai' && currentPlayer === 'black') return; // AI's turn
    if (thinking) return;

    const piece = board[row][col];

    // If no square selected
    if (!selectedSquare) {
      if (piece && piece.color === currentPlayer) {
        setSelectedSquare([row, col]);
        const moves = getValidMoves(row, col, piece);
        setValidMoves(moves);
      }
      return;
    }

    // If clicking the same square
    if (selectedSquare[0] === row && selectedSquare[1] === col) {
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    // If clicking a valid move
    const isValidMove = validMoves.some(([r, c]) => r === row && c === col);
    if (isValidMove) {
      makeMove(selectedSquare[0], selectedSquare[1], row, col, board);
    } else if (piece && piece.color === currentPlayer) {
      // Select different piece
      setSelectedSquare([row, col]);
      const moves = getValidMoves(row, col, piece);
      setValidMoves(moves);
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  // Make a move
  const makeMove = (fromRow, fromCol, toRow, toCol, currentBoard = board) => {
    // Validate the move
    if (!currentBoard[fromRow] || !currentBoard[fromRow][fromCol]) {
      console.error('Invalid move: no piece at source position');
      return;
    }

    const newBoard = currentBoard.map(row => [...row]);
    const piece = newBoard[fromRow][fromCol];

    if (!piece) {
      console.error('Invalid move: piece is null');
      return;
    }

    const capturedPiece = newBoard[toRow][toCol];

    // Update captured pieces
    if (capturedPiece) {
      const newCaptured = { ...capturedPieces };
      newCaptured[piece.color].push(capturedPiece);
      setCapturedPieces(newCaptured);
    }

    // Move piece
    newBoard[toRow][toCol] = { ...piece, moved: true };
    newBoard[fromRow][fromCol] = null;

    // Pawn promotion
    if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
      newBoard[toRow][toCol] = {
        type: 'queen',
        color: piece.color,
        symbol: piece.color === 'white' ? '♕' : '♛',
        moved: true
      };
    }

    setBoard(newBoard);
    setSelectedSquare(null);
    setValidMoves([]);

    // Add to move history
    const notation = `${piece.symbol} ${String.fromCharCode(97 + fromCol)}${8 - fromRow} → ${String.fromCharCode(97 + toCol)}${8 - toRow}`;
    setMoveHistory(prev => [...prev, notation]);

    // Check game status
    const nextPlayer = piece.color === 'white' ? 'black' : 'white';

    // Check for game over
    const gameOver = checkGameOver(nextPlayer, newBoard);

    if (!gameOver) {
      const inCheck = isKingInCheck(nextPlayer, newBoard);

      if (inCheck) {
        setGameStatus('check');
        if (audioEnabled) playSound('check');
      } else {
        setGameStatus('playing');
      }

      // Switch player
      setCurrentPlayer(nextPlayer);

      // AI move - only if it's AI mode and next player is black
      if (gameMode === 'ai' && nextPlayer === 'black') {
        setTimeout(() => makeAIMove(newBoard), 1000);
      }
    }

    if (audioEnabled) playSound('move');
  };

  // Simple AI move
  const makeAIMove = (currentBoard) => {
    setThinking(true);

    setTimeout(() => {
      // Validate board
      if (!currentBoard || currentBoard.length !== 8) {
        console.error('Invalid board state for AI');
        setThinking(false);
        return;
      }

      // Get all possible moves for black
      const allMoves = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = currentBoard[r][c];
          if (piece && piece.color === 'black') {
            const moves = getValidMoves(r, c, piece, currentBoard);
            moves.forEach(([toRow, toCol]) => {
              allMoves.push({ from: [r, c], to: [toRow, toCol], piece });
            });
          }
        }
      }

      if (allMoves.length > 0) {
        let selectedMove;

        if (difficulty === 'easy') {
          // Random move
          selectedMove = allMoves[Math.floor(Math.random() * allMoves.length)];
        } else if (difficulty === 'medium') {
          // Prefer captures
          const captures = allMoves.filter(move => currentBoard[move.to[0]][move.to[1]]);
          selectedMove = captures.length > 0
            ? captures[Math.floor(Math.random() * captures.length)]
            : allMoves[Math.floor(Math.random() * allMoves.length)];
        } else {
          // Hard: Prefer high-value captures
          const scoredMoves = allMoves.map(move => {
            let score = 0;
            const target = currentBoard[move.to[0]][move.to[1]];
            if (target) {
              const values = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 100 };
              score = values[target.type] || 0;
            }
            return { move, score };
          });
          scoredMoves.sort((a, b) => b.score - a.score);
          const topMoves = scoredMoves.filter(m => m.score === scoredMoves[0].score);
          selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)].move;
        }

        const [fromRow, fromCol] = selectedMove.from;
        const [toRow, toCol] = selectedMove.to;

        // Pass the current board to makeMove
        makeMove(fromRow, fromCol, toRow, toCol, currentBoard);
      }

      setThinking(false);
    }, 500);
  };

  const playSound = (type) => {
    // Simple audio feedback
    const audio = new Audio();
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  // Game Over Modal Component
  const GameOverModal = () => {
    if (gameStatus !== 'checkmate' && gameStatus !== 'stalemate') return null;

    return (
      <div className="game-over-modal">
        <div className="game-over-content">
          <h1 className="game-over-title">
            {gameStatus === 'checkmate' ? '🏆 Checkmate!' : '🤝 Stalemate!'}
          </h1>
          <div className="winner-announcement">
            {gameStatus === 'checkmate' ? (
              <>
                <p className="winner-text">
                  {winner === 'white' ? '♔ White Wins!' : '♚ Black Wins!'}
                </p>
                <p className="winner-subtitle">
                  {winner === 'white' && gameMode === 'ai' ? 'You defeated the AI!' :
                   winner === 'black' && gameMode === 'ai' ? 'AI wins this round!' :
                   winner === 'white' ? 'White player is victorious!' : 'Black player is victorious!'}
                </p>
              </>
            ) : (
              <>
                <p className="winner-text">It's a Draw!</p>
                <p className="winner-subtitle">No valid moves available - Stalemate</p>
              </>
            )}
          </div>
          <div className="game-over-stats">
            <div className="stat-item">
              <span className="stat-label">Total Moves:</span>
              <span className="stat-value">{moveHistory.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pieces Captured by White:</span>
              <span className="stat-value">{capturedPieces.white.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pieces Captured by Black:</span>
              <span className="stat-value">{capturedPieces.black.length}</span>
            </div>
          </div>
          <button className="play-again-btn" onClick={resetGame}>
            🔄 Play Again
          </button>
        </div>
      </div>
    );
  };

  const resetGame = () => {
    setGameStarted(false);
    setSelectedSquare(null);
    setValidMoves([]);
    setCurrentPlayer('white');
    setGameStatus('playing');
    setWinner(null);
  };

  if (!gameStarted) {
    return (
      <div className="premium-game-container">
        <div className="game-intro">
          <h1 className="game-title">♟️ Chess Master</h1>
          <p className="game-description">
            Learn and play the classic game of chess!
          </p>

          <div className="chess-mode-selector">
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
            <div className="level-selector">
              <h3>Choose Difficulty:</h3>
              <div className="level-grid">
                <button
                  className={`level-btn ${difficulty === 'easy' ? 'active' : ''}`}
                  onClick={() => setDifficulty('easy')}
                >
                  🟢 Easy<br/><small>Random moves</small>
                </button>
                <button
                  className={`level-btn ${difficulty === 'medium' ? 'active' : ''}`}
                  onClick={() => setDifficulty('medium')}
                >
                  🟡 Medium<br/><small>Captures pieces</small>
                </button>
                <button
                  className={`level-btn ${difficulty === 'hard' ? 'active' : ''}`}
                  onClick={() => setDifficulty('hard')}
                >
                  🔴 Hard<br/><small>Smart strategy</small>
                </button>
              </div>
            </div>
          )}

          <div className="rules-box">
            <h3>♛ How to Play:</h3>
            <ul>
              <li>Click a piece to select it</li>
              <li>Valid moves will be highlighted</li>
              <li>Click a highlighted square to move</li>
              <li>Capture enemy pieces to win!</li>
              <li>Protect your King at all costs</li>
            </ul>
          </div>

          <button className="start-game-btn" onClick={() => setGameStarted(true)}>
            ♔ Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-game-container chess-game">
      <div className="chess-header">
        <div className="game-stats-row">
          <span className="stat big">
            {currentPlayer === 'white' ? '♔' : '♚'} Turn: {currentPlayer === 'white' ? 'White' : 'Black'}
          </span>
          {gameStatus === 'check' && <span className="stat big check-status">⚠️ CHECK!</span>}
          {thinking && <span className="stat big">🤔 AI Thinking...</span>}
        </div>
      </div>

      <div className="chess-main-container">
        {/* Captured Pieces - Black */}
        <div className="captured-pieces black-captured">
          <h4>Captured by White:</h4>
          <div className="captured-display">
            {capturedPieces.white.map((piece, idx) => (
              <span key={idx} className="captured-piece">{piece.symbol}</span>
            ))}
          </div>
        </div>

        {/* Chess Board */}
        <div className="chess-board-container">
          <div className="chess-board">
            {board.map((row, rowIndex) => (
              row.map((piece, colIndex) => {
                const isLight = (rowIndex + colIndex) % 2 === 0;
                const isSelected = selectedSquare && selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex;
                const isValidMove = validMoves.some(([r, c]) => r === rowIndex && c === colIndex);

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`chess-square ${isLight ? 'light' : 'dark'} ${isSelected ? 'selected' : ''} ${isValidMove ? 'valid-move' : ''}`}
                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                  >
                    {piece && (
                      <div className={`chess-piece ${piece.color}`}>
                        {piece.symbol}
                      </div>
                    )}
                    {isValidMove && <div className="move-indicator"></div>}
                    {colIndex === 0 && <div className="row-label">{8 - rowIndex}</div>}
                    {rowIndex === 7 && <div className="col-label">{String.fromCharCode(97 + colIndex)}</div>}
                  </div>
                );
              })
            ))}
          </div>
        </div>

        {/* Captured Pieces - White */}
        <div className="captured-pieces white-captured">
          <h4>Captured by Black:</h4>
          <div className="captured-display">
            {capturedPieces.black.map((piece, idx) => (
              <span key={idx} className="captured-piece">{piece.symbol}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Move History */}
      <div className="move-history">
        <h4>Move History:</h4>
        <div className="moves-list">
          {moveHistory.length === 0 ? (
            <p className="no-moves">No moves yet</p>
          ) : (
            moveHistory.map((move, idx) => (
              <div key={idx} className="move-item">
                <span className="move-number">{idx + 1}.</span>
                <span className="move-notation">{move}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="action-btn clear" onClick={resetGame}>
          🔄 New Game
        </button>
      </div>

      {/* Game Over Modal */}
      <GameOverModal />
    </div>
  );
};

export default Chess;
