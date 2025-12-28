import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [activeTab]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        const response = await axios.get('http://localhost:9000/auth/admin/pending-users');
        setPendingUsers(response.data);
      } else {
        const response = await axios.get('http://localhost:9000/auth/admin/users');
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await axios.post('http://localhost:9000/auth/admin/approve-user', {
        userId: userId,
        approved: true
      });
      alert('User approved successfully!');
      loadUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await axios.post('http://localhost:9000/auth/admin/approve-user', {
        userId: userId,
        approved: false,
        rejectionReason: reason
      });
      alert('User rejected successfully!');
      loadUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user');
    }
  };

  const renderPendingUsers = () => (
    <div className="users-list">
      {pendingUsers.length === 0 ? (
        <div className="empty-state">No pending user approvals</div>
      ) : (
        pendingUsers.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-info">
              <h3>{user.firstName} {user.lastName}</h3>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phoneNumber || 'N/A'}</p>
              <p><strong>Registered:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="user-actions">
              <button
                className="btn-approve"
                onClick={() => handleApprove(user.id)}
              >
                ✓ Approve
              </button>
              <button
                className="btn-reject"
                onClick={() => handleReject(user.id)}
              >
                × Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderAllUsers = () => (
    <div className="users-table">
      {users.length === 0 ? (
        <div className="empty-state">No users found</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td><span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span></td>
                <td><span className={`status-badge ${user.status.toLowerCase()}`}>{user.status}</span></td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage user registrations and approvals</p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Approvals
          {pendingUsers.length > 0 && (
            <span className="badge">{pendingUsers.length}</span>
          )}
        </button>
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Users
        </button>
      </div>

      <div className="content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          activeTab === 'pending' ? renderPendingUsers() : renderAllUsers()
        )}
      </div>
    </div>
  );
};

export default UserManagement;
