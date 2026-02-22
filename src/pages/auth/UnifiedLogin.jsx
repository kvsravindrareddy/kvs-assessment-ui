import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../css/UnifiedLogin.css';

const UnifiedLogin = ({ onClose, onSwitchToSignup }) => {
  const [authMode, setAuthMode] = useState('password'); // password, magic-link, biometric
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const {
    login,
    loginWithSocial,
    loginWithBiometric,
    requestMagicLink,
    theme,
    language
  } = useAuth();

  // Check if biometric authentication is available
  useEffect(() => {
    const checkBiometric = async () => {
      if (window.PublicKeyCredential) {
        const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setBiometricAvailable(available);
      }
    };
    checkBiometric();
  }, []);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  // Traditional password login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await login(credentials, false);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth login
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      // Initialize Google Identity Services
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
          callback: async (response) => {
            try {
              await loginWithSocial('GOOGLE', response);
              setSuccess('Google login successful!');
              setTimeout(() => onClose(), 1500);
            } catch (err) {
              setError(err.message || 'Google login failed');
              setLoading(false);
            }
          }
        });
        window.google.accounts.id.prompt();
      } else {
        throw new Error('Google Sign-In not loaded');
      }
    } catch (err) {
      setError(err.message || 'Google login failed');
      setLoading(false);
    }
  };

  // Microsoft OAuth login
  const handleMicrosoftLogin = async () => {
    setError('');
    setLoading(true);

    try {
      // Microsoft authentication flow would be implemented here
      // Using MSAL (Microsoft Authentication Library)
      setError('Microsoft login coming soon!');
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Microsoft login failed');
      setLoading(false);
    }
  };

  // Biometric/WebAuthn login
  const handleBiometricLogin = async () => {
    setError('');
    setLoading(true);

    try {
      if (!window.PublicKeyCredential) {
        throw new Error('Biometric authentication not supported');
      }

      // Get credential from authenticator
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32), // Should come from server
          timeout: 60000,
          userVerification: 'required'
        }
      });

      await loginWithBiometric(credential);
      setSuccess('Biometric login successful!');
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.message || 'Biometric authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Magic link request
  const handleMagicLink = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await requestMagicLink(credentials.email);
      setSuccess('Magic link sent! Check your email.');
    } catch (err) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordForm = () => (
    <form onSubmit={handlePasswordLogin} className="auth-form">
      <div className="form-group">
        <label htmlFor="username">Username or Email</label>
        <input
          type="text"
          id="username"
          name="username"
          value={credentials.username}
          onChange={handleChange}
          placeholder="Enter your username or email"
          required
          autoComplete="username"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
          autoComplete="current-password"
          className="form-input"
        />
      </div>

      <div className="form-options">
        <label className="remember-me">
          <input type="checkbox" /> Remember me
        </label>
        <button type="button" className="forgot-password-btn">
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        className="auth-submit-btn primary-btn"
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Sign In'}
      </button>
    </form>
  );

  const renderMagicLinkForm = () => (
    <form onSubmit={handleMagicLink} className="auth-form">
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={credentials.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
          autoComplete="email"
          className="form-input"
        />
      </div>

      <p className="magic-link-info">
        We'll send you a secure link to sign in without a password.
      </p>

      <button
        type="submit"
        className="auth-submit-btn primary-btn"
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send Magic Link'}
      </button>
    </form>
  );

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className={`unified-login-modal ${theme}`} onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="auth-header">
          <div className="logo-container">
            <h1 className="app-logo">KVS Assessment</h1>
          </div>
          <h2>Welcome Back!</h2>
          <p>Sign in to continue your learning journey</p>
        </div>

        {error && (
          <div className="auth-message error" role="alert">
            <span className="message-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="auth-message success" role="status">
            <span className="message-icon">✓</span>
            {success}
          </div>
        )}

        {/* Authentication method tabs */}
        <div className="auth-tabs" role="tablist">
          <button
            className={`auth-tab ${authMode === 'password' ? 'active' : ''}`}
            onClick={() => setAuthMode('password')}
            role="tab"
            aria-selected={authMode === 'password'}
          >
            Password
          </button>
          <button
            className={`auth-tab ${authMode === 'magic-link' ? 'active' : ''}`}
            onClick={() => setAuthMode('magic-link')}
            role="tab"
            aria-selected={authMode === 'magic-link'}
          >
            Magic Link
          </button>
          {biometricAvailable && (
            <button
              className={`auth-tab ${authMode === 'biometric' ? 'active' : ''}`}
              onClick={() => setAuthMode('biometric')}
              role="tab"
              aria-selected={authMode === 'biometric'}
            >
              Biometric
            </button>
          )}
        </div>

        {/* Authentication forms */}
        <div className="auth-content" role="tabpanel">
          {authMode === 'password' && renderPasswordForm()}
          {authMode === 'magic-link' && renderMagicLinkForm()}
          {authMode === 'biometric' && (
            <div className="biometric-container">
              <div className="biometric-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
                  <path d="M12 1C8.676 1 6 3.676 6 7c0 2.973 2.167 5.44 5 5.917V17c0 1.103.897 2 2 2s2-.897 2-2v-4.083c2.833-.477 5-2.944 5-5.917 0-3.324-2.676-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
                </svg>
              </div>
              <h3>Biometric Authentication</h3>
              <p>Use your fingerprint or face to sign in securely</p>
              <button
                className="auth-submit-btn biometric-btn"
                onClick={handleBiometricLogin}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Authenticate'}
              </button>
            </div>
          )}
        </div>

        {/* Social login options */}
        {authMode === 'password' && (
          <>
            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <div className="social-login-buttons">
              <button
                className="social-btn google-btn"
                onClick={handleGoogleLogin}
                disabled={loading}
                aria-label="Sign in with Google"
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>

              <button
                className="social-btn microsoft-btn"
                onClick={handleMicrosoftLogin}
                disabled={loading}
                aria-label="Sign in with Microsoft"
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#f25022" d="M1 1h10v10H1z"/>
                  <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                  <path fill="#7fba00" d="M1 13h10v10H1z"/>
                  <path fill="#ffb900" d="M13 13h10v10H13z"/>
                </svg>
                Microsoft
              </button>
            </div>
          </>
        )}

        {/* Sign up link */}
        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button
              className="auth-switch-btn"
              onClick={onSwitchToSignup}
            >
              Sign Up
            </button>
          </p>
        </div>

        {/* Accessibility notice */}
        <div className="accessibility-notice">
          <button className="accessibility-btn" aria-label="Accessibility options">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            Need help?
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;
