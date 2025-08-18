import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CONFIG from '../../Config';
import '../../css/AssessmentFlow.css';

const orderedGrades = [
  'PRE_K', 'KINDERGARTEN', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'
];

export default function ReadingFlow() {
  const [gradeData, setGradeData] = useState({});
  const [expandedStories, setExpandedStories] = useState(false);
  const [expandedGrade, setExpandedGrade] = useState(null);
  const [expandedSubject, setExpandedSubject] = useState(null); // now (grade+subject)
  const [stories, setStories] = useState({});
  const [storyDetails, setStoryDetails] = useState(null);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const adminConfigURL = `${CONFIG.development.ADMIN_SUPPORT_BASE_URL}/v1/app-config/subject-types`;
  const listStoriesURL = `${CONFIG.development.ADMIN_BASE_URL}/v1/assessment/list-story-names`;
  const getStoryURL = `${CONFIG.development.ADMIN_BASE_URL}/v1/assessment/with-story-id`;

  // Load grade -> subject types
  useEffect(() => {
    fetch(adminConfigURL)
      .then(res => res.json())
      .then(data => setGradeData(data))
      .catch(err => console.error('Failed to load grades:', err));
  }, []);

  const handleSelectSubject = async (grade, subject) => {
    const key = `${grade}-${subject}`;
    setExpandedSubject(prev => (prev === key ? null : key)); // toggle
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

  return (
    <div className="reading-container">
      {!storyDetails ? (
        <div>
          {/* Collapsible Stories Header */}
          <h2
            className="collapsible-header"
            onClick={() => setExpandedStories(prev => !prev)}
          >
            📚 Stories {expandedStories ? '▲' : '▼'}
          </h2>

          {/* Grades inside Stories */}
          {expandedStories && (
            <div className="grade-list-container">
              {orderedGrades.map((grade) => (
                <div key={grade} className="grade-card">
                  <h3 onClick={() => setExpandedGrade(prev => prev === grade ? null : grade)}>
                    {grade} {expandedGrade === grade ? '▲' : '▼'}
                  </h3>

                  {/* Subjects */}
                  {expandedGrade === grade && gradeData[grade] && (
                    <div className="dropdown-content">
                      {gradeData[grade].map((subject) => {
                        const key = `${grade}-${subject}`;
                        return (
                          <div key={subject} className="subject-block">
                            <a onClick={() => handleSelectSubject(grade, subject)}>
                              {subject}
                            </a>

                            {/* Inline stories for this subject */}
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
          {/* Story Content */}
          <h2>{storyDetails.title}</h2>
          <p className="story-content">{storyDetails.content}</p>

          {completed ? (
            <div className="assessment-done">
              <h3>Assessment Completed!</h3>
              <p>Score: {score} / {storyDetails.questions.length}</p>
              <button onClick={() => setStoryDetails(null)}>Back to Stories</button>
            </div>
          ) : (
            storyDetails.questions && storyDetails.questions.length > 0 && (
              <div className="question-box">
                <h3>Question {questionIndex + 1} of {storyDetails.questions.length}</h3>
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
    </div>
  );
}
