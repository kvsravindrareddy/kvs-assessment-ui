import React, { useState, useCallback } from 'react';
import '../../css/Shapes.css';

// Static data defined once at module level — not recreated on every render
const SHAPES = [
  { name: 'Circle', icon: '⭕', color: '#FF6B6B', sides: 0 },
  { name: 'Square', icon: '⬛', color: '#4ECDC4', sides: 4 },
  { name: 'Triangle', icon: '🔺', color: '#FFE66D', sides: 3 },
  { name: 'Rectangle', icon: '▭', color: '#95E1D3', sides: 4 },
  { name: 'Pentagon', icon: '⬟', color: '#C7CEEA', sides: 5 },
  { name: 'Hexagon', icon: '⬡', color: '#FFDAB9', sides: 6 },
  { name: 'Star', icon: '⭐', color: '#FFD700', sides: 10 },
  { name: 'Heart', icon: '❤️', color: '#FF69B4', sides: 0 },
  { name: 'Diamond', icon: '💎', color: '#87CEEB', sides: 4 },
  { name: 'Oval', icon: '⬭', color: '#DDA0DD', sides: 0 },
  { name: 'Octagon', icon: '⯃', color: '#F4A460', sides: 8 },
  { name: 'Crescent', icon: '🌙', color: '#F0E68C', sides: 0 }
];

const Shapes = ({ audioEnabled = true }) => {
  const [selectedShape, setSelectedShape] = useState(null);

  const speakShape = useCallback((shapeName, sides) => {
    if (audioEnabled) {
      const synth = window.speechSynthesis;
      // Cancel any ongoing speech first
      synth.cancel();
      let text = `${shapeName}.`;
      if (sides > 0) {
        text += ` It has ${sides} sides.`;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      synth.speak(utterance);
    }
  }, [audioEnabled]);

  const handleShapeClick = useCallback((shape) => {
    setSelectedShape(shape);
    speakShape(shape.name, shape.sides);
  }, [speakShape]);

  const handleReplay = useCallback(() => {
    if (selectedShape) {
      speakShape(selectedShape.name, selectedShape.sides);
    }
  }, [selectedShape, speakShape]);

  return (
    <div className="shapes-container">
      <div className="shapes-header">
        <h2>Learn Shapes</h2>
        <p>Click on any shape to hear its name and learn about it!</p>
      </div>

      <div className="shapes-grid">
        {SHAPES.map((shape) => (
          <div
            key={shape.name}
            className={`shape-card ${selectedShape?.name === shape.name ? 'selected' : ''}`}
            onClick={() => handleShapeClick(shape)}
            style={{ '--shape-color': shape.color }}
          >
            <div className="shape-icon">{shape.icon}</div>
            <div className="shape-name">{shape.name}</div>
            {shape.sides > 0 && (
              <div className="shape-info">{shape.sides} sides</div>
            )}
          </div>
        ))}
      </div>

      {selectedShape && (
        <div className="shape-details">
          <h3>You selected: {selectedShape.name} {selectedShape.icon}</h3>
          <p>
            {selectedShape.sides > 0
              ? `A ${selectedShape.name.toLowerCase()} has ${selectedShape.sides} sides.`
              : `A ${selectedShape.name.toLowerCase()} is a curved shape.`}
          </p>
          <button className="replay-button" onClick={handleReplay}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Shapes;
