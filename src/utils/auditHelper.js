import { getConfig } from '../Config';

const getGuestId = () => {
  let guestId = localStorage.getItem('kobs_guest_id');
  if (!guestId) {
    guestId = 'GUEST_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('kobs_guest_id', guestId);
  }
  return guestId;
};

export const trackUserAction = (userId, actionType, resourceId = null, metadata = {}) => {
  const trackingId = userId || getGuestId();

  const payload = {
    userId: trackingId, 
    actionType: actionType,
    resourceId: resourceId,
    metadata: {
      ...metadata,
      userAgent: navigator.userAgent,
      url: window.location.pathname
    }
  };

  const config = getConfig();
  const gatewayUrl = config.GATEWAY_URL || 'http://localhost:9000';
  const auditUrl = `${gatewayUrl}/api/v1/audit/track`;

  fetch(auditUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => console.log(`[Audit Logged] ${actionType} by ${trackingId}`))
  .catch(err => console.error('Failed to log audit:', err));
};