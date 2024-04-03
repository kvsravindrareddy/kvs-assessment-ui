import React, { useState } from 'react';

const AnimalSounds = () => {
  const [animals] = useState([
    { name: 'Cat' },
    { name: 'Dog' },
    { name: 'Cow' },
    { name: 'Sheep' },
    { name: 'Horse' }
  ]);

  const speak = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  };

  return (
    <div>
      <h2>Animal Sounds</h2>
      <ul>
        {animals.map((animal, index) => (
          <li key={index} onClick={() => speak(animal.name)}>
            {animal.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AnimalSounds;
