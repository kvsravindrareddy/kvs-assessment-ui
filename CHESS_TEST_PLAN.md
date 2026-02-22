# Chess Game Testing & Fix Plan

## 🎯 Test Scenarios to Verify

### 1. Basic Gameplay
- [x] Start a new game (vs AI - Easy)
- [ ] Make first move as white (e.g., e2 to e4)
- [ ] AI makes a valid black move
- [ ] Continue for 5-10 moves without errors
- [ ] Verify pieces move according to chess rules

### 2. Check Scenarios
- [ ] Put opponent's king in check with rook
- [ ] Verify "⚠️ CHECK!" message appears
- [ ] Verify only valid escape moves are highlighted
- [ ] Execute a move to escape check
- [ ] Verify game continues normally

### 3. Checkmate Scenarios
#### Scholar's Mate (4 moves)
```
1. e4 e5
2. Bc4 Nc6
3. Qh5 Nf6
4. Qxf7# (Checkmate)
```
- [ ] Execute this sequence
- [ ] Verify checkmate is detected
- [ ] Verify winner modal appears
- [ ] Verify "White Wins!" message

#### Fool's Mate (2 moves)
```
1. f3 e6
2. g4 Qh4# (Checkmate)
```
- [ ] Execute this sequence
- [ ] Verify black wins in 2 moves
- [ ] Verify modal shows "Black Wins!"

### 4. Stalemate Scenario
- [ ] Set up king vs king + pawn endgame
- [ ] Force stalemate position
- [ ] Verify "It's a Draw!" message

### 5. AI Difficulty Testing
#### Easy Mode
- [ ] AI makes random moves
- [ ] Moves are legal
- [ ] AI doesn't hang pieces frequently

#### Medium Mode
- [ ] AI captures pieces when possible
- [ ] AI avoids obvious blunders
- [ ] Makes reasonable moves

#### Hard Mode
- [ ] AI prioritizes high-value captures
- [ ] AI considers piece values
- [ ] More strategic play

### 6. Two-Player Mode
- [ ] Start two-player game
- [ ] White makes a move
- [ ] Black makes a move
- [ ] Turns alternate correctly
- [ ] No AI interference

### 7. Edge Cases
- [ ] Moving into check is prevented
- [ ] King must escape when in check
- [ ] Cannot move if it exposes king
- [ ] Pawn promotion works at row 0/7
- [ ] Captured pieces display correctly
- [ ] Move history records all moves

### 8. UI/UX Tests
- [ ] Selected piece highlights in yellow
- [ ] Valid moves show green indicators
- [ ] Click outside deselects piece
- [ ] Board coordinates (a-h, 1-8) display
- [ ] Captured pieces show on sides
- [ ] "AI Thinking..." indicator shows
- [ ] Game over modal blocks further moves

---

## 🐛 Known Issues & Fixes

### Issue 1: Game Stops When King in Check
**Status**: FIXED ✅
**Fix**: Added move filtering to only show valid escape moves

### Issue 2: Pieces Moving After AI Turn
**Status**: FIXED ✅
**Fix**: Proper board state management in makeMove

### Issue 3: Null Piece Error
**Status**: FIXED ✅
**Fix**: Added null checks and validation

### Issue 4: No Game Over Detection
**Status**: FIXED ✅
**Fix**: Added checkmate and stalemate detection

---

## 🔧 Quick Manual Test Procedure

### Test 1: Simple Game (5 minutes)
1. Login as admin (admin/admin123)
2. Go to Games → Strategy → Chess Master
3. Select "Play vs AI" → Easy
4. Click "Start Game"
5. Make these moves:
   - Click e2 pawn → Click e4
   - Wait for AI move
   - Click Nf3
   - Wait for AI move
   - Continue for 10 moves
6. **Expected**: Game works smoothly, no errors

### Test 2: Check Test (2 minutes)
1. Start new game (Easy mode)
2. Move pieces to check opponent's king
3. **Expected**: "⚠️ CHECK!" appears
4. **Expected**: Only valid escape moves highlight
5. Make escape move
6. **Expected**: Game continues

### Test 3: Checkmate Test (3 minutes)
1. Start new game (Easy mode)
2. Execute Scholar's Mate:
   ```
   White: e4, Bc4, Qh5, Qxf7
   Black: e5, Nc6, Nf6
   ```
3. **Expected**: Modal appears with "♔ White Wins!"
4. **Expected**: Shows game stats
5. Click "Play Again"
6. **Expected**: Returns to setup screen

---

## 📊 Test Results Template

| Test Case | Status | Notes |
|-----------|--------|-------|
| Basic Gameplay | ⏳ | |
| Check Detection | ⏳ | |
| Checkmate - Scholar's Mate | ⏳ | |
| Checkmate - Fool's Mate | ⏳ | |
| Stalemate | ⏳ | |
| AI Easy Mode | ⏳ | |
| AI Medium Mode | ⏳ | |
| AI Hard Mode | ⏳ | |
| Two-Player Mode | ⏳ | |
| Move into Check Prevention | ⏳ | |
| Pawn Promotion | ⏳ | |
| Captured Pieces | ⏳ | |
| Move History | ⏳ | |
| UI Highlighting | ⏳ | |
| Game Over Modal | ⏳ | |

Legend: ⏳ Pending | ✅ Pass | ❌ Fail

---

## 🚀 Running Tests

### Manual Testing
```bash
# Start the application
cd /Users/veera.kakarla/work/code/test/kvs-assessment-ui
npm start

# Login as admin/admin123
# Navigate to Games → Chess Master
# Follow test procedures above
```

### Automated Tests (Future)
```bash
# Run unit tests
npm test Chess.test.js

# Run with coverage
npm test -- --coverage Chess.test.js
```

---

## 📝 Issues to Report

If you encounter any issues, please note:
1. **What you did** (exact moves)
2. **What you expected** (behavior)
3. **What happened** (actual result)
4. **Browser console errors** (F12 → Console tab)
5. **Screenshots** (if applicable)

Example:
```
Issue: Game freezes after checking king
Steps: 1. Moved rook to put king in check
       2. Clicked king to see valid moves
       3. No moves highlighted
Expected: Valid escape moves should highlight
Actual: Nothing happens, game stuck
Console: "Cannot read properties of null (reading 'type')"
```

---

## ✅ Acceptance Criteria

The chess game is considered fully working when:
- [ ] Can play a complete game from start to checkmate
- [ ] Check detection works correctly
- [ ] Checkmate detection ends game properly
- [ ] Stalemate detection works
- [ ] AI makes valid moves on all difficulty levels
- [ ] Two-player mode works correctly
- [ ] No console errors during gameplay
- [ ] Winner announcement displays correctly
- [ ] All UI elements function as expected

---

## 🎓 Quick Chess Rules Reference

For testing purposes:

**Piece Movement:**
- Pawn: Forward 1 (or 2 from start), captures diagonally
- Knight: L-shape (2+1 squares)
- Bishop: Diagonally any distance
- Rook: Horizontally/vertically any distance
- Queen: Any direction any distance
- King: One square any direction

**Special Rules:**
- **Check**: King is under attack
- **Checkmate**: King in check with no escape
- **Stalemate**: No legal moves but not in check
- **Promotion**: Pawn reaches opposite end → becomes Queen

**Test Positions:**
- Scholar's Mate: Quick checkmate in 4 moves
- Fool's Mate: Fastest checkmate in 2 moves
- Back Rank Mate: King trapped by own pieces
