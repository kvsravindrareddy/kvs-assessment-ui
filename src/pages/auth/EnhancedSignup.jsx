import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../css/EnhancedSignup.css';

const EnhancedSignup = ({ onClose, onSwitchToLogin }) => {
  const [step, setStep] = useState(1); // 1: Role Selection, 2: Basic Info, 3: Details
  const [formData, setFormData] = useState({
    role: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    organization: '', // For teachers, admins
    grade: '', // For students
    parentEmail: '', // For students (optional)
    schoolCode: '' // For linking to specific school
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signup, ROLES } = useAuth();

  // Available roles for public signup
  const availableRoles = [
    {
      value: ROLES.STUDENT,
      name: 'Student',
      description: 'I want to learn and take assessments',
      icon: '🎓',
      color: '#DC2626',
      ageGroup: 'kids'
    },
    {
      value: ROLES.PARENT,
      name: 'Parent/Guardian',
      description: 'I want to monitor my child\'s progress',
      icon: '👨‍👩‍👧',
      color: '#D97706',
      ageGroup: 'adult'
    },
    {
      value: ROLES.TEACHER,
      name: 'Teacher',
      description: 'I want to create content and manage students',
      icon: '👩‍🏫',
      color: '#059669',
      ageGroup: 'adult'
    },
    {
      value: ROLES.CONTENT_CREATOR,
      name: 'Content Creator',
      description: 'I want to create educational materials',
      icon: '✍️',
      color: '#EC4899',
      ageGroup: 'adult'
    }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
    setError('');
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.role) {
        setError('Please select your role');
        return false;
      }
    }

    if (step === 2) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
      if (!formData.username || formData.username.length < 3) {
        setError('Username must be at least 3 characters');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    if (step === 3) {
      if (!formData.firstName || !formData.lastName) {
        setError('Please enter your full name');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateStep()) {
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...signupData } = formData;
      await signup(signupData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    const selectedRole = availableRoles.find(r => r.value === formData.role);

    return (
      <div className="auth-modal-overlay" onClick={onClose}>
        <div className="enhanced-signup-modal" onClick={(e) => e.stopPropagation()}>
          <button className="auth-close-btn" onClick={onClose} aria-label="Close">×</button>

          <div className="success-screen">
            <div className="success-animation">
              <div className="checkmark-circle">
                <svg className="checkmark" viewBox="0 0 52 52">
                  <circle className="checkmark-circle-path" cx="26" cy="26" r="25" fill="none"/>
                  <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
              </div>
            </div>

            <h2>Welcome Aboard!</h2>
            <p className="success-message">
              Your account has been created successfully as a <strong>{selectedRole?.name}</strong>.
            </p>

            <div className="approval-notice success">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <p>You can now login and start using the platform immediately!</p>
            </div>

            <div className="next-steps">
              <h3>Next Steps:</h3>
              <ul>
                <li>Click "Go to Login" below to sign in</li>
                <li>Complete your profile</li>
                <li>Explore available features and upgrade your plan anytime</li>
                {formData.role === ROLES.STUDENT && <li>Start learning and taking assessments</li>}
                {formData.role === ROLES.TEACHER && <li>Create and manage your classes</li>}
                {formData.role === ROLES.PARENT && <li>Monitor your children's progress</li>}
                {formData.role === ROLES.CONTENT_CREATOR && <li>Start creating educational content</li>}
              </ul>
            </div>

            <button className="primary-btn" onClick={onSwitchToLogin}>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Role Selection
  const renderRoleSelection = () => (
    <div className="signup-step">
      <div className="step-header">
        <h2>Choose Your Role</h2>
        <p>Select the role that best describes you</p>
      </div>

      <div className="roles-selection-grid">
        {availableRoles.map((role) => (
          <button
            key={role.value}
            className={`role-selection-card ${formData.role === role.value ? 'selected' : ''} ${role.ageGroup}`}
            onClick={() => handleRoleSelect(role.value)}
            type="button"
          >
            <div className="role-icon-container" style={{ backgroundColor: role.color }}>
              <span className="role-icon">{role.icon}</span>
            </div>
            <h3>{role.name}</h3>
            <p>{role.description}</p>
            {formData.role === role.value && (
              <div className="selected-indicator">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <button
        className="next-btn primary-btn"
        onClick={handleNext}
        disabled={!formData.role}
      >
        Continue
      </button>
    </div>
  );

  // Step 2: Account Credentials
  const renderCredentials = () => (
    <div className="signup-step">
      <div className="step-header">
        <h2>Create Your Account</h2>
        <p>Set up your login credentials</p>
      </div>

      <form className="signup-form">
        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            required
            autoComplete="email"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">Username *</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a unique username"
            required
            autoComplete="username"
            className="form-input"
          />
          <small className="input-hint">At least 3 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            required
            autoComplete="new-password"
            className="form-input"
          />
          <small className="input-hint">At least 6 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            required
            autoComplete="new-password"
            className="form-input"
          />
        </div>
      </form>

      <div className="step-actions">
        <button className="back-btn secondary-btn" onClick={handleBack}>
          Back
        </button>
        <button className="next-btn primary-btn" onClick={handleNext}>
          Continue
        </button>
      </div>
    </div>
  );

  // Step 3: Personal Details
  const renderPersonalDetails = () => {
    const selectedRole = availableRoles.find(r => r.value === formData.role);

    return (
      <div className="signup-step">
        <div className="step-header">
          <h2>Tell Us About Yourself</h2>
          <p>Complete your profile information</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+1-234-567-8900"
              className="form-input"
            />
          </div>

          {/* Role-specific fields */}
          {(formData.role === ROLES.TEACHER || formData.role === ROLES.CONTENT_CREATOR) && (
            <div className="form-group">
              <label htmlFor="organization">School/Organization</label>
              <input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="Your school or organization name"
                className="form-input"
              />
            </div>
          )}

          {formData.role === ROLES.STUDENT && (
            <>
              <div className="form-group">
                <label htmlFor="grade">Grade Level</label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select your grade</option>
                  <option value="pre-k">Pre-K</option>
                  <option value="kindergarten">Kindergarten</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={`grade-${i + 1}`}>
                      Grade {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="parentEmail">Parent/Guardian Email</label>
                <input
                  type="email"
                  id="parentEmail"
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleChange}
                  placeholder="parent@example.com (optional)"
                  className="form-input"
                />
                <small className="input-hint">For progress updates and notifications</small>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="schoolCode">School Code (Optional)</label>
            <input
              type="text"
              id="schoolCode"
              name="schoolCode"
              value={formData.schoolCode}
              onChange={handleChange}
              placeholder="Enter school code if you have one"
              className="form-input"
            />
            <small className="input-hint">Ask your school admin for the code</small>
          </div>

          <div className="terms-agreement">
            <label className="checkbox-label">
              <input type="checkbox" required />
              <span>I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a></span>
            </label>
          </div>

          <div className="step-actions">
            <button type="button" className="back-btn secondary-btn" onClick={handleBack}>
              Back
            </button>
            <button
              type="submit"
              className="submit-btn primary-btn"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="enhanced-signup-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose} aria-label="Close">×</button>

        {/* Progress indicator */}
        <div className="progress-bar">
          <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span className="step-label">Role</span>
          </div>
          <div className={`progress-line ${step > 1 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <span className="step-label">Account</span>
          </div>
          <div className={`progress-line ${step > 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span className="step-label">Details</span>
          </div>
        </div>

        {error && (
          <div className="auth-message error" role="alert">
            <span className="message-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="signup-content">
          {step === 1 && renderRoleSelection()}
          {step === 2 && renderCredentials()}
          {step === 3 && renderPersonalDetails()}
        </div>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button className="auth-switch-btn" onClick={onSwitchToLogin}>
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSignup;
