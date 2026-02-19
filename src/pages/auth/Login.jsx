import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../css/Auth.css';

const Login = ({ onClose, onSwitchToSignup, isAdmin = false }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Login form submitted:', credentials.username, isAdmin ? 'Admin' : 'User');
      await login(credentials, isAdmin);
      alert(`${isAdmin ? 'Admin' : 'User'} login successful!`);
      onClose();
    } catch (err) {
      console.error('Login component error:', err);
      const errorMessage = err.message || err.response?.data?.message || err.response?.data || 'Login failed. Please check your credentials.';
      console.error('Error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}>×</button>

        <div className="auth-header">
          <h2>{isAdmin ? 'Admin Login' : 'User Login'}</h2>
          <p>Welcome back! Please enter your credentials</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
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
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {!isAdmin && (
          <div className="auth-footer">
            <p>Don't have an account?
              <button
                className="auth-switch-btn"
                onClick={onSwitchToSignup}
              >
                Sign Up
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
