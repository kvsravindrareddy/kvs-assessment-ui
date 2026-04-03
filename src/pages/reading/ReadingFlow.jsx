import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CONFIG from '../../Config';
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

        if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime) < CACHE_DURATION)) {
            activeGrades = JSON.parse(cachedData);
        } else {
            const token = localStorage.getItem('token');
            const response = await axios.get(
              `${baseUrl}/admin-assessment/v1/grade-subjects`,
              { headers: { Authorization: token ? `Bearer ${token}` : '' } }
            );
            
            activeGrades = (response.data || []).filter(g => g.isActive);
            activeGrades.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            
            localStorage.setItem(CACHE_KEY, JSON.stringify(activeGrades));
            localStorage.setItem(CACHE_TTL_KEY, Date.now().toString());
        }
        
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

  const generatePDF = async (preview = false) => {
    if (!storyDetails) return;
    // Dynamically import jsPDF only when the user requests a PDF — keeps it out of the main bundle
    const { default: jsPDF } = await import('jspdf');
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
      <div style={{ background: '#f0f9ff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px', animation: 'bounce 2s infinite' }}>📚</div>
          <p style={{ color: '#0284c7', fontSize: '1.5rem', fontWeight: '900', letterSpacing: '1px' }}>Loading Magic... ✨</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #fef3c7 100%)', color: '#334155', minHeight: '100vh', fontFamily: '"Nunito", "Comic Sans MS", sans-serif' }}>
      {!storyDetails && <UsageIndicator type="story" />}

      {/* 🚀 KID-FRIENDLY UI CSS INJECTION */}
      <style>
        {`
          .magic-library-layout {
              display: flex;
              min-height: calc(100vh - 60px);
          }
          
          .magic-sidebar {
              width: 280px;
              background: rgba(255, 255, 255, 0.8);
              border-right: 4px dashed #bae6fd;
              backdrop-filter: blur(10px);
              padding: 30px 20px;
              display: flex;
              flex-direction: column;
              gap: 12px;
              z-index: 10;
              box-shadow: 5px 0 20px rgba(0,0,0,0.05);
          }

          .magic-grade-btn {
              background: white;
              border: 3px solid #e2e8f0;
              color: #64748b;
              padding: 16px 20px;
              border-radius: 20px;
              text-align: left;
              font-weight: 800;
              font-size: 1.1rem;
              cursor: pointer;
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              display: flex;
              align-items: center;
              gap: 12px;
              box-shadow: 0 4px 0 #e2e8f0;
          }

          .magic-grade-btn:hover {
              background: #f8fafc;
              transform: translateY(2px);
              box-shadow: 0 2px 0 #e2e8f0;
          }

          .magic-grade-btn.active {
              background: #3b82f6;
              border-color: #2563eb;
              color: white;
              box-shadow: 0 4px 0 #1d4ed8;
              transform: translateY(-2px);
          }
          .magic-grade-btn.active:active {
              transform: translateY(4px);
              box-shadow: 0 0 0 #1d4ed8;
          }

          .magic-main {
              flex: 1;
              padding: 40px;
              overflow-y: auto;
          }

          .magic-subject-dock {
              display: flex;
              gap: 15px;
              margin-bottom: 40px;
              flex-wrap: wrap;
          }

          .magic-subject-tab {
              background: white;
              border: 3px solid #e2e8f0;
              padding: 12px 24px;
              border-radius: 30px;
              color: #64748b;
              font-weight: 900;
              font-size: 1.1rem;
              cursor: pointer;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              gap: 10px;
              box-shadow: 0 4px 0 #e2e8f0;
          }

          .magic-subject-tab:hover {
              transform: translateY(2px);
              box-shadow: 0 2px 0 #e2e8f0;
          }

          .magic-subject-tab.active {
              background: #fef08a;
              border-color: #f59e0b;
              color: #92400e;
              box-shadow: 0 4px 0 #d97706;
          }

          .magic-story-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
              gap: 30px;
          }

          .magic-card {
              background: white;
              border: 4px solid #e2e8f0;
              border-radius: 24px;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              overflow: hidden;
              display: flex;
              flex-direction: column;
              box-shadow: 0 8px 0 #cbd5e1;
          }

          .magic-card:hover {
              transform: translateY(-8px) rotate(-1deg);
              border-color: #3b82f6;
              box-shadow: 0 12px 0 #2563eb, 0 15px 20px rgba(59,130,246,0.3);
          }

          .magic-card-img-wrapper {
              width: 100%;
              height: 160px;
              overflow: hidden;
              border-bottom: 3px solid #e2e8f0;
              background: #f1f5f9;
              display: flex;
              align-items: center;
              justify-content: center;
          }

          .magic-card-img-wrapper img {
              width: 100%;
              height: 100%;
              object-fit: cover;
          }

          .magic-card-content {
              padding: 20px;
              flex: 1;
              display: flex;
              flex-direction: column;
          }

          .magic-card-title {
              font-size: 1.4rem;
              color: #0f172a;
              margin: 0 0 15px 0;
              line-height: 1.3;
              font-weight: 900;
          }

          .magic-card-badge {
              align-self: flex-start;
              background: #dbeafe;
              color: #1e40af;
              border: 2px solid #93c5fd;
              padding: 6px 14px;
              border-radius: 20px;
              font-size: 0.9rem;
              font-weight: 900;
              margin-bottom: 15px;
          }

          .magic-card-footer {
              margin-top: auto;
              display: flex;
              justify-content: space-between;
              align-items: center;
              color: #3b82f6;
              font-weight: 900;
              font-size: 1.1rem;
              background: #f0f9ff;
              padding: 10px 15px;
              border-radius: 12px;
          }

          /* 🚀 KID-FRIENDLY READER STYLES */
          .fun-reader-container {
              max-width: 900px;
              margin: 30px auto;
              background: #fffbef; /* Soft cream paper color */
              border: 4px solid #fcd34d;
              border-radius: 32px;
              padding: 40px;
              box-shadow: 0 15px 0 #f59e0b, 0 20px 30px rgba(0,0,0,0.1);
          }

          .fun-text {
              font-size: 1.5rem;
              line-height: 1.8;
              color: #334155;
              white-space: pre-wrap;
              font-weight: 600;
          }

          .fun-btn {
              background: #10b981;
              color: white;
              border: 3px solid #047857;
              padding: 14px 28px;
              border-radius: 50px;
              font-weight: 900;
              font-size: 1.2rem;
              cursor: pointer;
              transition: all 0.2s;
              box-shadow: 0 6px 0 #047857;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
          }

          .fun-btn:hover {
              transform: translateY(2px);
              box-shadow: 0 4px 0 #047857;
          }
          .fun-btn:active {
              transform: translateY(6px);
              box-shadow: 0 0 0 #047857;
          }

          .fun-btn-outline {
              background: white;
              color: #3b82f6;
              border: 3px solid #3b82f6;
              padding: 14px 28px;
              border-radius: 50px;
              font-weight: 900;
              font-size: 1.1rem;
              cursor: pointer;
              transition: all 0.2s;
              box-shadow: 0 4px 0 #2563eb;
          }

          .fun-btn-outline:hover {
              transform: translateY(2px);
              box-shadow: 0 2px 0 #2563eb;
          }
          .fun-btn-outline:active {
              transform: translateY(4px);
              box-shadow: 0 0 0 #2563eb;
          }

          .fun-radio-label {
              display: flex;
              align-items: center;
              gap: 15px;
              padding: 20px;
              border-radius: 20px;
              border: 3px solid #e2e8f0;
              background: white;
              cursor: pointer;
              transition: all 0.2s;
              margin-bottom: 12px;
              box-shadow: 0 4px 0 #e2e8f0;
          }

          .fun-radio-label:hover {
              border-color: #60a5fa;
              transform: translateY(2px);
              box-shadow: 0 2px 0 #93c5fd;
          }

          .fun-radio-label.selected {
              border-color: #3b82f6;
              background: #eff6ff;
              box-shadow: 0 4px 0 #2563eb;
              transform: scale(1.02);
          }
          
          /* Add some bounce to icons */
          @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
          }
        `}
      </style>

      {!storyDetails ? (
        <div className="magic-library-layout">
          <aside className="magic-sidebar">
            <h2 style={{ color: '#0f172a', fontSize: '1.8rem', marginBottom: '10px', fontWeight: '900', textAlign: 'center' }}>Levels 🎒</h2>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orderedGrades.map((grade) => (
                <button
                  key={grade}
                  className={`magic-grade-btn ${selectedGrade === grade ? 'active' : ''}`}
                  onClick={() => handleSelectGrade(grade)}
                >
                  <span style={{ fontSize: '1.5rem' }}>📖</span> Grade {grade.replace('GRADE_', '').replace('_', ' ')}
                </button>
              ))}
            </nav>
          </aside>

          <main className="magic-main">
            <header style={{ marginBottom: '40px', background: 'white', padding: '30px', borderRadius: '24px', border: '4px dashed #fbbf24' }}>
              <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', color: '#d97706', fontWeight: '900' }}>
                Magic Story Library ✨
              </h1>
              <p style={{ color: '#64748b', fontSize: '1.3rem', margin: 0, fontWeight: 'bold' }}>Pick a subject to start your adventure!</p>
            </header>
              
            {gradeSubjectMap[selectedGrade] && gradeSubjectMap[selectedGrade].length > 0 && (
              <div className="magic-subject-dock">
                {gradeSubjectMap[selectedGrade].map(subject => (
                  <button
                    key={subject}
                    className={`magic-subject-tab ${selectedSubject === subject ? 'active' : ''}`}
                    onClick={() => handleSelectSubject(selectedGrade, subject)}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{getSubjectIcon(subject)}</span>
                    <span>{subject.replace(/_/g, ' ')}</span>
                  </button>
                ))}
              </div>
            )}

            <section>
              {isLoadingStories ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                  <div style={{ fontSize: '4rem', animation: 'bounce 1s infinite' }}>🪄</div>
                  <p style={{ color: '#3b82f6', marginTop: '20px', fontSize: '1.5rem', fontWeight: 'bold' }}>Gathering magical stories...</p>
                </div>
              ) : displayedStories.length > 0 ? (
                <>
                  <div className="magic-story-grid">
                    {displayedStories.map((story) => (
                      <div key={story.id} className="magic-card" onClick={() => fetchStoryDetails(story.id)}>
                        {story.imageUrl ? (
                          <div className="magic-card-img-wrapper">
                            <img src={story.imageUrl} alt={story.title} />
                          </div>
                        ) : (
                          <div className="magic-card-img-wrapper">
                            <span style={{ fontSize: '4rem' }}>📚</span>
                          </div>
                        )}
                        <div className="magic-card-content">
                          <h4 className="magic-card-title">{story.title}</h4>
                          {story.storyType && (
                            <span className="magic-card-badge">{story.storyType}</span>
                          )}
                          <div className="magic-card-footer">
                            <span>Let's Read!</span>
                            <span style={{ fontSize: '1.4rem' }}>🚀</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '50px' }}>
                      <button className="fun-btn-outline" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>← Back</button>
                      <span style={{ color: '#475569', fontSize: '1.2rem', fontWeight: 'bold' }}>Page <strong>{currentPage}</strong> of {totalPages}</span>
                      <button className="fun-btn-outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>More →</button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '80px 0', border: '4px dashed #93c5fd', borderRadius: '32px', background: 'rgba(255,255,255,0.5)' }}>
                  <span style={{ fontSize: '5rem' }}>🕵️‍♂️</span>
                  <h3 style={{ color: '#1e40af', fontSize: '2rem', marginTop: '20px', fontWeight: '900' }}>Oops! No stories here yet!</h3>
                  <p style={{ color: '#475569', fontSize: '1.2rem', fontWeight: 'bold' }}>Try exploring a different subject or grade.</p>
                </div>
              )}
            </section>
          </main>
        </div>
      ) : (
        <div style={{ padding: '20px', minHeight: '100vh' }}>
          
          <button className="fun-btn-outline" style={{ display: 'inline-flex', padding: '10px 20px', fontSize: '1rem', marginBottom: '20px', background: 'white' }} onClick={() => {
              window.speechSynthesis.cancel();
              setStoryDetails(null);
              navigate('/reading');
          }}>
            ← Back to Library
          </button>

          <div className="fun-reader-container">
            <div style={{ display: 'flex', gap: '25px', alignItems: 'center', borderBottom: '4px dashed #fcd34d', paddingBottom: '30px', marginBottom: '40px' }}>
              <div style={{ fontSize: '4.5rem', background: '#fef3c7', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '24px', border: '3px solid #f59e0b', boxShadow: '0 6px 0 #f59e0b' }}>
                📖
              </div>
              <div>
                <h1 style={{ fontSize: '2.5rem', color: '#b45309', margin: '0 0 15px 0', lineHeight: 1.2, fontWeight: '900' }}>{storyDetails.title}</h1>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '8px 16px', borderRadius: '50px', fontWeight: '900', border: '2px solid #93c5fd' }}>
                    📝 {storyDetails.questions?.length || 0} Questions
                  </span>
                  <span style={{ background: '#d1fae5', color: '#047857', padding: '8px 16px', borderRadius: '50px', fontWeight: '900', border: '2px solid #6ee7b7' }}>
                    ⏱️ {Math.ceil((storyDetails.content?.split(' ').length || 0) / 200)} min read
                  </span>
                </div>
              </div>
            </div>

            <div className="fun-text" style={{ marginBottom: '50px' }}>
              {storyDetails.content}
            </div>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '60px', flexWrap: 'wrap' }}>
              <button className="fun-btn" style={{ background: '#8b5cf6', borderColor: '#6d28d9', boxShadow: '0 6px 0 #6d28d9' }} onClick={playAll}>
                🔊 Read Aloud
              </button>
              <button className="fun-btn-outline" onClick={exportPDF}>
                📄 Download PDF
              </button>
              <button className="fun-btn-outline" onClick={previewPDF}>
                🖨 Preview PDF
              </button>
            </div>

            <div>
              {completed ? (
                <div style={{ textAlign: 'center', background: '#ecfdf5', border: '4px solid #34d399', padding: '50px', borderRadius: '32px', boxShadow: '0 10px 0 #10b981' }}>
                  <div style={{ fontSize: '6rem', marginBottom: '20px', animation: 'bounce 2s infinite' }}>⭐</div>
                  <h3 style={{ fontSize: '2.5rem', color: '#065f46', margin: '0 0 20px 0', fontWeight: '900' }}>You're a Star!</h3>
                  <div style={{ display: 'inline-block', background: 'white', padding: '20px 50px', borderRadius: '30px', border: '4px solid #10b981', boxShadow: '0 8px 0 #059669' }}>
                    <span style={{ fontSize: '4rem', color: '#10b981', fontWeight: '900' }}>{score}</span>
                    <span style={{ fontSize: '2.5rem', color: '#94a3b8', margin: '0 15px' }}>/</span>
                    <span style={{ fontSize: '3rem', color: '#0f172a', fontWeight: '900' }}>{storyDetails.questions.length}</span>
                  </div>
                  <br/>
                  <button
                    className="fun-btn"
                    onClick={() => {
                      window.speechSynthesis.cancel();
                      setStoryDetails(null);
                      navigate('/reading');
                    }}
                    style={{ marginTop: '40px', background: '#3b82f6', borderColor: '#2563eb', boxShadow: '0 6px 0 #1d4ed8' }}
                  >
                    Read Another Story! 📚
                  </button>
                </div>
              ) : (
                storyDetails.questions && storyDetails.questions.length > 0 && (
                  <div style={{ background: 'white', border: '4px solid #93c5fd', borderRadius: '32px', padding: '40px', boxShadow: '0 12px 0 #bfdbfe' }}>
                    <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                      <span style={{ background: '#3b82f6', color: '#fff', padding: '10px 20px', borderRadius: '50px', fontWeight: '900', fontSize: '1.1rem' }}>
                        QUESTION {questionIndex + 1} OF {storyDetails.questions.length}
                      </span>
                    </div>
                    
                    <h3 style={{ fontSize: '1.8rem', color: '#0f172a', marginBottom: '30px', lineHeight: '1.4', fontWeight: '900', textAlign: 'center' }}>
                      {storyDetails.questions[questionIndex].question || storyDetails.questions[questionIndex].name}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {Object.entries(storyDetails.questions[questionIndex].options).map(([key, value]) => {
                        const isMultiple = storyDetails.questions[questionIndex].meta?.answerType === 'MULTIPLE';
                        const isChecked = isMultiple 
                          ? Array.isArray(selectedAnswer) && selectedAnswer.includes(key)
                          : selectedAnswer === key;

                        return (
                          <label key={key} className={`fun-radio-label ${isChecked ? 'selected' : ''}`}>
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
                              style={{ display: 'none' }}
                            />
                            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: isChecked ? '#3b82f6' : '#f1f5f9', color: isChecked ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.3rem', border: isChecked ? 'none' : '2px solid #cbd5e1' }}>
                                {key}
                            </div>
                            <span style={{ fontSize: '1.3rem', color: isChecked ? '#1e40af' : '#475569', fontWeight: isChecked ? '900' : '600' }}>{value}</span>
                          </label>
                        );
                      })}
                    </div>

                    <button
                      onClick={submitAnswer}
                      disabled={!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)}
                      className="fun-btn"
                      style={{ width: '100%', marginTop: '30px', padding: '20px', fontSize: '1.4rem', opacity: (!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)) ? 0.5 : 1 }}
                    >
                      Check My Answer! 🎯
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