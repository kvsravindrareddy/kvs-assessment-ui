import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import './TeacherGroups.css';

const TeacherGroups = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('classes'); // classes, create, details
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showClassCodeModal, setShowClassCodeModal] = useState(false);
  const [classCode, setClassCode] = useState('');

  // Form state for creating new class
  const [newClass, setNewClass] = useState({
    name: '',
    subject: '',
    gradeLevel: '',
    section: '',
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    description: '',
    schedule: '',
    requireApproval: false
  });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockClasses = [
        {
          id: 1,
          name: 'Grade 5A - Mathematics',
          subject: 'Mathematics',
          gradeLevel: '5',
          section: 'A',
          academicYear: '2025-2026',
          studentCount: 32,
          assignmentCount: 12,
          classCode: 'MTH5A1',
          createdDate: '2025-01-15',
          schedule: 'Mon, Wed, Fri 10:00 AM'
        },
        {
          id: 2,
          name: 'Grade 4B - English',
          subject: 'English',
          gradeLevel: '4',
          section: 'B',
          academicYear: '2025-2026',
          studentCount: 28,
          assignmentCount: 8,
          classCode: 'ENG4B2',
          createdDate: '2025-01-20',
          schedule: 'Tue, Thu 11:00 AM'
        }
      ];

      // Simulated API call
      setTimeout(() => {
        setClasses(mockClasses);
        setLoading(false);
      }, 500);

      // Actual API call (uncomment when backend is ready)
      /*
      const response = await axios.get(
        `http://localhost:9000/teacher/classes?teacherId=${user.id}`
      );
      setClasses(response.data);
      setLoading(false);
      */
    } catch (error) {
      console.error('Error loading classes:', error);
      setLoading(false);
    }
  };

  const generateClassCode = () => {
    // Generate unique 6-character code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateClass = async () => {
    try {
      const classCode = generateClassCode();

      const classData = {
        ...newClass,
        teacherId: user.id,
        schoolId: user.schoolId,
        classCode: classCode,
        createdDate: new Date().toISOString().split('T')[0]
      };

      // Mock creation - replace with actual API call
      console.log('Creating class:', classData);

      // Simulated API call
      setTimeout(() => {
        const newClassObj = {
          id: classes.length + 1,
          ...classData,
          studentCount: 0,
          assignmentCount: 0
        };
        setClasses([...classes, newClassObj]);
        setShowCreateModal(false);
        setClassCode(classCode);
        setShowClassCodeModal(true);

        // Reset form
        setNewClass({
          name: '',
          subject: '',
          gradeLevel: '',
          section: '',
          academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
          description: '',
          schedule: '',
          requireApproval: false
        });
      }, 500);

      // Actual API call (uncomment when backend is ready)
      /*
      const response = await axios.post(
        'http://localhost:9000/teacher/classes',
        classData
      );
      setClasses([...classes, response.data]);
      setShowCreateModal(false);
      setClassCode(response.data.classCode);
      setShowClassCodeModal(true);
      */
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Failed to create class. Please try again.');
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      return;
    }

    try {
      // Mock deletion
      setClasses(classes.filter(c => c.id !== classId));

      // Actual API call (uncomment when backend is ready)
      /*
      await axios.delete(`http://localhost:9000/teacher/classes/${classId}`);
      setClasses(classes.filter(c => c.id !== classId));
      */
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class. Please try again.');
    }
  };

  const renderClassesList = () => (
    <div className="classes-list-container">
      <div className="classes-header">
        <div className="header-content">
          <h2>My Classes</h2>
          <p>Manage your classes and student groups</p>
        </div>
        <button className="create-class-btn" onClick={() => setShowCreateModal(true)}>
          <span className="btn-icon">➕</span>
          Create New Class
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading classes...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No Classes Yet</h3>
          <p>Create your first class to start managing students and assignments</p>
          <button className="create-first-class-btn" onClick={() => setShowCreateModal(true)}>
            Create Your First Class
          </button>
        </div>
      ) : (
        <div className="classes-grid">
          {classes.map((classItem) => (
            <div key={classItem.id} className="class-card">
              <div className="class-card-header">
                <div className="class-icon">{classItem.subject === 'Mathematics' ? '🔢' : classItem.subject === 'English' ? '📖' : '📚'}</div>
                <div className="class-actions">
                  <button className="icon-btn" title="Class Code">
                    🔑
                  </button>
                  <button className="icon-btn" title="Settings">
                    ⚙️
                  </button>
                  <button
                    className="icon-btn delete"
                    title="Delete Class"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClass(classItem.id);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="class-card-body" onClick={() => {
                setSelectedClass(classItem);
                setActiveView('details');
              }}>
                <h3 className="class-name">{classItem.name}</h3>
                <div className="class-meta">
                  <span className="meta-item">
                    <span className="meta-icon">📅</span>
                    {classItem.academicYear}
                  </span>
                  <span className="meta-item">
                    <span className="meta-icon">🏫</span>
                    Grade {classItem.gradeLevel}{classItem.section}
                  </span>
                </div>
                {classItem.schedule && (
                  <div className="class-schedule">
                    <span className="schedule-icon">⏰</span>
                    {classItem.schedule}
                  </div>
                )}
              </div>

              <div className="class-card-footer">
                <div className="class-stat">
                  <span className="stat-value">{classItem.studentCount}</span>
                  <span className="stat-label">Students</span>
                </div>
                <div className="class-stat">
                  <span className="stat-value">{classItem.assignmentCount}</span>
                  <span className="stat-label">Assignments</span>
                </div>
                <button
                  className="view-class-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClass(classItem);
                    setActiveView('details');
                  }}
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCreateClassModal = () => (
    <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
      <div className="create-class-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Class</h2>
          <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="form-group full-width">
              <label>Class Name *</label>
              <input
                type="text"
                placeholder="e.g., Grade 5A - Mathematics"
                value={newClass.name}
                onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Subject *</label>
              <select
                value={newClass.subject}
                onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
              >
                <option value="">Select Subject</option>
                <option value="Mathematics">Mathematics</option>
                <option value="English">English</option>
                <option value="Science">Science</option>
                <option value="Social Studies">Social Studies</option>
                <option value="Hindi">Hindi</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Arts">Arts</option>
                <option value="Physical Education">Physical Education</option>
              </select>
            </div>

            <div className="form-group">
              <label>Grade Level *</label>
              <select
                value={newClass.gradeLevel}
                onChange={(e) => setNewClass({ ...newClass, gradeLevel: e.target.value })}
              >
                <option value="">Select Grade</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Section *</label>
              <select
                value={newClass.section}
                onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
              >
                <option value="">Select Section</option>
                {['A', 'B', 'C', 'D', 'E', 'F'].map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Academic Year *</label>
              <input
                type="text"
                placeholder="2025-2026"
                value={newClass.academicYear}
                onChange={(e) => setNewClass({ ...newClass, academicYear: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Schedule (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Mon, Wed, Fri 10:00 AM"
                value={newClass.schedule}
                onChange={(e) => setNewClass({ ...newClass, schedule: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Description (Optional)</label>
              <textarea
                rows="3"
                placeholder="Brief description of the class"
                value={newClass.description}
                onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newClass.requireApproval}
                  onChange={(e) => setNewClass({ ...newClass, requireApproval: e.target.checked })}
                />
                <span>Require approval for students joining with class code</span>
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleCreateClass}
            disabled={!newClass.name || !newClass.subject || !newClass.gradeLevel || !newClass.section}
          >
            Create Class
          </button>
        </div>
      </div>
    </div>
  );

  const renderClassCodeModal = () => (
    <div className="modal-overlay" onClick={() => setShowClassCodeModal(false)}>
      <div className="class-code-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎉 Class Created Successfully!</h2>
          <button className="modal-close" onClick={() => setShowClassCodeModal(false)}>✕</button>
        </div>

        <div className="modal-body">
          <p className="code-description">
            Share this code with your students so they can join the class:
          </p>

          <div className="class-code-display">
            <div className="code-value">{classCode}</div>
            <button
              className="copy-code-btn"
              onClick={() => {
                navigator.clipboard.writeText(classCode);
                alert('Class code copied to clipboard!');
              }}
            >
              📋 Copy Code
            </button>
          </div>

          <div className="code-instructions">
            <h4>How students can join:</h4>
            <ol>
              <li>Go to "Join Class" section</li>
              <li>Enter the class code: <strong>{classCode}</strong></li>
              <li>Click "Join Class"</li>
              {newClass.requireApproval && <li>Wait for your approval</li>}
            </ol>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary full-width" onClick={() => setShowClassCodeModal(false)}>
            Got It!
          </button>
        </div>
      </div>
    </div>
  );

  const renderClassDetails = () => (
    <div className="class-details-container">
      <div className="details-header">
        <button className="back-btn" onClick={() => {
          setActiveView('classes');
          setSelectedClass(null);
        }}>
          ← Back to Classes
        </button>
        <div className="details-title">
          <h2>{selectedClass.name}</h2>
          <div className="details-meta">
            <span className="meta-badge">{selectedClass.subject}</span>
            <span className="meta-badge">Grade {selectedClass.gradeLevel}{selectedClass.section}</span>
            <span className="meta-badge">Code: {selectedClass.classCode}</span>
          </div>
        </div>
      </div>

      <div className="details-tabs">
        <button className="tab-btn active">
          <span className="tab-icon">👥</span>
          Students ({selectedClass.studentCount})
        </button>
        <button className="tab-btn">
          <span className="tab-icon">📝</span>
          Assignments ({selectedClass.assignmentCount})
        </button>
        <button className="tab-btn">
          <span className="tab-icon">📊</span>
          Grade Book
        </button>
        <button className="tab-btn">
          <span className="tab-icon">📢</span>
          Announcements
        </button>
        <button className="tab-btn">
          <span className="tab-icon">⚙️</span>
          Settings
        </button>
      </div>

      <div className="details-content">
        <div className="coming-soon-message">
          <div className="coming-soon-icon">🚧</div>
          <h3>Detailed Class Management Coming Soon!</h3>
          <p>
            Students roster, assignment creation, grade book, and communication features
            will be available in the next update.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="teacher-groups-container">
      {activeView === 'classes' && renderClassesList()}
      {activeView === 'details' && selectedClass && renderClassDetails()}

      {showCreateModal && renderCreateClassModal()}
      {showClassCodeModal && renderClassCodeModal()}
    </div>
  );
};

export default TeacherGroups;
