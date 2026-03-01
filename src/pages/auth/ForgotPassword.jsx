import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CONFIG from '../../Config';
import '../../css/AssessmentFlow.css';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    const [isError, setIsError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus('');
        
        try {
            const url = `${CONFIG.development.GATEWAY_URL}/api/auth/forgot-password`;
            await axios.post(url, { email });
            setIsError(false);
            setStatus("If an account with that email exists, a password reset link has been sent to your inbox.");
        } catch (err) {
            setIsError(true);
            setStatus("An error occurred while attempting to send the reset link. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '14px 18px', margin: '8px 0 20px 0',
        borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '16px',
        backgroundColor: '#f8fafc', color: '#1e293b', outline: 'none',
        boxSizing: 'border-box', transition: 'border-color 0.3s ease'
    };

    return (
        <div className="timeless-layout">
            <div className="focus-reading-mode" style={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
                <div className="reading-canvas" style={{ maxWidth: '600px', width: '100%', margin: '40px auto' }}>
                    
                    <h2 className="reading-title" style={{ textAlign: 'center' }}>Account Recovery</h2>
                    <div className="reading-content" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        Enter your registered email address and we'll send you a link to securely reset your password.
                    </div>

                    <div className="assessment-section">
                        <div className="modern-question-box">
                            <div className="question-header">
                                <span className="q-badge">Step 1 of 2</span>
                            </div>
                            <h3 className="q-text">Find Your Account</h3>

                            {status && (
                                <div className="assessment-done-card" style={{ padding: '1rem', margin: '1rem 0', minHeight: 'auto', backgroundColor: isError ? '#fef2f2' : '#f0fdf4' }}>
                                    <div className="done-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                                        {isError ? '⚠️' : '📧'}
                                    </div>
                                    <h4 style={{ margin: 0, color: isError ? '#991b1b' : '#166534', fontSize: '1.1rem' }}>
                                        {status}
                                    </h4>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '600', color: '#475569', fontSize: '15px' }}>Email Address</label>
                                    <input 
                                        type="email" 
                                        placeholder="you@example.com" 
                                        value={email} 
                                        onChange={e => setEmail(e.target.value)} 
                                        required 
                                        style={inputStyle} 
                                    />
                                </div>
                                <button type="submit" className="modern-submit-btn" disabled={isSubmitting}>
                                    {isSubmitting ? 'Processing...' : 'Send Reset Link'}
                                </button>
                            </form>

                            <div className="action-bar" style={{ justifyContent: 'center', marginTop: '2rem' }}>
                                <button className="tool-btn" onClick={() => navigate('/login')}>
                                    ← Back to Login
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}