#!/usr/bin/env node

/**
 * Chess Functional Testing Script
 * Tests all chess game logic without UI
 */

// Chess piece creation
const createPiece = (type, color) => ({
  type,
  color,
  symbol: getSymbol(type, color),
  moved: false
});

const getSymbol = (type, color) => {
  const symbols = {
    white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
    black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
  };
  return symbols[color][type];
};

// Initialize chess board
const initializeBoard = () => {
  const board = [
    // Row 8 (Black pieces)
    [
      createPiece('rook', 'black'),
      createPiece('knight', 'black'),
      createPiece('bishop', 'black'),
      createPiece('queen', 'black'),
      createPiece('king', 'black'),
      createPiece('bishop', 'black'),
      createPiece('knight', 'black'),
      createPiece('rook', 'black')
    ],
    // Row 7 (Black pawns)
    Array(8).fill(null).map(() => createPiece('pawn', 'black')),
    // Rows 6-3 (Empty)
    ...Array(4).fill(null).map(() => Array(8).fill(null)),
    // Row 2 (White pawns)
    Array(8).fill(null).map(() => createPiece('pawn', 'white')),
    // Row 1 (White pieces)
    [
      createPiece('rook', 'white'),
      createPiece('knight', 'white'),
      createPiece('bishop', 'white'),
      createPiece('queen', 'white'),
      createPiece('king', 'white'),
      createPiece('bishop', 'white'),
      createPiece('knight', 'white'),
      createPiece('rook', 'white')
    ]
  ];
  return board;
};

// Get valid moves for a piece
const getValidMoves = (row, col, piece, board) => {
  if (!piece) return [];

  const moves = [];
  const { type, color } = piece;

  const isValidSquare = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  const isEmptyOrEnemy = (r, c) => {
    if (!isValidSquare(r, c)) return false;
    const target = board[r][c];
    return !target || target.color !== color;
  };

  switch (type) {
    case 'pawn':
      const direction = color === 'white' ? -1 : 1;
      const startRow = color === 'white' ? 6 : 1;

      // Forward move
      if (isValidSquare(row + direction, col) && !board[row + direction][col]) {
        moves.push([row + direction, col]);
        // Double move from start
        if (row === startRow && !board[row + 2 * direction][col]) {
          moves.push([row + 2 * direction, col]);
        }
      }

      // Capture diagonally
      [-1, 1].forEach(dc => {
        const newRow = row + direction;
        const newCol = col + dc;
        if (isValidSquare(newRow, newCol)) {
          const target = board[newRow][newCol];
          if (target && target.color !== color) {
            moves.push([newRow, newCol]);
          }
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

    case 'rook':
      [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
        let r = row + dr, c = col + dc;
        while (isValidSquare(r, c)) {
          if (!board[r][c]) {
            moves.push([r, c]);
          } else {
            if (board[r][c].color !== color) moves.push([r, c]);
            break;
          }
          r += dr;
          c += dc;
        }
      });
      break;

    case 'bishop':
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
        let r = row + dr, c = col + dc;
        while (isValidSquare(r, c)) {
          if (!board[r][c]) {
            moves.push([r, c]);
          } else {
            if (board[r][c].color !== color) moves.push([r, c]);
            break;
          }
          r += dr;
          c += dc;
        }
      });
      break;

    case 'queen':
      [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
        let r = row + dr, c = col + dc;
        while (isValidSquare(r, c)) {
          if (!board[r][c]) {
            moves.push([r, c]);
          } else {
            if (board[r][c].color !== color) moves.push([r, c]);
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

  return moves;
};

// Check if king is in check
const isKingInCheck = (color, board) => {
  let kingPos = null;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'king' && piece.color === color) {
        kingPos = [r, c];
        break;
      }
    }
    if (kingPos) break;
  }

  if (!kingPos) return false;

  const enemyColor = color === 'white' ? 'black' : 'white';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === enemyColor) {
        const moves = getValidMoves(r, c, piece, board);
        if (moves.some(([mr, mc]) => mr === kingPos[0] && mc === kingPos[1])) {
          return true;
        }
      }
    }
  }

  return false;
};

// Make a move
const makeMove = (board, fromRow, fromCol, toRow, toCol) => {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[fromRow][fromCol];

  if (!piece) return null;

  newBoard[toRow][toCol] = { ...piece, moved: true };
  newBoard[fromRow][fromCol] = null;

  // Pawn promotion
  if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
    newBoard[toRow][toCol] = createPiece('queen', piece.color);
  }

  return newBoard;
};

// Print board
const printBoard = (board) => {
  console.log('\n  a b c d e f g h');
  for (let r = 0; r < 8; r++) {
    let row = (8 - r) + ' ';
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      row += piece ? piece.symbol + ' ' : '. ';
    }
    console.log(row);
  }
  console.log('');
};

// Test results
let passedTests = 0;
let failedTests = 0;

const test = (name, testFn) => {
  try {
    testFn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}`);
    failedTests++;
  }
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
};

// Run tests
console.log('\n🧪 Running Chess Functional Tests\n');
console.log('='.repeat(50));

// Test 1: Board initialization
test('Board initializes correctly', () => {
  const board = initializeBoard();
  assert(board.length === 8, 'Board should have 8 rows');
  assert(board[0].length === 8, 'Board should have 8 columns');
  assert(board[7][4].type === 'king', 'White king should be at e1');
  assert(board[0][4].type === 'king', 'Black king should be at e8');
});

// Test 2: Pawn movement
test('Pawn can move forward', () => {
  const board = initializeBoard();
  const moves = getValidMoves(6, 4, board[6][4], board);
  assert(moves.length >= 2, 'Pawn should have at least 2 moves from start');
  assert(moves.some(([r, c]) => r === 5 && c === 4), 'Pawn should be able to move to e3');
  assert(moves.some(([r, c]) => r === 4 && c === 4), 'Pawn should be able to move to e4');
});

// Test 3: Knight movement
test('Knight moves in L-shape', () => {
  const board = initializeBoard();
  const moves = getValidMoves(7, 1, board[7][1], board);
  assert(moves.length === 2, 'Knight should have 2 moves from b1');
  assert(moves.some(([r, c]) => r === 5 && c === 0), 'Knight can move to a3');
  assert(moves.some(([r, c]) => r === 5 && c === 2), 'Knight can move to c3');
});

// Test 4: Simple move execution
test('Can execute a simple move', () => {
  const board = initializeBoard();
  const newBoard = makeMove(board, 6, 4, 4, 4); // e2 to e4
  assert(newBoard !== null, 'Move should succeed');
  assert(newBoard[4][4] !== null, 'Piece should be at destination');
  assert(newBoard[4][4].type === 'pawn', 'Moved piece should be a pawn');
  assert(newBoard[6][4] === null, 'Source square should be empty');
});

// Test 5: Check detection - rook
test('Detects check from rook', () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  board[4][4] = createPiece('king', 'white');
  board[4][0] = createPiece('rook', 'black');

  const inCheck = isKingInCheck('white', board);
  assert(inCheck === true, 'White king should be in check from black rook');
});

// Test 6: Check detection - knight
test('Detects check from knight', () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  board[4][4] = createPiece('king', 'white');
  board[2][3] = createPiece('knight', 'black');

  const inCheck = isKingInCheck('white', board);
  assert(inCheck === true, 'White king should be in check from black knight');
});

// Test 7: No false check
test('No false check detection', () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  board[4][4] = createPiece('king', 'white');
  board[4][0] = createPiece('rook', 'white');

  const inCheck = isKingInCheck('white', board);
  assert(inCheck === false, 'White king should NOT be in check from own rook');
});

// Test 8: Pawn promotion
test('Pawn promotes to queen', () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  board[1][4] = createPiece('pawn', 'white');

  const newBoard = makeMove(board, 1, 4, 0, 4);
  assert(newBoard[0][4].type === 'queen', 'Pawn should promote to queen');
  assert(newBoard[0][4].color === 'white', 'Promoted queen should be white');
});

// Test 9: Scholar's Mate setup
test('Can setup Scholar\'s Mate position', () => {
  let board = initializeBoard();

  // 1. e4
  board = makeMove(board, 6, 4, 4, 4);
  assert(board !== null, 'Move e4 should succeed');

  // 1... e5
  board = makeMove(board, 1, 4, 3, 4);
  assert(board !== null, 'Move e5 should succeed');

  // 2. Bc4
  board = makeMove(board, 7, 5, 4, 2);
  assert(board !== null, 'Move Bc4 should succeed');

  // 2... Nc6
  board = makeMove(board, 0, 1, 2, 2);
  assert(board !== null, 'Move Nc6 should succeed');

  assert(board[4][2].type === 'bishop', 'Bishop should be on c4');
  assert(board[2][2].type === 'knight', 'Knight should be on c6');
});

// Test 10: Rook movement along rank
test('Rook can move along entire rank when clear', () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  board[4][4] = createPiece('rook', 'white');

  const moves = getValidMoves(4, 4, board[4][4], board);
  assert(moves.length === 14, 'Rook should have 14 moves (7 horizontal + 7 vertical)');
});

// Test 11: Bishop blocked by pieces
test('Bishop blocked by own pieces', () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  board[4][4] = createPiece('bishop', 'white');
  board[2][2] = createPiece('pawn', 'white');

  const moves = getValidMoves(4, 4, board[4][4], board);
  assert(!moves.some(([r, c]) => r === 2 && c === 2), 'Bishop cannot move to square occupied by own piece');
  assert(!moves.some(([r, c]) => r === 1 && c === 1), 'Bishop cannot jump over own pieces');
});

// Test 12: Queen movement
test('Queen combines rook and bishop moves', () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  board[4][4] = createPiece('queen', 'white');

  const moves = getValidMoves(4, 4, board[4][4], board);
  assert(moves.length === 27, 'Queen should have 27 moves from center');
});

// Test 13: King movement
test('King moves one square', () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  board[4][4] = createPiece('king', 'white');

  const moves = getValidMoves(4, 4, board[4][4], board);
  assert(moves.length === 8, 'King should have 8 moves from center');
});

// Test 14: Piece capture
test('Piece can capture enemy piece', () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  board[4][4] = createPiece('pawn', 'white');
  board[3][3] = createPiece('pawn', 'black');

  const moves = getValidMoves(4, 4, board[4][4], board);
  assert(moves.some(([r, c]) => r === 3 && c === 3), 'White pawn should be able to capture black pawn diagonally');
});

// Test 15: No self-capture
test('Piece cannot capture own piece', () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  board[4][4] = createPiece('rook', 'white');
  board[4][6] = createPiece('pawn', 'white');

  const moves = getValidMoves(4, 4, board[4][4], board);
  assert(!moves.some(([r, c]) => r === 4 && c === 6), 'Rook cannot capture own pawn');
});

// Print summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Test Summary:');
console.log(`   Total: ${passedTests + failedTests}`);
console.log(`   ✅ Passed: ${passedTests}`);
console.log(`   ❌ Failed: ${failedTests}`);
console.log(`   Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%\n`);

if (failedTests === 0) {
  console.log('🎉 All tests passed! Chess logic is working correctly.\n');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please review the errors above.\n');
  process.exit(1);
}
