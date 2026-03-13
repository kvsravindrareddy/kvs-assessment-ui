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

  // Worksheet form state
  const [worksheetForm, setWorksheetForm] = useState({
    grade: 'V', // Default to Grade V which has data
    subject: 'Math',
    topic: '',
    difficulty: 'MEDIUM', // Always show difficulty
    count: 20,
    randomize: true
  });

  const [grades, setGrades] = useState([]);

  const [worksheetQueryType, setWorksheetQueryType] = useState('by-grade'); // 'by-grade', 'by-subject', 'by-topic'
  const [loadedWorksheetQuestions, setLoadedWorksheetQuestions] = useState([]);
  const [worksheetResponseTime, setWorksheetResponseTime] = useState(null);

  // Worksheet navigation handler
  const handleNavigateToWorksheets = () => {
    window.location.href = '/admin/content-library/worksheets';
  };

  const handleLoadWorksheetQuestions = async (e) => {
    e.preventDefault();
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
        randomize: worksheetForm.randomize
      };

      // ALL queries now include difficulty
      payload.difficulty = worksheetForm.difficulty;

      // Determine endpoint based on query type
      if (worksheetQueryType === 'by-topic' && worksheetForm.topic) {
        endpoint = `${config.ADMIN_BASE_URL}/admin-assessment/v1/content-library/worksheets/load-by-topic`;
        payload.topic = worksheetForm.topic;
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
          text: `⚠️ No questions found for Grade ${worksheetForm.grade}, Subject ${worksheetForm.subject}, Difficulty ${worksheetForm.difficulty}. Currently available: Grade V (Math, Science) and Professional (Java). Please load more content using "Load Questions" or "Load Stories" tabs first.`
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

  // Questions form state
  const [questionForm, setQuestionForm] = useState({
    complexity: 'MEDIUM',
    type: 'JAVA',
    answerType: 'SINGLE',
    category: 'PROFESSIONAL',
    source: 'CHATGPT',
    numberOfQuestions: 10
  });

  // Stories form state
  const [storyForm, setStoryForm] = useState({
    numberOfStories: 10,
    category: 'V',
    storyType: 'ENGLISH',
    storyLength: 'MEDIUM'
  });

  const [statistics, setStatistics] = useState({
    totalQuestions: 0,
    totalStories: 0,
    loading: true
  });

  // 🌟 FIX: Wrapped in useCallback to satisfy React's exhaustive-deps linter
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

  // Load statistics and grades on mount
  useEffect(() => {
    loadStatistics();
    loadGrades();
  }, [loadStatistics]);

  const loadGrades = async () => {
    try {
      // Use the worksheet-specific endpoint that directly accesses GradeManagementService
      const response = await axios.get(
        `${config.ADMIN_BASE_URL}/admin-assessment/v1/content-library/worksheets/available-grades`
      );

      if (response.data.success && response.data.grades && Array.isArray(response.data.grades)) {
        // Map to the format we need
        const mappedGrades = response.data.grades.map(grade => ({
          code: grade.gradeCode,
          name: grade.gradeName
        }));
        setGrades(mappedGrades);
      }
    } catch (error) {
      console.error('Error loading grades:', error);
      // Fallback to grades with known data
      setGrades([
        { code: 'V', name: 'Grade 5' },
        { code: 'PROFESSIONAL', name: 'Professional' }
      ]);
    }
  };

  const handleLoadQuestions = async (e) => {
    e.preventDefault();
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
              name: "Sample question",
              options: {
                A: "Option A",
                B: "Option B",
                C: "Option C",
                D: "Option D"
              }
            },
            answer: {
              type: questionForm.answerType,
              values: ["A"]
            }
          }
        ]
      };

      await axios.post(
        `${config.ADMIN_BASE_URL}/admin-assessment/v1/assessment/loadquestions`,
        payload
      );

      setMessage({
        type: 'success',
        text: `Successfully loaded ${questionForm.numberOfQuestions} questions!`
      });

      // Reload statistics
      setTimeout(() => loadStatistics(), 1000);
    } catch (error) {
      console.error('Error loading questions:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load questions. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadStories = async (e) => {
    e.preventDefault();
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
          content: "Story content...",
          source: "CHATGPT",
          howManyQuestions: "MCQ",
          questions: [
            {
              sequenceNumber: 1,
              name: "Sample question?",
              meta: {
                value: "MCQ",
                answerType: "SINGLE"
              },
              options: {
                A: "Option A",
                B: "Option B",
                C: "Option C",
                D: "Option D"
              },
              correctAnswerKeys: ["A"]
            }
          ],
          audit: {
            createdBy: user.username,
            updatedBy: user.username
          }
        }
      };

      await axios.post(
        `${config.ADMIN_BASE_URL}/admin-assessment/v1/assessment/loadstories`,
        payload
      );

      setMessage({
        type: 'success',
        text: `Successfully loaded ${storyForm.numberOfStories} stories!`
      });

      // Reload statistics
      setTimeout(() => loadStatistics(), 1000);
    } catch (error) {
      console.error('Error loading stories:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load stories. Please try again.'
      });
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

      {/* Statistics Cards */}
      <div className="content-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#667eea20', color: '#667eea' }}>📝</div>
          <div className="stat-info">
            <div className="stat-value">
              {statistics.loading ? '...' : statistics.totalQuestions}
            </div>
            <div className="stat-label">Total Questions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#48bb7820', color: '#48bb78' }}>📚</div>
          <div className="stat-info">
            <div className="stat-value">
              {statistics.loading ? '...' : statistics.totalStories}
            </div>
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

      {/* Sub Tabs */}
      <div className="content-sub-tabs">
        <button
          className={`content-sub-tab ${activeSubTab === 'load-questions' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('load-questions')}
        >
          <span className="tab-icon">📝</span>
          Load Questions
        </button>
        <button
          className={`content-sub-tab ${activeSubTab === 'load-stories' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('load-stories')}
        >
          <span className="tab-icon">📚</span>
          Load Stories
        </button>
        <button
          className={`content-sub-tab ${activeSubTab === 'load-worksheets' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('load-worksheets')}
          style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', border: 'none' }}
        >
          <span className="tab-icon">⚡</span>
          Load Worksheets
          <span style={{ marginLeft: '8px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.3)', padding: '2px 6px', borderRadius: '10px' }}>NEW</span>
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`content-message ${message.type}`}>
          <span className="message-icon">{message.type === 'success' ? '✓' : '⚠'}</span>
          {message.text}
        </div>
      )}

      {/* Tab Content */}
      <div className="content-tab-body">
        {activeSubTab === 'load-questions' && (
          <div className="content-form-container">
            <div className="form-header">
              <h4>Load Questions from AI</h4>
              <p className="form-description">
                Generate questions using ChatGPT or other AI sources. This may take 30-60 seconds.
              </p>
            </div>

            <form onSubmit={handleLoadQuestions}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Complexity Level:</label>
                  <select
                    value={questionForm.complexity}
                    onChange={(e) => setQuestionForm({...questionForm, complexity: e.target.value})}
                    required
                  >
                    <option value="SIMPLE">Simple</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="COMPLEX">Complex</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Subject Type:</label>
                  <select
                    value={questionForm.type}
                    onChange={(e) => setQuestionForm({...questionForm, type: e.target.value})}
                    required
                  >
                    <option value="JAVA">Java</option>
                    <option value="PYTHON">Python</option>
                    <option value="JAVASCRIPT">JavaScript</option>
                    <option value="REACT_JS">React JS</option>
                    <option value="SPRING_BOOT">Spring Boot</option>
                    <option value="MICROSERVICES">Microservices</option>
                    <option value="MATH">Math</option>
                    <option value="ENGLISH">English</option>
                    <option value="SCIENCE">Science</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Category/Grade:</label>
                  <select
                    value={questionForm.category}
                    onChange={(e) => setQuestionForm({...questionForm, category: e.target.value})}
                    required
                  >
                    <option value="PROFESSIONAL">Professional</option>
                    <option value="UNDERGRADUATE">Undergraduate</option>
                    <option value="POSTGRADUATE">Postgraduate</option>
                    <option value="X">Grade 10</option>
                    <option value="IX">Grade 9</option>
                    <option value="VIII">Grade 8</option>
                    <option value="VII">Grade 7</option>
                    <option value="VI">Grade 6</option>
                    <option value="V">Grade 5</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Answer Type:</label>
                  <select
                    value={questionForm.answerType}
                    onChange={(e) => setQuestionForm({...questionForm, answerType: e.target.value})}
                    required
                  >
                    <option value="SINGLE">Single Choice</option>
                    <option value="MULTIPLE">Multiple Choice</option>
                    <option value="TEXT">Text Answer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Number of Questions:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={questionForm.numberOfQuestions}
                    onChange={(e) => setQuestionForm({...questionForm, numberOfQuestions: parseInt(e.target.value)})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Source:</label>
                  <select
                    value={questionForm.source}
                    onChange={(e) => setQuestionForm({...questionForm, source: e.target.value})}
                    required
                  >
                    <option value="CHATGPT">ChatGPT</option>
                    <option value="GOOGLE">Google Gemini</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Loading Questions...
                  </>
                ) : (
                  <>
                    <span className="button-icon">🚀</span>
                    Load Questions
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {activeSubTab === 'load-worksheets' && (
          <div className="content-form-container">
            <div className="form-header">
              <h4>⚡ High-Performance Worksheet Generator</h4>
              <p className="form-description">
                Load questions by topic, category, and difficulty. Lightning-fast response times with multiple filter options!
              </p>
            </div>

            {/* Query Type Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#475569' }}>
                🎯 Query Type:
              </label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setWorksheetQueryType('by-grade')}
                  style={{
                    padding: '10px 20px',
                    background: worksheetQueryType === 'by-grade' ? '#10b981' : '#e5e7eb',
                    color: worksheetQueryType === 'by-grade' ? 'white' : '#6b7280',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  📚 By Grade (Fastest)
                </button>
                <button
                  type="button"
                  onClick={() => setWorksheetQueryType('by-subject')}
                  style={{
                    padding: '10px 20px',
                    background: worksheetQueryType === 'by-subject' ? '#3b82f6' : '#e5e7eb',
                    color: worksheetQueryType === 'by-subject' ? 'white' : '#6b7280',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  📖 By Subject + Grade
                </button>
                <button
                  type="button"
                  onClick={() => setWorksheetQueryType('by-topic')}
                  style={{
                    padding: '10px 20px',
                    background: worksheetQueryType === 'by-topic' ? '#8b5cf6' : '#e5e7eb',
                    color: worksheetQueryType === 'by-topic' ? 'white' : '#6b7280',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  🎯 By Topic + Grade + Difficulty
                </button>
              </div>
            </div>

            <form onSubmit={handleLoadWorksheetQuestions}>
              <div className="form-grid">
                {/* Grade - Always shown, loaded from API */}
                <div className="form-group">
                  <label>📚 Grade Level: *</label>
                  <select
                    value={worksheetForm.grade}
                    onChange={(e) => setWorksheetForm({...worksheetForm, grade: e.target.value})}
                    required
                  >
                    {grades.length > 0 ? (
                      grades.map(grade => (
                        <option key={grade.code || grade} value={grade.code || grade}>
                          {grade.name || grade}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="I">Grade 1</option>
                        <option value="II">Grade 2</option>
                        <option value="III">Grade 3</option>
                        <option value="IV">Grade 4</option>
                        <option value="V">Grade 5</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Subject - For by-subject and by-topic */}
                {(worksheetQueryType === 'by-subject' || worksheetQueryType === 'by-topic') && (
                  <div className="form-group">
                    <label>📖 Subject:</label>
                    <select
                      value={worksheetForm.subject}
                      onChange={(e) => setWorksheetForm({...worksheetForm, subject: e.target.value})}
                    >
                      <option value="Math">Math</option>
                      <option value="English">English</option>
                      <option value="Science">Science</option>
                      <option value="Social Studies">Social Studies</option>
                      <option value="Reading">Reading</option>
                    </select>
                  </div>
                )}

                {/* Topic - Only for by-topic */}
                {worksheetQueryType === 'by-topic' && (
                  <div className="form-group">
                    <label>🎯 Topic/Chapter:</label>
                    <input
                      type="text"
                      placeholder="e.g., Algebra, Fractions, Grammar"
                      value={worksheetForm.topic}
                      onChange={(e) => setWorksheetForm({...worksheetForm, topic: e.target.value})}
                    />
                  </div>
                )}

                {/* Difficulty - ALWAYS SHOWN for all query types */}
                <div className="form-group">
                  <label>🎚️ Difficulty Level: *</label>
                  <select
                    value={worksheetForm.difficulty}
                    onChange={(e) => setWorksheetForm({...worksheetForm, difficulty: e.target.value})}
                    required
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="COMPLEX">Complex</option>
                  </select>
                </div>

                {/* Question Count */}
                <div className="form-group">
                  <label>🔢 Number of Questions:</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={worksheetForm.count}
                    onChange={(e) => setWorksheetForm({...worksheetForm, count: parseInt(e.target.value)})}
                    required
                  />
                </div>

                {/* Worksheet Type */}
                <div className="form-group">
                  <label>🎲 Worksheet Type:</label>
                  <select
                    value={worksheetForm.randomize ? 'random' : 'static'}
                    onChange={(e) => setWorksheetForm({...worksheetForm, randomize: e.target.value === 'random'})}
                  >
                    <option value="random">🎲 Random (Different Each Time)</option>
                    <option value="static">📌 Static (Fixed Questions)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
                style={{
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  marginTop: '20px'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Loading Questions...
                  </>
                ) : (
                  <>
                    <span className="button-icon">⚡</span>
                    Load Questions
                  </>
                )}
              </button>
            </form>

            {/* Performance Metrics */}
            {worksheetResponseTime && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: '#f0fdf4',
                borderRadius: '10px',
                border: '2px solid #10b981'
              }}>
                <strong style={{ color: '#065f46' }}>🚀 Performance Metrics:</strong>
                <div style={{
                  marginTop: '12px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  fontSize: '0.9rem'
                }}>
                  <div>
                    <strong>Server Query:</strong> {worksheetResponseTime.server}ms
                  </div>
                  <div>
                    <strong>Client Total:</strong> {worksheetResponseTime.client}ms
                  </div>
                  <div>
                    <strong>Type:</strong> {worksheetForm.randomize ? '🎲 Random' : '📌 Static'}
                  </div>
                </div>
              </div>
            )}

            {/* Loaded Questions Display */}
            {loadedWorksheetQuestions.length > 0 && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                background: 'white',
                borderRadius: '12px',
                border: '2px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, color: '#10b981' }}>
                    ✅ Loaded {loadedWorksheetQuestions.length} Questions
                  </h4>
                  <span style={{
                    padding: '6px 12px',
                    background: worksheetForm.randomize ? '#dcfce7' : '#fef3c7',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {worksheetForm.randomize ? '🎲 Random' : '📌 Static'}
                  </span>
                </div>
                <div style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  display: 'grid',
                  gap: '10px'
                }}>
                  {loadedWorksheetQuestions.slice(0, 5).map((q, idx) => (
                    <div key={idx} style={{
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      borderLeft: '4px solid #667eea'
                    }}>
                      <strong>Q{idx + 1}:</strong> {q.question?.name || q.name || JSON.stringify(q).substring(0, 80)}...
                    </div>
                  ))}
                  {loadedWorksheetQuestions.length > 5 && (
                    <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                      ... and {loadedWorksheetQuestions.length - 5} more questions
                    </div>
                  )}
                </div>
                <div style={{ marginTop: '16px', padding: '12px', background: '#fef3c7', borderRadius: '8px', fontSize: '0.875rem', color: '#78350f' }}>
                  💡 <strong>Next Step:</strong> These questions are ready for PDF generation. Visit the full Worksheet Manager to generate downloadable PDFs with answer keys.
                </div>
                <button
                  onClick={handleNavigateToWorksheets}
                  style={{
                    marginTop: '12px',
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  📄 Open Worksheet Manager for PDF Generation →
                </button>
              </div>
            )}

            {/* Info Box */}
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: '#eff6ff',
              borderRadius: '10px',
              border: '2px solid #3b82f6',
              fontSize: '0.875rem',
              color: '#1e40af'
            }}>
              <strong>ℹ️ Query Type Info:</strong>
              <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                <li><strong>By Grade:</strong> Fastest query (30-60ms). Gets all questions for a grade.</li>
                <li><strong>By Subject + Grade:</strong> Medium query (40-80ms). Filters by subject and grade.</li>
                <li><strong>By Topic + Grade + Difficulty:</strong> Most specific (50-100ms). Filters by topic, grade, and difficulty level.</li>
              </ul>
            </div>
          </div>
        )}

        {activeSubTab === 'load-stories' && (
          <div className="content-form-container">
            <div className="form-header">
              <h4>Load Reading Comprehension Stories</h4>
              <p className="form-description">
                Generate reading stories with comprehension questions. This may take 60-90 seconds.
              </p>
            </div>

            <form onSubmit={handleLoadStories}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Number of Stories:</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={storyForm.numberOfStories}
                    onChange={(e) => setStoryForm({...storyForm, numberOfStories: parseInt(e.target.value)})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Grade Level:</label>
                  <select
                    value={storyForm.category}
                    onChange={(e) => setStoryForm({...storyForm, category: e.target.value})}
                    required
                  >
                    <option value="PRE_K">Pre-K</option>
                    <option value="KINDERGARTEN">Kindergarten</option>
                    <option value="I">Grade 1</option>
                    <option value="II">Grade 2</option>
                    <option value="III">Grade 3</option>
                    <option value="IV">Grade 4</option>
                    <option value="V">Grade 5</option>
                    <option value="VI">Grade 6</option>
                    <option value="VII">Grade 7</option>
                    <option value="VIII">Grade 8</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Story Type:</label>
                  <select
                    value={storyForm.storyType}
                    onChange={(e) => setStoryForm({...storyForm, storyType: e.target.value})}
                    required
                  >
                    <option value="ENGLISH">English</option>
                    <option value="HISTORY">History</option>
                    <option value="SCIENCE">Science</option>
                    <option value="SOCIAL_STUDIES">Social Studies</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Story Length:</label>
                  <select
                    value={storyForm.storyLength}
                    onChange={(e) => setStoryForm({...storyForm, storyLength: e.target.value})}
                    required
                  >
                    <option value="SHORT">Short</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LONG">Long</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Loading Stories...
                  </>
                ) : (
                  <>
                    <span className="button-icon">🚀</span>
                    Load Stories
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManagement;