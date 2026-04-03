import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CONFIG from '../../../Config';
import './IncidentManagement.css';

export default function IncidentManagement() {
  const [incidents, setIncidents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, OPEN, IN_PROGRESS, RESOLVED, CLOSED
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updateData, setUpdateData] = useState({});
  
  // 🌟 NEW: History State
  const [incidentHistory, setIncidentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadIncidents();
    loadStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${CONFIG.development.ADMIN_BASE_URL}/admin-assessment/v1/incidents/all?page=0&size=50`;

      if (filter !== 'ALL') {
        url = `${CONFIG.development.ADMIN_BASE_URL}/admin-assessment/v1/incidents/status/${filter}?page=0&size=50`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setIncidents(response.data || []);
    } catch (error) {
      console.error('Error loading incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `${CONFIG.development.ADMIN_BASE_URL}/admin-assessment/v1/incidents/statistics`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStatistics(response.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  // 🌟 NEW: Fetch History
  const loadIncidentHistory = async (incidentId) => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem('token');
      // Fetching up to 50 history records for the timeline
      const url = `${CONFIG.development.ADMIN_BASE_URL}/admin-assessment/v1/incidents/${incidentId}/history?page=0&size=50`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Spring Boot Pageable returns data in the 'content' array
      setIncidentHistory(response.data.content || []); 
    } catch (error) {
      console.error('Error loading incident history:', error);
      setIncidentHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleViewDetails = (incident) => {
    setSelectedIncident(incident);
    setUpdateData({
      status: incident.status,
      priority: incident.priority,
      category: incident.category,
      assignedToUsername: incident.assignedToUsername || '',
      resolutionNotes: '' // Clear this field so they can type a new comment
    });
    setShowDetailsModal(true);
    loadIncidentHistory(incident.incidentId); // 🌟 Fetch history on open
  };

  const handleUpdateIncident = async () => {
    if (!selectedIncident) return;

    try {
      const token = localStorage.getItem('token');
      const url = `${CONFIG.development.ADMIN_BASE_URL}/admin-assessment/v1/incidents/${selectedIncident.incidentId}`;
      
      const statusChanged = updateData.status !== selectedIncident.status;

      await axios.put(url, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statusChanged && selectedIncident.reportedByEmail) {
          alert(`Incident updated! An email notification has been sent to ${selectedIncident.reportedByEmail}.`);
      } else {
          alert('Incident updated successfully!');
      }

      // Update UI seamlessly
      setUpdateData(prev => ({ ...prev, resolutionNotes: '' })); // Clear input
      loadIncidents();
      loadStatistics();
      loadIncidentHistory(selectedIncident.incidentId); // Refresh history log

      // Update the local selected object so status check works
      setSelectedIncident(prev => ({...prev, status: updateData.status}));

    } catch (error) {
      console.error('Error updating incident:', error);
      alert('Failed to update incident');
    }
  };

  const handleCloseIncident = async () => {
    if (!selectedIncident) return;
    if (!window.confirm('Are you sure you want to close this incident? This will email the user.')) return;

    try {
      const token = localStorage.getItem('token');
      const url = `${CONFIG.development.ADMIN_BASE_URL}/admin-assessment/v1/incidents/${selectedIncident.incidentId}/close`;

      await axios.post(url, { resolutionNotes: updateData.resolutionNotes }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert('Incident closed! The user has been notified.');
      setShowDetailsModal(false);
      loadIncidents();
      loadStatistics();
    } catch (error) {
      console.error('Error closing incident:', error);
      alert('Failed to close incident');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return '#3b82f6';
      case 'IN_PROGRESS': return '#f59e0b';
      case 'RESOLVED': return '#10b981';
      case 'CLOSED': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const isStatusChanged = selectedIncident && updateData.status !== selectedIncident.status;

  return (
    <div className="incident-management-container">
      {/* Statistics Cards */}
      {statistics && (
        <div className="incident-stats-grid">
          <div className="incident-stat-card total">
            <div className="stat-icon">🎫</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.totalIncidents}</div>
              <div className="stat-label">Total Incidents</div>
            </div>
          </div>
          <div className="incident-stat-card open">
            <div className="stat-icon">🆕</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.openIncidents}</div>
              <div className="stat-label">Open</div>
            </div>
          </div>
          <div className="incident-stat-card progress">
            <div className="stat-icon">⚙️</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.inProgressIncidents}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
          <div className="incident-stat-card resolved">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.resolvedIncidents}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
          <div className="incident-stat-card closed">
            <div className="stat-icon">🔒</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.closedIncidents}</div>
              <div className="stat-label">Closed</div>
            </div>
          </div>
          <div className="incident-stat-card recent">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.recentIncidents}</div>
              <div className="stat-label">Last 7 Days</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="incident-filters">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
          <button
            key={status}
            className={`filter-tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Incidents Table */}
      <div className="incidents-table-wrapper">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading incidents...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Incidents Found</h3>
            <p>There are no incidents matching your filter criteria.</p>
          </div>
        ) : (
          <table className="incidents-table">
            <thead>
              <tr>
                <th>Incident ID</th>
                <th>Title</th>
                <th>Reported By</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Category</th>
                <th>Reported At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(incident => (
                <tr key={incident.id}>
                  <td className="incident-id">{incident.incidentId}</td>
                  <td className="incident-title">{incident.title}</td>
                  <td>
                    <div className="user-cell">
                      <div className="user-name">{incident.reportedByUsername}</div>
                      <div className="user-email">{incident.reportedByEmail}</div>
                    </div>
                  </td>
                  <td>
                    <span
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(incident.priority) }}
                    >
                      {incident.priority}
                    </span>
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(incident.status) }}
                    >
                      {incident.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="category-cell">{incident.category.replace('_', ' ')}</td>
                  <td className="date-cell">
                    {new Date(incident.reportedAt).toLocaleString()}
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => handleViewDetails(incident)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedIncident && (
        <div className="incident-modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="incident-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div className="modal-header" style={{ flexShrink: 0 }}>
              <h2>Incident Details</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', gap: '20px', overflowY: 'auto' }}>
              
              {/* Left Column: Form & Info */}
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="info-section">
                  <h3>📋 Incident Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Incident ID:</label>
                      <span>{selectedIncident.incidentId}</span>
                    </div>
                    <div className="info-item">
                      <label>Reported At:</label>
                      <span>{new Date(selectedIncident.reportedAt).toLocaleString()}</span>
                    </div>
                    <div className="info-item full-width">
                      <label>Title:</label>
                      <span>{selectedIncident.title}</span>
                    </div>
                    <div className="info-item full-width">
                      <label>Description:</label>
                      <p className="description-text">{selectedIncident.description}</p>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>👤 Reported By</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Username:</label>
                      <span>{selectedIncident.reportedByUsername}</span>
                    </div>
                    <div className="info-item">
                      <label>Email:</label>
                      <span>{selectedIncident.reportedByEmail}</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>✏️ Update Incident</h3>
                  <div className="update-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Status:</label>
                        <select
                          value={updateData.status}
                          onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                          style={{ border: isStatusChanged ? '2px solid #3b82f6' : '' }}
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Priority:</label>
                        <select
                          value={updateData.priority}
                          onChange={(e) => setUpdateData({...updateData, priority: e.target.value})}
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Category:</label>
                        <select
                          value={updateData.category}
                          onChange={(e) => setUpdateData({...updateData, category: e.target.value})}
                        >
                          <option value="BUG">Bug</option>
                          <option value="FEATURE_REQUEST">Feature Request</option>
                          <option value="UI_ISSUE">UI Issue</option>
                          <option value="PERFORMANCE">Performance</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Assigned To:</label>
                        <input
                          type="text"
                          value={updateData.assignedToUsername}
                          onChange={(e) => setUpdateData({...updateData, assignedToUsername: e.target.value})}
                          placeholder="Enter username"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>New Comment / Resolution Notes (Visible to user):</label>
                      <textarea
                        value={updateData.resolutionNotes}
                        onChange={(e) => setUpdateData({...updateData, resolutionNotes: e.target.value})}
                        placeholder="Type a new comment to add to the history..."
                        rows={3}
                      />
                    </div>

                    {isStatusChanged && selectedIncident.reportedByEmail && (
                      <div style={{ padding: '10px', backgroundColor: '#eff6ff', color: '#1e3a8a', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', border: '1px solid #bfdbfe' }}>
                        ℹ️ <strong>Note:</strong> Changing status to <strong>{updateData.status.replace('_', ' ')}</strong> will email {selectedIncident.reportedByEmail}.
                      </div>
                    )}

                    <div className="modal-actions" style={{ marginTop: '10px' }}>
                      <button className="btn-update" onClick={handleUpdateIncident}>
                        Save Update
                      </button>
                      {selectedIncident.status !== 'CLOSED' && (
                        <button className="btn-close-incident" onClick={handleCloseIncident}>
                          Close Incident
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 🌟 NEW: Right Column: History Timeline */}
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                <div className="info-section" style={{ flex: '1', margin: 0, backgroundColor: '#f8fafc', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginTop: 0 }}>🕒 History & Comments</h3>
                  
                  <div style={{ overflowY: 'auto', paddingRight: '10px', flex: '1' }}>
                    {loadingHistory ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Loading history...</div>
                    ) : incidentHistory.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No history recorded yet.</div>
                    ) : (
                      <div style={{ borderLeft: '2px solid #e2e8f0', marginLeft: '10px', marginTop: '15px' }}>
                        {incidentHistory.map((entry, index) => (
                          <div key={entry.id || index} style={{ position: 'relative', paddingLeft: '20px', paddingBottom: '20px' }}>
                            {/* Timeline Dot */}
                            <div style={{ position: 'absolute', left: '-6px', top: '0', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: getStatusColor(entry.status), border: '2px solid white' }} />
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                                {new Date(entry.updatedAt).toLocaleString()}
                              </span>
                              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', color: 'white', backgroundColor: getStatusColor(entry.status), fontWeight: 'bold' }}>
                                {entry.status}
                              </span>
                            </div>
                            
                            <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '8px' }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                                👤 {entry.updatedBy || 'System Admin'}
                              </div>
                              {entry.comment ? (
                                <div style={{ fontSize: '0.9rem', color: '#475569', whiteSpace: 'pre-wrap' }}>
                                  {entry.comment}
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                  Status updated
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}