import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import CONFIG from '../../Config';
import '../../css/AssessmentFlow.css';
import { useSubscription } from '../../context/SubscriptionContext';
import UpgradePrompt from '../../components/UpgradePrompt';
import UsageIndicator from '../../components/UsageIndicator';

const orderedGrades = [
  'PRE_K', 'KINDERGARTEN', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'
];

const STORIES_PER_PAGE = 16; 

// 👇 Defined right here so ESLint knows exactly what it is!
const getSubjectIcon = (subjectName) => {
  const s = subjectName.toUpperCase();
  if (s.includes('MATH')) return '📐';
  if (s.includes('ENGLISH')) return '📚';
  if (s.includes('SCIENCE')) return '🔬';
  if (s.includes('HISTORY')) return '🏛️';
  if (s.includes('GEOGRAPHY')) return '🌍';
  if (s.includes('SOCIAL')) return '🤝';
  if (s.includes('COMPUTER') || s.includes('IT')) return '💻';
  if (s.includes('HINDI') || s.includes('TELUGU') || s.includes('LANGUAGE')) return '🗣️';
  if (s.includes('KNOWLEDGE') || s.includes('GENERAL')) return '💡';
  return '📝'; 
};

export default function ReadingFlow() {
  const { canPerformAction, trackUsage, getUpgradeMessage } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [gradeData, setGradeData] = useState({});
  const [stories, setStories] = useState({});
  const [storyDetails, setStoryDetails] = useState(null);

  // Timeless Navigation & Pagination States
  const [selectedGrade, setSelectedGrade] = useState(orderedGrades[0]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Assessment States
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [voices, setVoices] = useState([]);

  const adminConfigURL = `${CONFIG.development.ADMIN_BASE_URL}/admin-assessment/v1/app-config/subject-types`;
  const listStoriesURL = `${CONFIG.development.ADMIN_BASE_URL}/v1/assessment/stories/load`;
  const getStoryURL = `${CONFIG.development.ADMIN_BASE_URL}/v1/assessment/with-story-id`;

  useEffect(() => {
    fetch(adminConfigURL)
      .then(res => res.json())
      .then(data => {
        setGradeData(data);
        if (data[orderedGrades[0]] && data[orderedGrades[0]].length > 0) {
          handleSelectSubject(orderedGrades[0], data[orderedGrades[0]][0]);
        }
      })
      .catch(err => console.error('Failed to load grades:', err));
  }, [adminConfigURL]);

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => window.speechSynthesis.cancel();
  }, []);

  const handleSelectGrade = (grade) => {
    setSelectedGrade(grade);
    setCurrentPage(1); 
    const subjectsForGrade = gradeData[grade] || [];
    if (subjectsForGrade.length > 0) {
      handleSelectSubject(grade, subjectsForGrade[0]);
    } else {
      setSelectedSubject(null);
    }
  };

  const handleSelectSubject = async (grade, subject) => {
    window.speechSynthesis.cancel();
    setSelectedSubject(subject);
    setStoryDetails(null);
    setCompleted(false);
    setCurrentPage(1); 

    const key = `${grade}-${subject}`;
    if (stories[key]) return; 

    setIsLoadingStories(true);
    try {
      const token = localStorage.getItem('token');
      const payload = { 
        category: grade, 
        storyType: subject,
        numberOfStories: 50, 
        storyLength: "ALL" 
      };

      const res = await axios.post(listStoriesURL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      setStories(prev => ({ ...prev, [key]: res.data }));
    } catch (err) {
      console.error('Error fetching stories:', err);
    } finally {
      setIsLoadingStories(false);
    }
  };

  const fetchStoryDetails = async (storyId) => {
    if (!canPerformAction('story')) {
      setShowUpgradeModal(true);
      return;
    }
    trackUsage('story');
    window.speechSynthesis.cancel();
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${getStoryURL}?storyId=${storyId}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      setStoryDetails(res.data);
      setQuestionIndex(0);
      setSelectedAnswer(null);
      setScore(0);
      setCompleted(false);
    } catch (err) {
      console.error('Error fetching story details:', err);
    }
  };

  const submitAnswer = () => {
    if (!storyDetails) return;
    const question = storyDetails.questions[questionIndex];
    const correctAnswers = question.correctAnswerKeys;
    let isCorrect = false;

    if (question.meta.answerType === 'MULTIPLE') {
      isCorrect = Array.isArray(selectedAnswer) &&
        correctAnswers.every(ans => selectedAnswer.includes(ans)) &&
        selectedAnswer.length === correctAnswers.length;
    } else {
      isCorrect = correctAnswers.includes(selectedAnswer);
    }

    if (isCorrect) setScore(prev => prev + 1);

    if (questionIndex < storyDetails.questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setCompleted(true);
    }
  };

  const detectLanguage = (text) => {
    if (/[ఀ-౿]/.test(text)) return 'te-IN';
    if (/[ऀ-ॿ]/.test(text)) return 'hi-IN';
    if (/[஀-௿]/.test(text)) return 'ta-IN';
    if (/[ഀ-ൿ]/.test(text)) return 'ml-IN';
    if (/[ಀ-೿]/.test(text)) return 'kn-IN';
    return 'en-US';
  };

  const playAll = () => {
    if (!storyDetails) return;
    window.speechSynthesis.cancel();
    const queue = [];
    if (storyDetails.content) queue.push(storyDetails.content);
    const currentQ = storyDetails.questions?.[questionIndex];
    if (currentQ?.name) queue.push(currentQ.name);
    if (currentQ?.options) {
      Object.entries(currentQ.options).forEach(([key, value]) => queue.push(`${key}: ${value}`));
    }

    const speakNext = (i) => {
      if (i >= queue.length) return;
      const utt = new SpeechSynthesisUtterance(queue[i]);
      const lang = detectLanguage(queue[i]);
      const voice = voices.find(v => v.lang === lang) || voices.find(v => v.lang.includes('IN')) || voices[0];
      utt.voice = voice;
      utt.lang = voice?.lang || lang;
      utt.onend = () => speakNext(i + 1);
      window.speechSynthesis.speak(utt);
    };
    speakNext(0);
  };

  const exportPDF = () => {
    if (!storyDetails) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(storyDetails.title || 'Story', 10, 20);
    doc.setFontSize(12);
    let y = 30;
    const lines = doc.splitTextToSize(storyDetails.content || '', 180);
    doc.text(lines, 10, y);
    y += lines.length * 7 + 10;
    const question = storyDetails.questions[questionIndex];
    if (question) {
      doc.setFontSize(16);
      doc.text(`Question ${questionIndex + 1}`, 10, y);
      y += 10;
      doc.setFontSize(12);
      const qLines = doc.splitTextToSize(question.name, 180);
      doc.text(qLines, 10, y);
      y += qLines.length * 7 + 5;
      if (question.options) {
        Object.entries(question.options).forEach(([key, value]) => {
          const optLines = doc.splitTextToSize(`${key}: ${value}`, 180);
          doc.text(optLines, 10, y);
          y += optLines.length * 7 + 3;
        });
      }
    }
    doc.save(`Story_${storyDetails.title || 'Untitled'}_Q${questionIndex + 1}.pdf`);
  };

  const previewPDF = () => {
    if (!storyDetails) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(storyDetails.title || 'Story', 10, 20);
    doc.setFontSize(12);
    let y = 30;
    const lines = doc.splitTextToSize(storyDetails.content || '', 180);
    doc.text(lines, 10, y);
    y += lines.length * 7 + 10;
    const question = storyDetails.questions[questionIndex];
    if (question) {
      doc.setFontSize(16);
      doc.text(`Question ${questionIndex + 1}`, 10, y);
      y += 10;
      doc.setFontSize(12);
      const qLines = doc.splitTextToSize(question.name, 180);
      doc.text(qLines, 10, y);
      y += qLines.length * 7 + 5;
      if (question.options) {
        Object.entries(question.options).forEach(([key, value]) => {
          const optLines = doc.splitTextToSize(`${key}: ${value}`, 180);
          doc.text(optLines, 10, y);
          y += optLines.length * 7 + 3;
        });
      }
    }
    const blob = doc.output('bloburl');
    window.open(blob);
  };

  // Pagination Logic
  const currentStoriesKey = `${selectedGrade}-${selectedSubject}`;
  const currentStories = stories[currentStoriesKey] || [];
  const totalPages = Math.ceil(currentStories.length / STORIES_PER_PAGE);
  const startIndex = (currentPage - 1) * STORIES_PER_PAGE;
  const displayedStories = currentStories.slice(startIndex, startIndex + STORIES_PER_PAGE);

  return (
    <div className="timeless-layout">
      {!storyDetails && <UsageIndicator type="story" />}

      {!storyDetails ? (
        <div className="timeless-grid">
          <aside className="timeless-sidebar">
            <h2 className="sidebar-title">Grade Levels</h2>
            <nav className="grade-nav">
              {orderedGrades.map((grade) => (
                <button
                  key={grade}
                  className={`grade-nav-item ${selectedGrade === grade ? 'active' : ''}`}
                  onClick={() => handleSelectGrade(grade)}
                >
                  <span className="grade-icon">📖</span> {grade.replace('_', ' ')}
                </button>
              ))}
            </nav>
          </aside>

          <main className="timeless-main">
            <header className="main-header">
              <div className="header-text-group">
                <h1 className="grade-title">Explore {selectedGrade.replace('_', ' ')}</h1>
                <p className="grade-subtitle">Select a subject to discover new stories and challenges.</p>
              </div>
              
              {gradeData[selectedGrade] && gradeData[selectedGrade].length > 0 && (
                <div className="innovative-subject-dock">
                  {gradeData[selectedGrade].map(subject => (
                    <button
                      key={subject}
                      className={`subject-tab ${selectedSubject === subject ? 'active' : ''}`}
                      onClick={() => handleSelectSubject(selectedGrade, subject)}
                    >
                      <span className="subject-icon">{getSubjectIcon(subject)}</span>
                      <span className="subject-name">{subject.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>
              )}
            </header>

            <section className="cards-container">
              {isLoadingStories ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Synthesizing stories...</p>
                </div>
              ) : displayedStories.length > 0 ? (
                <>
                  {/* Smaller Card Grid */}
                  <div className="story-grid small-cards">
                    {displayedStories.map(story => (
                      <div key={story.id} className="timeless-card" onClick={() => fetchStoryDetails(story.id)}>
                        <div className="card-graphic">
                           <span className="graphic-icon">✨</span>
                        </div>
                        <div className="card-content">
                          <h4>{story.title}</h4>
                        </div>
                        <div className="card-footer">
                          <span>Read</span>
                          <span className="arrow">→</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="pagination-controls">
                      <button 
                        className="page-btn" 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(prev => prev - 1)}
                      >
                        ← Prev
                      </button>
                      <span className="page-info">
                        Page <strong>{currentPage}</strong> of {totalPages}
                      </span>
                      <button 
                        className="page-btn" 
                        disabled={currentPage === totalPages} 
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <h3>No Stories Found</h3>
                  <p>Check back later or try a different subject.</p>
                </div>
              )}
            </section>
          </main>
        </div>
      ) : (
        <div className="focus-reading-mode">
          <button className="back-btn" onClick={() => { window.speechSynthesis.cancel(); setStoryDetails(null); }}>
            ← Back to Library
          </button>
          
          <div className="reading-canvas">
            <h2 className="reading-title">{storyDetails.title}</h2>
            <div className="reading-content">{storyDetails.content}</div>

            <div className="action-bar">
              <button className="tool-btn" onClick={playAll}>🔊 Read Aloud</button>
              <button className="tool-btn" onClick={exportPDF}>📄 Download PDF</button>
              <button className="tool-btn" onClick={previewPDF}>🖨 Preview PDF</button>
            </div>

            <div className="assessment-section">
              {completed ? (
                <div className="assessment-done-card">
                  <div className="done-icon">🏆</div>
                  <h3>Assessment Complete</h3>
                  <div className="score-display">
                    <span className="score-number">{score}</span> / {storyDetails.questions.length}
                  </div>
                </div>
              ) : (
                storyDetails.questions && storyDetails.questions.length > 0 && (
                  <div className="modern-question-box">
                    <div className="question-header">
                      <span className="q-badge">Question {questionIndex + 1} of {storyDetails.questions.length}</span>
                    </div>
                    <h3 className="q-text">{storyDetails.questions[questionIndex].name}</h3>

                    <div className="modern-options">
                      {Object.entries(storyDetails.questions[questionIndex].options).map(([key, value]) => {
                        const isMultiple = storyDetails.questions[questionIndex].meta.answerType === 'MULTIPLE';
                        const isChecked = isMultiple 
                          ? Array.isArray(selectedAnswer) && selectedAnswer.includes(key)
                          : selectedAnswer === key;

                        return (
                          <label key={key} className={`modern-option-label ${isChecked ? 'selected' : ''}`}>
                            <input
                              type={isMultiple ? "checkbox" : "radio"}
                              name="option"
                              value={key}
                              checked={isChecked}
                              onChange={(e) => {
                                if (isMultiple) {
                                  if (e.target.checked) setSelectedAnswer(prev => Array.isArray(prev) ? [...prev, key] : [key]);
                                  else setSelectedAnswer(prev => Array.isArray(prev) ? prev.filter(ans => ans !== key) : []);
                                } else {
                                  setSelectedAnswer(key);
                                }
                              }}
                            />
                            <div className="opt-indicator">{key}</div>
                            <span className="opt-text">{value}</span>
                          </label>
                        );
                      })}
                    </div>

                    <button
                      onClick={submitAnswer}
                      disabled={!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)}
                      className="modern-submit-btn"
                    >
                      Confirm Answer
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <UpgradePrompt
          message={getUpgradeMessage('story')}
          showModal
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={() => window.location.href = '#Pricing'}
        />
      )}
    </div>
  );
}