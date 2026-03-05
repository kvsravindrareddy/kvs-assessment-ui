// src/pages/config/LoadGradeData.js
import React, { useEffect } from 'react';
import CONFIG from '../../Config';
import { useGrades } from '../../hooks/useGrades';

export default function LoadGradeData({ gradeData, setGradeData, onClick, expandedSection, onSubjectClick }) {
  const { grades: orderedGrades, loading: gradesLoading } = useGrades();
  useEffect(() => {
    fetch(`${CONFIG.development.ADMIN_SUPPORT_BASE_URL}/admin-assessment/v1/app-config/subject-types`)
      .then((res) => res.json())
      .then((data) => setGradeData(data))
      .catch((err) => console.error('Failed to load grades:', err));
  }, []);

  const gradeLabels = {
    'PRE_K': '🎨 Pre-K',
    'KINDERGARTEN': '📖 Kindergarten',
    'I': '1️⃣ Grade 1',
    'II': '2️⃣ Grade 2',
    'III': '3️⃣ Grade 3',
    'IV': '4️⃣ Grade 4',
    'V': '5️⃣ Grade 5',
    'VI': '6️⃣ Grade 6',
    'VII': '7️⃣ Grade 7',
    'VIII': '8️⃣ Grade 8',
    'IX': '9️⃣ Grade 9',
    'X': '🔟 Grade 10'
  };

  return (
    <div className="grade-forest">
      {orderedGrades.map((grade, gradeIndex) => (
        <div key={grade} className={`grade-tree grade-tree-${gradeIndex % 4}`}>
          <div className="grade-trunk" onClick={() => onClick(grade)}>
            <div className="grade-trunk-label">{gradeLabels[grade] || grade}</div>
            <div className="trunk-arrow">{expandedSection === grade ? '▲' : '▼'}</div>
          </div>

          {expandedSection === grade && gradeData[grade] && (
            <div className="subject-branches">
              {gradeData[grade].map((subject, subIndex) => (
                <div
                  key={subject}
                  className={`subject-leaf leaf-${(subIndex % 5) + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSubjectClick(grade, subject);
                  }}
                >
                  <span className="leaf-emoji">🍃</span>
                  <span className="subject-text">{subject}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
