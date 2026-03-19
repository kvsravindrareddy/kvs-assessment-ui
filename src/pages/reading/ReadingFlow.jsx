import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import CONFIG from '../../Config';
import '../../css/AssessmentFlow.css';
import { useSubscription } from '../../context/SubscriptionContext';
import { useAuth } from '../../context/AuthContext';
import UpgradePrompt from '../../components/UpgradePrompt';
import UsageIndicator from '../../components/UsageIndicator';
import { useLocation, useNavigate } from 'react-router-dom';

const STORIES_PER_PAGE = 16; 

// --- DYNAMIC SMART ICON GENERATOR ---
const getSubjectIcon = (subjectName) => {
  if (!subjectName) return '📝';
  const s = subjectName.toUpperCase();
  
  // Keep semantic mapping for common subjects for best UX
  if (s.includes('MATH')) return '📐';
  if (s.includes('ENGLISH')) return '📚';
  if (s.includes('SCIENCE')) return '🔬';
  if (s.includes('HISTORY')) return '🏛️';
  if (s.includes('GEOGRAPHY')) return '🌍';
  if (s.includes('SOCIAL')) return '🤝';
  if (s.includes('COMPUTER') || s.includes('IT')) return '💻';
  if (s.includes('HINDI') || s.includes('TELUGU') || s.includes('LANGUAGE')) return '🗣️';
  if (s.includes('KNOWLEDGE') || s.includes('GENERAL')) return '💡';
  if (s.includes('ART')) return '🎨';
  if (s.includes('MUSIC')) return '🎵';

  // Fallback: Deterministic Hash for ANY unknown subject added by Admin!
  const genericIcons = ['📖', '✏️', '🎯', '🧩', '⭐', '🌟', '🧠', '⚡', '🚀', '🔍'];
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  return genericIcons[Math.abs(hash) % genericIcons.length];
};

export default function ReadingFlow() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { canPerformAction, trackUsage, getUpgradeMessage } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [orderedGrades, setOrderedGrades] = useState([]);
  const [gradeSubjectMap, setGradeSubjectMap] = useState({});
  const [gradesLoading, setGradesLoading] = useState(true);

  const [stories, setStories] = useState({});
  const [storyDetails, setStoryDetails] = useState(null);

  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [voices, setVoices] = useState([]);

  const baseUrl = CONFIG.development.GATEWAY_URL || CONFIG.development.ADMIN_BASE_URL;
  const listStoriesURL = `${baseUrl}/v1/assessment/stories/load`;
  const startAssessmentURL = `${baseUrl}/v1/assessment/stories/start`;
  const submitAnswerURL = `${baseUrl}/v1/assessment/stories/submit-answer`;

  // --- UI CACHING IMPLEMENTATION ---
  useEffect(() => {
    const loadGradesAndSubjects = async () => {
      try {
        setGradesLoading(true);
        const CACHE_KEY = 'kivo_dynamic_grades_cache';
        const CACHE_TTL_KEY = 'kivo_dynamic_grades_cache_time';
        const CACHE_DURATION = 1000 * 60 * 60; // 1 Hour

        let activeGrades = [];
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TTL_KEY);

        // Check if cache exists and is valid
        if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime) < CACHE_DURATION)) {
            activeGrades = JSON.parse(cachedData);
        } else {
            // Fetch from API if cache expired or doesn't exist
            const token = localStorage.getItem('token');
            const response = await axios.get(
              `${baseUrl}/admin-assessment/v1/grade-subjects`,
              { headers: { Authorization: token ? `Bearer ${token}` : '' } }
            );
            
            activeGrades = (response.data || []).filter(g => g.isActive);
            activeGrades.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            
            // Save to UI Cache
            localStorage.setItem(CACHE_KEY, JSON.stringify(activeGrades));
            localStorage.setItem(CACHE_TTL_KEY, Date.now().toString());
        }
        
        // Process Data
        const gradesList = activeGrades.map(g => g.gradeCode);
        const subjMap = {};
        
        activeGrades.forEach(g => {
          subjMap[g.gradeCode] = (g.subjects || []).map(s => s.subjectName);
        });

        setOrderedGrades(gradesList);
        setGradeSubjectMap(subjMap);

        if (gradesList.length > 0) {
          const firstGrade = gradesList[0];
          setSelectedGrade(firstGrade);
          
          if (subjMap[firstGrade] && subjMap[firstGrade].length > 0) {
             handleSelectSubject(firstGrade, subjMap[firstGrade][0]);
          }
        }
      } catch (error) {
        console.error('Error loading grades and subjects:', error);
      } finally {
        setGradesLoading(false);
      }
    };

    loadGradesAndSubjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => window.speechSynthesis.cancel();
  }, []);

  const handleSelectGrade = (grade) => {
    setSelectedGrade(grade);
    setCurrentPage(1); 
    const subjectsForGrade = gradeSubjectMap[grade] || [];
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
    window.speechSynthesis.cancel();
    
    try {
      const token = localStorage.getItem('token');
      const currentUserId = user ? (user.id || user.email || 'GUEST_USER') : 'GUEST_USER';
      const requestUrl = `${startAssessmentURL}?storyId=${storyId}&userId=${encodeURIComponent(currentUserId)}`;

      const res = await axios.get(requestUrl, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      
      trackUsage('story'); 
      const backendData = res.data;
      setStoryDetails(backendData);
      setQuestionIndex(backendData.resumeQuestionIndex || 0);
      setScore(backendData.currentScore || 0);
      setSelectedAnswer(null);
      setCompleted(false);
      
    } catch (err) {
      console.error('Error fetching story details:', err);
      alert('Could not start assessment. Please try again.');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlStoryId = params.get('storyId');
    if (urlStoryId && !storyDetails) {
      fetchStoryDetails(urlStoryId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const submitAnswer = async () => {
    if (!storyDetails) return;
    const isLastQuestion = questionIndex === storyDetails.questions.length - 1;
    const currentUserId = user ? (user.id || user.email || 'GUEST_USER') : 'GUEST_USER';
    const answersList = Array.isArray(selectedAnswer) ? selectedAnswer : [selectedAnswer];

    try {
      const token = localStorage.getItem('token');
      const payload = {
        userId: currentUserId,
        storyId: storyDetails.storyId, 
        questionIndex: questionIndex, 
        userAnswer: answersList,
        lastQuestion: isLastQuestion
      };

      const res = await axios.post(submitAnswerURL, payload, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '' 
        }
      });

      setScore(res.data.currentScore);
      if (!isLastQuestion) {
        setQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setCompleted(true);
      }
    } catch (err) {
      console.error("Failed to submit answer:", err);
      alert("Error saving answer. Please check your connection.");
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
    // FIX: Fallback to either `.question` or `.name` for Read Aloud 
    const questionText = currentQ?.question || currentQ?.name;
    if (questionText) queue.push(questionText);
    
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

  const generatePDF = (preview = false) => {
    if (!storyDetails) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let y = 45; 
    
    const formattedGrade = selectedGrade ? selectedGrade.replace('_', ' ') : 'Unknown';
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); 
    doc.setFont(undefined, 'bold');
    
    const titleLines = doc.splitTextToSize(`Grade ${formattedGrade} - ${storyDetails.title || 'Reading Comprehension'}`, contentWidth);
    doc.text(titleLines, margin, y);
    y += (titleLines.length * 8) + 5;
    
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85); 
    doc.setFont(undefined, 'normal');
    const contentLines = doc.splitTextToSize(storyDetails.content || '', contentWidth);
    
    contentLines.forEach(line => {
      if (y > pageHeight - 30) { 
        doc.addPage();
        y = 45; 
      }
      doc.text(line, margin, y);
      y += 7;
    });
    
    y += 10;
    
    if (storyDetails.questions && storyDetails.questions.length > 0) {
        if (y > pageHeight - 40) { doc.addPage(); y = 45; }
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42);
        doc.setFont(undefined, 'bold');
        doc.text("Assessment Questions", margin, y);
        y += 12;
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(51, 65, 85);
        
        storyDetails.questions.forEach((q, index) => {
            if (y > pageHeight - 30) { doc.addPage(); y = 45; }
            // FIX: Ensure PDF works regardless of if the property is 'question' or 'name'
            const questionText = q.question || q.name || "Question text missing";
            const qLines = doc.splitTextToSize(`${index + 1}. ${questionText}`, contentWidth);
            doc.text(qLines, margin, y);
            y += qLines.length * 7;
            if (q.options) {
                Object.entries(q.options).forEach(([key, value]) => {
                    if (y > pageHeight - 25) { doc.addPage(); y = 45; }
                    const optLines = doc.splitTextToSize(`    ${key}) ${value}`, contentWidth);
                    doc.text(optLines, margin, y);
                    y += optLines.length * 7;
                });
            }
            y += 6; 
        });
    }

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(203, 213, 225); 
        doc.setLineWidth(0.5);
        doc.rect(margin / 2, margin / 2, pageWidth - margin, pageHeight - margin);
        doc.setFillColor(239, 246, 255); 
        doc.roundedRect(margin, margin, 60, 12, 3, 3, 'F');
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(37, 99, 235); 
        doc.text('KiVO Learning', margin + 8, margin + 8);
        doc.setDrawColor(226, 232, 240); 
        doc.setLineWidth(0.5);
        doc.line(margin, margin + 18, pageWidth - margin, margin + 18);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 116, 139); 
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - (margin / 2) - 4, { align: 'center' });
    }

    if (preview) {
        window.open(doc.output('bloburl'));
    } else {
        const safeTitle = (storyDetails.title || 'Worksheet').replace(/[^a-zA-Z0-9]/g, '_');
        doc.save(`KiVOLearning_${safeTitle}.pdf`);
    }
  };

  const exportPDF = () => generatePDF(false);
  const previewPDF = () => generatePDF(true);

  const currentStoriesKey = `${selectedGrade}-${selectedSubject}`;
  const currentStories = stories[currentStoriesKey] || [];
  const totalPages = Math.ceil(currentStories.length / STORIES_PER_PAGE);
  const startIndex = (currentPage - 1) * STORIES_PER_PAGE;
  const displayedStories = currentStories.slice(startIndex, startIndex + STORIES_PER_PAGE);

  if (gradesLoading) {
    return (
      <div className="timeless-layout">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📚</div>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading curriculum...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="grade-title">Explore {selectedGrade ? selectedGrade.replace('_', ' ') : 'Grade Levels'}</h1>
                <p className="grade-subtitle">Select a subject to discover new stories and challenges.</p>
              </div>
              
              {gradeSubjectMap[selectedGrade] && gradeSubjectMap[selectedGrade].length > 0 && (
                <div className="innovative-subject-dock">
                  {gradeSubjectMap[selectedGrade].map(subject => (
                    <button
                      key={subject}
                      className={`subject-tab ${selectedSubject === subject ? 'active' : ''}`}
                      onClick={() => handleSelectSubject(selectedGrade, subject)}
                    >
                      <span className="subject-icon">{getSubjectIcon(subject)}</span>
                      <span className="subject-name">{subject.replace(/_/g, ' ')}</span>
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
                  <div className="story-grid small-cards">
                    {displayedStories.map((story) => {
                      return (
                        <div key={story.id} className="timeless-card story-card-enhanced" onClick={() => fetchStoryDetails(story.id)}>
                          {story.imageUrl && (
                            <div className="story-card-image">
                              <img src={story.imageUrl} alt={story.title} />
                            </div>
                          )}
                          <div className="card-content story-content-clean">
                            <h4 className="story-title">{story.title}</h4>
                            {story.storyType && (
                              <span className="story-type-badge">{story.storyType}</span>
                            )}
                          </div>
                          <div className="card-footer story-footer">
                            <span className="read-text">Start Reading</span>
                            <span className="arrow">→</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="pagination-controls">
                      <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>← Prev</button>
                      <span className="page-info">Page <strong>{currentPage}</strong> of {totalPages}</span>
                      <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next →</button>
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
        <div className="focus-reading-mode world-class-reader">
          <button className="back-btn-elegant" onClick={() => {
              window.speechSynthesis.cancel();
              setStoryDetails(null);
              navigate('/reading');
          }}>
            <span className="back-icon">←</span>
            <span>Back to Library</span>
          </button>

          <div className="reading-canvas-premium">
            <div className="story-header-elegant">
              <div className="story-icon-large">📖</div>
              <div className="story-header-content">
                <h1 className="reading-title-elegant">{storyDetails.title}</h1>
                <div className="story-metadata">
                  <span className="metadata-item">
                    <span className="meta-icon">📝</span>
                    {storyDetails.questions?.length || 0} Questions
                  </span>
                  <span className="metadata-item">
                    <span className="meta-icon">⏱️</span>
                    {Math.ceil((storyDetails.content?.split(' ').length || 0) / 200)} min read
                  </span>
                </div>
              </div>
            </div>

            <div className="reading-content-elegant">
              <div className="content-text">{storyDetails.content}</div>
            </div>

            <div className="action-bar-elegant">
              <button className="tool-btn-elegant primary" onClick={playAll}>
                <span className="btn-icon">🔊</span><span>Read Aloud</span>
              </button>
              <button className="tool-btn-elegant secondary" onClick={exportPDF}>
                <span className="btn-icon">📄</span><span>Download PDF</span>
              </button>
              <button className="tool-btn-elegant secondary" onClick={previewPDF}>
                <span className="btn-icon">🖨</span><span>Preview</span>
              </button>
            </div>

            <div className="assessment-section">
              {completed ? (
                <div className="assessment-done-card">
                  <div className="done-icon">🏆</div>
                  <h3>Assessment Complete!</h3>
                  <div className="score-display">
                    <div className="score-label">Your Score</div>
                    <div className="score-numbers">
                      <span className="score-earned">{score}</span>
                      <span className="score-divider">/</span>
                      <span className="score-total">{storyDetails.questions.length}</span>
                    </div>
                    <div className="score-percentage">
                      {Math.round((score / storyDetails.questions.length) * 100)}%
                    </div>
                  </div>
                  <button
                    className="modern-submit-btn"
                    onClick={() => {
                      window.speechSynthesis.cancel();
                      setStoryDetails(null);
                      navigate('/reading');
                    }}
                    style={{ marginTop: '20px' }}
                  >
                    Return to Library
                  </button>
                </div>
              ) : (
                storyDetails.questions && storyDetails.questions.length > 0 && (
                  <div className="modern-question-box">
                    <div className="question-header">
                      <span className="q-badge">Question {questionIndex + 1} of {storyDetails.questions.length}</span>
                    </div>
                    
                    {/* FIX: Explicitly fallback to .question OR .name based on Backend Schema! */}
                    <h3 className="q-text">
                      {storyDetails.questions[questionIndex].question || storyDetails.questions[questionIndex].name}
                    </h3>

                    <div className="modern-options">
                      {Object.entries(storyDetails.questions[questionIndex].options).map(([key, value]) => {
                        const isMultiple = storyDetails.questions[questionIndex].meta?.answerType === 'MULTIPLE';
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