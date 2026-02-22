import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../css/RoleSwitcher.css';

const RoleSwitcher = ({ isOpen, onClose }) => {
  const { user, activeRole, getAccessibleRoles, switchRole, ROLES } = useAuth();
  const [switching, setSwitching] = useState(false);

  const accessibleRoles = getAccessibleRoles();

  // Role metadata for display
  const roleMetadata = {
    [ROLES.SUPER_ADMIN]: {
      name: 'Super Admin',
      description: 'Platform owner with all permissions',
      icon: '👑',
      color: '#7C3AED'
    },
    [ROLES.DISTRICT_ADMIN]: {
      name: 'District Admin',
      description: 'Manage multiple schools in the district',
      icon: '🏛️',
      color: '#2563EB'
    },
    [ROLES.SCHOOL_ADMIN]: {
      name: 'School Admin',
      description: 'Manage your school and staff',
      icon: '🏫',
      color: '#0891B2'
    },
    [ROLES.TEACHER]: {
      name: 'Teacher',
      description: 'Manage classroom and students',
      icon: '👩‍🏫',
      color: '#059669'
    },
    [ROLES.PARENT]: {
      name: 'Parent',
      description: 'Monitor your children\'s progress',
      icon: '👨‍👩‍👧',
      color: '#D97706'
    },
    [ROLES.STUDENT]: {
      name: 'Student',
      description: 'Access learning materials and assessments',
      icon: '🎓',
      color: '#DC2626'
    },
    [ROLES.COUNSELOR]: {
      name: 'Counselor',
      description: 'Student guidance and support',
      icon: '💼',
      color: '#7C3AED'
    },
    [ROLES.CONTENT_CREATOR]: {
      name: 'Content Creator',
      description: 'Create educational materials',
      icon: '✍️',
      color: '#EC4899'
    },
    [ROLES.LIBRARIAN]: {
      name: 'Librarian',
      description: 'Manage library resources',
      icon: '📚',
      color: '#8B5CF6'
    },
    [ROLES.OBSERVER]: {
      name: 'Observer',
      description: 'View-only access for research',
      icon: '👁️',
      color: '#6B7280'
    },
    [ROLES.SUPPORT_STAFF]: {
      name: 'Support Staff',
      description: 'Technical support and assistance',
      icon: '🛠️',
      color: '#0EA5E9'
    },
    [ROLES.AI_ASSISTANT]: {
      name: 'AI Assistant',
      description: 'Automated system user',
      icon: '🤖',
      color: '#6366F1'
    }
  };

  const handleRoleSwitch = async (newRole) => {
    if (newRole === activeRole) {
      onClose();
      return;
    }

    setSwitching(true);

    // Simulate a brief delay for smooth transition
    setTimeout(() => {
      const success = switchRole(newRole);

      if (success) {
        // Reload page to apply new role context
        window.location.reload();
      } else {
        alert('Failed to switch role. Please try again.');
        setSwitching(false);
      }
    }, 300);
  };

  if (!isOpen || !user) return null;

  return (
    <div className="role-switcher-overlay" onClick={onClose}>
      <div className="role-switcher-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="role-switcher-header">
          <h2>Switch Your View</h2>
          <p>Choose which dashboard you'd like to access</p>
        </div>

        <div className="current-role-info">
          <span className="label">Currently viewing as:</span>
          <div className="current-role">
            <span className="role-icon" style={{ backgroundColor: roleMetadata[activeRole]?.color }}>
              {roleMetadata[activeRole]?.icon}
            </span>
            <span className="role-name">{roleMetadata[activeRole]?.name}</span>
          </div>
        </div>

        <div className="roles-grid">
          {accessibleRoles.map((role) => {
            const meta = roleMetadata[role];
            const isActive = role === activeRole;
            const isPrimary = role === user.role;

            return (
              <button
                key={role}
                className={`role-card ${isActive ? 'active' : ''}`}
                onClick={() => handleRoleSwitch(role)}
                disabled={switching}
                aria-label={`Switch to ${meta.name}`}
              >
                <div
                  className="role-icon-large"
                  style={{ backgroundColor: meta.color }}
                >
                  {meta.icon}
                </div>

                <div className="role-info">
                  <div className="role-title">
                    <span className="role-name-text">{meta.name}</span>
                    {isPrimary && <span className="primary-badge">Your Role</span>}
                    {isActive && <span className="active-badge">Active</span>}
                  </div>
                  <p className="role-description">{meta.description}</p>
                </div>

                {!isActive && (
                  <div className="switch-arrow">
                    →
                  </div>
                )}

                {isActive && (
                  <div className="checkmark">
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {switching && (
          <div className="switching-overlay">
            <div className="spinner"></div>
            <p>Switching dashboard...</p>
          </div>
        )}

        <div className="role-switcher-footer">
          <p className="info-text">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            You can switch between different views based on your role permissions
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSwitcher;
