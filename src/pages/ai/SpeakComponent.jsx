import React, { useState } from 'react';
import '../../css/SpeakComponent.css'; // Make sure to create this CSS file for styling purposes
import CONFIG from '../../Config';

function SpeakComponent() {
  const [storyText, setStoryText] = useState('');
  const [capturedText, setCapturedText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const fetchStory = async () => {
    try {
      const response = await fetch(`${CONFIG.development.AI_ASSESSMENT_BASE_URL}/story`);
      const data = await response.json();
      setStoryText(data.text);
    } catch (error) {
      console.error('Error fetching story:', error);
    }
  };

  const toggleListening = () => {
    setIsListening(prevState => !prevState);
    if (!isListening) {
      // Start listening
      // You can integrate a speech recognition library here
    } else {
      // Stop listening
      // Send the captured text to the POST API
      sendCapturedText();
    }
  };

  const sendCapturedText = async () => {
    try {
      const response = await fetch(`${CONFIG.development.AI_ASSESSMENT_BASE_URL}/speechtotext`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: capturedText })
      });
      // Handle response if needed
    } catch (error) {
      console.error('Error sending captured text:', error);
    }
  };

  const handleChange = (event) => {
    setCapturedText(event.target.value);
  };

  return (
    <div className="speak-component">
      <button onClick={fetchStory}>Fetch Story</button>
      <div className="story-text">{storyText}</div>
      <textarea placeholder="Speak here..." value={capturedText} onChange={handleChange}></textarea>
      <button onClick={toggleListening}>
        {isListening ? 'End Test' : 'Start Test'}
      </button>
      {isListening && <div className="listening-icon"></div>}
    </div>
  );
}

export default SpeakComponent;
