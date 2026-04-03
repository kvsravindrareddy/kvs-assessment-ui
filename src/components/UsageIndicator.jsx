import React from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import './UsageIndicator.css';

const UsageIndicator = ({ type = 'assessment', showInHeader = false }) => {
  const { getRemainingUsage, getLimits, subscriptionTier, SUBSCRIPTION_TIERS } = useSubscription();

  if (type === 'game') return null;

  // Safely handle the pluralization of 'story' to 'stories' to prevent NaN
  const pluralType = type === 'story' ? 'stories' : type + 's';

  const remaining = getRemainingUsage(type);
  const limits = getLimits();
  
  // Safely pull the limits using the correct grammar
  const limit = limits[`${pluralType}PerDay`] || limits[`${pluralType}Total`];

  // Don't show for unlimited tiers or if the limit wasn't found
  if (limit === -1 || limit === undefined) return null;

  // Don't show if user has paid tier (except for tracking)
  if (subscriptionTier !== SUBSCRIPTION_TIERS.GUEST &&
      subscriptionTier !== SUBSCRIPTION_TIERS.STUDENT_FREE &&
      subscriptionTier !== SUBSCRIPTION_TIERS.TEACHER_FREE) {
    return null;
  }

  const icons = {
    assessment: '📝',
    story: '📖',
    game: '🎮',
    ai: '🤖'
  };

  const percentage = limit > 0 ? (remaining / limit) * 100 : 0;
  const isLow = percentage <= 33;
  const isCritical = percentage <= 10;

  // Only render if it is explicitly asked to be shown in the Top Header Navbar
  if (showInHeader) {
    return (
      <div className={`usage-header-badge ${isCritical ? 'critical' : isLow ? 'low' : ''}`}>
        <span className="usage-icon">{icons[type]}</span>
        <span className="usage-text">{remaining}/{limit}</span>
      </div>
    );
  }

  // 🚀 The progress bar and "x of y remaining" text have been completely removed.
  // We now return nothing for the standard body placement.
  return null;
};

export default React.memo(UsageIndicator);