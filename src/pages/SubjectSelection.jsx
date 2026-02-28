import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/SubjectSelection.css';

const SubjectSelection = () => {
  const { gradeCode } = useParams();
  const navigate = useNavigate();
  const [gradeInfo, setGradeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGradeInfo();
  }, [gradeCode]);

  const fetchGradeInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:9002/v1/grades/${gradeCode}`);

      if (response.data.status === 'success') {
        setGradeInfo(response.data.grade);
      } else {
        setError('Failed to load subjects');
      }
    } catch (err) {
      console.error('Error fetching grade info:', err);
      setError('Failed to load subjects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelect = (subjectCode) => {
    navigate(`/configure-assessment/${gradeCode}/${subjectCode}`);
  };

  const getSubjectIcon = (subjectName) => {
  const s = subjectName.toUpperCase();
  if (s.includes('MATH')) return '📐';
  if (s.includes('ENGLISH')) return '📚';
  if (s.includes('SCIENCE')) return '🔬';
  if (s.includes('HISTORY')) return '🏛️';
  if (s.includes('GEOGRAPHY')) return '🌍';
  if (s.includes('SOCIAL')) return '🤝';
  if (s.includes('COMPUTER') || s.includes('IT')) return '💻';
  if (s.includes('HINDI') || s.includes('TELUGU') || s.includes('LANGUAGE')) return '🗣️';
  if (s.includes('KNOWLEDGE') || s.includes('GENERAL')) return '💡';
  return '📝'; // Default fallback
};

  const getSubjectColor = (index) => {
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#4facfe',
      '#43e97b', '#fa709a', '#fee140', '#30cfd0'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="subject-selection-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading subjects...</p>
        </div>
      </div>
    );
  }

  if (error || !gradeInfo) {
    return (
      <div className="subject-selection-container">
        <div className="error-message">
          <h2>⚠️ Error</h2>
          <p>{error || 'Grade not found'}</p>
          <button onClick={() => navigate('/select-grade')} className="btn-primary">
            Back to Grades
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subject-selection-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span onClick={() => navigate('/select-grade')} className="breadcrumb-item">
          Grades
        </span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">{gradeInfo.gradeName}</span>
      </div>

      {/* Header */}
      <div className="page-header">
        <h1>{gradeInfo.gradeName}</h1>
        <p>Select a subject to start your assessment</p>
      </div>

      {/* Subject Count */}
      <div className="subject-count-banner">
        <span className="count-number">{gradeInfo.totalSubjects}</span>
        <span className="count-label">Subjects Available</span>
      </div>

      {/* Subjects Grid */}
      <div className="subjects-grid">
        {gradeInfo.subjects.map((subject, index) => (
          <div
            key={subject.subjectCode}
            className="subject-card"
            onClick={() => handleSubjectSelect(subject.subjectCode)}
            style={{
              background: `linear-gradient(135deg, ${getSubjectColor(index)}, ${getSubjectColor(index + 1)})`
            }}
          >
            <div className="subject-icon">
              {getSubjectIcon(subject.subjectName)}
            </div>
            <div className="subject-info">
              <h3>{subject.subjectName}</h3>
              <div className="complexity-tags">
                {subject.complexities.map((complexity) => (
                  <span key={complexity} className="complexity-tag">
                    {complexity}
                  </span>
                ))}
              </div>
            </div>
            <div className="subject-arrow">→</div>
          </div>
        ))}
      </div>

      {/* Back Button */}
      <div className="back-section">
        <button onClick={() => navigate('/select-grade')} className="btn-back">
          ← Back to Grades
        </button>
      </div>
    </div>
  );
};

export default SubjectSelection;
