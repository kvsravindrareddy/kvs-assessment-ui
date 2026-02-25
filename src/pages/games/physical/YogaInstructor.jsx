import React, { useState, useEffect } from 'react';
import './Physical.css';

const YogaInstructor = ({ audioEnabled = true }) => {
  const [currentPose, setCurrentPose] = useState(null);
  const [holdTime, setHoldTime] = useState(0);
  const [score, setScore] = useState(0);
  const [posesCompleted, setPosesCompleted] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState('beginner');
  const [isPaused, setIsPaused] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [feedback, setFeedback] = useState('');

  // Yoga poses database
  const poses = {
    beginner: [
      {
        name: 'Mountain Pose',
        emoji: '🧍',
        description: 'Stand tall with feet together, arms at sides',
        benefits: 'Improves posture and balance',
        holdTime: 15,
        instructions: [
          'Stand with feet hip-width apart',
          'Distribute weight evenly on both feet',
          'Engage your thighs and lift your chest',
          'Relax shoulders and breathe deeply'
        ]
      },
      {
        name: 'Tree Pose',
        emoji: '🌳',
        description: 'Balance on one leg with arms raised',
        benefits: 'Improves balance and concentration',
        holdTime: 20,
        instructions: [
          'Stand on one leg',
          'Place other foot on inner thigh or calf',
          'Bring hands to prayer position',
          'Focus on a point ahead for balance'
        ]
      },
      {
        name: 'Child\'s Pose',
        emoji: '🧘',
        description: 'Kneel and stretch forward with arms extended',
        benefits: 'Relaxes body and calms mind',
        holdTime: 20,
        instructions: [
          'Kneel on the floor',
          'Sit back on your heels',
          'Stretch arms forward on the ground',
          'Rest forehead on mat and breathe'
        ]
      },
      {
        name: 'Cat-Cow Stretch',
        emoji: '🐱',
        description: 'Alternate arching and rounding your back',
        benefits: 'Stretches spine and improves flexibility',
        holdTime: 15,
        instructions: [
          'Start on hands and knees',
          'Inhale: arch back, look up (Cow)',
          'Exhale: round back, tuck chin (Cat)',
          'Repeat smoothly with breath'
        ]
      },
      {
        name: 'Warrior I',
        emoji: '⚔️',
        description: 'Lunge with arms raised overhead',
        benefits: 'Strengthens legs and improves focus',
        holdTime: 20,
        instructions: [
          'Step one foot forward into lunge',
          'Back foot at 45-degree angle',
          'Raise arms overhead',
          'Look up and hold strong'
        ]
      }
    ],
    intermediate: [
      {
        name: 'Downward Dog',
        emoji: '🐕',
        description: 'Inverted V-shape with hands and feet on ground',
        benefits: 'Full body stretch, energizes',
        holdTime: 25,
        instructions: [
          'Start on hands and knees',
          'Lift hips up and back',
          'Straighten legs as much as comfortable',
          'Press heels toward floor'
        ]
      },
      {
        name: 'Warrior II',
        emoji: '🗡️',
        description: 'Wide lunge with arms extended sideways',
        benefits: 'Builds strength and stamina',
        holdTime: 25,
        instructions: [
          'Wide stance, front foot forward',
          'Bend front knee over ankle',
          'Extend arms parallel to floor',
          'Gaze over front hand'
        ]
      },
      {
        name: 'Triangle Pose',
        emoji: '📐',
        description: 'Standing forward bend with one hand reaching down',
        benefits: 'Stretches sides and improves balance',
        holdTime: 25,
        instructions: [
          'Wide stance with arms extended',
          'Reach down to shin or floor',
          'Other arm reaches to sky',
          'Look up at raised hand'
        ]
      },
      {
        name: 'Plank Pose',
        emoji: '💪',
        description: 'Hold body straight like a plank',
        benefits: 'Core strength and stability',
        holdTime: 30,
        instructions: [
          'Start in push-up position',
          'Keep body in straight line',
          'Engage core and legs',
          'Hold steady and breathe'
        ]
      },
      {
        name: 'Bridge Pose',
        emoji: '🌉',
        description: 'Lift hips while lying on back',
        benefits: 'Strengthens back and glutes',
        holdTime: 25,
        instructions: [
          'Lie on back, knees bent',
          'Feet flat on floor',
          'Lift hips toward ceiling',
          'Hold and squeeze glutes'
        ]
      }
    ],
    advanced: [
      {
        name: 'Crow Pose',
        emoji: '🐦',
        description: 'Balance on hands with knees on arms',
        benefits: 'Builds arm strength and focus',
        holdTime: 20,
        instructions: [
          'Squat with hands on floor',
          'Place knees on upper arms',
          'Lean forward and lift feet',
          'Balance on hands'
        ]
      },
      {
        name: 'Headstand',
        emoji: '🤸',
        description: 'Invert body with head on ground',
        benefits: 'Improves circulation and focus',
        holdTime: 30,
        instructions: [
          'Kneel and interlace fingers',
          'Place crown of head on floor',
          'Slowly walk feet toward head',
          'Lift legs up when ready (use wall)'
        ]
      },
      {
        name: 'Wheel Pose',
        emoji: '⭕',
        description: 'Full backbend with hands and feet on ground',
        benefits: 'Opens chest and strengthens back',
        holdTime: 20,
        instructions: [
          'Lie on back, hands by ears',
          'Feet flat near hips',
          'Press up into full backbend',
          'Straighten arms and breathe'
        ]
      },
      {
        name: 'King Pigeon',
        emoji: '🕊️',
        description: 'Deep hip opener with back leg bent up',
        benefits: 'Opens hips and shoulders',
        holdTime: 30,
        instructions: [
          'Start in low lunge',
          'Bring front shin parallel to mat',
          'Reach back to grab back foot',
          'Arch back and open chest'
        ]
      },
      {
        name: 'Side Plank',
        emoji: '⚖️',
        description: 'Balance on one hand and side of foot',
        benefits: 'Core and arm strength',
        holdTime: 25,
        instructions: [
          'From plank, rotate to one side',
          'Stack feet and hips',
          'Raise top arm to sky',
          'Hold strong and balanced'
        ]
      }
    ]
  };

  const difficultySettings = {
    beginner: { sessionDuration: 180, posesCount: 5, restTime: 10 },
    intermediate: { sessionDuration: 300, posesCount: 6, restTime: 8 },
    advanced: { sessionDuration: 420, posesCount: 7, restTime: 5 }
  };

  // Timer for session
  useEffect(() => {
    if (gameStarted && !isPaused) {
      const timer = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted, isPaused]);

  // Timer for pose hold
  useEffect(() => {
    if (currentPose && holdTime > 0 && !isPaused) {
      const timer = setTimeout(() => {
        setHoldTime(holdTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (currentPose && holdTime === 0 && !isPaused) {
      completePose();
    }
  }, [holdTime, currentPose, isPaused]);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setPosesCompleted(0);
    setSessionTime(0);
    startNextPose();
  };

  const startNextPose = () => {
    const posesList = poses[difficulty];
    const randomPose = posesList[Math.floor(Math.random() * posesList.length)];
    setCurrentPose(randomPose);
    setHoldTime(randomPose.holdTime);
    setFeedback('');
  };

  const completePose = () => {
    const points = currentPose.holdTime * 10;
    setScore(prev => prev + points);
    setPosesCompleted(prev => prev + 1);
    setFeedback(`✅ Great job! +${points} points`);

    if (audioEnabled) playSound('success');

    setTimeout(() => {
      if (posesCompleted + 1 < difficultySettings[difficulty].posesCount) {
        startNextPose();
      } else {
        endSession();
      }
    }, 2000);
  };

  const skipPose = () => {
    setFeedback('⏭️ Skipped - no points earned');
    setTimeout(() => {
      if (posesCompleted < difficultySettings[difficulty].posesCount) {
        startNextPose();
      } else {
        endSession();
      }
    }, 1500);
  };

  const endSession = () => {
    setGameStarted(false);
    setCurrentPose(null);
    setFeedback('🎉 Session Complete!');
  };

  const playSound = (type) => {
    if (!audioEnabled) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = type === 'success' ? 600 : 400;
    oscillator.type = 'sine';

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
  if (!gameStarted && !feedback.includes('Complete')) {
    return (
      <div className="physical-container">
        <div className="physical-intro">
          <h1 className="physical-title">🧘 AI Yoga Instructor</h1>
          <p className="physical-description">
            Follow the AI guidance for a relaxing yoga session. Perfect for flexibility and mindfulness!
          </p>

          <div className="demo-pose">
            <div className="pose-demo">
              <span className="pose-emoji-large">🧘</span>
              <p>Guided poses with timer</p>
            </div>
          </div>

          <div className="difficulty-selector">
            <h3>Choose Level:</h3>
            <div className="difficulty-buttons">
              <button
                className={`diff-btn ${difficulty === 'beginner' ? 'active' : ''}`}
                onClick={() => setDifficulty('beginner')}
              >
                🟢 Beginner<br/><small>5 poses, 3 min</small>
              </button>
              <button
                className={`diff-btn ${difficulty === 'intermediate' ? 'active' : ''}`}
                onClick={() => setDifficulty('intermediate')}
              >
                🟡 Intermediate<br/><small>6 poses, 5 min</small>
              </button>
              <button
                className={`diff-btn ${difficulty === 'advanced' ? 'active' : ''}`}
                onClick={() => setDifficulty('advanced')}
              >
                🔴 Advanced<br/><small>7 poses, 7 min</small>
              </button>
            </div>
          </div>

          <div className="rules-box">
            <h3>📋 How It Works:</h3>
            <ul>
              <li>Follow each yoga pose instruction</li>
              <li>Hold the pose for the timer duration</li>
              <li>Breathe deeply and focus on form</li>
              <li>Complete all poses to finish session</li>
              <li>Take breaks between poses if needed</li>
            </ul>
          </div>

          <button className="start-btn physical" onClick={startGame}>
            🧘 Start Yoga Session
          </button>
        </div>
      </div>
    );
  }

  // Session complete screen
  if (!gameStarted && feedback.includes('Complete')) {
    return (
      <div className="physical-container">
        <div className="physical-game-over">
          <h1 className="game-over-title">🎉 Namaste!</h1>
          <p className="session-complete-text">You completed your yoga session!</p>
          <div className="final-stats">
            <div className="stat-large">
              <span className="stat-label">Total Score</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat-large">
              <span className="stat-label">Poses Completed</span>
              <span className="stat-value">{posesCompleted}</span>
            </div>
            <div className="stat-large">
              <span className="stat-label">Session Time</span>
              <span className="stat-value">{formatTime(sessionTime)}</span>
            </div>
          </div>
          <div className="motivational-message">
            <p>🌟 Great work! Regular practice improves flexibility and reduces stress.</p>
          </div>
          <button className="play-again-btn" onClick={startGame}>
            🔄 New Session
          </button>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div className="physical-container yoga-game">
      <div className="physical-header">
        <div className="physical-stats">
          <div className="stat-item">
            <span className="stat-label">⏱️ Time</span>
            <span className="stat-value">{formatTime(sessionTime)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">⭐ Score</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">✅ Poses</span>
            <span className="stat-value">{posesCompleted}/{difficultySettings[difficulty].posesCount}</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`physical-feedback ${feedback.includes('✅') ? 'success' : 'info'}`}>
          {feedback}
        </div>
      )}

      {currentPose && (
        <div className="pose-container">
          <div className="pose-display">
            <span className="pose-emoji">{currentPose.emoji}</span>
            <h2 className="pose-name">{currentPose.name}</h2>
            <p className="pose-description">{currentPose.description}</p>

            <div className="hold-timer">
              <div className="timer-circle">
                <span className="timer-value">{holdTime}s</span>
              </div>
              <p className="timer-label">Hold this pose</p>
            </div>

            <div className="pose-benefits">
              <h4>💡 Benefits:</h4>
              <p>{currentPose.benefits}</p>
            </div>

            <div className="pose-instructions">
              <h4>📋 Instructions:</h4>
              <ul>
                {currentPose.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pose-controls">
            <button
              className="control-btn pause"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
            <button
              className="control-btn skip"
              onClick={skipPose}
            >
              ⏭️ Skip Pose
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default YogaInstructor;
