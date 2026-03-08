import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CONFIG from '../../Config';
import './FlashMessageManager.css';

export default function FlashMessageManager() {
    const [messages, setMessages] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        message: '',
        type: 'INFO',
        active: true,
        targetRole: 'ALL',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${CONFIG.development.GATEWAY_URL}/v1/flash-messages/admin/all`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            alert('Failed to fetch messages');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
            };

            if (editingId) {
                await axios.put(
                    `${CONFIG.development.GATEWAY_URL}/v1/flash-messages/admin/${editingId}`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    `${CONFIG.development.GATEWAY_URL}/v1/flash-messages/admin`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            resetForm();
            fetchMessages();
        } catch (error) {
            console.error('Error saving message:', error);
            alert('Failed to save message');
        }
    };

    const handleEdit = (msg) => {
        setEditingId(msg.id);
        setFormData({
            message: msg.message,
            type: msg.type,
            active: msg.active,
            targetRole: msg.targetRole,
            startDate: msg.startDate ? msg.startDate.substring(0, 16) : '',
            endDate: msg.endDate ? msg.endDate.substring(0, 16) : ''
        });
        setShowForm(true);
    };

    const handleToggle = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${CONFIG.development.GATEWAY_URL}/v1/flash-messages/admin/${id}/toggle`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchMessages();
        } catch (error) {
            console.error('Error toggling message:', error);
            alert('Failed to toggle message');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${CONFIG.development.GATEWAY_URL}/v1/flash-messages/admin/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchMessages();
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Failed to delete message');
        }
    };

    const resetForm = () => {
        setFormData({
            message: '',
            type: 'INFO',
            active: true,
            targetRole: 'ALL',
            startDate: '',
            endDate: ''
        });
        setEditingId(null);
        setShowForm(false);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'INFO': return 'ℹ️';
            case 'SUCCESS': return '✅';
            case 'WARNING': return '⚠️';
            case 'ERROR': return '❌';
            case 'ANNOUNCEMENT': return '📢';
            default: return 'ℹ️';
        }
    };

    return (
        <div className="flash-manager-container">
            <div className="flash-manager-header">
                <h1>📢 Flash Messages Manager</h1>
                <button className="btn-new-message" onClick={() => setShowForm(!showForm)}>
                    {showForm ? '✕ Cancel' : '➕ New Message'}
                </button>
            </div>

            {showForm && (
                <div className="flash-form-card">
                    <h2>{editingId ? 'Edit Message' : 'Create New Message'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group full-width">
                                <label>Message *</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Enter your message here..."
                                    required
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="INFO">ℹ️ Info</option>
                                    <option value="SUCCESS">✅ Success</option>
                                    <option value="WARNING">⚠️ Warning</option>
                                    <option value="ERROR">❌ Error</option>
                                    <option value="ANNOUNCEMENT">📢 Announcement</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Target Role</label>
                                <select
                                    value={formData.targetRole}
                                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                                >
                                    <option value="ALL">All Users</option>
                                    <option value="STUDENT">Students</option>
                                    <option value="TEACHER">Teachers</option>
                                    <option value="ADMIN">Admins</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Date (Optional)</label>
                                <input
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>End Date (Optional)</label>
                                <input
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    />
                                    Active
                                </label>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={resetForm}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-save">
                                {editingId ? 'Update Message' : 'Create Message'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="messages-list">
                <h2>All Flash Messages ({messages.length})</h2>
                {messages.length === 0 ? (
                    <div className="no-messages">
                        <p>📭 No flash messages yet</p>
                        <small>Create your first message to display notifications to users</small>
                    </div>
                ) : (
                    <div className="messages-grid">
                        {messages.map(msg => (
                            <div key={msg.id} className={`message-card ${msg.active ? '' : 'inactive'}`}>
                                <div className="message-header">
                                    <span className="message-type-badge" data-type={msg.type.toLowerCase()}>
                                        {getTypeIcon(msg.type)} {msg.type}
                                    </span>
                                    <span className={`status-badge ${msg.active ? 'active' : 'inactive'}`}>
                                        {msg.active ? '✅ Active' : '⏸️ Inactive'}
                                    </span>
                                </div>

                                <div className="message-content">
                                    <p>{msg.message}</p>
                                </div>

                                <div className="message-meta">
                                    <span className="meta-item">👥 {msg.targetRole}</span>
                                    {msg.startDate && (
                                        <span className="meta-item">📅 {new Date(msg.startDate).toLocaleDateString()}</span>
                                    )}
                                </div>

                                <div className="message-actions">
                                    <button className="btn-action edit" onClick={() => handleEdit(msg)}>
                                        ✏️ Edit
                                    </button>
                                    <button className="btn-action toggle" onClick={() => handleToggle(msg.id)}>
                                        {msg.active ? '⏸️ Deactivate' : '▶️ Activate'}
                                    </button>
                                    <button className="btn-action delete" onClick={() => handleDelete(msg.id)}>
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
