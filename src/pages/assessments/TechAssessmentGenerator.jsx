import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getConfig } from '../../../Config'; // adjust path as needed

export default function TechAssessmentGenerator() {
  const config = getConfig();
  
  // 🚀 State to hold ONLY technologies
  const [techSubjects, setTechSubjects] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechnologiesOnly = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = config.GATEWAY_URL || config.ADMIN_BASE_URL;
        
        // 🚀 1. Call the Global Pool API directly (Bypassing Grades entirely!)
        const response = await axios.get(`${baseUrl}/admin-assessment/v1/grade-subjects/pool`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // 🚀 2. Filter the pool to extract ONLY subjects flagged as Technology
        const technologies = (response.data || []).filter(sub => sub.isTechnology || sub.technology);
        
        setTechSubjects(technologies);
      } catch (error) {
        console.error("Failed to load technologies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTechnologiesOnly();
  }, [config.ADMIN_BASE_URL, config.GATEWAY_URL]);

  return (
    <div style={{ padding: '20px', background: '#0f172a', color: '#f8fafc', borderRadius: '12px' }}>
      <h2 style={{ color: '#38bdf8' }}>💻 Select Technology</h2>
      
      {loading ? (
        <p style={{ color: '#94a3b8' }}>Loading Global Tech Matrix...</p>
      ) : (
        <div style={{ marginTop: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontWeight: 'bold' }}>
            Programming Language / Framework:
          </label>
          
          {/* 🚀 3. The Pure Technology Dropdown */}
          <select 
            value={selectedTech} 
            onChange={(e) => setSelectedTech(e.target.value)}
            style={{ 
              width: '100%', 
              maxWidth: '400px',
              padding: '12px', 
              backgroundColor: '#1e293b', 
              color: '#34d399', 
              border: '1px solid #334155', 
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              outline: 'none'
            }}
          >
            <option value="">-- Select Technology --</option>
            
            {techSubjects.map(tech => (
              <option key={tech.subjectName} value={tech.subjectName}>
                {tech.subjectName.replace(/_/g, ' ')}
              </option>
            ))}
            
          </select>

          {/* Verification display to prove it works */}
          {selectedTech && (
            <div style={{ marginTop: '20px', padding: '15px', background: '#020617', borderLeft: '4px solid #34d399', borderRadius: '4px' }}>
              Selected Tech Core: <strong style={{ color: '#34d399' }}>{selectedTech}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}