import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/AssessmentFlow.css';
import CONFIG from '../../Config';

const AssessmentFlow = () => {
  const [userInfo, setUserInfo] = useState({ userId: '', email: '' });
  const [settings, setSettings] = useState({ category: '', type: '', complexity: '', numberOfQuestions: 5 });
  const [assessment, setAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [invalid, setInvalid] = useState(0);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [complexities, setComplexities] = useState([]);

  const baseURL = `${CONFIG.development.ASSESSMENT_BASE_URL}/v1/assessment`;
  const configURL = `${CONFIG.development.ASSESSMENT_BASE_URL}/v1/question-category-config`;

  useEffect(() => {
    axios.get(`${configURL}/categories`).then(res => setCategories(res.data));
    axios.get(`${configURL}/complexity`).then(res => setComplexities(res.data));
  }, []);

  useEffect(() => {
    if (settings.category) {
      axios.get(`${configURL}/categories/${settings.category}/types`).then(res => setTypes(res.data));
    }
  }, [settings.category]);

  const startAssessment = async () => {
    const request = { ...userInfo, ...settings };
    try {
      const res = await axios.post(`${baseURL}/load`, request);
      setAssessment(res.data);
      fetchQuestion(res.data.assessmentId, 1);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchQuestion = async (assessmentId, index) => {
    try {
      const res = await axios.post(`${baseURL}/start`, {
        ...userInfo,
        assessmentId,
        questionIndex: index,
      });
      setCurrentQuestion(res.data);
      setSelectedAnswer(null);
    } catch (error) {
      console.error(error);
    }
  };

  const submitAnswer = async () => {
    try {
      const res = await axios.post(`${baseURL}/submit-answer`, {
        assessmentId: assessment.assessmentId,
        ...userInfo,
        questionIndex,
        userAnswer: Array.isArray(selectedAnswer) ? selectedAnswer : [selectedAnswer],
      });
      setScore(res.data.score);
      setInvalid(res.data.invalid);
      if (questionIndex < assessment.numberOfQuestions) {
        const nextIndex = questionIndex + 1;
        setQuestionIndex(nextIndex);
        fetchQuestion(assessment.assessmentId, nextIndex);
      } else {
        submitAssessment();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const submitAssessment = async () => {
    try {
      const res = await axios.post(`${baseURL}/submit`, {
        assessmentId: assessment.assessmentId,
        ...userInfo,
        reason: 'Test Completed and Submitted',
      });
      setIsCompleted(true);
      setMessage(`Assessment ${res.data.status}. Score: ${res.data.score} / ${res.data.numberOfQuestions}, Invalid: ${res.data.invalid}`);
    } catch (error) {
      console.error(error);
    }
  };

  if (isCompleted) {
    return <div className="assessment-done">{message}</div>;
  }

  return (
    <div className="assessment-container">
      {assessment && (
        <div className="score-header">
          <h4>Score: {score} | Invalid: {invalid}</h4>
        </div>
      )}

      {!assessment ? (
        <div className="user-info-form">
          <h2>Start Assessment</h2>
          <input
            type="text"
            placeholder="User ID"
            value={userInfo.userId}
            onChange={(e) => setUserInfo({ ...userInfo, userId: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={userInfo.email}
            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
          />

          <select value={settings.category} onChange={(e) => setSettings({ ...settings, category: e.target.value })}>
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select value={settings.type} onChange={(e) => setSettings({ ...settings, type: e.target.value })}>
            <option value="">Select Type</option>
            {types.map(typ => (
              <option key={typ} value={typ}>{typ}</option>
            ))}
          </select>

          <select value={settings.complexity} onChange={(e) => setSettings({ ...settings, complexity: e.target.value })}>
            <option value="">Select Complexity</option>
            {complexities.map(cmp => (
              <option key={cmp} value={cmp}>{cmp}</option>
            ))}
          </select>

          <select value={settings.numberOfQuestions} onChange={(e) => setSettings({ ...settings, numberOfQuestions: parseInt(e.target.value) })}>
            {[5, 10, 15, 20, 25, 50, 100].map((num) => (
              <option key={num} value={num}>{num} Questions</option>
            ))}
          </select>

          <button onClick={startAssessment}>Start</button>
        </div>
      ) : (
        currentQuestion && (
          <div className="question-box">
            <h3>Question {questionIndex} of {assessment.numberOfQuestions}</h3>
            <p>{currentQuestion.question.question.name}</p>

            <div className="options-list">
              {currentQuestion.question.answer.type === 'SINGLE' &&
                Object.entries(currentQuestion.question.question.options).map(([key, value]) => (
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

              {currentQuestion.question.answer.type === 'MULTIPLE' &&
                Object.entries(currentQuestion.question.question.options).map(([key, value]) => (
                  <label key={key} className="option-label">
                    <input
                      type="checkbox"
                      name="option"
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

              {currentQuestion.question.answer.type === 'TEXT' && (
                <input
                  type="text"
                  value={selectedAnswer || ''}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  placeholder="Enter your answer"
                />
              )}
            </div>

            <button
              onClick={submitAnswer}
              disabled={
                (currentQuestion.question.answer.type === 'SINGLE' && !selectedAnswer) ||
                (currentQuestion.question.answer.type === 'MULTIPLE' && (!Array.isArray(selectedAnswer) || selectedAnswer.length === 0)) ||
                (currentQuestion.question.answer.type === 'TEXT' && !selectedAnswer?.trim())
              }
              className="submit-btn"
            >
              Submit Answer
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default AssessmentFlow;
