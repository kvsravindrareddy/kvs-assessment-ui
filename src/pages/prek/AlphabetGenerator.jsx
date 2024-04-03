import React from 'react';
import '../../css/styles.css';

const AlphabetGenerator = () => {
  const generateAlphabets = (startCharCode, endCharCode) => {
    const alphabets = [];
    for (let i = startCharCode; i <= endCharCode; i++) {
      alphabets.push(String.fromCharCode(i));
    }
    return alphabets;
  };

  const speakLetter = (letter) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(letter);
    synth.speak(utterance);
  };

  const renderAlphabets = (style) => {
    const alphabets = generateAlphabets(65, 90); // Capital letters A to Z
    return (
      <div className="card-container">
        {alphabets.map((alphabet, index) => (
          <div
            className="card"
            key={index}
            onMouseEnter={() => speakLetter(alphabet)} // Speak the letter on mouse enter
          >
            <span className="letter">{alphabet}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div>
        <h3>Capital Letters</h3>
        {renderAlphabets('Arial')} {/* Change the font family as needed */}
      </div>
      <div>
        <h3>Small Letters</h3>
        {/* You can add similar render method for small letters */}
      </div>
      <div>
        <h3>Cursive</h3>
        {/* You can add similar render method for cursive letters */}
      </div>
    </div>
  );
};

export default AlphabetGenerator;
