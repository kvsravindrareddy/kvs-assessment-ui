import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/styles.css';
import CONFIG from '../../Config';

const AssessmentQuestions = () => {
    const [userId, setUserid] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [assessmentSummary, setAssessmentSummary] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [selectedType, setSelectedType] = useState('addition');
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [selectedComplexity, setSelectedComplexity] = useState('easy');
    const [numberOfQuestions, setNumberOfQuestions] = useState(10);
    const [pdfFileName, setPdfFileName] = useState('');

    useEffect(() => {
        if (questions.length > 0) {
            setCurrentQuestion(questions[0]);
        }
    }, [questions]);

    const fetchAssessmentQuestions = async () => {
        try {
        const response = await axios.get(`${CONFIG.development.EVALUATION_BASE_URL}/allrandoms?userId=${userId}&type=${selectedType}&email=${selectedEmail}&numberOfQuestions=${numberOfQuestions}&complexity=${selectedComplexity}`);
        const {questions, assessmentId} = response.data;
        if(questions.length > 0) {
        setQuestions(response.data.questions);
        setAssessmentSummary({
            score: 0,
            totalQuestions: questions.length,
            correctQuestions: 0,
            incorrectQuestions: 0,
            unansweredQuestions: questions.length,
            status: 'IN_PROGRESS',
            assessmentId: assessmentId
        });
        } else {
            console.error('No questions found');
        }
        } catch(error) {
            console.error(error);
        }
    };

    const handleStartAssessment = async () => {
        fetchAssessmentQuestions();
    };

    const handleSubmitAnswer = async () => {
        try {
            const response = await axios.post(`${CONFIG.development.EVALUATION_BASE_URL}/submitrandomquestion`, {
                userId: userId,
                email: selectedEmail,
                assessmentId: assessmentSummary.assessmentId,
                assessmentStatus: 'STARTED',
                currentQuestion: {
                    name: currentQuestion.name,
                    type: currentQuestion.type,
                    id: currentQuestion.id,
                    sequence: currentQuestion.sequence,
                    status: 'ANSWERED',
                    answer: {
                        selected: selectedAnswer,
                    }
                },
            });
            setAssessmentSummary(response.data);
            setCurrentQuestion(response.data.nextQuestion);
            setSelectedAnswer('');
        } catch (error) {
            console.error(error);
        }
    };

    const handleChangeAnswer = (event) => {
        setSelectedAnswer(event.target.value);
    };

    const downloadQuestionsPDF = async () => {
      try {
          const response = await axios.get(`${CONFIG.development.EVALUATION_BASE_URL}/pdf/allrandom?userId=${userId}&assessmentId=${assessmentSummary.assessmentId}&type=${selectedType}`, {
              responseType: 'blob',
          });
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          
          // Extract filename from content disposition header
          const contentDisposition = response.headers['Content-Disposition'];
          console.log('contentDisposition', contentDisposition);
          const filenameRegex = /filename="([^"]+)"/;
          const matches = filenameRegex.exec(contentDisposition);
          let filename = 'assessment.pdf'; // default filename
          if (matches != null && matches[1]) {
              filename = matches[1];
          }
          
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          
          // Set the filename state
          setPdfFileName(filename);
      } catch (error) {
          console.error(error);
      }
  };
  
  

    return (
        <div className="assessment">
          <table>
            <thead>
              <tr>
                <th colSpan="2">Assessment</th>
              </tr>
            </thead>
            <tbody>
              {/* Conditionally render these rows only if assessmentSummary is not present */}
              {!assessmentSummary && (
                <>
                    <tr>
                        <td>Enter Name</td>
                        <td>
                        <input required={true}
                            type="text"
                            placeholder="Enter Name"
                            value={userId}
                            onChange={(event) => setUserid(event.target.value)}
                            style={{ width: "85%" }}
                            minLength={2}
                        />
                        </td>
                    </tr>
                    <tr>
                        <td>Enter Email</td>
                        <td>
                        <input required={true}
                            type="text"
                            placeholder="Enter Email"
                            value={selectedEmail}
                            onChange={(event) => setSelectedEmail(event.target.value)}
                            style={{ width: "85%" }}
                            minLength={2}
                        />
                        </td>
                    </tr>
                    <tr>
                        <td>Assessment Type</td>
                        <td style={{ textAlign: 'center', width: "80%"}}>
                            <select style={{ width: "45%"}}
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            >
                            <option value="addition">Addition</option>
                            <option value="subtraction">Subtraction</option>
                            <option value="multiplication">Multiplication</option>
                            <option value="division">Division</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>Complexity</td>
                        <td style={{ textAlign: 'center', width: "80%"}}>
                            <select style={{ width: "45%"}}
                            value={selectedComplexity}
                            onChange={(e) => setSelectedComplexity(e.target.value)}
                            >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>Number Of Questions</td>
                        <td style={{ textAlign: 'center', width: "80%"}}>
                            <select style={{ width: "45%"}}
                            value={numberOfQuestions}
                            onChange={(e) => setNumberOfQuestions(e.target.value)}
                            >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            </select>
                        </td>
                    </tr>
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'center'}}>
                      <button onClick={handleStartAssessment}>Start Assessment</button>
                    </td>
                  </tr>
                </>
              )}
              {assessmentSummary && (
                <>
                  {/* Render the assessment summary */}
                  <tr>
                    <td colSpan="2" className="summary">
                      <h2>Assessment Summary for {selectedType}</h2>
                    </td>
                  </tr>
                  <tr>
                    <td>User Name</td>
                    <td>{userId}</td>
                  </tr>
                  <tr>
                    <td>Score:</td>
                    <td>{assessmentSummary.score}</td>
                  </tr>
                  <tr>
                    <td>Total Questions</td>
                    <td>{assessmentSummary.totalQuestions}</td>
                  </tr>
                  <tr>
                    <td>Correct Questions</td>
                    <td>{assessmentSummary.correctQuestions}</td>
                  </tr>
                  <tr>
                    <td>Incorrect Questions</td>
                    <td>{assessmentSummary.incorrectQuestions}</td>
                  </tr>
                  <tr>
                    <td>Unanswered Questions</td>
                    <td>{assessmentSummary.unansweredQuestions}</td>
                  </tr>
                  {assessmentSummary.status === 'COMPLETED' && (
                                <tr>
                                    <td colSpan="2" style={{ textAlign: 'center' }}>
                                        <button onClick={downloadQuestionsPDF}>Download Questions</button>
                                        <span style={{ marginRight: '10px' }}></span>
                                        <button onClick={handleStartAssessment}>Start Assessment</button>
                                    </td>
                                </tr>
                            )}
                </>
              )}
              {currentQuestion && (
                <>
                  <tr>
                    <td colSpan="2" className="question">
                      <h2>{currentQuestion.name}</h2>
                    </td>
                  </tr>
                  <tr>
                    <td>Enter Answer</td>
                    <td>
                      <input
                        type='text'
                        placeholder='Enter Answer'
                        value={selectedAnswer}
                        onChange={handleChangeAnswer}
                        style={{ width: "85%" }}
                        minLength={1}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'center'}}>
                      <button onClick={handleSubmitAnswer}>Submit Answer</button>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      );
    };

export default AssessmentQuestions;

