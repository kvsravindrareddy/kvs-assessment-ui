// src/components/AssessmentComponents.jsx
import React from 'react';
import AssessmentQuestions from '../pages/random/AssessmentQuestions';
import GenerateNumbers from '../pages/random/GenerateNumbers';
import WordProblems from '../pages/random/WordProblems';
import CountingMoney from '../pages/random/CountingMoney';
import AssessmentFlow from '../pages/random/AssessmentFlow';

const AssessmentComponents = ({ option }) => {
  switch (option) {
    case 'Random Assessment': return <AssessmentQuestions />;
    case 'Generate Numbers': return <GenerateNumbers />;
    case 'Word Problems': return <WordProblems />;
    case 'Counting Money': return <CountingMoney />;
    case 'Assessment Flow': return <AssessmentFlow />;
    default: return null;
  }
};

export default AssessmentComponents;
