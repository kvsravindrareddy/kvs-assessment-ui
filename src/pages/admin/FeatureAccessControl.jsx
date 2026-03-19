import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CONFIG from '../../Config';
import './FeatureAccessControl.css';

/**
 * Feature Access Control Panel
 *
 * Allows admins to control which features are accessible to which users
 * Perfect for product launch strategy:
 * - Open features to guests initially to attract users
 * - Gradually restrict to registered/paid users
 * - Grant temporary PRO access to specific users
 * - Monitor feature usage analytics
 */
export default function FeatureAccessControl() {
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [filter, setFilter] = useState('ALL'); // ALL, ENABLED, DISABLED, LAUNCH_MODE
    const [searchTerm, setSearchTerm] = useState('');

    // User elevation modal
    const [showElevationModal, setShowElevationModal] = useState(false);
    const [elevationUserId, setElevationUserId] = useState('');
    const [elevationDays, setElevationDays] = useState(30);

    useEffect(() => {
        fetchFeatures();
    }, []);

    const fetchFeatures = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${CONFIG.development.AUTH_SERVICE_URL}/api/admin/feature-access/rules`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setFeatures(response.data);
        } catch (error) {
            console.error('Error fetching features:', error);
            alert('Failed to load features');
        } finally {
            setLoading(false);
        }
    };

    const updateFeature = async (featureId, updates) => {
        try {
            const token = localStorage.getItem('token');
            const adminId = localStorage.getItem('userId');
            const response = await axios.put(
                `${CONFIG.development.AUTH_SERVICE_URL}/api/admin/feature-access/rules/${featureId}`,
                updates,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'X-Admin-User-Id': adminId
                    }
                }
            );
            await fetchFeatures();
            return response.data;
        } catch (error) {
            console.error('Error updating feature:', error);
            alert('Failed to update feature');
        }
    };

    const toggleFeature = async (featureId, currentState) => {
        const confirmed = window.confirm(
            `Are you sure you want to ${currentState ? 'disable' : 'enable'} this feature?`
        );
        if (!confirmed) return;

        const feature = features.find(f => f.id === featureId);
        if (feature) {
            await updateFeature(featureId, { ...feature, isEnabled: !currentState });
        }
    };

    // NEW: Quick toggle for Guest Access
    const handleGuestToggle = async (feature) => {
        const isCurrentlyGuestAllowed = feature.allowedAccessModes === 'ALL' || feature.allowedAccessModes === 'GUEST';
        const newAccessMode = isCurrentlyGuestAllowed ? 'REGISTERED' : 'ALL';
        
        await updateFeature(feature.id, {
            ...feature,
            allowedAccessModes: newAccessMode
        });
    };

    const toggleLaunchMode = async (featureId, currentState, durationDays = null) => {
        try {
            const token = localStorage.getItem('token');
            const adminId = localStorage.getItem('userId');

            if (!currentState) {
                // Enable launch mode
                const days = durationDays || prompt('Enter launch mode duration (days), or leave empty for perpetual:');
                const url = days
                    ? `${CONFIG.development.AUTH_SERVICE_URL}/api/admin/feature-access/rules/${featureId}/launch-mode?durationDays=${days}`
                    : `${CONFIG.development.AUTH_SERVICE_URL}/api/admin/feature-access/rules/${featureId}/launch-mode`;

                await axios.post(url, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'X-Admin-User-Id': adminId
                    }
                });
            } else {
                // Disable launch mode
                await axios.delete(
                    `${CONFIG.development.AUTH_SERVICE_URL}/api/admin/feature-access/rules/${featureId}/launch-mode`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'X-Admin-User-Id': adminId
                        }
                    }
                );
            }

            await fetchFeatures();
        } catch (error) {
            console.error('Error toggling launch mode:', error);
            alert('Failed to toggle launch mode');
        }
    };

    const grantElevatedAccess = async () => {
        try {
            const token = localStorage.getItem('token');
            const adminId = localStorage.getItem('userId');

            await axios.post(
                `${CONFIG.development.AUTH_SERVICE_URL}/api/admin/feature-access/users/${elevationUserId}/elevate?durationDays=${elevationDays}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'X-Admin-User-Id': adminId
                    }
                }
            );

            alert(`Successfully granted PRO access to user ${elevationUserId} for ${elevationDays} days`);
            setShowElevationModal(false);
            setElevationUserId('');
            setElevationDays(30);
        } catch (error) {
            console.error('Error granting elevated access:', error);
            alert('Failed to grant elevated access');
        }
    };

    const filteredFeatures = features.filter(f => {
        // Apply filter
        if (filter === 'ENABLED' && !f.isEnabled) return false;
        if (filter === 'DISABLED' && f.isEnabled) return false;
        if (filter === 'LAUNCH_MODE' && !f.launchModeEnabled) return false;

        // Apply search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (
                f.featureName.toLowerCase().includes(term) ||
                f.featureCode.toLowerCase().includes(term) ||
                f.description?.toLowerCase().includes(term)
            );
        }

        return true;
    });

    const categoryColors = {
        ASSESSMENT: '#3b82f6',
        LEARNING: '#10b981',
        TEACHER: '#f59e0b',
        PARENT: '#ec4899',
        ADMIN: '#8b5cf6',
        STUDENT: '#06b6d4'
    };

    if (loading) {
        return (
            <div className="fac-loading">
                <div className="spinner"></div>
                <p>Loading features...</p>
            </div>
        );
    }

    return (
        <div className="feature-access-control">
            <div className="fac-header">
                <div className="fac-header-content">
                    <h1>🎛️ Feature Access Control</h1>
                    <p>Control which features are accessible to which users during product launch</p>
                </div>

                <button
                    className="fac-btn fac-btn-primary"
                    onClick={() => setShowElevationModal(true)}>
                    ⭐ Grant User PRO Access
                </button>
            </div>

            {/* Filters and Search */}
            <div className="fac-controls">
                <div className="fac-filters">
                    {['ALL', 'ENABLED', 'DISABLED', 'LAUNCH_MODE'].map(f => (
                        <button
                            key={f}
                            className={`fac-filter-btn ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}>
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div className="fac-search">
                    <input
                        type="text"
                        placeholder="Search features..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="fac-search-input"
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="fac-summary">
                <div className="fac-summary-card">
                    <div className="fac-summary-icon">📊</div>
                    <div className="fac-summary-content">
                        <div className="fac-summary-value">{features.length}</div>
                        <div className="fac-summary-label">Total Features</div>
                    </div>
                </div>
                <div className="fac-summary-card">
                    <div className="fac-summary-icon">✅</div>
                    <div className="fac-summary-content">
                        <div className="fac-summary-value">{features.filter(f => f.isEnabled).length}</div>
                        <div className="fac-summary-label">Enabled</div>
                    </div>
                </div>
                <div className="fac-summary-card">
                    <div className="fac-summary-icon">🚀</div>
                    <div className="fac-summary-content">
                        <div className="fac-summary-value">{features.filter(f => f.launchModeEnabled).length}</div>
                        <div className="fac-summary-label">Launch Mode</div>
                    </div>
                </div>
                <div className="fac-summary-card">
                    <div className="fac-summary-icon">💎</div>
                    <div className="fac-summary-content">
                        <div className="fac-summary-value">{features.filter(f => f.isPremiumFeature).length}</div>
                        <div className="fac-summary-label">Premium</div>
                    </div>
                </div>
            </div>

            {/* Features Table */}
            <div className="fac-table-container">
                <table className="fac-table">
                    <thead>
                        <tr>
                            <th>Feature</th>
                            <th>Category</th>
                            <th>Global Status</th>
                            <th>Guest Access</th>
                            <th>Tiers</th>
                            <th>Roles</th>
                            <th>Launch Mode</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFeatures.map(feature => {
                            const isGuestAllowed = feature.allowedAccessModes === 'ALL' || feature.allowedAccessModes === 'GUEST';
                            
                            return (
                            <tr key={feature.id} className={!feature.isEnabled ? 'fac-disabled' : ''}>
                                <td>
                                    <div className="fac-feature-cell">
                                        <div className="fac-feature-name">{feature.featureName}</div>
                                        <div className="fac-feature-code">{feature.featureCode}</div>
                                    </div>
                                </td>
                                <td>
                                    <span
                                        className="fac-category-badge"
                                        style={{ backgroundColor: categoryColors[feature.featureCategory] || '#gray' }}>
                                        {feature.featureCategory}
                                    </span>
                                </td>
                                <td>
                                    <div className="fac-toggle-cell">
                                        <label className="fac-switch">
                                            <input
                                                type="checkbox"
                                                checked={feature.isEnabled}
                                                onChange={() => toggleFeature(feature.id, feature.isEnabled)}
                                            />
                                            <span className="fac-switch-slider"></span>
                                        </label>
                                        <span className={`fac-status ${feature.isEnabled ? 'active' : 'inactive'}`}>
                                            {feature.isEnabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    {/* NEW: Guest Access Toggle */}
                                    <div className="fac-toggle-cell">
                                        <label className="fac-switch">
                                            <input
                                                type="checkbox"
                                                checked={isGuestAllowed}
                                                onChange={() => handleGuestToggle(feature)}
                                                disabled={!feature.isEnabled}
                                            />
                                            <span className="fac-switch-slider"></span>
                                        </label>
                                        <span className={`fac-status ${isGuestAllowed ? 'active' : 'inactive'}`}>
                                            {isGuestAllowed ? 'Guests Allowed' : 'Login Required'}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <span className="fac-tiers">{feature.allowedTiers}</span>
                                </td>
                                <td>
                                    <div className="fac-roles">{feature.allowedRoles}</div>
                                </td>
                                <td>
                                    <div className="fac-launch-mode">
                                        {feature.launchModeEnabled ? (
                                            <span className="fac-launch-active">
                                                🚀 Active
                                                {feature.launchModeExpiry && (
                                                    <span className="fac-launch-expiry">
                                                        Until {new Date(feature.launchModeExpiry).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </span>
                                        ) : (
                                            <span className="fac-launch-inactive">Inactive</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="fac-actions">
                                        <button
                                            className="fac-action-btn"
                                            onClick={() => setSelectedFeature(feature)}>
                                            Edit
                                        </button>
                                        <button
                                            className={`fac-action-btn ${feature.launchModeEnabled ? 'danger' : 'success'}`}
                                            onClick={() => toggleLaunchMode(feature.id, feature.launchModeEnabled)}>
                                            {feature.launchModeEnabled ? 'Stop Launch' : 'Start Launch'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>

            {/* Edit Feature Modal */}
            {selectedFeature && (
                <div className="fac-modal-overlay" onClick={() => setSelectedFeature(null)}>
                    <div className="fac-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="fac-modal-header">
                            <h2>Edit Feature: {selectedFeature.featureName}</h2>
                            <button className="fac-modal-close" onClick={() => setSelectedFeature(null)}>×</button>
                        </div>
                        <div className="fac-modal-body">
                            <div className="fac-form-group">
                                <label>Feature Code</label>
                                <input type="text" value={selectedFeature.featureCode} disabled />
                            </div>
                            <div className="fac-form-group">
                                <label>Feature Name</label>
                                <input
                                    type="text"
                                    value={selectedFeature.featureName}
                                    onChange={(e) => setSelectedFeature({ ...selectedFeature, featureName: e.target.value })}
                                />
                            </div>
                            <div className="fac-form-group">
                                <label>Description</label>
                                <textarea
                                    value={selectedFeature.description || ''}
                                    onChange={(e) => setSelectedFeature({ ...selectedFeature, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="fac-form-row">
                                <div className="fac-form-group">
                                    <label>Allowed Tiers (comma-separated or ALL)</label>
                                    <input
                                        type="text"
                                        value={selectedFeature.allowedTiers}
                                        onChange={(e) => setSelectedFeature({ ...selectedFeature, allowedTiers: e.target.value })}
                                        placeholder="FREE,PRO,PREMIUM or ALL"
                                    />
                                </div>
                                <div className="fac-form-group">
                                    <label>Allowed Roles (comma-separated or ALL)</label>
                                    <input
                                        type="text"
                                        value={selectedFeature.allowedRoles}
                                        onChange={(e) => setSelectedFeature({ ...selectedFeature, allowedRoles: e.target.value })}
                                        placeholder="STUDENT,TEACHER or ALL"
                                    />
                                </div>
                            </div>
                            <div className="fac-form-group">
                                <label>Access Mode</label>
                                <select
                                    value={selectedFeature.allowedAccessModes}
                                    onChange={(e) => setSelectedFeature({ ...selectedFeature, allowedAccessModes: e.target.value })}>
                                    <option value="GUEST">Guest (No Login Required)</option>
                                    <option value="REGISTERED">Registered (Login Required)</option>
                                    <option value="ALL">All (Guest + Registered)</option>
                                </select>
                            </div>
                            <div className="fac-form-group">
                                <label className="fac-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedFeature.isPremiumFeature}
                                        onChange={(e) => setSelectedFeature({ ...selectedFeature, isPremiumFeature: e.target.checked })}
                                    />
                                    <span>Premium Feature</span>
                                </label>
                            </div>
                        </div>
                        <div className="fac-modal-footer">
                            <button className="fac-btn fac-btn-secondary" onClick={() => setSelectedFeature(null)}>
                                Cancel
                            </button>
                            <button
                                className="fac-btn fac-btn-primary"
                                onClick={async () => {
                                    await updateFeature(selectedFeature.id, selectedFeature);
                                    setSelectedFeature(null);
                                }}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Elevation Modal */}
            {showElevationModal && (
                <div className="fac-modal-overlay" onClick={() => setShowElevationModal(false)}>
                    <div className="fac-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="fac-modal-header">
                            <h2>⭐ Grant PRO Access to User</h2>
                            <button className="fac-modal-close" onClick={() => setShowElevationModal(false)}>×</button>
                        </div>
                        <div className="fac-modal-body">
                            <p className="fac-modal-description">
                                Grant temporary PRO tier access to a FREE tier user. Perfect for:
                                • Rewarding loyal users
                                • Testing features with specific users
                                • Promotional campaigns
                            </p>
                            <div className="fac-form-group">
                                <label>User ID</label>
                                <input
                                    type="number"
                                    value={elevationUserId}
                                    onChange={(e) => setElevationUserId(e.target.value)}
                                    placeholder="Enter user ID"
                                />
                            </div>
                            <div className="fac-form-group">
                                <label>Duration (Days)</label>
                                <input
                                    type="number"
                                    value={elevationDays}
                                    onChange={(e) => setElevationDays(parseInt(e.target.value))}
                                    min={1}
                                    max={365}
                                />
                            </div>
                        </div>
                        <div className="fac-modal-footer">
                            <button className="fac-btn fac-btn-secondary" onClick={() => setShowElevationModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="fac-btn fac-btn-primary"
                                onClick={grantElevatedAccess}
                                disabled={!elevationUserId}>
                                Grant Access
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}