import React, { useState, useEffect } from 'react';
import '../../css/MathChallenge.css';
import { speakText } from '../../utils/audioHelper';

const MathBalance = ({ audioEnabled = true }) => {
  const [target, setTarget] = useState(0);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("Balance the scale!");
  const [score, setScore] = useState(0);

  const generateLevel = () => {
    const newTarget = Math.floor(Math.random() * 10) + 5; // 5 to 14
    setTarget(newTarget);
    
    let newOptions = [newTarget];
    while (newOptions.length < 3) {
      const wrongAnswer = Math.floor(Math.random() * 15) + 1;
      if (!newOptions.includes(wrongAnswer)) {
        newOptions.push(wrongAnswer);
      }
    }
    setOptions(newOptions.sort(() => Math.random() - 0.5));
    setSelected(null);
    setMessage("Balance the scale!");
  };

  useEffect(() => {
    generateLevel();
  }, []);

  const handleDrop = (value) => {
    setSelected(value);
    if (value === target) {
      setMessage("🎉 Perfectly Balanced! Great Job!");
      speakText("Perfectly Balanced! Great Job!", audioEnabled); // 👈 ADDED AUDIO
      setScore(s => s + 10);
      setTimeout(generateLevel, 2000);
    } else {
      setMessage("⚖️ Oops! That's not balanced. Try again.");
      speakText("Oops! That's not balanced. Try again.", audioEnabled); // 👈 ADDED AUDIO
    }
  };

  return (
    <div className="game-container" style={{ textAlign: 'center', padding: '20px' }}>
      <h2>⚖️ Math Balance Scale</h2>
      <div className="score-board">Score: {score}</div>
      <p style={{ fontSize: '1.2rem', margin: '10px' }}>{message}</p>
      
      {/* The Scale UI */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', margin: '40px 0', gap: '50px' }}>
        {/* Left Side (Target) */}
        <div style={{ width: '100px', height: '100px', backgroundColor: '#4CAF50', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
          {target}
        </div>
        
        {/* Fulcrum */}
        <div style={{ width: 0, height: 0, borderLeft: '30px solid transparent', borderRight: '30px solid transparent', borderBottom: '50px solid #555' }}></div>

        {/* Right Side (Drop Zone) */}
        <div style={{ width: '100px', height: '100px', border: '3px dashed #2196F3', backgroundColor: selected ? '#E3F2FD' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', borderRadius: '10px', color: '#2196F3' }}>
          {selected !== null ? selected : '?'}
        </div>
      </div>

      {/* Number Blocks to "Drag/Click" */}
      <h3>Pick a block to balance:</h3>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
        {options.map((opt, i) => (
          <button 
            key={i} 
            onClick={() => handleDrop(opt)}
            style={{ padding: '20px 30px', fontSize: '1.5rem', cursor: 'pointer', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MathBalance;