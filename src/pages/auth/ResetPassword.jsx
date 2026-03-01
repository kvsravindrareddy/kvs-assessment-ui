import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CONFIG from '../../Config';
import '../../css/AssessmentFlow.css';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); 
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!token) {
            setMessage({ type: 'error', text: 'Invalid password reset link. No token provided.' });
            return;
        }
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match. Please try again.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const url = `${CONFIG.development.GATEWAY_URL}/api/auth/reset-password`;
            await axios.post(url, { 
                token: token, 
                newPassword: password 
            });
            setMessage({ type: 'success', text: 'Password reset successfully. Redirecting to login...' });
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Invalid or expired token. Please request a new reset link.' });
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
    const labelStyle = { display: 'block', fontWeight: '600', color: '#475569', fontSize: '15px' };

    return (
        <div className="timeless-layout">
            <div className="focus-reading-mode" style={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
                <div className="reading-canvas" style={{ maxWidth: '600px', width: '100%', margin: '40px auto' }}>
                    
                    <h2 className="reading-title" style={{ textAlign: 'center' }}>Create New Password</h2>
                    <div className="reading-content" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        Your identity has been verified. Please choose a strong, new password below.
                    </div>

                    <div className="assessment-section">
                        <div className="modern-question-box">
                            <div className="question-header">
                                <span className="q-badge">Step 2 of 2</span>
                            </div>
                            <h3 className="q-text">Secure Your Account</h3>

                            {message.text && (
                                <div className="assessment-done-card" style={{ padding: '1rem', margin: '1rem 0', minHeight: 'auto', backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4' }}>
                                    <div className="done-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                                        {message.type === 'error' ? '⚠️' : '✅'}
                                    </div>
                                    <h4 style={{ margin: 0, color: message.type === 'error' ? '#991b1b' : '#166534', fontSize: '1.1rem' }}>
                                        {message.text}
                                    </h4>
                                </div>
                            )}

                            {!token && !message.text && (
                                <div className="assessment-done-card" style={{ padding: '1rem', margin: '1rem 0', minHeight: 'auto', backgroundColor: '#fffbeb' }}>
                                    <div className="done-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔗</div>
                                    <h4 style={{ margin: 0, color: '#92400e', fontSize: '1.1rem' }}>
                                        Missing reset token in URL. Please click the exact link sent to your email.
                                    </h4>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}>New Password</label>
                                    <input 
                                        type="password" 
                                        placeholder="Enter new password" 
                                        value={password} 
                                        onChange={e => setPassword(e.target.value)} 
                                        required 
                                        style={inputStyle}
                                        disabled={!token || message.type === 'success'}
                                        minLength="6"
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Confirm Password</label>
                                    <input 
                                        type="password" 
                                        placeholder="Confirm new password" 
                                        value={confirmPassword} 
                                        onChange={e => setConfirmPassword(e.target.value)} 
                                        required 
                                        style={inputStyle}
                                        disabled={!token || message.type === 'success'}
                                    />
                                </div>
                                <button type="submit" className="modern-submit-btn" disabled={isSubmitting || !token || message.type === 'success'}>
                                    {isSubmitting ? 'Resetting...' : 'Confirm Reset Password'}
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