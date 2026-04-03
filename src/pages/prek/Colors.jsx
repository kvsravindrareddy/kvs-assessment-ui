import React, { useState, useCallback } from 'react';
import '../../css/Colors.css';

// Static data defined once at module level — not recreated on every render
const COLORS = [
  { name: 'Red', hex: '#FF0000', emoji: '🔴' },
  { name: 'Blue', hex: '#0000FF', emoji: '🔵' },
  { name: 'Yellow', hex: '#FFFF00', emoji: '🟡' },
  { name: 'Green', hex: '#00FF00', emoji: '🟢' },
  { name: 'Orange', hex: '#FFA500', emoji: '🟠' },
  { name: 'Purple', hex: '#800080', emoji: '🟣' },
  { name: 'Pink', hex: '#FFC0CB', emoji: '🎀' },
  { name: 'Brown', hex: '#8B4513', emoji: '🟤' },
  { name: 'Black', hex: '#000000', emoji: '⚫' },
  { name: 'White', hex: '#FFFFFF', emoji: '⚪' },
  { name: 'Gray', hex: '#808080', emoji: '🔘' },
  { name: 'Cyan', hex: '#00FFFF', emoji: '💠' },
  { name: 'Magenta', hex: '#FF00FF', emoji: '💮' },
  { name: 'Lime', hex: '#00FF00', emoji: '💚' },
  { name: 'Indigo', hex: '#4B0082', emoji: '💙' },
  { name: 'Turquoise', hex: '#40E0D0', emoji: '💎' }
];

const COLOR_EXAMPLES = {
  'Red': ['Apple', 'Strawberry', 'Fire Truck'],
  'Blue': ['Sky', 'Ocean', 'Blueberry'],
  'Yellow': ['Sun', 'Banana', 'Lemon'],
  'Green': ['Grass', 'Tree', 'Frog'],
  'Orange': ['Orange', 'Carrot', 'Pumpkin'],
  'Purple': ['Grapes', 'Eggplant', 'Lavender'],
  'Pink': ['Flower', 'Flamingo', 'Pig'],
  'Brown': ['Chocolate', 'Bear', 'Tree Bark'],
  'Black': ['Night', 'Cat', 'Tire'],
  'White': ['Snow', 'Cloud', 'Milk'],
  'Gray': ['Elephant', 'Stone', 'Rain Cloud'],
  'Cyan': ['Aquamarine', 'Tropical Water'],
  'Magenta': ['Fuchsia Flower', 'Neon Light'],
  'Lime': ['Lime Fruit', 'Neon Sign'],
  'Indigo': ['Night Sky', 'Deep Ocean'],
  'Turquoise': ['Gemstone', 'Tropical Sea']
};

const Colors = ({ audioEnabled = true }) => {
  const [selectedColor, setSelectedColor] = useState(null);

  const speakColor = useCallback((colorName, examples) => {
    if (audioEnabled) {
      const synth = window.speechSynthesis;
      // Cancel any ongoing speech first
      synth.cancel();
      let text = `${colorName}. Examples: ${examples.join(', ')}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      synth.speak(utterance);
    }
  }, [audioEnabled]);

  const handleColorClick = useCallback((color) => {
    setSelectedColor(color);
    const examples = COLOR_EXAMPLES[color.name] || [];
    speakColor(color.name, examples);
  }, [speakColor]);

  const handleReplay = useCallback(() => {
    if (selectedColor) {
      speakColor(selectedColor.name, COLOR_EXAMPLES[selectedColor.name] || []);
    }
  }, [selectedColor, speakColor]);

  return (
    <div className="colors-container">
      <div className="colors-header">
        <h2>Learn Colors</h2>
        <p>Click on any color to hear its name and see examples!</p>
      </div>

      <div className="colors-grid">
        {COLORS.map((color) => (
          <div
            key={color.name}
            className={`color-card ${selectedColor?.name === color.name ? 'selected' : ''}`}
            onClick={() => handleColorClick(color)}
          >
            <div
              className="color-circle"
              style={{
                backgroundColor: color.hex,
                border: color.name === 'White' ? '3px solid #ddd' : 'none'
              }}
            >
              <span className="color-emoji">{color.emoji}</span>
            </div>
            <div className="color-name">{color.name}</div>
          </div>
        ))}
      </div>

      {selectedColor && (
        <div className="color-details">
          <h3>
            You selected: {selectedColor.name} {selectedColor.emoji}
          </h3>
          <div className="color-examples">
            <p>Things that are {selectedColor.name.toLowerCase()}:</p>
            <div className="examples-list">
              {(COLOR_EXAMPLES[selectedColor.name] || []).map((example) => (
                <span key={example} className="example-tag">{example}</span>
              ))}
            </div>
          </div>
          <button className="replay-button" onClick={handleReplay}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Colors;
