import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import CONFIG from '../Config';
import './IdeaSubmitButton.css';

export default function IdeaSubmitButton() {
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDescription, setIdeaDescription] = useState('');
  const [ideaCategory, setIdeaCategory] = useState('FEATURE');
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
      const currentPath = location.pathname;
      const currentUrl = window.location.href;

      const additionalContext = JSON.stringify({
        ideaCategory: ideaCategory,
        submittedFrom: currentPath,
        onlineStatus: navigator.onLine ? 'Online' : 'Offline',
        submissionTimestamp: new Date().toISOString(),
        browserInfo: {
          browser: browserDetails.browser,
          platform: browserDetails.platform,
          language: browserDetails.language
        }
      });

      // Prepare idea submission request with IDEA_ prefix
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
        pageUrl: currentUrl,
        pagePath: currentPath,
        referrerUrl: document.referrer || 'Direct Access',
        userIpAddress: userIP,
        browser: browserDetails.browser,
        platform: browserDetails.platform,
        userAgent: browserDetails.userAgent,
        screenResolution: browserDetails.screenResolution,
        language: browserDetails.language,
        priority: 'LOW',
        category: 'OTHER',
        additionalContext: additionalContext
      };

      // Send to incident API with IDEA prefix
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
      setIsOpen(false);

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

  return (
    <>
      {/* Floating Innovation Button */}
      <button
        className="idea-submit-float-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Submit Your Brilliant Idea"
      >
        <span className="idea-icon">💡</span>
        <span className="idea-pulse"></span>
        <span className="idea-pulse-2"></span>
      </button>

      {/* Futuristic Modal Dialog */}
      {isOpen && (
        <div className="idea-submit-overlay" onClick={() => setIsOpen(false)}>
          <div className="idea-submit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="idea-submit-header">
              <div className="header-content">
                <div className="header-icon-wrapper">
                  <span className="header-icon">💡</span>
                  <div className="icon-glow"></div>
                </div>
                <div>
                  <h3>Innovation Portal</h3>
                  <p className="header-subtitle">Shape the Future of Learning</p>
                </div>
              </div>
              <button className="idea-submit-close" onClick={() => setIsOpen(false)}>×</button>
            </div>

            <div className="idea-submit-body">
              <div className="innovation-banner">
                <div className="banner-icon">🏆</div>
                <div className="banner-text">
                  <strong>Best Ideas Will Be Recognized!</strong>
                  <p>Top contributors earn exclusive badges, rewards, and see their ideas come to life.</p>
                </div>
              </div>

              <div className="idea-submit-context">
                <div className="context-item">
                  <span className="context-label">👤 Innovator:</span>
                  <span className="context-value">{user?.username || 'Guest Student'}</span>
                </div>
                <div className="context-item">
                  <span className="context-label">🕐 Timestamp:</span>
                  <span className="context-value">{new Date().toLocaleString()}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🎯</span>
                  Category
                </label>
                <select
                  className="idea-category-select"
                  value={ideaCategory}
                  onChange={(e) => setIdeaCategory(e.target.value)}
                  disabled={isSending}
                >
                  <option value="FEATURE">✨ New Feature</option>
                  <option value="IMPROVEMENT">🚀 Improvement</option>
                  <option value="GAMIFICATION">🎮 Gamification</option>
                  <option value="UI_UX">🎨 UI/UX Design</option>
                  <option value="CONTENT">📚 Content/Learning</option>
                  <option value="SOCIAL">👥 Social/Community</option>
                  <option value="AI_ML">🤖 AI/ML Integration</option>
                  <option value="OTHER">💫 Other Innovation</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📝</span>
                  Idea Title
                  <span className="label-required">*</span>
                </label>
                <input
                  type="text"
                  className="idea-title-input"
                  placeholder="Give your idea a catchy name..."
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  disabled={isSending}
                  maxLength={100}
                />
                <div className="char-count">{ideaTitle.length}/100</div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">💭</span>
                  Describe Your Innovation
                  <span className="label-required">*</span>
                </label>
                <textarea
                  className="idea-description-textarea"
                  placeholder="Paint the vision! What problem does this solve? How will it revolutionize learning? What makes it unique? Be specific and creative..."
                  value={ideaDescription}
                  onChange={(e) => setIdeaDescription(e.target.value)}
                  rows={8}
                  disabled={isSending}
                  maxLength={2000}
                />
                <div className="char-count">{ideaDescription.length}/2000</div>
              </div>

              <div className="submit-section">
                <div className="submit-info">
                  <span className="info-icon">ℹ️</span>
                  <span>Your idea will be reviewed by our innovation team. Selected ideas receive special recognition!</span>
                </div>
                <button
                  className="idea-submit-button"
                  onClick={handleSubmitIdea}
                  disabled={isSending || !ideaTitle.trim() || !ideaDescription.trim()}
                >
                  {isSending ? (
                    <>
                      <span className="spinner-orbit"></span>
                      <span>Transmitting Innovation...</span>
                    </>
                  ) : (
                    <>
                      <span className="submit-icon">🚀</span>
                      <span>Launch My Idea</span>
                      <div className="button-glow"></div>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccess && (
        <div className="idea-toast success">
          <div className="toast-content">
            <span className="toast-icon">🎉</span>
            <div className="toast-text">
              <strong>Innovation Received!</strong>
              <p>Thank you for shaping the future of learning. Your idea is under review!</p>
            </div>
          </div>
          <div className="toast-progress"></div>
        </div>
      )}

      {/* Error Notification */}
      {showError && (
        <div className="idea-toast error">
          <div className="toast-content">
            <span className="toast-icon">❌</span>
            <div className="toast-text">
              <strong>Transmission Failed</strong>
              <p>Unable to submit idea. Please check your connection and try again.</p>
            </div>
          </div>
          <div className="toast-progress error"></div>
        </div>
      )}
    </>
  );
}
