import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CONFIG from '../../../Config';
import './GradesManagement.css';

const GradesManagement = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [formData, setFormData] = useState({
    gradeCode: '',
    gradeName: '',
    displayOrder: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${CONFIG.development.GATEWAY_URL}/admin-assessment/v1/grades`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGrades(response.data || []);
    } catch (error) {
      console.error('Error loading grades:', error);
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultGrades = async () => {
    if (!window.confirm('Initialize default grades (PRE_K through XII)? This will not affect existing grades.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${CONFIG.development.GATEWAY_URL}/admin-assessment/v1/grades/initialize`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Default grades initialized successfully');
      loadGrades();
    } catch (error) {
      console.error('Error initializing grades:', error);
      alert('Failed to initialize grades');
    }
  };

  const handleOpenModal = (grade = null) => {
    if (grade) {
      setEditingGrade(grade);
      setFormData({
        gradeCode: grade.gradeCode,
        gradeName: grade.gradeName,
        displayOrder: grade.displayOrder,
        description: grade.description || '',
        isActive: grade.isActive
      });
    } else {
      setEditingGrade(null);
      setFormData({
        gradeCode: '',
        gradeName: '',
        displayOrder: grades.length + 1,
        description: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGrade(null);
    setFormData({
      gradeCode: '',
      gradeName: '',
      displayOrder: '',
      description: '',
      isActive: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.gradeCode || !formData.gradeName || !formData.displayOrder) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingGrade
        ? `${CONFIG.development.ADMIN_BASE_URL}/admin-assessment/v1/grades/${editingGrade.id}`
        : `${CONFIG.development.ADMIN_BASE_URL}/admin-assessment/v1/grades`;

      const method = editingGrade ? 'put' : 'post';

      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      alert(`Grade ${editingGrade ? 'updated' : 'created'} successfully`);
      handleCloseModal();
      loadGrades();
    } catch (error) {
      console.error('Error saving grade:', error);
      alert(error.response?.data?.message || 'Failed to save grade');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this grade? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${CONFIG.development.ADMIN_BASE_URL}/admin-assessment/v1/grades/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Grade deleted successfully');
      loadGrades();
    } catch (error) {
      console.error('Error deleting grade:', error);
      alert('Failed to delete grade. It may be in use by assessments.');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${CONFIG.development.GATEWAY_URL}/admin-assessment/v1/grades/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadGrades();
    } catch (error) {
      console.error('Error toggling grade status:', error);
      alert('Failed to toggle grade status');
    }
  };

  return (
    <div className="grades-management">
      <div className="grades-header">
        <div className="header-info">
          <h2>Grades Management</h2>
          <p>Manage academic grades for the system</p>
        </div>
        <div className="header-actions">
          <button onClick={initializeDefaultGrades} className="init-btn">
            🔄 Initialize Defaults
          </button>
          <button onClick={() => handleOpenModal()} className="add-btn">
            ➕ Add New Grade
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading grades...</div>
      ) : grades.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎓</div>
          <h3>No grades configured</h3>
          <p>Click "Initialize Defaults" to set up standard grades</p>
          <button onClick={initializeDefaultGrades} className="init-btn-large">
            Initialize Default Grades
          </button>
        </div>
      ) : (
        <div className="grades-grid">
          {grades.map(grade => (
            <div key={grade.id} className={`grade-card ${!grade.isActive ? 'inactive' : ''}`}>
              <div className="grade-card-header">
                <div className="grade-icon">🎓</div>
                <div className="grade-badge">
                  <span className="grade-order">#{grade.displayOrder}</span>
                </div>
              </div>

              <div className="grade-card-body">
                <h3>{grade.gradeName}</h3>
                <div className="grade-code">{grade.gradeCode}</div>
                {grade.description && (
                  <p className="grade-description">{grade.description}</p>
                )}
              </div>

              <div className="grade-card-footer">
                <div className="status-badge">
                  <span className={`status-dot ${grade.isActive ? 'active' : 'inactive'}`}></span>
                  {grade.isActive ? 'Active' : 'Inactive'}
                </div>

                <div className="grade-actions">
                  <button
                    onClick={() => handleToggleStatus(grade.id)}
                    className="action-btn toggle"
                    title={grade.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {grade.isActive ? '🔴' : '🟢'}
                  </button>
                  <button
                    onClick={() => handleOpenModal(grade)}
                    className="action-btn edit"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(grade.id)}
                    className="action-btn delete"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingGrade ? 'Edit Grade' : 'Add New Grade'}</h2>
              <button onClick={handleCloseModal} className="modal-close">×</button>
            </div>

            <form onSubmit={handleSubmit} className="grade-form">
              <div className="form-group">
                <label>Grade Code *</label>
                <input
                  type="text"
                  value={formData.gradeCode}
                  onChange={(e) => setFormData({...formData, gradeCode: e.target.value.toUpperCase()})}
                  placeholder="e.g., PRE_K, I, II, III"
                  required
                />
                <small>Use underscores for multi-word codes (PRE_K, KINDERGARTEN)</small>
              </div>

              <div className="form-group">
                <label>Grade Name *</label>
                <input
                  type="text"
                  value={formData.gradeName}
                  onChange={(e) => setFormData({...formData, gradeName: e.target.value})}
                  placeholder="e.g., Pre-Kindergarten, Grade 1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Display Order *</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value)})}
                  placeholder="1"
                  required
                  min="1"
                />
                <small>Lower numbers appear first</small>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Optional description"
                  rows="3"
                />
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  <span>Active (available for selection)</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCloseModal} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingGrade ? 'Update Grade' : 'Create Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradesManagement;
