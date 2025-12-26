import React from 'react';
import '../../css/styles.css';

const AlphabetGenerator = ({ type }) => {
  const generateAlphabets = (startCharCode, endCharCode) => {
    const alphabets = [];
    for (let i = startCharCode; i <= endCharCode; i++) {
      alphabets.push(String.fromCharCode(i));
    }
    return alphabets;
  };

  const speakLetter = (letter) => {
    const synth = window.speechSynthesis;
    // Cancel any ongoing speech first
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(letter);
    synth.speak(utterance);
  };
  
  const renderAlphabets = (startCharCode, endCharCode) => {
    const alphabets = generateAlphabets(startCharCode, endCharCode);
    return (
      <div className="card-container">
        {alphabets.map((alphabet, index) => (
          <div
            className="card"
            key={index}
            onClick={() => speakLetter(alphabet)} // Speak the letter on click
          >
            <span className="letter">{alphabet}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderCursiveAlphabets = () => {
    const cursiveLetters = '𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵';
    return (
      <div className="card-container">
        {cursiveLetters.split('').map((letter, index) => (
          <div className="card" key={index}>
            <span className="letter" style={{ type }}>{letter}</span>
          </div>
        ))}
      </div>
    );
  };

  let alphabetsComponent;
  switch (type) {
    case 'Capital':
        alphabetsComponent = renderAlphabets(65, 90);
        break;
    case 'Small':
        alphabetsComponent = renderAlphabets(97, 122);
        break;
    case 'Cursive':
        alphabetsComponent = renderCursiveAlphabets();
        break;
    default:
        alphabetsComponent = null;
  }

  return (
    <div>
      <h3>{`${type} Letters`}</h3>
      {alphabetsComponent}
    </div>
  );
};

export default AlphabetGenerator;
