import React, { useState, useRef, useEffect } from 'react';
import '../../css/DrawingBoard.css';

const DrawingBoard = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState('pen');

  const colors = [
    { name: 'Black', hex: '#000000' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Green', hex: '#00FF00' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Orange', hex: '#FFA500' },
    { name: 'Purple', hex: '#800080' },
    { name: 'Pink', hex: '#FFC0CB' },
    { name: 'Brown', hex: '#8B4513' },
    { name: 'Cyan', hex: '#00FFFF' },
    { name: 'Magenta', hex: '#FF00FF' },
    { name: 'Lime', hex: '#00FF00' }
  ];

  const templates = [
    { name: 'Blank', icon: '📄' },
    { name: 'Sun', icon: '☀️' },
    { name: 'House', icon: '🏠' },
    { name: 'Tree', icon: '🌳' },
    { name: 'Flower', icon: '🌸' },
    { name: 'Rainbow', icon: '🌈' }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.closePath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance('Canvas cleared!');
    synth.speak(utterance);
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'my-drawing.png';
    link.href = url;
    link.click();

    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance('Drawing saved!');
    synth.speak(utterance);
  };

  const loadTemplate = (templateName) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2;

    switch (templateName) {
      case 'Sun':
        // Draw sun outline
        ctx.beginPath();
        ctx.arc(300, 150, 50, 0, Math.PI * 2);
        ctx.stroke();
        // Sun rays
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8;
          ctx.beginPath();
          ctx.moveTo(300 + Math.cos(angle) * 60, 150 + Math.sin(angle) * 60);
          ctx.lineTo(300 + Math.cos(angle) * 80, 150 + Math.sin(angle) * 80);
          ctx.stroke();
        }
        break;
      case 'House':
        // House outline
        ctx.strokeRect(250, 250, 100, 100);
        // Roof
        ctx.beginPath();
        ctx.moveTo(240, 250);
        ctx.lineTo(300, 200);
        ctx.lineTo(360, 250);
        ctx.stroke();
        // Door
        ctx.strokeRect(280, 300, 40, 50);
        break;
      case 'Tree':
        // Trunk
        ctx.strokeRect(285, 300, 30, 80);
        // Leaves (circles)
        ctx.beginPath();
        ctx.arc(300, 280, 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(270, 300, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(330, 300, 30, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'Flower':
        // Stem
        ctx.beginPath();
        ctx.moveTo(300, 400);
        ctx.lineTo(300, 280);
        ctx.stroke();
        // Petals
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI * 2 * i) / 6;
          ctx.beginPath();
          ctx.arc(300 + Math.cos(angle) * 30, 250 + Math.sin(angle) * 30, 20, 0, Math.PI * 2);
          ctx.stroke();
        }
        // Center
        ctx.beginPath();
        ctx.arc(300, 250, 15, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'Rainbow':
        // Rainbow arcs
        const rainbowColors = ['#FF0000', '#FFA500', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
        rainbowColors.forEach((col, i) => {
          ctx.strokeStyle = col;
          ctx.lineWidth = 15;
          ctx.beginPath();
          ctx.arc(300, 400, 200 - (i * 20), Math.PI, 0);
          ctx.stroke();
        });
        break;
      default:
        break;
    }
  };

  return (
    <div className="drawing-board-container">
      <div className="drawing-header">
        <h2>Drawing Board</h2>
        <p>Create your masterpiece!</p>
      </div>

      <div className="drawing-controls">
        <div className="tool-section">
          <h3>Tools</h3>
          <div className="tools">
            <button
              className={`tool-button ${tool === 'pen' ? 'active' : ''}`}
              onClick={() => setTool('pen')}
            >
              ✏️ Pen
            </button>
            <button
              className={`tool-button ${tool === 'eraser' ? 'active' : ''}`}
              onClick={() => setTool('eraser')}
            >
              🧹 Eraser
            </button>
          </div>
        </div>

        <div className="color-section">
          <h3>Colors</h3>
          <div className="color-palette">
            {colors.map((col) => (
              <button
                key={col.hex}
                className={`color-button ${color === col.hex ? 'selected' : ''}`}
                style={{ backgroundColor: col.hex }}
                onClick={() => {
                  setColor(col.hex);
                  setTool('pen');
                }}
                title={col.name}
              />
            ))}
          </div>
        </div>

        <div className="brush-section">
          <h3>Brush Size: {brushSize}px</h3>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="brush-slider"
          />
        </div>

        <div className="template-section">
          <h3>Templates</h3>
          <div className="templates">
            {templates.map((template) => (
              <button
                key={template.name}
                className="template-button"
                onClick={() => loadTemplate(template.name)}
              >
                {template.icon} {template.name}
              </button>
            ))}
          </div>
        </div>

        <div className="action-section">
          <button className="action-button clear" onClick={clearCanvas}>
            🗑️ Clear
          </button>
          <button className="action-button save" onClick={downloadDrawing}>
            💾 Save
          </button>
        </div>
      </div>

      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={600}
          height={450}
          className="drawing-canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
};

export default DrawingBoard;
