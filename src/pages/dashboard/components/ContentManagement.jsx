import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getConfig } from '../../../Config';
import axios from 'axios';
import './ContentManagement.css';

const ContentManagement = () => {
  const { user } = useAuth();
  const config = getConfig();

  const [activeSubTab, setActiveSubTab] = useState('load-questions');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // --- DYNAMIC GRADES & SUBJECTS STATE ---
  const [grades, setGrades] = useState([]);

  // Worksheet form state
  const [worksheetForm, setWorksheetForm] = useState({
    grade: '', 
    subject: '',
    topic: '',
    difficulty: 'MEDIUM',
    count: 20,
    randomize: true
  });

  const [worksheetQueryType, setWorksheetQueryType] = useState('by-grade');
  const [loadedWorksheetQuestions, setLoadedWorksheetQuestions] = useState([]);
  const [worksheetResponseTime, setWorksheetResponseTime] = useState(null);

  // Questions form state
  const [questionForm, setQuestionForm] = useState({
    complexity: 'MEDIUM',
    type: '', // Dynamic Subject
    answerType: 'SINGLE',
    category: '', // Dynamic Grade
    source: 'CHATGPT',
    numberOfQuestions: 10
  });

  // Stories form state
  const [storyForm, setStoryForm] = useState({
    numberOfStories: 10,
    category: '', // Dynamic Grade
    storyType: '', // Dynamic Subject
    storyLength: 'MEDIUM'
  });

  const [statistics, setStatistics] = useState({
    totalQuestions: 0,
    totalStories: 0,
    loading: true
  });

  const loadStatistics = useCallback(async () => {
    try {
      const [questionsRes, storiesRes] = await Promise.all([
        axios.get(`${config.ADMIN_BASE_URL}/admin-assessment/v1/assessment/listallquestions`),
        axios.get(`${config.ADMIN_BASE_URL}/admin-assessment/v1/assessment/listAllStories`)
      ]);

      setStatistics({
        totalQuestions: questionsRes.data?.length || 0,
        totalStories: storiesRes.data?.length || 0,
        loading: false
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
      setStatistics(prev => ({ ...prev, loading: false }));
    }
  }, [config.ADMIN_BASE_URL]);

  useEffect(() => {
    loadStatistics();
    loadGradesAndSubjects();
  }, [loadStatistics]);

  // --- FIX: Use the /grade-subjects endpoint to get Grades + Nested Subjects ---
  const loadGradesAndSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = config.GATEWAY_URL || config.ADMIN_BASE_URL;
      
      const response = await axios.get(
        `${baseUrl}/admin-assessment/v1/grade-subjects`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const activeGrades = (response.data || [])
        .filter(g => g.isActive)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

      setGrades(activeGrades);

      // Auto-select defaults if grades exist
      if (activeGrades.length > 0) {
        const firstGrade = activeGrades[0];
        const defaultSubject = firstGrade.subjects?.length > 0 ? firstGrade.subjects[0].subjectName : '';

        setQuestionForm(prev => ({ ...prev, category: firstGrade.gradeCode, type: defaultSubject }));
        setStoryForm(prev => ({ ...prev, category: firstGrade.gradeCode, storyType: defaultSubject }));
        setWorksheetForm(prev => ({ ...prev, grade: firstGrade.gradeCode, subject: defaultSubject }));
      }
    } catch (error) {
      console.error('Error loading grades and subjects:', error);
    }
  };

  // --- CASCADING DROPDOWN HANDLERS ---
  const handleQuestionGradeChange = (e) => {
    const selectedGradeCode = e.target.value;
    const selectedGrade = grades.find(g => g.gradeCode === selectedGradeCode);
    const defaultSubject = selectedGrade?.subjects?.length > 0 ? selectedGrade.subjects[0].subjectName : '';
    
    setQuestionForm({
      ...questionForm,
      category: selectedGradeCode,
      type: defaultSubject
    });
  };

  const handleStoryGradeChange = (e) => {
    const selectedGradeCode = e.target.value;
    const selectedGrade = grades.find(g => g.gradeCode === selectedGradeCode);
    const defaultSubject = selectedGrade?.subjects?.length > 0 ? selectedGrade.subjects[0].subjectName : '';

    setStoryForm({
      ...storyForm,
      category: selectedGradeCode,
      storyType: defaultSubject
    });
  };

  const handleWorksheetGradeChange = (e) => {
    const selectedGradeCode = e.target.value;
    const selectedGrade = grades.find(g => g.gradeCode === selectedGradeCode);
    const defaultSubject = selectedGrade?.subjects?.length > 0 ? selectedGrade.subjects[0].subjectName : '';

    setWorksheetForm({
      ...worksheetForm,
      grade: selectedGradeCode,
      subject: defaultSubject
    });
  };

  const getSubjectsForGrade = (gradeCode) => {
    return grades.find(g => g.gradeCode === gradeCode)?.subjects || [];
  };

  const handleNavigateToWorksheets = () => {
    window.location.href = '/admin/content-library/worksheets';
  };

  const handleLoadWorksheetQuestions = async (e) => {
    e.preventDefault();
    
    if (worksheetQueryType !== 'by-grade' && !worksheetForm.subject) {
        setMessage({ type: 'error', text: 'Please assign and select a subject for this grade first.' });
        return;
    }

    setLoading(true);
    setMessage(null);
    setLoadedWorksheetQuestions([]);
    setWorksheetResponseTime(null);

    const startTime = Date.now();

    try {
      let endpoint = '';
      let payload = {
        grade: worksheetForm.grade,
        count: worksheetForm.count,
        randomize: worksheetForm.randomize,
        difficulty: worksheetForm.difficulty
      };

      if (worksheetQueryType === 'by-topic' && worksheetForm.topic) {
        endpoint = `${config.ADMIN_BASE_URL}/admin-assessment/v1/content-library/worksheets/load-by-topic`;
        payload.topic = worksheetForm.topic;
        payload.subject = worksheetForm.subject;
      } else if (worksheetQueryType === 'by-subject') {
        endpoint = `${config.ADMIN_BASE_URL}/admin-assessment/v1/content-library/worksheets/load-by-subject`;
        payload.subject = worksheetForm.subject;
      } else {
        endpoint = `${config.ADMIN_BASE_URL}/admin-assessment/v1/content-library/worksheets/load-by-grade`;
      }

      const response = await axios.post(endpoint, payload);
      const data = response.data;
      const clientResponseTime = Date.now() - startTime;

      if (data.success && data.questions) {
        setLoadedWorksheetQuestions(data.questions);
        setWorksheetResponseTime({
          server: data.responseTimeMs,
          client: clientResponseTime,
          total: clientResponseTime
        });
        setMessage({
          type: 'success',
          text: `✅ ${data.message} | Server: ${data.responseTimeMs}ms | Total: ${clientResponseTime}ms | Type: ${data.worksheetType}`
        });
      } else {
        setMessage({
          type: 'warning',
          text: `⚠️ No questions found for this combination. Please load more content using "Load Questions" or "Load Stories" tabs first.`
        });
      }
    } catch (error) {
      console.error('Error loading worksheet questions:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load worksheet questions. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadQuestions = async (e) => {
    e.preventDefault();
    if (!questionForm.type) {
      setMessage({ type: 'error', text: 'Please assign a valid Subject to this Grade first.' });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        ...questionForm,
        expectedResponseStructure: [
          {
            category: questionForm.category,
            complexity: questionForm.complexity,
            type: questionForm.type,
            isActive: true,
            question: {
              name: "Sample question dynamically generated",
              options: { A: "Option A", B: "Option B", C: "Option C", D: "Option D" }
            },
            answer: { type: questionForm.answerType, values: ["A"] }
          }
        ]
      };

      await axios.post(`${config.ADMIN_BASE_URL}/admin-assessment/v1/assessment/loadquestions`, payload);

      setMessage({ type: 'success', text: `Successfully loaded ${questionForm.numberOfQuestions} questions!` });
      setTimeout(() => loadStatistics(), 1000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load questions.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadStories = async (e) => {
    e.preventDefault();
    if (!storyForm.storyType) {
      setMessage({ type: 'error', text: 'Please assign a valid Subject to this Grade first.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        numberOfStories: storyForm.numberOfStories,
        loadAssessmentStoryRequest: {
          isActive: true,
          title: "Sample Story Title",
          storyLength: storyForm.storyLength,
          category: storyForm.category,
          storyType: storyForm.storyType,
          content: "Story content generated dynamically...",
          source: "CHATGPT",
          howManyQuestions: "MCQ",
          questions: [],
          audit: { createdBy: user?.username || "admin", updatedBy: user?.username || "admin" }
        }
      };

      await axios.post(`${config.ADMIN_BASE_URL}/admin-assessment/v1/assessment/loadstories`, payload);

      setMessage({ type: 'success', text: `Successfully loaded ${storyForm.numberOfStories} stories!` });
      setTimeout(() => loadStatistics(), 1000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load stories.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-management">
      <h3 className="section-title">
        <span className="title-icon">📝</span>
        Content Management
      </h3>

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
        <button
          className={`content-sub-tab ${activeSubTab === 'load-questions' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('load-questions')}
        >
          <span className="tab-icon">📝</span> Load Questions
        </button>
        <button
          className={`content-sub-tab ${activeSubTab === 'load-stories' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('load-stories')}
        >
          <span className="tab-icon">📚</span> Load Stories
        </button>
        <button
          className={`content-sub-tab ${activeSubTab === 'load-worksheets' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('load-worksheets')}
          style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', border: 'none' }}
        >
          <span className="tab-icon">⚡</span> Load Worksheets
          <span style={{ marginLeft: '8px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.3)', padding: '2px 6px', borderRadius: '10px' }}>NEW</span>
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
            <div className="form-header">
              <h4>Load Questions from AI</h4>
              <p className="form-description">Generate questions using AI. This may take 30-60 seconds.</p>
            </div>

            <form onSubmit={handleLoadQuestions}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Category/Grade: *</label>
                  <select value={questionForm.category} onChange={handleQuestionGradeChange} required>
                    <option value="" disabled>Select Grade</option>
                    {grades.map(g => (
                      <option key={g.gradeCode} value={g.gradeCode}>{g.gradeName} ({g.gradeCode})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Subject Type: *</label>
                  <select 
                    value={questionForm.type} 
                    onChange={(e) => setQuestionForm({...questionForm, type: e.target.value})} 
                    required
                    disabled={getSubjectsForGrade(questionForm.category).length === 0}
                  >
                    {getSubjectsForGrade(questionForm.category).length === 0 ? (
                      <option value="">No subjects assigned to this grade</option>
                    ) : (
                      getSubjectsForGrade(questionForm.category).map(sub => (
                        <option key={sub.id || sub.subjectName} value={sub.subjectName}>{sub.subjectName.replace(/_/g, ' ')}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>Complexity Level:</label>
                  <select value={questionForm.complexity} onChange={(e) => setQuestionForm({...questionForm, complexity: e.target.value})} required>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Answer Type:</label>
                  <select value={questionForm.answerType} onChange={(e) => setQuestionForm({...questionForm, answerType: e.target.value})} required>
                    <option value="SINGLE">Single Choice</option>
                    <option value="MULTIPLE">Multiple Choice</option>
                    <option value="TEXT">Text Answer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Number of Questions:</label>
                  <input type="number" min="1" max="50" value={questionForm.numberOfQuestions} onChange={(e) => setQuestionForm({...questionForm, numberOfQuestions: parseInt(e.target.value)})} required />
                </div>

                <div className="form-group">
                  <label>Source:</label>
                  <select value={questionForm.source} onChange={(e) => setQuestionForm({...questionForm, source: e.target.value})} required>
                    <option value="CHATGPT">ChatGPT</option>
                    <option value="GOOGLE">Google Gemini</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="submit-button" disabled={loading || !questionForm.type}>
                {loading ? <><span className="spinner"></span> Loading Questions...</> : <><span className="button-icon">🚀</span> Load Questions</>}
              </button>
            </form>
          </div>
        )}

        {/* --- LOAD STORIES TAB --- */}
        {activeSubTab === 'load-stories' && (
          <div className="content-form-container">
            <div className="form-header">
              <h4>Load Reading Comprehension Stories</h4>
              <p className="form-description">Generate reading stories with comprehension questions. This may take 60-90 seconds.</p>
            </div>

            <form onSubmit={handleLoadStories}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Grade Level: *</label>
                  <select value={storyForm.category} onChange={handleStoryGradeChange} required>
                    <option value="" disabled>Select Grade</option>
                    {grades.map(g => (
                      <option key={g.gradeCode} value={g.gradeCode}>{g.gradeName} ({g.gradeCode})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Story Type (Subject): *</label>
                  <select 
                    value={storyForm.storyType} 
                    onChange={(e) => setStoryForm({...storyForm, storyType: e.target.value})} 
                    required
                    disabled={getSubjectsForGrade(storyForm.category).length === 0}
                  >
                    {getSubjectsForGrade(storyForm.category).length === 0 ? (
                      <option value="">No subjects assigned to this grade</option>
                    ) : (
                      getSubjectsForGrade(storyForm.category).map(sub => (
                        <option key={sub.id || sub.subjectName} value={sub.subjectName}>{sub.subjectName.replace(/_/g, ' ')}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>Number of Stories:</label>
                  <input type="number" min="1" max="20" value={storyForm.numberOfStories} onChange={(e) => setStoryForm({...storyForm, numberOfStories: parseInt(e.target.value)})} required />
                </div>

                <div className="form-group">
                  <label>Story Length:</label>
                  <select value={storyForm.storyLength} onChange={(e) => setStoryForm({...storyForm, storyLength: e.target.value})} required>
                    <option value="SHORT">Short</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LONG">Long</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="submit-button" disabled={loading || !storyForm.storyType}>
                {loading ? <><span className="spinner"></span> Loading Stories...</> : <><span className="button-icon">🚀</span> Load Stories</>}
              </button>
            </form>
          </div>
        )}

        {/* --- LOAD WORKSHEETS TAB --- */}
        {activeSubTab === 'load-worksheets' && (
          <div className="content-form-container">
            <div className="form-header">
              <h4>⚡ High-Performance Worksheet Generator</h4>
              <p className="form-description">Load questions by topic, category, and difficulty.</p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#475569' }}>🎯 Query Type:</label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setWorksheetQueryType('by-grade')} style={{ padding: '10px 20px', background: worksheetQueryType === 'by-grade' ? '#10b981' : '#e5e7eb', color: worksheetQueryType === 'by-grade' ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>📚 By Grade</button>
                <button type="button" onClick={() => setWorksheetQueryType('by-subject')} style={{ padding: '10px 20px', background: worksheetQueryType === 'by-subject' ? '#3b82f6' : '#e5e7eb', color: worksheetQueryType === 'by-subject' ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>📖 By Subject</button>
                <button type="button" onClick={() => setWorksheetQueryType('by-topic')} style={{ padding: '10px 20px', background: worksheetQueryType === 'by-topic' ? '#8b5cf6' : '#e5e7eb', color: worksheetQueryType === 'by-topic' ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>🎯 By Topic</button>
              </div>
            </div>

            <form onSubmit={handleLoadWorksheetQuestions}>
              <div className="form-grid">
                <div className="form-group">
                  <label>📚 Grade Level: *</label>
                  <select value={worksheetForm.grade} onChange={handleWorksheetGradeChange} required>
                    <option value="" disabled>Select Grade</option>
                    {grades.map(g => <option key={g.gradeCode} value={g.gradeCode}>{g.gradeName}</option>)}
                  </select>
                </div>

                {(worksheetQueryType === 'by-subject' || worksheetQueryType === 'by-topic') && (
                  <div className="form-group">
                    <label>📖 Subject:</label>
                    <select 
                      value={worksheetForm.subject} 
                      onChange={(e) => setWorksheetForm({...worksheetForm, subject: e.target.value})}
                      disabled={getSubjectsForGrade(worksheetForm.grade).length === 0}
                    >
                      {getSubjectsForGrade(worksheetForm.grade).length === 0 ? (
                        <option value="">No subjects assigned</option>
                      ) : (
                        getSubjectsForGrade(worksheetForm.grade).map(sub => (
                          <option key={sub.id || sub.subjectName} value={sub.subjectName}>{sub.subjectName.replace(/_/g, ' ')}</option>
                        ))
                      )}
                    </select>
                  </div>
                )}

                {worksheetQueryType === 'by-topic' && (
                  <div className="form-group">
                    <label>🎯 Topic/Chapter:</label>
                    <input type="text" placeholder="e.g., Algebra, Fractions" value={worksheetForm.topic} onChange={(e) => setWorksheetForm({...worksheetForm, topic: e.target.value})} />
                  </div>
                )}

                <div className="form-group">
                  <label>🎚️ Difficulty Level: *</label>
                  <select value={worksheetForm.difficulty} onChange={(e) => setWorksheetForm({...worksheetForm, difficulty: e.target.value})} required>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="COMPLEX">Complex</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>🔢 Number of Questions:</label>
                  <input type="number" min="5" max="100" value={worksheetForm.count} onChange={(e) => setWorksheetForm({...worksheetForm, count: parseInt(e.target.value)})} required />
                </div>

                <div className="form-group">
                  <label>🎲 Worksheet Type:</label>
                  <select value={worksheetForm.randomize ? 'random' : 'static'} onChange={(e) => setWorksheetForm({...worksheetForm, randomize: e.target.value === 'random'})}>
                    <option value="random">🎲 Random</option>
                    <option value="static">📌 Static</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-button" 
                disabled={loading || (worksheetQueryType !== 'by-grade' && !worksheetForm.subject)} 
                style={{ background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', marginTop: '20px' }}
              >
                {loading ? <><span className="spinner"></span> Loading Questions...</> : <><span className="button-icon">⚡</span> Load Questions</>}
              </button>
            </form>

            {worksheetResponseTime && (
              <div style={{ marginTop: '20px', padding: '16px', background: '#f0fdf4', borderRadius: '10px', border: '2px solid #10b981' }}>
                <strong style={{ color: '#065f46' }}>🚀 Performance Metrics:</strong>
                <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.9rem' }}>
                  <div><strong>Server Query:</strong> {worksheetResponseTime.server}ms</div>
                  <div><strong>Client Total:</strong> {worksheetResponseTime.client}ms</div>
                  <div><strong>Type:</strong> {worksheetForm.randomize ? '🎲 Random' : '📌 Static'}</div>
                </div>
              </div>
            )}

            {loadedWorksheetQuestions.length > 0 && (
              <div style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, color: '#10b981' }}>✅ Loaded {loadedWorksheetQuestions.length} Questions</h4>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'grid', gap: '10px' }}>
                  {loadedWorksheetQuestions.slice(0, 5).map((q, idx) => (
                    <div key={idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #667eea' }}>
                      <strong>Q{idx + 1}:</strong> {q.question?.name || q.name || JSON.stringify(q).substring(0, 80)}...
                    </div>
                  ))}
                  {loadedWorksheetQuestions.length > 5 && (
                    <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>... and {loadedWorksheetQuestions.length - 5} more questions</div>
                  )}
                </div>
                <button onClick={handleNavigateToWorksheets} style={{ marginTop: '16px', padding: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', width: '100%', cursor: 'pointer' }}>
                  📄 Open Worksheet Manager for PDF Generation →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManagement;