import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/AssessmentFlow.css';
import CONFIG from '../../Config';
import { useSubscription } from '../../context/SubscriptionContext';
import UpgradePrompt from '../../components/UpgradePrompt';
import UsageIndicator from '../../components/UsageIndicator';

const AssessmentFlow = ({ preSelectedCategory = '', preSelectedType = '' }) => {
  const { canPerformAction, trackUsage, getUpgradeMessage } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [userInfo, setUserInfo] = useState({ userId: '', email: '' });
  const [settings, setSettings] = useState({
    category: preSelectedCategory,
    type: preSelectedType,
    complexity: '',
    numberOfQuestions: 5
  });

  const [assessment, setAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [invalid, setInvalid] = useState(0);
  const [categoriesData, setCategoriesData] = useState({});
  const [types, setTypes] = useState([]);
  const [complexities, setComplexities] = useState([]);

  const baseURL = `${CONFIG.development.ASSESSMENT_BASE_URL}/v1/assessment`;
  const configURL = `${CONFIG.development.ASSESSMENT_BASE_URL}/v1/question-category-config`;
  const adminConfigURL = `${CONFIG.development.ADMIN_SUPPORT_BASE_URL}/v1/app-config`;

  useEffect(() => {
    axios.get(adminConfigURL).then(res => setCategoriesData(res.data)).catch(console.error);
    axios.get(`${configURL}/complexity`).then(res => setComplexities(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (settings.category && categoriesData[settings.category]) {
      setTypes(categoriesData[settings.category]);
    } else {
      setTypes([]);
    }
  }, [settings.category, categoriesData]);

  const startAssessment = async () => {
    // Check if user can perform assessment
    if (!canPerformAction('assessment')) {
      setShowUpgradeModal(true);
      return;
    }

    // Track usage
    trackUsage('assessment');

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
      {/* Usage Indicator */}
      {!assessment && <UsageIndicator type="assessment" />}

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

          {preSelectedCategory ? (
              <input
                type="text"
                value={preSelectedCategory.replace(/_/g, ' ')}
                readOnly
                className="readonly-field"
              />
            ) : (
              <select value={settings.category} onChange={(e) => setSettings({ ...settings, category: e.target.value, type: '' })}>
                <option value="">Select Grade</option>
                {Object.keys(categoriesData).map(grade => (
                  <option key={grade} value={grade}>{grade.replace('_', ' ')}</option>
                ))}
              </select>
            )}

          {preSelectedType ? (
              <input
                type="text"
                value={preSelectedType.replace(/_/g, ' ')}
                readOnly
                className="readonly-field"
              />
            ) : (
              <select value={settings.type} onChange={(e) => setSettings({ ...settings, type: e.target.value })}>
                <option value="">Select Subject</option>
                {types.map(sub => (
                  <option key={sub} value={sub}>{sub.replace(/_/g, ' ')}</option>
                ))}
              </select>
            )}

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

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradePrompt
          message={getUpgradeMessage('assessment')}
          showModal
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={() => window.location.href = '#Pricing'}
        />
      )}
    </div>
  );
};

export default AssessmentFlow;
