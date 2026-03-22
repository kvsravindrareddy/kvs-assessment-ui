import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConfig } from '../../Config';
import "../../css/LegalPages.css";

const SuccessStories = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const config = getConfig();
  const baseUrl = config.GATEWAY_URL || config.ADMIN_BASE_URL;

  // 🚀 PAGINATION STATE
  const [dbStories, setDbStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ role: 'Student', story: '', title: '' });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fallbackStories = [
    { name: "Emma, 3rd Grader", role: "Student", story: "I used to hate math but now I play Math Ninjas every day! My teacher says I went from a C to an A in 3 months.", title: "Grade improvement: C → A" },
    { name: "Michael Chen", role: "Parent", story: "As a working parent, KiVO gives me peace of mind. I get alerts when my kids struggle BEFORE it becomes a problem.", title: "Saved $200/month on tutoring" },
    { name: "Mrs. Rodriguez", role: "Teacher", story: "KiVO saves me 12 hours per week on grading. I finally have time to actually TEACH instead of paperwork.", title: "12 hours/week saved" }
  ];

  const stats = [
    { number: "89%", label: "of students report increased confidence" },
    { number: "23%", label: "average test score improvement" },
    { number: "10+ hours", label: "saved per teacher per week" },
    { number: "4.8/5", label: "average parent rating" }
  ];

  // 🚀 SERVER-SIDE PAGINATION FETCH
  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        // Fetches only 12 stories at a time from DB based on the current page!
        const res = await axios.get(`${baseUrl}/admin-assessment/v1/success-stories?page=${page}&size=12`);
        const data = res.data?.content || res.data?.stories || res.data?.data || [];
        setDbStories(data);
        setTotalPages(res.data?.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch stories:", error);
      } finally {
        setLoading(false);
        // Scroll to top of stories seamlessly when page changes
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }
    };
    fetchStories();
  }, [baseUrl, page]);

  const handleShareClick = () => {
    if (!user) {
      alert("Please log in to share your success story!");
      navigate('/login'); 
      return;
    }
    setShowModal(true);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (formData.story.trim().length < 50) {
        setSubmitStatus('error');
        setErrorMessage(`Your story is too short (${formData.story.trim().length}/50 characters). Please tell us a little more!`);
        return;
    }

    let finalTitle = formData.title.trim();
    if (!finalTitle || finalTitle.length < 10) {
        finalTitle = 'My KiVO Success Story'; 
    }

    setSubmitStatus('submitting');
    try {
      const userName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user.name || user.email.split('@')[0]);
      
      const payload = {
        name: userName,
        email: user.email,
        role: formData.role,
        title: finalTitle, 
        story: formData.story,
        rating: 5,
        grade: '',
        location: ''
      };

      await axios.post(`${baseUrl}/admin-assessment/v1/success-stories/submit`, payload, {
        headers: { 'X-User-Id': user.id || user.email }
      });
      
      setSubmitStatus('success');
      setTimeout(() => { 
        setShowModal(false); 
        setSubmitStatus(null); 
        setFormData({ role: 'Student', story: '', title: '' }); 
      }, 3000);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error.response?.data?.message || 'Failed to submit story. Please try again.');
    }
  };

  // Determine styles dynamically based on Role
  const getRoleConfig = (role) => {
    const r = role?.toLowerCase() || '';
    if (r.includes('student')) return { emoji: '🎓', color: '#38bdf8', bg: '#0f172a' };
    if (r.includes('parent') || r.includes('mother') || r.includes('father')) return { emoji: '👨‍👩‍👧‍👦', color: '#fb923c', bg: '#fff7ed' };
    return { emoji: '👩‍🏫', color: '#10b981', bg: '#ecfdf5' };
  };

  const activeStories = dbStories.length > 0 ? dbStories : fallbackStories;

  return (
    <section id="success-stories" className="section">
      <div className="container">
        <div className="content">
          <div className="text-section">

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <h1 className="section-heading" style={{ margin: 0 }}>Wall of Success 🌟</h1>
                <button onClick={handleShareClick} style={{ padding: '12px 25px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
                    ✍️ Share Your Story
                </button>
            </div>

            <div className="privacy-intro" style={{ marginTop: '20px' }}>
              <p>Real families, real teachers, real results. See how KiVO Learning International is transforming education across the globe.</p>
            </div>

            {/* Impact Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', margin: '2rem 0 3rem 0' }}>
              {stats.map((stat, index) => (
                <div key={index} style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', padding: '2rem', borderRadius: '16px', textAlign: 'center', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem', color: '#38bdf8' }}>{stat.number}</div>
                  <div style={{ fontSize: '1rem', color: '#cbd5e1' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '80px', color: '#64748b', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '10px' }}>⏳</span> Fetching latest stories...
                </div>
            ) : (
                <>
                    {/* 🚀 UNIFIED GRID LAYOUT */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px', marginTop: '2rem' }}>
                        {activeStories.map((story, i) => {
                            const config = getRoleConfig(story.role);
                            return (
                                <div key={i} style={{ background: '#ffffff', padding: '25px', borderRadius: '16px', border: `1px solid #e2e8f0`, borderTop: `6px solid ${config.color}`, boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', transition: '0.3s' }}
                                     onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)'; }}
                                     onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)'; }}>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <div style={{ fontSize: '2.5rem' }}>{config.emoji}</div>
                                        <div style={{ background: config.bg, color: config.color, padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', border: `1px solid ${config.color}40` }}>
                                            {story.role.toUpperCase()}
                                        </div>
                                    </div>
                                    
                                    <p style={{ fontStyle: 'italic', color: '#475569', lineHeight: '1.6', fontSize: '1.05rem', flexGrow: 1 }}>
                                        "{story.story}"
                                    </p>
                                    
                                    <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                                        <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.1rem' }}>{story.name}</div>
                                        {story.title && (
                                            <div style={{ color: config.color, fontWeight: 'bold', fontSize: '0.9rem', marginTop: '5px' }}>
                                                📈 {story.title}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 🚀 ELEGANT PAGINATION CONTROLS */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '50px', padding: '20px', background: '#f8fafc', borderRadius: '16px' }}>
                            <button 
                                disabled={page === 0} 
                                onClick={() => setPage(p => p - 1)} 
                                style={{ padding: '12px 25px', borderRadius: '50px', border: 'none', background: page === 0 ? '#cbd5e1' : '#3b82f6', color: 'white', fontWeight: 'bold', cursor: page === 0 ? 'not-allowed' : 'pointer', transition: '0.2s' }}
                            >
                                ← Newer Stories
                            </button>
                            
                            <span style={{ fontWeight: 'bold', color: '#475569', fontSize: '1.1rem' }}>
                                Page <span style={{ color: '#0f172a' }}>{page + 1}</span> of {totalPages}
                            </span>
                            
                            <button 
                                disabled={page >= totalPages - 1} 
                                onClick={() => setPage(p => p + 1)} 
                                style={{ padding: '12px 25px', borderRadius: '50px', border: 'none', background: page >= totalPages - 1 ? '#cbd5e1' : '#3b82f6', color: 'white', fontWeight: 'bold', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', transition: '0.2s' }}
                            >
                                Older Stories →
                            </button>
                        </div>
                    )}
                </>
            )}

          </div>
        </div>
      </div>

      {/* SHARE YOUR STORY MODAL */}
      {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
              <div style={{ background: 'white', padding: '35px', borderRadius: '24px', width: '90%', maxWidth: '550px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                      <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.8rem', fontWeight: '800' }}>Share Your Experience</h2>
                      <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', fontSize: '1.5rem', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>

                  {submitStatus === 'success' ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                          <div style={{ fontSize: '5rem', marginBottom: '15px' }}>🎉</div>
                          <h3 style={{ color: '#10b981', fontSize: '1.8rem', margin: '0 0 10px 0' }}>Thank you!</h3>
                          <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6' }}>Your story has been securely transmitted to our moderation queue. It will be published upon review.</p>
                      </div>
                  ) : (
                      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                          
                          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.95rem' }}>
                            Posting publicly as: <strong style={{ color: '#0f172a' }}>{user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}</strong>
                          </div>

                          <div>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>Your Role *</label>
                              <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '15px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem', outline: 'none', cursor: 'pointer' }}>
                                  <option value="Student">Student</option>
                                  <option value="Parent">Parent</option>
                                  <option value="Teacher">Teacher / Educator</option>
                              </select>
                          </div>
                          
                          <div>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>Your Story *</label>
                              <textarea required rows="5" value={formData.story} onChange={e => setFormData({...formData, story: e.target.value})} style={{ width: '100%', padding: '15px', border: '2px solid #e2e8f0', borderRadius: '12px', resize: 'vertical', fontSize: '1rem', outline: 'none' }} placeholder="How has KiVO helped you? (Minimum 50 characters)" />
                              <div style={{ fontSize: '0.85rem', textAlign: 'right', marginTop: '8px', fontWeight: 'bold', color: formData.story.trim().length < 50 ? '#ef4444' : '#10b981' }}>
                                  {formData.story.trim().length}/50 min characters
                              </div>
                          </div>

                          <div>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>Greatest Impact (Optional Headline)</label>
                              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '15px', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem', outline: 'none' }} placeholder="e.g. Grades went from C to A" />
                          </div>
                          
                          {submitStatus === 'error' && <div style={{ color: '#ef4444', fontSize: '0.95rem', fontWeight: 'bold', background: '#fef2f2', padding: '10px', borderRadius: '8px', border: '1px solid #fecaca' }}>{errorMessage || 'An error occurred. Please try again.'}</div>}
                          
                          <button type="submit" disabled={submitStatus === 'submitting' || formData.story.trim().length < 50} style={{ padding: '18px', background: formData.story.trim().length < 50 ? '#cbd5e1' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.2rem', cursor: submitStatus === 'submitting' || formData.story.trim().length < 50 ? 'not-allowed' : 'pointer', marginTop: '10px', transition: '0.3s', boxShadow: formData.story.trim().length >= 50 ? '0 10px 20px rgba(59, 130, 246, 0.3)' : 'none' }}>
                              {submitStatus === 'submitting' ? 'Submitting...' : 'Submit Story'}
                          </button>
                      </form>
                  )}
              </div>
          </div>
      )}
    </section>
  );
};

export default SuccessStories;