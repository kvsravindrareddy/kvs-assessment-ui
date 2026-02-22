import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/GradeSelection.css';

const GradeSelection = () => {
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:9002/v1/grades');

      if (response.data.status === 'success') {
        setGrades(response.data.grades);
      } else {
        setError('Failed to load grades');
      }
    } catch (err) {
      console.error('Error fetching grades:', err);
      setError('Failed to load grades. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSelect = (gradeCode) => {
    navigate(`/select-subject/${gradeCode}`);
  };

  const getGradeIcon = (gradeName) => {
    if (gradeName.includes('Pre')) return '👶';
    if (gradeName.includes('Kindergarten')) return '🎨';
    if (gradeName.includes('I') || gradeName.includes('II') || gradeName.includes('III')) return '📚';
    if (gradeName.includes('IV') || gradeName.includes('V') || gradeName.includes('VI')) return '📖';
    return '🎓';
  };

  const filteredGrades = grades.filter(grade =>
    grade.gradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grade.gradeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="grade-selection-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading grades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grade-selection-container">
        <div className="error-message">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={fetchGrades} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grade-selection-container">
      {/* Header */}
      <div className="page-header">
        <h1>Select Your Grade</h1>
        <p>Choose your grade level to explore available assessments</p>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search grades..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <span className="search-icon">🔍</span>
      </div>

      {/* Stats Banner */}
      <div className="stats-banner">
        <div className="stat-item">
          <span className="stat-value">{grades.length}</span>
          <span className="stat-label">Grades Available</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {grades.reduce((sum, g) => sum + g.totalSubjects, 0)}
          </span>
          <span className="stat-label">Total Subjects</span>
        </div>
      </div>

      {/* Grades Grid */}
      <div className="grades-grid">
        {filteredGrades.map((grade) => (
          <div
            key={grade.gradeCode}
            className="grade-card"
            onClick={() => handleGradeSelect(grade.gradeCode)}
          >
            <div className="grade-icon">
              {getGradeIcon(grade.gradeName)}
            </div>
            <div className="grade-info">
              <h3>{grade.gradeName}</h3>
              <p className="subject-count">
                {grade.totalSubjects} {grade.totalSubjects === 1 ? 'Subject' : 'Subjects'} Available
              </p>
            </div>
            <div className="grade-arrow">→</div>
          </div>
        ))}
      </div>

      {filteredGrades.length === 0 && (
        <div className="no-results">
          <p>No grades found matching "{searchTerm}"</p>
          <button onClick={() => setSearchTerm('')} className="btn-secondary">
            Clear Search
          </button>
        </div>
      )}

      {/* Back Button */}
      <div className="back-section">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default GradeSelection;
