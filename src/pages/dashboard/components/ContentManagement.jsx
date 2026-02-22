import React, { useState, useEffect } from 'react';
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

  // Load statistics on mount
  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const [questionsRes, storiesRes] = await Promise.all([
        axios.get(`${config.ADMIN_BASE_URL}/listallquestions`),
        axios.get(`${config.ADMIN_BASE_URL}/listAllStories`)
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
        `${config.ADMIN_BASE_URL}/loadquestions`,
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
        `${config.ADMIN_BASE_URL}/loadstories`,
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
