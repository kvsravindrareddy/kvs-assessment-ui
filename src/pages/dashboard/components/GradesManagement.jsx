import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CONFIG from '../../../Config';
import './GradesManagement.css';

const GradesManagement = () => {
  const [grades, setGrades] = useState([]);
  const [subjectPool, setSubjectPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  
  const [newPoolSubject, setNewPoolSubject] = useState('');

  const [formData, setFormData] = useState({
    gradeCode: '',
    gradeName: '',
    displayOrder: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([loadGrades(), loadSubjectPool()]);
    setLoading(false);
  };

  const loadGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      // Using the new unified endpoint that returns Grades with their Subjects
      const response = await axios.get(
        `${CONFIG.development.GATEWAY_URL}/admin-assessment/v1/grade-subjects`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const gradesData = (response.data || []).map(g => ({ ...g, subjects: g.subjects || [] }));
      setGrades(gradesData);
    } catch (error) {
      console.error('Error loading grades:', error);
    }
  };

  const loadSubjectPool = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${CONFIG.development.GATEWAY_URL}/admin-assessment/v1/grade-subjects/pool`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubjectPool(response.data || []);
    } catch (error) {
      console.error('Error loading subject pool:', error);
    }
  };

  // --- 1. GRADES INITIALIZATION (Brought back!) ---
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
      loadInitialData(); // Refresh everything
    } catch (error) {
      console.error('Error initializing grades:', error);
      alert('Failed to initialize grades');
    }
  };

  // --- 2. SUBJECTS POOL INITIALIZATION ---
  const handleLoadDefaultSubjects = async () => {
    if (!window.confirm('Load default subjects into the database pool?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${CONFIG.development.GATEWAY_URL}/admin-assessment/v1/grade-subjects/pool/load-defaults`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
      loadSubjectPool(); // Refresh just the pool
    } catch (error) {
      console.error('Error loading defaults:', error);
      alert('Failed to load default subjects.');
    }
  };

  // --- POOL CRUD ---
  const handleAddToPool = async (e) => {
    e.preventDefault();
    if (!newPoolSubject.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${CONFIG.development.GATEWAY_URL}/admin-assessment/v1/grade-subjects/pool`,
        { subjectName: newPoolSubject.toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!subjectPool.find(s => s.id === response.data.id)) {
          setSubjectPool([...subjectPool, response.data]);
      }
      setNewPoolSubject('');
    } catch (error) {
      console.error('Error adding to pool:', error);
      alert('Failed to add subject to pool. It might already exist.');
    }
  };

  // --- ASSIGNMENT CRUD ---
  const handleAssignSubject = async (gradeId, subjectId) => {
    if (!subjectId) return; 
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${CONFIG.development.GATEWAY_URL}/admin-assessment/v1/grade-subjects/${gradeId}/subjects/${subjectId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Optimistic update using returned GradeEntity
      setGrades(grades.map(g => g.id === gradeId ? response.data : g));
    } catch (error) {
      console.error('Error assigning subject:', error);
      alert('Failed to assign subject.');
    }
  };

  const handleRemoveSubject = async (gradeId, subjectId, subjectName) => {
    if (!window.confirm(`Remove ${subjectName} from this grade?`)) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${CONFIG.development.GATEWAY_URL}/admin-assessment/v1/grade-subjects/${gradeId}/subjects/${subjectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Optimistic update using returned GradeEntity
      setGrades(grades.map(g => g.id === gradeId ? response.data : g));
    } catch (error) {
      console.error('Error removing subject:', error);
      alert('Failed to remove subject.');
    }
  };

  // --- GRADE CRUD ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.gradeCode || !formData.gradeName || !formData.displayOrder) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const url = editingGrade
        ? `${CONFIG.development.GATEWAY_URL}/admin-assessment/v1/grades/${editingGrade.id}`
        : `${CONFIG.development.GATEWAY_URL}/admin-assessment/v1/grades`;

      const method = editingGrade ? 'put' : 'post';

      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      alert(`Grade ${editingGrade ? 'updated' : 'created'} successfully`);
      handleCloseModal();
      loadGrades();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save grade');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this grade? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${CONFIG.development.GATEWAY_URL}/admin-assessment/v1/grades/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadGrades();
    } catch (error) {
      alert('Failed to delete grade. It may be in use.');
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
      alert('Failed to toggle status');
    }
  };

  const handleOpenModal = (grade = null) => {
    setEditingGrade(grade);
    setFormData(grade ? { ...grade } : {
      gradeCode: '', gradeName: '', displayOrder: grades.length + 1, description: '', isActive: true
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGrade(null);
  };

  if (loading) return <div className="loading-state">Loading Curriculum Setup...</div>;

  return (
    <div className="grades-management">
      <div className="grades-header">
        <div className="header-info">
          <h2>Curriculum & Grades Management</h2>
          <p>Manage academic grades and assign subjects from the global pool.</p>
        </div>
        <div className="header-actions">
          {/* BROUGHT BACK: Init Default Grades Button */}
          <button onClick={initializeDefaultGrades} className="init-btn">🔄 Init Grades</button>
          <button onClick={() => handleOpenModal()} className="add-btn">➕ Add Grade</button>
        </div>
      </div>

      {/* GLOBAL SUBJECT POOL PANEL */}
      <div className="subject-pool-panel">
        <div className="pool-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <h3>🌍 Global Subject Pool</h3>
                <p>Standard subjects available to be mapped to any grade.</p>
            </div>
            {/* ONE TIME LOAD DB SUBJECTS BUTTON */}
            {subjectPool.length === 0 && (
                <button onClick={handleLoadDefaultSubjects} className="init-btn" style={{ background: '#10b981' }}>
                    ⚡ Load DB Subjects
                </button>
            )}
          </div>
        </div>
        <div className="pool-content">
          <div className="pool-chips">
            {subjectPool.map(subject => (
              <span key={subject.id} className="pool-chip">
                {/* FIX: Using subjectName from DB */}
                <span className="pool-icon">📚</span> {subject.subjectName.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
          <form className="add-pool-form" onSubmit={handleAddToPool}>
            <input 
              type="text" 
              placeholder="E.g., ROBOTICS" 
              value={newPoolSubject}
              onChange={(e) => setNewPoolSubject(e.target.value.toUpperCase())}
            />
            <button type="submit" disabled={!newPoolSubject}>+ Add to Pool</button>
          </form>
        </div>
      </div>

      {/* GRADES GRID */}
      {grades.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎓</div>
          <h3>No grades configured</h3>
          <p>Click "Init Grades" to set up standard grades</p>
        </div>
      ) : (
        <div className="grades-grid">
          {grades.map(grade => {
            // Filter pool to only show subjects NOT already assigned to this grade
            const availableSubjects = subjectPool.filter(
              poolSub => !(grade.subjects || []).some(assignedSub => assignedSub.id === poolSub.id)
            );

            return (
              <div key={grade.id} className={`grade-card ${!grade.isActive ? 'inactive' : ''}`}>
                <div className="grade-card-header">
                  <div className="grade-badge">#{grade.displayOrder}</div>
                  <div className="grade-actions-mini">
                    <button onClick={() => handleToggleStatus(grade.id)} title="Toggle Status">
                      {grade.isActive ? '🟢' : '🔴'}
                    </button>
                    <button onClick={() => handleOpenModal(grade)}>✏️</button>
                    <button onClick={() => handleDelete(grade.id)}>🗑️</button>
                  </div>
                </div>

                <div className="grade-card-body">
                  <h3>{grade.gradeName} <span className="grade-code-pill">({grade.gradeCode})</span></h3>
                  {grade.description && <p className="grade-description">{grade.description}</p>}
                  
                  <div className="grade-subjects-section">
                    <h4>Assigned Subjects ({(grade.subjects || []).length})</h4>
                    <div className="assigned-chips">
                      {(grade.subjects || []).map(sub => (
                        <span key={sub.id} className="assigned-chip">
                          {/* FIX: Using subjectName from DB */}
                          {sub.subjectName.replace(/_/g, ' ')}
                          <button className="chip-remove" onClick={() => handleRemoveSubject(grade.id, sub.id, sub.subjectName)}>×</button>
                        </span>
                      ))}
                    </div>
                    
                    <select 
                      className="subject-assign-select"
                      onChange={(e) => {
                        handleAssignSubject(grade.id, e.target.value);
                        e.target.value = ""; 
                      }}
                    >
                      <option value="">+ Assign Subject...</option>
                      {availableSubjects.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.subjectName.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit/Add Grade Modal */}
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
                  placeholder="e.g., PRE_K, I, II"
                  required
                />
              </div>
              <div className="form-group">
                <label>Grade Name *</label>
                <input
                  type="text"
                  value={formData.gradeName}
                  onChange={(e) => setFormData({...formData, gradeName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Display Order *</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value)})}
                  required min="1"
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
                <button type="button" onClick={handleCloseModal} className="cancel-btn">Cancel</button>
                <button type="submit" className="submit-btn">{editingGrade ? 'Update Grade' : 'Create Grade'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradesManagement;