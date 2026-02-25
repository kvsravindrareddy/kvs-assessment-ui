import React, { useState, useEffect } from 'react';
import './Physical.css';

const DanceChallenge = ({ audioEnabled = true }) => {
  const [moves, setMoves] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState('freestyle'); // freestyle, follow, challenge
  const [difficulty, setDifficulty] = useState('easy');
  const [timeLeft, setTimeLeft] = useState(60);
  const [feedback, setFeedback] = useState('');
  const [isPerforming, setIsPerforming] = useState(false);
  const [movesCompleted, setMovesCompleted] = useState(0);

  // Dance moves database
  const danceMovesLibrary = {
    easy: [
      { name: 'Clap', emoji: '👏', instructions: 'Clap your hands above your head!', points: 10 },
      { name: 'Jump', emoji: '🦘', instructions: 'Jump up high!', points: 10 },
      { name: 'Spin', emoji: '🌀', instructions: 'Spin around once!', points: 15 },
      { name: 'Wave', emoji: '👋', instructions: 'Wave your arms side to side!', points: 10 },
      { name: 'Stomp', emoji: '👟', instructions: 'Stomp your feet!', points: 10 },
      { name: 'Reach Up', emoji: '🙌', instructions: 'Reach both arms to the sky!', points: 10 },
      { name: 'Touch Toes', emoji: '🤸', instructions: 'Bend down and touch your toes!', points: 15 }
    ],
    medium: [
      { name: 'Moonwalk', emoji: '🌙', instructions: 'Slide backwards like Michael Jackson!', points: 25 },
      { name: 'Running Man', emoji: '🏃', instructions: 'Run in place with style!', points: 20 },
      { name: 'Body Roll', emoji: '🌊', instructions: 'Roll your body in a wave motion!', points: 30 },
      { name: 'Grapevine', emoji: '🍇', instructions: 'Step side, cross, side, tap!', points: 25 },
      { name: 'Twist', emoji: '🔄', instructions: 'Twist your hips left and right!', points: 20 },
      { name: 'Shoulder Pop', emoji: '💥', instructions: 'Pop your shoulders to the beat!', points: 25 },
      { name: 'Slide', emoji: '⚡', instructions: 'Slide smoothly to the left!', points: 20 },
      { name: 'Knee Lift', emoji: '🦵', instructions: 'Lift knees alternating high!', points: 20 }
    ],
    hard: [
      { name: 'Windmill', emoji: '💨', instructions: 'Rotate arms in big circles!', points: 35 },
      { name: 'Freeze Pose', emoji: '🥶', instructions: 'Strike a dramatic freeze!', points: 40 },
      { name: 'Kick Ball Change', emoji: '⚽', instructions: 'Kick, step back, step forward!', points: 35 },
      { name: 'Hip Hop Combo', emoji: '🎵', instructions: 'Bounce with attitude!', points: 40 },
      { name: 'Wave & Spin', emoji: '🌊', instructions: 'Wave your arms while spinning!', points: 45 },
      { name: 'Butterfly', emoji: '🦋', instructions: 'Cross and uncross arms rhythmically!', points: 35 },
      { name: 'Drop & Pop', emoji: '💫', instructions: 'Drop low then pop up!', points: 40 },
      { name: 'Robot', emoji: '🤖', instructions: 'Move like a robot, stiff and precise!', points: 35 },
      { name: 'Floss', emoji: '🦷', instructions: 'Swing arms and hips opposite!', points: 40 }
    ]
  };

  const gameModeSettings = {
    freestyle: { duration: 60, movesCount: 10, instruction: 'Dance freely and press "Done" for each move!' },
    follow: { duration: 90, movesCount: 12, instruction: 'Follow the moves shown on screen!' },
    challenge: { duration: 120, movesCount: 15, instruction: 'Complete the advanced dance routine!' }
  };

  // Timer
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !isPerforming) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted) {
      endGame();
    }
  }, [timeLeft, gameStarted, isPerforming]);

  // Generate dance routine
  const generateRoutine = () => {
    const movesList = danceMovesLibrary[difficulty];
    const routineLength = gameModeSettings[gameMode].movesCount;
    const newMoves = [];

    for (let i = 0; i < routineLength; i++) {
      const randomMove = movesList[Math.floor(Math.random() * movesList.length)];
      newMoves.push({ ...randomMove, id: i });
    }

    setMoves(newMoves);
    setCurrentMoveIndex(0);
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setCombo(0);
    setMovesCompleted(0);
    setTimeLeft(gameModeSettings[gameMode].duration);
    setFeedback('');
    generateRoutine();
  };

  const performMove = () => {
    if (currentMoveIndex >= moves.length) {
      endGame();
      return;
    }

    setIsPerforming(true);

    // Give player time to perform the move
    setTimeout(() => {
      completeMove();
    }, 3000); // 3 seconds to perform each move
  };

  const completeMove = () => {
    const currentMove = moves[currentMoveIndex];
    const comboBonus = Math.floor(combo / 3) * 5;
    const totalPoints = currentMove.points + comboBonus;

    setScore(prev => prev + totalPoints);
    setCombo(prev => {
      const newCombo = prev + 1;
      if (newCombo > bestCombo) setBestCombo(newCombo);
      return newCombo;
    });
    setMovesCompleted(prev => prev + 1);
    setFeedback(`🔥 ${currentMove.name}! +${totalPoints} (Combo x${combo + 1})`);

    if (audioEnabled) playSound('success');

    setIsPerforming(false);
    setCurrentMoveIndex(prev => prev + 1);

    setTimeout(() => {
      setFeedback('');
    }, 1500);
  };

  const skipMove = () => {
    setCombo(0);
    setFeedback('⏭️ Combo broken!');
    setCurrentMoveIndex(prev => prev + 1);
    setTimeout(() => {
      setFeedback('');
    }, 1500);
  };

  const endGame = () => {
    setGameStarted(false);
  };

  const playSound = (type) => {
    if (!audioEnabled) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'success') {
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
    } else {
      oscillator.frequency.value = 300;
      oscillator.type = 'triangle';
    }

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Setup screen
  if (!gameStarted) {
    return (
      <div className="physical-container">
        <div className="physical-intro">
          <h1 className="physical-title">💃 Dance Challenge</h1>
          <p className="physical-description">
            Get moving with fun dance moves! Follow the rhythm and build combos!
          </p>

          <div className="demo-pose">
            <div className="dance-demo">
              <span className="pose-emoji-large">🕺</span>
              <span className="pose-emoji-large">💃</span>
              <p>Follow the moves and dance!</p>
            </div>
          </div>

          <div className="mode-selector">
            <h3>Choose Mode:</h3>
            <div className="mode-buttons">
              <button
                className={`mode-btn ${gameMode === 'freestyle' ? 'active' : ''}`}
                onClick={() => setGameMode('freestyle')}
              >
                🎵 Freestyle<br/><small>10 moves, 60s</small>
              </button>
              <button
                className={`mode-btn ${gameMode === 'follow' ? 'active' : ''}`}
                onClick={() => setGameMode('follow')}
              >
                👯 Follow Along<br/><small>12 moves, 90s</small>
              </button>
              <button
                className={`mode-btn ${gameMode === 'challenge' ? 'active' : ''}`}
                onClick={() => setGameMode('challenge')}
              >
                🏆 Challenge<br/><small>15 moves, 120s</small>
              </button>
            </div>
          </div>

          <div className="difficulty-selector">
            <h3>Choose Difficulty:</h3>
            <div className="difficulty-buttons">
              <button
                className={`diff-btn ${difficulty === 'easy' ? 'active' : ''}`}
                onClick={() => setDifficulty('easy')}
              >
                🟢 Easy<br/><small>Basic moves</small>
              </button>
              <button
                className={`diff-btn ${difficulty === 'medium' ? 'active' : ''}`}
                onClick={() => setDifficulty('medium')}
              >
                🟡 Medium<br/><small>Cool moves</small>
              </button>
              <button
                className={`diff-btn ${difficulty === 'hard' ? 'active' : ''}`}
                onClick={() => setDifficulty('hard')}
              >
                🔴 Hard<br/><small>Pro moves</small>
              </button>
            </div>
          </div>

          <div className="rules-box">
            <h3>📋 How to Play:</h3>
            <ul>
              <li>Follow the dance moves shown on screen</li>
              <li>Press "Perform Move" when ready</li>
              <li>Complete moves to build combos</li>
              <li>Higher combos = more points!</li>
              <li>Beat the clock and get high score!</li>
            </ul>
          </div>

          <button className="start-btn physical" onClick={startGame}>
            💃 Start Dancing
          </button>
        </div>
      </div>
    );
  }

  // Game over screen
  if (!gameStarted && moves.length > 0) {
    return (
      <div className="physical-container">
        <div className="physical-game-over">
          <h1 className="game-over-title">🎉 Dance Complete!</h1>
          <div className="final-stats">
            <div className="stat-large">
              <span className="stat-label">Final Score</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat-large">
              <span className="stat-label">Moves Done</span>
              <span className="stat-value">{movesCompleted}</span>
            </div>
            <div className="stat-large">
              <span className="stat-label">Best Combo</span>
              <span className="stat-value">{bestCombo}</span>
            </div>
          </div>
          <div className="motivational-message">
            <p>
              {score > 500 ? '🌟 Incredible! You\'re a dance superstar!' :
               score > 300 ? '🔥 Great moves! Keep practicing!' :
               '💪 Good effort! Dance more to improve!'}
            </p>
          </div>
          <button className="play-again-btn" onClick={startGame}>
            🔄 Dance Again
          </button>
        </div>
      </div>
    );
  }

  // Game screen
  const currentMove = moves[currentMoveIndex];

  return (
    <div className="physical-container dance-game">
      <div className="physical-header">
        <div className="physical-stats">
          <div className="stat-item">
            <span className="stat-label">⏱️ Time</span>
            <span className="stat-value">{formatTime(timeLeft)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">⭐ Score</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">🔥 Combo</span>
            <span className="stat-value">x{combo}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">💃 Moves</span>
            <span className="stat-value">{currentMoveIndex}/{moves.length}</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`physical-feedback ${feedback.includes('🔥') ? 'success' : 'info'}`}>
          {feedback}
        </div>
      )}

      {currentMove && (
        <div className="dance-move-container">
          <div className="move-display">
            <span className="move-emoji">{currentMove.emoji}</span>
            <h2 className="move-name">{currentMove.name}</h2>
            <p className="move-instructions">{currentMove.instructions}</p>
            <div className="move-points">
              <span className="points-label">Base Points:</span>
              <span className="points-value">{currentMove.points}</span>
              {combo > 0 && (
                <span className="combo-bonus"> + {Math.floor(combo / 3) * 5} combo bonus!</span>
              )}
            </div>
          </div>

          <div className="progress-bar-container">
            <div className="progress-label">Progress:</div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(currentMoveIndex / moves.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="dance-controls">
            {!isPerforming ? (
              <>
                <button className="control-btn perform" onClick={performMove}>
                  🎯 Perform Move
                </button>
                <button className="control-btn skip" onClick={skipMove}>
                  ⏭️ Skip (Breaks Combo)
                </button>
              </>
            ) : (
              <div className="performing-indicator">
                <h3>🎵 Dance Now! 🎵</h3>
                <p>Perform the move...</p>
              </div>
            )}
          </div>

          <div className="upcoming-moves">
            <h4>Next Moves:</h4>
            <div className="moves-preview">
              {moves.slice(currentMoveIndex + 1, currentMoveIndex + 4).map((move, index) => (
                <div key={move.id} className="preview-move">
                  <span className="preview-emoji">{move.emoji}</span>
                  <span className="preview-name">{move.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DanceChallenge;
