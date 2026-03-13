import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import CONFIG from '../../Config';
import "../../css/LegalPages.css";

const IdeaHub = () => {
  const { user } = useAuth();
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDescription, setIdeaDescription] = useState('');
  const [ideaCategory, setIdeaCategory] = useState('FEATURE');
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
      userAgent
    };
  };

  const handleSubmitIdea = async () => {
    if (!ideaTitle.trim() || !ideaDescription.trim()) {
      alert('Please provide both title and description for your idea.');
      return;
    }

    setIsSending(true);
    setShowError(false);

    try {
      const userIP = await getUserIP();
      const browserDetails = getBrowserDetails();

      const additionalContext = JSON.stringify({
        ideaCategory: ideaCategory,
        submittedFrom: 'Idea Hub Page',
        onlineStatus: navigator.onLine ? 'Online' : 'Offline',
        submissionTimestamp: new Date().toISOString()
      });

      const ideaRequest = {
        title: `IDEA: ${ideaTitle}`,
        description: `
📊 CATEGORY: ${ideaCategory}

💡 INNOVATION DESCRIPTION:
${ideaDescription}

🌟 SUBMITTED BY: ${user?.username || 'Guest Student'}
📧 EMAIL: ${user?.email || 'Not Available'}
👤 ROLE: ${user?.role || 'STUDENT'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 RECOGNITION NOTE:
This idea has been submitted for review. The best and most innovative ideas will be recognized and potentially implemented in future releases. Contributors of selected ideas will receive special recognition badges and rewards!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `,
        reportedBy: user?.id || 'guest',
        reportedByUsername: user?.username || 'Guest',
        reportedByEmail: user?.email || 'Not Available',
        reportedByRole: user?.role || 'STUDENT',
        pageUrl: window.location.href,
        pagePath: window.location.pathname,
        referrerUrl: document.referrer || 'Direct Access',
        userIpAddress: userIP,
        browser: browserDetails.browser,
        platform: browserDetails.platform,
        userAgent: browserDetails.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: browserDetails.language,
        priority: 'LOW',
        category: 'OTHER',
        additionalContext: additionalContext
      };

      const ideaURL = `${CONFIG.development.ADMIN_BASE_URL}/admin-assessment/v1/incidents/create`;
      await axios.post(ideaURL, ideaRequest, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      setShowSuccess(true);
      setIdeaTitle('');
      setIdeaDescription('');
      setIdeaCategory('FEATURE');

      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);

    } catch (error) {
      console.error('Failed to submit idea:', error);
      setShowError(true);

      setTimeout(() => {
        setShowError(false);
      }, 3000);
    } finally {
      setIsSending(false);
    }
  };

  const categories = [
    { value: 'FEATURE', icon: '✨', label: 'New Feature', desc: 'Suggest a completely new feature or capability' },
    { value: 'IMPROVEMENT', icon: '🚀', label: 'Improvement', desc: 'Enhance existing features or functionality' },
    { value: 'GAMIFICATION', icon: '🎮', label: 'Gamification', desc: 'Make learning more fun and engaging' },
    { value: 'UI_UX', icon: '🎨', label: 'UI/UX Design', desc: 'Visual design or user experience improvements' },
    { value: 'CONTENT', icon: '📚', label: 'Content/Learning', desc: 'New subjects, lessons, or learning materials' },
    { value: 'SOCIAL', icon: '👥', label: 'Social/Community', desc: 'Features for connecting and collaborating' },
    { value: 'AI_ML', icon: '🤖', label: 'AI/ML Integration', desc: 'Artificial intelligence and machine learning ideas' },
    { value: 'OTHER', icon: '💫', label: 'Other Innovation', desc: 'Any other creative idea' }
  ];

  const featuredIdeas = [
    { icon: '🧠', title: 'AI Study Buddy', author: 'Sarah M.', votes: 847, status: 'In Development' },
    { icon: '🎯', title: 'Adaptive Learning Paths', author: 'Alex K.', votes: 623, status: 'Under Review' },
    { icon: '🌍', title: 'Global Student Connect', author: 'Maria G.', votes: 512, status: 'Planning' },
    { icon: '🏆', title: 'Weekly Challenges', author: 'John D.', votes: 489, status: 'In Development' }
  ];

  return (
    <section id="idea-hub" className="section">
      <div className="container">
        <div className="content">
          <div className="text-section">

            {/* Hero Section */}
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
              borderRadius: '20px',
              padding: '3rem 2.5rem',
              color: 'white',
              marginBottom: '3rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1), transparent 40%), radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.1), transparent 40%)',
                pointerEvents: 'none'
              }} />

              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>💡</div>
                <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '800' }}>
                  Innovation Hub
                </h1>
                <p style={{ fontSize: '1.2rem', opacity: 0.95, maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
                  Shape the future of learning with your brilliant ideas! The best innovations get implemented and contributors earn exclusive recognition.
                </p>
              </div>
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
                <span style={{ fontSize: '2.5rem' }}>🎉</span>
                <div>
                  <strong style={{ color: '#065f46', fontSize: '1.1rem', display: 'block', marginBottom: '0.25rem' }}>
                    Innovation Received!
                  </strong>
                  <p style={{ margin: 0, color: '#047857', fontSize: '0.95rem' }}>
                    Thank you for shaping the future of learning. Your idea is under review!
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
                    Unable to submit your idea. Please check your connection and try again.
                  </p>
                </div>
              </div>
            )}

            {/* Why Submit Section */}
            <div className="privacy-section" style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '3px solid #fbbf24',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '3rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                <div style={{ fontSize: '3.5rem' }}>🏆</div>
                <div>
                  <h2 style={{ color: '#92400e', marginTop: 0, marginBottom: '1rem' }}>
                    Why Submit Your Ideas?
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>🎖️</span>
                      <span style={{ color: '#78350f', fontWeight: '600' }}>Exclusive Recognition Badges</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>💎</span>
                      <span style={{ color: '#78350f', fontWeight: '600' }}>Premium Rewards</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>🚀</span>
                      <span style={{ color: '#78350f', fontWeight: '600' }}>See Your Ideas Implemented</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>🌟</span>
                      <span style={{ color: '#78350f', fontWeight: '600' }}>Featured on Leaderboard</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submission Form */}
            <div className="privacy-section">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>🚀</span>
                Submit Your Innovation
              </h2>

              <div style={{
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}>

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
                    <span style={{ fontSize: '1.3rem' }}>🎯</span>
                    Select Category
                  </label>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1rem'
                  }}>
                    {categories.map((cat) => (
                      <div
                        key={cat.value}
                        onClick={() => setIdeaCategory(cat.value)}
                        style={{
                          padding: '1rem',
                          border: ideaCategory === cat.value ? '3px solid #6366f1' : '2px solid #e5e7eb',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          background: ideaCategory === cat.value ? '#eef2ff' : 'white',
                          transition: 'all 0.3s ease',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          if (ideaCategory !== cat.value) {
                            e.currentTarget.style.borderColor = '#6366f1';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (ideaCategory !== cat.value) {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{cat.icon}</div>
                        <div style={{
                          fontWeight: '700',
                          color: ideaCategory === cat.value ? '#4338ca' : '#1f2937',
                          marginBottom: '0.25rem'
                        }}>
                          {cat.label}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                          {cat.desc}
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
                    Idea Title
                    <span style={{ color: '#ef4444', fontSize: '1.2rem' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={ideaTitle}
                    onChange={(e) => setIdeaTitle(e.target.value)}
                    placeholder="Give your brilliant idea a catchy name..."
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
                      e.target.style.borderColor = '#6366f1';
                      e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', fontWeight: '600' }}>
                    {ideaTitle.length}/100
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
                    <span style={{ fontSize: '1.3rem' }}>💭</span>
                    Describe Your Innovation
                    <span style={{ color: '#ef4444', fontSize: '1.2rem' }}>*</span>
                  </label>
                  <textarea
                    value={ideaDescription}
                    onChange={(e) => setIdeaDescription(e.target.value)}
                    placeholder="Paint the vision! What problem does this solve? How will it revolutionize learning? What makes it unique? Be specific and creative..."
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
                      e.target.style.borderColor = '#6366f1';
                      e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', fontWeight: '600' }}>
                    {ideaDescription.length}/2000
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitIdea}
                  disabled={isSending || !ideaTitle.trim() || !ideaDescription.trim()}
                  style={{
                    width: '100%',
                    padding: '18px 32px',
                    background: isSending || !ideaTitle.trim() || !ideaDescription.trim()
                      ? '#cbd5e1'
                      : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '1.15rem',
                    fontWeight: '800',
                    cursor: isSending || !ideaTitle.trim() || !ideaDescription.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 0.3s ease',
                    boxShadow: isSending || !ideaTitle.trim() || !ideaDescription.trim()
                      ? 'none'
                      : '0 8px 24px rgba(139, 92, 246, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSending && ideaTitle.trim() && ideaDescription.trim()) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 12px 32px rgba(139, 92, 246, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = isSending || !ideaTitle.trim() || !ideaDescription.trim()
                      ? 'none'
                      : '0 8px 24px rgba(139, 92, 246, 0.4)';
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
                      <span>Transmitting Innovation...</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '1.4rem' }}>🚀</span>
                      <span>Launch My Idea</span>
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
                  Your idea will be reviewed by our innovation team. Selected ideas receive special recognition and rewards!
                </p>
              </div>
            </div>

            {/* Featured Ideas */}
            <div className="privacy-section">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>⭐</span>
                Top Community Ideas
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem'
              }}>
                {featuredIdeas.map((idea, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'white',
                      border: '2px solid #e5e7eb',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.12)';
                      e.currentTarget.style.borderColor = '#6366f1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{idea.icon}</div>
                    <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.2rem', color: '#1f2937' }}>
                      {idea.title}
                    </h3>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.75rem'
                    }}>
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        by {idea.author}
                      </span>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: '700'
                      }}>
                        {idea.status}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#6366f1',
                      fontWeight: '700'
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>👍</span>
                      <span>{idea.votes.toLocaleString()} votes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default IdeaHub;
