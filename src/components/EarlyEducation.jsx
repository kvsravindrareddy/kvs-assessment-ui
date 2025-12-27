// src/components/EarlyEducation.jsx
import React from 'react';
import PreKWorksheets from '../pages/prek/PreKWorksheets';
import NumberSequence from '../pages/random/NumberSequence';
import Shapes from '../pages/prek/Shapes';
import Colors from '../pages/prek/Colors';

const EarlyEducation = ({ option, audioEnabled = true }) => {
  switch (option) {
    case 'Alphabets': return <PreKWorksheets audioEnabled={audioEnabled} />;
    case 'Numbers': return <NumberSequence audioEnabled={audioEnabled} />;
    case 'Shapes': return <Shapes audioEnabled={audioEnabled} />;
    case 'Colors': return <Colors audioEnabled={audioEnabled} />;
    default: return null;
  }
};

export default EarlyEducation;