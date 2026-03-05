import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import CONFIG from '../Config';
import './ErrorReportButton.css';

export default function ErrorReportButton() {
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [errorDescription, setErrorDescription] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // Function to get user's IP address
  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Failed to fetch IP:', error);
      return 'Unknown';
    }
  };

  // Function to get browser and device details
  const getBrowserDetails = () => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const windowSize = `${window.innerWidth}x${window.innerHeight}`;

    // Detect browser
    let browser = 'Unknown';
    if (userAgent.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (userAgent.indexOf('Safari') > -1) browser = 'Safari';
    else if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (userAgent.indexOf('Edge') > -1) browser = 'Edge';
    else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) browser = 'Internet Explorer';

    return {
      browser,
      platform,
      language,
      screenResolution,
      windowSize,
      userAgent
    };
  };

  const handleSendReport = async () => {
    if (!errorDescription.trim()) {
      alert('Please describe the error before sending.');
      return;
    }

    setIsSending(true);
    setShowError(false);

    try {
      // Collect all relevant information
      const userIP = await getUserIP();
      const browserDetails = getBrowserDetails();
      const currentPath = location.pathname;
      const currentUrl = window.location.href;

      // Build additional context JSON
      const additionalContext = JSON.stringify({
        onlineStatus: navigator.onLine ? 'Online' : 'Offline',
        cookieEnabled: navigator.cookieEnabled ? 'Yes' : 'No',
        doNotTrack: navigator.doNotTrack || 'Not Set',
        localStorageKeys: Object.keys(localStorage),
        sessionStorageKeys: Object.keys(sessionStorage),
        windowSize: browserDetails.windowSize
      });

      // Prepare incident request
      const incidentRequest = {
        title: `Error on ${currentPath}`,
        description: errorDescription,
        reportedBy: user?.id || 'guest',
        reportedByUsername: user?.username || 'Guest',
        reportedByEmail: user?.email || 'Not Available',
        reportedByRole: user?.role || 'GUEST',
        pageUrl: currentUrl,
        pagePath: currentPath,
        referrerUrl: document.referrer || 'Direct Access',
        userIpAddress: userIP,
        browser: browserDetails.browser,
        platform: browserDetails.platform,
        userAgent: browserDetails.userAgent,
        screenResolution: browserDetails.screenResolution,
        language: browserDetails.language,
        priority: 'MEDIUM',
        category: 'OTHER',
        additionalContext: additionalContext
      };

      // Send to incident API (which will also trigger email)
      const incidentURL = `${CONFIG.development.ADMIN_BASE_URL}/admin-assessment/v1/incidents/create`;
      await axios.post(incidentURL, incidentRequest, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      // Show success message
      setShowSuccess(true);
      setErrorDescription('');
      setIsOpen(false);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Failed to send error report:', error);
      setShowError(true);

      // Hide error message after 3 seconds
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="error-report-float-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Report an Error"
      >
        🐛
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="error-report-overlay" onClick={() => setIsOpen(false)}>
          <div className="error-report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="error-report-header">
              <h3>Report an Error 🐛</h3>
              <button className="error-report-close" onClick={() => setIsOpen(false)}>×</button>
            </div>

            <div className="error-report-body">
              <p className="error-report-info">
                Help us improve! Describe the issue you encountered and we'll investigate it.
              </p>

              <div className="error-report-context">
                <div className="context-item">
                  <span className="context-label">📍 Current Page:</span>
                  <span className="context-value">{location.pathname}</span>
                </div>
                <div className="context-item">
                  <span className="context-label">👤 User:</span>
                  <span className="context-value">{user?.username || 'Guest'}</span>
                </div>
                <div className="context-item">
                  <span className="context-label">🕐 Time:</span>
                  <span className="context-value">{new Date().toLocaleString()}</span>
                </div>
              </div>

              <textarea
                className="error-report-textarea"
                placeholder="Describe the error or issue you encountered..."
                value={errorDescription}
                onChange={(e) => setErrorDescription(e.target.value)}
                rows={6}
                disabled={isSending}
              />

              <button
                className="error-report-submit"
                onClick={handleSendReport}
                disabled={isSending || !errorDescription.trim()}
              >
                {isSending ? (
                  <>
                    <span className="spinner-small"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <span>📧</span>
                    Send Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="error-report-toast success">
          <span className="toast-icon">✅</span>
          <span>Error report sent successfully! Thank you for your feedback.</span>
        </div>
      )}

      {/* Error Toast */}
      {showError && (
        <div className="error-report-toast error">
          <span className="toast-icon">❌</span>
          <span>Failed to send report. Please try again later.</span>
        </div>
      )}
    </>
  );
}
