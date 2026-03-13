import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import CONFIG from '../../Config';
import "../../css/LegalPages.css";

const ReportBug = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [bugPriority, setBugPriority] = useState('MEDIUM');
  const [bugCategory, setBugCategory] = useState('OTHER');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'Unknown';
    }
  };

  const getBrowserDetails = () => {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    if (userAgent.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (userAgent.indexOf('Safari') > -1) browser = 'Safari';
    else if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (userAgent.indexOf('Edge') > -1) browser = 'Edge';

    return {
      browser,
      platform: navigator.platform,
      language: navigator.language,
      userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`
    };
  };

  const handleSubmitBug = async () => {
    if (!bugTitle.trim() || !bugDescription.trim()) {
      alert('Please provide both title and description for the bug report.');
      return;
    }

    setIsSending(true);
    setShowError(false);

    try {
      const userIP = await getUserIP();
      const browserDetails = getBrowserDetails();

      const additionalContext = JSON.stringify({
        bugPriority: bugPriority,
        bugCategory: bugCategory,
        submittedFrom: 'Bug Report Page',
        onlineStatus: navigator.onLine ? 'Online' : 'Offline',
        submissionTimestamp: new Date().toISOString(),
        browserInfo: browserDetails
      });

      const bugRequest = {
        title: bugTitle,
        description: bugDescription,
        reportedBy: user?.id || 'guest',
        reportedByUsername: user?.username || 'Guest',
        reportedByEmail: user?.email || 'Not Available',
        reportedByRole: user?.role || 'GUEST',
        pageUrl: window.location.href,
        pagePath: window.location.pathname,
        referrerUrl: document.referrer || 'Direct Access',
        userIpAddress: userIP,
        browser: browserDetails.browser,
        platform: browserDetails.platform,
        userAgent: browserDetails.userAgent,
        screenResolution: browserDetails.screenResolution,
        language: browserDetails.language,
        priority: bugPriority,
        category: bugCategory,
        additionalContext: additionalContext
      };

      const bugURL = `${CONFIG.development.ADMIN_BASE_URL}/admin-assessment/v1/incidents/create`;
      await axios.post(bugURL, bugRequest, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      setShowSuccess(true);
      setBugTitle('');
      setBugDescription('');
      setBugPriority('MEDIUM');
      setBugCategory('OTHER');

      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);

    } catch (error) {
      console.error('Failed to submit bug report:', error);
      setShowError(true);

      setTimeout(() => {
        setShowError(false);
      }, 3000);
    } finally {
      setIsSending(false);
    }
  };

  const priorities = [
    { value: 'LOW', label: 'Low', icon: '🔵', desc: 'Minor issues, cosmetic problems' },
    { value: 'MEDIUM', label: 'Medium', icon: '🟡', desc: 'Moderate impact on functionality' },
    { value: 'HIGH', label: 'High', icon: '🟠', desc: 'Major issues affecting usability' },
    { value: 'CRITICAL', label: 'Critical', icon: '🔴', desc: 'System down or data loss' }
  ];

  const categories = [
    { value: 'UI_UX', label: 'UI/UX Issue', icon: '🎨' },
    { value: 'FUNCTIONALITY', label: 'Functionality Bug', icon: '⚙️' },
    { value: 'PERFORMANCE', label: 'Performance', icon: '⚡' },
    { value: 'SECURITY', label: 'Security', icon: '🔒' },
    { value: 'COMPATIBILITY', label: 'Compatibility', icon: '🌐' },
    { value: 'DATA', label: 'Data Issue', icon: '📊' },
    { value: 'OTHER', label: 'Other', icon: '🐛' }
  ];

  return (
    <section id="report-bug" className="section">
      <div className="container">
        <div className="content">
          <div className="text-section">

            {/* Hero Section */}
            <div style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              borderRadius: '20px',
              padding: '3rem 2.5rem',
              color: 'white',
              marginBottom: '3rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🐛</div>
              <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '800' }}>
                Report a Bug
              </h1>
              <p style={{ fontSize: '1.2rem', opacity: 0.95, maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
                Help us improve! Report bugs and issues you encounter. We appreciate your feedback!
              </p>
            </div>

            {/* Success/Error Messages */}
            {showSuccess && (
              <div style={{
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                border: '3px solid #10b981',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <span style={{ fontSize: '2.5rem' }}>✅</span>
                <div>
                  <strong style={{ color: '#065f46', fontSize: '1.1rem', display: 'block', marginBottom: '0.25rem' }}>
                    Bug Report Submitted!
                  </strong>
                  <p style={{ margin: 0, color: '#047857', fontSize: '0.95rem' }}>
                    Thank you for helping us improve. Our team will investigate this issue.
                  </p>
                </div>
              </div>
            )}

            {showError && (
              <div style={{
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                border: '3px solid #ef4444',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <span style={{ fontSize: '2.5rem' }}>❌</span>
                <div>
                  <strong style={{ color: '#991b1b', fontSize: '1.1rem', display: 'block', marginBottom: '0.25rem' }}>
                    Submission Failed
                  </strong>
                  <p style={{ margin: 0, color: '#b91c1c', fontSize: '0.95rem' }}>
                    Unable to submit bug report. Please check your connection and try again.
                  </p>
                </div>
              </div>
            )}

            {/* Submission Form */}
            <div className="privacy-section">
              <h2>🐞 Bug Report Form</h2>

              <div style={{
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}>

                {/* Priority Selection */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '700',
                    fontSize: '1.05rem',
                    marginBottom: '1rem',
                    color: '#1f2937'
                  }}>
                    <span style={{ fontSize: '1.3rem' }}>🚨</span>
                    Priority Level
                  </label>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                  }}>
                    {priorities.map((p) => (
                      <div
                        key={p.value}
                        onClick={() => setBugPriority(p.value)}
                        style={{
                          padding: '1rem',
                          border: bugPriority === p.value ? '3px solid #ef4444' : '2px solid #e5e7eb',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          background: bugPriority === p.value ? '#fee2e2' : 'white',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (bugPriority !== p.value) {
                            e.currentTarget.style.borderColor = '#ef4444';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (bugPriority !== p.value) {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{p.icon}</div>
                        <div style={{
                          fontWeight: '700',
                          color: bugPriority === p.value ? '#991b1b' : '#1f2937',
                          marginBottom: '0.25rem'
                        }}>
                          {p.label}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                          {p.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Selection */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '700',
                    fontSize: '1.05rem',
                    marginBottom: '1rem',
                    color: '#1f2937'
                  }}>
                    <span style={{ fontSize: '1.3rem' }}>🏷️</span>
                    Bug Category
                  </label>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem'
                  }}>
                    {categories.map((cat) => (
                      <div
                        key={cat.value}
                        onClick={() => setBugCategory(cat.value)}
                        style={{
                          padding: '1rem',
                          border: bugCategory === cat.value ? '3px solid #ef4444' : '2px solid #e5e7eb',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          background: bugCategory === cat.value ? '#fee2e2' : 'white',
                          transition: 'all 0.3s ease',
                          textAlign: 'center'
                        }}
                        onMouseEnter={(e) => {
                          if (bugCategory !== cat.value) {
                            e.currentTarget.style.borderColor = '#ef4444';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (bugCategory !== cat.value) {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{cat.icon}</div>
                        <div style={{
                          fontWeight: '600',
                          color: bugCategory === cat.value ? '#991b1b' : '#1f2937',
                          fontSize: '0.9rem'
                        }}>
                          {cat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Title Input */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '700',
                    fontSize: '1.05rem',
                    marginBottom: '0.75rem',
                    color: '#1f2937'
                  }}>
                    <span style={{ fontSize: '1.3rem' }}>📝</span>
                    Bug Title
                    <span style={{ color: '#ef4444', fontSize: '1.2rem' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={bugTitle}
                    onChange={(e) => setBugTitle(e.target.value)}
                    placeholder="Brief description of the bug..."
                    maxLength={100}
                    disabled={isSending}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      border: '2px solid #cbd5e1',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ef4444';
                      e.target.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', fontWeight: '600' }}>
                    {bugTitle.length}/100
                  </div>
                </div>

                {/* Description Textarea */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '700',
                    fontSize: '1.05rem',
                    marginBottom: '0.75rem',
                    color: '#1f2937'
                  }}>
                    <span style={{ fontSize: '1.3rem' }}>📋</span>
                    Bug Description
                    <span style={{ color: '#ef4444', fontSize: '1.2rem' }}>*</span>
                  </label>
                  <textarea
                    value={bugDescription}
                    onChange={(e) => setBugDescription(e.target.value)}
                    placeholder="Describe the bug in detail. What happened? What did you expect? Steps to reproduce..."
                    rows={10}
                    maxLength={2000}
                    disabled={isSending}
                    style={{
                      width: '100%',
                      padding: '16px 18px',
                      border: '2px solid #cbd5e1',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      minHeight: '200px',
                      transition: 'all 0.3s ease',
                      lineHeight: '1.6'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ef4444';
                      e.target.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', fontWeight: '600' }}>
                    {bugDescription.length}/2000
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitBug}
                  disabled={isSending || !bugTitle.trim() || !bugDescription.trim()}
                  style={{
                    width: '100%',
                    padding: '18px 32px',
                    background: isSending || !bugTitle.trim() || !bugDescription.trim()
                      ? '#cbd5e1'
                      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '1.15rem',
                    fontWeight: '800',
                    cursor: isSending || !bugTitle.trim() || !bugDescription.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 0.3s ease',
                    boxShadow: isSending || !bugTitle.trim() || !bugDescription.trim()
                      ? 'none'
                      : '0 8px 24px rgba(239, 68, 68, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSending && bugTitle.trim() && bugDescription.trim()) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 12px 32px rgba(239, 68, 68, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = isSending || !bugTitle.trim() || !bugDescription.trim()
                      ? 'none'
                      : '0 8px 24px rgba(239, 68, 68, 0.4)';
                  }}
                >
                  {isSending ? (
                    <>
                      <div style={{
                        width: '22px',
                        height: '22px',
                        border: '3px solid rgba(255, 255, 255, 0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }} />
                      <span>Submitting Report...</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '1.4rem' }}>📧</span>
                      <span>Submit Bug Report</span>
                    </>
                  )}
                </button>

                <p style={{
                  marginTop: '1.5rem',
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  textAlign: 'center',
                  lineHeight: 1.6
                }}>
                  <span style={{ fontSize: '1.1rem', marginRight: '0.5rem' }}>ℹ️</span>
                  Your bug report will be reviewed by our team. Thank you for helping us improve!
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default ReportBug;
