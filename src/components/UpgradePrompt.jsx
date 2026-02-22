import React from 'react';
import './UpgradePrompt.css';

const UpgradePrompt = ({
  message,
  feature,
  onClose,
  onUpgrade,
  showModal = false
}) => {
  if (showModal) {
    return (
      <div className="upgrade-modal-overlay">
        <div className="upgrade-modal">
          <button className="upgrade-modal-close" onClick={onClose}>✕</button>
          <div className="upgrade-modal-icon">🔒</div>
          <h2>Upgrade Required</h2>
          <p>{message}</p>
          <div className="upgrade-modal-actions">
            <button className="upgrade-btn-primary" onClick={onUpgrade}>
              ⭐ Upgrade Now
            </button>
            <button className="upgrade-btn-secondary" onClick={onClose}>
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Inline banner
  return (
    <div className="upgrade-banner">
      <div className="upgrade-banner-content">
        <span className="upgrade-icon">🔒</span>
        <span className="upgrade-message">{message}</span>
      </div>
      <button className="upgrade-banner-btn" onClick={onUpgrade}>
        Upgrade
      </button>
    </div>
  );
};

export default UpgradePrompt;
