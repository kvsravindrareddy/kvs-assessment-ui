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

export default function ReadingFlow() {
  const { canPerformAction, trackUsage, getUpgradeMessage } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [gradeData, setGradeData] = useState({});
  const [expandedStories, setExpandedStories] = useState(false);
  const [expandedGrade, setExpandedGrade] = useState(null);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [stories, setStories] = useState({});
  const [storyDetails, setStoryDetails] = useState(null);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const [voices, setVoices] = useState([]);

  const adminConfigURL = `${CONFIG.development.ADMIN_SUPPORT_BASE_URL}/admin-assessment/v1/app-config/subject-types`;
  const listStoriesURL = `${CONFIG.development.ADMIN_BASE_URL}/v1/assessment/list-story-names`;
  const getStoryURL = `${CONFIG.development.ADMIN_BASE_URL}/v1/assessment/with-story-id`;

  useEffect(() => {
    fetch(adminConfigURL)
      .then(res => res.json())
      .then(data => setGradeData(data))
      .catch(err => console.error('Failed to load grades:', err));
  }, []);

  // 🔊 Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel(); // cleanup speech on unmount
    };
  }, []);

  const handleSelectSubject = async (grade, subject) => {
    window.speechSynthesis.cancel();
    const key = `${grade}-${subject}`;
    setExpandedSubject(prev => (prev === key ? null : key));
    setStoryDetails(null);
    setCompleted(false);

    try {
      const res = await axios.post(listStoriesURL, { category: grade, storyType: subject });
      setStories(prev => ({ ...prev, [key]: res.data }));
    } catch (err) {
      console.error('Error fetching stories:', err);
    }
  };

  const fetchStoryDetails = async (storyId) => {
    // Check if user can access stories
    if (!canPerformAction('story')) {
      setShowUpgradeModal(true);
      return;
    }

    // Track usage
    trackUsage('story');

    window.speechSynthesis.cancel();
    try {
      const res = await axios.get(`${getStoryURL}?storyId=${storyId}`);
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
      isCorrect =
        Array.isArray(selectedAnswer) &&
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

  // 🗣 Detect language by Unicode range
  const detectLanguage = (text) => {
    if (/[ఀ-౿]/.test(text)) return 'te-IN'; // Telugu
    if (/[ऀ-ॿ]/.test(text)) return 'hi-IN'; // Hindi
    if (/[஀-௿]/.test(text)) return 'ta-IN'; // Tamil
    if (/[ഀ-ൿ]/.test(text)) return 'ml-IN'; // Malayalam
    if (/[ಀ-೿]/.test(text)) return 'kn-IN'; // Kannada
    return 'en-US'; // fallback English
  };

  // 🔊 Play story + current Q + options
  const playAll = () => {
    if (!storyDetails) return;
    window.speechSynthesis.cancel();

    const queue = [];
    if (storyDetails.content) queue.push(storyDetails.content);

    const currentQ = storyDetails.questions?.[questionIndex];
    if (currentQ?.name) queue.push(currentQ.name);

    if (currentQ?.options) {
      Object.entries(currentQ.options).forEach(([key, value]) => {
        queue.push(`${key}: ${value}`);
      });
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

  // 📄 Export story content + current question + options
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
    doc.setFontSize(16);
    doc.text(`Question ${questionIndex + 1}`, 10, y);
    y += 10;

    doc.setFontSize(12);
    const qLines = doc.splitTextToSize(question.name, 180);
    doc.text(qLines, 10, y);
    y += qLines.length * 7 + 5;

    Object.entries(question.options).forEach(([key, value]) => {
      const optLines = doc.splitTextToSize(`${key}: ${value}`, 180);
      doc.text(optLines, 10, y);
      y += optLines.length * 7 + 3;
    });

    doc.save(`Story_${storyDetails.title || 'Untitled'}_Q${questionIndex + 1}.pdf`);
  };

  // 📄 Preview story + question PDF
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
    doc.setFontSize(16);
    doc.text(`Question ${questionIndex + 1}`, 10, y);
    y += 10;

    doc.setFontSize(12);
    const qLines = doc.splitTextToSize(question.name, 180);
    doc.text(qLines, 10, y);
    y += qLines.length * 7 + 5;

    Object.entries(question.options).forEach(([key, value]) => {
      const optLines = doc.splitTextToSize(`${key}: ${value}`, 180);
      doc.text(optLines, 10, y);
      y += optLines.length * 7 + 3;
    });

    const blob = doc.output('bloburl');
    window.open(blob);
  };

  return (
    <div className="reading-container">
      {/* Usage Indicator */}
      {!storyDetails && <UsageIndicator type="story" />}

      {!storyDetails ? (
        <div>
          <h2
            className="collapsible-header"
            onClick={() => setExpandedStories(prev => !prev)}
          >
            📚 Stories {expandedStories ? '▲' : '▼'}
          </h2>

          {expandedStories && (
            <div className="grade-list-container">
              {orderedGrades.map((grade) => (
                <div key={grade} className="grade-card">
                  <h3 onClick={() => setExpandedGrade(prev => prev === grade ? null : grade)}>
                    {grade} {expandedGrade === grade ? '▲' : '▼'}
                  </h3>

                  {expandedGrade === grade && gradeData[grade] && (
                    <div className="dropdown-content">
                      {gradeData[grade].map((subject) => {
                        const key = `${grade}-${subject}`;
                        return (
                          <div key={subject} className="subject-block">
                            <a onClick={() => handleSelectSubject(grade, subject)}>
                              {subject}
                            </a>

                            {expandedSubject === key && (
                              <div className="story-list-inline">
                                {stories[key] && stories[key].length > 0 ? (
                                  stories[key].map(story => (
                                    <div
                                      key={story.id}
                                      className="story-card"
                                      onClick={() => fetchStoryDetails(story.id)}
                                    >
                                      <h4>{story.title}</h4>
                                      <p>{story.description || 'Click to read'}</p>
                                      <button className="read-btn">Read →</button>
                                    </div>
                                  ))
                                ) : (
                                  <p className="no-stories-msg">📭 No stories to show for this subject.</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2>{storyDetails.title}</h2>
          <p className="story-content">{storyDetails.content}</p>

          <button className="play-btn" onClick={playAll}>🔊 Play</button>
          <button onClick={exportPDF}>📄 Download PDF</button>
          <button onClick={previewPDF}>🖨 Preview & Print</button>

          {completed ? (
            <div className="assessment-done">
              <h3>Assessment Completed!</h3>
              <p>Score: {score} / {storyDetails.questions.length}</p>
              <button onClick={() => { window.speechSynthesis.cancel(); setStoryDetails(null); }}>Back to Stories</button>
            </div>
          ) : (
            storyDetails.questions && storyDetails.questions.length > 0 && (
              <div className="question-box">
                <h3>
                  Question {questionIndex + 1} of {storyDetails.questions.length}
                </h3>

                <p>{storyDetails.questions[questionIndex].name}</p>

                <div className="options-list">
                  {storyDetails.questions[questionIndex].meta.answerType === 'MULTIPLE' &&
                    Object.entries(storyDetails.questions[questionIndex].options).map(([key, value]) => (
                      <label key={key} className="option-label">
                        <input
                          type="checkbox"
                          value={key}
                          checked={Array.isArray(selectedAnswer) && selectedAnswer.includes(key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAnswer(prev => Array.isArray(prev) ? [...prev, key] : [key]);
                            } else {
                              setSelectedAnswer(prev => Array.isArray(prev) ? prev.filter(ans => ans !== key) : []);
                            }
                          }}
                        />
                        {key}: {value}
                      </label>
                    ))}

                  {storyDetails.questions[questionIndex].meta.answerType === 'SINGLE' &&
                    Object.entries(storyDetails.questions[questionIndex].options).map(([key, value]) => (
                      <label key={key} className="option-label">
                        <input
                          type="radio"
                          name="option"
                          value={key}
                          checked={selectedAnswer === key}
                          onChange={() => setSelectedAnswer(key)}
                        />
                        {key}: {value}
                      </label>
                    ))}
                </div>

                <button
                  onClick={submitAnswer}
                  disabled={!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)}
                  className="submit-btn"
                >
                  Submit Answer
                </button>
              </div>
              
            )
          )}
        </div>
      )}

      {/* Upgrade Modal */}
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
