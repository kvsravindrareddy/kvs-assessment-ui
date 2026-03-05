import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CONFIG from '../../../Config';
import './SessionManagement.css';

const SessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [filters, setFilters] = useState({
    userId: '',
    assessmentType: '',
    status: ''
  });
  const [selectedSessions, setSelectedSessions] = useState([]);

  useEffect(() => {
    loadSessions();
    loadStatistics();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadSessions();
      loadStatistics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sessions, filters]);

  const loadSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      // Always load only active sessions by default
      const url = `${CONFIG.development.GATEWAY_URL}/admin-assessment/v1/admin/sessions/active`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSessions(response.data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${CONFIG.development.GATEWAY_URL}/admin-assessment/v1/admin/sessions/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatistics(response.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...sessions];

    if (filters.userId) {
      filtered = filtered.filter(s =>
        s.userId.toLowerCase().includes(filters.userId.toLowerCase())
      );
    }

    if (filters.assessmentType) {
      filtered = filtered.filter(s =>
        s.assessmentType.toLowerCase().includes(filters.assessmentType.toLowerCase())
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      filtered = filtered.filter(s => s.status === filters.status);
    }

    setFilteredSessions(filtered);
  };

  const handleKillSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to terminate this session?')) return;

    try {
      const token = localStorage.getItem('token');
      const reason = prompt('Enter reason for termination:', 'Admin terminated session');

      await axios.post(
        `${CONFIG.development.GATEWAY_URL}/admin-assessment/v1/admin/sessions/${sessionId}/terminate?reason=${encodeURIComponent(reason || 'Admin action')}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Session terminated successfully');
      loadSessions();
      loadStatistics();
    } catch (error) {
      console.error('Error killing session:', error);
      alert('Failed to terminate session');
    }
  };

  const handleBulkKill = async () => {
    if (selectedSessions.length === 0) {
      alert('Please select sessions to terminate');
      return;
    }

    if (!window.confirm(`Terminate ${selectedSessions.length} selected sessions?`)) return;

    try {
      const token = localStorage.getItem('token');
      const reason = prompt('Enter reason for bulk termination:', 'Bulk termination by admin');

      await axios.post(
        `${CONFIG.development.GATEWAY_URL}/admin-assessment/v1/admin/sessions/terminate-bulk?reason=${encodeURIComponent(reason || 'Bulk admin action')}`,
        selectedSessions,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      alert('Sessions terminated successfully');
      setSelectedSessions([]);
      loadSessions();
      loadStatistics();
    } catch (error) {
      console.error('Error in bulk kill:', error);
      alert('Failed to terminate sessions');
    }
  };

  const toggleSessionSelection = (sessionId) => {
    setSelectedSessions(prev =>
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedSessions.length === filteredSessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(filteredSessions.map(s => s.sessionId));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'IN_PROGRESS': { color: '#3b82f6', bg: '#dbeafe', label: 'Active' },
      'COMPLETED': { color: '#10b981', bg: '#d1fae5', label: 'Completed' },
      'TERMINATED': { color: '#ef4444', bg: '#fee2e2', label: 'Terminated' }
    };

    const config = statusConfig[status] || { color: '#64748b', bg: '#f1f5f9', label: status };

    return (
      <span style={{
        background: config.bg,
        color: config.color,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: '600'
      }}>
        {config.label}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const icons = {
      'MATH': '📐',
      'SCIENCE': '🔬',
      'ENGLISH': '📚',
      'STORY': '📖',
      'MATH_CHALLENGE': '⚡'
    };
    return icons[type] || '📝';
  };

  return (
    <div className="session-management">
      {/* Statistics Cards */}
      {statistics && (
        <div className="session-stats-grid">
          <div className="session-stat-card active">
            <div className="stat-icon">🟢</div>
            <div className="stat-info">
              <div className="stat-value">{statistics.activeSessions}</div>
              <div className="stat-label">Active Sessions</div>
            </div>
          </div>
          <div className="session-stat-card completed">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <div className="stat-value">{statistics.completedSessions}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          <div className="session-stat-card terminated">
            <div className="stat-icon">🛑</div>
            <div className="stat-info">
              <div className="stat-value">{statistics.terminatedSessions}</div>
              <div className="stat-label">Terminated</div>
            </div>
          </div>
          <div className="session-stat-card total">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <div className="stat-value">{statistics.totalSessions}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="session-filters">
        <input
          type="text"
          placeholder="Search by User ID..."
          value={filters.userId}
          onChange={(e) => setFilters({...filters, userId: e.target.value})}
          className="filter-input"
        />
        <input
          type="text"
          placeholder="Filter by Type (MATH, SCIENCE...)"
          value={filters.assessmentType}
          onChange={(e) => setFilters({...filters, assessmentType: e.target.value})}
          className="filter-input"
        />
        <select
          value={filters.status}
          onChange={(e) => {
            setFilters({...filters, status: e.target.value});
            loadSessions();
          }}
          className="filter-select"
        >
          <option value="IN_PROGRESS">Active Only</option>
          <option value="ALL">All Sessions</option>
          <option value="COMPLETED">Completed</option>
          <option value="TERMINATED">Terminated</option>
        </select>
        <button onClick={loadSessions} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedSessions.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedSessions.length} selected</span>
          <button onClick={handleBulkKill} className="bulk-kill-btn">
            🛑 Terminate Selected
          </button>
          <button onClick={() => setSelectedSessions([])} className="clear-selection-btn">
            Clear Selection
          </button>
        </div>
      )}

      {/* Sessions Table */}
      <div className="sessions-table-container">
        {loading ? (
          <div className="loading-state">Loading sessions...</div>
        ) : filteredSessions.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
            <h3>No sessions found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <table className="sessions-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedSessions.length === filteredSessions.length && filteredSessions.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Type</th>
                <th>User ID</th>
                <th>Assessment Name</th>
                <th>Progress</th>
                <th>Score</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Started At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map(session => (
                <tr key={session.sessionId}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedSessions.includes(session.sessionId)}
                      onChange={() => toggleSessionSelection(session.sessionId)}
                    />
                  </td>
                  <td>
                    <span style={{ fontSize: '1.5rem' }}>
                      {getTypeIcon(session.assessmentType)}
                    </span>
                  </td>
                  <td className="user-id-cell">{session.userId}</td>
                  <td className="assessment-name-cell">{session.assessmentName}</td>
                  <td>
                    <div className="progress-cell">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${session.progressPercentage}%` }}
                        />
                      </div>
                      <span className="progress-text">
                        {session.lastAttemptedIndex} / {session.totalQuestions}
                      </span>
                    </div>
                  </td>
                  <td className="score-cell">
                    <strong>{session.score}</strong>
                  </td>
                  <td>{session.duration}</td>
                  <td>{getStatusBadge(session.status)}</td>
                  <td className="date-cell">
                    {new Date(session.startedAt).toLocaleString()}
                  </td>
                  <td>
                    {session.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleKillSession(session.sessionId)}
                        className="kill-btn"
                        title="Terminate Session"
                      >
                        🛑
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SessionManagement;
