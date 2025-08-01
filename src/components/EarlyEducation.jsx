// src/components/EarlyEducation.jsx
import React from 'react';
import PreKWorksheets from '../pages/prek/PreKWorksheets';
import NumberSequence from '../pages/random/NumberSequence';
import Shapes from '../pages/prek/Shapes';
import Colors from '../pages/prek/Colors';

const EarlyEducation = ({ option }) => {
  switch (option) {
    case 'Alphabets': return <PreKWorksheets />;
    case 'Numbers': return <NumberSequence />;
    case 'Shapes': return <Shapes />;
    case 'Colors': return <Colors />;
    default: return null;
  }
};

export default EarlyEducation;