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

  const [dbStories, setDbStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ role: 'Student', story: '', title: '' });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(''); // 🚀 NEW: Specific error messages

  const fallbackStories = [
    { name: "Emma, 3rd Grader", role: "Student", story: "I used to hate math but now I play Math Ninjas every day! My teacher says I went from a C to an A in 3 months.", title: "Grade improvement: C → A" },
    { name: "Michael Chen", role: "Parent of 2", story: "As a working parent, KiVO gives me peace of mind. I get alerts when my kids struggle BEFORE it becomes a problem.", title: "Saved $200/month on tutoring" },
    { name: "Mrs. Rodriguez", role: "4th Grade Teacher", story: "KiVO saves me 12 hours per week on grading. I finally have time to actually TEACH instead of paperwork.", title: "12 hours/week saved" }
  ];

  const stats = [
    { number: "89%", label: "of students report increased confidence" },
    { number: "23%", label: "average test score improvement" },
    { number: "10+ hours", label: "saved per teacher per week" },
    { number: "4.8/5", label: "average parent rating" },
    { number: "67%", label: "reduction in learning gaps" },
    { number: "93%", label: "teacher satisfaction rate" }
  ];

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${baseUrl}/admin-assessment/v1/success-stories?page=${page}&size=20`);
        const data = res.data?.content || res.data?.stories || res.data?.data || [];
        setDbStories(data);
        setTotalPages(res.data?.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch stories:", error);
      } finally {
        setLoading(false);
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
    
    // 🚀 FRONTEND VALIDATION MATCHING YOUR JAVA BACKEND
    if (formData.story.trim().length < 50) {
        setSubmitStatus('error');
        setErrorMessage(`Your story is too short (${formData.story.trim().length}/50 characters). Please tell us a little more!`);
        return;
    }

    let finalTitle = formData.title.trim();
    if (!finalTitle || finalTitle.length < 10) {
        finalTitle = 'My KiVO Success Story'; // Ensures the 10 character minimum is met if left empty or too short
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

  const activeStories = dbStories.length > 0 ? dbStories : fallbackStories;
  const studentStories = activeStories.filter(s => s.role?.toLowerCase().includes('student'));
  const parentStories = activeStories.filter(s => s.role?.toLowerCase().includes('parent') || s.role?.toLowerCase().includes('mother') || s.role?.toLowerCase().includes('father'));
  const educatorStories = activeStories.filter(s => s.role?.toLowerCase().includes('teacher') || s.role?.toLowerCase().includes('principal') || s.role?.toLowerCase().includes('educator'));

  const getRoleEmoji = (role) => {
    const r = role?.toLowerCase() || '';
    if (r.includes('student')) return '🎓';
    if (r.includes('parent')) return '👨‍👩‍👧‍👦';
    return '👩‍🏫';
  };

  const StoryCard = ({ story, colorHex }) => (
    <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', borderLeft: `4px solid ${colorHex}`, transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
         onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)'; }}
         onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{getRoleEmoji(story.role)}</div>
      <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: '#555', lineHeight: '1.6' }}>"{story.story}"</p>
      <div style={{ fontWeight: '600', color: colorHex, marginBottom: '0.5rem' }}>— {story.name}</div>
      {story.title && (
        <div style={{ background: `${colorHex}15`, padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem', color: colorHex, fontWeight: '600' }}>
          📈 {story.title}
        </div>
      )}
    </div>
  );

  return (
    <section id="success-stories" className="section">
      <div className="container">
        <div className="content">
          <div className="text-section">

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <h1 className="section-heading" style={{ margin: 0 }}>Success Stories</h1>
                <button onClick={handleShareClick} style={{ padding: '12px 25px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
                    ✍️ Share Your Story
                </button>
            </div>

            <div className="privacy-intro" style={{ marginTop: '20px' }}>
              <p>Real families, real teachers, real results. See how KiVO Learning International is transforming education.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', margin: '2rem 0 3rem 0' }}>
              {stats.map((stat, index) => (
                <div key={index} style={{ background: 'linear-gradient(135deg, #1e90ff 0%, #4169e1 100%)', color: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 12px rgba(30, 144, 255, 0.3)' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>{stat.number}</div>
                  <div style={{ fontSize: '1rem', opacity: 0.9 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>Loading success stories...</div>
            ) : (
                <>
                    {studentStories.length > 0 && (
                        <div className="privacy-section">
                        <h2>👨‍🎓 Student Success</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
                            {studentStories.map((story, i) => <StoryCard key={i} story={story} colorHex="#1e90ff" />)}
                        </div>
                        </div>
                    )}

                    {parentStories.length > 0 && (
                        <div className="privacy-section">
                        <h2>👨‍👩‍👧‍👦 Parent Testimonials</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
                            {parentStories.map((story, i) => <StoryCard key={i} story={story} colorHex="#ff8c00" />)}
                        </div>
                        </div>
                    )}

                    {educatorStories.length > 0 && (
                        <div className="privacy-section">
                        <h2>👩‍🏫 Educator Impact</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
                            {educatorStories.map((story, i) => <StoryCard key={i} story={story} colorHex="#4caf50" />)}
                        </div>
                        </div>
                    )}
                </>
            )}

            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '40px' }}>
                    <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: page === 0 ? 'not-allowed' : 'pointer' }}>Previous</button>
                    <span style={{ padding: '10px', fontWeight: 'bold' }}>Page {page + 1} of {totalPages}</span>
                    <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}>Next</button>
                </div>
            )}

          </div>
        </div>
      </div>

      {/* SHARE YOUR STORY MODAL */}
      {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h2 style={{ margin: 0, color: '#1e293b' }}>Share Your Experience</h2>
                      <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
                  </div>

                  {submitStatus === 'success' ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                          <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🎉</div>
                          <h3 style={{ color: '#10b981' }}>Thank you!</h3>
                          <p style={{ color: '#64748b' }}>Your story has been securely transmitted to our moderation queue. It will be published upon review.</p>
                      </div>
                  ) : (
                      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          
                          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.95rem' }}>
                            Posting publicly as: <strong style={{ color: '#0f172a' }}>{user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}</strong>
                          </div>

                          <div>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#475569' }}>Your Role *</label>
                              <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                                  <option value="Student">Student</option><option value="Parent">Parent</option><option value="Teacher">Teacher / Educator</option>
                              </select>
                          </div>
                          
                          <div>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#475569' }}>Your Story *</label>
                              <textarea required rows="4" value={formData.story} onChange={e => setFormData({...formData, story: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', resize: 'vertical' }} placeholder="How has KiVO helped you? (Minimum 50 characters)" />
                              <div style={{ fontSize: '0.8rem', textAlign: 'right', marginTop: '5px', color: formData.story.length < 50 ? '#ef4444' : '#10b981' }}>
                                  {formData.story.length}/50 min characters
                              </div>
                          </div>
                          <div>
                              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#475569' }}>Greatest Impact (Optional Headline)</label>
                              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} placeholder="e.g. Grades went from C to A" />
                          </div>
                          
                          {submitStatus === 'error' && <div style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 'bold' }}>{errorMessage || 'An error occurred. Please try again.'}</div>}
                          
                          <button type="submit" disabled={submitStatus === 'submitting' || formData.story.trim().length < 50} style={{ padding: '15px', background: formData.story.trim().length < 50 ? '#94a3b8' : '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: submitStatus === 'submitting' || formData.story.trim().length < 50 ? 'not-allowed' : 'pointer', marginTop: '10px', transition: '0.3s' }}>
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