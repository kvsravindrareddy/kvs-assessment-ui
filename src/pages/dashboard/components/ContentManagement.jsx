import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getConfig } from '../../../Config';
import axios from 'axios';
import './ContentManagement.css';

const ContentManagement = () => {
  const { user } = useAuth();
  const config = getConfig();
  const fileInputRef = useRef(null);

  const [activeSubTab, setActiveSubTab] = useState('load-questions');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // --- DYNAMIC GRADES & SUBJECTS STATE ---
  const [grades, setGrades] = useState([]);

  // Worksheet form state
  const [worksheetForm, setWorksheetForm] = useState({ grade: '', subject: '', topic: '', difficulty: 'MEDIUM', count: 20, randomize: true });
  const [worksheetQueryType, setWorksheetQueryType] = useState('by-grade');
  const [loadedWorksheetQuestions, setLoadedWorksheetQuestions] = useState([]);
  const [worksheetResponseTime, setWorksheetResponseTime] = useState(null);

  // Questions & Stories form state
  const [questionForm, setQuestionForm] = useState({ complexity: 'MEDIUM', type: '', answerType: 'SINGLE', category: '', source: 'CHATGPT', numberOfQuestions: 10 });
  const [storyForm, setStoryForm] = useState({ numberOfStories: 10, category: '', storyType: '', storyLength: 'MEDIUM' });

  // 🚀 ADVANCED TEMPLATE INJECTOR STATE
  const [templateForm, setTemplateForm] = useState({
    targetSystem: 'QUESTIONS', // QUESTIONS, STORIES
    payload: '[\n  \n]'
  });
  const [jsonError, setJsonError] = useState(null);

  const [statistics, setStatistics] = useState({ totalQuestions: 0, totalStories: 0, loading: true });

  const loadStatistics = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [questionsRes, storiesRes] = await Promise.all([
        axios.get(`${config.ADMIN_BASE_URL}/admin-assessment/v1/assessment/listallquestions`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${config.ADMIN_BASE_URL}/admin-assessment/v1/assessment/listAllStories`, { headers }).catch(() => ({ data: [] }))
      ]);
      setStatistics({ totalQuestions: questionsRes.data?.length || 0, totalStories: storiesRes.data?.length || 0, loading: false });
    } catch (error) {
      setStatistics(prev => ({ ...prev, loading: false }));
    }
  }, [config.ADMIN_BASE_URL]);

  useEffect(() => { loadStatistics(); loadGradesAndSubjects(); }, [loadStatistics]);

  const loadGradesAndSubjects = async () => {
    try {
      const response = await axios.get(`${config.GATEWAY_URL || config.ADMIN_BASE_URL}/admin-assessment/v1/grade-subjects`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const activeGrades = (response.data || []).filter(g => g.isActive).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setGrades(activeGrades);
      if (activeGrades.length > 0) {
        const firstGrade = activeGrades[0];
        const defaultSubject = firstGrade.subjects?.length > 0 ? firstGrade.subjects[0].subjectName : '';
        setQuestionForm(prev => ({ ...prev, category: firstGrade.gradeCode, type: defaultSubject }));
        setStoryForm(prev => ({ ...prev, category: firstGrade.gradeCode, storyType: defaultSubject }));
        setWorksheetForm(prev => ({ ...prev, grade: firstGrade.gradeCode, subject: defaultSubject }));
      }
    } catch (error) {}
  };

  const handleQuestionGradeChange = (e) => {
    const selectedGradeCode = e.target.value;
    const defaultSubject = grades.find(g => g.gradeCode === selectedGradeCode)?.subjects?.[0]?.subjectName || '';
    setQuestionForm({ ...questionForm, category: selectedGradeCode, type: defaultSubject });
  };

  const handleStoryGradeChange = (e) => {
    const selectedGradeCode = e.target.value;
    const defaultSubject = grades.find(g => g.gradeCode === selectedGradeCode)?.subjects?.[0]?.subjectName || '';
    setStoryForm({ ...storyForm, category: selectedGradeCode, storyType: defaultSubject });
  };

  const handleWorksheetGradeChange = (e) => {
    const selectedGradeCode = e.target.value;
    const defaultSubject = grades.find(g => g.gradeCode === selectedGradeCode)?.subjects?.[0]?.subjectName || '';
    setWorksheetForm({ ...worksheetForm, grade: selectedGradeCode, subject: defaultSubject });
  };

  const getSubjectsForGrade = (gradeCode) => grades.find(g => g.gradeCode === gradeCode)?.subjects || [];
  const handleNavigateToWorksheets = () => window.location.href = '/admin/content-library/worksheets';

  const handleLoadWorksheetQuestions = async (e) => {
    e.preventDefault();
    if (worksheetQueryType !== 'by-grade' && !worksheetForm.subject) {
        setMessage({ type: 'error', text: 'Please assign and select a subject for this grade first.' });
        return;
    }

    setLoading(true); setMessage(null); setLoadedWorksheetQuestions([]); setWorksheetResponseTime(null);
    const startTime = Date.now();

    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      let endpoint = '';
      let payload = { grade: worksheetForm.grade, count: worksheetForm.count, randomize: worksheetForm.randomize, difficulty: worksheetForm.difficulty };

      if (worksheetQueryType === 'by-topic' && worksheetForm.topic) {
        endpoint = `${config.ADMIN_BASE_URL}/admin-assessment/v1/content-library/worksheets/load-by-topic`;
        payload.topic = worksheetForm.topic; payload.subject = worksheetForm.subject;
      } else if (worksheetQueryType === 'by-subject') {
        endpoint = `${config.ADMIN_BASE_URL}/admin-assessment/v1/content-library/worksheets/load-by-subject`;
        payload.subject = worksheetForm.subject;
      } else {
        endpoint = `${config.ADMIN_BASE_URL}/admin-assessment/v1/content-library/worksheets/load-by-grade`;
      }

      const response = await axios.post(endpoint, payload, { headers });
      const data = response.data;
      const clientResponseTime = Date.now() - startTime;

      if (data.success && data.questions) {
        setLoadedWorksheetQuestions(data.questions);
        setWorksheetResponseTime({ server: data.responseTimeMs, client: clientResponseTime, total: clientResponseTime });
        setMessage({ type: 'success', text: `✅ ${data.message} | Server: ${data.responseTimeMs}ms | Total: ${clientResponseTime}ms | Type: ${data.worksheetType}` });
      } else {
        setMessage({ type: 'warning', text: `⚠️ No questions found for this combination.` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load worksheet questions.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadQuestions = async (e) => {
    e.preventDefault();
    if (!questionForm.type) return setMessage({ type: 'error', text: 'Assign a Subject to this Grade first.' });
    setLoading(true); setMessage(null);
    try {
      const payload = { ...questionForm, expectedResponseStructure: [{ category: questionForm.category, complexity: questionForm.complexity, type: questionForm.type, isActive: true, question: { name: "Sample question", options: { A: "A", B: "B" } }, answer: { type: questionForm.answerType, values: ["A"] } }] };
      await axios.post(`${config.ADMIN_BASE_URL}/admin-assessment/v1/assessment/loadquestions`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setMessage({ type: 'success', text: `Loaded ${questionForm.numberOfQuestions} questions!` });
      setTimeout(() => loadStatistics(), 1000);
    } catch (error) { setMessage({ type: 'error', text: 'Failed to load questions.' }); } finally { setLoading(false); }
  };

  const handleLoadStories = async (e) => {
    e.preventDefault();
    if (!storyForm.storyType) return setMessage({ type: 'error', text: 'Assign a Subject to this Grade first.' });
    setLoading(true); setMessage(null);
    try {
      const payload = { numberOfStories: storyForm.numberOfStories, loadAssessmentStoryRequest: { isActive: true, title: "Sample", storyLength: storyForm.storyLength, category: storyForm.category, storyType: storyForm.storyType, content: "Content...", source: "CHATGPT", howManyQuestions: "MCQ", questions: [], audit: { createdBy: "admin", updatedBy: "admin" } } };
      await axios.post(`${config.ADMIN_BASE_URL}/admin-assessment/v1/assessment/loadstories`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setMessage({ type: 'success', text: `Loaded ${storyForm.numberOfStories} stories!` });
      setTimeout(() => loadStatistics(), 1000);
    } catch (error) { setMessage({ type: 'error', text: 'Failed to load stories.' }); } finally { setLoading(false); }
  };

  // ==========================================
  // 🚀 DYNAMIC BULK TEMPLATE INJECTOR LOGIC
  // ==========================================
  
  const handleLoadSampleTemplate = async () => {
    setLoading(true);
    setJsonError(null);
    try {
      const token = localStorage.getItem('token');
      // Fetches the exact mapping schema direct from the Java backend!
      const response = await axios.get(
        `${config.ADMIN_BASE_URL}/admin-assessment/v1/advanced-import/template?type=${templateForm.targetSystem}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTemplateForm({ 
        ...templateForm, 
        payload: JSON.stringify(response.data, null, 2) 
      });
      setMessage({ type: 'success', text: `✅ Loaded dynamic template directly from the backend schema!` });
    } catch (error) {
      setJsonError("Failed to fetch template from the backend.");
      setMessage({ type: 'error', text: "Template retrieval failed." });
    } finally {
      setLoading(false);
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(templateForm.payload);
      setTemplateForm({ ...templateForm, payload: JSON.stringify(parsed, null, 2) });
      setJsonError(null);
    } catch (e) {
      setJsonError("Invalid JSON format. Check for missing commas or quotes.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!Array.isArray(parsed)) throw new Error("JSON file must contain an Array [...] at the root level.");
        
        setTemplateForm({ ...templateForm, payload: JSON.stringify(parsed, null, 2) });
        setJsonError(null);
        setMessage({ type: 'success', text: `✅ File "${file.name}" parsed and ready for injection.` });
      } catch (err) {
        setJsonError(`File Error: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteInjection = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(null); setJsonError(null);

    let parsedPayload;
    try {
      parsedPayload = JSON.parse(templateForm.payload);
      if (!Array.isArray(parsedPayload)) throw new Error("Payload must be a JSON Array.");
    } catch (e) {
      setJsonError(`Syntax Error: ${e.message}`);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // Routes to the NEW backend bulk import endpoint
      const endpoint = `${config.ADMIN_BASE_URL}/admin-assessment/v1/advanced-import/json-payload?type=${templateForm.targetSystem}`;

      const response = await axios.post(endpoint, templateForm.payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      setMessage({ type: 'success', text: `✅ SUCCESS: ${response.data.message}` });
      setTimeout(() => loadStatistics(), 1500); 
      setTemplateForm({...templateForm, payload: '[\n  \n]'}); 
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Data Injection failed. Ensure JSON strictly matches the target schema.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-management">
      <h3 className="section-title"><span className="title-icon">📝</span> Content Management</h3>

      <div className="content-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#667eea20', color: '#667eea' }}>📝</div>
          <div className="stat-info">
            <div className="stat-value">{statistics.loading ? '...' : statistics.totalQuestions}</div>
            <div className="stat-label">Total Questions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#48bb7820', color: '#48bb78' }}>📚</div>
          <div className="stat-info">
            <div className="stat-value">{statistics.loading ? '...' : statistics.totalStories}</div>
            <div className="stat-label">Total Stories</div>
          </div>
        </div>
        <div className="stat-card" onClick={handleNavigateToWorksheets} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>📄</div>
          <div className="stat-info">
            <div className="stat-value">NEW</div>
            <div className="stat-label">Worksheets</div>
          </div>
        </div>
      </div>

      <div className="content-sub-tabs">
        <button className={`content-sub-tab ${activeSubTab === 'load-questions' ? 'active' : ''}`} onClick={() => setActiveSubTab('load-questions')}>
          <span className="tab-icon">📝</span> Auto AI Questions
        </button>
        <button className={`content-sub-tab ${activeSubTab === 'load-stories' ? 'active' : ''}`} onClick={() => setActiveSubTab('load-stories')}>
          <span className="tab-icon">📚</span> Auto AI Stories
        </button>
        <button className={`content-sub-tab ${activeSubTab === 'load-worksheets' ? 'active' : ''}`} onClick={() => setActiveSubTab('load-worksheets')}>
          <span className="tab-icon">📄</span> Worksheet Gen
        </button>
        <button 
          className={`content-sub-tab ${activeSubTab === 'advanced-template' ? 'active' : ''}`} 
          onClick={() => setActiveSubTab('advanced-template')}
          style={{ background: activeSubTab === 'advanced-template' ? '#0f172a' : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#38bdf8', border: '1px solid #38bdf8' }}
        >
          <span className="tab-icon">📥</span> Bulk JSON Injector
        </button>
      </div>

      {message && (
        <div className={`content-message ${message.type}`}>
          <span className="message-icon">{message.type === 'success' ? '✓' : '⚠'}</span>
          {message.text}
        </div>
      )}

      <div className="content-tab-body">
        
        {/* --- LOAD QUESTIONS TAB --- */}
        {activeSubTab === 'load-questions' && (
          <div className="content-form-container">
            <div className="form-header"><h4>Load Questions from AI</h4><p className="form-description">Generate questions using AI. This may take 30-60 seconds.</p></div>
            <form onSubmit={handleLoadQuestions}>
              <div className="form-grid">
                <div className="form-group"><label>Category/Grade: *</label><select value={questionForm.category} onChange={handleQuestionGradeChange} required><option value="" disabled>Select Grade</option>{grades.map(g => <option key={g.gradeCode} value={g.gradeCode}>{g.gradeName}</option>)}</select></div>
                <div className="form-group"><label>Subject Type: *</label><select value={questionForm.type} onChange={(e) => setQuestionForm({...questionForm, type: e.target.value})} required disabled={getSubjectsForGrade(questionForm.category).length === 0}>{getSubjectsForGrade(questionForm.category).map(sub => <option key={sub.subjectName} value={sub.subjectName}>{sub.subjectName.replace(/_/g, ' ')}</option>)}</select></div>
                <div className="form-group"><label>Complexity:</label><select value={questionForm.complexity} onChange={(e) => setQuestionForm({...questionForm, complexity: e.target.value})} required><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select></div>
                <div className="form-group"><label>Answer Type:</label><select value={questionForm.answerType} onChange={(e) => setQuestionForm({...questionForm, answerType: e.target.value})} required><option value="SINGLE">Single Choice</option><option value="MULTIPLE">Multiple Choice</option></select></div>
                <div className="form-group"><label>Quantity:</label><input type="number" min="1" max="50" value={questionForm.numberOfQuestions} onChange={(e) => setQuestionForm({...questionForm, numberOfQuestions: parseInt(e.target.value)})} required /></div>
              </div>
              <button type="submit" className="submit-button" disabled={loading || !questionForm.type}>{loading ? 'Loading...' : 'Load AI Questions'}</button>
            </form>
          </div>
        )}

        {/* --- LOAD STORIES TAB --- */}
        {activeSubTab === 'load-stories' && (
          <div className="content-form-container">
            <div className="form-header"><h4>Load AI Stories</h4><p className="form-description">Generate reading comprehension stories with questions.</p></div>
            <form onSubmit={handleLoadStories}>
              <div className="form-grid">
                <div className="form-group"><label>Grade Level: *</label><select value={storyForm.category} onChange={handleStoryGradeChange} required><option value="" disabled>Select Grade</option>{grades.map(g => <option key={g.gradeCode} value={g.gradeCode}>{g.gradeName}</option>)}</select></div>
                <div className="form-group"><label>Story Type: *</label><select value={storyForm.storyType} onChange={(e) => setStoryForm({...storyForm, storyType: e.target.value})} required disabled={getSubjectsForGrade(storyForm.category).length === 0}>{getSubjectsForGrade(storyForm.category).map(sub => <option key={sub.subjectName} value={sub.subjectName}>{sub.subjectName.replace(/_/g, ' ')}</option>)}</select></div>
                <div className="form-group"><label>Quantity:</label><input type="number" min="1" max="20" value={storyForm.numberOfStories} onChange={(e) => setStoryForm({...storyForm, numberOfStories: parseInt(e.target.value)})} required /></div>
                <div className="form-group"><label>Length:</label><select value={storyForm.storyLength} onChange={(e) => setStoryForm({...storyForm, storyLength: e.target.value})} required><option value="SHORT">Short</option><option value="MEDIUM">Medium</option><option value="LONG">Long</option></select></div>
              </div>
              <button type="submit" className="submit-button" disabled={loading || !storyForm.storyType}>{loading ? 'Loading...' : 'Load AI Stories'}</button>
            </form>
          </div>
        )}

        {/* --- LOAD WORKSHEETS TAB --- */}
        {activeSubTab === 'load-worksheets' && (
          <div className="content-form-container">
            <div className="form-header"><h4>⚡ High-Performance Worksheet Generator</h4></div>
            <form onSubmit={handleLoadWorksheetQuestions}>
                <div className="form-grid">
                  <div className="form-group"><label>Grade: *</label><select value={worksheetForm.grade} onChange={handleWorksheetGradeChange} required><option value="" disabled>Select Grade</option>{grades.map(g => <option key={g.gradeCode} value={g.gradeCode}>{g.gradeName}</option>)}</select></div>
                  <div className="form-group"><label>Difficulty: *</label><select value={worksheetForm.difficulty} onChange={(e) => setWorksheetForm({...worksheetForm, difficulty: e.target.value})} required><option value="EASY">Easy</option><option value="MEDIUM">Medium</option></select></div>
                  <div className="form-group"><label>Quantity:</label><input type="number" min="5" max="100" value={worksheetForm.count} onChange={(e) => setWorksheetForm({...worksheetForm, count: parseInt(e.target.value)})} required /></div>
                </div>
                <button type="submit" className="submit-button" disabled={loading}>{loading ? 'Loading...' : 'Load Questions'}</button>
            </form>
          </div>
        )}

        {/* ================================================== */}
        {/* 🚀 BULK TEMPLATE INJECTOR TAB */}
        {/* ================================================== */}
        {activeSubTab === 'advanced-template' && (
          <div className="content-form-container" style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f8fafc', padding: '30px' }}>
            <div className="form-header" style={{ borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '25px' }}>
              <h4 style={{ color: '#38bdf8', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                ⚡ Dynamic Bulk JSON Injector
              </h4>
              <p style={{ color: '#94a3b8' }}>Load the exact Java schema, prompt ChatGPT, and paste the results back here to bypass AI limits.</p>
            </div>

            <form onSubmit={handleExecuteInjection}>
              
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
                    1. Select Target Database:
                  </label>
                  <select 
                    value={templateForm.targetSystem} 
                    onChange={(e) => {
                      setTemplateForm({...templateForm, targetSystem: e.target.value, payload: '[\n  \n]'});
                      setJsonError(null);
                    }}
                    style={{ width: '100%', padding: '14px', backgroundColor: '#1e293b', border: '1px solid #475569', color: '#38bdf8', borderRadius: '8px', outline: 'none', fontSize: '1.1rem', fontWeight: 'bold' }}
                  >
                    <option value="QUESTIONS">QUESTIONS DB (QuestionsMetadata Array)</option>
                    <option value="STORIES">STORIES DB (AssessmentStoryDocument Array)</option>
                  </select>
                </div>

                <div style={{ flex: 1, minWidth: '300px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
                    2. Upload .json File (Optional):
                  </label>
                  <div 
                    style={{ position: 'relative', width: '100%', padding: '12px', backgroundColor: '#1e293b', border: '2px dashed #38bdf8', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', transition: '0.3s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                  >
                    <input 
                      type="file" 
                      accept=".json"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    />
                    <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>📥 Click or Drop .json Array File Here</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#cbd5e1', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
                    3. Review JSON Payload Array [ ... ] :
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="button" 
                      onClick={handleLoadSampleTemplate}
                      style={{ background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      📄 Load Sample Template
                    </button>
                    <button 
                      type="button" 
                      onClick={handleFormatJson}
                      style={{ background: '#334155', color: '#e2e8f0', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}
                    >
                      {'{ }'} Auto-Format JSON
                    </button>
                  </div>
                </div>
                
                <textarea 
                  value={templateForm.payload}
                  onChange={(e) => {
                    setTemplateForm({...templateForm, payload: e.target.value});
                    setJsonError(null);
                  }}
                  spellCheck="false"
                  placeholder="[\n  { \n    ...your objects here... \n  }\n]"
                  style={{ 
                    width: '100%', 
                    height: '400px', 
                    backgroundColor: '#020617', 
                    border: jsonError ? '2px solid #ef4444' : '1px solid #334155', 
                    color: '#34d399', 
                    padding: '20px', 
                    borderRadius: '12px', 
                    fontFamily: '"Fira Code", "Courier New", Courier, monospace',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    resize: 'vertical',
                    outline: 'none',
                    boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5)'
                  }}
                />
                {jsonError && (
                  <div style={{ color: '#fca5a5', fontSize: '0.95rem', marginTop: '10px', fontWeight: 'bold', padding: '12px', backgroundColor: '#7f1d1d', borderRadius: '6px', borderLeft: '4px solid #ef4444' }}>
                    {jsonError}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading || jsonError || !templateForm.payload || templateForm.payload.trim().length < 5} 
                style={{ 
                  width: '100%', 
                  padding: '20px', 
                  background: loading ? '#475569' : 'linear-gradient(90deg, #0ea5e9 0%, #3b82f6 100%)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontWeight: '900', 
                  fontSize: '1.2rem',
                  cursor: loading || jsonError ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '3px',
                  boxShadow: loading ? 'none' : '0 8px 25px rgba(14, 165, 233, 0.4)',
                  transition: '0.3s'
                }}
              >
                {loading ? 'Injecting Data into Core...' : '⚡ Execute Bulk Injection ⚡'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManagement;