import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import './UserRoleManagement.css';

const UserRoleManagement = () => {
  const { user, ROLES } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showLinkStudentsModal, setShowLinkStudentsModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  // All available roles
  const allRoles = Object.keys(ROLES).map(key => ROLES[key]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:9000/auth/admin/users');
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to load users. Please ensure the backend service is running.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser({ ...user, editedRole: user.role });
    setShowEditModal(true);
  };

  const handleSaveUserRoles = async () => {
    try {
      await axios.put(`http://localhost:9000/auth/admin/users/${selectedUser.id}/roles`, {
        roles: [selectedUser.editedRole],
        primaryRole: selectedUser.editedRole
      });

      // Update local state
      setUsers(users.map(u =>
        u.id === selectedUser.id
          ? { ...u, role: selectedUser.editedRole }
          : u
      ));

      setShowEditModal(false);
      setSelectedUser(null);
      alert('User role updated successfully!');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert(error.response?.data?.message || 'Failed to update user role. Please try again.');
    }
  };

  const selectRole = (role) => {
    if (!selectedUser) return;
    setSelectedUser({ ...selectedUser, editedRole: role });
  };

  const handleLinkStudents = async (parent) => {
    setSelectedParent(parent);
    // Fetch all students
    try {
      const response = await axios.get('http://localhost:9000/auth/admin/users');
      const allStudents = response.data.filter(u => u.role === 'STUDENT');
      setStudents(allStudents);

      // Fetch already linked children
      try {
        const linkedResponse = await axios.get(`http://localhost:9000/auth/parent-child/children/${parent.id}`);
        const linkedIds = linkedResponse.data.children.map(c => c.id);
        setSelectedStudents(linkedIds);
      } catch (error) {
        console.error('Error fetching linked children:', error);
        setSelectedStudents([]);
      }

      setShowLinkStudentsModal(true);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Failed to load students');
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSaveLinkStudents = async () => {
    try {
      // Get currently linked children
      const linkedResponse = await axios.get(`http://localhost:9000/auth/parent-child/children/${selectedParent.id}`);
      const currentlyLinked = linkedResponse.data.children.map(c => c.id);

      // Find students to link (newly selected)
      const toLink = selectedStudents.filter(id => !currentlyLinked.includes(id));

      // Find students to unlink (previously linked but now unselected)
      const toUnlink = currentlyLinked.filter(id => !selectedStudents.includes(id));

      // Link new students
      for (const studentId of toLink) {
        await axios.post('http://localhost:9000/auth/parent-child/admin/link', {
          parentId: selectedParent.id,
          studentId: studentId
        });
      }

      // Unlink removed students
      for (const studentId of toUnlink) {
        await axios.delete(`http://localhost:9000/auth/parent-child/unlink/${selectedParent.id}/${studentId}`);
      }

      setShowLinkStudentsModal(false);
      setSelectedParent(null);
      setSelectedStudents([]);
      alert('Student links updated successfully!');
    } catch (error) {
      console.error('Error updating student links:', error);
      alert(error.response?.data?.message || 'Failed to update student links');
    }
  };


  // Filter users based on search and role filter
  const filteredUsers = users.filter(u => {
    const matchesSearch = searchQuery === '' ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === 'ALL' || u.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const roleIcons = {
    SUPER_ADMIN: '👑',
    DISTRICT_ADMIN: '🏛️',
    SCHOOL_ADMIN: '🏫',
    TEACHER: '👨‍🏫',
    PARENT: '👪',
    STUDENT: '🎓',
    COUNSELOR: '🤝',
    CONTENT_CREATOR: '✍️',
    LIBRARIAN: '📚',
    OBSERVER: '👀',
    SUPPORT_STAFF: '🛠️',
    AI_ASSISTANT: '🤖'
  };

  const statusColors = {
    ACTIVE: '#48bb78',
    PENDING: '#ed8936',
    SUSPENDED: '#e53e3e',
    INACTIVE: '#718096'
  };

  if (loading) {
    return (
      <div className="user-management-loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="user-role-management">
      {/* Header */}
      <div className="management-header">
        <div className="header-left">
          <h2 className="management-title">
            <span className="title-icon">👥</span>
            User & Role Management
          </h2>
          <p className="management-subtitle">
            Manage user roles for the Assessment Service
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="management-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="role-filter">
          <label>Filter by Role:</label>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="ALL">All Roles</option>
            {allRoles.map(role => (
              <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="user-stats">
        <div className="stat-item">
          <span className="stat-value">{users.length}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{users.filter(u => u.status === 'ACTIVE').length}</span>
          <span className="stat-label">Active Users</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{filteredUsers.length}</span>
          <span className="stat-label">Filtered Results</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Primary Role</th>
              <th>All Roles</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">{user.firstName[0]}{user.lastName[0]}</div>
                    <div className="user-details">
                      <div className="user-name">{user.firstName} {user.lastName}</div>
                      <div className="user-email">{user.email}</div>
                      <div className="user-username">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="role-badge primary">
                    <span className="role-icon">{roleIcons[user.role]}</span>
                    {user.role.replace(/_/g, ' ')}
                  </span>
                </td>
                <td>
                  <div className="roles-list">
                    {(user.roles || [user.role]).map((role, idx) => (
                      <span key={idx} className="role-badge small">
                        {roleIcons[role]} {role.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span
                    className="status-badge"
                    style={{ background: `${statusColors[user.status]}20`, color: statusColors[user.status] }}
                  >
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEditUser(user)}
                      title="Edit Roles"
                    >
                      ✏️
                    </button>
                    {user.role === 'PARENT' && (
                      <button
                        className="action-btn link"
                        onClick={() => handleLinkStudents(user)}
                        title="Link Students"
                      >
                        👨‍👩‍👧‍👦
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="no-results">
            <span className="no-results-icon">🔍</span>
            <p>No users found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Edit Roles Modal */}
      {showEditModal && selectedUser && (
        <>
          <div className="modal-backdrop" onClick={() => setShowEditModal(false)} />
          <div className="modal edit-roles-modal">
            <div className="modal-header">
              <h3>Edit User Roles</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="user-info-section">
                <div className="user-avatar large">{selectedUser.firstName[0]}{selectedUser.lastName[0]}</div>
                <div>
                  <h4>{selectedUser.firstName} {selectedUser.lastName}</h4>
                  <p>{selectedUser.email}</p>
                </div>
              </div>

              <div className="roles-selection">
                <h4>Assign Role (Select one):</h4>
                <div className="roles-grid">
                  {allRoles.map(role => (
                    <div
                      key={role}
                      className={`role-radio ${selectedUser.editedRole === role ? 'selected' : ''}`}
                      onClick={() => selectRole(role)}
                    >
                      <input
                        type="radio"
                        name="userRole"
                        checked={selectedUser.editedRole === role}
                        onChange={() => {}} // Handled by div onClick
                        onClick={(e) => e.stopPropagation()} // Prevent double toggle
                      />
                      <span className="role-label">
                        <span className="role-icon">{roleIcons[role]}</span>
                        {role.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="help-text">
                  Note: Selecting a new role will replace the current role
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleSaveUserRoles}
                disabled={!selectedUser.editedRole}
              >
                Save Changes
              </button>
            </div>
          </div>
        </>
      )}

      {/* Link Students Modal (Admin) */}
      {showLinkStudentsModal && selectedParent && (
        <>
          <div className="modal-backdrop" onClick={() => setShowLinkStudentsModal(false)} />
          <div className="modal link-students-modal">
            <div className="modal-header">
              <h3>Link Students to Parent</h3>
              <button className="close-btn" onClick={() => setShowLinkStudentsModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="user-info-section">
                <div className="user-avatar large">{selectedParent.firstName[0]}{selectedParent.lastName[0]}</div>
                <div>
                  <h4>{selectedParent.firstName} {selectedParent.lastName}</h4>
                  <p>{selectedParent.email}</p>
                  <span className="role-badge">👪 PARENT</span>
                </div>
              </div>

              <div className="students-selection">
                <h4>Select Students ({selectedStudents.length} selected):</h4>
                <div className="students-grid">
                  {students.map(student => (
                    <div
                      key={student.id}
                      className={`student-checkbox ${selectedStudents.includes(student.id) ? 'checked' : ''}`}
                      onClick={() => toggleStudentSelection(student.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => {}}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="student-info">
                        <div className="student-avatar-small">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div className="student-details">
                          <div className="student-name">{student.firstName} {student.lastName}</div>
                          <div className="student-email">{student.email}</div>
                          {student.grade && <div className="student-grade">Grade: {student.grade}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {students.length === 0 && (
                  <p className="no-students">No students found in the system</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowLinkStudentsModal(false)}>
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleSaveLinkStudents}
              >
                Save Links
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default UserRoleManagement;
