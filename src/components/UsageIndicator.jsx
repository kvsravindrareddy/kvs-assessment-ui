import React from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import './UsageIndicator.css';

const UsageIndicator = ({ type = 'assessment', showInHeader = false }) => {
  const { getRemainingUsage, getLimits, subscriptionTier, SUBSCRIPTION_TIERS } = useSubscription();

  const remaining = getRemainingUsage(type);
  const limits = getLimits();
  const limit = limits[`${type}sPerDay`] || limits[`${type}sTotal`];

  // Don't show for unlimited tiers
  if (limit === -1) return null;

  // Don't show if user has paid tier (except for tracking)
  if (subscriptionTier !== SUBSCRIPTION_TIERS.GUEST &&
      subscriptionTier !== SUBSCRIPTION_TIERS.STUDENT_FREE &&
      subscriptionTier !== SUBSCRIPTION_TIERS.TEACHER_FREE) {
    return null;
  }

  const icons = {
    assessment: '📝',
    story: '📚',
    game: '🎮',
    ai: '🤖'
  };

  const labels = {
    assessment: 'Assessments',
    story: 'Stories',
    game: 'Games',
    ai: 'AI Questions'
  };

  const percentage = (remaining / limit) * 100;
  const isLow = percentage <= 33;
  const isCritical = percentage <= 10;

  if (showInHeader) {
    return (
      <div className={`usage-header-badge ${isCritical ? 'critical' : isLow ? 'low' : ''}`}>
        <span className="usage-icon">{icons[type]}</span>
        <span className="usage-text">{remaining}/{limit}</span>
      </div>
    );
  }

  return (
    <div className="usage-indicator">
      <div className="usage-indicator-header">
        <span className="usage-indicator-icon">{icons[type]}</span>
        <span className="usage-indicator-label">{labels[type]} Remaining</span>
      </div>
      <div className="usage-indicator-bar">
        <div
          className={`usage-indicator-fill ${isCritical ? 'critical' : isLow ? 'low' : 'normal'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="usage-indicator-text">
        {remaining} of {limit} remaining
        {subscriptionTier === SUBSCRIPTION_TIERS.GUEST && ' (total limit)'}
      </div>
    </div>
  );
};

export default UsageIndicator;
