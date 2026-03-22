import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getConfig } from '../../Config';

export default function CompetitiveExamManager() {
  const config = getConfig();
  const baseUrl = config.GATEWAY_URL || config.ADMIN_BASE_URL;

  // Data State
  const [countries, setCountries] = useState([]);
  const [existingExams, setExistingExams] = useState([]);
  
  // Form State
  const [editingId, setEditingId] = useState(null); // If null, we are Creating. If set, we are Updating.
  const [examName, setExamName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [totalDuration, setTotalDuration] = useState(180);
  const [negativeFactor, setNegativeFactor] = useState(0.25);
  const [sections, setSections] = useState([{ sectionName: '', questionCount: 30, marksPerQuestion: 4 }]);

  useEffect(() => {
    fetchInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Load Countries and Existing Exams simultaneously
      const [countriesRes, examsRes] = await Promise.all([
        axios.get(`${baseUrl}/admin-assessment/v1/competitive-exams/countries`, { headers }),
        axios.get(`${baseUrl}/admin-assessment/v1/competitive-exams`, { headers })
      ]);

      setCountries(countriesRes.data || []);
      setExistingExams(examsRes.data || []);
    } catch (err) {
      console.error("❌ Failed to load initial data", err);
    }
  };

  const handleAddSection = () => {
    setSections([...sections, { sectionName: '', questionCount: 30, marksPerQuestion: 4 }]);
  };

  const handleRemoveSection = (index) => {
    const newSec = [...sections];
    newSec.splice(index, 1);
    setSections(newSec);
  };

  const handleEdit = (exam) => {
    setEditingId(exam.id);
    setCountryCode(exam.country?.countryCode || '');
    setExamName(exam.examName);
    setTotalDuration(exam.totalDurationMinutes);
    setNegativeFactor(exam.negativeMarkingFactor);
    setSections(exam.sections?.length > 0 ? exam.sections : [{ sectionName: '', questionCount: 30, marksPerQuestion: 4 }]);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to see the form
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCountryCode('');
    setExamName('');
    setTotalDuration(180);
    setNegativeFactor(0.25);
    setSections([{ sectionName: '', questionCount: 30, marksPerQuestion: 4 }]);
  };

  const handleSaveBlueprint = async () => {
    if (!countryCode || !examName) {
        alert("Please select a country and enter an exam name.");
        return;
    }

    const payload = {
      id: editingId, // 🚀 Crucial: Passing the ID forces an UPDATE instead of INSERT
      country: { countryCode },
      examName,
      totalDurationMinutes: totalDuration,
      negativeMarkingFactor: negativeFactor,
      sections: sections.map((s, i) => ({ ...s, displayOrder: i + 1 }))
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${baseUrl}/admin-assessment/v1/competitive-exams/blueprint`, payload, {
          headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(editingId ? 'Exam Blueprint Updated Successfully! 💾' : 'Global Exam Blueprint Deployed! 🚀');
      handleCancelEdit(); // Reset form
      fetchInitialData(); // Refresh the table
    } catch (err) {
      alert('Failed to save blueprint. Ensure backend is running.');
    }
  };

  return (
    <div style={{ padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* --- FORM SECTION --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ color: '#0f172a', margin: '0 0 5px 0' }}>
              {editingId ? '✏️ Edit Exam Blueprint' : '🛠️ Global Exam Architect'}
            </h2>
            <p style={{ color: '#64748b', margin: 0 }}>
              {editingId ? `Currently editing: ${examName}` : 'Define blueprints for entrance exams worldwide.'}
            </p>
          </div>
          {editingId && (
              <button onClick={handleCancelEdit} style={{ padding: '8px 15px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  ❌ Cancel Edit
              </button>
          )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: editingId ? '2px solid #38bdf8' : '1px solid transparent' }}>
        <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Target Region *</label>
            <select value={countryCode} onChange={e => setCountryCode(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <option value="">-- Select Country --</option>
            {countries.map(c => <option key={c.countryCode} value={c.countryCode}>{c.countryName}</option>)}
            </select>
        </div>
        <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Exam Name *</label>
            <input placeholder="e.g., IIT-JEE Advanced" value={examName} onChange={e => setExamName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
        </div>
        <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Total Duration (Minutes)</label>
            <input type="number" value={totalDuration} onChange={e => setTotalDuration(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
        </div>
        <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Negative Marking Factor</label>
            <input type="number" step="0.01" placeholder="e.g. 0.25 (1/4th)" value={negativeFactor} onChange={e => setNegativeFactor(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
        </div>
      </div>

      <h3 style={{ color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>Blueprint Sections</h3>
      {sections.map((sec, i) => (
        <div key={i} style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center' }}>
          <div style={{ background: '#3b82f6', color: 'white', minWidth: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold' }}>{i + 1}</div>
          <input placeholder="Section Name (e.g., Physics)" value={sec.sectionName} onChange={e => { const newSec = [...sections]; newSec[i].sectionName = e.target.value; setSections(newSec); }} style={{ padding: '12px', flex: 1, borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          <input type="number" placeholder="Questions" value={sec.questionCount} onChange={e => { const newSec = [...sections]; newSec[i].questionCount = parseInt(e.target.value) || 0; setSections(newSec); }} style={{ padding: '12px', width: '120px', borderRadius: '8px', border: '1px solid #cbd5e1' }} title="Number of Questions" />
          <input type="number" placeholder="Marks/Q" value={sec.marksPerQuestion} onChange={e => { const newSec = [...sections]; newSec[i].marksPerQuestion = parseInt(e.target.value) || 0; setSections(newSec); }} style={{ padding: '12px', width: '120px', borderRadius: '8px', border: '1px solid #cbd5e1' }} title="Marks Per Question" />
          {sections.length > 1 && (
              <button onClick={() => handleRemoveSection(i)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '1.2rem', cursor: 'pointer' }} title="Remove Section">🗑️</button>
          )}
        </div>
      ))}

      <div style={{ marginTop: '30px', display: 'flex', gap: '15px', borderBottom: '2px solid #f1f5f9', paddingBottom: '40px' }}>
        <button onClick={handleAddSection} style={{ padding: '12px 20px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>+ Add Section</button>
        <button onClick={handleSaveBlueprint} style={{ padding: '12px 30px', background: editingId ? '#38bdf8' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            {editingId ? '💾 Save Changes' : '🚀 Deploy Exam Matrix'}
        </button>
      </div>

      {/* --- TABLE SECTION (EXISTING EXAMS) --- */}
      <div style={{ marginTop: '40px' }}>
          <h3 style={{ color: '#0f172a', marginBottom: '20px' }}>📋 Deployed Exam Matrices</h3>
          
          {existingExams.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1', color: '#64748b' }}>
                  No competitive exams have been created yet. Build your first blueprint above!
              </div>
          ) : (
              <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                          <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                              <th style={{ padding: '15px', color: '#475569' }}>Exam Name</th>
                              <th style={{ padding: '15px', color: '#475569' }}>Region</th>
                              <th style={{ padding: '15px', color: '#475569' }}>Duration</th>
                              <th style={{ padding: '15px', color: '#475569' }}>Sections</th>
                              <th style={{ padding: '15px', color: '#475569' }}>Status</th>
                              <th style={{ padding: '15px', color: '#475569', textAlign: 'center' }}>Actions</th>
                          </tr>
                      </thead>
                      <tbody>
                          {existingExams.map((exam) => (
                              <tr key={exam.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                  <td style={{ padding: '15px', fontWeight: 'bold', color: '#0f172a' }}>{exam.examName}</td>
                                  <td style={{ padding: '15px' }}>
                                      <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                          {exam.country?.countryCode || 'N/A'}
                                      </span>
                                  </td>
                                  <td style={{ padding: '15px' }}>{exam.totalDurationMinutes} Mins</td>
                                  <td style={{ padding: '15px' }}>{exam.sections?.length || 0} Sections</td>
                                  <td style={{ padding: '15px' }}>
                                      <span style={{ color: exam.isActive ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                                          {exam.isActive ? 'Active' : 'Inactive'}
                                      </span>
                                  </td>
                                  <td style={{ padding: '15px', textAlign: 'center' }}>
                                      <button 
                                        onClick={() => handleEdit(exam)} 
                                        style={{ padding: '6px 15px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', color: '#3b82f6', transition: '0.2s' }}
                                        onMouseOver={e => { e.target.style.background = '#eff6ff'; e.target.style.borderColor = '#3b82f6'; }}
                                        onMouseOut={e => { e.target.style.background = 'white'; e.target.style.borderColor = '#cbd5e1'; }}
                                      >
                                          ✏️ Edit
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}
      </div>

    </div>
  );
}