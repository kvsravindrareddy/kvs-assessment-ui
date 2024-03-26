import React, { useState } from 'react';

const NumberSequence = () => {
  const [currentNumber, setCurrentNumber] = useState(1);
  const [enteredNumber, setEnteredNumber] = useState('');

  const handleChange = (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      setEnteredNumber(value);
    } else {
      setEnteredNumber('');
    }
  };

  const handleBlur = () => {
    if (enteredNumber !== '') {
      setCurrentNumber(enteredNumber);
    }
    setEnteredNumber('');
  };

  return (
    <div>
      <input
        type="number"
        value={enteredNumber}
        onChange={handleChange}
        onBlur={handleBlur}
        min="1"
      />
      <p>Current Number: {currentNumber}</p>
      <p>Next Number: {currentNumber + 1}</p>
    </div>
  );
};

export default NumberSequence;