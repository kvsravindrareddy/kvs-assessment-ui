import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import CONFIG from '../../../Config';
import './CreateAssessment.css';

const CreateAssessment = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    assessmentName: '',
    gradeLevel: 'X',
    subject: 'MATH',
    topic: '',
    chapter: '',
    difficulty: 'MEDIUM',
    numberOfQuestions: 10,
    timeLimit: 30,
    passingScore: 40,
    assignToClass: ''
  });
  const [topics, setTopics] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createStatus, setCreateStatus] = useState(null);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const subjects = ['MATH', 'SCIENCE', 'ENGLISH', 'SOCIAL_STUDIES', 'COMPUTER_SCIENCE', 'HINDI', 'SANSKRIT'];
  const gradeLevels = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const difficulties = ['EASY', 'MEDIUM', 'HARD'];

  useEffect(() => {
    if (formData.subject) {
      fetchTopicsAndChapters();
    }
  }, [formData.subject, formData.gradeLevel]);

  const fetchTopicsAndChapters = async () => {
    try {
      const response = await axios.get(
        `${CONFIG.development.ADMIN_BASE_URL}/v1/grades/${formData.gradeLevel}/subjects/${formData.subject}/topics`
      );
      if (response.data.status === 'success') {
        setTopics(response.data.topics || []);
        setChapters(response.data.chapters || []);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${CONFIG.development.ADMIN_BASE_URL}/v1/assessment/preview`,
        formData,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.data.success) {
        setPreviewQuestions(response.data.questions || []);
        setShowPreview(true);
      }
    } catch (error) {
      setCreateStatus({ type: 'error', message: 'Failed to generate preview' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    setCreateStatus(null);
    try {
      const payload = {
        ...formData,
        createdBy: user ? (user.id || user.email) : 'GUEST_USER'
      };
      const response = await axios.post(
        `${CONFIG.development.ADMIN_BASE_URL}/v1/assessment/create`,
        payload,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.data.success) {
        setCreateStatus({
          type: 'success',
          message: `Assessment "${formData.assessmentName}" created successfully! Assessment ID: ${response.data.assessmentId}`
        });
        // Reset form
        setFormData({
          assessmentName: '',
          gradeLevel: 'X',
          subject: 'MATH',
          topic: '',
          chapter: '',
          difficulty: 'MEDIUM',
          numberOfQuestions: 10,
          timeLimit: 30,
          passingScore: 40,
          assignToClass: ''
        });
        setShowPreview(false);
      }
    } catch (error) {
      setCreateStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to create assessment'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-assessment-container">
      <div className="assessment-header">
        <h2><span>➕</span> Create New Assessment</h2>
        <p>Configure and generate assessments with advanced options</p>
      </div>

      <div className="assessment-form-card">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Assessment Name *</label>
              <input type="text" name="assessmentName" value={formData.assessmentName} onChange={handleInputChange} placeholder="e.g., Chapter 1 Quiz" className="form-input" />
            </div>
            <div className="form-group">
              <label>Grade Level *</label>
              <select name="gradeLevel" value={formData.gradeLevel} onChange={handleInputChange} className="form-select">
                {gradeLevels.map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Subject *</label>
              <select name="subject" value={formData.subject} onChange={handleInputChange} className="form-select">
                {subjects.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Assign to Class</label>
              <input type="text" name="assignToClass" value={formData.assignToClass} onChange={handleInputChange} placeholder="e.g., 10-A" className="form-input" />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Content Selection</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Topic (Optional)</label>
              <select name="topic" value={formData.topic} onChange={handleInputChange} className="form-select">
                <option value="">All Topics</option>
                {topics.map((t, i) => <option key={i} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Chapter (Optional)</label>
              <select name="chapter" value={formData.chapter} onChange={handleInputChange} className="form-select">
                <option value="">All Chapters</option>
                {chapters.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Difficulty Level *</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleInputChange} className="form-select">
                {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Assessment Configuration</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Number of Questions *</label>
              <input type="number" name="numberOfQuestions" value={formData.numberOfQuestions} onChange={handleInputChange} min="1" max="100" className="form-input" />
            </div>
            <div className="form-group">
              <label>Time Limit (minutes) *</label>
              <input type="number" name="timeLimit" value={formData.timeLimit} onChange={handleInputChange} min="5" max="180" className="form-input" />
            </div>
            <div className="form-group">
              <label>Passing Score (%) *</label>
              <input type="number" name="passingScore" value={formData.passingScore} onChange={handleInputChange} min="0" max="100" className="form-input" />
            </div>
          </div>
        </div>

        {createStatus && (
          <div className={`create-status ${createStatus.type}`}>
            <span>{createStatus.type === 'success' ? '✅' : '⚠️'}</span>
            <p>{createStatus.message}</p>
          </div>
        )}

        <div className="form-actions">
          <button onClick={handlePreview} disabled={loading || !formData.assessmentName} className="btn-preview">
            {loading ? 'Loading...' : 'Preview Questions'}
          </button>
          <button onClick={handleCreate} disabled={loading || !formData.assessmentName} className="btn-create">
            {loading ? 'Creating...' : 'Create Assessment'}
          </button>
        </div>

        {showPreview && previewQuestions.length > 0 && (
          <div className="preview-section">
            <h3>Preview ({previewQuestions.length} questions)</h3>
            <div className="preview-questions">
              {previewQuestions.slice(0, 5).map((q, i) => (
                <div key={i} className="preview-question">
                  <strong>Q{i + 1}:</strong> {q.question || q.text}
                </div>
              ))}
              {previewQuestions.length > 5 && <p className="preview-more">... and {previewQuestions.length - 5} more questions</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAssessment;
