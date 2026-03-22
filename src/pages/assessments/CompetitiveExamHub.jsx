import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getConfig } from '../../Config';

export default function CompetitiveExamHub() {
  const config = getConfig();
  const baseUrl = config.GATEWAY_URL || config.ADMIN_BASE_URL;
  const navigate = useNavigate();

  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${baseUrl}/admin-assessment/v1/competitive-exams/countries`, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(res => setCountries(res.data))
      .catch(err => console.error("Failed to load countries"));
  }, [baseUrl]);

  const handleCountrySelect = async (code) => {
    setSelectedCountry(code);
    setSelectedExam(null);
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${baseUrl}/admin-assessment/v1/competitive-exams/country/${code}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setExams(res.data);
    } catch (err) {
        console.error("Failed to load exams");
    }
  };

  // 🚀 NEW: Start Simulation Handler
  const handleStartSimulation = () => {
      navigate(`/competitive-assessment/${selectedExam.id}`, { state: { exam: selectedExam } });
  };

  // 🚀 NEW: Print Worksheet Handler
  const handlePrintWorksheet = () => {
      navigate(`/competitive-worksheet/${selectedExam.id}`, { state: { exam: selectedExam } });
  };

  return (
    <div style={{ background: '#020617', color: '#f8fafc', minHeight: '100vh', padding: '50px 20px', fontFamily: '"Fira Code", monospace' }}>
      <header style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ color: '#38bdf8', fontSize: '3.5rem', margin: '0 0 10px 0', textShadow: '0 0 25px rgba(56, 189, 248, 0.4)', letterSpacing: '2px' }}>GLOBAL ENTRANCE MATRIX</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>Select your regional pathway and initialize the exam simulation.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ background: '#0f172a', padding: '40px', borderRadius: '20px', border: '1px solid #334155', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <label style={{ color: '#34d399', fontWeight: 'bold', display: 'block', marginBottom: '20px', fontSize: '1.2rem', letterSpacing: '1px' }}>1. TARGET REGION</label>
          <select value={selectedCountry} onChange={(e) => handleCountrySelect(e.target.value)} style={{ width: '100%', padding: '18px', background: '#1e293b', color: '#f8fafc', border: '2px solid #475569', borderRadius: '12px', fontSize: '1.2rem', outline: 'none', cursor: 'pointer' }}>
            <option value="">-- SELECT REGION --</option>
            {countries.map(c => <option key={c.countryCode} value={c.countryCode}>{c.countryName}</option>)}
          </select>
        </div>

        <div style={{ background: '#0f172a', padding: '40px', borderRadius: '20px', border: '1px solid #334155', opacity: selectedCountry ? 1 : 0.4, transition: '0.3s', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <label style={{ color: '#34d399', fontWeight: 'bold', display: 'block', marginBottom: '20px', fontSize: '1.2rem', letterSpacing: '1px' }}>2. AVAILABLE EXAMS</label>
          <select disabled={!selectedCountry} onChange={(e) => setSelectedExam(exams.find(ex => ex.id === e.target.value))} style={{ width: '100%', padding: '18px', background: '#1e293b', color: '#f8fafc', border: '2px solid #475569', borderRadius: '12px', fontSize: '1.2rem', outline: 'none', cursor: selectedCountry ? 'pointer' : 'not-allowed' }}>
            <option value="">-- SELECT TARGET EXAM --</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.examName} ({e.totalDurationMinutes} Mins)</option>)}
          </select>
        </div>

      </div>

      {selectedExam && (
        <div style={{ marginTop: '60px', textAlign: 'center', animation: 'fadeIn 0.5s ease-in' }}>
          
          <div style={{ background: '#1e293b', display: 'inline-block', padding: '30px 50px', borderRadius: '20px', border: '1px solid #38bdf8', marginBottom: '40px', boxShadow: '0 0 40px rgba(56, 189, 248, 0.15)' }}>
              <h3 style={{ color: '#f8fafc', margin: '0 0 20px 0', fontSize: '1.8rem' }}>{selectedExam.examName} Blueprint</h3>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {selectedExam.sections.map((s, i) => (
                      <div key={i} style={{ background: '#0f172a', padding: '15px 25px', borderRadius: '12px', border: '1px solid #475569' }}>
                          <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '1.2rem' }}>{s.sectionName}</div>
                          <div style={{ color: '#94a3b8', marginTop: '5px' }}>{s.questionCount} Questions • {s.marksPerQuestion} Marks/Q</div>
                      </div>
                  ))}
              </div>
              <div style={{ color: '#ef4444', marginTop: '25px', fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                ⚠️ PENALTY RULE: -{selectedExam.negativeMarkingFactor * 100}% marks per incorrect answer.
              </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <button onClick={handlePrintWorksheet} style={{ padding: '20px 40px', background: 'transparent', color: '#38bdf8', border: '2px solid #38bdf8', borderRadius: '50px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
              📄 GENERATE MOCK PAPER
            </button>

            <button onClick={handleStartSimulation} style={{ padding: '20px 50px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '50px', fontSize: '1.3rem', fontWeight: '900', cursor: 'pointer', boxShadow: '0 0 30px rgba(56, 189, 248, 0.5)', transition: '0.2s', letterSpacing: '1px' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              INITIALIZE SIMULATION 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}