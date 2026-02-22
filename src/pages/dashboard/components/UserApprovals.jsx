import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserApprovals.css';

const UserApprovals = () => {
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
        setPendingUsers(response.data || []);
      } else {
        const response = await axios.get('http://localhost:9000/auth/admin/users');
        setUsers(response.data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Set empty arrays on error
      if (activeTab === 'pending') {
        setPendingUsers([]);
      } else {
        setUsers([]);
      }
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
      alert(error.response?.data?.message || 'Failed to approve user');
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
      alert(error.response?.data?.message || 'Failed to reject user');
    }
  };

  const renderPendingUsers = () => (
    <div className="approvals-list">
      {pendingUsers.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">✅</span>
          <h4>No pending user approvals</h4>
          <p>All user registrations have been processed</p>
        </div>
      ) : (
        <div className="user-cards-grid">
          {pendingUsers.map(user => (
            <div key={user.id} className="approval-card">
              <div className="approval-card-header">
                <div className="user-avatar-large">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="user-primary-info">
                  <h4>{user.firstName} {user.lastName}</h4>
                  <p className="user-email">{user.email}</p>
                </div>
              </div>
              <div className="approval-card-body">
                <div className="info-row">
                  <span className="info-label">Username:</span>
                  <span className="info-value">@{user.username}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{user.phoneNumber || 'Not provided'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Registered:</span>
                  <span className="info-value">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="approval-card-actions">
                <button
                  className="btn-approve"
                  onClick={() => handleApprove(user.id)}
                >
                  <span className="btn-icon">✓</span>
                  Approve
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleReject(user.id)}
                >
                  <span className="btn-icon">×</span>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAllUsers = () => (
    <div className="approvals-table-container">
      {users.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">👥</span>
          <h4>No users found</h4>
          <p>Users will appear here once they are registered</p>
        </div>
      ) : (
        <table className="approvals-table">
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
                <td>
                  <div className="table-user-info">
                    <div className="table-user-avatar">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <span>{user.firstName} {user.lastName}</span>
                  </div>
                </td>
                <td>@{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role?.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.status?.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="user-approvals">
      <h3 className="section-title">
        <span className="title-icon">✅</span>
        User Approvals
      </h3>
      <p className="section-subtitle">
        Review and approve user registrations
      </p>

      {/* Tabs */}
      <div className="approval-tabs">
        <button
          className={`approval-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <span className="tab-icon">⏳</span>
          Pending Approvals
          {pendingUsers.length > 0 && (
            <span className="tab-badge">{pendingUsers.length}</span>
          )}
        </button>
        <button
          className={`approval-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span className="tab-icon">👥</span>
          All Users
        </button>
      </div>

      {/* Content */}
      <div className="approval-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : (
          activeTab === 'pending' ? renderPendingUsers() : renderAllUsers()
        )}
      </div>
    </div>
  );
};

export default UserApprovals;
