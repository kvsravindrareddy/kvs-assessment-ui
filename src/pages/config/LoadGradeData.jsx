// src/pages/config/LoadGradeData.js
import React, { useEffect, useState } from 'react';
import CONFIG from '../../Config';

const orderedGrades = [
  'PRE_K', 'KINDERGARTEN', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'
];



export default function LoadGradeData({ gradeData, setGradeData, onClick, expandedSection, onSubjectClick }) {
  useEffect(() => {
    fetch(`${CONFIG.development.ADMIN_SUPPORT_BASE_URL}/v1/app-config`)
      .then((res) => res.json())
      .then((data) => setGradeData(data))
      .catch((err) => console.error('Failed to load grades:', err));
  }, []);

  return (
    <div className="grade-list-container">
      
      {orderedGrades.map((grade) => (
        <div key={grade} className="grade-card" onClick={() => onClick(grade)}>
          <h2>{grade} {expandedSection === grade ? '▲' : '▼'}</h2>
          {expandedSection === grade && gradeData[grade] && (
            <div className="dropdown-content">
              {gradeData[grade].map((subject) => (
                <a key={subject} onClick={(e) => {
                  e.stopPropagation();
                  onSubjectClick(grade, subject);
                }}>{subject}</a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
