import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getConfig } from '../../Config';

export default function AdminSuccessStories() {
  const config = getConfig();
  const baseUrl = config.GATEWAY_URL || config.ADMIN_BASE_URL;

  const [pendingStories, setPendingStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const fetchPendingStories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${baseUrl}/admin-assessment/v1/success-stories/admin/pending?page=0&size=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingStories(res.data?.content || res.data?.data || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load pending stories.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingStories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  const handleAction = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      let payload = {};
      
      if (action === 'reject') {
        const reason = window.prompt("Reason for rejection:");
        if (!reason) return;
        payload = { reason };
      }

      await axios.post(`${baseUrl}/admin-assessment/v1/success-stories/admin/${id}/${action}`, payload, {
        headers: { Authorization: `Bearer ${token}`, 'X-Admin-Id': 'SUPER_ADMIN' }
      });

      setMessage({ type: 'success', text: `Story successfully ${action}ed!` });
      fetchPendingStories(); // Reload the queue
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to ${action} story.` });
    }
  };

  const getRoleEmoji = (role) => {
    const r = role?.toLowerCase() || '';
    if (r.includes('student')) return '🎓';
    if (r.includes('parent')) return '👨‍👩‍👧‍👦';
    return '👩‍🏫';
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#1e293b', margin: 0 }}>🛡️ Success Stories Moderation Queue</h2>
        <button onClick={fetchPendingStories} style={{ padding: '10px 20px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          🔄 Refresh Queue
        </button>
      </div>

      {message && (
        <div style={{ padding: '15px', borderRadius: '8px', marginBottom: '20px', background: message.type === 'success' ? '#ecfdf5' : '#fef2f2', color: message.type === 'success' ? '#065f46' : '#991b1b', border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`, fontWeight: 'bold' }}>
          {message.text}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#64748b', fontSize: '1.2rem' }}>Scanning database for pending submissions...</p>
      ) : pendingStories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
          <h3 style={{ color: '#475569' }}>Inbox Zero!</h3>
          <p style={{ color: '#64748b' }}>There are no pending success stories to review.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {pendingStories.map(story => (
            <div key={story.id} style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '3rem', background: '#f1f5f9', minWidth: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                {getRoleEmoji(story.role)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0, color: '#0f172a' }}>{story.name} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'normal', background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', marginLeft: '10px' }}>{story.role}</span></h3>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Submitted: {new Date(story.createdAt).toLocaleDateString()}</span>
                </div>
                
                <p style={{ color: '#334155', fontSize: '1.1rem', fontStyle: 'italic', background: '#f8fafc', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', lineHeight: '1.6' }}>
                  "{story.story}"
                </p>
                
                {story.title && (
                  <p style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.95rem', marginTop: '10px' }}>
                    📈 Claimed Impact / Headline: {story.title}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '140px' }}>
                <button onClick={() => handleAction(story.id, 'approve')} style={{ padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }} onMouseOver={(e) => e.target.style.background = '#059669'} onMouseOut={(e) => e.target.style.background = '#10b981'}>
                  ✅ Approve
                </button>
                <button onClick={() => handleAction(story.id, 'reject')} style={{ padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }} onMouseOver={(e) => e.target.style.background = '#dc2626'} onMouseOut={(e) => e.target.style.background = '#ef4444'}>
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}