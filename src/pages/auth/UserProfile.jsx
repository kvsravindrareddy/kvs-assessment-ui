import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CONFIG from '../../Config';

export default function UserProfile() {
    const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '' });
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);

    const authBaseUrl = `${CONFIG.development.GATEWAY_URL}/api/users`;
    
    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${authBaseUrl}/profile`, getAuthHeaders());
                setProfile(response.data);
            } catch (err) {
                setProfileMessage({ type: 'error', text: 'Failed to load profile data.' });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${authBaseUrl}/profile`, profile, getAuthHeaders());
            setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setProfileMessage({ type: '', text: '' }), 4000);
        } catch (error) {
            setProfileMessage({ type: 'error', text: 'Failed to update profile.' });
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        try {
            await axios.put(`${authBaseUrl}/change-password`, {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            }, getAuthHeaders());
            
            setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setPasswordMessage({ type: '', text: '' }), 4000);
        } catch (error) {
            setPasswordMessage({ type: 'error', text: error.response?.data || 'Failed to change password.' });
        }
    };

    const inputStyle = {
        width: '100%', padding: '12px 16px', margin: '8px 0 20px 0',
        borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px',
        backgroundColor: '#fff', color: '#1e293b', outline: 'none',
        boxSizing: 'border-box', transition: 'border-color 0.2s ease',
        fontFamily: 'inherit'
    };

    const labelStyle = { display: 'block', fontWeight: '600', color: '#475569', fontSize: '14px' };
    
    const cardStyle = {
        background: '#f8fafc', borderRadius: '12px', padding: '24px', 
        marginBottom: '24px', border: '1px solid #e2e8f0'
    };

    const headerStyle = {
        marginTop: 0, borderBottom: '1px solid #e2e8f0', 
        paddingBottom: '12px', marginBottom: '20px', color: '#1e293b', fontSize: '18px'
    };

    const btnStyle = {
        padding: '12px 24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', 
        fontWeight: '600', fontSize: '15px', transition: 'all 0.2s', fontFamily: 'inherit'
    };

    const alertStyle = (type) => ({
        padding: '12px 16px', marginBottom: '20px', borderRadius: '8px', fontSize: '14px', fontWeight: '500',
        backgroundColor: type === 'error' ? '#fef2f2' : '#f0fdf4',
        color: type === 'error' ? '#991b1b' : '#166534',
        border: `1px solid ${type === 'error' ? '#fecaca' : '#bbf7d0'}`
    });

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>Loading profile...</div>;
    }

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            
            {/* Basic Details Section */}
            <div style={cardStyle}>
                <h3 style={headerStyle}>Personal Information</h3>

                {profileMessage.text && (
                    <div style={alertStyle(profileMessage.type)}>{profileMessage.text}</div>
                )}

                <form onSubmit={handleProfileUpdate}>
                    <div>
                        <label style={labelStyle}>First Name</label>
                        <input type="text" value={profile.firstName || ''} onChange={e => setProfile({...profile, firstName: e.target.value})} required style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Last Name</label>
                        <input type="text" value={profile.lastName || ''} onChange={e => setProfile({...profile, lastName: e.target.value})} required style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Email Address (Read-only)</label>
                        <input type="email" value={profile.email || ''} disabled style={{...inputStyle, backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b'}} />
                    </div>
                    <div>
                        <label style={labelStyle}>Phone Number</label>
                        <input type="text" value={profile.phoneNumber || ''} onChange={e => setProfile({...profile, phoneNumber: e.target.value})} style={inputStyle} />
                    </div>
                    <button type="submit" style={btnStyle} onMouseOver={e => e.target.style.opacity = 0.9} onMouseOut={e => e.target.style.opacity = 1}>
                        Save Profile Details
                    </button>
                </form>
            </div>

            {/* Security Section */}
            <div style={cardStyle}>
                <h3 style={headerStyle}>Account Security</h3>

                {passwordMessage.text && (
                    <div style={alertStyle(passwordMessage.type)}>{passwordMessage.text}</div>
                )}

                <form onSubmit={handlePasswordChange}>
                    <div>
                        <label style={labelStyle}>Current Password</label>
                        <input type="password" value={passwords.oldPassword} onChange={e => setPasswords({...passwords, oldPassword: e.target.value})} required style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>New Password</label>
                        <input type="password" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} required style={inputStyle} minLength="6" />
                    </div>
                    <div>
                        <label style={labelStyle}>Confirm New Password</label>
                        <input type="password" value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} required style={inputStyle} minLength="6" />
                    </div>
                    <button type="submit" style={{...btnStyle, background: '#475569'}} onMouseOver={e => e.target.style.opacity = 0.9} onMouseOut={e => e.target.style.opacity = 1}>
                        Update Password
                    </button>
                </form>
            </div>

        </div>
    );
}