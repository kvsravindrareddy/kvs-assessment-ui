import React, { useState, useEffect } from 'react';
import './Cognitive.css'; // Reusing your existing styles
import { speakText } from '../../../utils/audioHelper';

const emojis = ['🍎', '🍌', '🍇', '🐶', '🐱', '🚗', '🚀'];

const NextInPattern = ({ audioEnabled = true }) => {
  const [pattern, setPattern] = useState([]);
  const [options, setOptions] = useState([]);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState("Find the next item in the pattern!");
  const [score, setScore] = useState(0);

  const generatePattern = () => {
    // Pick two random emojis for an A-B-A-B pattern
    const a = emojis[Math.floor(Math.random() * emojis.length)];
    let b = emojis[Math.floor(Math.random() * emojis.length)];
    while (a === b) b = emojis[Math.floor(Math.random() * emojis.length)];

    const newPattern = [a, b, a, b, a];
    setPattern(newPattern);
    setAnswer(b); // Next item is B

    let newOptions = [b];
    while (newOptions.length < 3) {
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      if (!newOptions.includes(randomEmoji)) {
        newOptions.push(randomEmoji);
      }
    }
    setOptions(newOptions.sort(() => Math.random() - 0.5));
    setMessage("What comes next?");
  };

  useEffect(() => {
    generatePattern();
  }, []);

  const handleSelection = (selected) => {
    if (selected === answer) {
      setMessage("⭐ Brilliant! You found the pattern!");
      speakText("Brilliant! You found the pattern!", audioEnabled); // 👈 ADDED AUDIO
      setScore(s => s + 10);
      setTimeout(generatePattern, 1500);
    } else {
      setMessage("🤔 Not quite right. Look closely at the sequence!");
      speakText("Not quite right. Look closely at the sequence!", audioEnabled); // 👈 ADDED AUDIO
    }
  };

  return (
    <div className="cognitive-container" style={{ textAlign: 'center', padding: '30px' }}>
      <h2>🧩 What Comes Next?</h2>
      <div className="score-board" style={{ fontSize: '1.2rem', marginBottom: '20px', fontWeight: 'bold' }}>Score: {score}</div>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', fontSize: '4rem', margin: '40px 0' }}>
        {pattern.map((item, i) => (
          <span key={i}>{item}</span>
        ))}
        <span style={{ border: '3px dashed #ccc', padding: '0 20px', borderRadius: '10px' }}>?</span>
      </div>

      <p style={{ fontSize: '1.2rem', marginBottom: '20px', color: message.includes('Brilliant') ? 'green' : '#333' }}>{message}</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        {options.map((opt, i) => (
          <button 
            key={i} 
            onClick={() => handleSelection(opt)}
            style={{ fontSize: '3rem', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#f0f0f0', border: '2px solid #ddd', borderRadius: '15px', transition: 'transform 0.2s' }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NextInPattern;